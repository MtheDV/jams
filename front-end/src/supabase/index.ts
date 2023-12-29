import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const client = createClient<Database>(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_KEY
)

export default client
