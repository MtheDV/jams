<template>
    <h1>{{ roomId }}</h1>
    <span></span>
    <div v-if="connecting">Connecting...</div>
    <template v-else-if="error === RoomError.UserAlreadyJoined">
        <div>
            <h2>You're already connected to this room!</h2>
        </div>
    </template>
    <template v-else-if="error === RoomError.RoomUnavailable">
        <div>
            <h2>Unable to find specified room!</h2>
        </div>
    </template>
    <template v-else>
        <div v-if="error">
            <h2>Error</h2>
            <p>{{ errorMessage }}</p>
        </div>
        <div>
            <h2>Owner ({{ isOwner }})</h2>
            <pre>{{ roomStore.owner }}</pre>
        </div>
        <div>
            <h2>Connected Users</h2>
            <pre>{{ roomStore.users }}</pre>
        </div>
        <div v-if="spotifyStore.activeRoomData">
            <h2>Active Spotify Song</h2>
            <img :src="spotifyStore.activeRoomData?.item.album.images[1].url" alt="Album cover" />
            <pre>{{ spotifyStore.activeRoomData?.item.uri }}</pre>
            <pre>{{ spotifyStore.activeRoomData?.progress_ms }}</pre>
        </div>
    </template>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import useRoom from '@/stores/room'
import { computed, onUnmounted, ref, watch } from 'vue'
import useSpotify from '@/stores/spotify'
import useAuth from '@/stores/auth'
import { SpotifyError, type SpotifyNowPlaying, type SpotifyResponseError } from '@/types/spotify'
import { RoomError } from '@/types/room'
import type { AxiosError } from 'axios'
import useRooms from '@/stores/rooms'

// Setup
const roomStore = useRoom()
const roomsStore = useRooms()
const authStore = useAuth()
const spotifyStore = useSpotify()
const router = useRouter()
const route = useRoute()
const roomId = route.params.key as string
const connecting = ref(false)
const error = ref<SpotifyError | RoomError>()
const isOwner = ref(false)

// Computed
const errorMessage = computed(() => {
    switch (error.value) {
        case SpotifyError.NoActiveDevice:
            return 'No active Spotify device found'
        case SpotifyError.UnknownError:
        default:
            return 'An error has occurred. Please refresh and try again'
    }
})

// Watch
watch(
    () => roomStore.owner,
    async () => {
        if (roomStore.owner?.userId !== (await authStore.getSession())?.user.id) return
        isOwner.value = true
    },
    {
        immediate: true
    }
)
watch(
    () => roomStore.disconnected,
    async (disconnected) => {
        if (!disconnected) return
        await router.push('/')
    }
)

// Update the Spotify playback state with the new data
const updateSpotifyPlaybackState = async (data: SpotifyNowPlaying) => {
    // Get and set our active now playing data
    const previousData = spotifyStore.activeRoomData
    spotifyStore.activeRoomData = data

    // TODO: Sync play/pause and progress if those have changed
    // Check if the state has changed at all
    const changedSong = data.item.uri !== previousData?.item.uri
    const changedContext = data.context.uri !== previousData?.context.uri
    const changedPlaying = data.is_playing !== previousData?.is_playing
    const playbackStatePaused = !data.is_playing
    const playbackStateChanged = changedContext || changedSong || changedPlaying
    if (!playbackStateChanged) return

    // Determine which action to perform
    let spotifyAction:
        | typeof spotifyStore.pauseNowPlaying
        | typeof spotifyStore.setNowPlayingFromActiveData
        | typeof Promise.resolve = Promise.resolve
    if (playbackStateChanged) spotifyAction = spotifyStore.setNowPlayingFromActiveData
    if (playbackStatePaused) spotifyAction = spotifyStore.pauseNowPlaying

    // Update our playback
    spotifyAction()
        .then(() => {
            error.value = undefined
        })
        .catch((spotifyError: AxiosError<SpotifyResponseError>) => {
            error.value = spotifyError.response?.data.error.reason ?? SpotifyError.UnknownError
        })
}

// Will get the active room info and connect to the channel
const refreshRoomInfoAndConnectToChannel = async () => {
    try {
        // Start connecting and connect to the room
        connecting.value = true

        // Get the specified room based on the id
        const room = await roomsStore.get(roomId)
        if (!room) {
            error.value = RoomError.RoomUnavailable
            return
        }

        // Create a room and assign a Spotify sync event to get Spotify data from the host
        await roomStore.connect(room, [
            {
                event: 'spotify:sync',
                callback: (payload) => updateSpotifyPlaybackState(payload.data)
            }
        ])
    } catch (errorConnect) {
        // Cleanup the attempted room connection
        await roomStore.cleanup()

        // Act on each unique error
        if (errorConnect === RoomError.UserAlreadyJoined) {
            // Display an already connected message
            error.value = RoomError.UserAlreadyJoined
        } else if (errorConnect === RoomError.UserNotOwner) {
            // TODO: Implement in store
            // Try to connect again, but not as the owner
            await refreshRoomInfoAndConnectToChannel()
            return
        } else {
            // TODO: Generic error
            return
        }
    } finally {
        // Finish connecting
        connecting.value = false
    }
}

// Send the Spotify now playing status
const sendSpotifyNowPlaying = async () => {
    // Only send if we're the owner
    if (
        roomStore.owner === undefined ||
        roomStore.owner.userId !== (await authStore.getSession())?.user.id
    )
        return

    // Get the now playing status and broadcast it to the other users
    const spotifyNowPlaying = await spotifyStore.getNowPlaying()
    if (!spotifyNowPlaying) return
    await roomStore.broadcastMessageToChannel('spotify:sync', spotifyNowPlaying)

    // Set our active Spotify data
    spotifyStore.activeRoomData = spotifyNowPlaying
}

// Create an interval to update the Spotify now playing, if we're the owner, every 1 second
const spotifyNowPlayingStatus = setInterval(sendSpotifyNowPlaying, 1000)

// Cleanup data when we leave the view
onUnmounted(async () => {
    clearTimeout(spotifyNowPlayingStatus)
    await roomStore.cleanup()

    // Remove the room if we were the owner
    await roomsStore.delete(roomId)
})

// Setup any data required
refreshRoomInfoAndConnectToChannel()
</script>
