// Configuration file for environment variables
export const config = {
    // Supabase project credentials
    SUPABASE_URL: window.SUPABASE_URL || 'https://isiyrxinckxetufgctvb.supabase.co',
    SUPABASE_ANON_KEY: window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzaXlyeGluY2t4ZXR1ZmdjdHZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NzgxNDMsImV4cCI6MjA2NzE1NDE0M30.HC6RGvFTGD8O_n9qyZvq8jc4rYsdOJb0vNbQ-loQV-I',
    
    // Feature flags
    USE_SUPABASE: window.USE_SUPABASE !== false, // Default to true
    ENABLE_REALTIME: true,
    
    // Check if we have valid Supabase credentials
    hasValidCredentials() {
        return this.SUPABASE_URL !== 'YOUR_SUPABASE_PROJECT_URL' && 
               this.SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY'
    }
}