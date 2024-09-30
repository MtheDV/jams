import supabase from '@/supabase'

export const getSession = async () => {
	return (await supabase.auth.getSession()).data.session
}

export const refreshSession = async () => {
	await supabase.auth.refreshSession()
}

export const signInWithSpotify = async () => {
	await supabase.auth.signInWithOAuth({
		provider: 'spotify',
		options: {
			scopes: 'user-read-playback-state user-modify-playback-state user-read-currently-playing'
		}
	})
}

export const signOut = async () => {
	await supabase.auth.signOut()
}
