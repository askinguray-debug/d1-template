# 📋 Complete Agreement Management System Documentation

## 🎯 System Overview

**Agreement Management System** is a full-stack web application for managing digital contracts between agencies and customers. It features digital signatures, email automation, multiple agreement types, and comprehensive tracking.

---

## 🌐 Access Information

### Live Application
- **URL**: https://3000-ipmaf4jd9cziaxxnq9sow-b237eb32.sandbox.novita.ai
- **Admin Login**: https://3000-ipmaf4jd9cziaxxnq9sow-b237eb32.sandbox.novita.ai/login
- **Username**: `Recluma`
- **Password**: `123123`

### GitHub Repository
- **URL**: https://github.com/askinguray-debug/d1-template
- **Latest Commit**: 06a72c9

---

## 🏗️ System Architecture

### Technology Stack
- **Backend**: Node.js + Express.js
- **Database**: JSON file-based (database.json)
- **Frontend**: Vanilla JavaScript + TailwindCSS
- **Authentication**: Session-based with tokens
- **Email**: Brevo (Sendinblue) API
- **PDF Generation**: Puppeteer (for print)
- **Signatures**: Signature Pad library

### File Structure
```
webapp/
├── server.js                    # Main backend server
├── database.json                # JSON database (gitignored)
├── public/
│   ├── index.html              # Admin panel UI
│   ├── login.html              # Login page
│   ├── sign.html               # Public signing page (token-based)
│   ├── sign-simple.html        # Direct ID-based signing
│   ├── app.js                  # Frontend JavaScript
│   └── test-share.html         # Testing page for share links
├── package.json                # Dependencies
├── ecosystem.config.cjs        # PM2 configuration
├── .gitignore                  # Git ignore rules
├── README.md                   # Basic documentation
├── BREVO_INTEGRATION_GUIDE.md  # Brevo setup guide
└── BREVO_SENDER_VERIFICATION_FIX.md  # Sender verification help
```

---

## 📊 Database Structure

### Collections (in database.json)

1. **admin** (object)
   - `username`: Admin username
   - `password`: Hashed password
   - `created_at`: Account creation timestamp

2. **agencies** (array)
   - `id`: Unique identifier
   - `name`: Agency name
   - `email`: Contact email
   - `phone`: Phone number
   - `address`: Physical address
   - `is_active`: Active status (boolean)
   - `created_at`: Creation timestamp

3. **customers** (array)
   - `id`: Unique identifier
   - `name`: Customer name
   - `email`: Contact email
   - `phone`: Phone number
   - `company`: Company name
   - `tax_id`: Tax ID number
   - `address`: Physical address
   - `created_at`: Creation timestamp

4. **templates** (array)
   - `id`: Unique identifier
   - `name`: Template name
   - `description`: Template description
   - `content`: Agreement content with placeholders
   - `created_at`: Creation timestamp

5. **modelAgreementTemplates** (array)
   - Same as templates but for model agreements

6. **agreements** (array)
   - `id`: Unique identifier
   - `agreement_number`: Auto-generated unique number
   - `agency_id`: Linked agency ID
   - `customer_id`: Linked customer ID
   - `template_id`: Linked template ID
   - `title`: Agreement title
   - `content`: Agreement content
   - `services`: Array of service items with pricing
   - `monthly_payment`: Total monthly payment
   - `payment_day`: Day of month for payment
   - `start_date`: Contract start date
   - `end_date`: Contract end date
   - `status`: draft|active|pending|expired
   - `agency_signed`: Signature status (0 or 1)
   - `customer_signed`: Signature status (0 or 1)
   - `agency_signature`: Base64 signature image
   - `customer_signature`: Base64 signature image
   - `agency_signed_at`: Signature timestamp
   - `customer_signed_at`: Signature timestamp
   - `downloadToken`: Token for PDF download
   - `created_at`: Creation timestamp
   - `updated_at`: Last update timestamp

7. **modelAgreements** (array)
   - Similar to agreements but for model/cast agreements
   - No pricing/payment fields
   - Additional model-specific fields

8. **projectAgreements** (array)
   - Similar to agreements but for project-based agreements
   - Project-specific fields and pricing

9. **shareTokens** (array)
   - `token`: Cryptographic secure token
   - `agreementId`: Linked agreement ID
   - `agreementType`: regular|model|project
   - `party`: agency|customer
   - `createdAt`: Token creation time
   - `expiresAt`: Token expiry time (30 days)
   - `used`: Boolean usage status

10. **downloadTokens** (array)
    - Similar to shareTokens but for PDF downloads

11. **reminders** (array)
    - `id`: Unique identifier
    - `agreement_id`: Linked agreement ID
    - `due_date`: Payment due date
    - `amount`: Payment amount
    - `status`: pending|paid|sent
    - `sent_at`: Email sent timestamp
    - `paid_at`: Payment received timestamp

12. **emailSettings** (object)
    - `id`: Settings ID
    - `provider`: brevo|gmail|resend|smtp
    - `brevo_api_key`: Brevo API key
    - `brevo_smtp_login`: Brevo SMTP login
    - `from_email`: Sender email address
    - `from_name`: Sender display name
    - `reminder_days_before`: Days before due date to send reminder
    - `created_at`: Creation timestamp
    - `updated_at`: Last update timestamp

13. **serviceLibrary** (array)
    - Pre-defined services for quick addition to agreements

14. **categories** (array)
    - Agreement categories for organization

15. **paymentReminderTemplates** (array)
    - Email templates for payment reminders

---

## 🎨 User Interface - Menu System

### Main Navigation (After Login)

#### 1. **Dashboard** Tab (Home)
**Purpose**: Overview of system metrics

**Displayed Metrics**:
- Total Active Agreements
- Total Customers  
- Pending Payment Reminders
- Total Monthly Revenue

**Recent Agreements List**:
- Shows last 5 agreements
- Displays: Agreement number, customer, status, date
- Quick view button for each

---

#### 2. **New Agreement** Tab
**Purpose**: Create new regular agreements

**Form Sections**:

**A. Basic Information**:
- Agreement Title (required)
- Select Agency (dropdown)
- Select Customer (dropdown)  
- Select Template (optional, auto-fills content)

**B. Agreement Content**:
- Rich text editor
- Template variables available:
  - `{{AGENCY_NAME}}`
  - `{{CUSTOMER_NAME}}`
  - `{{SERVICES}}`
  - `{{MONTHLY_PAYMENT}}`
  - `{{PAYMENT_DAY}}`
  - `{{START_DATE}}`
  - `{{END_DATE}}`

**C. Service Sections**:
- Add multiple service items
- Each service has:
  - Service name
  - Description
  - Price
- Auto-calculates total monthly payment

**D. Payment Terms**:
- Monthly Payment Amount (auto-calculated from services)
- Payment Day (1-31)
- Start Date (date picker)
- End Date (date picker)

**E. Status**:
- Draft (default)
- Active
- Pending
- Expired

**Actions**:
- Save Agreement button
- Clear Form button

---

#### 3. **Agreements** Tab
**Purpose**: View and manage all regular agreements

**Agreement List Display**:
- Agreement Number
- Customer Name  
- Agency Name
- Status Badge (color-coded)
- Created Date
- Action Buttons

**Action Buttons per Agreement**:
1. **View** (eye icon):
   - Opens detailed agreement modal
   - Shows full content
   - Displays signatures if signed
   - Shows all agreement details

2. **Generate Link** (link icon):
   - Creates secure signing link
   - Choose party: Agency or Customer
   - 30-day validity
   - Copy to clipboard or open directly

3. **Send Email** (envelope icon):
   - Opens email sending modal
   - Select recipients
   - Generates and sends agreement with signing links
   - Tracks email sending status

4. **Delete** (trash icon):
   - Confirms deletion
   - Removes agreement and related data

**Agreement Status Colors**:
- 🟢 **Active**: Green badge
- 🟡 **Pending**: Yellow badge
- ⚫ **Draft**: Gray badge
- 🔴 **Expired**: Red badge

---

#### 4. **Model** Tab (Model Agreements)
**Purpose**: Manage cast & modeling agreements

**Features**:
- Similar to regular agreements
- No pricing/payment sections
- Model-specific fields:
  - Commission percentage
  - Image usage rights
  - Contract duration
  - Penalty clauses
  - AI training consent

**Form Sections**:
- Agency Selection
- Model/Customer Selection
- Template Selection
- Agreement Content
- Model-Specific Terms
- Signature Tracking

**Actions**: Same as regular agreements

---

#### 5. **Project** Tab (Project Agreements)
**Purpose**: Manage project-based agreements

**Features**:
- Project-specific pricing structure
- Milestone tracking
- Deliverables listing
- Payment schedule

**Form Sections**:
- Agency Selection
- Customer Selection
- Project Details
- Scope of Work
- Deliverables
- Payment Terms
- Milestones

**Actions**: Same as regular agreements

---

#### 6. **Customers** Tab
**Purpose**: Manage customer database

**Customer List Display**:
- Customer Name
- Email Address
- Company Name
- Phone Number
- Created Date
- Action Buttons

**Actions**:
1. **Add Customer** (top button):
   - Opens customer form modal
   - Fields:
     - Full Name (required)
     - Email (required)
     - Phone
     - Company Name
     - Tax ID
     - Address
   - Save button

2. **Edit Customer** (pencil icon):
   - Opens pre-filled form
   - Update customer information
   - Save changes

3. **Delete Customer** (trash icon):
   - Confirms deletion
   - Checks for linked agreements
   - Prevents deletion if agreements exist

**Search & Filter**:
- Search by name, email, or company
- Sort by name, date, or email

---

#### 7. **Templates** Tab
**Purpose**: Manage agreement templates

**Template List Display**:
- Template Name
- Description
- Template Type (Regular/Model/Project)
- Created Date
- Action Buttons

**Actions**:
1. **Add Template** (top button):
   - Opens template editor
   - Fields:
     - Template Name
     - Description
     - Template Type (dropdown)
     - Content (rich text editor)
   - Available placeholders displayed
   - Save button

2. **Edit Template** (pencil icon):
   - Opens editor with existing content
   - Update and save

3. **Delete Template** (trash icon):
   - Confirms deletion
   - Template removed

**Template Variables**:
- `{{AGENCY_NAME}}` - Agency name
- `{{CUSTOMER_NAME}}` - Customer name
- `{{SERVICES}}` - Service list
- `{{MONTHLY_PAYMENT}}` - Payment amount
- `{{PAYMENT_DAY}}` - Payment day
- `{{START_DATE}}` - Start date
- `{{END_DATE}}` - End date

---

#### 8. **Model Templates** Tab
**Purpose**: Manage model agreement templates

**Features**:
- Similar to regular templates
- Model-specific placeholders
- No pricing variables

---

#### 9. **Settings** Tab
**Purpose**: System configuration

**Settings Sections**:

**A. Email Settings**:
- **Email Provider Selection**:
  - Gmail
  - Resend
  - SendGrid
  - Mailgun
  - Amazon SES
  - Postmark
  - **Brevo (Sendinblue)** ← Currently configured
  - Custom SMTP

- **Brevo Configuration** (currently active):
  - API Key field
  - From Email: `reclumacreative@gmail.com`
  - From Name: `Recluma Creative Agency`
  - Days Before Due Date for Reminders: 3

- **Setup Guides**:
  - Each provider has detailed setup instructions
  - Links to provider dashboards
  - API key generation steps

**B. Admin Password Change**:
- Current Password field
- New Password field
- Confirm Password field
- Change Password button

**Important Notes**:
- Email settings require provider verification
- Brevo sender must be verified at: https://app.brevo.com/settings/senders
- Changes saved immediately

---

## 🔐 Authentication System

### Admin Login Flow

1. **Login Page** (`/login`):
   - Username input
   - Password input
   - Login button
   - Auto-redirects if already logged in

2. **Authentication**:
   - POST `/api/admin/login`
   - Returns auth token
   - Token stored in localStorage
   - Token expires after 1 hour

3. **Protected Routes**:
   - All `/api/*` routes except:
     - `/api/admin/login`
     - `/api/share/:token`
     - `/api/agreements/:id` (public GET)
     - `/api/model-agreements/:id` (public GET)
     - `/api/project-agreements/:id` (public GET)
     - All `/sign` endpoints (public POST)

4. **Session Management**:
   - Token validated on each request
   - Auto-extends session on activity
   - Logout clears token

5. **Logout**:
   - POST `/api/admin/logout`
   - Clears localStorage
   - Redirects to login

---

## 📧 Email System (Brevo Integration)

### Current Status
✅ **Brevo API**: Fully integrated  
✅ **Email Sending**: Working  
⚠️ **Sender Verification**: Required

### Configuration
- **Provider**: Brevo (Sendinblue)
- **API Key**: Configured in database
- **From Email**: `reclumacreative@gmail.com`
- **From Name**: `Recluma Creative Agency`

### Email Types Sent

1. **Agreement Emails**:
   - Subject: "📄 Agreement: [Title] - [Number]"
   - Contains agreement details
   - Includes signing links for unsigned parties
   - Sent to agency and/or customer

2. **Payment Reminders**:
   - Subject: "⏰ Upcoming Payment Reminder - [Title]"
   - Due date notification
   - Payment amount
   - Payment instructions

3. **Overdue Notices**:
   - Subject: "⚠️ Payment Overdue - [Title]"
   - Overdue amount
   - Late fee information
   - Urgent payment request

4. **Service Suspension**:
   - Subject: "🛑 Services Suspended - Payment Required"
   - Suspension notice
   - Payment required
   - Reinstatement terms

### Email Templates
- Stored in `paymentReminderTemplates` collection
- Support dynamic placeholders
- HTML formatted
- Responsive design

### Sending Process

**From Admin Panel**:
1. Navigate to agreement
2. Click "Send Email" button
3. Select recipients (agency/customer/both)
4. System generates signing links if needed
5. Email sent via Brevo API
6. Status tracked in logs

**From API**:
```javascript
POST /api/agreements/:id/send-email
POST /api/model-agreements/:id/send-email
POST /api/project-agreements/:id/send-email

Body: {
  recipients: [{email: "...", type: "customer"}],
  cc: ["optional@email.com"]
}
```

### Brevo Dashboard
- **URL**: https://app.brevo.com/
- **Logs**: https://app.brevo.com/logs/transactional
- **Senders**: https://app.brevo.com/settings/senders

### Important: Sender Verification

**REQUIRED STEP**:
1. Go to https://app.brevo.com/settings/senders
2. Add `reclumacreative@gmail.com`
3. Verify via email link
4. Emails will send successfully

**Without verification**:
- Emails will be rejected
- Error: "Sender not valid"
- Must verify to fix

---

## ✍️ Digital Signature System

### Two Signing Methods

#### Method 1: Token-Based Signing (Recommended)
**URL Format**: `/sign/:token`

**Flow**:
1. Admin generates signing link from agreement
2. Secure token created (30-day validity)
3. Link sent to signer via email/WhatsApp/etc
4. Signer opens link (no login required)
5. Views agreement details
6. Signs using signature pad
7. Token marked as used

**Security**:
- Cryptographically secure tokens
- One-time use
- 30-day expiry
- Party-specific (agency or customer)

#### Method 2: Direct ID-Based Signing
**URL Format**: `/sign-simple.html?id=X&type=Y&party=Z`

**Parameters**:
- `id`: Agreement ID
- `type`: regular|model|project
- `party`: agency|customer

**Flow**:
1. Direct link with parameters
2. No token required
3. Agreement loaded by ID
4. Public signing (no auth)

---

### Signature Pad Features

**Drawing Canvas**:
- Touch-enabled (mobile/tablet)
- Mouse-enabled (desktop)
- Stylus-enabled (Apple Pencil, etc)
- Responsive canvas sizing

**Controls**:
- **Clear**: Erase and redraw
- **Save Signature**: Confirm and save
- **Cancel**: Close without saving

**Color Coding**:
- 🔵 **Agency**: Blue signature pad
- 🟢 **Customer**: Green signature pad

**Storage**:
- Saved as Base64 PNG image
- Stored in agreement record
- Displayed in agreement view
- Included in PDF exports

---

### Signature Workflow

**For Agency**:
1. Admin opens agreement
2. Clicks "Sign as Agency" or uses signing link
3. Draws signature
4. Saves signature
5. `agency_signed` = 1
6. `agency_signature` = Base64 image
7. `agency_signed_at` = timestamp

**For Customer**:
1. Receives signing link via email
2. Opens link (no login)
3. Views agreement
4. Draws signature
5. Saves signature
6. `customer_signed` = 1
7. `customer_signature` = Base64 image
8. `customer_signed_at` = timestamp

**Both Signed**:
- Agreement status can be updated to "Active"
- PDF can be generated with both signatures
- Agreement is legally binding

---

## 🔗 Share Link System

### Generate Link Feature

**Purpose**: Create fresh signing links anytime without resending emails

**Available For**:
- Regular Agreements
- Model Agreements
- Project Agreements

**How to Use**:

1. **From Agreement List**:
   - Click "Generate Link" button (🔗 icon)
   - Modal opens

2. **Select Party**:
   - Agency (for agency representative)
   - Customer/Model (for customer or model)

3. **Get Link**:
   - Secure token generated
   - Link format: `https://domain.com/sign/{token}`
   - Valid for 30 days
   - One-time use

4. **Share Link**:
   - **Copy to Clipboard**: Click copy button
   - **Open Directly**: Click open button (new tab)
   - Share via: Email, WhatsApp, SMS, etc.

### API Endpoints

```javascript
// Generate signing link
POST /api/agreements/:id/generate-link
POST /api/model-agreements/:id/generate-link
POST /api/project-agreements/:id/generate-link

Body: {
  party: "agency" | "customer"
}

Response: {
  success: true,
  link: "https://domain.com/sign/abc123...",
  expiresAt: "2026-01-05T..."
}
```

### Security Features

- **Secure Tokens**: 64-character hexadecimal
- **Expiry**: 30 days from generation
- **One-Time Use**: Token invalidated after signing
- **Party-Specific**: Link tied to specific party
- **Agreement-Specific**: Link tied to specific agreement

### Use Cases

1. **Expired Links**: Generate new link if old one expired
2. **Lost Links**: Create fresh link if original lost
3. **Partial Signing**: Generate separate links for each party
4. **Multi-Channel**: Share same agreement via multiple channels
5. **Resend Without Email**: Share link via WhatsApp, SMS, etc.

---

## 📄 API Reference

### Authentication APIs

```
POST /api/admin/login
Body: { username, password }
Returns: { success, token, username, expiresAt }

POST /api/admin/logout  
Returns: { success }

GET /api/admin/verify
Headers: Authorization: Bearer {token}
Returns: { valid, username }

POST /api/admin/change-password
Headers: Authorization: Bearer {token}
Body: { currentPassword, newPassword }
Returns: { success, message }
```

### Agency APIs

```
GET /api/agencies
Returns: Array of all agencies

GET /api/agencies/active
Returns: Array of active agencies only

GET /api/agencies/:id
Returns: Single agency details

POST /api/agencies
Body: { name, email, phone, address, is_active }
Returns: Created agency

PUT /api/agencies/:id
Body: { name, email, phone, address, is_active }
Returns: Updated agency

DELETE /api/agencies/:id
Returns: { success }
```

### Customer APIs

```
GET /api/customers
Returns: Array of all customers

GET /api/customers/:id
Returns: Single customer details

POST /api/customers
Body: { name, email, phone, company, tax_id, address }
Returns: Created customer

PUT /api/customers/:id
Body: { name, email, phone, company, tax_id, address }
Returns: Updated customer

DELETE /api/customers/:id
Returns: { success }
```

### Agreement APIs

```
GET /api/agreements
Returns: Array of all agreements with details

GET /api/agreements/:id [PUBLIC]
Returns: Full agreement details

POST /api/agreements
Body: { agency_id, customer_id, title, content, services, 
        monthly_payment, payment_day, start_date, end_date, status }
Returns: Created agreement

PUT /api/agreements/:id
Body: { agreement fields }
Returns: Updated agreement

POST /api/agreements/:id/sign [PUBLIC]
Body: { party: "agency"|"customer", signature: "base64..." }
Returns: { success, message }

POST /api/agreements/:id/generate-link
Body: { party: "agency"|"customer" }
Returns: { success, link, expiresAt }

POST /api/agreements/:id/send-email
Body: { recipients: [{email, type}], cc: [] }
Returns: { success, message, recipients }

DELETE /api/agreements/:id
Returns: { success }
```

### Model Agreement APIs
Same structure as Agreement APIs, endpoints start with `/api/model-agreements`

### Project Agreement APIs
Same structure as Agreement APIs, endpoints start with `/api/project-agreements`

### Share Token APIs

```
GET /api/share/:token [PUBLIC]
Returns: Agreement details for signing

POST /api/share/:token/sign [PUBLIC]
Body: { signature: "base64..." }
Returns: { success, message }
```

### Email Settings APIs

```
GET /api/email-settings
Returns: Current email settings

POST /api/email-settings
Body: { provider, api_key/credentials, from_email, from_name }
Returns: Created settings

PUT /api/email-settings/:id
Body: { provider, api_key/credentials, from_email, from_name }
Returns: Updated settings
```

---

## 🎯 User Workflows

### Complete Agreement Workflow

**1. Setup (One-Time)**:
- Admin logs in
- Adds agencies (Settings tab)
- Adds customers (Customers tab)
- Creates templates (Templates tab)
- Configures email (Settings tab)

**2. Create Agreement**:
- Navigate to "New Agreement" tab
- Select agency from dropdown
- Select customer from dropdown
- Choose template (optional)
- Fill in agreement details
- Add services with pricing
- Set payment terms
- Set start/end dates
- Save agreement

**3. Send for Signing**:
- Go to Agreements tab
- Click "Generate Link" on agreement
- Choose party (agency or customer)
- Copy link
- Share via email/WhatsApp/SMS

**4. Customer Signs**:
- Customer receives link
- Opens link in browser (no login)
- Reviews agreement
- Clicks "Sign" button
- Draws signature on pad
- Clicks "Save Signature"
- Agreement marked as customer-signed

**5. Agency Signs**:
- Admin opens agreement
- Clicks "Sign as Agency" or uses link
- Draws signature
- Saves signature
- Agreement marked as agency-signed

**6. Both Signed**:
- Agreement status updated to "Active"
- Both signatures visible in agreement
- PDF can be generated
- Agreement is complete

**7. Send Agreement Copy**:
- Click "Send Email" button
- Select recipients
- Email sent with agreement details
- Both parties receive copy

---

## 🔧 Common Tasks

### Add a New Customer

1. Click **Customers** tab
2. Click **"Add Customer"** button
3. Fill in form:
   - Name (required)
   - Email (required)
   - Phone
   - Company
   - Tax ID
   - Address
4. Click **Save**
5. Customer added to database

### Create Agreement from Template

1. Click **"New Agreement"** tab
2. Select Agency
3. Select Customer
4. Choose Template from dropdown
5. Content auto-fills with template
6. Edit as needed
7. Add services
8. Set payment terms
9. Click **Save Agreement**

### Generate Signing Link

1. Go to **Agreements** tab
2. Find agreement
3. Click **"Generate Link"** (🔗)
4. Select party (Agency/Customer)
5. Click **"Copy Link"**
6. Share via messaging app

### Send Agreement Email

1. Go to agreement
2. Click **"Send Email"** (✉️)
3. Select recipients:
   - Agency
   - Customer
   - Both
   - CC addresses
4. Click **Send**
5. Email sent with signing links

### View Agreement Details

1. Go to **Agreements** tab
2. Click **"View"** (👁️) icon
3. Modal opens with:
   - Full agreement text
   - All details
   - Signatures (if signed)
   - Status information
4. Click **Close** when done

### Update Agreement Status

1. View agreement
2. Edit agreement (pencil icon)
3. Change status dropdown:
   - Draft
   - Active
   - Pending
   - Expired
4. Save changes

---

## 🛡️ Security Considerations

### Current Security

✅ **Implemented**:
- Admin authentication with token
- Session management (1-hour expiry)
- Password hashing (crypto)
- Secure token generation (32-byte random)
- SQL injection prevention (not using SQL)
- XSS protection (basic)

⚠️ **Limitations**:
- Single admin user
- No role-based access control
- Database.json not encrypted
- API keys stored in plain text in database
- No HTTPS enforcement (depends on hosting)

### Best Practices for Production

1. **Use HTTPS**: Always use SSL/TLS
2. **Environment Variables**: Store API keys in .env
3. **Database Encryption**: Encrypt sensitive data
4. **Rate Limiting**: Add rate limits to APIs
5. **Input Validation**: Validate all user inputs
6. **Backup**: Regular database backups
7. **Monitoring**: Log all admin actions
8. **2FA**: Add two-factor authentication

---

## 📊 Database Maintenance

### Backup Database

```bash
# Simple backup
cp database.json database-backup-$(date +%Y%m%d).json

# Or use the ProjectBackup tool
# Creates tar.gz with full project
```

### Restore Database

```bash
# Restore from backup
cp database-backup-20251206.json database.json

# Restart server
pm2 restart webapp
```

### Clear Test Data

```bash
# Edit database.json
# Remove test agreements, customers, etc.
# Keep admin, emailSettings, templates
```

---

## 🚀 Deployment Options

### Current Deployment (Sandbox)
- **Platform**: Development sandbox
- **URL**: https://3000-ipmaf4jd9cziaxxnq9sow-b237eb32.sandbox.novita.ai
- **Purpose**: Testing and development

### Production Deployment Options

**1. Vercel (Recommended)**:
- Easy GitHub integration
- Automatic deployments
- Free tier available
- Good for Node.js apps

**2. Railway**:
- Simple deployment
- PostgreSQL addon available
- Good pricing

**3. Render**:
- Free tier
- Auto-deploy from GitHub
- Good for Express apps

**4. Heroku**:
- Well-documented
- Many addons
- Free tier (limited)

---

## 📞 Support & Help

### Documentation Files

1. **README.md**: Basic system overview
2. **BREVO_INTEGRATION_GUIDE.md**: Brevo setup guide
3. **BREVO_SENDER_VERIFICATION_FIX.md**: Fix sender issues
4. **COMPLETE_SYSTEM_DOCUMENTATION.md**: This file

### Common Issues & Solutions

**Issue**: "Failed to load agreement"
**Solution**: Clear browser cache, regenerate link

**Issue**: "Email not sending"
**Solution**: Verify sender in Brevo dashboard

**Issue**: "Signature not saving"
**Solution**: Ensure JavaScript enabled, try different browser

**Issue**: "Login not working"
**Solution**: Check username/password, clear localStorage

### Getting Help

1. Check documentation files
2. Review PM2 logs: `pm2 logs webapp`
3. Check Brevo dashboard for email issues
4. Verify database.json structure
5. Test API endpoints with curl/Postman

---

## 📈 Future Enhancements

**Planned Features**:
- [ ] Multi-user support with roles
- [ ] Advanced reporting and analytics
- [ ] WhatsApp integration for notifications
- [ ] Automated payment reminders
- [ ] PDF export with signatures
- [ ] Calendar integration
- [ ] Mobile app
- [ ] E-signature compliance (eIDAS, ESIGN)
- [ ] Blockchain verification
- [ ] API webhooks

---

## 📝 Version Information

- **Current Version**: 2.0
- **Last Updated**: 2025-12-06
- **Node.js Version**: 20.19.5
- **Express Version**: 4.x
- **Database Version**: JSON file-based

---

## ✅ System Status Summary

**Working Features** ✅:
- Admin authentication
- Agency management
- Customer management
- Template management
- Agreement creation (3 types)
- Digital signatures
- Share link generation
- Email integration (Brevo)
- Dashboard analytics
- Search and filter

**Known Issues** ⚠️:
- Brevo sender verification required
- PDF generation needs Puppeteer configuration
- No multi-user support yet

**System Health** 🟢:
- Backend: Running
- Database: Operational
- Email: Configured (needs sender verification)
- Authentication: Working
- Signatures: Working

---

**End of Documentation**

For questions or support, refer to the documentation files in the project root or check the GitHub repository.
