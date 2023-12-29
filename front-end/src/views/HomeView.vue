<template>
    <main>
        Hi!
        <button @click="authStore.signOut()">Sign out</button>
        <button @click="spotifyStore.getNowPlaying()">See Now Playing</button>
    </main>
</template>

<script setup lang="ts">
import useSpotify from '../stores/spotify'
import useAuth from '@/stores/auth'

const authStore = useAuth()
const spotifyStore = useSpotify()
</script>
