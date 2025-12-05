import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { readFile, writeFile } from 'fs/promises';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { Resend } from 'resend';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Universal email sending function - supports both Resend and SMTP
async function sendEmail(emailSettings, { from, to, subject, html, attachments = [] }) {
  try {
    console.log('📧 EMAIL SENDING ATTEMPT:', {
      provider: emailSettings.provider,
      hasApiKey: !!emailSettings.api_key,
      from: from || emailSettings.from_email || 'onboarding@resend.dev',
      to: Array.isArray(to) ? to : [to],
      subject: subject
    });
    
    // Priority 1: Check provider field first (most reliable)
    if (emailSettings.provider === 'resend' && emailSettings.api_key) {
      // Use Resend API with dynamic API key from settings
      const resend = new Resend(emailSettings.api_key);
      const result = await resend.emails.send({
        from: from || emailSettings.from_email || 'onboarding@resend.dev',
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        attachments
      });
      
      console.log('✅ RESEND API RESPONSE:', {
        data: result.data,
        error: result.error,
        id: result.data?.id,
        to: Array.isArray(to) ? to : [to]
      });
      
      // Check if Resend returned an error
      if (result.error) {
        console.error('❌ RESEND API ERROR:', result.error);
        throw new Error(`Resend API Error: ${result.error.message || JSON.stringify(result.error)}`);
      }
      
      if (!result.data || !result.data.id) {
        console.error('❌ RESEND: No email ID returned - email may not have been sent!');
        throw new Error('Resend failed to send email - no ID returned');
      }
      
      console.log('✅ EMAIL SENT SUCCESSFULLY via Resend:', {
        id: result.data.id,
        to: Array.isArray(to) ? to : [to]
      });
      
      return { success: true, provider: 'Resend', emailId: result.data.id };
    }
    // Priority 2: Gmail SMTP
    else if (emailSettings.provider === 'gmail' && emailSettings.gmail_email && emailSettings.gmail_app_password) {
      // Use Gmail SMTP with explicit configuration
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Use STARTTLS
        auth: {
          user: emailSettings.gmail_email,
          pass: emailSettings.gmail_app_password
        },
        tls: {
          rejectUnauthorized: false,
          ciphers: 'SSLv3'
        },
        requireTLS: true
      });
      
      await transporter.sendMail({
        from: from || `"${emailSettings.from_name || 'Fashion Cast Agency'}" <${emailSettings.gmail_email}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        html,
        attachments
      });
      
      return { success: true, provider: 'Gmail' };
    }
    // Priority 3: Custom SMTP
    else if (emailSettings.provider === 'smtp' && emailSettings.smtp_host && emailSettings.smtp_username && emailSettings.smtp_password) {
      // Use SMTP (nodemailer)
      const transporter = nodemailer.createTransport({
        host: emailSettings.smtp_host,
        port: parseInt(emailSettings.smtp_port) || 465,
        secure: emailSettings.smtp_encryption === 'SSL',
        auth: {
          user: emailSettings.smtp_username,
          pass: emailSettings.smtp_password
        },
        tls: {
          rejectUnauthorized: !emailSettings.disable_ssl_verification
        }
      });
      
      await transporter.sendMail({
        from: from || emailSettings.from_email || emailSettings.smtp_username,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        html,
        attachments
      });
      
      return { success: true, provider: 'SMTP' };
    } else {
      // Fallback: Use Resend API with dynamic key or throw error
      if (emailSettings.api_key) {
        const resend = new Resend(emailSettings.api_key);
        await resend.emails.send({
          from: from || 'onboarding@resend.dev',
          to: Array.isArray(to) ? to : [to],
          subject,
          html,
          attachments
        });
        return { success: true, provider: 'Resend (Fallback)' };
      } else {
        throw new Error('No email provider configured. Please configure email settings.');
      }
    }
  } catch (error) {
    console.error('❌ EMAIL SENDING FAILED:', {
      error: error.message,
      stack: error.stack,
      provider: emailSettings.provider,
      hasApiKey: !!emailSettings.api_key
    });
    throw error;
  }
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database file path
const DB_FILE = path.join(__dirname, 'database.json');

// Initialize database
async function initDB() {
  try {
    await readFile(DB_FILE, 'utf8');
  } catch (error) {
    // Create initial database if doesn't exist
    const initialData = {
      agencies: [
        { id: 1, name: 'Creative Agency Ltd', email: 'info@creativeagency.com', phone: '+1-555-0101', address: '123 Business Ave, Suite 100', is_active: 1, created_at: new Date().toISOString() },
        { id: 2, name: 'Digital Solutions Inc', email: 'contact@digitalsolutions.com', phone: '+1-555-0102', address: '456 Tech Plaza, Floor 5', is_active: 1, created_at: new Date().toISOString() },
        { id: 3, name: 'Marketing Pro Agency', email: 'hello@marketingpro.com', phone: '+1-555-0103', address: '789 Marketing Street', is_active: 1, created_at: new Date().toISOString() }
      ],
      customers: [
        { id: 1, name: 'John Smith', email: 'john.smith@example.com', phone: '+1-555-1001', company: 'Smith Enterprises', created_at: new Date().toISOString() },
        { id: 2, name: 'Sarah Johnson', email: 'sarah.j@techcorp.com', phone: '+1-555-1002', company: 'TechCorp LLC', created_at: new Date().toISOString() },
        { id: 3, name: 'Michael Brown', email: 'mbrown@retailco.com', phone: '+1-555-1003', company: 'RetailCo', created_at: new Date().toISOString() }
      ],
      templates: [
        {
          id: 1,
          name: 'Standard Service Agreement',
          description: 'Basic service agreement template',
          content: 'This agreement is entered into between {{AGENCY_NAME}} (hereinafter "Agency") and {{CUSTOMER_NAME}} (hereinafter "Client").\n\nSERVICES: The Agency agrees to provide the following services:\n{{SERVICES}}\n\nPAYMENT TERMS: The Client agrees to pay {{MONTHLY_PAYMENT}} per month, due on the {{PAYMENT_DAY}} day of each month.\n\nTERM: This agreement shall commence on {{START_DATE}} and continue until {{END_DATE}} unless terminated earlier.',
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Digital Marketing Agreement',
          description: 'Agreement for digital marketing services',
          content: 'DIGITAL MARKETING SERVICES AGREEMENT\n\nBetween: {{AGENCY_NAME}}\nAnd: {{CUSTOMER_NAME}}\n\nThe Agency will provide comprehensive digital marketing services including:\n{{SERVICES}}\n\nMonthly Investment: {{MONTHLY_PAYMENT}}\nPayment Schedule: {{PAYMENT_DAY}} of each month\nContract Period: {{START_DATE}} to {{END_DATE}}',
          created_at: new Date().toISOString()
        },
        {
          id: 3,
          name: 'Web Development Agreement',
          description: 'Website development and maintenance agreement',
          content: 'SERVICE AGREEMENT\n\nThis Agreement is made between:\n\nAgency: {{AGENCY_NAME}}\nClient: {{CUSTOMER_NAME}}\n\nAgreement Period: {{START_DATE}} to {{END_DATE}}\n\nSERVICES PROVIDED:\n{{SERVICES}}\n\n{{PAYMENT_TERMS}}\n\nBoth parties agree to the terms and conditions outlined in this agreement.',
          created_at: new Date().toISOString()
        }
      ],
      agreements: [],
      modelAgreements: [],
      projectAgreements: [],
      modelAgreementTemplates: [
        {
          id: 1,
          name: 'Comprehensive Model Registration & Collaboration Agreement',
          description: 'Full Fashion Cast Agency model agreement with all terms',
          content: `FASHION CAST AGENCY

Comprehensive Model Registration & Collaboration Agreement 

This agreement is made between Fashion Cast Agency ("FCA") and the individual signing below ("the Model"). It outlines how the collaboration works, how content is produced and used, and what rights and responsibilities apply to both parties.

⸻

1. Purpose and Overview

FCA helps build your professional presence and connects you with fashion brands, designers, lifestyle companies, and creative teams. We invest in photography, video, and AI-generated visuals to showcase your creative potential.

This is a non-exclusive agreement. The Model may freely work with other agencies or accept independent jobs at any time.

⸻

2. How Our Process Works

2.1 Registration and Promotion

After signing, FCA creates promotional visuals for the Model, including photos, AI-generated composites, and short videos. These are produced at FCA's expense and used to introduce the Model to potential clients.

The Model is not tied exclusively to FCA and may collaborate with others.

2.2 Brand Engagement

When a brand shows interest, FCA contacts the Model with full project details. No project begins without the Model's explicit approval.

2.3 Concept Development

Once the Model and brand agree to proceed, FCA produces draft visuals to preview the collaboration. Final production begins only after both sides fully approve the concept.

2.4 Final Production

FCA produces final campaign visuals and delivers them for approval. Once approved, the content is published on FCA's platforms and/or the brand's platforms.

All approvals are final.

⸻

3. Payment and Commission

FCA does not charge the Model for promotional visuals.
For paid brand campaigns, FCA receives a commission between 15%–20%, depending on the project.

⸻

4. Booking Rules

FCA proposes only jobs that match the Model's personality, comfort level, and goals.
The Model may decline any job. FCA never books the Model without approval.

⸻

5. Image Usage Rights and Ownership

Once the Model approves final campaign visuals, the Model grants FCA and the brand the permanent right to use that content for:
	•	social media
	•	websites
	•	promotional materials
	•	online advertising
	•	lookbooks and digital campaigns

The Model still owns their personal likeness, but the specific approved visuals become permanently licensed and cannot be revoked.

Approved and published content can never be removed unless FCA chooses to do so voluntarily.

⸻

6. Contract Duration and Termination

This agreement is valid for five (5) years from the date of signing.

Either party may terminate the agreement with 30 days' written notice.

Termination does not affect any approved and published content; such content remains permanently in FCA's archive.

⸻

7. Content Permanence and AI Training

All approved visuals may be used permanently by FCA and collaborating brands.
The content may also be used to train FCA's AI systems and to generate new promotional materials.

Published content cannot be edited, restricted, removed, or deleted by the Model.

Only FCA has the right to decide whether content remains online.

⸻

8. Penalty for Leaving the Agency Within First Two Years

The Model is always free to leave FCA.
However, if the Model decides to terminate their membership and leave FCA within the first two (2) years of this agreement, the Model agrees to pay a contractual exit penalty of 5,000 USD.

This penalty compensates FCA for:
	•	portfolio creation
	•	AI training value
	•	promotional investment
	•	brand development work
	•	content production costs

This penalty applies ONLY if the Model chooses to leave FCA within the first 2 years.
It does NOT apply for reporting, blocking, or removing content — because content cannot be removed under any circumstance.

After two years, there is no financial penalty for leaving the agency.

⸻

9. Confidentiality

The Model agrees to keep all unreleased campaigns and brand communication confidential until publicly released. FCA will protect the Model's data securely and respectfully.

⸻

10. Governing Law

This agreement is governed by the laws of the United Republic of Tanzania.

Any disputes will be resolved first through negotiation, then through arbitration or court proceedings in Tanzania if necessary.`,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Basic Model Agreement',
          description: 'Simplified model representation agreement',
          content: `MODEL REPRESENTATION AGREEMENT

Between: {{AGENCY_NAME}} ("Agency")
And: {{CUSTOMER_NAME}} ("Model")

1. REPRESENTATION
The Agency agrees to represent the Model for modeling opportunities. This is a non-exclusive agreement.

2. TERM
Agreement Period: {{START_DATE}} to {{END_DATE}}

3. SERVICES
The Agency will promote the Model to fashion brands, designers, and creative teams.

4. COMMISSION
Agency commission: 15-20% on booked jobs.

5. RIGHTS
All approved campaign content may be used by the Agency and brands for promotional purposes.

6. TERMINATION
Either party may terminate with 30 days written notice.`,
          created_at: new Date().toISOString()
        }
      ],
      reminders: [],
      emailSettings: {
        id: 1,
        provider: 'gmail',
        gmail_email: '',
        gmail_app_password: '',
        from_email: '',
        from_name: 'Fashion Cast Agency',
        reminder_days_before: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      whatsappSettings: {
        enabled: false,
        api_key: '',
        phone_number_id: '',
        business_account_id: '',
        api_version: 'v18.0'
      }
    };
    await writeFile(DB_FILE, JSON.stringify(initialData, null, 2));
  }
}

// Database helpers
async function readDB() {
  const data = await readFile(DB_FILE, 'utf8');
  return JSON.parse(data);
}

async function writeDB(data) {
  await writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

// Helper to get next ID
function getNextId(items) {
  if (!items || items.length === 0) return 1;
  return Math.max(...items.map(item => item.id)) + 1;
}

// ======================
// AGENCIES API
// ======================
app.get('/api/agencies', async (req, res) => {
  const db = await readDB();
  res.json(db.agencies.sort((a, b) => a.name.localeCompare(b.name)));
});

app.get('/api/agencies/active', async (req, res) => {
  const db = await readDB();
  res.json(db.agencies.filter(a => a.is_active).sort((a, b) => a.name.localeCompare(b.name)));
});

app.get('/api/agencies/:id', async (req, res) => {
  const db = await readDB();
  const agency = db.agencies.find(a => a.id === parseInt(req.params.id));
  res.json(agency || {});
});

app.post('/api/agencies', async (req, res) => {
  const db = await readDB();
  const newAgency = {
    id: getNextId(db.agencies),
    ...req.body,
    is_active: req.body.is_active !== undefined ? req.body.is_active : 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  db.agencies.push(newAgency);
  await writeDB(db);
  res.json(newAgency);
});

app.put('/api/agencies/:id', async (req, res) => {
  const db = await readDB();
  const index = db.agencies.findIndex(a => a.id === parseInt(req.params.id));
  if (index !== -1) {
    db.agencies[index] = {
      ...db.agencies[index],
      ...req.body,
      id: parseInt(req.params.id),
      updated_at: new Date().toISOString()
    };
    await writeDB(db);
    res.json(db.agencies[index]);
  } else {
    res.status(404).json({ error: 'Agency not found' });
  }
});

app.delete('/api/agencies/:id', async (req, res) => {
  const db = await readDB();
  db.agencies = db.agencies.filter(a => a.id !== parseInt(req.params.id));
  await writeDB(db);
  res.json({ success: true });
});

// ======================
// CUSTOMERS API
// ======================
app.get('/api/customers', async (req, res) => {
  const db = await readDB();
  res.json(db.customers.sort((a, b) => a.name.localeCompare(b.name)));
});

app.get('/api/customers/:id', async (req, res) => {
  const db = await readDB();
  const customer = db.customers.find(c => c.id === parseInt(req.params.id));
  res.json(customer || {});
});

app.post('/api/customers', async (req, res) => {
  const db = await readDB();
  const newCustomer = {
    id: getNextId(db.customers),
    ...req.body,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  db.customers.push(newCustomer);
  await writeDB(db);
  res.json(newCustomer);
});

app.put('/api/customers/:id', async (req, res) => {
  const db = await readDB();
  const index = db.customers.findIndex(c => c.id === parseInt(req.params.id));
  if (index !== -1) {
    db.customers[index] = {
      ...db.customers[index],
      ...req.body,
      id: parseInt(req.params.id),
      updated_at: new Date().toISOString()
    };
    await writeDB(db);
    res.json(db.customers[index]);
  } else {
    res.status(404).json({ error: 'Customer not found' });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  const db = await readDB();
  db.customers = db.customers.filter(c => c.id !== parseInt(req.params.id));
  await writeDB(db);
  res.json({ success: true });
});

// ======================
// TEMPLATES API
// ======================
app.get('/api/templates', async (req, res) => {
  const db = await readDB();
  res.json(db.templates.sort((a, b) => a.name.localeCompare(b.name)));
});

app.get('/api/templates/:id', async (req, res) => {
  const db = await readDB();
  const template = db.templates.find(t => t.id === parseInt(req.params.id));
  res.json(template || {});
});

app.post('/api/templates', async (req, res) => {
  const db = await readDB();
  const newTemplate = {
    id: getNextId(db.templates),
    ...req.body,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  db.templates.push(newTemplate);
  await writeDB(db);
  res.json(newTemplate);
});

app.put('/api/templates/:id', async (req, res) => {
  const db = await readDB();
  const index = db.templates.findIndex(t => t.id === parseInt(req.params.id));
  if (index !== -1) {
    db.templates[index] = {
      ...db.templates[index],
      ...req.body,
      id: parseInt(req.params.id),
      updated_at: new Date().toISOString()
    };
    await writeDB(db);
    res.json(db.templates[index]);
  } else {
    res.status(404).json({ error: 'Template not found' });
  }
});

app.delete('/api/templates/:id', async (req, res) => {
  const db = await readDB();
  db.templates = db.templates.filter(t => t.id !== parseInt(req.params.id));
  await writeDB(db);
  res.json({ success: true });
});

// ======================
// MODEL AGREEMENT TEMPLATES API
// ======================
app.get('/api/model-templates', async (req, res) => {
  const db = await readDB();
  if (!db.modelAgreementTemplates) db.modelAgreementTemplates = [];
  res.json(db.modelAgreementTemplates.sort((a, b) => a.name.localeCompare(b.name)));
});

app.get('/api/model-templates/:id', async (req, res) => {
  const db = await readDB();
  if (!db.modelAgreementTemplates) db.modelAgreementTemplates = [];
  const template = db.modelAgreementTemplates.find(t => t.id === parseInt(req.params.id));
  res.json(template || {});
});

app.post('/api/model-templates', async (req, res) => {
  const db = await readDB();
  if (!db.modelAgreementTemplates) db.modelAgreementTemplates = [];
  const newTemplate = {
    id: getNextId(db.modelAgreementTemplates),
    ...req.body,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  db.modelAgreementTemplates.push(newTemplate);
  await writeDB(db);
  res.json(newTemplate);
});

app.put('/api/model-templates/:id', async (req, res) => {
  const db = await readDB();
  if (!db.modelAgreementTemplates) db.modelAgreementTemplates = [];
  const index = db.modelAgreementTemplates.findIndex(t => t.id === parseInt(req.params.id));
  if (index !== -1) {
    db.modelAgreementTemplates[index] = {
      ...db.modelAgreementTemplates[index],
      ...req.body,
      id: parseInt(req.params.id),
      updated_at: new Date().toISOString()
    };
    await writeDB(db);
    res.json(db.modelAgreementTemplates[index]);
  } else {
    res.status(404).json({ error: 'Model Template not found' });
  }
});

app.delete('/api/model-templates/:id', async (req, res) => {
  const db = await readDB();
  if (!db.modelAgreementTemplates) db.modelAgreementTemplates = [];
  db.modelAgreementTemplates = db.modelAgreementTemplates.filter(t => t.id !== parseInt(req.params.id));
  await writeDB(db);
  res.json({ success: true });
});

// ======================
// AGREEMENTS API
// ======================
app.get('/api/agreements', async (req, res) => {
  const db = await readDB();
  const agreementsWithDetails = db.agreements.map(agreement => {
    const agency = db.agencies.find(a => a.id === agreement.agency_id);
    const customer = db.customers.find(c => c.id === agreement.customer_id);
    return {
      ...agreement,
      agency_name: agency?.name || '',
      customer_name: customer?.name || '',
      customer_email: customer?.email || ''
    };
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json(agreementsWithDetails);
});

app.get('/api/agreements/:id', async (req, res) => {
  const db = await readDB();
  const agreement = db.agreements.find(a => a.id === parseInt(req.params.id));
  if (!agreement) {
    return res.json({});
  }
  const agency = db.agencies.find(a => a.id === agreement.agency_id);
  const customer = db.customers.find(c => c.id === agreement.customer_id);
  res.json({
    ...agreement,
    agency_name: agency?.name || '',
    agency_email: agency?.email || '',
    agency_address: agency?.address || '',
    customer_name: customer?.name || '',
    customer_email: customer?.email || '',
    customer_company: customer?.company || ''
  });
});

app.post('/api/agreements', async (req, res) => {
  const db = await readDB();
  const agreementNumber = `AGR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const newAgreement = {
    id: getNextId(db.agreements),
    agreement_number: agreementNumber,
    ...req.body,
    status: req.body.status || 'draft',
    agency_signed: 0,
    customer_signed: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  db.agreements.push(newAgreement);
  await writeDB(db);
  res.json(newAgreement);
});

app.put('/api/agreements/:id', async (req, res) => {
  const db = await readDB();
  const index = db.agreements.findIndex(a => a.id === parseInt(req.params.id));
  if (index !== -1) {
    db.agreements[index] = {
      ...db.agreements[index],
      ...req.body,
      id: parseInt(req.params.id),
      updated_at: new Date().toISOString()
    };
    await writeDB(db);
    res.json(db.agreements[index]);
  } else {
    res.status(404).json({ error: 'Agreement not found' });
  }
});

app.post('/api/agreements/:id/sign', async (req, res) => {
  const db = await readDB();
  const index = db.agreements.findIndex(a => a.id === parseInt(req.params.id));
  if (index !== -1) {
    if (req.body.party === 'agency') {
      db.agreements[index].agency_signed = 1;
      db.agreements[index].agency_signature = req.body.signature;
      db.agreements[index].agency_signed_at = new Date().toISOString();
      // Check if customer already signed, if so, activate agreement
      if (db.agreements[index].customer_signed) {
        db.agreements[index].status = 'active';
      }
    } else if (req.body.party === 'customer') {
      db.agreements[index].customer_signed = 1;
      db.agreements[index].customer_signature = req.body.signature;
      db.agreements[index].customer_signed_at = new Date().toISOString();
      // Check if agency already signed, if so, activate agreement
      if (db.agreements[index].agency_signed) {
        db.agreements[index].status = 'active';
      }
    }
    await writeDB(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Agreement not found' });
  }
});

app.delete('/api/agreements/:id', async (req, res) => {
  const db = await readDB();
  db.agreements = db.agreements.filter(a => a.id !== parseInt(req.params.id));
  db.reminders = db.reminders.filter(r => r.agreement_id !== parseInt(req.params.id));
  await writeDB(db);
  res.json({ success: true });
});

// ======================
// GENERATE SIGNATURE LINKS
// Generate signature link for regular agreement
app.post('/api/agreements/:id/generate-link', async (req, res) => {
  try {
    const { party } = req.body;
    const db = await readDB();
    const agreement = db.agreements.find(a => a.id === parseInt(req.params.id));
    
    if (!agreement) {
      return res.status(404).json({ error: 'Agreement not found' });
    }
    
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    if (!db.shareTokens) db.shareTokens = [];
    db.shareTokens.push({
      token,
      agreementId: agreement.id,
      agreementType: 'regular',
      party,
      createdAt: new Date().toISOString(),
      expiresAt,
      used: false
    });
    
    await writeDB(db);
    
    const host = req.get('x-forwarded-host') || req.get('host');
    const protocol = req.get('x-forwarded-proto') || req.protocol;
    const link = `${protocol}://${host}/sign/${token}`;
    
    res.json({ success: true, link, expiresAt });
  } catch (error) {
    console.error('Error generating link:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/model-agreements/:id/generate-link', async (req, res) => {
  try {
    const { party } = req.body;
    const db = await readDB();
    const agreement = db.modelAgreements.find(a => a.id === parseInt(req.params.id));
    
    if (!agreement) {
      return res.status(404).json({ error: 'Agreement not found' });
    }
    
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    if (!db.shareTokens) db.shareTokens = [];
    db.shareTokens.push({
      token,
      agreementId: agreement.id,
      agreementType: 'model',
      party,
      createdAt: new Date().toISOString(),
      expiresAt,
      used: false
    });
    
    await writeDB(db);
    
    const host = req.get('x-forwarded-host') || req.get('host');
    const protocol = req.get('x-forwarded-proto') || req.protocol;
    const link = `${protocol}://${host}/sign/${token}`;
    
    res.json({ success: true, link, expiresAt });
  } catch (error) {
    console.error('Error generating link:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/project-agreements/:id/generate-link', async (req, res) => {
  try {
    const { party } = req.body;
    const db = await readDB();
    const agreement = db.projectAgreements.find(a => a.id === parseInt(req.params.id));
    
    if (!agreement) {
      return res.status(404).json({ error: 'Agreement not found' });
    }
    
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    if (!db.shareTokens) db.shareTokens = [];
    db.shareTokens.push({
      token,
      agreementId: agreement.id,
      agreementType: 'project',
      party,
      createdAt: new Date().toISOString(),
      expiresAt,
      used: false
    });
    
    await writeDB(db);
    
    const host = req.get('x-forwarded-host') || req.get('host');
    const protocol = req.get('x-forwarded-proto') || req.protocol;
    const link = `${protocol}://${host}/sign/${token}`;
    
    res.json({ success: true, link, expiresAt });
  } catch (error) {
    console.error('Error generating link:', error);
    res.status(500).json({ error: error.message });
  }
});

// MODEL AGREEMENTS API (Cast & Modeling - No Pricing)
// ======================
app.get('/api/model-agreements', async (req, res) => {
  const db = await readDB();
  if (!db.modelAgreements) db.modelAgreements = [];
  const agreementsWithDetails = db.modelAgreements.map(agreement => {
    const agency = db.agencies.find(a => a.id === agreement.agency_id);
    const customer = db.customers.find(c => c.id === agreement.customer_id);
    return {
      ...agreement,
      agency_name: agency?.name || '',
      customer_name: customer?.name || '',
      customer_email: customer?.email || ''
    };
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json(agreementsWithDetails);
});

app.get('/api/model-agreements/:id', async (req, res) => {
  const db = await readDB();
  if (!db.modelAgreements) db.modelAgreements = [];
  const agreement = db.modelAgreements.find(a => a.id === parseInt(req.params.id));
  if (!agreement) {
    return res.json({});
  }
  const agency = db.agencies.find(a => a.id === agreement.agency_id);
  const customer = db.customers.find(c => c.id === agreement.customer_id);
  res.json({
    ...agreement,
    agency_name: agency?.name || '',
    agency_email: agency?.email || '',
    agency_address: agency?.address || '',
    customer_name: customer?.name || '',
    customer_email: customer?.email || '',
    customer_company: customer?.company || ''
  });
});

app.post('/api/model-agreements', async (req, res) => {
  const db = await readDB();
  if (!db.modelAgreements) db.modelAgreements = [];
  const agreementNumber = `MODEL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const newAgreement = {
    id: getNextId(db.modelAgreements),
    agreement_number: agreementNumber,
    ...req.body,
    status: req.body.status || 'draft',
    agency_signed: 0,
    customer_signed: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  db.modelAgreements.push(newAgreement);
  await writeDB(db);
  res.json(newAgreement);
});

app.put('/api/model-agreements/:id', async (req, res) => {
  const db = await readDB();
  if (!db.modelAgreements) db.modelAgreements = [];
  const index = db.modelAgreements.findIndex(a => a.id === parseInt(req.params.id));
  if (index !== -1) {
    db.modelAgreements[index] = {
      ...db.modelAgreements[index],
      ...req.body,
      id: parseInt(req.params.id),
      updated_at: new Date().toISOString()
    };
    await writeDB(db);
    res.json(db.modelAgreements[index]);
  } else {
    res.status(404).json({ error: 'Model Agreement not found' });
  }
});

app.post('/api/model-agreements/:id/sign', async (req, res) => {
  const db = await readDB();
  if (!db.modelAgreements) db.modelAgreements = [];
  const index = db.modelAgreements.findIndex(a => a.id === parseInt(req.params.id));
  if (index !== -1) {
    if (req.body.party === 'agency') {
      db.modelAgreements[index].agency_signed = 1;
      db.modelAgreements[index].agency_signature = req.body.signature;
      db.modelAgreements[index].agency_signed_at = new Date().toISOString();
    } else if (req.body.party === 'customer') {
      db.modelAgreements[index].customer_signed = 1;
      db.modelAgreements[index].customer_signature = req.body.signature;
      db.modelAgreements[index].customer_signed_at = new Date().toISOString();
    }
    if (db.modelAgreements[index].agency_signed && db.modelAgreements[index].customer_signed) {
      db.modelAgreements[index].status = 'active';
    }
    await writeDB(db);
    res.json(db.modelAgreements[index]);
  } else {
    res.status(404).json({ error: 'Model Agreement not found' });
  }
});

app.delete('/api/model-agreements/:id', async (req, res) => {
  const db = await readDB();
  if (!db.modelAgreements) db.modelAgreements = [];
  db.modelAgreements = db.modelAgreements.filter(a => a.id !== parseInt(req.params.id));
  await writeDB(db);
  res.json({ success: true });
});

// Model Agreement Print (No pricing information)
app.get('/api/model-agreements/:id/print', async (req, res) => {
  const db = await readDB();
  if (!db.modelAgreements) db.modelAgreements = [];
  const agreement = db.modelAgreements.find(a => a.id === parseInt(req.params.id));
  if (!agreement) {
    return res.status(404).send('Model Agreement not found');
  }
  const agency = db.agencies.find(a => a.id === agreement.agency_id);
  const customer = db.customers.find(c => c.id === agreement.customer_id);
  
  const html = generateModelAgreementHTML(agreement, agency, customer);
  res.send(html);
});

// Model Agreement Email Sending
app.post('/api/model-agreements/:id/send-email', async (req, res) => {
  try {
    const db = await readDB();
    if (!db.modelAgreements) db.modelAgreements = [];
    const agreement = db.modelAgreements.find(a => a.id === parseInt(req.params.id));
    if (!agreement) {
      return res.status(404).json({ error: 'Model Agreement not found' });
    }
    
    const agency = db.agencies.find(a => a.id === agreement.agency_id);
    const customer = db.customers.find(c => c.id === agreement.customer_id);
    let { recipients, cc } = req.body;
    
    const emailSettings = db.emailSettings || {};
    
    // Ensure download token exists for agreement preview
    if (!agreement.downloadToken) {
      const downloadToken = crypto.randomBytes(32).toString('hex');
      if (!db.downloadTokens) db.downloadTokens = [];
      
      db.downloadTokens.push({
        token: downloadToken,
        agreementId: agreement.id,
        agreementType: 'model',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      });
      
      agreement.downloadToken = downloadToken;
      await writeDB(db);
    }
    
    // Support both new array format and old recipient format
    if (!recipients || !Array.isArray(recipients)) {
      const { recipient } = req.body;
      recipients = [];
      if (recipient === 'agency' || recipient === 'both') recipients.push(agency.email);
      if (recipient === 'customer' || recipient === 'both') recipients.push(customer.email);
    }
    
    // Add CC addresses to recipients
    if (cc && Array.isArray(cc)) {
      recipients = [...recipients, ...cc];
    } else if (cc && typeof cc === 'string') {
      recipients.push(cc);
    }
    
    // Validate recipients
    if (!recipients || recipients.length === 0) {
      return res.status(400).json({ error: 'At least one recipient email is required' });
    }
    
    // Generate share links for unsigned parties
    // Use X-Forwarded headers if available (for proxied requests)
    const host = req.get('x-forwarded-host') || req.get('host');
    const protocol = req.get('x-forwarded-proto') || req.protocol;
    const baseUrl = `${protocol}://${host}`;
    let agencyShareLink = '';
    let customerShareLink = '';
    
    if (!agreement.agency_signed) {
      // Generate or find existing agency share link
      if (!db.shareTokens) db.shareTokens = [];
      let agencyToken = db.shareTokens.find(t => 
        t.agreementId === agreement.id && 
        t.agreementType === 'model' && 
        t.party === 'agency' && 
        !t.used && 
        new Date(t.expiresAt) > new Date()
      );
      
      if (!agencyToken) {
        const token = crypto.randomBytes(32).toString('hex');
        agencyToken = {
          token,
          agreementId: agreement.id,
          agreementType: 'model',
          party: 'agency',
          used: false,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };
        db.shareTokens.push(agencyToken);
        await writeDB(db);
      }
      agencyShareLink = `${baseUrl}/sign/${agencyToken.token}`;
    }
    
    if (!agreement.customer_signed) {
      // Generate or find existing customer share link
      if (!db.shareTokens) db.shareTokens = [];
      let customerToken = db.shareTokens.find(t => 
        t.agreementId === agreement.id && 
        t.agreementType === 'model' && 
        t.party === 'customer' && 
        !t.used && 
        new Date(t.expiresAt) > new Date()
      );
      
      if (!customerToken) {
        const token = crypto.randomBytes(32).toString('hex');
        customerToken = {
          token,
          agreementId: agreement.id,
          agreementType: 'model',
          party: 'customer',
          used: false,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };
        db.shareTokens.push(customerToken);
        await writeDB(db);
      }
      customerShareLink = `${baseUrl}/sign/${customerToken.token}`;
    }
    
    // Build signature status section
    let signatureSection = '<div style="margin: 20px 0; padding: 20px; background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 8px;">';
    signatureSection += '<h3 style="color: #059669; margin-top: 0;">📝 Signature Status</h3>';
    
    if (agreement.agency_signed && agreement.customer_signed) {
      signatureSection += '<p style="color: #059669;"><strong>✅ Fully Signed</strong> - This agreement has been signed by both parties.</p>';
    } else {
      signatureSection += '<p><strong>Pending Signatures:</strong></p><ul style="list-style: none; padding-left: 0;">';
      
      if (!agreement.agency_signed && agencyShareLink) {
        signatureSection += `
          <li style="margin: 10px 0;">
            🏢 <strong>Agency (${agency.name}):</strong> Awaiting signature<br>
            <a href="${agencyShareLink}" style="display: inline-block; margin-top: 8px; padding: 10px 20px; background-color: #8b5cf6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Click Here to Sign as Agency
            </a>
          </li>
        `;
      }
      
      if (!agreement.customer_signed && customerShareLink) {
        signatureSection += `
          <li style="margin: 10px 0;">
            👤 <strong>Model (${customer.name}):</strong> Awaiting signature<br>
            <a href="${customerShareLink}" style="display: inline-block; margin-top: 8px; padding: 10px 20px; background-color: #8b5cf6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Click Here to Sign as Model
            </a>
          </li>
        `;
      }
      
      signatureSection += '</ul>';
    }
    signatureSection += '</div>';
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #8b5cf6;">📄 Cast & Modeling Agreement</h2>
        <p>Dear Recipient,</p>
        <p>Please review the model agreement details below and use the signature link to sign digitally.</p>
        
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Agreement Number:</strong> ${agreement.agreement_number}</p>
          <p><strong>Title:</strong> ${agreement.title}</p>
          <p><strong>Agency:</strong> ${agency.name}</p>
          <p><strong>Model:</strong> ${customer.name}</p>
          <p><strong>Start Date:</strong> ${new Date(agreement.start_date).toLocaleDateString()}</p>
          <p><strong>End Date:</strong> ${new Date(agreement.end_date).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${agreement.status.toUpperCase()}</p>
        </div>
        
        ${signatureSection}
        
        <div style="margin: 20px 0; padding: 15px; background-color: #e0f2fe; border-left: 4px solid #0284c7; border-radius: 8px;">
          <p style="margin: 0; color: #075985;"><strong>📄 View Full Agreement</strong></p>
          <p style="margin: 10px 0; font-size: 13px; color: #0c4a6e;">
            Click below to view the complete agreement document with all terms and conditions:
          </p>
          <a href="${baseUrl}/download/${agreement.downloadToken || 'temp'}" 
             style="display: inline-block; margin: 10px 0; padding: 10px 20px; background-color: #0284c7; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
            📄 View Full Agreement Document
          </a>
        </div>
        
        <div style="margin: 20px 0; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px;">
          <p style="margin: 0; color: #92400e;"><strong>⚠️ AI-Generated Content Notice:</strong></p>
          <p style="margin: 5px 0 0 0; font-size: 13px; color: #78350f;">
            This model agreement may involve projects that utilize AI-generated content. 
            By signing, the model acknowledges and consents to the potential use of their likeness 
            in AI-generated materials as outlined in the agreement terms.
          </p>
        </div>
        
        <p style="margin-top: 30px;">Best regards,<br>${emailSettings.from_name || 'Fashion Cast Agency'}</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          This email was sent from the Agreement Management System. 
          ${(!agreement.agency_signed || !agreement.customer_signed) ? 'Signature links are valid for 30 days and can only be used once.' : ''}
        </p>
      </div>
    `;
    
    // Skip PDF generation for faster email sending
    let attachments = [];
    
    // DISABLED: PDF attachment (too slow in sandbox, users can view via link)
    // try {
    //   const pdfHTML = generateModelAgreementHTML(agreement, agency, customer, true);
    //   const pdfBuffer = await generatePDFBuffer(pdfHTML);
    //   attachments = [{
    //     filename: `Model_Agreement_${agreement.agreement_number}.pdf`,
    //     content: pdfBuffer
    //   }];
    // } catch (pdfError) {
    //   console.error('PDF generation failed:', pdfError.message);
    // }
    
    // Send email with or without PDF attachment using universal email function
    await sendEmail(emailSettings, {
      from: emailSettings.from_email || 'onboarding@resend.dev',
      to: recipients,
      subject: `📄 Cast & Modeling Agreement - ${agreement.agreement_number}`,
      html: emailContent,
      attachments: attachments
    });
    
    const pdfStatus = attachments.length > 0 ? 'with PDF attachment' : '(PDF generation unavailable)';
    res.json({ success: true, message: `Email sent successfully ${pdfStatus} and signature links` });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ======================
// PROJECT AGREEMENTS API (Brand Projects - Permanent Rights)
// ======================

// Get all project agreements
app.get('/api/project-agreements', async (req, res) => {
  const db = await readDB();
  if (!db.projectAgreements) db.projectAgreements = [];
  res.json(db.projectAgreements);
});

// Get single project agreement
app.get('/api/project-agreements/:id', async (req, res) => {
  const db = await readDB();
  if (!db.projectAgreements) db.projectAgreements = [];
  const agreement = db.projectAgreements.find(a => a.id === parseInt(req.params.id));
  if (!agreement) {
    return res.status(404).json({ error: 'Project Agreement not found' });
  }
  res.json(agreement);
});

// Create project agreement
app.post('/api/project-agreements', async (req, res) => {
  try {
    const db = await readDB();
    if (!db.projectAgreements) db.projectAgreements = [];
    
    const { agency_id, model_id, project_name, company_name, platforms, content_types, description } = req.body;
    
    const newAgreement = {
      id: db.projectAgreements.length > 0 ? Math.max(...db.projectAgreements.map(a => a.id)) + 1 : 1,
      agreement_number: `PROJ-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      agency_id: parseInt(agency_id),
      model_id: parseInt(model_id),
      project_name,
      company_name,
      platforms: platforms || [],
      content_types: content_types || [],
      description,
      title: `${project_name} - ${company_name}`,
      status: 'draft',
      agency_signed: false,
      customer_signed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Generate agreement content
    const agency = db.agencies.find(a => a.id === newAgreement.agency_id);
    const model = db.customers.find(c => c.id === newAgreement.model_id);
    
    newAgreement.content = generateProjectAgreementContent(newAgreement, agency, model);
    
    db.projectAgreements.push(newAgreement);
    await writeDB(db);
    
    res.json(newAgreement);
  } catch (error) {
    console.error('Error creating project agreement:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update project agreement
app.put('/api/project-agreements/:id', async (req, res) => {
  try {
    const db = await readDB();
    if (!db.projectAgreements) db.projectAgreements = [];
    
    const index = db.projectAgreements.findIndex(a => a.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ error: 'Project Agreement not found' });
    }
    
    db.projectAgreements[index] = {
      ...db.projectAgreements[index],
      ...req.body,
      updated_at: new Date().toISOString()
    };
    
    await writeDB(db);
    res.json(db.projectAgreements[index]);
  } catch (error) {
    console.error('Error updating project agreement:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete project agreement
app.delete('/api/project-agreements/:id', async (req, res) => {
  try {
    const db = await readDB();
    if (!db.projectAgreements) db.projectAgreements = [];
    
    const index = db.projectAgreements.findIndex(a => a.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ error: 'Project Agreement not found' });
    }
    
    db.projectAgreements.splice(index, 1);
    await writeDB(db);
    
    res.json({ success: true, message: 'Project agreement deleted successfully' });
  } catch (error) {
    console.error('Error deleting project agreement:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sign project agreement
app.post('/api/project-agreements/:id/sign', async (req, res) => {
  try {
    const db = await readDB();
    if (!db.projectAgreements) db.projectAgreements = [];
    
    const agreement = db.projectAgreements.find(a => a.id === parseInt(req.params.id));
    if (!agreement) {
      return res.status(404).json({ error: 'Project Agreement not found' });
    }
    
    const { party, signature } = req.body;
    
    if (party === 'agency') {
      agreement.agency_signed = true;
      agreement.agency_signature = signature;
      agreement.agency_signed_date = new Date().toISOString();
    } else if (party === 'customer') {
      agreement.customer_signed = true;
      agreement.customer_signature = signature;
      agreement.customer_signed_date = new Date().toISOString();
    }
    
    if (agreement.agency_signed && agreement.customer_signed) {
      agreement.status = 'active';
    }
    
    agreement.updated_at = new Date().toISOString();
    await writeDB(db);
    
    res.json(agreement);
  } catch (error) {
    console.error('Error signing project agreement:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send project agreement email
app.post('/api/project-agreements/:id/send-email', async (req, res) => {
  try {
    const db = await readDB();
    if (!db.projectAgreements) db.projectAgreements = [];
    const agreement = db.projectAgreements.find(a => a.id === parseInt(req.params.id));
    if (!agreement) {
      return res.status(404).json({ error: 'Project Agreement not found' });
    }
    
    const agency = db.agencies.find(a => a.id === agreement.agency_id);
    const model = db.customers.find(c => c.id === agreement.model_id);
    let { recipients, cc } = req.body;
    
    const emailSettings = db.emailSettings || {};
    
    // Ensure download token exists for agreement preview
    if (!agreement.downloadToken) {
      const downloadToken = crypto.randomBytes(32).toString('hex');
      if (!db.downloadTokens) db.downloadTokens = [];
      
      db.downloadTokens.push({
        token: downloadToken,
        agreementId: agreement.id,
        agreementType: 'project',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      });
      
      agreement.downloadToken = downloadToken;
      await writeDB(db);
    }
    
    // Support both new array format and old recipient format
    if (!recipients || !Array.isArray(recipients)) {
      const { recipient } = req.body;
      recipients = [];
      if (recipient === 'agency' || recipient === 'both') recipients.push(agency.email);
      if (recipient === 'customer' || recipient === 'both') recipients.push(model.email);
    }
    
    // Add CC addresses to recipients
    if (cc && Array.isArray(cc)) {
      recipients = [...recipients, ...cc];
    } else if (cc && typeof cc === 'string') {
      recipients.push(cc);
    }
    
    // Validate recipients
    if (!recipients || recipients.length === 0) {
      return res.status(400).json({ error: 'At least one recipient email is required' });
    }
    
    // Generate share links for unsigned parties
    // Use X-Forwarded-Host if available (for proxied requests), otherwise use HOST header
    const host = req.get('x-forwarded-host') || req.get('host');
    const protocol = req.get('x-forwarded-proto') || req.protocol;
    const baseUrl = `${protocol}://${host}`;
    let agencyShareLink = '';
    let modelShareLink = '';
    
    if (!agreement.agency_signed) {
      if (!db.shareTokens) db.shareTokens = [];
      let agencyToken = db.shareTokens.find(t => 
        t.agreementId === agreement.id && 
        t.agreementType === 'project' && 
        t.party === 'agency' && 
        !t.used && 
        new Date(t.expiresAt) > new Date()
      );
      
      if (!agencyToken) {
        const token = crypto.randomBytes(32).toString('hex');
        agencyToken = {
          token,
          agreementId: agreement.id,
          agreementType: 'project',
          party: 'agency',
          used: false,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };
        db.shareTokens.push(agencyToken);
        await writeDB(db);
      }
      agencyShareLink = `${baseUrl}/sign/${agencyToken.token}`;
    }
    
    if (!agreement.customer_signed) {
      if (!db.shareTokens) db.shareTokens = [];
      let modelToken = db.shareTokens.find(t => 
        t.agreementId === agreement.id && 
        t.agreementType === 'project' && 
        t.party === 'customer' && 
        !t.used && 
        new Date(t.expiresAt) > new Date()
      );
      
      if (!modelToken) {
        const token = crypto.randomBytes(32).toString('hex');
        modelToken = {
          token,
          agreementId: agreement.id,
          agreementType: 'project',
          party: 'customer',
          used: false,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };
        db.shareTokens.push(modelToken);
        await writeDB(db);
      }
      modelShareLink = `${baseUrl}/sign/${modelToken.token}`;
    }
    
    // Build signature status section
    let signatureSection = '<div style="margin: 20px 0; padding: 20px; background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 8px;">';
    signatureSection += '<h3 style="color: #059669; margin-top: 0;">📝 Signature Status</h3>';
    
    if (agreement.agency_signed && agreement.customer_signed) {
      signatureSection += '<p style="color: #059669;"><strong>✅ Fully Signed</strong> - This project agreement has been signed by both parties.</p>';
    } else {
      signatureSection += '<p><strong>Pending Signatures:</strong></p><ul style="list-style: none; padding-left: 0;">';
      
      if (!agreement.agency_signed && agencyShareLink) {
        signatureSection += `
          <li style="margin: 10px 0;">
            🏢 <strong>Agency (${agency.name}):</strong> Awaiting signature<br>
            <a href="${agencyShareLink}" style="display: inline-block; margin-top: 8px; padding: 10px 20px; background-color: #10b981; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Click Here to Sign as Agency
            </a>
          </li>
        `;
      }
      
      if (!agreement.customer_signed && modelShareLink) {
        signatureSection += `
          <li style="margin: 10px 0;">
            👤 <strong>Model (${model.name}):</strong> Awaiting signature<br>
            <a href="${modelShareLink}" style="display: inline-block; margin-top: 8px; padding: 10px 20px; background-color: #10b981; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Click Here to Sign as Model
            </a>
          </li>
        `;
      }
      
      signatureSection += '</ul>';
    }
    signatureSection += '</div>';
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #10b981;">📄 Project Agreement</h2>
        <p>Dear Recipient,</p>
        <p>Please find the project agreement details below.</p>
        
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Agreement Number:</strong> ${agreement.agreement_number}</p>
          <p><strong>Project:</strong> ${agreement.project_name}</p>
          <p><strong>Company/Brand:</strong> ${agreement.company_name}</p>
          <p><strong>Agency:</strong> ${agency.name}</p>
          <p><strong>Model:</strong> ${model.name}</p>
          <p><strong>Usage Platforms:</strong> ${agreement.platforms.join(', ')}</p>
          <p><strong>Status:</strong> ${agreement.status.toUpperCase()}</p>
        </div>
        
        ${signatureSection}
        
        <div style="margin: 20px 0; padding: 15px; background-color: #e0f2fe; border-left: 4px solid #0284c7; border-radius: 8px;">
          <p style="margin: 0; color: #075985;"><strong>📄 View Full Agreement</strong></p>
          <p style="margin: 10px 0; font-size: 13px; color: #0c4a6e;">
            Click below to view the complete agreement document with all terms and conditions:
          </p>
          <a href="${baseUrl}/download/${agreement.downloadToken || 'temp'}" 
             style="display: inline-block; margin: 10px 0; padding: 10px 20px; background-color: #0284c7; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
            📄 View Full Agreement Document
          </a>
        </div>
        
        <div style="margin: 20px 0;">
          <h3>Project Description:</h3>
          <p style="white-space: pre-wrap; line-height: 1.6;">${agreement.description}</p>
        </div>
        
        <div style="margin: 20px 0; padding: 15px; background-color: #dcfce7; border-left: 4px solid: #10b981; border-radius: 8px;">
          <p style="margin: 0;"><strong>⚠️ Important:</strong> This agreement grants <strong>permanent usage rights</strong> for both real and AI-generated content. Rights cannot be revoked after signing.</p>
        </div>
        
        <p style="margin-top: 30px;">Best regards,<br>${emailSettings.from_name || 'Fashion Cast Agency'}</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          This email was sent from the Agreement Management System. 
          ${(!agreement.agency_signed || !agreement.customer_signed) ? 'Signature links are valid for 30 days and can only be used once.' : ''}
        </p>
      </div>
    `;
    
    // Send email using universal email function
    await sendEmail(emailSettings, {
      from: emailSettings.from_email || 'onboarding@resend.dev',
      to: recipients,
      subject: `📄 Project Agreement - ${agreement.project_name}`,
      html: emailContent
    });
    
    res.json({ success: true, message: 'Email sent successfully with signature links' });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate project agreement content
function generateProjectAgreementContent(agreement, agency, model) {
  const platforms = agreement.platforms.join(', ');
  const contentTypes = agreement.content_types.join(' and ');
  
  return `PROJECT PARTICIPATION AGREEMENT

This Project Participation Agreement ("Agreement") is entered into as of ${new Date().toLocaleDateString()} between:

AGENCY: ${agency.name}
Address: ${agency.address || 'N/A'}
Email: ${agency.email}

MODEL/TALENT: ${model.name}
Email: ${model.email}

PROJECT DETAILS:

Project Name: ${agreement.project_name}
Company/Brand: ${agreement.company_name}
Usage Platforms: ${platforms}
Content Type: ${contentTypes}

PROJECT DESCRIPTION:
${agreement.description}

TERMS AND CONDITIONS:

1. PERMANENT USAGE RIGHTS
The Model hereby grants ${agreement.company_name} and ${agency.name} perpetual, irrevocable, worldwide rights to use, reproduce, modify, publish, and distribute all content (including but not limited to photographs, videos, images, and AI-generated content) created for this project.

2. SCOPE OF USAGE
The content may be used on the following platforms and media: ${platforms}

3. IRREVOCABILITY
These rights are PERMANENT and CANNOT BE REVOKED once this agreement is signed. The Model acknowledges and agrees that:
- Content may be used indefinitely across all specified platforms
- ${agreement.company_name} may modify, edit, or enhance the content
- Content may be used for AI training and future AI-generated content
- The Model cannot request removal or deletion of published content

4. CONTENT TYPES
This agreement covers:
${agreement.content_types.map(type => `- ${type}`).join('\n')}

5. COMMERCIAL USE
${agreement.company_name} has the right to use the content for commercial purposes including but not limited to:
- Marketing and advertising campaigns
- Social media promotion
- Website and digital marketing
- Print and broadcast media
- Product packaging and displays

6. MODEL APPROVAL
The Model approves ${agreement.company_name}'s participation in this project and use of their likeness and content as described in this agreement.

7. NO COMPENSATION TERMS
This agreement focuses solely on usage rights and project participation terms. Financial compensation, if any, is covered under a separate agreement between the parties.

8. WARRANTY
The Model warrants that they have the full right and authority to grant these rights and that the content does not infringe on any third-party rights.

9. GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws of the United Republic of Tanzania.

10. ACKNOWLEDGMENT
By signing below, the Model acknowledges that they have read, understood, and agree to all terms of this Agreement, including the permanent and irrevocable nature of the usage rights granted.

_______________________________________________
This is a legally binding agreement. Please read carefully before signing.`;
}

// Generate share link for project agreements
app.post('/api/project-agreements/:id/generate-share-link', async (req, res) => {
  try {
    const db = await readDB();
    if (!db.projectAgreements) db.projectAgreements = [];
    if (!db.shareTokens) db.shareTokens = [];
    
    const agreement = db.projectAgreements.find(a => a.id === parseInt(req.params.id));
    if (!agreement) {
      return res.status(404).json({ error: 'Project Agreement not found' });
    }
    
    const { party } = req.body; // 'agency' or 'customer'
    
    // Allow regenerating links even if already signed (for archival/reference purposes)
    // ALWAYS generate new token to allow link regeneration
    // This allows users to regenerate links when old ones expire
    const token = crypto.randomBytes(32).toString('hex');
    const shareToken = {
      token,
      agreementId: agreement.id,
      agreementType: 'project',
      party,
      used: false,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year expiration
    };
    
    db.shareTokens.push(shareToken);
    await writeDB(db);
    
    // Use req.protocol and req.get('host') to get the correct URL (same as other agreement types)
    const shareUrl = `${req.protocol}://${req.get('host')}/sign/${token}`;
    res.json({ 
      success: true, 
      shareUrl: shareUrl,
      token: token,
      expiresAt: shareToken.expiresAt
    });
  } catch (error) {
    console.error('Error generating share link:', error);
    res.status(500).json({ error: error.message });
  }
});

// ======================
// SHARE LINK API (Secure One-Time Signing)
// ======================

// Generate share link for model agreements
app.post('/api/model-agreements/:id/generate-share-link', async (req, res) => {
  try {
    const db = await readDB();
    if (!db.modelAgreements) db.modelAgreements = [];
    const agreementIndex = db.modelAgreements.findIndex(a => a.id === parseInt(req.params.id));
    
    if (agreementIndex === -1) {
      return res.status(404).json({ error: 'Model Agreement not found' });
    }
    
    const { party } = req.body; // 'agency' or 'customer'
    if (!party || (party !== 'agency' && party !== 'customer')) {
      return res.status(400).json({ error: 'Invalid party. Must be "agency" or "customer"' });
    }
    
    // Generate secure random token (ALWAYS generate new token to refresh expired links)
    const token = crypto.randomBytes(32).toString('hex');
    
    // Initialize share tokens object if it doesn't exist
    if (!db.modelAgreements[agreementIndex].shareTokens) {
      db.modelAgreements[agreementIndex].shareTokens = {};
    }
    
    // Store token with metadata (1 year expiration for long-term access)
    db.modelAgreements[agreementIndex].shareTokens[party] = {
      token: token,
      party: party,
      used: false,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
    };
    
    await writeDB(db);
    
    // Generate the share URL
    const shareUrl = `${req.protocol}://${req.get('host')}/sign/${token}`;
    
    res.json({ 
      success: true, 
      shareUrl: shareUrl,
      token: token,
      party: party,
      expiresAt: db.modelAgreements[agreementIndex].shareTokens[party].expiresAt
    });
  } catch (error) {
    console.error('Error generating share link:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate share link for regular agreements
app.post('/api/agreements/:id/generate-share-link', async (req, res) => {
  try {
    const db = await readDB();
    const agreementIndex = db.agreements.findIndex(a => a.id === parseInt(req.params.id));
    
    if (agreementIndex === -1) {
      return res.status(404).json({ error: 'Agreement not found' });
    }
    
    const { party } = req.body; // 'agency' or 'customer'
    if (!party || (party !== 'agency' && party !== 'customer')) {
      return res.status(400).json({ error: 'Invalid party. Must be "agency" or "customer"' });
    }
    
    // Generate secure random token (ALWAYS generate new token to refresh expired links)
    const token = crypto.randomBytes(32).toString('hex');
    
    // Initialize share tokens object if it doesn't exist
    if (!db.agreements[agreementIndex].shareTokens) {
      db.agreements[agreementIndex].shareTokens = {};
    }
    
    // Store token with metadata (1 year expiration for long-term access)
    db.agreements[agreementIndex].shareTokens[party] = {
      token: token,
      party: party,
      used: false,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
    };
    
    await writeDB(db);
    
    // Generate the share URL
    const shareUrl = `${req.protocol}://${req.get('host')}/sign/${token}`;
    
    res.json({ 
      success: true, 
      shareUrl: shareUrl,
      token: token,
      party: party,
      expiresAt: db.agreements[agreementIndex].shareTokens[party].expiresAt
    });
  } catch (error) {
    console.error('Error generating share link:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get agreement by share token (public endpoint)
app.get('/api/share/:token', async (req, res) => {
  try {
    const db = await readDB();
    const { token } = req.params;
    
    // Find token in shareTokens array
    if (!db.shareTokens) {
      return res.status(404).json({ error: 'Invalid or expired share link' });
    }
    
    const tokenData = db.shareTokens.find(t => t.token === token);
    if (!tokenData) {
      return res.status(404).json({ error: 'Invalid or expired share link' });
    }
    
    // Find the agreement based on tokenData
    let agreement = null;
    const agreementType = tokenData.agreementType;
    const party = tokenData.party;
    
    if (agreementType === 'model') {
      agreement = db.modelAgreements?.find(a => a.id === tokenData.agreementId);
    } else if (agreementType === 'regular') {
      agreement = db.agreements?.find(a => a.id === tokenData.agreementId);
    } else if (agreementType === 'project') {
      agreement = db.projectAgreements?.find(a => a.id === tokenData.agreementId);
    }
    
    if (!agreement) {
      return res.status(404).json({ error: 'Agreement not found' });
    }
    
    // Check if token is expired
    if (new Date(tokenData.expiresAt) < new Date()) {
      return res.status(403).json({ error: 'This share link has expired' });
    }
    
    // Check if already signed
    const alreadySigned = party === 'agency' ? agreement.agency_signed : agreement.customer_signed;
    
    // Get agency and customer details
    const agency = db.agencies.find(a => a.id === agreement.agency_id);
    const customer = db.customers.find(c => c.id === agreement.customer_id);
    
    // Create response without signatures to avoid timeout issues
    const agreementResponse = {
      ...agreement,
      agency_name: agency?.name || '',
      agency_email: agency?.email || '',
      agency_address: agency?.address || '',
      customer_name: customer?.name || '',
      customer_email: customer?.email || '',
      customer_company: customer?.company || ''
    };
    
    // Remove large signature data to prevent timeout
    delete agreementResponse.agency_signature;
    delete agreementResponse.customer_signature;
    
    res.json({
      agreement: agreementResponse,
      party: party,
      agreementType: agreementType,
      alreadySigned: alreadySigned,
      tokenUsed: tokenData.used,
      canSign: !tokenData.used && !alreadySigned
    });
  } catch (error) {
    console.error('Error fetching agreement by token:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sign agreement via share link (public endpoint)
app.post('/api/share/:token/sign', async (req, res) => {
  try {
    const db = await readDB();
    const { token } = req.params;
    const { signature } = req.body;
    
    if (!signature) {
      return res.status(400).json({ error: 'Signature is required' });
    }
    
    // Find token in shareTokens array
    if (!db.shareTokens) {
      return res.status(404).json({ error: 'Invalid or expired share link' });
    }
    
    const tokenIndex = db.shareTokens.findIndex(t => t.token === token);
    if (tokenIndex === -1) {
      return res.status(404).json({ error: 'Invalid or expired share link' });
    }
    
    const tokenData = db.shareTokens[tokenIndex];
    const agreementType = tokenData.agreementType;
    const party = tokenData.party;
    
    // Find the agreement and its array
    let agreements = null;
    let agreementIndex = -1;
    
    if (agreementType === 'model') {
      agreements = db.modelAgreements || [];
      agreementIndex = agreements.findIndex(a => a.id === tokenData.agreementId);
    } else if (agreementType === 'regular') {
      agreements = db.agreements || [];
      agreementIndex = agreements.findIndex(a => a.id === tokenData.agreementId);
    } else if (agreementType === 'project') {
      agreements = db.projectAgreements || [];
      agreementIndex = agreements.findIndex(a => a.id === tokenData.agreementId);
    }
    
    if (agreementIndex === -1) {
      return res.status(404).json({ error: 'Agreement not found' });
    }
    
    // Check if token is expired
    if (new Date(tokenData.expiresAt) < new Date()) {
      return res.status(403).json({ error: 'This share link has expired' });
    }
    
    // Check if token has already been used
    if (tokenData.used) {
      return res.status(403).json({ error: 'This share link has already been used' });
    }
    
    // Check if already signed
    const alreadySigned = party === 'agency' 
      ? agreements[agreementIndex].agency_signed 
      : agreements[agreementIndex].customer_signed;
    
    if (alreadySigned) {
      return res.status(403).json({ error: 'This party has already signed this agreement' });
    }
    
    // Apply signature
    if (party === 'agency') {
      agreements[agreementIndex].agency_signed = 1;
      agreements[agreementIndex].agency_signature = signature;
      agreements[agreementIndex].agency_signed_at = new Date().toISOString();
    } else {
      agreements[agreementIndex].customer_signed = 1;
      agreements[agreementIndex].customer_signature = signature;
      agreements[agreementIndex].customer_signed_at = new Date().toISOString();
    }
    
    // Mark token as used
    db.shareTokens[tokenIndex].used = true;
    db.shareTokens[tokenIndex].usedAt = new Date().toISOString();
    
    // Update status if both parties signed
    const bothSigned = agreements[agreementIndex].agency_signed && agreements[agreementIndex].customer_signed;
    if (bothSigned) {
      agreements[agreementIndex].status = 'active';
      
      // Generate download token for completed agreement
      const downloadToken = crypto.randomBytes(32).toString('hex');
      if (!db.downloadTokens) db.downloadTokens = [];
      
      db.downloadTokens.push({
        token: downloadToken,
        agreementId: tokenData.agreementId,
        agreementType: agreementType,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year expiry
      });
      
      agreements[agreementIndex].downloadToken = downloadToken;
      
      // Send email notification with download link to both parties
      try {
        const emailSettings = db.emailSettings || {};
        const agreement = agreements[agreementIndex];
        
        // Get protocol and host for download link
        const host = req.get('x-forwarded-host') || req.get('host');
        const protocol = req.get('x-forwarded-proto') || req.protocol;
        
        // Get party information
        let agency = null;
        let customer = null;
        let agreementTitle = '';
        
        if (agreementType === 'model') {
          agency = db.agencies.find(a => a.id === agreement.agency_id);
          customer = db.models.find(m => m.id === agreement.model_id);
          agreementTitle = agreement.title || 'Model Agreement';
        } else if (agreementType === 'project') {
          agency = db.agencies.find(a => a.id === agreement.agency_id);
          customer = db.models.find(m => m.id === agreement.model_id);
          agreementTitle = `${agreement.project_name} - ${agreement.company_name}`;
        } else {
          agency = db.agencies.find(a => a.id === agreement.agency_id);
          customer = db.customers.find(c => c.id === agreement.customer_id);
          agreementTitle = agreement.title || 'Agreement';
        }
        
        const downloadLink = `${protocol}://${host}/download/${downloadToken}`;
        
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #10b981;">✅ Agreement Fully Signed!</h2>
            
            <p>Great news! The following agreement has been fully signed by both parties:</p>
            
            <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <strong>Agreement:</strong> ${agreementTitle}<br>
              <strong>Number:</strong> ${agreement.agreement_number}<br>
              <strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">ACTIVE</span>
            </div>
            
            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
              <h3 style="color: #1e40af; margin-top: 0;">📥 Download Your Signed Agreement</h3>
              <p style="margin: 10px 0;">You can now download the fully signed agreement document:</p>
              <a href="${downloadLink}" 
                 style="display: inline-block; margin: 15px 0; padding: 12px 24px; background-color: #8b5cf6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
                <span style="font-size: 18px;">📄</span> Download Signed Agreement
              </a>
              <p style="font-size: 12px; color: #6b7280; margin-top: 10px;">
                This download link is valid for 1 year and can be used multiple times.
              </p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              This is an automated notification from the Agreement Management System.
            </p>
          </div>
        `;
        
        const recipients = [];
        if (agency?.email) recipients.push(agency.email);
        if (customer?.email) recipients.push(customer.email);
        
        if (recipients.length > 0 && emailSettings.provider) {
          await sendEmail(emailSettings, {
            from: emailSettings.from_email || 'onboarding@resend.dev',
            to: recipients,
            subject: `✅ Agreement Fully Signed - ${agreementTitle}`,
            html: emailHtml
          });
        }
      } catch (emailError) {
        console.error('Error sending completion email:', emailError);
        // Don't fail the request if email fails
      }
    }
    
    await writeDB(db);
    
    const host = req.get('x-forwarded-host') || req.get('host');
    const protocol = req.get('x-forwarded-proto') || req.protocol;
    const downloadUrl = bothSigned ? `${protocol}://${host}/download/${agreements[agreementIndex].downloadToken}` : null;
    
    res.json({ 
      success: true, 
      message: bothSigned ? 'Agreement fully signed! Download link generated and sent via email.' : 'Signature saved successfully',
      agreement: agreements[agreementIndex],
      downloadUrl: downloadUrl,
      bothSigned: bothSigned
    });
  } catch (error) {
    console.error('Error signing via share link:', error);
    res.status(500).json({ error: error.message });
  }
});

// ======================
// REMINDERS API
// ======================
app.get('/api/reminders', async (req, res) => {
  const db = await readDB();
  const remindersWithDetails = db.reminders.map(reminder => {
    const agreement = db.agreements.find(a => a.id === reminder.agreement_id);
    const customer = agreement ? db.customers.find(c => c.id === agreement.customer_id) : null;
    return {
      ...reminder,
      agreement_title: agreement?.title || '',
      agreement_number: agreement?.agreement_number || '',
      customer_name: customer?.name || '',
      customer_email: customer?.email || ''
    };
  }).sort((a, b) => new Date(b.due_date) - new Date(a.due_date));
  res.json(remindersWithDetails);
});

app.get('/api/reminders/pending', async (req, res) => {
  const db = await readDB();
  const pendingReminders = db.reminders.filter(r => r.status === 'pending');
  const remindersWithDetails = pendingReminders.map(reminder => {
    const agreement = db.agreements.find(a => a.id === reminder.agreement_id);
    const customer = agreement ? db.customers.find(c => c.id === agreement.customer_id) : null;
    return {
      ...reminder,
      agreement_title: agreement?.title || '',
      agreement_number: agreement?.agreement_number || '',
      customer_name: customer?.name || '',
      customer_email: customer?.email || ''
    };
  }).sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  res.json(remindersWithDetails);
});

app.post('/api/reminders', async (req, res) => {
  const db = await readDB();
  const newReminder = {
    id: getNextId(db.reminders),
    ...req.body,
    status: req.body.status || 'pending',
    created_at: new Date().toISOString()
  };
  db.reminders.push(newReminder);
  await writeDB(db);
  res.json(newReminder);
});

app.put('/api/reminders/:id/mark-paid', async (req, res) => {
  const db = await readDB();
  const index = db.reminders.findIndex(r => r.id === parseInt(req.params.id));
  if (index !== -1) {
    db.reminders[index].status = 'paid';
    db.reminders[index].paid_at = new Date().toISOString();
    await writeDB(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Reminder not found' });
  }
});

app.put('/api/reminders/:id/mark-sent', async (req, res) => {
  const db = await readDB();
  const index = db.reminders.findIndex(r => r.id === parseInt(req.params.id));
  if (index !== -1) {
    db.reminders[index].sent_at = new Date().toISOString();
    await writeDB(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Reminder not found' });
  }
});

// ======================
// SERVICE LIBRARY API
// ======================
app.get('/api/service-library', async (req, res) => {
  const db = await readDB();
  if (!db.serviceLibrary) {
    db.serviceLibrary = [];
  }
  res.json(db.serviceLibrary);
});

app.get('/api/service-library/:id', async (req, res) => {
  const db = await readDB();
  const service = db.serviceLibrary?.find(s => s.id === parseInt(req.params.id));
  res.json(service || {});
});

app.post('/api/service-library', async (req, res) => {
  const db = await readDB();
  if (!db.serviceLibrary) {
    db.serviceLibrary = [];
  }
  const newService = {
    id: getNextId(db.serviceLibrary),
    ...req.body,
    created_at: new Date().toISOString()
  };
  db.serviceLibrary.push(newService);
  await writeDB(db);
  res.json(newService);
});

app.put('/api/service-library/:id', async (req, res) => {
  const db = await readDB();
  if (!db.serviceLibrary) {
    db.serviceLibrary = [];
  }
  const index = db.serviceLibrary.findIndex(s => s.id === parseInt(req.params.id));
  if (index !== -1) {
    db.serviceLibrary[index] = {
      ...db.serviceLibrary[index],
      ...req.body,
      id: parseInt(req.params.id),
      updated_at: new Date().toISOString()
    };
    await writeDB(db);
    res.json(db.serviceLibrary[index]);
  } else {
    res.status(404).json({ error: 'Service not found' });
  }
});

app.delete('/api/service-library/:id', async (req, res) => {
  const db = await readDB();
  if (!db.serviceLibrary) {
    db.serviceLibrary = [];
  }
  db.serviceLibrary = db.serviceLibrary.filter(s => s.id !== parseInt(req.params.id));
  await writeDB(db);
  res.json({ success: true });
});

// ======================
// CATEGORY MANAGEMENT API
// ======================
app.get('/api/categories', async (req, res) => {
  const db = await readDB();
  if (!db.categories) {
    db.categories = [];
  }
  res.json(db.categories);
});

app.get('/api/categories/:id', async (req, res) => {
  const db = await readDB();
  const category = db.categories?.find(c => c.id === parseInt(req.params.id));
  res.json(category || {});
});

app.post('/api/categories', async (req, res) => {
  const db = await readDB();
  if (!db.categories) {
    db.categories = [];
  }
  const newCategory = {
    id: getNextId(db.categories),
    name: req.body.name,
    color: req.body.color || '#6b7280',
    created_at: new Date().toISOString()
  };
  db.categories.push(newCategory);
  await writeDB(db);
  res.json(newCategory);
});

app.put('/api/categories/:id', async (req, res) => {
  const db = await readDB();
  if (!db.categories) {
    db.categories = [];
  }
  const index = db.categories.findIndex(c => c.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Category not found' });
  }
  db.categories[index] = {
    ...db.categories[index],
    name: req.body.name,
    color: req.body.color
  };
  await writeDB(db);
  res.json(db.categories[index]);
});

app.delete('/api/categories/:id', async (req, res) => {
  const db = await readDB();
  if (!db.categories) {
    return res.status(404).json({ error: 'Categories not found' });
  }
  db.categories = db.categories.filter(c => c.id !== parseInt(req.params.id));
  await writeDB(db);
  res.json({ success: true });
});

// ======================
// PAYMENT REMINDER API
// ======================

// Get payment reminder templates
app.get('/api/payment-reminder-templates', async (req, res) => {
  try {
    const db = await readDB();
    res.json(db.paymentReminderTemplates || []);
  } catch (error) {
    console.error('Error fetching payment reminder templates:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update payment reminder template
app.put('/api/payment-reminder-templates/:id', async (req, res) => {
  try {
    const db = await readDB();
    if (!db.paymentReminderTemplates) {
      db.paymentReminderTemplates = [];
    }
    
    const index = db.paymentReminderTemplates.findIndex(t => t.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    db.paymentReminderTemplates[index] = {
      ...db.paymentReminderTemplates[index],
      subject: req.body.subject,
      body: req.body.body
    };
    
    await writeDB(db);
    res.json(db.paymentReminderTemplates[index]);
  } catch (error) {
    console.error('Error updating payment reminder template:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send manual payment reminder for an agreement
app.post('/api/agreements/:id/payment-reminder', async (req, res) => {
  try {
    const db = await readDB();
    const agreement = db.agreements.find(a => a.id === parseInt(req.params.id));
    
    if (!agreement) {
      return res.status(404).json({ error: 'Agreement not found' });
    }
    
    const agency = db.agencies.find(a => a.id === agreement.agency_id);
    const customer = db.customers.find(c => c.id === agreement.customer_id);
    const emailSettings = db.emailSettings || {};
    
    // Calculate payment status and days
    const today = new Date();
    const paymentDay = parseInt(agreement.payment_day) || 1;
    
    // Calculate next payment date
    let nextPaymentDate = new Date(today.getFullYear(), today.getMonth(), paymentDay);
    if (today.getDate() > paymentDay) {
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
    }
    
    const daysUntilPayment = Math.ceil((nextPaymentDate - today) / (1000 * 60 * 60 * 24));
    const daysOverdue = daysUntilPayment < 0 ? Math.abs(daysUntilPayment) : 0;
    
    // Determine which template to use
    let templateType = 'upcoming';
    if (daysOverdue > 15) {
      templateType = 'suspended';
    } else if (daysOverdue > 0) {
      templateType = 'overdue';
    }
    
    // Get the appropriate template
    const template = db.paymentReminderTemplates?.find(t => t.type === templateType);
    if (!template) {
      return res.status(500).json({ error: 'Payment reminder template not found' });
    }
    
    // Format services list - separate by payment type
    const monthlyServices = agreement.services?.filter(s => s.payment_type === 'monthly') || [];
    const oneTimeServices = agreement.services?.filter(s => s.payment_type !== 'monthly') || [];
    
    let servicesList = '';
    
    // Monthly recurring services
    if (monthlyServices.length > 0) {
      servicesList += '📅 MONTHLY RECURRING SERVICES:\n';
      monthlyServices.forEach((s, i) => {
        servicesList += `${i + 1}. ${s.title} - $${s.price}/month\n`;
        if (s.description) servicesList += `   ${s.description}\n`;
      });
      const monthlyTotal = monthlyServices.reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0);
      servicesList += `\n💰 Monthly Total: $${monthlyTotal.toFixed(2)}\n`;
    }
    
    // One-time services
    if (oneTimeServices.length > 0) {
      if (monthlyServices.length > 0) servicesList += '\n';
      servicesList += '💵 ONE-TIME SERVICES:\n';
      oneTimeServices.forEach((s, i) => {
        servicesList += `${i + 1}. ${s.title} - $${s.price} (one-time)\n`;
        if (s.description) servicesList += `   ${s.description}\n`;
      });
      const oneTimeTotal = oneTimeServices.reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0);
      servicesList += `\n💰 One-Time Total: $${oneTimeTotal.toFixed(2)}\n`;
    }
    
    if (servicesList === '') {
      servicesList = 'No services listed';
    }
    
    // Replace template variables
    let subject = template.subject
      .replace(/\{\{agreement_title\}\}/g, agreement.title)
      .replace(/\{\{customer_name\}\}/g, customer?.name || 'Customer')
      .replace(/\{\{agency_name\}\}/g, agency?.name || 'Agency');
    
    let body = template.body
      .replace(/\{\{agreement_title\}\}/g, agreement.title)
      .replace(/\{\{customer_name\}\}/g, customer?.name || 'Customer')
      .replace(/\{\{agency_name\}\}/g, agency?.name || 'Agency')
      .replace(/\{\{payment_amount\}\}/g, agreement.monthly_payment || '0')
      .replace(/\{\{payment_day\}\}/g, paymentDay)
      .replace(/\{\{payment_date\}\}/g, nextPaymentDate.toLocaleDateString())
      .replace(/\{\{days_remaining\}\}/g, Math.max(0, daysUntilPayment))
      .replace(/\{\{days_overdue\}\}/g, daysOverdue)
      .replace(/\{\{services_list\}\}/g, servicesList)
      .replace(/\{\{suspension_date\}\}/g, new Date().toLocaleDateString());
    
    // Send email
    await sendEmail(emailSettings, {
      from: emailSettings.from_email || 'onboarding@resend.dev',
      to: [customer?.email],
      subject: subject,
      html: body.replace(/\n/g, '<br>')
    });
    
    res.json({ 
      success: true, 
      message: 'Payment reminder sent successfully',
      reminderType: templateType,
      daysUntilPayment,
      daysOverdue,
      nextPaymentDate: nextPaymentDate.toLocaleDateString()
    });
    
  } catch (error) {
    console.error('Error sending payment reminder:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get payment status for an agreement
app.get('/api/agreements/:id/payment-status', async (req, res) => {
  try {
    const db = await readDB();
    const agreement = db.agreements.find(a => a.id === parseInt(req.params.id));
    
    if (!agreement) {
      return res.status(404).json({ error: 'Agreement not found' });
    }
    
    const today = new Date();
    const paymentDay = parseInt(agreement.payment_day) || 1;
    
    // Calculate next payment date
    let nextPaymentDate = new Date(today.getFullYear(), today.getMonth(), paymentDay);
    if (today.getDate() > paymentDay) {
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
    }
    
    const daysUntilPayment = Math.ceil((nextPaymentDate - today) / (1000 * 60 * 60 * 24));
    const daysOverdue = daysUntilPayment < 0 ? Math.abs(daysUntilPayment) : 0;
    
    let status = 'upcoming';
    let statusColor = 'green';
    if (daysOverdue > 15) {
      status = 'suspended';
      statusColor = 'red';
    } else if (daysOverdue > 0) {
      status = 'overdue';
      statusColor = 'orange';
    }
    
    res.json({
      status,
      statusColor,
      daysUntilPayment,
      daysOverdue,
      nextPaymentDate: nextPaymentDate.toLocaleDateString(),
      paymentAmount: agreement.monthly_payment,
      paymentDay
    });
    
  } catch (error) {
    console.error('Error getting payment status:', error);
    res.status(500).json({ error: error.message });
  }
});

// ======================
// EMAIL SETTINGS API
// ======================
app.get('/api/email-settings', async (req, res) => {
  try {
    const db = await readDB();
    res.json(db.emailSettings || {});
  } catch (error) {
    console.error('Error fetching email settings:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/email-settings', async (req, res) => {
  try {
    const db = await readDB();
    // If settings already exist, update them instead
    if (db.emailSettings && Object.keys(db.emailSettings).length > 0) {
      db.emailSettings = {
        ...db.emailSettings,
        ...req.body,
        updated_at: new Date().toISOString()
      };
    } else {
      db.emailSettings = {
        ...req.body,
        id: 1, // Add ID for compatibility
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
    await writeDB(db);
    res.json(db.emailSettings);
  } catch (error) {
    console.error('Error saving email settings:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/email-settings/:id', async (req, res) => {
  try {
    const db = await readDB();
    db.emailSettings = {
      ...db.emailSettings,
      ...req.body,
      id: 1, // Ensure ID exists
      updated_at: new Date().toISOString()
    };
    await writeDB(db);
    res.json(db.emailSettings);
  } catch (error) {
    console.error('Error updating email settings:', error);
    res.status(500).json({ error: error.message });
  }
});

// ======================
// PDF & EMAIL API
// ======================

// Generate PDF for agreement
app.get('/api/agreements/:id/pdf', async (req, res) => {
  try {
    const db = await readDB();
    const agreement = db.agreements.find(a => a.id === parseInt(req.params.id));
    
    if (!agreement) {
      return res.status(404).json({ error: 'Agreement not found' });
    }

    const agency = db.agencies.find(a => a.id === agreement.agency_id);
    const customer = db.customers.find(c => c.id === agreement.customer_id);

    // Generate print-friendly HTML that browser can save as PDF
    const html = generateAgreementHTML(agreement, agency, customer, false, true);
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate PDF', details: error.message });
  }
});

// Print agreement (HTML version)
app.get('/api/agreements/:id/print', async (req, res) => {
  try {
    const db = await readDB();
    const agreement = db.agreements.find(a => a.id === parseInt(req.params.id));
    
    if (!agreement) {
      return res.status(404).json({ error: 'Agreement not found' });
    }

    const agency = db.agencies.find(a => a.id === agreement.agency_id);
    const customer = db.customers.find(c => c.id === agreement.customer_id);

    // Generate print-friendly HTML
    const html = generateAgreementHTML(agreement, agency, customer, true);
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Print Error:', error);
    res.status(500).json({ error: 'Failed to generate print version', details: error.message });
  }
});

// Send agreement via email
app.post('/api/agreements/:id/send-email', async (req, res) => {
  try {
    let { recipients, cc } = req.body;
    const db = await readDB();
    const agreement = db.agreements.find(a => a.id === parseInt(req.params.id));
    
    if (!agreement) {
      return res.status(404).json({ error: 'Agreement not found' });
    }

    const agency = db.agencies.find(a => a.id === agreement.agency_id);
    const customer = db.customers.find(c => c.id === agreement.customer_id);
    const emailSettings = db.emailSettings || {};
    
    // Ensure download token exists for agreement preview
    if (!agreement.downloadToken) {
      const downloadToken = crypto.randomBytes(32).toString('hex');
      if (!db.downloadTokens) db.downloadTokens = [];
      
      db.downloadTokens.push({
        token: downloadToken,
        agreementId: agreement.id,
        agreementType: 'regular',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      });
      
      agreement.downloadToken = downloadToken;
      await writeDB(db);
    }

    // Support both new array format and old recipient format
    if (!recipients || !Array.isArray(recipients)) {
      const { recipient } = req.body;
      recipients = [];
      if (recipient === 'agency' || recipient === 'both') {
        recipients.push(agency.email);
      }
      if (recipient === 'customer' || recipient === 'both') {
        recipients.push(customer.email);
      }
    }
    
    // Add CC addresses to recipients
    if (cc && Array.isArray(cc)) {
      recipients = [...recipients, ...cc];
    } else if (cc && typeof cc === 'string') {
      recipients.push(cc);
    }
    
    // Validate recipients
    if (!recipients || recipients.length === 0) {
      return res.status(400).json({ error: 'At least one recipient email is required' });
    }

    // Generate share links for unsigned parties
    // Use X-Forwarded headers if available (for proxied requests)
    const host = req.get('x-forwarded-host') || req.get('host');
    const protocol = req.get('x-forwarded-proto') || req.protocol;
    const baseUrl = `${protocol}://${host}`;
    let agencyShareLink = '';
    let customerShareLink = '';
    
    if (!agreement.agency_signed) {
      // Generate or find existing agency share link
      if (!db.shareTokens) db.shareTokens = [];
      let agencyToken = db.shareTokens.find(t => 
        t.agreementId === agreement.id && 
        t.agreementType === 'regular' && 
        t.party === 'agency' && 
        !t.used && 
        new Date(t.expiresAt) > new Date()
      );
      
      if (!agencyToken) {
        const token = crypto.randomBytes(32).toString('hex');
        agencyToken = {
          token,
          agreementId: agreement.id,
          agreementType: 'regular',
          party: 'agency',
          used: false,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };
        db.shareTokens.push(agencyToken);
        await writeDB(db);
      }
      agencyShareLink = `${baseUrl}/sign/${agencyToken.token}`;
    }
    
    if (!agreement.customer_signed) {
      // Generate or find existing customer share link
      if (!db.shareTokens) db.shareTokens = [];
      let customerToken = db.shareTokens.find(t => 
        t.agreementId === agreement.id && 
        t.agreementType === 'regular' && 
        t.party === 'customer' && 
        !t.used && 
        new Date(t.expiresAt) > new Date()
      );
      
      if (!customerToken) {
        const token = crypto.randomBytes(32).toString('hex');
        customerToken = {
          token,
          agreementId: agreement.id,
          agreementType: 'regular',
          party: 'customer',
          used: false,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };
        db.shareTokens.push(customerToken);
        await writeDB(db);
      }
      customerShareLink = `${baseUrl}/sign/${customerToken.token}`;
    }

    // Build signature status section
    let signatureSection = '<div style="margin: 20px 0; padding: 20px; background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 8px;">';
    signatureSection += '<h3 style="color: #059669; margin-top: 0;">📝 Signature Status</h3>';
    
    if (agreement.agency_signed && agreement.customer_signed) {
      signatureSection += '<p style="color: #059669;"><strong>✅ Fully Signed</strong> - This agreement has been signed by both parties.</p>';
    } else {
      signatureSection += '<p><strong>Pending Signatures:</strong></p><ul style="list-style: none; padding-left: 0;">';
      
      if (!agreement.agency_signed && agencyShareLink) {
        signatureSection += `
          <li style="margin: 10px 0;">
            🏢 <strong>Agency (${agency.name}):</strong> Awaiting signature<br>
            <a href="${agencyShareLink}" style="display: inline-block; margin-top: 8px; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Click Here to Sign as Agency
            </a>
          </li>
        `;
      }
      
      if (!agreement.customer_signed && customerShareLink) {
        signatureSection += `
          <li style="margin: 10px 0;">
            👤 <strong>Customer (${customer.name}):</strong> Awaiting signature<br>
            <a href="${customerShareLink}" style="display: inline-block; margin-top: 8px; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Click Here to Sign as Customer
            </a>
          </li>
        `;
      }
      
      signatureSection += '</ul>';
    }
    signatureSection += '</div>';

    // Email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">📄 Service Agreement</h2>
        <p>Hello,</p>
        <p>Please review the service agreement below and sign if you haven't already.</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Agreement Number:</strong> ${agreement.agreement_number}</p>
          <p style="margin: 5px 0;"><strong>Title:</strong> ${agreement.title}</p>
          <p style="margin: 5px 0;"><strong>Agency:</strong> ${agency.name}</p>
          <p style="margin: 5px 0;"><strong>Customer:</strong> ${customer.name}</p>
          <p style="margin: 5px 0;"><strong>Start Date:</strong> ${new Date(agreement.start_date).toLocaleDateString()}</p>
          ${agreement.end_date ? `<p style="margin: 5px 0;"><strong>End Date:</strong> ${new Date(agreement.end_date).toLocaleDateString()}</p>` : ''}
          <p style="margin: 5px 0;"><strong>Status:</strong> ${agreement.status.toUpperCase()}</p>
        </div>
        ${signatureSection}
        ${agreement.services && agreement.services.length > 0 ? `
        <div style="margin: 20px 0;">
          <h3 style="color: #1f2937;">📋 Services Included:</h3>
          ${(() => {
            const monthlyServices = agreement.services.filter(s => s.payment_type === 'monthly');
            const oneTimeServices = agreement.services.filter(s => s.payment_type !== 'monthly');
            let html = '';
            
            // Monthly recurring services
            if (monthlyServices.length > 0) {
              const monthlyTotal = monthlyServices.reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0);
              html += `
                <div style="margin-bottom: 20px;">
                  <h4 style="color: #059669; margin-bottom: 10px;">📅 MONTHLY RECURRING SERVICES</h4>
                  <ul style="list-style: none; padding: 0;">
                    ${monthlyServices.map(s => `
                      <li style="padding: 10px; background-color: #f0fdf4; margin: 5px 0; border-radius: 5px; border-left: 3px solid #059669;">
                        <strong>${s.title}</strong> - <span style="color: #059669; font-weight: bold;">$${s.price}/month</span>
                        ${s.description ? `<br><span style="color: #6b7280; font-size: 14px;">${s.description}</span>` : ''}
                      </li>
                    `).join('')}
                  </ul>
                  <p style="text-align: right; font-weight: bold; color: #059669; margin-top: 10px;">
                    💰 Monthly Total: $${monthlyTotal.toFixed(2)}
                  </p>
                </div>
              `;
            }
            
            // One-time services
            if (oneTimeServices.length > 0) {
              const oneTimeTotal = oneTimeServices.reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0);
              html += `
                <div style="margin-bottom: 20px;">
                  <h4 style="color: #2563eb; margin-bottom: 10px;">💵 ONE-TIME SERVICES</h4>
                  <ul style="list-style: none; padding: 0;">
                    ${oneTimeServices.map(s => `
                      <li style="padding: 10px; background-color: #eff6ff; margin: 5px 0; border-radius: 5px; border-left: 3px solid #2563eb;">
                        <strong>${s.title}</strong> - <span style="color: #2563eb; font-weight: bold;">$${s.price}</span> <span style="color: #6b7280;">(one-time)</span>
                        ${s.description ? `<br><span style="color: #6b7280; font-size: 14px;">${s.description}</span>` : ''}
                      </li>
                    `).join('')}
                  </ul>
                  <p style="text-align: right; font-weight: bold; color: #2563eb; margin-top: 10px;">
                    💰 One-Time Total: $${oneTimeTotal.toFixed(2)}
                  </p>
                </div>
              `;
            }
            
            // Grand Total (if both types exist)
            if (monthlyServices.length > 0 && oneTimeServices.length > 0) {
              const monthlyTotal = monthlyServices.reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0);
              const oneTimeTotal = oneTimeServices.reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0);
              const grandTotal = monthlyTotal + oneTimeTotal;
              html += `
                <div style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-radius: 8px; border: 2px solid #f59e0b;">
                  <p style="margin: 0; text-align: center; font-size: 18px; font-weight: bold; color: #92400e;">
                    💰 GRAND TOTAL: $${grandTotal.toFixed(2)}
                  </p>
                  <p style="margin: 5px 0 0 0; text-align: center; font-size: 12px; color: #78350f;">
                    (Monthly: $${monthlyTotal.toFixed(2)} + One-Time: $${oneTimeTotal.toFixed(2)})
                  </p>
                </div>
              `;
            }
            
            return html;
          })()}
        </div>
        ` : ''}
        <div style="margin: 20px 0; padding: 15px; background-color: #e0f2fe; border-left: 4px solid #0284c7; border-radius: 8px;">
          <p style="margin: 0; color: #075985;"><strong>📄 View Full Agreement</strong></p>
          <p style="margin: 10px 0; font-size: 13px; color: #0c4a6e;">
            Click below to view the complete agreement document with all terms and conditions:
          </p>
          <a href="${baseUrl}/download/${agreement.downloadToken || 'temp'}" 
             style="display: inline-block; margin: 10px 0; padding: 10px 20px; background-color: #0284c7; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
            📄 View Full Agreement Document
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          This is an automated message from Agreement Management System.
          ${(!agreement.agency_signed || !agreement.customer_signed) ? 'Signature links are valid for 30 days and can only be used once.' : ''}
        </p>
      </div>
    `;

    // Skip PDF generation for faster email sending
    // PDF generation takes too long and often fails in sandbox environment
    // Users can view/download PDF via the link in email instead
    let attachments = [];
    
    // DISABLED: PDF attachment generation (too slow)
    // try {
    //   const pdfHTML = generateAgreementHTML(agreement, agency, customer, true, true);
    //   const pdfBuffer = await generatePDFBuffer(pdfHTML);
    //   attachments = [{
    //     filename: `Agreement_${agreement.agreement_number}.pdf`,
    //     content: pdfBuffer
    //   }];
    // } catch (pdfError) {
    //   console.error('PDF generation failed:', pdfError.message);
    // }

    // Send email using universal email function with or without PDF attachment
    await sendEmail(emailSettings, {
      from: emailSettings.from_email || 'onboarding@resend.dev',
      to: recipients,
      subject: `📄 Agreement: ${agreement.title} - ${agreement.agreement_number}`,
      html: emailContent,
      attachments: attachments
    });

    const pdfStatus = attachments.length > 0 ? 'with PDF attachment' : '(PDF generation unavailable)';
    res.json({ 
      success: true, 
      message: `Agreement sent successfully ${pdfStatus} and signature links`,
      recipients: recipients 
    });
  } catch (error) {
    console.error('Email Send Error:', error);
    res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
});



// Helper function to generate PDF from HTML
async function generatePDFBuffer(html) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });
    
    return pdfBuffer;
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Helper function to create email transporter based on provider
function createEmailTransporter(settings) {
  switch (settings.provider) {
    case 'sendgrid':
      return nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
          user: 'apikey',
          pass: settings.api_key
        }
      });
    
    case 'mailgun':
      return nodemailer.createTransport({
        host: 'smtp.mailgun.org',
        port: 587,
        auth: {
          user: settings.smtp_username || 'postmaster@yourdomain.mailgun.org',
          pass: settings.api_key
        }
      });
    
    case 'ses':
      return nodemailer.createTransport({
        host: `email-smtp.${settings.aws_region || 'us-east-1'}.amazonaws.com`,
        port: 587,
        auth: {
          user: settings.smtp_username,
          pass: settings.api_key
        }
      });
    
    case 'resend':
      // Use native Resend SDK instead of SMTP
      return 'resend-native';
    
    case 'postmark':
      return nodemailer.createTransport({
        host: 'smtp.postmarkapp.com',
        port: 587,
        auth: {
          user: settings.api_key,
          pass: settings.api_key
        }
      });
    
    case 'brevo':
      return nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        auth: {
          user: settings.smtp_username || settings.from_email,
          pass: settings.api_key
        }
      });
    
    case 'smtp':
      return nodemailer.createTransport({
        host: settings.smtp_host,
        port: settings.smtp_port || 587,
        secure: settings.smtp_secure || false,
        auth: {
          user: settings.smtp_username,
          pass: settings.api_key
        }
      });
    
    default:
      throw new Error('Unsupported email provider');
  }
}

// Helper function to generate agreement HTML
// Model Agreement HTML Generator (No Pricing)
function generateModelAgreementHTML(agreement, agency, customer, printVersion = false) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 3px solid #8b5cf6;
        }
        .header h1 {
          color: #8b5cf6;
          margin: 0;
          font-size: 28px;
        }
        .agreement-number {
          color: #6b7280;
          font-size: 14px;
          margin-top: 10px;
        }
        .parties {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin: 30px 0;
        }
        .party-box {
          border: 2px solid #e5e7eb;
          padding: 20px;
          border-radius: 8px;
          background-color: #f9fafb;
        }
        .party-box h3 {
          margin: 0 0 15px 0;
          color: #8b5cf6;
          font-size: 18px;
        }
        .content {
          margin: 30px 0;
          white-space: pre-wrap;
          line-height: 1.8;
        }
        .section {
          margin: 25px 0;
        }
        .section h3 {
          color: #8b5cf6;
          margin-bottom: 10px;
        }
        .signatures {
          margin-top: 50px;
          page-break-inside: avoid;
        }
        .signature-section {
          margin: 30px 0;
          padding: 20px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
        }
        .signature-image {
          max-height: 60px;
          margin: 10px 0;
        }
        .signature-footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 50px;
          background: white;
          border-top: 1px solid #e5e7eb;
          padding: 8px 20px;
          display: none;
        }
        @media print {
          body { padding-bottom: 60px; }
          .signature-footer { 
            display: grid !important;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            position: fixed;
            bottom: 0;
          }
          .signatures { display: none !important; }
          .signature-box { text-align: center; }
          .signature-image { max-height: 40px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>CAST & MODELING AGREEMENT</h1>
        <div class="agreement-number">${agreement.agreement_number}</div>
        <div style="margin-top: 10px; color: #6b7280;">
          <span style="background: #8b5cf6; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px;">
            ${agreement.status.toUpperCase()}
          </span>
        </div>
      </div>

      <div class="parties">
        <div class="party-box">
          <h3>Agency</h3>
          <p><strong>${agency.name}</strong></p>
          <p>${agency.email}</p>
          ${agency.phone ? `<p>${agency.phone}</p>` : ''}
          ${agency.address ? `<p>${agency.address}</p>` : ''}
        </div>
        <div class="party-box">
          <h3>Model</h3>
          <p><strong>${customer.name}</strong></p>
          <p>${customer.email}</p>
          ${customer.phone ? `<p>${customer.phone}</p>` : ''}
          ${customer.company ? `<p>${customer.company}</p>` : ''}
        </div>
      </div>

      <div class="section">
        <h3>Agreement Details</h3>
        <p><strong>Title:</strong> ${agreement.title}</p>
        <p><strong>Start Date:</strong> ${new Date(agreement.start_date).toLocaleDateString()}</p>
        <p><strong>End Date:</strong> ${new Date(agreement.end_date).toLocaleDateString()}</p>
      </div>

      <div class="content">
        <div class="section">
          <h3>Terms and Conditions</h3>
          ${agreement.content}
        </div>
      </div>

      <div class="signatures">
        <h3>Signatures</h3>
        <div class="signature-section">
          <h4>Agency Representative</h4>
          ${agreement.agency_signed 
            ? `<div>
                <img src="${agreement.agency_signature}" class="signature-image" alt="Agency Signature" />
                <p>Signed on: ${new Date(agreement.agency_signed_at).toLocaleDateString()}</p>
              </div>`
            : '<p style="color: #9ca3af;">Not signed yet</p>'}
        </div>
        <div class="signature-section">
          <h4>Model</h4>
          ${agreement.customer_signed 
            ? `<div>
                <img src="${agreement.customer_signature}" class="signature-image" alt="Model Signature" />
                <p>Signed on: ${new Date(agreement.customer_signed_at).toLocaleDateString()}</p>
              </div>`
            : '<p style="color: #9ca3af;">Not signed yet</p>'}
        </div>
      </div>

      <!-- Signature Footer for All Printed Pages -->
      <div class="signature-footer">
        <div class="signature-box">
          <div style="font-size: 11px; font-weight: bold; margin-bottom: 2px;">Agency</div>
          ${agreement.agency_signed 
            ? `<img src="${agreement.agency_signature}" class="signature-image" />
               <div style="font-size: 9px;">${new Date(agreement.agency_signed_at).toLocaleDateString()}</div>`
            : '<div style="font-size: 10px; color: #9ca3af;">Not signed</div>'}
        </div>
        <div class="signature-box">
          <div style="font-size: 11px; font-weight: bold; margin-bottom: 2px;">Model</div>
          ${agreement.customer_signed 
            ? `<img src="${agreement.customer_signature}" class="signature-image" />
               <div style="font-size: 9px;">${new Date(agreement.customer_signed_at).toLocaleDateString()}</div>`
            : '<div style="font-size: 10px; color: #9ca3af;">Not signed</div>'}
        </div>
      </div>

      ${printVersion ? '<script>window.print();</script>' : ''}
    </body>
    </html>
  `;
}

function generateAgreementHTML(agreement, agency, customer, printVersion = false, pdfMode = false) {
  // Generate services HTML separated by payment type
  let servicesHtml = '';
  
  if (agreement.services && agreement.services.length > 0) {
    const monthlyServices = agreement.services.filter(s => s.payment_type === 'monthly');
    const oneTimeServices = agreement.services.filter(s => s.payment_type !== 'monthly');
    
    // Monthly recurring services
    if (monthlyServices.length > 0) {
      const monthlyTotal = monthlyServices.reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0);
      servicesHtml += `
        <tr style="background-color: #f0fdf4;">
          <td colspan="4" style="padding: 10px; font-weight: bold; color: #059669; border-bottom: 2px solid #059669;">
            📅 MONTHLY RECURRING SERVICES
          </td>
        </tr>
      `;
      monthlyServices.forEach((s, i) => {
        servicesHtml += `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${i + 1}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${s.title}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${s.description || '-'}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #059669; font-weight: bold;">$${s.price}/month</td>
          </tr>
        `;
      });
      servicesHtml += `
        <tr style="background-color: #f0fdf4;">
          <td colspan="3" style="padding: 8px; text-align: right; font-weight: bold; color: #059669;">💰 Monthly Total:</td>
          <td style="padding: 8px; text-align: right; font-weight: bold; color: #059669; border-bottom: 2px solid #059669;">$${monthlyTotal.toFixed(2)}</td>
        </tr>
      `;
    }
    
    // One-time services
    if (oneTimeServices.length > 0) {
      const oneTimeTotal = oneTimeServices.reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0);
      servicesHtml += `
        <tr style="background-color: #eff6ff;">
          <td colspan="4" style="padding: 10px; font-weight: bold; color: #2563eb; border-bottom: 2px solid #2563eb; border-top: 2px solid #e5e7eb;">
            💵 ONE-TIME SERVICES
          </td>
        </tr>
      `;
      oneTimeServices.forEach((s, i) => {
        servicesHtml += `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${i + 1}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${s.title}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${s.description || '-'}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #2563eb; font-weight: bold;">$${s.price}</td>
          </tr>
        `;
      });
      servicesHtml += `
        <tr style="background-color: #eff6ff;">
          <td colspan="3" style="padding: 8px; text-align: right; font-weight: bold; color: #2563eb;">💰 One-Time Total:</td>
          <td style="padding: 8px; text-align: right; font-weight: bold; color: #2563eb; border-bottom: 2px solid #2563eb;">$${oneTimeTotal.toFixed(2)}</td>
        </tr>
      `;
    }
  } else {
    servicesHtml = '<tr><td colspan="4" style="padding: 8px; text-align: center;">No services listed</td></tr>';
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 3px solid #2563eb;
        }
        .header h1 {
          color: #2563eb;
          margin: 0;
          font-size: 28px;
        }
        .agreement-number {
          color: #6b7280;
          font-size: 14px;
          margin-top: 10px;
        }
        .parties {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin: 30px 0;
        }
        .party-box {
          border: 2px solid #e5e7eb;
          padding: 15px;
          border-radius: 8px;
          background-color: #f9fafb;
        }
        .party-box h3 {
          margin: 0 0 10px 0;
          color: #1f2937;
          font-size: 16px;
        }
        .party-box p {
          margin: 5px 0;
          font-size: 14px;
        }
        .section {
          margin: 30px 0;
        }
        .section-title {
          background-color: #2563eb;
          color: white;
          padding: 10px 15px;
          border-radius: 5px;
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 15px;
        }
        .content {
          padding: 15px;
          background-color: #f9fafb;
          border-radius: 5px;
          white-space: pre-wrap;
          font-size: 14px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        th {
          background-color: #2563eb;
          color: white;
          padding: 10px;
          text-align: left;
        }
        .signatures {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-top: 50px;
          page-break-inside: avoid;
        }
        .signature-box {
          border: 2px solid #e5e7eb;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
        }
        .signature-box h4 {
          margin: 0 0 15px 0;
          color: #1f2937;
        }
        .signature-image {
          max-height: 50px;
          max-width: 150px;
          margin: 5px 0;
        }
        .signature-date {
          font-size: 10px;
          color: #6b7280;
          margin-top: 5px;
        }
        .status-badge {
          display: inline-block;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
        }
        .status-active { background-color: #d1fae5; color: #065f46; }
        .status-draft { background-color: #fef3c7; color: #92400e; }
        
        /* Signature footer on every page */
        .signature-footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: white;
          border-top: 2px solid #e5e7eb;
          padding: 10px 20px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          font-size: 11px;
        }
        .signature-footer-box {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .signature-footer-box img {
          max-height: 40px;
          max-width: 120px;
        }
        .signature-footer-label {
          font-weight: bold;
          color: #1f2937;
          min-width: 80px;
        }
        
        @media print {
          body { 
            margin: 0;
            padding-bottom: 80px;
          }
          .signature-footer {
            position: fixed;
            bottom: 0;
          }
          .signatures {
            display: none !important;
          }
        }
        ${!printVersion && !pdfMode ? '.signature-footer { display: none; }' : ''}
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${agreement.title}</h1>
        <div class="agreement-number">${agreement.agreement_number}</div>
        <span class="status-badge status-${agreement.status}">${agreement.status.toUpperCase()}</span>
      </div>

      <div class="parties">
        <div class="party-box">
          <h3>📋 Agency</h3>
          <p><strong>${agency.name}</strong></p>
          ${agency.email ? `<p>✉️ ${agency.email}</p>` : ''}
          ${agency.phone ? `<p>📞 ${agency.phone}</p>` : ''}
          ${agency.address ? `<p>📍 ${agency.address}</p>` : ''}
          ${agreement.agency_signed ? `<p style="color: #059669; font-weight: bold;">✓ Signed: ${new Date(agreement.agency_signed_at).toLocaleString()}</p>` : ''}
        </div>
        <div class="party-box">
          <h3>👤 Customer</h3>
          <p><strong>${customer.name}</strong></p>
          ${customer.email ? `<p>✉️ ${customer.email}</p>` : ''}
          ${customer.phone ? `<p>📞 ${customer.phone}</p>` : ''}
          ${customer.company ? `<p>🏢 ${customer.company}</p>` : ''}
          ${agreement.customer_signed ? `<p style="color: #059669; font-weight: bold;">✓ Signed: ${new Date(agreement.customer_signed_at).toLocaleString()}</p>` : ''}
        </div>
      </div>

      <div class="section">
        <div class="section-title">Agreement Details</div>
        <table>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Start Date:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${new Date(agreement.start_date).toLocaleDateString()}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>End Date:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${agreement.end_date ? new Date(agreement.end_date).toLocaleDateString() : 'Ongoing'}</td>
          </tr>
          ${agreement.monthly_payment ? `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Monthly Payment:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">$${agreement.monthly_payment}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Payment Day:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">Day ${agreement.payment_day} of month</td>
          </tr>` : ''}
        </table>
      </div>

      <div class="section">
        <div class="section-title">Services</div>
        <table>
          <thead>
            <tr>
              <th style="width: 50px;">#</th>
              <th>Service</th>
              <th>Description</th>
              <th style="width: 100px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${servicesHtml}
          </tbody>
        </table>
      </div>

      <div class="section">
        <div class="section-title">Agreement Content</div>
        <div class="content">${agreement.content}</div>
      </div>

      ${agreement.agency_signed || agreement.customer_signed ? `
      <div class="signatures">
        <div class="signature-box">
          <h4>Agency Signature</h4>
          ${agreement.agency_signed ? `
            <img src="${agreement.agency_signature}" class="signature-image" alt="Agency Signature" />
            <div class="signature-date">Signed on ${new Date(agreement.agency_signed_at).toLocaleString()}</div>
          ` : '<p style="color: #9ca3af;">Not signed yet</p>'}
        </div>
        <div class="signature-box">
          <h4>Customer Signature</h4>
          ${agreement.customer_signed ? `
            <img src="${agreement.customer_signature}" class="signature-image" alt="Customer Signature" />
            <div class="signature-date">Signed on ${new Date(agreement.customer_signed_at).toLocaleString()}</div>
          ` : '<p style="color: #9ca3af;">Not signed yet</p>'}
        </div>
      </div>
      ` : ''}

      <!-- Signature Footer (appears on every printed page) -->
      <div class="signature-footer">
        <div class="signature-footer-box">
          <span class="signature-footer-label">Agency:</span>
          ${agreement.agency_signed ? `
            <img src="${agreement.agency_signature}" alt="Agency Signature" />
            <span style="font-size: 9px; color: #6b7280;">${new Date(agreement.agency_signed_at).toLocaleDateString()}</span>
          ` : '<span style="color: #9ca3af; font-size: 10px;">Not signed</span>'}
        </div>
        <div class="signature-footer-box">
          <span class="signature-footer-label">Customer:</span>
          ${agreement.customer_signed ? `
            <img src="${agreement.customer_signature}" alt="Customer Signature" />
            <span style="font-size: 9px; color: #6b7280;">${new Date(agreement.customer_signed_at).toLocaleDateString()}</span>
          ` : '<span style="color: #9ca3af; font-size: 10px;">Not signed</span>'}
        </div>
      </div>

      ${(printVersion || pdfMode) ? '<script>window.print();</script>' : ''}
    </body>
    </html>
  `;
}

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve public signing page with server-side rendering for faster loading
app.get('/sign/:token', async (req, res) => {
  try {
    const db = await readDB();
    const { token } = req.params;
    
    // Find token in shareTokens array
    if (!db.shareTokens) {
      return res.status(404).send('Invalid or expired share link');
    }
    
    const tokenData = db.shareTokens.find(t => t.token === token);
    if (!tokenData) {
      return res.status(404).send('Invalid or expired share link');
    }
    
    // Check if token is expired
    if (new Date(tokenData.expiresAt) < new Date()) {
      return res.status(403).send('This share link has expired');
    }
    
    // Read sign.html and inject data
    const signHtmlPath = path.join(__dirname, 'public', 'sign.html');
    let html = fs.readFileSync(signHtmlPath, 'utf-8');
    
    // Inject token data to avoid extra API call
    html = html.replace(
      '</body>',
      `<script>
        // Pre-loaded data to avoid API call and timeout
        window.__PRELOADED_TOKEN__ = '${token}';
        window.__AGREEMENT_TYPE__ = '${tokenData.agreementType}';
        window.__PARTY__ = '${tokenData.party}';
      </script>
      </body>`
    );
    
    res.send(html);
  } catch (error) {
    console.error('Error loading sign page:', error);
    res.status(500).send('Error loading sign page');
  }
});

// Start server
initDB().then(() => {
  // ===============================
  // WHATSAPP API
  // ===============================

  // Get WhatsApp settings
  app.get('/api/whatsapp/settings', async (req, res) => {
    try {
      const db = await readDB();
      const settings = db.whatsappSettings || {
        enabled: false,
        api_key: '',
        phone_number_id: '',
        business_account_id: '',
        api_version: 'v18.0'
      };
      // Don't expose the API key in response
      res.json({ ...settings, api_key: settings.api_key ? '***' : '' });
    } catch (error) {
      console.error('Error fetching WhatsApp settings:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update WhatsApp settings
  app.put('/api/whatsapp/settings', async (req, res) => {
    try {
      const db = await readDB();
      db.whatsappSettings = {
        ...db.whatsappSettings,
        ...req.body,
        updated_at: new Date().toISOString()
      };
      await writeDB(db);
      res.json({ success: true, message: 'WhatsApp settings updated' });
    } catch (error) {
      console.error('Error updating WhatsApp settings:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Send WhatsApp message with signature link
  app.post('/api/whatsapp/send-signature-link', async (req, res) => {
    try {
      const db = await readDB();
      const { agreementId, agreementType, party, phoneNumber } = req.body;

      if (!phoneNumber) {
        return res.status(400).json({ error: 'Phone number is required' });
      }

      const whatsappSettings = db.whatsappSettings;
      if (!whatsappSettings || !whatsappSettings.enabled) {
        return res.status(400).json({ error: 'WhatsApp integration is not enabled' });
      }

      if (!whatsappSettings.api_key || !whatsappSettings.phone_number_id) {
        return res.status(400).json({ error: 'WhatsApp API credentials are not configured' });
      }

      // Find or create share token
      if (!db.shareTokens) db.shareTokens = [];
      let shareToken = db.shareTokens.find(t => 
        t.agreementId === agreementId && 
        t.agreementType === agreementType && 
        t.party === party && 
        !t.used && 
        new Date(t.expiresAt) > new Date()
      );

      if (!shareToken) {
        const token = crypto.randomBytes(32).toString('hex');
        shareToken = {
          token,
          agreementId,
          agreementType,
          party,
          used: false,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };
        db.shareTokens.push(shareToken);
        await writeDB(db);
      }

      // Use X-Forwarded headers if available (for proxied requests)
    const host = req.get('x-forwarded-host') || req.get('host');
    const protocol = req.get('x-forwarded-proto') || req.protocol;
    const baseUrl = `${protocol}://${host}`;
      const shareUrl = `${baseUrl}/sign/${shareToken.token}`;

      // Get agreement details for message
      let agreement;
      if (agreementType === 'model') {
        agreement = db.modelAgreements?.find(a => a.id === agreementId);
      } else if (agreementType === 'project') {
        agreement = db.projectAgreements?.find(a => a.id === agreementId);
      } else {
        agreement = db.agreements?.find(a => a.id === agreementId);
      }

      if (!agreement) {
        return res.status(404).json({ error: 'Agreement not found' });
      }

      // Send WhatsApp message using Meta Cloud API
      const whatsappApiUrl = `https://graph.facebook.com/${whatsappSettings.api_version}/${whatsappSettings.phone_number_id}/messages`;
      
      const message = {
        messaging_product: 'whatsapp',
        to: phoneNumber.replace(/[^0-9]/g, ''), // Remove non-numeric characters
        type: 'template',
        template: {
          name: 'signature_request', // You need to create this template in WhatsApp Business Manager
          language: {
            code: 'en'
          },
          components: [
            {
              type: 'body',
              parameters: [
                {
                  type: 'text',
                  text: agreement.agreement_number || 'Agreement'
                },
                {
                  type: 'text',
                  text: shareUrl
                }
              ]
            },
            {
              type: 'button',
              sub_type: 'url',
              index: 0,
              parameters: [
                {
                  type: 'text',
                  text: shareToken.token
                }
              ]
            }
          ]
        }
      };

      const whatsappResponse = await fetch(whatsappApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whatsappSettings.api_key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      });

      const result = await whatsappResponse.json();

      if (!whatsappResponse.ok) {
        console.error('WhatsApp API error:', result);
        return res.status(500).json({ 
          error: 'Failed to send WhatsApp message', 
          details: result.error?.message || 'Unknown error'
        });
      }

      res.json({ 
        success: true, 
        message: 'WhatsApp message sent successfully',
        messageId: result.messages[0].id,
        shareUrl
      });

    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ======================
  // DOWNLOAD AGREEMENT ENDPOINT
  // ======================
  app.get('/download/:token', async (req, res) => {
    try {
      const db = await readDB();
      const { token } = req.params;
      
      // Find download token
      if (!db.downloadTokens) {
        return res.status(404).send('<h1>Invalid download link</h1><p>This download link is not valid.</p>');
      }
      
      const downloadToken = db.downloadTokens.find(t => t.token === token);
      if (!downloadToken) {
        return res.status(404).send('<h1>Invalid download link</h1><p>This download link is not valid.</p>');
      }
      
      // Check expiry
      if (new Date(downloadToken.expiresAt) < new Date()) {
        return res.status(403).send('<h1>Link Expired</h1><p>This download link has expired.</p>');
      }
      
      // Find the agreement
      let agreement = null;
      let agency = null;
      let customer = null;
      
      if (downloadToken.agreementType === 'model') {
        agreement = (db.modelAgreements || []).find(a => a.id === downloadToken.agreementId);
      } else if (downloadToken.agreementType === 'regular') {
        agreement = (db.agreements || []).find(a => a.id === downloadToken.agreementId);
      } else if (downloadToken.agreementType === 'project') {
        agreement = (db.projectAgreements || []).find(a => a.id === downloadToken.agreementId);
      }
      
      if (!agreement) {
        return res.status(404).send('<h1>Agreement Not Found</h1><p>The agreement could not be found.</p>');
      }
      
      // Get agency and customer/model info
      agency = db.agencies.find(a => a.id === agreement.agency_id);
      if (downloadToken.agreementType === 'model' || downloadToken.agreementType === 'project') {
        // For model and project agreements, look in customers table using model_id field
        customer = db.customers.find(c => c.id === agreement.model_id);
      } else {
        customer = db.customers.find(c => c.id === agreement.customer_id);
      }
      
      // Generate HTML for the agreement
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${agreement.agreement_number} - Agreement</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
    h1 { color: #333; border-bottom: 3px solid #8b5cf6; padding-bottom: 10px; }
    h2 { color: #8b5cf6; margin-top: 30px; }
    .info { background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .status { display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
    .status-active { background: #10b981; color: white; }
    .download-btn { display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; margin: 20px 0; border: none; cursor: pointer; }
    
    /* Signature Section Styling */
    .signature-section { 
      margin-top: 60px; 
      page-break-inside: avoid; 
      border-top: 2px solid #333;
      padding-top: 40px;
    }
    .signature-container { 
      display: flex; 
      justify-content: space-around; 
      align-items: flex-start; 
      gap: 40px; 
      margin-top: 30px;
      text-align: center;
    }
    .signature-box { 
      flex: 1; 
      min-width: 300px;
      text-align: center;
    }
    .signature-line {
      border-bottom: 2px solid #000;
      min-height: 80px;
      max-height: 100px;
      margin: 10px auto 5px auto;
      display: flex;
      align-items: center;
      justify-content: center;
      max-width: 300px;
    }
    .signature-img { 
      max-width: 280px; 
      max-height: 80px; 
      height: auto;
      width: auto;
      object-fit: contain;
    }
    .signature-name { 
      font-weight: bold; 
      font-size: 14px; 
      margin: 8px 0 2px 0;
      text-transform: uppercase;
    }
    .signature-title { 
      font-size: 12px; 
      color: #666; 
      margin: 2px 0;
    }
    .signature-date { 
      font-size: 11px; 
      color: #999; 
      margin-top: 5px;
    }
    
    @media print { 
      .no-print { display: none; }
      .signature-section { page-break-before: auto; }
      body { margin: 20px; }
    }
  </style>
</head>
<body>
  <h1>📄 ${agreement.title || 'Agreement'}</h1>
  
  <div class="info">
    <strong>Agreement Number:</strong> ${agreement.agreement_number}<br>
    <strong>Status:</strong> <span class="status status-active">${agreement.status}</span><br>
    <strong>Created:</strong> ${new Date(agreement.created_at).toLocaleDateString()}<br>
    ${agreement.agency_signed_at ? `<strong>Fully Signed:</strong> ${new Date(agreement.agency_signed_at).toLocaleDateString()}<br>` : ''}
  </div>
  
  <h2>📋 Parties</h2>
  <div class="info">
    <strong>🏢 Agency:</strong> ${agency?.name || 'N/A'}<br>
    <strong>Email:</strong> ${agency?.email || 'N/A'}<br>
    <strong>Phone:</strong> ${agency?.phone || 'N/A'}<br><br>
    
    <strong>👤 ${(downloadToken.agreementType === 'project' || downloadToken.agreementType === 'model') ? 'Model' : 'Customer'}:</strong> ${customer?.name || 'N/A'}<br>
    <strong>Email:</strong> ${customer?.email || 'N/A'}<br>
    ${customer?.phone ? `<strong>Phone:</strong> ${customer.phone}<br>` : ''}
  </div>
  
  <h2>📝 Agreement Content</h2>
  <div style="white-space: pre-wrap; background: #f9f9f9; padding: 20px; border-radius: 5px; border-left: 4px solid #8b5cf6;">
${agreement.content}
  </div>
  
  <!-- Signature Section: Side by side, centered, at bottom -->
  <div class="signature-section">
    <h2 style="text-align: center; margin-bottom: 40px;">SIGNATURES</h2>
    
    <div class="signature-container">
      <!-- Agency Signature -->
      <div class="signature-box">
        <div class="signature-line">
          ${agreement.agency_signature ? `
            <img src="${agreement.agency_signature}" class="signature-img" alt="Agency Signature">
          ` : `<span style="color: #999; font-size: 12px;">Pending Signature</span>`}
        </div>
        <div class="signature-name">${agency?.name || 'Agency Name'}</div>
        <div class="signature-title">Agency / Representative</div>
        ${agreement.agency_signed_at ? `
          <div class="signature-date">Signed: ${new Date(agreement.agency_signed_at).toLocaleDateString()}</div>
        ` : ''}
      </div>
      
      <!-- Model/Customer Signature -->
      <div class="signature-box">
        <div class="signature-line">
          ${agreement.customer_signature ? `
            <img src="${agreement.customer_signature}" class="signature-img" alt="${(downloadToken.agreementType === 'project' || downloadToken.agreementType === 'model') ? 'Model' : 'Customer'} Signature">
          ` : `<span style="color: #999; font-size: 12px;">Pending Signature</span>`}
        </div>
        <div class="signature-name">${customer?.name || ((downloadToken.agreementType === 'project' || downloadToken.agreementType === 'model') ? 'Model Name' : 'Customer Name')}</div>
        <div class="signature-title">${(downloadToken.agreementType === 'project' || downloadToken.agreementType === 'model') ? 'Model Signature' : 'Customer'}</div>
        ${agreement.customer_signed_at ? `
          <div class="signature-date">Signed: ${new Date(agreement.customer_signed_at).toLocaleDateString()}</div>
        ` : ''}
      </div>
    </div>
  </div>
  
  <div class="no-print" style="margin-top: 40px; padding: 20px; background: #f0fdf4; border-radius: 8px;">
    <h3>📥 Download Options</h3>
    <p><strong>Print as PDF:</strong> Use your browser's print function (Ctrl+P / Cmd+P) and select "Save as PDF"</p>
    <button onclick="window.print()" class="download-btn">🖨️ Print / Save as PDF</button>
  </div>
  
  <div style="margin-top: 40px; padding: 20px; background: #f9fafb; border-top: 2px solid #e5e7eb; font-size: 12px; color: #6b7280;">
    <p><strong>Agreement Management System</strong></p>
    <p>This is a legally binding agreement. Both parties have digitally signed this document.</p>
    <p>Download Link Generated: ${new Date(downloadToken.createdAt).toLocaleString()}</p>
    <p>Link Expires: ${new Date(downloadToken.expiresAt).toLocaleDateString()}</p>
  </div>
</body>
</html>
      `;
      
      res.send(html);
      
    } catch (error) {
      console.error('Error generating download:', error);
      res.status(500).send('<h1>Error</h1><p>An error occurred while generating the download.</p>');
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Agreement Management System running on http://0.0.0.0:${PORT}`);
    console.log(`📊 Database: ${DB_FILE}`);
  });
});
