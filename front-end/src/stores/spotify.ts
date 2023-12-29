import { defineStore } from 'pinia'
import axios from 'axios'
import useAuth from '@/stores/auth'

const useSpotify = defineStore('spotify', {
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

            console.log(response.data)
        }
    }
})

export default useSpotify
