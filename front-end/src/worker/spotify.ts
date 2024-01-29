import supabase from '@/supabase'
import { get, set } from 'idb-keyval'
import { SpotifyIdbKey, type SpotifyNowPlaying } from '@/types/spotify'

export const getSpotifyAccessToken = async (): Promise<undefined | string> => {
    // Get our data required from our idb-keyval
    const spotifyRefreshTimeout = await get<number>(SpotifyIdbKey.RefreshTimeout)
    const spotifyAccessToken = await get<string>(SpotifyIdbKey.AccessToken)
    const spotifyRefreshToken = await get<string>(SpotifyIdbKey.RefreshToken)

    // If our current time is still behind the saved time, respond with the current access token
    // Otherwise we need to generate a new one and return that
    if (spotifyRefreshTimeout && Date.now() < spotifyRefreshTimeout) return spotifyAccessToken
    else if (!spotifyRefreshToken) return undefined
    else return await refreshSpotifyToken(spotifyRefreshToken)
}

export const refreshSpotifyToken = async (refreshToken: string) => {
    // Invoke the refresh function and ensure we have the data
    const response = await supabase.functions.invoke('spotify-refresh', { body: { refreshToken } })
    if (!response.data.access_token) return undefined

    // Set our new auth data that was returned into our idb-keyval
    await set('spotify:access', response.data.access_token)
    await set('spotify:timeout', Date.now() + (response.data.expires_in ?? 3600) * 1000)

    // Return our new access token
    return response.data.access_token
}

export const getNowPlaying = async () => {
    const accessToken = await getSpotifyAccessToken()
    if (!accessToken) return undefined

    // Get the latest now playing from the user
    const data = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    }).then((response) => {
        if (response.status < 200 || response.status >= 300 || response.status === 204)
            return undefined
        return response.json()
    })

    // Return the data
    if (!data) return undefined
    return data as SpotifyNowPlaying
}

export const setNowPlaying = async (nowPlaying: SpotifyNowPlaying) => {
    const accessToken = await getSpotifyAccessToken()
    if (!accessToken) return undefined

    // Get the now playing state of the current user
    await fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            uris: [nowPlaying.context.uri],
            position_ms: nowPlaying.progress_ms
        })
    })
}

export const pauseNowPlaying = async () => {
    const accessToken = await getSpotifyAccessToken()
    if (!accessToken) return undefined

    // Pause the now playing state of the current user
    await fetch('https://api.spotify.com/v1/me/player/pause', {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })
}

export const updateNowPlaying = (
    prevNowPlaying?: SpotifyNowPlaying,
    nextNowPlaying?: SpotifyNowPlaying
) => {
    // Pause if we have no new playback or play if we have a next playback and no previous playback
    if (!nextNowPlaying) return pauseNowPlaying()
    if (!prevNowPlaying) return setNowPlaying(nextNowPlaying)

    // Collect various changed states to determine
    const changedSong = nextNowPlaying.item.uri !== prevNowPlaying.item.uri
    const changedContext = nextNowPlaying.context.uri !== prevNowPlaying.context.uri
    const changedPlaying = nextNowPlaying.is_playing !== prevNowPlaying.is_playing

    // Check if the state has changed at all
    const playbackStateChanged = changedContext || changedSong || changedPlaying
    const playbackStatePaused = !nextNowPlaying.is_playing
    if (!playbackStateChanged) return

    // Pause the playback if we've paused the song, otherwise set the playback to our new state
    if (playbackStatePaused) return pauseNowPlaying()
    else return setNowPlaying(nextNowPlaying)
}
