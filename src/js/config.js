// Configuration file for environment variables
export const config = {
    // These values should be replaced with actual Supabase project credentials
    // For production, these should be loaded from environment variables
    SUPABASE_URL: window.SUPABASE_URL || 'YOUR_SUPABASE_PROJECT_URL',
    SUPABASE_ANON_KEY: window.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY',
    
    // Feature flags
    USE_SUPABASE: window.USE_SUPABASE !== false, // Default to true
    ENABLE_REALTIME: true,
    
    // Check if we have valid Supabase credentials
    hasValidCredentials() {
        return this.SUPABASE_URL !== 'YOUR_SUPABASE_PROJECT_URL' && 
               this.SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY'
    }
}