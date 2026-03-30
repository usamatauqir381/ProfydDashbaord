import { createBrowserClient } from '@supabase/ssr'

// These must match EXACTLY what's in your .env file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!  // Note: _ANON_KEY not _PUBLISHABLE_DEFAULT_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey,
    // Debug: See what env vars are actually available
    availableVars: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_SUPABASE'))
  });
  throw new Error('Missing Supabase environment variables. Check your .env file.')
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
export const createClient = () => createBrowserClient(supabaseUrl, supabaseAnonKey)