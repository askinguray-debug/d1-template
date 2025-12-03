import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

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
          content: 'WEB DEVELOPMENT & MAINTENANCE AGREEMENT\n\nAgency: {{AGENCY_NAME}}\nClient: {{CUSTOMER_NAME}}\n\nSCOPE OF WORK:\n{{SERVICES}}\n\nMONTHLY MAINTENANCE FEE: {{MONTHLY_PAYMENT}}\nDue Date: {{PAYMENT_DAY}} of each month\nAgreement Duration: {{START_DATE}} - {{END_DATE}}',
          created_at: new Date().toISOString()
        }
      ],
      agreements: [],
      reminders: [],
      emailSettings: {
        provider: 'sendgrid',
        api_key: '',
        from_email: 'noreply@yourcompany.com',
        from_name: 'Agreement System',
        reminder_days_before: 3
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
    } else if (req.body.party === 'customer') {
      db.agreements[index].customer_signed = 1;
      db.agreements[index].customer_signature = req.body.signature;
      db.agreements[index].customer_signed_at = new Date().toISOString();
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
// EMAIL SETTINGS API
// ======================
app.get('/api/email-settings', async (req, res) => {
  const db = await readDB();
  res.json(db.emailSettings || {});
});

app.post('/api/email-settings', async (req, res) => {
  const db = await readDB();
  db.emailSettings = {
    ...req.body,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  await writeDB(db);
  res.json(db.emailSettings);
});

app.put('/api/email-settings/:id', async (req, res) => {
  const db = await readDB();
  db.emailSettings = {
    ...db.emailSettings,
    ...req.body,
    updated_at: new Date().toISOString()
  };
  await writeDB(db);
  res.json(db.emailSettings);
});

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
initDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Agreement Management System running on http://0.0.0.0:${PORT}`);
    console.log(`📊 Database: ${DB_FILE}`);
  });
});
