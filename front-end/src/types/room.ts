export enum RoomBroadcastEvent {
    EnsureUnique = 'room:unique',
    EnsureUniqueError = 'room:unique:error',
    UsersUpdated = 'users:updated'
}

export interface RoomUser {
    id: string
    userId: string
    userName: string
    isOwner: boolean
    onlineTime: number
}

export enum RoomError {
    NoUserSession = 'no_user_session',
    RoomUnavailable = 'room_unavailable',
    RoomCreate = 'error_creating'
}
