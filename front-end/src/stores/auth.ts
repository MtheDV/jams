import { defineStore } from 'pinia'
import supabase from '../supabase'

const useAuth = defineStore('auth', {
    actions: {
        async getSession() {
            return (await supabase.auth.getSession()).data.session
        },
        async refreshSession() {
            await supabase.auth.refreshSession()
        },
        async signInWithSpotify() {
            await supabase.auth.signInWithOAuth({
                provider: 'spotify',
                options: {
                    scopes: 'user-read-playback-state user-modify-playback-state user-read-currently-playing'
                }
            })
        },
        async signOut() {
            await supabase.auth.signOut()
        }
    }
})

export default useAuth
