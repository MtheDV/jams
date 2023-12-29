# Supabase Edge Functions
// TODO: Complete docs

## Running locally
1. `supabase start`

## Deploying to prod
### First run
1. `supabase link --project-ref "project-id"`

### Env modifications
1. `supabase secrets set --env-file .env`
2. `supabase secrets list` to ensure secrets have been added

### Every run
1. Ensure Docker is running
2. `supabase functions deploy`