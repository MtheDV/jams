import supabase from '@/supabase'
import { SpotifyLocalStorage } from '@/types/spotify'
import useAuth from '@/stores/auth'

supabase.auth.onAuthStateChange((event) => {
    if (event !== 'INITIAL_SESSION') return

    // When we sign in we need to add our spotify storage values into our store
    const store = useAuth()
    store.spotify = {
        refreshToken: localStorage.getItem(SpotifyLocalStorage.RefreshToken),
        refreshTimeout: localStorage.getItem(SpotifyLocalStorage.RefreshTimeout),
        accessToken: localStorage.getItem(SpotifyLocalStorage.AccessToken)
    }
})
