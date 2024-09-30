import { SpotifyBroadcastEvent, type SpotifyNowPlaying } from '@/types/spotify'
import { getNowPlaying, updateNowPlaying } from '@/worker/spotify'
import state from '@/worker/state'
import { broadcastToChannel, openChannel } from '@/worker/channel'
import supabase from '@/supabase'
import type { RoomUser } from '@/types/room'
import { RoomBroadcastEvent, RoomError } from '@/types/room'

export const getAll = async () => {
	const { data } = await supabase.from('rooms').select('*')
	console.log('data', data)
	return data
}

export const connect = async (
	id: string,
	onNowPlayingUpdate: (nowPlaying: SpotifyNowPlaying) => void,
	onUsersUpdate: (users: RoomUser[]) => void
) => {
	// Cleanup any previous channel state
	await disconnect()

	// Check if the room exists to connect to
	const { data } = await supabase.from('rooms').select('*').eq('short_id', id)
	const room = data?.[0]
	if (!room) throw RoomError.RoomUnavailable

	// If we're the owner, start broadcasting spotify details
	const userId = (await supabase.auth.getUser()).data.user?.id
	const isOwner = room.user_id === userId
	if (userId && isOwner) {
		state.room.broadcastIntervalId = setRoomBroadcastSpotifyInterval()
		state.room.activeIntervalId = setRoomActiveInterval(room.room_id)
	}

	// Connect and set the new channel
	state.room.channel = await openChannel(room.room_id, room.user_id, {
		[SpotifyBroadcastEvent.UpdatedNowPlaying]: async (newNowPlaying: SpotifyNowPlaying) => {
			// Update the now playing if we're not the owner
			if (!isOwner) await updateNowPlaying(state.spotify.nowPlaying, newNowPlaying)

			// Callback to update the frontend
			onNowPlayingUpdate(newNowPlaying)

			// Update the new now playing state
			state.spotify.nowPlaying = newNowPlaying
		},
		[RoomBroadcastEvent.UsersUpdated]: (newUsers: RoomUser[]) => {
			// Callback to update the frontend
			onUsersUpdate(newUsers)
		}
	})
}

export const create = async () => {
	// Generate a room on our edge and get the id of the room from it
	const response = await supabase.functions.invoke<{
		id: string
	}>('room-initiate')
	if (!response.data?.id) throw RoomError.RoomCreate
	return response.data.id
}

export const disconnect = async () => {
	// Cleanup our interval and disconnect from the channel
	clearInterval(state.room.broadcastIntervalId)
	clearInterval(state.room.activeIntervalId)
	await state.room.channel?.unsubscribe()

	// Clear our state
	state.room = {}
	state.spotify = {}
}

const setRoomBroadcastSpotifyInterval = (): NodeJS.Timeout => {
	return setInterval(async () => {
		// Get the now playing state and broadcast it to the channel
		const newNowPlaying = await getNowPlaying()
		if (!state.room.channel || !newNowPlaying) return

		// Broadcast it to everyone in the room
		await broadcastToChannel(
			state.room.channel,
			SpotifyBroadcastEvent.UpdatedNowPlaying,
			newNowPlaying
		)
	}, 1000)
}

const setRoomActiveInterval = (id: string): NodeJS.Timeout => {
	return setInterval(async () => {
		// Send an update every 1-minute to update the last active state with a new UTC based state
		await supabase
			.from('rooms')
			.update({
				last_active: new Date().toISOString().replace('T', ' ').replace('Z', '000+00')
			})
			.eq('room_id', id)
	}, 60 * 1000)
}
