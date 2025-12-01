-- Insert sample agencies
INSERT OR IGNORE INTO agencies (id, name, email, phone, address, is_active) VALUES 
  (1, 'Creative Agency Ltd', 'info@creativeagency.com', '+1-555-0101', '123 Business Ave, Suite 100', 1),
  (2, 'Digital Solutions Inc', 'contact@digitalsolutions.com', '+1-555-0102', '456 Tech Plaza, Floor 5', 1),
  (3, 'Marketing Pro Agency', 'hello@marketingpro.com', '+1-555-0103', '789 Marketing Street', 1);

-- Insert sample customers
INSERT OR IGNORE INTO customers (id, name, email, phone, company) VALUES 
  (1, 'John Smith', 'john.smith@example.com', '+1-555-1001', 'Smith Enterprises'),
  (2, 'Sarah Johnson', 'sarah.j@techcorp.com', '+1-555-1002', 'TechCorp LLC'),
  (3, 'Michael Brown', 'mbrown@retailco.com', '+1-555-1003', 'RetailCo');

-- Insert sample agreement templates
INSERT OR IGNORE INTO agreement_templates (id, name, description, content) VALUES 
  (1, 'Standard Service Agreement', 'Basic service agreement template', 
   'This agreement is entered into between {{AGENCY_NAME}} (hereinafter "Agency") and {{CUSTOMER_NAME}} (hereinafter "Client"). 

SERVICES: The Agency agrees to provide the following services:
{{SERVICES}}

PAYMENT TERMS: The Client agrees to pay {{MONTHLY_PAYMENT}} per month, due on the {{PAYMENT_DAY}} day of each month.

TERM: This agreement shall commence on {{START_DATE}} and continue until {{END_DATE}} unless terminated earlier.'),
  
  (2, 'Digital Marketing Agreement', 'Agreement for digital marketing services',
   'DIGITAL MARKETING SERVICES AGREEMENT

Between: {{AGENCY_NAME}}
And: {{CUSTOMER_NAME}}

The Agency will provide comprehensive digital marketing services including:
{{SERVICES}}

Monthly Investment: {{MONTHLY_PAYMENT}}
Payment Schedule: {{PAYMENT_DAY}} of each month
Contract Period: {{START_DATE}} to {{END_DATE}}'),
  
  (3, 'Web Development Agreement', 'Website development and maintenance agreement',
   'WEB DEVELOPMENT & MAINTENANCE AGREEMENT

Agency: {{AGENCY_NAME}}
Client: {{CUSTOMER_NAME}}

SCOPE OF WORK:
{{SERVICES}}

MONTHLY MAINTENANCE FEE: {{MONTHLY_PAYMENT}}
Due Date: {{PAYMENT_DAY}} of each month
Agreement Duration: {{START_DATE}} - {{END_DATE}}');

-- Insert email settings template
INSERT OR IGNORE INTO email_settings (id, provider, api_key, from_email, from_name, reminder_days_before) VALUES 
  (1, 'sendgrid', 'YOUR_API_KEY_HERE', 'noreply@yourcompany.com', 'Agreement System', 3);
