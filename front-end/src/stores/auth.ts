import { defineStore } from 'pinia'
import supabase from '../supabase'
import axios from 'axios'
import { SpotifyLocalStorage } from '@/types/spotify'

const useAuth = defineStore('auth', {
    state(): {
        spotify: {
            accessToken: string | null
            refreshToken: string | null
            refreshTimeout: number | null
        }
    } {
        return {
            spotify: {
                accessToken: null,
                refreshToken: null,
                refreshTimeout: null
            }
        }
    },
    actions: {
        async getSession() {
            supabase.auth.refreshSession()
            return (await supabase.auth.getSession()).data.session
        },
        async signInWithSpotify() {
            const response = await supabase.auth.signInWithOAuth({
                provider: 'spotify',
                options: {
                    scopes: 'user-read-playback-state user-modify-playback-state'
                }
            })
            console.log(response)
        },
        async signOut() {
            await supabase.auth.signOut()
        },
        async getSpotifyAccessToken() {
            await this.ensureAccessTokenUpToDate()
            return this.spotify.accessToken
        },
        async ensureAccessTokenUpToDate() {
            const currentTime = Date.now()
            if (this.spotify.refreshTimeout !== null && currentTime < this.spotify.refreshTimeout)
                return
            await this.refreshSpotifyToken()
        },
        async refreshSpotifyToken() {
            if (!this.spotify.refreshToken) return

            // Invoke the refresh function and ensure we have the data
            const response = await supabase.functions.invoke('spotify-refresh', {
                body: {
                    refreshToken: this.spotify.refreshToken
                }
            })
            if (!response.data.access_token) return
            
            // Set our new auth data that was returned
            this.setSpotifyAccessToken(response.data.access_token)
            this.setSpotifyRefreshTimeout(response.data.expires_in * 1000)
            if (response.data.refresh_token)
                this.setSpotifyRefreshToken(response.data.refresh_token)
        },
        setSpotifyAccessToken(token: string) {
            this.spotify.accessToken = token
            localStorage.setItem(SpotifyLocalStorage.AccessToken, token)
        },
        setSpotifyRefreshTimeout(expiresIn: number) {
            const refreshTimeout: number = Date.now() + expiresIn
            this.spotify.refreshTimeout = refreshTimeout
            localStorage.setItem(SpotifyLocalStorage.RefreshTimeout, refreshTimeout.toString())
        },
        setSpotifyRefreshToken(token: string) {
            this.spotify.refreshToken = token
            localStorage.setItem(SpotifyLocalStorage.RefreshToken, token)
        }
    }
})

export default useAuth
