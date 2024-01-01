<template>
    <main>
        <h1>Rooms</h1>
        <button @click="createNewRoom">Create new room</button>
        <form @submit.prevent="goToRoom">
            <input placeholder="Room id" v-model="roomId" />
            <button type="submit">Enter room</button>
        </form>
        <rooms-list />
    </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import RoomsList from '@/components/RoomsList.vue'
import useRooms from '@/stores/rooms'

// Setup
const roomsStore = useRooms()
const router = useRouter()
const roomId = ref('')

// Create a room and then navigate the user to the new room
const createNewRoom = async () => {
    const newRoom = await roomsStore.create()
    if (!newRoom || !newRoom.short_id) return // TODO: Display an error
    await router.push(`/rooms/${newRoom.short_id}`)
}

// Go to a specific room
const goToRoom = async () => {
    if (!roomId.value) return // TODO: Display an error
    await router.push(`/rooms/${roomId.value}`)
}
</script>
