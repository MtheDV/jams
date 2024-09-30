import supabase from '@/supabase'
import { RoomBroadcastEvent, RoomError, type RoomUser } from '@/types/room'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { getSession, refreshSession } from '@/worker/auth'

export const broadcastToChannel = async (channel: RealtimeChannel, event: string, data: object) => {
	// Helper function to broadcast the event and data
	const attemptBroadcast = async () => {
		await channel.send({
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
		await refreshSession()
		await attemptBroadcast()
	}
}

export const openChannel = async (
	id: string,
	ownerId: string,
	events: Record<string, (payload: any) => void | Promise<void>>
) => {
	const session = await getSession()
	if (!session) return Promise.reject(RoomError.NoUserSession)

	// Return a promise to set up our channel and resolve once complete
	return new Promise<RealtimeChannel>((resolve) => {
		// Create a channel to connect to
		// Send messages to self to simplify the code
		const channel = supabase.channel(id, {
			config: {
				broadcast: {
					self: true
				}
			}
		})

		// Store a value of available users
		let users: RoomUser[] = []

		// Add our presence and broadcast events to the channel
		channel
			.on('presence', { event: 'join' }, async ({ newPresences }) => {
				// Update our list of users with any new ones
				// Converting any presence_ref's to id's for clearer management
				users = [
					...users,
					...newPresences.map<RoomUser>((newUser) => ({
						id: newUser.presence_ref,
						userId: newUser.userId,
						userName: newUser.userName,
						isOwner: newUser.isOwner,
						onlineTime: newUser.onlineTime
					}))
				]

				// Notify the callback of any new users that have joined
				events[RoomBroadcastEvent.UsersUpdated]?.(users)
			})
			.on('presence', { event: 'leave' }, async ({ leftPresences }) => {
				// Remove any users from the list of users based on their id
				const leftIds = leftPresences.map((leftUser) => leftUser.presence_ref)
				users = users.filter((user) => !leftIds.includes(user.id))

				// Notify the callback of any users that have left
				events[RoomBroadcastEvent.UsersUpdated]?.(users)
			})

		// Add the events specified in the events object
		Object.entries(events).forEach(([event, callback]) => {
			channel.on('broadcast', { event }, (event) => callback(event.data))
		})

		// Subscribe the channel
		channel.subscribe(async (status) => {
			// Only call once we've subscribed successfully
			if (status !== 'SUBSCRIBED') return

			// Tell other users that we've entered, so they can display our user
			await channel.track({
				userId: session.user.id,
				userName: session.user.user_metadata.name,
				isOwner: session.user.id === ownerId,
				onlineTime: Date.now()
			})

			// Finalize the promise as we've fully connected with the first sync
			resolve(channel)
		})
	})
}
