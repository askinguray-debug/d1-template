# 📄 Invoice System Guide

## Overview

The Invoice System allows you to automatically or manually generate invoices for active agreements and send them to customers every month via email.

## Features

### ✅ Completed Features

1. **Invoice Generation**
   - Generate invoices from any active agreement
   - Automatically creates invoice items from agreement services
   - Calculates subtotals, taxes, and totals
   - Tracks billing periods

2. **Monthly Automation**
   - Generate invoices for all active agreements at once
   - Auto-send invoices via email (optional)
   - Prevents duplicate invoices for the same month
   - Configurable send day of the month

3. **Invoice Management**
   - View all invoices with filtering (status, customer)
   - Send invoices via email to customers
   - Mark invoices as paid with payment method tracking
   - Delete invoices
   - Beautiful invoice email template

4. **Settings Configuration**
   - Invoice prefix and starting number
   - Tax name and rate
   - Currency selection (USD, EUR, GBP, TRY)
   - Payment terms (days)
   - Default notes for invoices
   - Auto-send automation toggle

## How to Use

### Access the Invoice System

1. **Login** to your admin panel at: `https://3000-ipmaf4jd9cziaxxnq9sow-b237eb32.sandbox.novita.ai/login`
   - Username: `Recluma`
   - Password: `123123`

2. **Navigate** to invoices at: `https://3000-ipmaf4jd9cziaxxnq9sow-b237eb32.sandbox.novita.ai/invoices.html`

### Generate Monthly Invoices (Manual)

1. Click the **"Generate Monthly Invoices"** button
2. Confirm the action
3. System will:
   - Find all active agreements
   - Check if invoice already exists for current month
   - Generate new invoices for agreements without current month invoice
   - Optionally auto-send emails if enabled in settings

### Generate Invoice from Specific Agreement

**Note**: This feature requires adding a button to the agreements list (coming soon)

You can use the API endpoint directly:
```bash
POST /api/agreements/:id/generate-invoice
```

### Send Invoice via Email

1. Find the invoice in the list
2. Click the **envelope icon** (Send Email)
3. Confirm sending
4. Invoice will be emailed to the customer using Brevo

### Mark Invoice as Paid

1. Find the invoice in the list
2. Click the **check circle icon** (Mark as Paid)
3. Enter payment method (e.g., "Bank Transfer", "Credit Card")
4. Invoice status will update to "Paid"

### Configure Invoice Settings

1. Click the **Settings** button (⚙️)
2. Configure:
   - **Invoice Numbering**: Prefix (e.g., INV) and starting number
   - **Tax Settings**: Tax name (VAT, GST) and rate percentage
   - **Currency & Terms**: Currency and payment terms in days
   - **Automation**: Auto-send toggle and send day of month
   - **Default Notes**: Payment instructions, bank details, etc.
3. Click **Save Settings**

## Invoice Email Template

Invoices are sent with a beautiful, professional HTML email template that includes:

- Gradient purple header with invoice number
- Agency and customer details
- Issue date and due date
- Billing period (for monthly subscriptions)
- Itemized list of services
- Subtotal, tax breakdown, and total
- Status badge (Pending/Paid/Overdue)
- Default notes for payment instructions
- Agency contact information

## API Endpoints

### Get All Invoices
```
GET /api/invoices
Headers: Authorization: Bearer {token}
```

### Get Single Invoice
```
GET /api/invoices/:id
Headers: Authorization: Bearer {token}
```

### Generate Invoice from Agreement
```
POST /api/agreements/:id/generate-invoice
Headers: Authorization: Bearer {token}
Body: {
  "period_start": "2024-12-01",  // Optional
  "period_end": "2024-12-31"      // Optional
}
```

### Send Invoice via Email
```
POST /api/invoices/:id/send
Headers: Authorization: Bearer {token}
```

### Mark Invoice as Paid
```
PUT /api/invoices/:id/mark-paid
Headers: Authorization: Bearer {token}
Body: {
  "payment_method": "Bank Transfer",
  "paid_date": "2024-12-07"  // Optional, defaults to today
}
```

### Generate Monthly Invoices for All Active Agreements
```
POST /api/invoices/generate-monthly
Headers: Authorization: Bearer {token}
```

Response:
```json
{
  "success": true,
  "generated": 5,
  "sent": 5,
  "invoices": [...]
}
```

### Get Invoice Settings
```
GET /api/invoice-settings
Headers: Authorization: Bearer {token}
```

### Update Invoice Settings
```
PUT /api/invoice-settings
Headers: Authorization: Bearer {token}
Body: {
  "invoice_prefix": "INV",
  "invoice_number_start": 1000,
  "tax_name": "VAT",
  "tax_rate": 20,
  "currency": "USD",
  "payment_terms_days": 30,
  "auto_send_enabled": true,
  "send_day_of_month": 1,
  "notes": "Payment terms..."
}
```

## Invoice Status Logic

- **Pending**: Invoice created but not yet paid
- **Overdue**: Pending invoice past due date
- **Paid**: Invoice marked as paid with payment date

## Database Structure

### Invoice Object
```javascript
{
  id: 1,
  invoice_number: "INV-1000",
  agreement_id: 1,
  customer_id: 1,
  issue_date: "2024-12-07",
  due_date: "2025-01-06",
  period_start: "2024-12-01",
  period_end: "2024-12-31",
  items: [
    {
      description: "Monthly Social Media Management",
      details: "Instagram + Facebook content",
      quantity: 1,
      unit_price: 500,
      amount: 500
    }
  ],
  subtotal: 500,
  tax_rate: 20,
  tax_name: "VAT",
  tax_amount: 100,
  total: 600,
  currency: "USD",
  status: "pending",
  paid_date: null,
  payment_method: null,
  notes: "Payment due within 30 days",
  auto_generated: true,
  email_sent: true,
  email_sent_at: "2024-12-07T10:30:00Z",
  created_at: "2024-12-07T10:00:00Z",
  updated_at: "2024-12-07T10:00:00Z"
}
```

### Invoice Settings Object
```javascript
{
  id: 1,
  invoice_prefix: "INV",
  invoice_number_start: 1000,
  tax_rate: 20,
  tax_name: "VAT",
  currency: "USD",
  payment_terms_days: 30,
  auto_send_enabled: false,
  send_day_of_month: 1,
  notes: "Thank you for your business.",
  created_at: "2024-12-07T10:00:00Z",
  updated_at: "2024-12-07T10:00:00Z"
}
```

## Next Steps / Recommendations

1. **Add "Generate Invoice" button** in agreements list
2. **Schedule monthly automation**: Set up a cron job to call `/api/invoices/generate-monthly` on the configured day
3. **Invoice templates**: Allow customization of invoice email template
4. **Payment integration**: Add Stripe/PayPal payment links to invoices
5. **PDF generation**: Generate PDF invoices for download
6. **Invoice reminders**: Send reminder emails for overdue invoices
7. **Reporting**: Add invoice analytics and revenue reports

## Testing

### Test Monthly Invoice Generation

1. Ensure you have at least one active agreement
2. Login to admin panel
3. Navigate to `/invoices.html`
4. Click "Generate Monthly Invoices"
5. Check that invoices were created for all active agreements
6. Verify email was sent if auto-send is enabled

### Test Invoice Email Sending

1. Generate an invoice
2. Click the envelope icon
3. Check customer's email inbox
4. Verify invoice email looks professional
5. Check that sender is `reclumacreative@gmail.com` (Recluma Creative Agency)

## Troubleshooting

### Invoices Not Generating

- Check that agreements have `status: "active"`
- Verify that invoice settings are configured
- Check if invoice already exists for current month

### Emails Not Sending

- Verify Brevo email settings in Settings tab
- Ensure `reclumacreactive@gmail.com` is verified in Brevo
- Check customer email address is valid
- Check PM2 logs: `pm2 logs webapp --nostream`

### Authentication Errors

- Ensure you're logged in
- Check that token is included in Authorization header
- Verify token format: `Authorization: Bearer {token}`

## Support

- **Live App**: https://3000-ipmaf4jd9cziaxxnq9sow-b237eb32.sandbox.novita.ai
- **Invoices UI**: https://3000-ipmaf4jd9cziaxxnq9sow-b237eb32.sandbox.novita.ai/invoices.html
- **GitHub**: https://github.com/askinguray-debug/d1-template
- **Brevo Dashboard**: https://app.brevo.com/logs/transactional

---

**Invoice System Version**: 1.0.0  
**Last Updated**: December 7, 2024  
**Status**: ✅ Fully Functional
