export type Bindings = {
  DB: D1Database;
}

export interface Agency {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  logo_url?: string;
  is_active?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Customer {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  company?: string;
  tax_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AgreementTemplate {
  id?: number;
  name: string;
  description?: string;
  content: string;
  signature_required?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Agreement {
  id?: number;
  agreement_number: string;
  agency_id: number;
  customer_id: number;
  template_id?: number;
  title: string;
  content: string;
  monthly_payment?: number;
  payment_day?: number;
  start_date: string;
  end_date?: string;
  status?: string;
  agency_signed?: number;
  customer_signed?: number;
  agency_signature?: string;
  customer_signature?: string;
  agency_signed_at?: string;
  customer_signed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentReminder {
  id?: number;
  agreement_id: number;
  due_date: string;
  amount: number;
  status?: string;
  sent_at?: string;
  paid_at?: string;
  created_at?: string;
}

export interface EmailSettings {
  id?: number;
  provider: string;
  api_key: string;
  from_email: string;
  from_name?: string;
  reminder_days_before?: number;
  is_active?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceSection {
  id?: number;
  agreement_id: number;
  title: string;
  description?: string;
  price?: number;
  sort_order?: number;
  created_at?: string;
}
