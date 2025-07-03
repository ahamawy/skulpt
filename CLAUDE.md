# Skulpt Booking System - Claude Session Documentation

## Project Overview
Skulpt is a fitness studio booking management system for managing classes, teachers, and schedules across two rooms (Movement and Reformer).

## Key Features
- **Dual Room Management**: Movement Room and Reformer Room with independent schedules
- **Time Slots**: 15-minute intervals from 5 AM to 9 PM
- **Multi-slot Classes**: All classes default to 45 minutes (3 slots) with visual continuity
- **Real-time Database**: Supabase integration with automatic localStorage fallback
- **User Types**: Ghazal (admin) and Superadmin views
- **Export Options**: PDF reports, Instagram stories, and print-friendly views
- **Modern UI**: Shadcn-inspired components with gradients and subtle animations

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

## Development & Deployment

### Local Development
```bash
# Clone the repository
git clone https://github.com/ahamawy/skulpt.git
cd skulpt

# Open in browser directly (no build process needed)
# Option 1: Open index.html directly in browser
# Option 2: Use a simple HTTP server
python3 -m http.server 8000
# or
npx http-server -p 8000

# Access at http://localhost:8000/public/schedule.html
```

### Deployment via Git & Netlify
1. **Push changes to GitHub**:
   ```bash
   git add .
   git commit -m "Update description"
   git push origin main
   ```

2. **Automatic Deployment**:
   - Netlify automatically deploys when changes are pushed to GitHub main branch
   - No build process required - it's a static site
   - Site will be live at your Netlify URL within minutes

### Project Structure
```
skulpt/
├── public/
│   ├── schedule.html      # Main application
│   ├── migrate.html       # Manual migration tool
│   ├── css/
│   │   └── styles.css     # All styling (shadcn-inspired)
│   └── js/
│       ├── app.js         # Core application logic
│       ├── config.js      # Supabase configuration
│       ├── supabase.js    # Database operations
│       ├── dataAccess.js  # Data abstraction layer
│       ├── migration.js   # Data migration logic
│       └── app-wrapper.js # Supabase enhancement layer
└── CLAUDE.md             # This documentation

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

## Latest Updates (January 3, 2025)

### Major Changes
1. **45-Minute Default Duration**
   - All classes now default to 45 minutes (3 time slots)
   - Automatic migration updates existing classes
   - Multi-slot overlap detection prevents booking conflicts

2. **Enhanced Calendar View**
   - Compact 15-minute slots with visual hour groupings
   - Only hour marks shown in time column
   - Improved multi-slot class visualization

3. **Settings Room Navigation**
   - Added room tabs to filter settings by Movement/Reformer/All
   - Improved organization of teacher and class management

4. **UI Improvements**
   - Shadcn-inspired gradients and shadows
   - Enhanced cards with backdrop blur effects
   - Better hover states and transitions
   - Fixed statistics charts to respect room filters

## Key Technical Changes

### Class Duration System
- All classes now default to 45 minutes (3 slots)
- Duration options: 15, 30, 45, 60, 75, 90 minutes
- Automatic migration for existing classes without duration
- Multi-slot overlap detection prevents booking conflicts

### Visual Calendar Updates
```css
/* 15-minute slots are visually grouped by hour */
.schedule-table tr:nth-child(4n+2) td {
    border-top: 2px solid rgba(0,0,0,0.08);
}

/* Compact cell sizing */
.class-cell {
    min-height: 25px;  /* Reduced from 35px */
    padding: 2px 4px;
}
```

## Deployment Instructions
1. **Commit and push all changes**:
   ```bash
   git add .
   git commit -m "Add 45-min default duration, improve calendar view"
   git push origin main
   ```

2. **Netlify will automatically deploy** from GitHub main branch

3. **To view changes immediately**, hard refresh browser:
   - Chrome/Edge: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Clear browser cache if needed

## Quick Start
1. **View Live Site**: Changes automatically deploy to Netlify after GitHub push
2. **Make Changes**: Edit files locally, then:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
3. **Hard Refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac) to see updates