<template>
    <template v-if="isLeader">
        <app-header />
        <RouterView />
    </template>
    <template v-else>
        Another tab is opened, please close the other tab or return to it to use the app
    </template>
</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import { ref } from 'vue'
import { requestLeadership } from '@/utils'

// Setup
const isLeader = ref(false)

// Claim, or attempt to claim ownership over the tabs when the app is created
requestLeadership('leader-election', () => {
    isLeader.value = true
})
</script>
