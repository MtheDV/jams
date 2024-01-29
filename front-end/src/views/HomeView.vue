<template>
    <main>
        <h1>Rooms</h1>
        <div v-if="error">Something went wrong creating a room, please try again.</div>
        <button @click="createNewRoom" :disabled="creating">Create new room</button>
        <form @submit.prevent="goToRoom">
            <input placeholder="Room id" v-model="roomId" :disabled="creating" />
            <button type="submit" :disabled="creating">Enter room</button>
        </form>
    </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import worker from '@/worker'

// Setup
const router = useRouter()
const roomId = ref('')
const creating = ref(false)
const error = ref(false)

// Create a room and then navigate the user to the new room
const createNewRoom = async () => {
    try {
        // Set our state as connecting
        creating.value = true

        // Create a new room and go to the page
        const newRoomId = await worker.create()
        await router.push(`/rooms/${newRoomId}`)
    } catch (errorCreate) {
        console.error('Something went wrong creating', errorCreate)
        error.value = true
    } finally {
        creating.value = false
    }
}

// Go to a specific room
const goToRoom = async () => {
    if (!roomId.value) return // TODO: Display an error
    await router.push(`/rooms/${roomId.value}`)
}
</script>
