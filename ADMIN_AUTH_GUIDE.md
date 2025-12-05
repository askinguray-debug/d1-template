# 🔐 Admin Authentication System - Complete Guide

## 🎯 Overview

Your Agreement Management System now has **secure admin authentication**! All admin panel features are protected, while public agreement signing links remain accessible without login.

## 🔑 Default Admin Credentials

```
Username: Recluma
Password: 123123
```

**⚠️ IMPORTANT: Change this password after first login!**

## 🚀 How to Access

### 1. **Login Page**
- URL: `https://3000-ipmaf4jd9cziaxxnq9sow-b237eb32.sandbox.novita.ai/login`
- Enter your username and password
- Click "Sign In"

### 2. **Admin Dashboard**
- After successful login, you'll be redirected to the main dashboard
- Your username will appear in the top-right corner
- All features are now accessible

### 3. **Logout**
- Click the "Logout" button in the header (top-right)
- You'll be redirected back to the login page
- Your session will be terminated

## 🔒 Security Features

### ✅ What's Protected (Requires Login):
- Main dashboard (/)
- All agreements management
- Agencies management
- Customers management
- Email settings
- WhatsApp settings
- All API endpoints (except public ones)

### ✅ What's Public (No Login Required):
- Agreement signing links (`/sign/:token`)
- Agreement view links for customers/agencies
- Public API endpoints for signing agreements

### 🛡️ Session Management:
- **Session Duration**: 24 hours
- **Auto-extend**: Session extends automatically with each request
- **Token Storage**: Stored in browser localStorage
- **Security**: Token required in Authorization header for all API calls

## 🔐 Change Your Password

### Step-by-Step:

1. **Login** to the admin dashboard
2. Click on **"Settings"** tab in the navigation
3. Scroll down to the **"Admin Password"** section (purple card)
4. Fill in the form:
   - Current Password: `123123` (or your current password)
   - New Password: Enter your new password (min 6 characters)
   - Confirm New Password: Re-enter your new password
5. Click **"Change Password"**
6. You'll be automatically logged out after successful change
7. Login again with your new credentials

### Password Requirements:
- ✅ Minimum 6 characters
- ✅ Must match confirmation
- ✅ Current password must be correct

### After Password Change:
- You'll see a success message
- Auto-logout after 2 seconds
- Login again with new credentials
- Old password will no longer work

## 📱 Features Overview

### 1. **Login Page**
- Modern gradient design
- Password visibility toggle
- Error messages for invalid credentials
- Auto-redirect if already logged in

### 2. **Dashboard Header**
- User info display (shows your username)
- Logout button
- Responsive design (mobile-friendly)

### 3. **Password Change Form**
- Located in Settings tab
- Real-time validation
- Success/error notifications
- Secure password change process

## 🔐 Technical Details

### Authentication Flow:
```
1. User visits main page (/)
   ↓
2. Check for valid token in localStorage
   ↓
3. If no token → Redirect to /login
   ↓
4. User enters credentials
   ↓
5. Server validates credentials
   ↓
6. Server generates session token (32 bytes hex)
   ↓
7. Token stored in localStorage
   ↓
8. All API requests include: Authorization: Bearer {token}
   ↓
9. Server validates token on each request
   ↓
10. Session extends automatically (24h from last activity)
```

### API Endpoints:

#### Public Endpoints (No Auth):
- `POST /api/admin/login` - Login
- `GET /api/share/:token` - View agreement
- `POST /api/share/:token/sign` - Sign agreement
- `GET /sign/:token` - Signing page

#### Protected Endpoints (Auth Required):
- `GET /api/admin/verify` - Verify token
- `POST /api/admin/logout` - Logout
- `POST /api/admin/change-password` - Change password
- All other `/api/*` endpoints

## 🚨 Important Notes

### Security Best Practices:
1. ✅ **Change default password immediately** after first login
2. ✅ Use a **strong password** (mix of letters, numbers, symbols)
3. ✅ **Don't share** your credentials
4. ✅ **Logout** when done, especially on shared computers
5. ✅ Sessions **expire after 24 hours** of inactivity

### Shared Agreement Links:
- ✅ **No login required** for customers/agencies to sign agreements
- ✅ Links work from **any device, any location**
- ✅ Each link has a **unique token**
- ✅ Links **expire after 1 year**
- ✅ Links become **invalid after use** (for single-use scenarios)

## 🐛 Troubleshooting

### Problem: Can't Login
**Solutions:**
1. Check username: `Recluma` (case-sensitive)
2. Check password: `123123` (default)
3. Clear browser cache and try again
4. Check browser console for errors

### Problem: Session Expired
**Solutions:**
1. Click "Logout" and login again
2. Clear localStorage: `localStorage.clear()`
3. Use fresh login credentials

### Problem: Password Change Failed
**Solutions:**
1. Verify current password is correct
2. Ensure new password is at least 6 characters
3. Make sure new password and confirmation match
4. Check if you're still logged in (session may have expired)

### Problem: Signing Links Not Working
**Solutions:**
1. These should work without login
2. Make sure you're using HTTPS (not HTTP)
3. Check that the token in the URL is correct
4. Verify the link hasn't expired (1 year validity)

## 📊 Status & URLs

**Live Application:**
- Main URL: `https://3000-ipmaf4jd9cziaxxnq9sow-b237eb32.sandbox.novita.ai`
- Login: `https://3000-ipmaf4jd9cziaxxnq9sow-b237eb32.sandbox.novita.ai/login`
- GitHub: `https://github.com/askinguray-debug/d1-template`

**Latest Commit:** `e18bd7b` - Admin authentication system

## 🎉 What's New

### Features Added:
1. ✨ Secure login system
2. ✨ Session-based authentication
3. ✨ Password change functionality
4. ✨ User info display in header
5. ✨ Protected admin routes
6. ✨ Public signing links (no auth)
7. ✨ Auto-logout after password change
8. ✨ 24-hour session expiration
9. ✨ Modern login page design
10. ✨ Mobile-responsive authentication

### Security Improvements:
1. 🔒 All admin endpoints protected
2. 🔒 Token-based authentication
3. 🔒 Session management
4. 🔒 Auto-expiring sessions
5. 🔒 Secure password change
6. 🔒 Public routes properly excluded

## 💡 Tips

1. **First Login:** Use `Recluma` / `123123`
2. **Change Password:** Go to Settings tab immediately
3. **Stay Logged In:** Sessions last 24 hours with auto-extend
4. **Mobile Access:** Fully responsive on all devices
5. **Sharing Links:** Agreement links work without login
6. **Security:** Logout when done on shared computers

## ✅ Everything Works!

- ✅ Login system functional
- ✅ Password change operational
- ✅ Session management active
- ✅ Admin routes protected
- ✅ Public links accessible
- ✅ Mobile responsive
- ✅ All features tested
- ✅ Code deployed

**Your Agreement Management System is now secure!** 🎉
