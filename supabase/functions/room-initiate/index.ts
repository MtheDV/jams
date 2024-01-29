import {createClient} from 'https://esm.sh/@supabase/supabase-js@2'
import ShortUniqueId from 'https://esm.sh/short-unique-id'
import { corsHeaders } from "../_shared/cors.ts";

const { randomUUID } = new ShortUniqueId({ length: 6 })

Deno.serve(async (req) => {
	// Handle cors
	if (req.method === 'OPTIONS') {
		return new Response('ok', {headers: corsHeaders})
	}

	// Get our auth token and ensure it exists
	const authHeader = req.headers.get('Authorization')
	if (!authHeader) return new Response('Unauthorized', { headers: corsHeaders, status: 401 })

	// Create a client and get the userId from the client
	const supabase = createClient(
		Deno.env.get('SUPABASE_URL') ?? '',
		Deno.env.get('SUPABASE_ANON_KEY') ?? '',
		{ global: { headers: { Authorization: authHeader } } }
	)
	const { data } = await supabase.auth.getUser()
	const userId = data.user?.id
	if (!userId) return new Response('Unauthorized', { headers: corsHeaders, status: 401 })

	// TODO: Check for existing rooms with the user id and return that one instead,
	// TODO: Otherwise create a new room

	// Generate a 6 length id and create a new room
	const short_id = randomUUID()
	await supabase.from('rooms').insert({
		short_id
	})

	// Return the created room's id
	return new Response(JSON.stringify({
		id: short_id
	}), {
		headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		status: 200
	})
})