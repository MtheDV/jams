<template>
    <div>
        <p>Jams</p>
        <button @click="authStore.signOut()">Sign out</button>
    </div>
</template>

<script setup lang="ts">
// Setup
import useAuth from '@/stores/auth'

const authStore = useAuth()
</script>
