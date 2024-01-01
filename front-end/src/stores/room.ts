import { defineStore } from 'pinia'
import supabase from '@/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'
import useAuth from '@/stores/auth'
import { REALTIME_LISTEN_TYPES } from '@supabase/realtime-js/src/RealtimeChannel'
import { RoomError, type RoomUser } from '@/types/room'
import type { Tables } from '@/types/supabase'

const useRoom = defineStore('room', {
    state(): {
        loading: boolean
        channel: RealtimeChannel | null
        id: string
        users: RoomUser[]
        disconnected: boolean
    } {
        return {
            loading: false,
            channel: null,
            id: '',
            users: [],
            disconnected: false
        }
    },
    getters: {
        owner(state): RoomUser | undefined {
            return state.users.find((user) => user.isOwner)
        }
    },
    actions: {
        async cleanup() {
            // Unsubscribe
            await this.channel?.unsubscribe()

            // Reset values
            this.id = ''
            this.users = []
            this.channel = null
            this.loading = false
            this.disconnected = true
        },
        async connect(
            room: Tables<'rooms'>,
            broadcastChannels: {
                event: string
                callback: (payload: {
                    type: `${REALTIME_LISTEN_TYPES.BROADCAST}`
                    event: string
                    [key: string]: any
                }) => void
            }[] = []
        ) {
            // Get our active session, if we don't have one, reject
            const session = await useAuth().getSession()
            if (!session) return Promise.reject(RoomError.NoUserSession)
            if (!room.short_id) return Promise.reject(RoomError.RoomUnavailable)

            // Otherwise continue to create our channel
            return new Promise<void>((resolve, reject) => {
                // Set our id, check if we're the owner based on the id and the user id, and reset users
                this.id = room.short_id! // Previous check ensures this value
                this.users = []

                // Create a new channel and add our events to it
                this.channel = supabase.channel(this.id)
                this.channel
                    .on('presence', { event: 'sync' }, () => {
                        // TODO: Update states? (If required)
                        // TODO: Clashing state (Will need to reject one of the users)
                    })
                    .on('presence', { event: 'join' }, async ({ newPresences }) => {
                        // Add the new users to the list of users
                        // Converting any presence_ref's to id's for clearer management
                        this.users.push(
                            ...newPresences.map((newUser) => ({
                                id: newUser.presence_ref,
                                userId: newUser.userId,
                                userName: newUser.userName,
                                isOwner: newUser.isOwner,
                                onlineTime: newUser.onlineTime
                            }))
                        )
                    })
                    .on('presence', { event: 'leave' }, ({ leftPresences }) => {
                        // Remove any users from the list of users based on their id
                        const leftIds = leftPresences.map((leftUser) => leftUser.presence_ref)
                        this.users = this.users.filter((user) => !leftIds.includes(user.id))

                        // If the owner has left the channel, then we need to disconnect
                        const hasOwner = leftPresences.find((leftUser) => leftUser.isOwner)
                        if (!hasOwner) return
                        this.cleanup()
                    })

                // Add any broadcast channels specified
                broadcastChannels.forEach(({ event, callback }) => {
                    this.channel?.on('broadcast', { event }, callback)
                })

                // Add the unique user broadcast to send an error if the user already exists
                this.channel?.on('broadcast', { event: 'sync:unique' }, (payload) => {
                    // console.log('check unique', payload.data.userId, session.user.id)
                    if (payload.data.userId !== session.user.id) return
                    this.broadcastMessageToChannel('sync:unique:error', { userId: session.user.id })
                })

                // Subscribe the channel
                this.channel?.subscribe(async (status) => {
                    // Only call once we've subscribed successfully
                    if (status !== 'SUBSCRIBED') return

                    // Send a broadcast to check for a user uniqueness confirmation
                    await new Promise<void>((resolveConfirmation) => {
                        // Timeout of we don't receive any response in a reasonable amount of time
                        const uniqueTimeout = setTimeout(() => {
                            resolveConfirmation()
                        }, 500)

                        // Add the unique user error confirmation broadcast to allow us to resolve the promise
                        this.channel?.on('broadcast', { event: 'sync:unique:error' }, (payload) => {
                            // Clear the timeout
                            clearTimeout(uniqueTimeout)

                            // Check if the responded user id is equal to the current user id and error if it is
                            const responseUserId = payload.data?.userId
                            if (responseUserId && responseUserId === session.user.id)
                                reject(RoomError.UserAlreadyJoined)

                            // Otherwise we can continue
                            resolveConfirmation()
                        })

                        // Send a message to confirm user uniqueness
                        this.broadcastMessageToChannel('sync:unique', {
                            userId: session.user.id
                        })
                    })

                    // Tell other users that we've entered, so they can display our user
                    await this.channel?.track({
                        userId: session.user.id,
                        userName: session.user.user_metadata.name,
                        isOwner: room.user_id === session.user.id,
                        onlineTime: Date.now()
                    })

                    // Finalize the promise as we've fully connected with the first sync
                    resolve()
                })
            })
        },
        async broadcastMessageToChannel(event: string, data: Record<string, any>) {
            // Helper function to broadcast the event and data
            const attemptBroadcast = async () => {
                await this.channel?.send({
                    type: 'broadcast',
                    event,
                    data
                })
            }

            // Attempt to broadcast initially, if we encounter an error refresh the session and attempt again
            // If it fails again then we'll have to return the error
            try {
                await attemptBroadcast()
            } catch (e) {
                await useAuth().refreshSession()
                await attemptBroadcast()
            }
        }
    }
})

export default useRoom
