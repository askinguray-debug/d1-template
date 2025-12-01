# Agreement Management System

## Project Overview
- **Name**: Agreement Management System
- **Goal**: A comprehensive online agreement application for managing contracts between agencies and customers
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
- **GitHub**: (To be configured)

## Data Architecture

### Database Tables
1. **agencies** - Store 2-3 agency information with active/inactive status
2. **customers** - Unlimited customer records with complete contact information
3. **agreement_templates** - Reusable contract templates with placeholders
4. **agreements** - Main contracts linking agencies and customers
5. **service_sections** - Detailed service breakdowns per agreement
6. **payment_reminders** - Automated payment tracking and reminders
7. **email_settings** - Email provider configuration for reminder system

### Storage Services
- **Cloudflare D1 Database**: SQLite-based relational database for all data storage
- **Local Development**: Uses `--local` flag for development database in `.wrangler/state/v3/d1`

### Data Models
- **Agency**: name, email, phone, address, logo_url, is_active
- **Customer**: name, email, phone, address, company, tax_id
- **Agreement**: agency_id, customer_id, title, content, monthly_payment, payment_day, start_date, end_date, status, signatures
- **Template**: name, description, content (with {{PLACEHOLDERS}})
- **Payment Reminder**: agreement_id, due_date, amount, status, sent_at, paid_at
- **Email Settings**: provider, api_key, from_email, from_name, reminder_days_before

## Currently Completed Features

### ✅ Agency Management
- Add, edit, and delete agencies (up to 2-3 active agencies)
- Toggle active/inactive status
- Store complete agency information (name, email, phone, address)

### ✅ Customer Management
- Unlimited customer creation and storage
- Complete customer profiles with company and tax information
- Edit and delete customer records

### ✅ Agreement Templates
- Create reusable contract templates
- Support for variable placeholders:
  - `{{AGENCY_NAME}}` - Agency name
  - `{{CUSTOMER_NAME}}` - Customer name
  - `{{SERVICES}}` - Service sections list
  - `{{MONTHLY_PAYMENT}}` - Payment amount
  - `{{PAYMENT_DAY}}` - Day of month for payment
  - `{{START_DATE}}` - Contract start date
  - `{{END_DATE}}` - Contract end date
- Pre-loaded templates for common agreements

### ✅ Agreement Creation & Management
- Create new agreements from templates or from scratch
- Link agencies and customers to agreements
- Add multiple service sections with descriptions and pricing
- Track agreement status (draft, active, pending, expired)
- View detailed agreement information
- Delete agreements with cascade deletion of related data

### ✅ Digital Signature System
- Agency signature capture
- Customer signature capture
- Timestamp tracking for both signatures
- Automatic status update to "active" when both parties sign

### ✅ Payment Reminder System
- Automatic tracking of payment reminders
- Due date management
- Mark payments as paid
- Integration with email settings for automated reminders

### ✅ Email Integration Setup
- Configure email provider (SendGrid, Mailgun, Amazon SES)
- Store API keys securely
- Set sender email and name
- Configure reminder timing (days before due date)

### ✅ Dashboard & Analytics
- Active agreements count
- Total customers count
- Pending reminders count
- Monthly revenue calculation
- Recent agreements display

## Features Not Yet Implemented

### 🔜 Email Reminder Automation
- Automatic email sending based on due dates
- Email template customization
- Retry logic for failed emails
- Email delivery status tracking

### 🔜 Advanced Signature Features
- Signature pad drawing interface
- Signature image upload
- Multiple signature types (draw, upload, type)
- Signature verification

### 🔜 Document Generation
- PDF export of agreements
- Printable agreement format
- Document history tracking

### 🔜 Reporting & Analytics
- Revenue reports by date range
- Agreement status breakdown
- Customer activity reports
- Payment history tracking

### 🔜 User Authentication
- Multi-user access control
- Role-based permissions (admin, agent, viewer)
- User activity logging

## Recommended Next Steps

1. **Implement Email Sending**
   - Integrate with SendGrid/Mailgun API
   - Create email templates
   - Add cron job for automatic reminder checks
   - Test email delivery

2. **Add Signature Pad Interface**
   - Integrate signature_pad library (already included)
   - Create signature modal dialogs
   - Save signatures as base64 images
   - Display signatures in agreement view

3. **PDF Generation**
   - Add PDF library (jsPDF or similar)
   - Create PDF templates
   - Export agreements to PDF
   - Add download/print functionality

4. **Enhanced Dashboard**
   - Add charts for revenue trends
   - Calendar view for upcoming payments
   - Activity timeline
   - Quick actions panel

5. **User Authentication**
   - Implement Cloudflare Access or Auth0
   - Add login/logout functionality
   - Protect API routes
   - Add user management interface

## User Guide

### Settings Management
1. **Add Agencies**: Go to Settings → Agencies → Add Agency
2. **Manage Customers**: Go to Customers tab → Add Customer
3. **Configure Email**: Go to Settings → Email Settings

### Creating Agreements
1. Click "New Agreement" button
2. Select agency and customer
3. Choose a template (optional) or write content from scratch
4. Add service sections if needed
5. Set payment terms and dates
6. Save as draft

### Managing Templates
1. Go to Templates tab
2. Click "Add Template"
3. Use placeholders in content ({{AGENCY_NAME}}, etc.)
4. Save template for reuse

### Tracking Payments
1. Go to Reminders tab
2. View pending payment reminders
3. Mark payments as paid when received
4. Email reminders will be sent automatically (when configured)

## API Endpoints

### Agencies
- `GET /api/agencies` - List all agencies
- `GET /api/agencies/active` - List active agencies
- `GET /api/agencies/:id` - Get agency details
- `POST /api/agencies` - Create agency
- `PUT /api/agencies/:id` - Update agency
- `DELETE /api/agencies/:id` - Delete agency

### Customers
- `GET /api/customers` - List all customers
- `GET /api/customers/:id` - Get customer details
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Templates
- `GET /api/templates` - List all templates
- `GET /api/templates/:id` - Get template details
- `POST /api/templates` - Create template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template

### Agreements
- `GET /api/agreements` - List all agreements
- `GET /api/agreements/:id` - Get agreement details with services
- `POST /api/agreements` - Create agreement
- `PUT /api/agreements/:id` - Update agreement
- `POST /api/agreements/:id/sign` - Sign agreement
- `DELETE /api/agreements/:id` - Delete agreement

### Payment Reminders
- `GET /api/reminders` - List all reminders
- `GET /api/reminders/pending` - List pending reminders
- `POST /api/reminders` - Create reminder
- `PUT /api/reminders/:id/mark-paid` - Mark reminder as paid
- `PUT /api/reminders/:id/mark-sent` - Mark reminder email as sent

### Email Settings
- `GET /api/email-settings` - Get active email settings
- `POST /api/email-settings` - Create email settings
- `PUT /api/email-settings/:id` - Update email settings

## Development

### Local Setup
```bash
# Install dependencies
npm install

# Apply database migrations
npm run db:migrate:local

# Seed database with sample data
npm run db:seed

# Build project
npm run build

# Start development server
pm2 start ecosystem.config.cjs

# Test server
npm test
```

### Database Commands
```bash
# Reset database (delete and recreate)
npm run db:reset

# Apply new migrations
npm run db:migrate:local

# Execute SQL command
npx wrangler d1 execute webapp-production --local --command="SELECT * FROM agencies"

# Open database console
npm run db:console:local
```

## Deployment
- **Platform**: Cloudflare Pages
- **Status**: ✅ Active (Development)
- **Tech Stack**: 
  - Backend: Hono + TypeScript
  - Frontend: Vanilla JavaScript + TailwindCSS
  - Database: Cloudflare D1 (SQLite)
  - Icons: Font Awesome
  - HTTP Client: Axios
- **Last Updated**: 2025-12-01

## Technology Stack
- **Framework**: Hono (lightweight web framework)
- **Runtime**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Frontend**: Vanilla JavaScript with TailwindCSS
- **Build Tool**: Vite
- **Process Manager**: PM2 (for development)
- **API Client**: Axios

## Security Notes
- Email API keys are stored in database (production should use Cloudflare secrets)
- No authentication implemented yet - recommended for production
- All API endpoints are currently open - add authorization middleware before production deployment
