import { defineStore } from 'pinia'
import supabase from '@/supabase'
import type { Tables } from '@/types/supabase'
import ShortUniqueId from 'short-unique-id'

const { randomUUID } = new ShortUniqueId({ length: 6 })

const useRooms = defineStore('rooms', {
    state(): {
        loading: boolean
        rooms: Tables<'rooms'>[]
    } {
        return {
            loading: false,
            rooms: []
        }
    },
    actions: {
        async get(short_id: string) {
            // Look through the rooms and see if we have the id
            const room = this.rooms.find((room) => room.short_id === short_id)
            if (room) return room

            // Otherwise run a query to find the room in the database and return that instead
            const roomsResponse = await supabase.from('rooms').select('*').eq('short_id', short_id)
            return roomsResponse.data?.[0]
        },
        async refresh() {
            // Begin loading
            this.loading = true

            // Fetch the data from our rooms table and set it to our rooms state
            const roomsResponse = await supabase.from('rooms').select('*')
            this.rooms = roomsResponse.data ?? []

            // Finalize the loading
            this.loading = false
        },
        async create() {
            // Create a new room entry in our database
            // Generate a new short_id for our room
            const newRoomResponse = await supabase
                .from('rooms')
                .insert({
                    short_id: randomUUID()
                })
                .select()
            return newRoomResponse.data?.[0]
        },
        async delete(short_id: string) {
            // Remove the specified room
            await supabase.from('rooms').delete().eq('short_id', short_id)
        }
    }
})

export default useRooms
