# Deployment Guide

## 🌐 The Sandbox URL Issue

The sandbox URL (`https://3000-ipmaf4jd9cziaxxnq9sow-b237eb32.sandbox.novita.ai`) **only works inside GenSpark**. 

For external access, you need to deploy to a public hosting platform.

---

## 🚀 Option 1: Deploy to Render.com (FREE - Recommended)

**Why Render?**
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ Public URL works everywhere
- ✅ Easy GitHub integration
- ✅ Automatic deploys from GitHub

### Steps:

1. **Push your code to GitHub** (already done)
   ```
   Repository: https://github.com/askinguray-debug/d1-template
   ```

2. **Sign up at Render.com**
   - Go to: https://render.com/
   - Click "Get Started"
   - Sign up with GitHub (easiest)

3. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `askinguray-debug/d1-template`
   - Render will auto-detect `render.yaml` configuration

4. **Configure (Auto-filled from render.yaml)**
   - Name: `agreement-management`
   - Region: `Oregon (US West)`
   - Branch: `main`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: **Free**

5. **Add Environment Variables** (Important!)
   - Go to "Environment" tab
   - Add these variables:
     ```
     NODE_ENV=production
     PORT=10000
     ```

6. **Deploy**
   - Click "Create Web Service"
   - Wait 2-3 minutes for deployment
   - Your app will be live at: `https://agreement-management.onrender.com`

7. **Configure Email Settings in App**
   - Visit your deployed app
   - Go to Settings → Email Settings
   - Configure Gmail or Resend (see EMAIL_SETUP.md)

---

## 🚀 Option 2: Deploy to Railway.app (Free Trial)

**Why Railway?**
- ✅ $5 free credit per month
- ✅ Very fast deployments
- ✅ Great performance

### Steps:

1. **Sign up at Railway.app**
   - Go to: https://railway.app/
   - Sign in with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose: `askinguray-debug/d1-template`

3. **Configure**
   - Railway auto-detects Node.js
   - Start Command: `npm start`
   - Add Environment Variable: `NODE_ENV=production`

4. **Deploy**
   - Railway automatically deploys
   - Get public URL from Settings → Domains

---

## 🚀 Option 3: Deploy to Heroku (Paid)

**Why Heroku?**
- ✅ Very reliable
- ✅ Industry standard
- ❌ No free tier (starts at $5/month)

### Steps:

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login and Create App**
   ```bash
   heroku login
   heroku create agreement-management-app
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

4. **Open App**
   ```bash
   heroku open
   ```

---

## 🚀 Option 4: Use Your Own VPS

If you have a VPS (DigitalOcean, AWS EC2, Linode, etc.):

1. **SSH into your server**
2. **Install Node.js 18+**
3. **Clone repository**
   ```bash
   git clone https://github.com/askinguray-debug/d1-template.git
   cd d1-template
   npm install
   ```

4. **Use PM2 for process management**
   ```bash
   npm install -g pm2
   pm2 start server.js --name agreement-app
   pm2 save
   pm2 startup
   ```

5. **Configure Nginx reverse proxy** (for port 80/443)

---

## 📧 After Deployment: Email Configuration

Once deployed, you MUST configure email settings:

1. **Visit your deployed app**
2. **Go to Settings tab → Email Settings**
3. **Choose email provider:**
   - **Resend** (Recommended - no 2FA needed)
     - Sign up: https://resend.com/signup
     - Get API key
     - Configure in app
   
   - **Gmail** (Requires 2FA + App Password)
     - Enable 2-Step Verification
     - Generate App Password: https://myaccount.google.com/apppasswords
     - Configure in app

4. **Test email sending** from any agreement

---

## 🔒 Security Notes

- **Never commit `.env` files** (already in .gitignore)
- **Use environment variables** for sensitive data on hosting platform
- **Keep database.json in .gitignore** for production (use real database)

---

## 💡 Recommended: Render.com Free Tier

For your use case, **Render.com** is the best option:
- ✅ Free forever (with some limitations)
- ✅ Automatic HTTPS
- ✅ Public URL that works everywhere
- ✅ Easy GitHub integration
- ✅ Auto-deploy on git push

**Start here:** https://render.com/

---

## 📊 What You'll Get

After deployment, you'll have:
- ✅ Public URL accessible from anywhere (e.g., `https://agreement-management.onrender.com`)
- ✅ Automatic HTTPS
- ✅ Share links in emails will work correctly
- ✅ No more sandbox limitations

---

## ❓ Questions?

If you need help with deployment, let me know which platform you prefer!
