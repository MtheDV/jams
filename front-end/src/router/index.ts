import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RoomsView from '@/views/RoomsView.vue'
import RoomView from '@/views/RoomView.vue'
import useAuth from '@/stores/auth'

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
            path: '/rooms',
            name: 'rooms',
            component: RoomsView
        },
        {
            path: '/rooms/:key',
            name: 'room',
            component: RoomView
        }
    ]
})

router.beforeEach(async (to, from, next) => {
    // Check if the user is logged in, if not, go to the login page
    // Get the most up-to-date user session data
    const isLoggedIn = !!(await useAuth().getSession())

    // Go to the login page if we're not logged in
    if (!isLoggedIn && to.name !== 'login') return next('/login')
    // Go to the home page if we're logged in and on the login page
    else if (isLoggedIn && to.name === 'login') return next('/')

    // Otherwise keep going
    return next()
})

export default router
