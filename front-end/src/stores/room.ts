import { defineStore } from 'pinia'
import supabase from '@/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { Tables } from '@/types/supabase'
import useAuth from '@/stores/auth'
import type { RealtimePresenceLeavePayload } from '@supabase/realtime-js/src/RealtimePresence'
import { REALTIME_LISTEN_TYPES } from '@supabase/realtime-js/src/RealtimeChannel'

const useRoom = defineStore('room', {
    state(): {
        loading: boolean
        channel: RealtimeChannel | null
        room: Tables<'rooms'> | null
        users: string[]
    } {
        return {
            loading: false,
            channel: null,
            room: null,
            users: []
        }
    },
    actions: {
        async refresh(key: string) {
            this.loading = true

            // Reset the existing data
            this.channel?.unsubscribe()
            this.channel = null
            this.users = []
            this.room = null

            // Will get a room from a specific key, with the full details
            const roomsResponse = await supabase.from('rooms').select('*').eq('key', key)
            this.room = roomsResponse.data?.[0] ?? null

            this.loading = false
        },
        createChannel(key: string) {
            this.channel = supabase.channel(key)
            this.users = []
            this.channel
                .on('presence', { event: 'sync' }, () => {
                    console.log('new user synced')
                    // TODO: Update user in list
                })
                .on('presence', { event: 'join' }, ({ newPresences }) => {
                    console.log('join', newPresences)
                    // Add the new users to the list of users
                    const newUserIds = newPresences.map((newPresence) => newPresence.userId)
                    this.users.push(...newUserIds)
                    // TODO: Duplicate windows with the same user id
                })
                .on('presence', { event: 'leave' }, ({ leftPresences }) => {
                    console.log('leave', leftPresences)
                    // Remove any users from the list of users
                    const leftUserIds = leftPresences.map((leftPresence) => leftPresence.userId)
                    this.users = this.users.filter((user) => !leftUserIds.includes(user))
                    // TODO: Duplicate windows with the same user id
                })
        },
        subscribeToChannel() {
            this.channel?.subscribe(async (status) => {
                // Only call once we've subscribed successfully
                if (status !== 'SUBSCRIBED') return

                // Tell other users that we've entered, so they can display our user
                await this.channel?.track({
                    userId: (await useAuth().getSession())?.user.id
                })
            })
        },
        async broadcastMessageToChannel(event: string, data: Record<string, any>) {
            await this.channel?.send({
                type: 'broadcast',
                event,
                data
            })
        },
        assignBroadcastEventToChannel(
            event: string,
            callback: (payload: {
                type: `${REALTIME_LISTEN_TYPES.BROADCAST}`
                event: string
                [key: string]: any
            }) => void
        ) {
            this.channel?.on('broadcast', { event }, callback)
        }
    }
})

export default useRoom
