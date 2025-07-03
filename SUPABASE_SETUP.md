# Supabase Setup Guide for Skulpt

This guide will help you set up Supabase for the Skulpt booking system.

## Prerequisites

- A Supabase account (free tier is sufficient)
- Access to your Supabase project dashboard

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in the project details:
   - Name: "Skulpt Booking"
   - Database Password: Choose a strong password
   - Region: Select the closest region to your users
4. Click "Create Project" and wait for it to initialize

## Step 2: Get Your Project Credentials

1. Once your project is ready, go to Settings → API
2. Copy these values:
   - **Project URL**: Found under "Project URL"
   - **Anon/Public Key**: Found under "Project API keys"

## Step 3: Configure the Application

### Option 1: Environment Variables (Recommended for Production)

Add these to your Netlify environment variables:
```
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
```

### Option 2: Direct Configuration (Development Only)

1. Open `/public/js/config.js`
2. Replace the placeholder values:
```javascript
SUPABASE_URL: 'your_project_url_here',
SUPABASE_ANON_KEY: 'your_anon_key_here',
```

## Step 4: Set Up Database Tables

The application will automatically create the required tables on first run. However, you can also create them manually:

### Run this SQL in the Supabase SQL Editor:

```sql
-- Create teachers table
CREATE TABLE IF NOT EXISTS teachers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    room VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create class types table
CREATE TABLE IF NOT EXISTS class_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    room VARCHAR(50) NOT NULL,
    level VARCHAR(50) DEFAULT 'Intermediate',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create schedule entries table
CREATE TABLE IF NOT EXISTS schedule_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    day VARCHAR(20) NOT NULL,
    time VARCHAR(20) NOT NULL,
    room VARCHAR(50) NOT NULL,
    class_id UUID REFERENCES class_types(id),
    teacher_id UUID REFERENCES teachers(id),
    type VARCHAR(50) DEFAULT 'Mixed',
    start_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(day, time, room)
);

-- Create RLS policies (optional but recommended)
-- Enable Row Level Security
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (adjust as needed)
CREATE POLICY "Allow anonymous read" ON teachers FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON class_types FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON schedule_entries FOR SELECT USING (true);

-- For authenticated users (when you add authentication)
CREATE POLICY "Allow authenticated insert" ON teachers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON teachers FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON teachers FOR DELETE USING (auth.role() = 'authenticated');

-- Repeat for other tables as needed
```

## Step 5: Enable Realtime (Optional)

For real-time updates across multiple users:

1. Go to Database → Replication in your Supabase dashboard
2. Enable replication for these tables:
   - `teachers`
   - `class_types`
   - `schedule_entries`

## Step 6: Test the Connection

1. Open your browser's developer console
2. Navigate to your Skulpt application
3. Check for any Supabase connection errors
4. The app will automatically migrate existing localStorage data to Supabase

## Troubleshooting

### "Invalid API Key" Error
- Double-check that you copied the correct Anon/Public key
- Ensure there are no extra spaces in the configuration

### Tables Not Created
- Check the SQL editor for any errors
- Ensure you have the correct permissions
- Try creating tables manually using the SQL provided above

### Data Not Syncing
- Verify that Realtime is enabled for your tables
- Check browser console for WebSocket errors
- Ensure your Supabase project is not paused (free tier limitation)

## Fallback Mode

If Supabase is not configured or unavailable, the application will automatically fall back to localStorage. This ensures the app remains functional even without a database connection.

## Security Considerations

1. **Never expose your Service Role key** - only use the Anon/Public key in client-side code
2. **Enable Row Level Security (RLS)** - Protect your data with appropriate policies
3. **Use environment variables** - Don't commit credentials to your repository
4. **Add authentication** - Consider implementing Supabase Auth for user management

## Next Steps

1. Set up Supabase Auth for proper user authentication
2. Configure Row Level Security policies
3. Set up database backups
4. Monitor usage in the Supabase dashboard