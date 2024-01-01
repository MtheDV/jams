import { defineStore } from 'pinia'
import axios from 'axios'
import useAuth from '@/stores/auth'
import type { SpotifyNowPlaying } from '@/types/spotify'

const useSpotify = defineStore('spotify', {
    state(): {
        activeRoomData: SpotifyNowPlaying | null
    } {
        return {
            activeRoomData: null
        }
    },
    actions: {
        async getNowPlaying() {
            const accessToken = await useAuth().getSpotifyAccessToken()
            if (!accessToken) return

            // Get the latest now playing from the user
            const response = await axios.get('https://api.spotify.com/v1/me/player', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })

            // Return the data
            if (!response.data) return (this.activeRoomData = null)
            return response.data as SpotifyNowPlaying
        },
        async setNowPlayingFromActiveData() {
            const accessToken = await useAuth().getSpotifyAccessToken()
            if (!accessToken || !this.activeRoomData) return

            // Set the now playing state of the current user
            await axios.put(
                'https://api.spotify.com/v1/me/player/play',
                {
                    uris: [this.activeRoomData.item.uri],
                    position_ms: this.activeRoomData.progress_ms
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            )
        },
        async pauseNowPlaying() {
            const accessToken = await useAuth().getSpotifyAccessToken()
            if (!accessToken || !this.activeRoomData) return

            // Set the now playing state of the current user
            await axios.put(
                'https://api.spotify.com/v1/me/player/pause',
                {},
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            )
        }
    }
})

export default useSpotify
