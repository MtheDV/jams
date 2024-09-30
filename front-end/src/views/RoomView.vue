<template>
	<div class="w-full flex flex-col items-stretch gap-4">
		<div class="text-xl text-center font-bold">{{ roomId }}</div>
		<div v-if="connecting || (!nowPlayingData && !error)" class="text-xl self-center">
			<div class="w-0 h-0 overflow-hidden">Connecting...</div>
			<loader-circle class="loader-circle text-gray-400" :size="35" />
		</div>
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
			<div v-if="nowPlayingData" class="flex flex-col gap-4">
				<img
					class="w-full aspect-square rounded-2xl"
					:src="nowPlayingData.item.album.images[1].url"
					alt="Album cover"
				/>
				<div class="rounded-2xl flex flex-col bg-gray-500 p-4">
					<div class="font-bold text-lg">{{ nowPlayingData.item.name }}</div>
					<div class="text-xs">
						<span v-for="artist in nowPlayingData.item.artists" :key="artist.name">
							{{ artist.name }},
						</span>
					</div>
				</div>
				<div class="w-full rounded-full overflow-hidden bg-gray-500 h-2">
					<div
						:style="{
							width:
								(nowPlayingData.progress_ms / nowPlayingData.item.duration_ms) *
									100 +
								'%'
						}"
						class="bg-gray-50 h-full"
					/>
				</div>
			</div>
			<div class="grid grid-cols-8 grid-flow-row gap-2">
				<div
					v-for="user in usersData"
					:key="user.id"
					class="rounded-full bg-gray-500 w-auto aspect-square flex justify-center items-center"
				>
					<span>{{ user.userName.substring(0, 1) }}</span>
				</div>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed, onUnmounted, ref } from 'vue'
import { SpotifyError, type SpotifyNowPlaying } from '@/types/spotify'
import { RoomError, type RoomUser } from '@/types/room'
import worker from '@/worker'
import { proxy } from 'comlink'
import { LoaderCircle } from 'lucide-vue-next'

// Setup
const route = useRoute()
const roomId = route.params.key as string
const connecting = ref(true)
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
		// Run a proxy to communicate callbacks with
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

<style scoped>
.loader-circle {
	animation: spin 1s infinite linear;
}

@keyframes spin {
	from {
		rotate: 0deg;
	}

	to {
		rotate: 360deg;
	}
}
</style>
