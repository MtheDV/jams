import { corsHeaders } from '../_shared/cors.ts';
import { encode as base64Encode } from 'https://deno.land/std@0.82.0/encoding/base64.ts'

Deno.serve(async (req) => {
	// Handle cors
	if (req.method === 'OPTIONS') {
		return new Response('ok', {headers: corsHeaders})
	}

	// Get our spotify client id and secret
	const clientId = Deno.env.get('SPOTIFY_CLIENT_ID') ?? ''
	const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET') ?? ''

	// Get the passed in refresh token
	const {refreshToken} = await req.json()

	// Encode our authorization as base64
	const authorization = base64Encode(clientId + ':' + clientSecret)

	// Create our authorization payload to get the new auth data back
	const payload = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Authorization': `Basic ${authorization}`
		},
		body: new URLSearchParams({
			grant_type: 'refresh_token',
			refresh_token: refreshToken,
		}),
	}

	// Fetch and get the response json
	const body = await fetch('https://accounts.spotify.com/api/token', payload)
	const response = await body.json()

	// Return to the caller
	return new Response(
		JSON.stringify(response),
		{headers: {...corsHeaders, 'Content-Type': 'application/json'}},
	)
})
