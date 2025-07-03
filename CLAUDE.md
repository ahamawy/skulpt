# Skulpt Booking System - Claude Session Documentation

## Project Overview
Skulpt is a fitness studio booking management system for managing classes, teachers, and schedules across two rooms (Movement and Reformer).

## Recent Upgrades Completed
1. ✅ Git repository initialized and pushed to GitHub
2. ✅ GitHub-Netlify integration ready for automatic deployments
3. ✅ Extended time slots from 5:00 AM to 9:00 PM with 15-minute intervals
4. ✅ Supabase database integration with automatic fallback to localStorage
5. ✅ Fixed teacher and class management to sync with database
6. ✅ Added skill level breakdown pie chart to statistics
7. ✅ Implemented multi-slot visual highlighting for longer classes

## Supabase Configuration
The project is configured to use the following Supabase instance:

- **Project URL**: https://isiyrxinckxetufgctvb.supabase.co
- **Anon Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzaXlyeGluY2t4ZXR1ZmdjdHZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NzgxNDMsImV4cCI6MjA2NzE1NDE0M30.HC6RGvFTGD8O_n9qyZvq8jc4rYsdOJb0vNbQ-loQV-I
- **Service Role Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzaXlyeGluY2t4ZXR1ZmdjdHZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTU3ODE0MywiZXhwIjoyMDY3MTU0MTQzfQ.Xpz9kWsLnk-m1QLGnPy0EXVfMc-wbBP8DzHWXXnj10M
- **Project ID**: isiyrxinckxetufgctvb
- **Database Password**: sbp_edcb698e7fe4dee9a25b3c6df8ebbe654b44beb3

## Database Schema
The following tables are required (will be created automatically on first run):

### teachers
- id (UUID, primary key)
- name (VARCHAR(255))
- room (VARCHAR(50)) - 'movement' or 'reformer'
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### class_types
- id (UUID, primary key)
- name (VARCHAR(255))
- room (VARCHAR(50))
- level (VARCHAR(50)) - 'Beginner', 'Intermediate', 'Advanced', 'Teens'
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### schedule_entries
- id (UUID, primary key)
- day (VARCHAR(20))
- time (VARCHAR(20))
- room (VARCHAR(50))
- class_id (UUID, foreign key to class_types)
- teacher_id (UUID, foreign key to teachers)
- type (VARCHAR(50)) - 'Mixed' or 'Ladies Only'
- start_date (DATE, optional)
- duration (INTEGER) - duration in minutes (15, 30, 45, 60, 75, 90)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- UNIQUE constraint on (day, time, room)

## Key Features
- **Dual Room Management**: Movement Room and Reformer Room
- **User Types**: Ghazal (admin) and Superadmin
- **Time Slots**: 15-minute intervals from 5 AM to 9 PM
- **Multi-slot Classes**: Classes can span multiple time slots with visual continuity
- **Real-time Sync**: Changes sync across devices when using Supabase
- **Automatic Migration**: Existing localStorage data migrates to Supabase automatically
- **Offline Support**: Falls back to localStorage if Supabase is unavailable

## Development Commands
```bash
# Start development server
npm start

# The app runs on http://localhost:8080
```

## Deployment
The project is configured for Netlify deployment with automatic builds from GitHub main branch.

## Important Files
- `/public/js/config.js` - Supabase configuration
- `/public/js/supabase.js` - Database operations
- `/public/js/dataAccess.js` - Data access layer (handles both Supabase and localStorage)
- `/public/js/app-wrapper.js` - Enhances the main app with Supabase support
- `/public/js/migration.js` - Handles data migration from localStorage to Supabase

## Testing Supabase Connection
1. Open the browser developer console
2. Look for "Database initialized successfully" message
3. Check for any migration messages
4. Try adding/editing classes to verify real-time sync

## Troubleshooting
- If Supabase connection fails, the app automatically falls back to localStorage
- Check browser console for detailed error messages
- Ensure the Supabase project is not paused (free tier limitation)
- Verify Row Level Security (RLS) policies if experiencing permission issues

## Session Notes (January 3, 2025)
- Configured Supabase credentials in `/public/js/config.js`
- Created database tables using Supabase MCP migration tool
- Tables include proper constraints and RLS policies for anonymous access
- Added duration field support for multi-slot classes
- Database is ready for data migration from localStorage
- Project hosted in EU West 2 region

## Next Steps
1. Open the application in browser to trigger automatic migration
2. Verify data has migrated by checking Supabase dashboard
3. Test real-time sync by opening app in multiple browser tabs
4. Configure Netlify environment variables for production deployment