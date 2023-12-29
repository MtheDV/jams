<template>
    <div>Rooms</div>
    <button @click="createNewRoom">Create new room</button>
    <div v-if="roomsStore.loading">Loading...</div>
    <div v-if="roomsStore.rooms">
        <button v-for="room in roomsStore.rooms" :key="room.key" @click="goToRoom(room.key)">
            {{ room.key }}
        </button>
    </div>
</template>

<script setup lang="ts">
import useRooms from '@/stores/rooms'
import { useRouter } from 'vue-router'

// Setup
const roomsStore = useRooms()
const router = useRouter()

// Create a room and then navigate the user to the new room
const createNewRoom = async () => {
    const newRoomKey = await roomsStore.create()
    if (!newRoomKey) return // TODO: Display an error
    await router.push(`/rooms/${newRoomKey}`)
}

// Go to a specific room
const goToRoom = async (key: string) => {
    await router.push(`/rooms/${key}`)
}

// Setup any data required
roomsStore.refresh()
</script>
