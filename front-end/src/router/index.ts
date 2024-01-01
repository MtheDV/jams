import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RoomView from '@/views/RoomView.vue'
import { checkAuthCallbacks, requireAuth } from '@/router/gaurds/auth'
import _404View from '@/views/_404View.vue'

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
            path: '/rooms/:key',
            name: 'room',
            component: RoomView
        },
        {
            path: '/:catchAll(.*)*',
            name: '404',
            component: _404View
        }
    ]
})

// Check the callbacks first before redirecting
router.beforeEach(checkAuthCallbacks)

// Redirect to the auth pages last
router.beforeEach(requireAuth)

export default router
