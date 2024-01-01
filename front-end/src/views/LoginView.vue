<template>
    <div>Login</div>
    <button @click="authStore.signInWithSpotify()">Login with Spotify</button>
    <template v-if="error">
        <p>{{ errorMessage }}</p>
    </template>
</template>

<script setup lang="ts">
import useAuth from '../stores/auth'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { AuthError } from '@/types/auth'

// Setup
const authStore = useAuth()
const route = useRoute()
const error = route.query.error ?? ''

// Error messages based on the provided error
const errorMessage = computed(() => {
    switch (error) {
        case AuthError.RequireVerification:
            return 'Email verification is required, please check your email and try again.'
        case AuthError.Unknown:
        default:
            return 'An unknown error has occurred, please try again.'
    }
})
</script>
