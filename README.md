# Skulpt Studio Booking System

A modern, responsive booking management system for Skulpt Studio's pilates and yoga classes.

## Features

- 📅 **Dual Room Management**: Separate schedules for Movement and Reformer rooms
- ✏️ **Easy Class Management**: Add, edit, and remove classes with a simple interface
- 👥 **Teacher Management**: Add/remove teachers with smart class reassignment
- 🏷️ **Custom Class Types**: Create new class types like "Athletic Reformer"
- 📆 **Future Scheduling**: Set start dates for classes (e.g., "starts June 29")
- 💾 **Persistent Storage**: All changes are saved locally using localStorage
- 📊 **Statistics Dashboard**: View class counts, teacher schedules, and more
- 📱 **Export Options**: Generate PDFs and Instagram stories for marketing
- 🎨 **Brand-Aligned Design**: Clean, modern interface matching Skulpt's aesthetic

## Quick Start

### Local Development

1. Clone or download this repository
2. Navigate to the project directory
3. Run the application:
   ```bash
   npm install
   npm start
   ```
4. Open http://localhost:8080 in your browser

### Deploy to Netlify (One-Click)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-repo/skulpt-booking)

### Manual Netlify Deployment

1. **Option 1: Drag & Drop**
   - Visit [Netlify Drop](https://app.netlify.com/drop)
   - Drag the entire `skulpt` folder to the deployment area
   - Your site will be live immediately!

2. **Option 2: Git Integration**
   - Push your code to GitHub/GitLab/Bitbucket
   - Connect your repository to Netlify
   - Automatic deployments on every push

3. **Option 3: Netlify CLI**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Login to Netlify
   netlify login
   
   # Deploy
   netlify deploy --prod
   ```

## Project Structure

```
skulpt/
├── public/              # Static files served by Netlify
│   └── index.html       # Main HTML file
├── src/                 # Source files
│   ├── css/            
│   │   └── styles.css   # All styles
│   └── js/
│       └── app.js       # Application logic
├── netlify.toml         # Netlify configuration
├── package.json         # Project metadata
└── README.md           # This file
```

## Usage Guide

### Managing Classes

1. **Add a Class**: Click any empty time slot
2. **Edit a Class**: Click an existing class
3. **Remove a Class**: Click a class, then click "Remove Class"
4. **Set Start Date**: When adding a class, optionally set a future start date
5. **Switch Rooms**: Use the tab buttons at the top
6. **View Statistics**: Click the "Statistics" button

### Managing Teachers & Class Types

1. **Access Settings**: Click the "Settings" tab
2. **Add Teacher**: Click "Add Teacher" in the relevant room section
3. **Remove Teacher**: Click "Delete" next to a teacher
   - Choose to replace with another teacher or delete all their classes
4. **Add Class Type**: Click "Add Class Type" and enter name and default level
5. **Remove Class Type**: Click "Delete" next to a class type

### Export Options

- **PDF Report**: Complete 4-page schedule document
- **Weekly Story**: Instagram story showing week overview
- **Daily Stories**: Individual stories for each day
- **Print**: Browser print function for physical copies

### Data Persistence

All schedule changes are automatically saved to your browser's local storage. To reset to defaults, clear your browser's local storage for this site.

## Technical Details

- **No Backend Required**: Runs entirely in the browser
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern JavaScript**: Uses ES6+ features with class-based architecture
- **Optimized Performance**: Minimal dependencies, fast load times

## Customization

### Modify Class Types
Edit the class arrays in `src/js/app.js`:
```javascript
this.movementClasses = ['Your', 'Classes', 'Here'];
this.reformerClasses = ['Your', 'Reformer', 'Classes'];
```

### Update Teachers
Modify the teacher arrays:
```javascript
this.movementTeachers = ['Teacher1', 'Teacher2'];
this.reformerTeachers = ['Teacher3', 'Teacher4'];
```

### Change Brand Colors
Update CSS variables in `src/css/styles.css`:
```css
:root {
    --background: #E8E2D6;
    --primary: #FFFFFF;
    --accent: #D3B7A3;
}
```

## Support

For issues or feature requests, please contact the development team.

---

Built with ❤️ for Skulpt Studio