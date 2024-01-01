<template>
    <div class="rooms-list">
        <div v-if="roomsStore.loading">Loading...</div>
        <div v-else-if="roomsStore.rooms.length > 0">
            <button
                v-for="room in roomsStore.rooms"
                :key="room.id"
                @click="joinRoom(room.short_id)"
                class="room"
            >
                <span>{{ room.user_id }}</span>
                <span>&nbsp;/&nbsp;</span>
                <span>{{ room.short_id }}</span>
            </button>
        </div>
        <div v-else>
            <p>No available rooms found!</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import useRooms from '@/stores/rooms'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

// Setup
const roomsStore = useRooms()
const router = useRouter()

// Join a specified room
const joinRoom = (shortId: string) => {
    router.push(`/rooms/${shortId}`)
}

// Refresh our rooms data
onMounted(roomsStore.refresh)
</script>
