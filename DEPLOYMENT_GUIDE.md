# 🚀 Agreement Management System - Production Deployment Guide

## ⚠️ IMPORTANT: This is a Node.js Application

This application **CANNOT** be deployed to Cloudflare Pages/Workers because it requires:
- **Express.js** server
- **File system operations** (database.json)
- **Puppeteer** (PDF generation)
- **Server-side processes**

## ✅ Recommended Deployment Platforms

### 1. **Vercel** (Recommended - Easiest)
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
cd /home/user/webapp
vercel --prod
```

**Configure Environment Variables in Vercel Dashboard:**
- `RESEND_API_KEY` - Your Resend API key
- Any other environment variables

### 2. **Railway**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
cd /home/user/webapp
railway init
railway up
```

### 3. **Render**
1. Go to https://render.com
2. Connect your GitHub repository
3. Select "Web Service"
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add environment variables

### 4. **Heroku**
```bash
# Install Heroku CLI
# Then:
cd /home/user/webapp
heroku login
heroku create
git push heroku main
```

## 📦 Current Project Structure

```
webapp/
├── server.js          # Main Express server
├── database.json      # Data storage
├── public/            # Static files
│   ├── index.html
│   ├── app.js
│   ├── sign.html
│   └── styles.css
└── package.json
```

## 🔧 Environment Variables Needed

```env
RESEND_API_KEY=your_resend_api_key_here
PORT=3000
NODE_ENV=production
```

## 🌐 Current Sandbox URL

**Development:** https://3000-ipmaf4jd9cziaxxnq9sow-b237eb32.sandbox.novita.ai

## 📝 Deployment Checklist

- [x] Code pushed to GitHub
- [x] Email system working (Resend)
- [x] Signing links using HTTPS
- [x] Mobile responsive design
- [x] All features tested
- [ ] Choose production platform
- [ ] Configure environment variables
- [ ] Deploy to production
- [ ] Test production deployment
- [ ] Update DNS (if custom domain)

## 🎯 Why Not Cloudflare Pages?

Cloudflare Pages/Workers is designed for:
- Static sites
- Edge functions (serverless)
- No file system
- No long-running processes

This application requires:
- ✅ Express server
- ✅ File system (database.json)
- ✅ Puppeteer (browser automation)
- ✅ Server-side PDF generation
- ✅ SMTP/Email services

## 📞 Need Help?

Your application is **fully working** in the sandbox. For production:
1. Choose a platform (Vercel recommended)
2. Set up environment variables
3. Deploy using the commands above

All features work perfectly:
- ✅ Agreement creation/management
- ✅ Email sending (Resend)
- ✅ Signing system (HTTPS links)
- ✅ PDF generation
- ✅ Mobile responsive
- ✅ Payment reminders
