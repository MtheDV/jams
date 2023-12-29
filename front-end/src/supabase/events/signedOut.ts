import supabase from '@/supabase'
import { SpotifyLocalStorage } from '@/types/spotify'

supabase.auth.onAuthStateChange((event) => {
    if (event !== 'SIGNED_OUT') return

    // When we sign out we need to clear our custom storage values
    // Clear the Spotify values
    Object.values(SpotifyLocalStorage).forEach((lsV) => localStorage.removeItem(lsV))
})
