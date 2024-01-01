import useAuth from '@/stores/auth'
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { SpotifyError } from '@/types/spotify'
import { AuthError } from '@/types/auth'

export const requireAuth = async (
    to: RouteLocationNormalized,
    _: RouteLocationNormalized,
    next: NavigationGuardNext
) => {
    // Check if the user is logged in, if not, go to the login page
    // Get the most up-to-date user session data
    const isLoggedIn = !!(await useAuth().getSession())

    // Go to the login page if we're not logged in
    if (!isLoggedIn && to.name !== 'login') return next('/login')
    // Go to the home page if we're logged in and on the login page
    else if (isLoggedIn && to.name === 'login') return next('/')

    // Otherwise keep going
    return next()
}

export const checkAuthCallbacks = async (
    to: RouteLocationNormalized,
    _: RouteLocationNormalized,
    next: NavigationGuardNext
) => {
    // Ensure we're only checking the root when it gets redirected to it
    if (to.path !== '/') return next()

    // Check the query params of each request to see if we have any auth errors
    const queryParams = to.query
    switch (queryParams.error) {
        case SpotifyError.ServerError:
            return next(`/login?error=${AuthError.Unknown}`)
        case SpotifyError.UnauthorizedClient:
            return next(`/login?error=${AuthError.RequireVerification}`)
        default:
            return next()
    }
}
