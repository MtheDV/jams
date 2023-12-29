<template>
    <div>Room</div>
    <div v-if="roomStore.loading">Loading...</div>
    <div>{{ roomStore.room }}</div>
    <div>{{ roomStore.users }}</div>
    <button @click="testMessageSend">Send message</button>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import useAuth from '@/stores/auth'
import useRoom from '@/stores/room'

// Setup
const authStore = useAuth()
const roomStore = useRoom()
const route = useRoute()
const roomId = route.params.key as string

// Will get the active room info and connect to the channel
const refreshRoomInfoAndConnectToChannel = async () => {
    // Refresh the active room data
    await roomStore.refresh(roomId)
    if (!roomStore.room) return // TODO: If room is undefined, go to rooms page with error

    // Check if we're the owner and create a channel if we are
    const isOwner = roomStore.room.user_id === (await authStore.getSession())?.user.id
    console.log(isOwner)

    // Connect to the room based on the key
    roomStore.createChannel(roomStore.room.key)
    roomStore.assignBroadcastEventToChannel('spotify:sync', (payload) => {
        console.log(payload)
    })
    roomStore.subscribeToChannel()
}

// Will send a message
const testMessageSend = () => {
    roomStore.broadcastMessageToChannel('spotify:sync', { hello: 'hi' })
}

// Setup any data required
refreshRoomInfoAndConnectToChannel()
</script>
