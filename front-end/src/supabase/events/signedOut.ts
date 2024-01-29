import supabase from '@/supabase'
import { SpotifyIdbKey } from '@/types/spotify'
import { delMany } from 'idb-keyval'

supabase.auth.onAuthStateChange(async (event) => {
    if (event !== 'SIGNED_OUT') return

    // When we sign out we need to clear our custom storage values
    await delMany(Object.values(SpotifyIdbKey))
})
