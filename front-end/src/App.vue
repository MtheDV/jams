<template>
	<div class="flex flex-col items-center h-screen bg-gray-900 text-gray-50">
		<div class="font-bold text-4xl h-32 flex items-center">
			<h1>Jams</h1>
		</div>
		<div class="w-96">
			<template v-if="isLeader">
				<router-view />
			</template>
			<template v-else>
				Another tab is opened, please close the other tab, or return to it, to use the app
			</template>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { requestLeadership } from '@/utils'

// Setup
const isLeader = ref(false)

// Claim, or attempt to claim ownership over the tabs when the app is created
requestLeadership('leader-election', () => {
	isLeader.value = true
})
</script>

<style>
body,
html {
	background-color: rgb(17, 24, 39);
}
</style>
