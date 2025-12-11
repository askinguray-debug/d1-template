
// ======================
// INVOICE SYSTEM API
// ======================

// Get all invoices
app.get('/api/invoices', requireAuth, async (req, res) => {
  try {
    const db = await readDB();
    if (!db.invoices) db.invoices = [];
    
    // Get invoices with customer and agreement details
    const invoicesWithDetails = db.invoices.map(invoice => {
      const customer = db.customers.find(c => c.id === invoice.customer_id);
      const agreement = db.agreements.find(a => a.id === invoice.agreement_id);
      return {
        ...invoice,
        customer_name: customer?.name || '',
        customer_email: customer?.email || '',
        customer_company: customer?.company || '',
        agreement_title: agreement?.title || '',
        agreement_number: agreement?.agreement_number || ''
      };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    res.json(invoicesWithDetails);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single invoice
app.get('/api/invoices/:id', requireAuth, async (req, res) => {
  try {
    const db = await readDB();
    if (!db.invoices) db.invoices = [];
    
    const invoice = db.invoices.find(i => i.id === parseInt(req.params.id));
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    const customer = db.customers.find(c => c.id === invoice.customer_id);
    const agreement = db.agreements.find(a => a.id === invoice.agreement_id);
    const agency = db.agencies.find(a => a.id === agreement?.agency_id);
    
    res.json({
      ...invoice,
      customer,
      agreement,
      agency
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create invoice manually
app.post('/api/invoices', requireAuth, async (req, res) => {
  try {
    const db = await readDB();
    if (!db.invoices) db.invoices = [];
    if (!db.invoiceSettings) {
      return res.status(400).json({ error: 'Invoice settings not configured' });
    }
    
    const settings = db.invoiceSettings;
    const invoiceNumber = `${settings.invoice_prefix}-${settings.invoice_number_start + db.invoices.length}`;
    
    const newInvoice = {
      id: getNextId(db.invoices),
      invoice_number: invoiceNumber,
      agreement_id: req.body.agreement_id,
      customer_id: req.body.customer_id,
      issue_date: req.body.issue_date || new Date().toISOString().split('T')[0],
      due_date: req.body.due_date,
      items: req.body.items || [],
      subtotal: req.body.subtotal || 0,
      tax_rate: req.body.tax_rate || settings.tax_rate,
      tax_amount: req.body.tax_amount || 0,
      total: req.body.total || 0,
      currency: req.body.currency || settings.currency,
      status: 'pending', // pending, paid, overdue, cancelled
      paid_date: null,
      notes: req.body.notes || settings.notes,
      payment_method: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    db.invoices.push(newInvoice);
    await writeDB(db);
    
    res.json(newInvoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate invoice from agreement
app.post('/api/agreements/:id/generate-invoice', requireAuth, async (req, res) => {
  try {
    const db = await readDB();
    if (!db.invoices) db.invoices = [];
    if (!db.invoiceSettings) {
      return res.status(400).json({ error: 'Invoice settings not configured' });
    }
    
    const agreement = db.agreements.find(a => a.id === parseInt(req.params.id));
    if (!agreement) {
      return res.status(404).json({ error: 'Agreement not found' });
    }
    
    const settings = db.invoiceSettings;
    const invoiceNumber = `${settings.invoice_prefix}-${settings.invoice_number_start + db.invoices.length}`;
    
    // Calculate dates
    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + settings.payment_terms_days);
    
    // Create invoice items from agreement services
    const items = agreement.services?.map(service => ({
      description: service.name,
      details: service.description,
      quantity: 1,
      unit_price: parseFloat(service.price) || 0,
      amount: parseFloat(service.price) || 0
    })) || [];
    
    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = subtotal * (settings.tax_rate / 100);
    const total = subtotal + taxAmount;
    
    const newInvoice = {
      id: getNextId(db.invoices),
      invoice_number: invoiceNumber,
      agreement_id: agreement.id,
      customer_id: agreement.customer_id,
      issue_date: issueDate.toISOString().split('T')[0],
      due_date: dueDate.toISOString().split('T')[0],
      period_start: req.body.period_start || issueDate.toISOString().split('T')[0],
      period_end: req.body.period_end || issueDate.toISOString().split('T')[0],
      items: items,
      subtotal: subtotal,
      tax_rate: settings.tax_rate,
      tax_name: settings.tax_name,
      tax_amount: taxAmount,
      total: total,
      currency: settings.currency,
      status: 'pending',
      paid_date: null,
      notes: settings.notes,
      payment_method: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    db.invoices.push(newInvoice);
    await writeDB(db);
    
    res.json(newInvoice);
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send invoice via email
app.post('/api/invoices/:id/send', requireAuth, async (req, res) => {
  try {
    const db = await readDB();
    const invoice = db.invoices.find(i => i.id === parseInt(req.params.id));
    
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    const customer = db.customers.find(c => c.id === invoice.customer_id);
    const agreement = db.agreements.find(a => a.id === invoice.agreement_id);
    const agency = db.agencies.find(a => a.id === agreement?.agency_id);
    const emailSettings = db.emailSettings || {};
    
    if (!customer?.email) {
      return res.status(400).json({ error: 'Customer email not found' });
    }
    
    // Generate invoice HTML
    const invoiceHTML = generateInvoiceHTML(invoice, customer, agreement, agency, db.invoiceSettings);
    
    // Send email
    await sendEmail(emailSettings, {
      from: emailSettings.from_email,
      to: customer.email,
      subject: `Invoice ${invoice.invoice_number} from ${agency?.name || 'Agency'}`,
      html: invoiceHTML
    });
    
    // Update invoice sent status
    invoice.email_sent = true;
    invoice.email_sent_at = new Date().toISOString();
    await writeDB(db);
    
    res.json({ success: true, message: 'Invoice sent successfully' });
  } catch (error) {
    console.error('Error sending invoice:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark invoice as paid
app.put('/api/invoices/:id/mark-paid', requireAuth, async (req, res) => {
  try {
    const db = await readDB();
    const invoice = db.invoices.find(i => i.id === parseInt(req.params.id));
    
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    invoice.status = 'paid';
    invoice.paid_date = req.body.paid_date || new Date().toISOString().split('T')[0];
    invoice.payment_method = req.body.payment_method || 'Unknown';
    invoice.updated_at = new Date().toISOString();
    
    await writeDB(db);
    res.json({ success: true, invoice });
  } catch (error) {
    console.error('Error marking invoice as paid:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update invoice
app.put('/api/invoices/:id', requireAuth, async (req, res) => {
  try {
    const db = await readDB();
    const index = db.invoices.findIndex(i => i.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    db.invoices[index] = {
      ...db.invoices[index],
      ...req.body,
      id: parseInt(req.params.id),
      updated_at: new Date().toISOString()
    };
    
    await writeDB(db);
    res.json(db.invoices[index]);
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete invoice
app.delete('/api/invoices/:id', requireAuth, async (req, res) => {
  try {
    const db = await readDB();
    db.invoices = db.invoices.filter(i => i.id !== parseInt(req.params.id));
    await writeDB(db);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get invoice settings
app.get('/api/invoice-settings', requireAuth, async (req, res) => {
  try {
    const db = await readDB();
    res.json(db.invoiceSettings || {});
  } catch (error) {
    console.error('Error fetching invoice settings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update invoice settings
app.put('/api/invoice-settings', requireAuth, async (req, res) => {
  try {
    const db = await readDB();
    db.invoiceSettings = {
      ...db.invoiceSettings,
      ...req.body,
      updated_at: new Date().toISOString()
    };
    await writeDB(db);
    res.json(db.invoiceSettings);
  } catch (error) {
    console.error('Error updating invoice settings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate invoices for all active agreements (monthly automation)
app.post('/api/invoices/generate-monthly', requireAuth, async (req, res) => {
  try {
    const db = await readDB();
    if (!db.invoices) db.invoices = [];
    if (!db.invoiceSettings) {
      return res.status(400).json({ error: 'Invoice settings not configured' });
    }
    
    const settings = db.invoiceSettings;
    const activeAgreements = db.agreements.filter(a => a.status === 'active');
    const generatedInvoices = [];
    
    for (const agreement of activeAgreements) {
      // Check if invoice already generated this month
      const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
      const existingInvoice = db.invoices.find(inv => 
        inv.agreement_id === agreement.id && 
        inv.issue_date.startsWith(currentMonth)
      );
      
      if (existingInvoice) {
        continue; // Skip if already generated this month
      }
      
      const invoiceNumber = `${settings.invoice_prefix}-${settings.invoice_number_start + db.invoices.length}`;
      
      const issueDate = new Date();
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + settings.payment_terms_days);
      
      const items = agreement.services?.map(service => ({
        description: service.name,
        details: service.description,
        quantity: 1,
        unit_price: parseFloat(service.price) || 0,
        amount: parseFloat(service.price) || 0
      })) || [];
      
      const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
      const taxAmount = subtotal * (settings.tax_rate / 100);
      const total = subtotal + taxAmount;
      
      const newInvoice = {
        id: getNextId(db.invoices),
        invoice_number: invoiceNumber,
        agreement_id: agreement.id,
        customer_id: agreement.customer_id,
        issue_date: issueDate.toISOString().split('T')[0],
        due_date: dueDate.toISOString().split('T')[0],
        period_start: new Date(issueDate.getFullYear(), issueDate.getMonth(), 1).toISOString().split('T')[0],
        period_end: new Date(issueDate.getFullYear(), issueDate.getMonth() + 1, 0).toISOString().split('T')[0],
        items: items,
        subtotal: subtotal,
        tax_rate: settings.tax_rate,
        tax_name: settings.tax_name,
        tax_amount: taxAmount,
        total: total,
        currency: settings.currency,
        status: 'pending',
        paid_date: null,
        notes: settings.notes,
        payment_method: null,
        auto_generated: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      db.invoices.push(newInvoice);
      generatedInvoices.push(newInvoice);
    }
    
    await writeDB(db);
    
    // Auto-send if enabled
    if (settings.auto_send_enabled && generatedInvoices.length > 0) {
      const emailSettings = db.emailSettings || {};
      let sentCount = 0;
      
      for (const invoice of generatedInvoices) {
        try {
          const customer = db.customers.find(c => c.id === invoice.customer_id);
          const agreement = db.agreements.find(a => a.id === invoice.agreement_id);
          const agency = db.agencies.find(a => a.id === agreement?.agency_id);
          
          if (customer?.email) {
            const invoiceHTML = generateInvoiceHTML(invoice, customer, agreement, agency, settings);
            
            await sendEmail(emailSettings, {
              from: emailSettings.from_email,
              to: customer.email,
              subject: `Invoice ${invoice.invoice_number} from ${agency?.name || 'Agency'}`,
              html: invoiceHTML
            });
            
            invoice.email_sent = true;
            invoice.email_sent_at = new Date().toISOString();
            sentCount++;
          }
        } catch (emailError) {
          console.error(`Failed to send invoice ${invoice.invoice_number}:`, emailError);
        }
      }
      
      await writeDB(db);
      
      res.json({
        success: true,
        generated: generatedInvoices.length,
        sent: sentCount,
        invoices: generatedInvoices
      });
    } else {
      res.json({
        success: true,
        generated: generatedInvoices.length,
        sent: 0,
        invoices: generatedInvoices
      });
    }
  } catch (error) {
    console.error('Error generating monthly invoices:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to generate invoice HTML
function generateInvoiceHTML(invoice, customer, agreement, agency, settings) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice.currency || 'USD'
    }).format(amount);
  };
  
  const itemsHTML = invoice.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <strong>${item.description}</strong>
        ${item.details ? `<br><span style="font-size: 14px; color: #6b7280;">${item.details}</span>` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.unit_price)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;"><strong>${formatCurrency(item.amount)}</strong></td>
    </tr>
  `).join('');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice ${invoice.invoice_number}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
      
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 32px;">INVOICE</h1>
        <p style="margin: 5px 0 0 0; font-size: 18px; opacity: 0.9;">${invoice.invoice_number}</p>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
        
        <!-- From/To Section -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
          <div style="flex: 1;">
            <h3 style="margin: 0 0 10px 0; color: #667eea;">From:</h3>
            <p style="margin: 0; line-height: 1.8;">
              <strong>${agency?.name || 'Agency Name'}</strong><br>
              ${agency?.email || ''}<br>
              ${agency?.phone || ''}<br>
              ${agency?.address || ''}
            </p>
          </div>
          <div style="flex: 1; text-align: right;">
            <h3 style="margin: 0 0 10px 0; color: #667eea;">To:</h3>
            <p style="margin: 0; line-height: 1.8;">
              <strong>${customer?.name || 'Customer Name'}</strong><br>
              ${customer?.company ? customer.company + '<br>' : ''}
              ${customer?.email || ''}<br>
              ${customer?.phone || ''}<br>
              ${customer?.address || ''}
            </p>
          </div>
        </div>
        
        <!-- Invoice Details -->
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <div style="display: flex; justify-content: space-between;">
            <div>
              <p style="margin: 0 0 10px 0;"><strong>Issue Date:</strong> ${invoice.issue_date}</p>
              <p style="margin: 0;"><strong>Due Date:</strong> ${invoice.due_date}</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0 0 10px 0;"><strong>Agreement:</strong> ${agreement?.agreement_number || 'N/A'}</p>
              <p style="margin: 0;"><strong>Status:</strong> <span style="background: ${invoice.status === 'paid' ? '#10b981' : '#f59e0b'}; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; text-transform: uppercase;">${invoice.status}</span></p>
            </div>
          </div>
        </div>
        
        <!-- Period (if applicable) -->
        ${invoice.period_start && invoice.period_end ? `
        <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin-bottom: 30px; border-radius: 4px;">
          <p style="margin: 0; color: #1e40af;"><strong>Billing Period:</strong> ${invoice.period_start} to ${invoice.period_end}</p>
        </div>
        ` : ''}
        
        <!-- Items Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #667eea;">Description</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #667eea; width: 80px;">Qty</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #667eea; width: 120px;">Unit Price</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #667eea; width: 120px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>
        
        <!-- Totals -->
        <div style="text-align: right; margin-bottom: 30px;">
          <div style="display: inline-block; text-align: right; min-width: 300px;">
            <div style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="display: inline-block; width: 150px;">Subtotal:</span>
              <strong>${formatCurrency(invoice.subtotal)}</strong>
            </div>
            ${invoice.tax_amount > 0 ? `
            <div style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="display: inline-block; width: 150px;">${invoice.tax_name || 'Tax'} (${invoice.tax_rate}%):</span>
              <strong>${formatCurrency(invoice.tax_amount)}</strong>
            </div>
            ` : ''}
            <div style="padding: 12px 0; font-size: 20px; color: #667eea;">
              <span style="display: inline-block; width: 150px;">Total:</span>
              <strong>${formatCurrency(invoice.total)}</strong>
            </div>
          </div>
        </div>
        
        <!-- Notes -->
        ${invoice.notes ? `
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
          <p style="margin: 0; color: #92400e;"><strong>Notes:</strong></p>
          <p style="margin: 10px 0 0 0; color: #92400e;">${invoice.notes}</p>
        </div>
        ` : ''}
        
        <!-- Footer -->
        <div style="text-align: center; padding-top: 20px; border-top: 2px solid #e5e7eb; color: #6b7280; font-size: 14px;">
          <p style="margin: 0;">Thank you for your business!</p>
          <p style="margin: 10px 0 0 0;">For any questions regarding this invoice, please contact us at ${agency?.email || ''}</p>
        </div>
        
      </div>
      
    </body>
    </html>
  `;
}

