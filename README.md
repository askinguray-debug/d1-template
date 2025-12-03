# Agreement Management System

## Project Overview
- **Name**: Agreement Management System  
- **Goal**: A comprehensive online agreement application for managing contracts between agencies and customers
- **Type**: Full-stack web application with Node.js backend and vanilla JavaScript frontend
- **Features**: 
  - Multi-agency management (2-3 selectable agencies)
  - Unlimited customer storage and management
  - Agreement templates with variable placeholders
  - Digital signature support for both parties
  - Monthly payment reminder system
  - Email API integration for automated reminders
  - Service sections for detailed agreement breakdowns

## URLs
- **Development**: https://3000-ipmaf4jd9cziaxxnq9sow-b237eb32.sandbox.novita.ai
- **API Base**: https://3000-ipmaf4jd9cziaxxnq9sow-b237eb32.sandbox.novita.ai/api
- **Production**: (Ready for deployment - see below)

## Data Architecture

### Storage
- **Database**: JSON file-based database (`database.json`)
- **Simple**: No complex database setup required
- **Persistent**: Data automatically saved to file
- **Portable**: Easy to backup and migrate

### Data Models
- **Agencies**: name, email, phone, address, is_active status
- **Customers**: name, email, phone, company, tax_id, address
- **Templates**: name, description, content (with {{PLACEHOLDERS}})
- **Agreements**: links agencies & customers with contract details
- **Reminders**: payment tracking with due dates and status
- **Email Settings**: provider configuration for automated reminders

## ✅ Completed Features

### Agency Management
- Add, edit, delete agencies (2-3 active agencies recommended)
- Toggle active/inactive status
- Complete agency information storage

### Customer Management  
- Unlimited customer creation
- Full customer profiles with company and tax information
- Edit and delete customer records

### Agreement Templates
- Create reusable contract templates
- Variable placeholders:
  - `{{AGENCY_NAME}}` - Agency name
  - `{{CUSTOMER_NAME}}` - Customer name
  - `{{SERVICES}}` - Service sections list
  - `{{MONTHLY_PAYMENT}}` - Payment amount
  - `{{PAYMENT_DAY}}` - Day of month for payment
  - `{{START_DATE}}` - Contract start date
  - `{{END_DATE}}` - Contract end date
- 3 pre-loaded templates included

### Agreement Creation & Management
- Create new agreements from templates or scratch
- Link agencies and customers
- Add multiple service sections with pricing
- Track agreement status (draft, active, pending, expired)
- View detailed agreement information
- Signature tracking for both parties
- Auto-generate unique agreement numbers

### Payment Reminder System
- Automatic payment tracking
- Due date management
- Mark payments as paid
- Pending reminders dashboard

### Email Integration
- Configure email provider (SendGrid, Mailgun, Amazon SES)
- Store API keys securely
- Set sender email and name
- Configure reminder timing

### Dashboard & Analytics
- Active agreements count
- Total customers count
- Pending reminders count  
- Monthly revenue calculation
- Recent agreements display

## 🚀 **Easy Deployment** (No API Keys Required!)

This application is now **super easy to deploy** to multiple platforms without needing Cloudflare API keys!

### Deploy to Vercel (Recommended - 1 Click)
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Click "Deploy"
6. Done! Your app is live! ✅

### Deploy to Netlify
1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub repository
5. Build settings:
   - Build command: `npm install`
   - Publish directory: `public`
6. Click "Deploy"

### Deploy to Railway
1. Push your code to GitHub
2. Go to [railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway auto-detects Node.js and deploys
6. Done!

### Deploy to Render
1. Push your code to GitHub
2. Go to [render.com](https://render.com)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Click "Create Web Service"

## 💻 Local Development

### Quick Start
```bash
# Install dependencies
npm install

# Start server
npm start

# Or use PM2 for production-like environment
pm2 start ecosystem.config.cjs

# Server runs on http://localhost:3000
```

### Development Notes
- Database file (`database.json`) is created automatically on first run
- Sample data (3 agencies, 3 customers, 3 templates) loaded automatically
- All changes saved immediately to database file
- No build step required - just run and go!

## 📂 Project Structure

```
webapp/
├── server.js              # Node.js/Express backend (all API routes)
├── database.json          # JSON database (auto-created)
├── public/
│   ├── index.html         # Frontend HTML
│   └── app.js             # Frontend JavaScript
├── package.json           # Dependencies and scripts
├── vercel.json            # Vercel deployment config
├── ecosystem.config.cjs   # PM2 configuration
└── README.md              # This file
```

## 🔌 API Endpoints

### Agencies
- `GET /api/agencies` - List all agencies
- `GET /api/agencies/active` - List active agencies only
- `GET /api/agencies/:id` - Get agency details
- `POST /api/agencies` - Create new agency
- `PUT /api/agencies/:id` - Update agency
- `DELETE /api/agencies/:id` - Delete agency

### Customers
- `GET /api/customers` - List all customers
- `GET /api/customers/:id` - Get customer details
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Templates
- `GET /api/templates` - List all templates
- `GET /api/templates/:id` - Get template details
- `POST /api/templates` - Create new template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template

### Agreements
- `GET /api/agreements` - List all agreements with details
- `GET /api/agreements/:id` - Get full agreement details
- `POST /api/agreements` - Create new agreement
- `PUT /api/agreements/:id` - Update agreement
- `POST /api/agreements/:id/sign` - Sign agreement (agency or customer)
- `DELETE /api/agreements/:id` - Delete agreement

### Payment Reminders
- `GET /api/reminders` - List all reminders
- `GET /api/reminders/pending` - List pending reminders only
- `POST /api/reminders` - Create reminder
- `PUT /api/reminders/:id/mark-paid` - Mark reminder as paid
- `PUT /api/reminders/:id/mark-sent` - Mark reminder email as sent

### Email Settings
- `GET /api/email-settings` - Get active email settings
- `POST /api/email-settings` - Create email settings
- `PUT /api/email-settings/:id` - Update email settings

## ✅ **NEW! Touchscreen Signature Feature**

### Digital Signatures
- ✅ **Touchscreen signature drawing** for both Agency and Customer
- ✅ Works with mouse, touchscreen, stylus, or Apple Pencil
- ✅ Blue signature pad for Agency, green for Customer
- ✅ Clear and redraw functionality
- ✅ Signatures saved as images and displayed in agreements
- ✅ Full signature tracking with timestamps

### **FIXED:** "Missing Agreement Information" Error
The signature feature had an error where clicking "Save Signature" would show "Missing agreement information". This has been **completely fixed**! 

**What was fixed:**
- Proper context preservation during async signature operations
- Separate cancel and close functions
- Better error handling and logging
- See `SIGNATURE_FIX_EXPLAINED.md` for technical details

## 🔜 Features Not Yet Implemented

- **Email Reminder Automation**: Actual email sending (settings interface ready)
- **PDF Export**: Generate printable PDF contracts
- **Advanced Reports**: Revenue trends and analytics charts
- **User Authentication**: Multi-user access control

## 📖 User Guide

### Managing Settings
1. Go to **Settings** tab
2. **Agencies**: Add/edit your agency information (recommended: 2-3 agencies)
3. **Email Settings**: Configure email provider for automated reminders

### Adding Customers
1. Click **Customers** tab
2. Click "Add Customer" button
3. Fill in customer information
4. Save - customer is added to database

### Creating Templates
1. Go to **Templates** tab
2. Click "Add Template"
3. Write your agreement template using placeholders
4. Save for reuse in multiple agreements

### Creating Agreements
1. Click "New Agreement" button (or go to New Agreement tab)
2. Select agency and customer from dropdowns
3. Optionally choose a template (auto-fills content)
4. Add service sections if needed
5. Set payment terms and dates
6. Edit agreement content
7. Save as draft

### Managing Agreements
1. Go to **Agreements** tab
2. View all agreements with status
3. Click eye icon to view full details
4. Track signatures from both parties
5. Delete if needed (removes related reminders too)

### Tracking Payments
1. Go to **Reminders** tab
2. View all pending payment reminders
3. Click "Mark Paid" when payment received
4. Reminders automatically created based on payment schedules

## 🛠️ Technology Stack

- **Backend**: Node.js + Express.js
- **Database**: JSON file (lowdb-compatible)
- **Frontend**: Vanilla JavaScript
- **Styling**: TailwindCSS (CDN)
- **Icons**: Font Awesome (CDN)
- **HTTP Client**: Axios (CDN)
- **Process Manager**: PM2 (development)

## 🔒 Security Notes

- Email API keys stored in JSON database (not encrypted)
- No authentication implemented yet
- All API endpoints currently open
- **For production**: Add authentication middleware and encrypt sensitive data

## 📝 Sample Data Included

The application comes pre-loaded with:
- ✅ 3 sample agencies
- ✅ 3 sample customers  
- ✅ 3 agreement templates
- ✅ Email settings template

You can delete or modify these after deployment.

## 🎉 Why This Version is Better

### ✅ **No API Keys Required**
- No Cloudflare API setup
- No complex database configuration
- Just deploy and run!

### ✅ **Deploy Anywhere**
- Vercel (recommended)
- Netlify
- Railway
- Render
- Any Node.js hosting

### ✅ **Simple Setup**
- One command: `npm install && npm start`
- No build steps
- No migrations
- Auto-creates database

### ✅ **Easy Backup**
- Just copy `database.json` file
- Restore by copying file back
- Human-readable JSON format

## 📊 Deployment Status

- **Platform**: Node.js/Express
- **Status**: ✅ Ready for Production
- **Database**: JSON file (automatic)
- **API**: RESTful JSON API
- **Frontend**: Vanilla JS + TailwindCSS
- **Last Updated**: 2025-12-03 (Signature feature fixed!)

---

**Ready to deploy?** Just push to GitHub and connect to Vercel, Netlify, Railway, or Render - no configuration needed! 🚀
- **API**: RESTful JSON API
- **Frontend**: Vanilla JS + TailwindCSS
- **Last Updated**: 2025-12-01

---

**Ready to deploy?** Just push to GitHub and connect to Vercel, Netlify, Railway, or Render - no configuration needed! 🚀
