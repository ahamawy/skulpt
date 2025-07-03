# 🚀 Deployment Guide for Skulpt Booking System

## 🎯 Quick Deploy to Netlify (Easiest Method)

### Method 1: Drag & Drop (No Account Required Initially)

1. Open [Netlify Drop](https://app.netlify.com/drop) in your browser
2. Drag the entire `skulpt` folder onto the page
3. Wait ~10 seconds for deployment
4. Your site is live! You'll get a URL like `amazing-einstein-123abc.netlify.app`
5. (Optional) Create a free Netlify account to claim and customize your site

### Method 2: One-Command Deploy

```bash
# From the skulpt directory, run:
./deploy.sh
```

This script will:
- Install Netlify CLI if needed
- Log you into Netlify
- Deploy your site to production

### Method 3: GitHub + Netlify (Automatic Updates)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/skulpt-booking.git
   git push -u origin main
   ```

2. **Connect to Netlify:**
   - Go to [Netlify](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub and select your repository
   - Settings are pre-configured in `netlify.toml`
   - Click "Deploy site"

3. **Benefits:**
   - Auto-deploy on every git push
   - Preview deployments for branches
   - Rollback to any previous version

## 🏠 Running Locally

```bash
# Quick start:
./start.sh

# Or manually:
npm install
npm start
```

Visit http://localhost:8080

## 🎨 Custom Domain Setup

1. In Netlify dashboard, go to "Domain settings"
2. Click "Add custom domain"
3. Enter your domain (e.g., `schedule.skulptstudio.com`)
4. Follow the DNS configuration instructions

## 📁 What Gets Deployed

```
skulpt/
├── public/          ← This folder is served
│   └── index.html   ← Your main page
├── src/             ← CSS and JS files
│   ├── css/
│   └── js/
└── netlify.toml     ← Deployment config
```

## 🔧 Environment Configuration

The app works without any configuration, but you can customize:

1. **Site Name**: Change in Netlify dashboard → Site settings
2. **Build Settings**: Already configured in `netlify.toml`
3. **Caching**: Optimized headers are pre-configured

## 🚦 Deployment Checklist

- [x] All files in correct folders
- [x] `netlify.toml` configured
- [x] No sensitive data in code
- [x] localStorage for data persistence
- [x] Responsive design tested

## 🆘 Troubleshooting

**Site not loading?**
- Check browser console for errors
- Ensure all file paths are relative
- Clear browser cache

**Changes not appearing?**
- Hard refresh: Ctrl+Shift+R (Cmd+Shift+R on Mac)
- Check Netlify deploy logs
- Verify files were saved

**Export features not working?**
- PDF libraries load async - wait a moment
- Check browser allows popups for downloads

## 📊 Post-Deployment

1. **Monitor Usage**: Netlify dashboard shows analytics
2. **Set Up Notifications**: Get alerts for deploys
3. **Enable Forms**: Netlify can handle contact forms
4. **Add Password Protection**: Available on paid plans

## 🎉 Success!

Your booking system is now live and accessible worldwide. Share the URL with your team and start managing classes efficiently!

---

Need help? Check the [README](README.md) or contact support.