<template>
	<div class="w-full flex flex-col items-stretch gap-4">
		<div v-if="error">Something went wrong creating a room, please try again.</div>
		<form
			class="flex bg-gray-500 rounded-full overflow-hidden text-lg focus-within:outline-2 outline-blue-900 h-11"
			@submit.prevent="goToRoom"
		>
			<label class="h-0 w-0 overflow-hidden block" for="room-id">Room ID</label>
			<input
				id="room-id"
				name="room-id"
				placeholder="Room ID"
				class="bg-transparent px-4 py-2 outline-0 w-full"
				v-model="roomId"
				:disabled="creating"
			/>
			<button
				type="submit"
				:disabled="creating"
				class="pr-4 pl-3 py-2 hover:bg-gray-600 hover:active:bg-gray-700"
			>
				<log-in :size="18" />
			</button>
		</form>
		<button
			class="w-full bg-gray-500 rounded-full h-11 hover:bg-gray-600 hover:active:bg-gray-700"
			:disabled="creating"
			@click="createNewRoom"
		>
			Create new room
		</button>
		<div v-if="rooms" class="grid grid-cols-2 grid-flow-row gap-2">
			<button
				v-for="room in rooms"
				:key="room.room_id"
				class="bg-gray-500 rounded-3xl w-full h-32 hover:bg-gray-600 hover:active:bg-gray-700"
				@click="goToRoom(room.short_id)"
			>
				{{ room.short_id }}
			</button>
		</div>
		<div v-else>Loading rooms...</div>
	</div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import worker from '@/worker'
import type { Tables } from '@/types/supabase'
import { LogIn } from 'lucide-vue-next'

// Setup
const router = useRouter()
const roomId = ref('')
const creating = ref(false)
const error = ref(false)
const loadingRooms = ref(false)
const rooms = ref<Tables<'rooms'>[] | null>([])

// Will refresh the available rooms
const refreshRooms = async () => {
	try {
		loadingRooms.value = true
		rooms.value = await worker.getAll()
	} finally {
		loadingRooms.value = false
	}
}

// Create a room and then navigate the user to the new room
const createNewRoom = async () => {
	try {
		// Set our state as connecting
		creating.value = true

		// Create a new room and go to the page
		const newRoomId = await worker.create()
		await router.push(`/${newRoomId}`)
	} catch (errorCreate) {
		console.error('Something went wrong creating', errorCreate)
		error.value = true
	} finally {
		creating.value = false
	}
}

// Go to a specific room
const goToRoom = async (id = roomId.value) => {
	if (!id) return // TODO: Display an error
	await router.push(`/${id}`)
}

// Get our rooms
refreshRooms()
</script>
