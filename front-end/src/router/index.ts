import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RoomView from '@/views/RoomView.vue'
import { checkAuthCallbacks, requireAuth } from '@/router/gaurds/auth'

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'home',
			component: HomeView
		},
		{
			path: '/login',
			name: 'login',
			component: LoginView
		},
		{
			path: '/:key',
			name: 'room',
			component: RoomView
		}
	]
})

// Check the callbacks first before redirecting
router.beforeEach(checkAuthCallbacks)

// Redirect to the auth pages last
router.beforeEach(requireAuth)

export default router
