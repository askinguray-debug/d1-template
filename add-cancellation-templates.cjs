const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Ensure cancellationTemplates array exists
if (!db.cancellationTemplates) db.cancellationTemplates = [];

// Add default cancellation templates
const templates = [
  {
    id: 1,
    name: 'Model Agreement Cancellation',
    type: 'model',
    subject: 'Notice of Model Agreement Cancellation - {{agreement_number}}',
    content: `Dear {{model_name}},

We regret to inform you that the modeling agreement {{agreement_number}} titled "{{agreement_title}}" has been cancelled.

**Cancellation Details:**
- Agreement Number: {{agreement_number}}
- Original Start Date: {{start_date}}
- Original End Date: {{end_date}}
- Cancellation Date: {{cancellation_date}}
- Cancelled By: {{agency_name}}

**Important Information:**
- All obligations under this agreement are now terminated
- Any scheduled shoots or bookings related to this agreement are cancelled
- Previously approved content may remain in use as per the original agreement terms
- No further compensation will be provided under this agreement

**Next Steps:**
If you have any questions regarding this cancellation or need clarification on the termination of rights and obligations, please contact us at {{agency_email}} or {{agency_phone}}.

We appreciate your professional collaboration and hope to work with you again in the future.

Best regards,
{{agency_name}}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Project Agreement Cancellation',
    type: 'project',
    subject: 'Project Agreement Cancellation Notice - {{agreement_number}}',
    content: `Dear {{model_name}},

This letter serves as formal notification that the project agreement {{agreement_number}} for "{{project_name}}" with {{company_name}} has been cancelled.

**Project Details:**
- Agreement Number: {{agreement_number}}
- Project Name: {{project_name}}
- Company: {{company_name}}
- Original Start Date: {{start_date}}
- Original End Date: {{end_date}}
- Cancellation Date: {{cancellation_date}}

**Cancellation Terms:**
- All project-related work is immediately suspended
- Any materials produced up to the cancellation date remain property of {{company_name}}
- Payment for completed work will be processed according to the original agreement terms
- No further obligations exist for either party beyond this cancellation date

**Outstanding Matters:**
If there are any pending deliverables or payments, please contact our office within 7 business days to arrange final settlement.

Contact Information:
- Email: {{agency_email}}
- Phone: {{agency_phone}}

Thank you for your understanding and cooperation.

Sincerely,
{{agency_name}}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Service Agreement Cancellation',
    type: 'service',
    subject: 'Service Agreement Cancellation - {{agreement_number}}',
    content: `Dear {{customer_name}},

We are writing to formally notify you of the cancellation of service agreement {{agreement_number}} titled "{{agreement_title}}".

**Agreement Information:**
- Agreement Number: {{agreement_number}}
- Agreement Title: {{agreement_title}}
- Client: {{customer_name}}
- {{customer_company}}
- Original Start Date: {{start_date}}
- Original End Date: {{end_date}}
- Cancellation Date: {{cancellation_date}}

**Services Affected:**
All services outlined in the original agreement are now terminated effective immediately. This includes:
- All ongoing service deliverables
- Future scheduled services
- Support and maintenance obligations

**Financial Matters:**
- Invoices for services rendered up to the cancellation date will be issued separately
- Any prepaid services will be prorated and refunded within 30 business days
- Outstanding payments must be settled within 15 business days of this notice

**Data and Materials:**
- All client data will be handled according to our data retention policy
- Project files and materials will be available for download for 30 days
- After 30 days, all materials may be permanently deleted

**Contact Information:**
For questions or concerns regarding this cancellation:
- Email: {{agency_email}}
- Phone: {{agency_phone}}

We appreciate the opportunity to have served you and wish you success in your future endeavors.

Best regards,
{{agency_name}}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    name: 'Customer Agreement Cancellation',
    type: 'customer',
    subject: 'Agreement Cancellation Notice - {{agreement_number}}',
    content: `Dear {{customer_name}},

This letter confirms the cancellation of agreement {{agreement_number}} between {{agency_name}} and {{customer_name}}.

**Cancellation Summary:**
- Agreement Number: {{agreement_number}}
- Agreement Title: {{agreement_title}}
- Client Name: {{customer_name}}
- Company: {{customer_company}}
- Original Agreement Period: {{start_date}} to {{end_date}}
- Effective Cancellation Date: {{cancellation_date}}
- Cancelled By: {{agency_name}}

**Terms of Cancellation:**

1. **Immediate Effect:** All obligations, deliverables, and services under this agreement cease as of the cancellation date.

2. **Payment Terms:**
   - Final invoice for completed work will be issued within 5 business days
   - All outstanding payments must be settled within 15 business days
   - Any deposits or prepayments will be refunded on a prorated basis

3. **Intellectual Property:**
   - Work completed prior to cancellation remains the property of the respective parties as per original agreement
   - Any ongoing work-in-progress reverts to {{agency_name}}
   - License rights for delivered work remain valid as per original terms

4. **Confidentiality:**
   - Confidentiality obligations continue to remain in effect post-cancellation
   - All proprietary information must be returned or destroyed as per agreement terms

5. **Return of Materials:**
   - All client materials in our possession will be returned within 10 business days
   - Digital files will be made available for download for 30 days

**Reason for Cancellation:**
[To be filled as needed or may be removed if not applicable]

**Next Steps:**
Please acknowledge receipt of this cancellation notice by replying to this email within 3 business days. If you have any questions or require clarification on any aspect of this cancellation, please contact us.

**Contact Details:**
- Email: {{agency_email}}
- Phone: {{agency_phone}}

We regret that circumstances have led to this cancellation. We appreciate your business and hope that we may have the opportunity to work together again in the future under different circumstances.

Sincerely,

{{agency_name}}
{{agency_email}}
{{agency_phone}}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Add templates if they don't exist
templates.forEach(template => {
  const exists = db.cancellationTemplates.find(t => t.id === template.id);
  if (!exists) {
    db.cancellationTemplates.push(template);
    console.log(`Added template: ${template.name}`);
  }
});

// Save database
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log('\nCancellation templates added successfully!');
console.log(`Total templates: ${db.cancellationTemplates.length}`);
