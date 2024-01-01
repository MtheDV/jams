export interface RoomUser {
    id: string
    userId: string
    userName: string
    isOwner: boolean
    onlineTime: number
}

export enum RoomError {
    NoUserSession = 'no_user_session',
    UserNotOwner = 'user_not_owner',
    UserAlreadyJoined = 'user_already_joined',
    UnableToBroadcast = 'broadcast_error',
    RoomUnavailable = 'room_unavailable'
}
