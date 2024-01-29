import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import { del, get, set } from 'idb-keyval'

// Wrapper for idb-keyval to allow the supabase client to use it
class IndexDbKeyValStorage {
    async getItem(key: string) {
        return await get(key)
    }

    async setItem(key: string, value: string) {
        await set(key, value)
    }

    async removeItem(key: string) {
        await del(key)
    }
}

// Generate our supabase client using the new storage method for our auth
const client = createClient<Database>(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_KEY,
    {
        auth: {
            storage: new IndexDbKeyValStorage()
        }
    }
)

export default client
