import supabase from '@/supabase'
import useAuth from '@/stores/auth'

supabase.auth.onAuthStateChange((event, session) => {
    if (!session || event !== 'SIGNED_IN') return

    // Perform any Spotify session requirements
    // Only set the data if we've signed in
    // Ensure that we've got the spotify provider
    // Ensure we have the correct token and expiry values in our session
    if (
        session.user.app_metadata.provider !== 'spotify' ||
        !session.provider_refresh_token ||
        !session.expires_in
    ) {
        return
    }

    // Get our store so it can be updated
    const authStore = useAuth()
    authStore.setSpotifyRefreshToken(session.provider_refresh_token)
    authStore.setSpotifyRefreshTimeout(session.expires_in)
})
