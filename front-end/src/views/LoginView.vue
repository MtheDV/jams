<template>
    <div>Login</div>
    <button @click="authStore.signInWithSpotify()">Login with Spotify</button>
</template>

<script setup lang="ts">
import useAuth from '../stores/auth'

const authStore = useAuth()
</script>

<style scoped></style>
