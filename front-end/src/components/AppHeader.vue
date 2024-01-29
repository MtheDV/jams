<template>
    <div>
        <p>Jams</p>
        <button @click="signOut">Sign out</button>
    </div>
</template>

<script setup lang="ts">
import useAuth from '@/stores/auth'
import { useRouter } from 'vue-router'

// Setup
const authStore = useAuth()
const router = useRouter()

// When we sign out, go to the login page
const signOut = () => {
    authStore.signOut()
    router.push('/login')
}
</script>
