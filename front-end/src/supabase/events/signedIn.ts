import supabase from '@/supabase'
import { set } from 'idb-keyval'
import { SpotifyIdbKey } from '@/types/spotify'

supabase.auth.onAuthStateChange(async (event, session) => {
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

	// Set our values in our key-val db
	await set(SpotifyIdbKey.RefreshToken, session.provider_refresh_token)
	await set(SpotifyIdbKey.RefreshTimeout, session.expires_in)
})
