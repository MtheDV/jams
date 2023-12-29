import { defineStore } from 'pinia'
import supabase from '@/supabase'
import type { Tables } from '@/types/supabase'
import useAuth from '@/stores/auth'

const useRooms = defineStore('rooms', {
    state(): {
        loading: boolean
        rooms: Pick<Tables<'rooms'>, 'key' | 'user_id'>[] | null
    } {
        return {
            loading: false,
            rooms: null
        }
    },
    actions: {
        async refresh() {
            // Will get all the available rooms, with minimized details
            this.loading = true
            const roomsResponse = await supabase.from('rooms').select('key,user_id')
            this.rooms = roomsResponse.data
            this.loading = false
        },
        async create() {
            // Get the user id and ensure we have one
            const userId = (await useAuth().getSession())?.user.id
            if (!userId) return null

            // Create a new room with the current user and get it from the returned data
            const newRoomResponse = await supabase
                .from('rooms')
                .insert({
                    user_id: userId
                })
                .select()
            const newRoom = newRoomResponse.data?.[0]

            // If we have a new room created, update the current rooms list and return the new room
            if (!newRoom) return null
            return newRoom.key
        }
    }
})

export default useRooms
