import type { RealtimeChannel } from '@supabase/supabase-js'
import type { SpotifyNowPlaying } from '@/types/spotify'

const state: {
    room: {
        id?: string
        channel?: RealtimeChannel
        broadcastIntervalId?: NodeJS.Timeout
        activeIntervalId?: NodeJS.Timeout
    }
    spotify: {
        nowPlaying?: SpotifyNowPlaying
        onNowPlayingUpdate?: (nowPlaying: SpotifyNowPlaying) => void
    }
} = {
    room: {},
    spotify: {}
}

export default state
