export enum SpotifyBroadcastEvent {
    UpdatedNowPlaying = 'spotify:updated'
}

export enum SpotifyIdbKey {
    AccessToken = 'spotify:access',
    RefreshToken = 'spotify:refresh',
    RefreshTimeout = 'spotify:timeout'
}

export interface SpotifyResponseError {
    error: {
        status: number
        message: string
        reason: SpotifyError
    }
}

export enum SpotifyError {
    UnauthorizedClient = 'unauthorized_client',
    ServerError = 'server_error',
    NoActiveDevice = 'NO_ACTIVE_DEVICE',
    UnknownError = 'unknown_error' // Custom
}

interface SpotifyAlbumImage<T extends number> {
    width: T
    height: T
    url: string
}

export interface SpotifyNowPlaying {
    context: {
        uri: string
    }
    item: {
        uri: string
        album: {
            images: [SpotifyAlbumImage<640>, SpotifyAlbumImage<300>, SpotifyAlbumImage<64>]
        }
    }
    progress_ms: number
    is_playing: boolean
}
