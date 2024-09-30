<template>
	<div>
		<h1>Jams Login</h1>
		<button @click="worker.signInWithSpotify()">Login with Spotify</button>
		<template v-if="error">
			<p>{{ errorMessage }}</p>
		</template>
	</div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { AuthError } from '@/types/auth'
import worker from '@/worker'

// Setup
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
