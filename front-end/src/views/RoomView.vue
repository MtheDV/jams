<template>
    <h1>{{ roomId }}</h1>
    <span></span>
    <div v-if="connecting">Connecting...</div>
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
            <h2>Connected Users</h2>
            <pre>{{ usersData }}</pre>
        </div>
        <div v-if="nowPlayingData">
            <h2>Active Spotify Song</h2>
            <img :src="nowPlayingData.item.album.images[1].url" alt="Album cover" />
            <pre>{{ nowPlayingData.item.uri }}</pre>
            <pre>{{ nowPlayingData.progress_ms }}</pre>
        </div>
    </template>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed, onUnmounted, ref } from 'vue'
import { SpotifyError, type SpotifyNowPlaying } from '@/types/spotify'
import { RoomError, type RoomUser } from '@/types/room'
import worker from '@/worker'
import { proxy } from 'comlink'

// Setup
const route = useRoute()
const roomId = route.params.key as string
const connecting = ref(false)
const error = ref<SpotifyError | RoomError>()
const nowPlayingData = ref<SpotifyNowPlaying>()
const usersData = ref<RoomUser[]>()

// Get a friendly error message from our error
const errorMessage = computed(() => {
    switch (error.value) {
        case SpotifyError.NoActiveDevice:
            return 'No active Spotify device found'
        case SpotifyError.UnknownError:
        default:
            return 'An error has occurred. Please refresh and try again'
    }
})

// Room now playing update and users update proxies for the worker
const onNowPlayingUpdated = proxy((data: SpotifyNowPlaying) => {
    nowPlayingData.value = data
})

const onUsersUpdated = proxy((data: RoomUser[]) => {
    usersData.value = data
})

// Will get the active room info and connect to the channel
const refreshRoomInfoAndConnectToChannel = async () => {
    try {
        // Start connecting and connect to the room
        connecting.value = true

        // Connect to the specified room in the worker
        // Run a proxy to communicate a callbacks with
        // the worker and update our refs
        await worker.connect(roomId, onNowPlayingUpdated, onUsersUpdated)
    } catch (errorConnect) {
        // Cleanup the attempted room connection
        await worker.disconnect()

        // Something went wrong
        error.value = errorConnect as SpotifyError | RoomError
    } finally {
        // Finish connecting
        connecting.value = false
    }
}

// Cleanup data when we leave the view
onUnmounted(async () => {
    await worker.disconnect()
})

// Setup any data required
refreshRoomInfoAndConnectToChannel()
</script>
