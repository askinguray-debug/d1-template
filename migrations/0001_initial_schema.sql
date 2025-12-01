-- Agencies table (2-3 selectable agencies)
CREATE TABLE IF NOT EXISTS agencies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  logo_url TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Customers table (unlimited customers)
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  company TEXT,
  tax_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Agreement templates
CREATE TABLE IF NOT EXISTS agreement_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  signature_required INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Agreements
CREATE TABLE IF NOT EXISTS agreements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agreement_number TEXT UNIQUE NOT NULL,
  agency_id INTEGER NOT NULL,
  customer_id INTEGER NOT NULL,
  template_id INTEGER,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  monthly_payment REAL,
  payment_day INTEGER DEFAULT 1,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'draft',
  agency_signed INTEGER DEFAULT 0,
  customer_signed INTEGER DEFAULT 0,
  agency_signature TEXT,
  customer_signature TEXT,
  agency_signed_at DATETIME,
  customer_signed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (agency_id) REFERENCES agencies(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (template_id) REFERENCES agreement_templates(id)
);

-- Payment reminders
CREATE TABLE IF NOT EXISTS payment_reminders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agreement_id INTEGER NOT NULL,
  due_date DATE NOT NULL,
  amount REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  sent_at DATETIME,
  paid_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (agreement_id) REFERENCES agreements(id)
);

-- Email settings
CREATE TABLE IF NOT EXISTS email_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider TEXT NOT NULL,
  api_key TEXT NOT NULL,
  from_email TEXT NOT NULL,
  from_name TEXT,
  reminder_days_before INTEGER DEFAULT 3,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Service sections (for agreements)
CREATE TABLE IF NOT EXISTS service_sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agreement_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price REAL,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (agreement_id) REFERENCES agreements(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_agreements_agency_id ON agreements(agency_id);
CREATE INDEX IF NOT EXISTS idx_agreements_customer_id ON agreements(customer_id);
CREATE INDEX IF NOT EXISTS idx_agreements_status ON agreements(status);
CREATE INDEX IF NOT EXISTS idx_payment_reminders_agreement_id ON payment_reminders(agreement_id);
CREATE INDEX IF NOT EXISTS idx_payment_reminders_status ON payment_reminders(status);
CREATE INDEX IF NOT EXISTS idx_service_sections_agreement_id ON service_sections(agreement_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
