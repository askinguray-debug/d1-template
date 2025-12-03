// Global state
let agencies = [];
let customers = [];
let templates = [];
let agreements = [];
let reminders = [];
let serviceSectionCounter = 0;
let serviceLibrary = [];

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    await loadAllData();
    updateDashboard();
    
    // Setup form handlers
    document.getElementById('agency-form').addEventListener('submit', handleAgencySave);
    document.getElementById('customer-form').addEventListener('submit', handleCustomerSave);
    document.getElementById('template-form').addEventListener('submit', handleTemplateSave);
    document.getElementById('email-settings-form').addEventListener('submit', handleEmailSettingsSave);
    document.getElementById('new-agreement-form').addEventListener('submit', handleAgreementSave);
    
    // Template change handler
    document.getElementById('agreement-template').addEventListener('change', handleTemplateChange);
});

// Tab navigation
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    
    // Update nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Load data for specific tabs
    if (tabName === 'agreements') loadAgreements();
    if (tabName === 'customers') loadCustomers();
    if (tabName === 'templates') loadTemplates();
    if (tabName === 'reminders') loadReminders();
    if (tabName === 'settings') loadSettings();
    if (tabName === 'new-agreement') loadNewAgreementForm();
}

// Load all data
async function loadAllData() {
    try {
        const [agenciesRes, customersRes, templatesRes, agreementsRes, remindersRes, serviceLibraryRes] = await Promise.all([
            axios.get('/api/agencies'),
            axios.get('/api/customers'),
            axios.get('/api/templates'),
            axios.get('/api/agreements'),
            axios.get('/api/reminders/pending'),
            axios.get('/api/service-library')
        ]);
        
        agencies = agenciesRes.data;
        customers = customersRes.data;
        templates = templatesRes.data;
        agreements = agreementsRes.data;
        reminders = remindersRes.data;
        serviceLibrary = serviceLibraryRes.data;
    } catch (error) {
        console.error('Error loading data:', error);
        showNotification('Error loading data', 'error');
    }
}

// Update dashboard
function updateDashboard() {
    const activeAgreements = agreements.filter(a => a.status === 'active').length;
    const totalRevenue = agreements
        .filter(a => a.status === 'active')
        .reduce((sum, a) => sum + (parseFloat(a.monthly_payment) || 0), 0);
    
    document.getElementById('stat-active').textContent = activeAgreements;
    document.getElementById('stat-customers').textContent = customers.length;
    document.getElementById('stat-reminders').textContent = reminders.length;
    document.getElementById('stat-revenue').textContent = '$' + totalRevenue.toFixed(2);
    
    // Recent agreements
    const recentAgreements = agreements.slice(0, 5);
    const recentHtml = recentAgreements.map(agreement => `
        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer" onclick="viewAgreement(${agreement.id})">
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="font-semibold text-gray-900">${agreement.title}</h3>
                    <p class="text-sm text-gray-600 mt-1">${agreement.customer_name} - ${agreement.agency_name}</p>
                </div>
                <span class="px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(agreement.status)}">
                    ${agreement.status}
                </span>
            </div>
            <div class="flex justify-between items-center mt-3 text-sm text-gray-500">
                <span><i class="fas fa-calendar mr-1"></i>${formatDate(agreement.start_date)}</span>
                ${agreement.monthly_payment ? `<span><i class="fas fa-dollar-sign mr-1"></i>${agreement.monthly_payment}/mo</span>` : ''}
            </div>
        </div>
    `).join('');
    
    document.getElementById('recent-agreements').innerHTML = recentHtml || '<p class="text-gray-500">No agreements yet</p>';
}

// Load agreements
function loadAgreements() {
    const agreementsHtml = agreements.map(agreement => `
        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <div class="flex items-center gap-3">
                        <h3 class="font-semibold text-gray-900">${agreement.title}</h3>
                        <span class="px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(agreement.status)}">
                            ${agreement.status}
                        </span>
                    </div>
                    <p class="text-sm text-gray-600 mt-1">
                        <i class="fas fa-building mr-1"></i>${agreement.agency_name} → 
                        <i class="fas fa-user ml-2 mr-1"></i>${agreement.customer_name}
                    </p>
                    <div class="flex gap-4 mt-2 text-sm text-gray-500">
                        <span><i class="fas fa-calendar mr-1"></i>${formatDate(agreement.start_date)}</span>
                        ${agreement.monthly_payment ? `<span><i class="fas fa-dollar-sign mr-1"></i>$${agreement.monthly_payment}/mo</span>` : ''}
                        <span><i class="fas fa-file-contract mr-1"></i>${agreement.agreement_number}</span>
                    </div>
                    <div class="flex gap-2 mt-3">
                        ${agreement.agency_signed ? '<span class="text-xs text-green-600"><i class="fas fa-check-circle mr-1"></i>Agency Signed</span>' : ''}
                        ${agreement.customer_signed ? '<span class="text-xs text-green-600"><i class="fas fa-check-circle mr-1"></i>Customer Signed</span>' : ''}
                    </div>
                </div>
                <div class="flex gap-2">
                    <button onclick="viewAgreement(${agreement.id})" class="text-blue-600 hover:text-blue-800 px-3 py-1 rounded">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="deleteAgreement(${agreement.id})" class="text-red-600 hover:text-red-800 px-3 py-1 rounded">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    document.getElementById('agreements-list').innerHTML = agreementsHtml || '<p class="text-gray-500">No agreements yet</p>';
}

// Load customers
function loadCustomers() {
    const customersHtml = customers.map(customer => `
        <div class="border border-gray-200 rounded-lg p-4">
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="font-semibold text-gray-900">${customer.name}</h3>
                    <p class="text-sm text-gray-600 mt-1">
                        <i class="fas fa-envelope mr-1"></i>${customer.email}
                    </p>
                    ${customer.company ? `<p class="text-sm text-gray-600"><i class="fas fa-building mr-1"></i>${customer.company}</p>` : ''}
                    ${customer.phone ? `<p class="text-sm text-gray-600"><i class="fas fa-phone mr-1"></i>${customer.phone}</p>` : ''}
                </div>
                <div class="flex gap-2">
                    <button onclick="editCustomer(${customer.id})" class="text-blue-600 hover:text-blue-800 px-3 py-1 rounded">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteCustomer(${customer.id})" class="text-red-600 hover:text-red-800 px-3 py-1 rounded">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    document.getElementById('customers-list').innerHTML = customersHtml || '<p class="text-gray-500">No customers yet</p>';
}

// Load templates
function loadTemplates() {
    const templatesHtml = templates.map(template => `
        <div class="border border-gray-200 rounded-lg p-4">
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="font-semibold text-gray-900">${template.name}</h3>
                    ${template.description ? `<p class="text-sm text-gray-600 mt-1">${template.description}</p>` : ''}
                </div>
                <div class="flex gap-2">
                    <button onclick="editTemplate(${template.id})" class="text-blue-600 hover:text-blue-800 px-3 py-1 rounded">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteTemplate(${template.id})" class="text-red-600 hover:text-red-800 px-3 py-1 rounded">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    document.getElementById('templates-list').innerHTML = templatesHtml || '<p class="text-gray-500">No templates yet</p>';
}

// Load reminders
function loadReminders() {
    const remindersHtml = reminders.map(reminder => `
        <div class="border border-gray-200 rounded-lg p-4">
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="font-semibold text-gray-900">${reminder.agreement_title}</h3>
                    <p class="text-sm text-gray-600 mt-1">
                        <i class="fas fa-user mr-1"></i>${reminder.customer_name}
                    </p>
                    <div class="flex gap-4 mt-2 text-sm">
                        <span class="text-gray-600"><i class="fas fa-calendar mr-1"></i>Due: ${formatDate(reminder.due_date)}</span>
                        <span class="text-gray-900 font-medium"><i class="fas fa-dollar-sign mr-1"></i>${reminder.amount}</span>
                    </div>
                </div>
                <button onclick="markReminderPaid(${reminder.id})" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm">
                    <i class="fas fa-check mr-1"></i>Mark Paid
                </button>
            </div>
        </div>
    `).join('');
    
    document.getElementById('reminders-list').innerHTML = remindersHtml || '<p class="text-gray-500">No pending reminders</p>';
}

// Load settings
async function loadSettings() {
    // Load agencies
    const agenciesHtml = agencies.map(agency => `
        <div class="border border-gray-200 rounded-lg p-3">
            <div class="flex justify-between items-start">
                <div>
                    <h4 class="font-medium text-gray-900">${agency.name}</h4>
                    ${agency.email ? `<p class="text-xs text-gray-600 mt-1">${agency.email}</p>` : ''}
                    <span class="inline-block mt-2 px-2 py-1 text-xs rounded ${agency.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                        ${agency.is_active ? 'Active' : 'Inactive'}
                    </span>
                </div>
                <div class="flex gap-1">
                    <button onclick="editAgency(${agency.id})" class="text-blue-600 hover:text-blue-800 p-1">
                        <i class="fas fa-edit text-sm"></i>
                    </button>
                    <button onclick="deleteAgency(${agency.id})" class="text-red-600 hover:text-red-800 p-1">
                        <i class="fas fa-trash text-sm"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    document.getElementById('agencies-list').innerHTML = agenciesHtml || '<p class="text-gray-500 text-sm">No agencies yet</p>';
    
    // Load email settings
    try {
        const res = await axios.get('/api/email-settings');
        if (res.data && res.data.id) {
            document.getElementById('email-settings-id').value = res.data.id;
            document.getElementById('email-provider').value = res.data.provider;
            document.getElementById('email-api-key').value = res.data.api_key;
            document.getElementById('email-from').value = res.data.from_email;
            document.getElementById('email-from-name').value = res.data.from_name || '';
            document.getElementById('email-reminder-days').value = res.data.reminder_days_before || 3;
        }
    } catch (error) {
        console.error('Error loading email settings:', error);
    }
}

// Load new agreement form
function loadNewAgreementForm() {
    // Load active agencies
    const agencyOptions = agencies
        .filter(a => a.is_active)
        .map(a => `<option value="${a.id}">${a.name}</option>`)
        .join('');
    document.getElementById('agreement-agency').innerHTML = '<option value="">Select Agency</option>' + agencyOptions;
    
    // Load customers
    const customerOptions = customers
        .map(c => `<option value="${c.id}">${c.name} (${c.company || c.email})</option>`)
        .join('');
    document.getElementById('agreement-customer').innerHTML = '<option value="">Select Customer</option>' + customerOptions;
    
    // Load templates
    const templateOptions = templates
        .map(t => `<option value="${t.id}">${t.name}</option>`)
        .join('');
    document.getElementById('agreement-template').innerHTML = '<option value="">No Template</option>' + templateOptions;
}

// Agency functions
function showAgencyForm(id = null) {
    document.getElementById('agency-form-modal').classList.remove('hidden');
    if (id) {
        const agency = agencies.find(a => a.id == id);
        if (agency) {
            document.getElementById('agency-id').value = agency.id;
            document.getElementById('agency-name').value = agency.name;
            document.getElementById('agency-email').value = agency.email || '';
            document.getElementById('agency-phone').value = agency.phone || '';
            document.getElementById('agency-address').value = agency.address || '';
            document.getElementById('agency-active').value = agency.is_active;
        }
    } else {
        document.getElementById('agency-form').reset();
        document.getElementById('agency-id').value = '';
    }
}

function closeAgencyForm() {
    document.getElementById('agency-form-modal').classList.add('hidden');
    document.getElementById('agency-form').reset();
}

async function handleAgencySave(e) {
    e.preventDefault();
    const id = document.getElementById('agency-id').value;
    const data = {
        name: document.getElementById('agency-name').value,
        email: document.getElementById('agency-email').value,
        phone: document.getElementById('agency-phone').value,
        address: document.getElementById('agency-address').value,
        is_active: parseInt(document.getElementById('agency-active').value)
    };
    
    try {
        if (id) {
            await axios.put(`/api/agencies/${id}`, data);
            showNotification('Agency updated successfully');
        } else {
            await axios.post('/api/agencies', data);
            showNotification('Agency created successfully');
        }
        closeAgencyForm();
        await loadAllData();
        loadSettings();
    } catch (error) {
        console.error('Error saving agency:', error);
        showNotification('Error saving agency', 'error');
    }
}

function editAgency(id) {
    showAgencyForm(id);
}

async function deleteAgency(id) {
    if (!confirm('Are you sure you want to delete this agency?')) return;
    
    try {
        await axios.delete(`/api/agencies/${id}`);
        showNotification('Agency deleted successfully');
        await loadAllData();
        loadSettings();
    } catch (error) {
        console.error('Error deleting agency:', error);
        showNotification('Error deleting agency', 'error');
    }
}

// Customer functions
function showCustomerForm(id = null) {
    document.getElementById('customer-form-modal').classList.remove('hidden');
    if (id) {
        const customer = customers.find(c => c.id == id);
        if (customer) {
            document.getElementById('customer-id').value = customer.id;
            document.getElementById('customer-name').value = customer.name;
            document.getElementById('customer-email').value = customer.email;
            document.getElementById('customer-phone').value = customer.phone || '';
            document.getElementById('customer-company').value = customer.company || '';
            document.getElementById('customer-tax-id').value = customer.tax_id || '';
            document.getElementById('customer-address').value = customer.address || '';
        }
    } else {
        document.getElementById('customer-form').reset();
        document.getElementById('customer-id').value = '';
    }
}

function closeCustomerForm() {
    document.getElementById('customer-form-modal').classList.add('hidden');
    document.getElementById('customer-form').reset();
}

async function handleCustomerSave(e) {
    e.preventDefault();
    const id = document.getElementById('customer-id').value;
    const data = {
        name: document.getElementById('customer-name').value,
        email: document.getElementById('customer-email').value,
        phone: document.getElementById('customer-phone').value,
        company: document.getElementById('customer-company').value,
        tax_id: document.getElementById('customer-tax-id').value,
        address: document.getElementById('customer-address').value
    };
    
    try {
        if (id) {
            await axios.put(`/api/customers/${id}`, data);
            showNotification('Customer updated successfully');
        } else {
            await axios.post('/api/customers', data);
            showNotification('Customer created successfully');
        }
        closeCustomerForm();
        await loadAllData();
        loadCustomers();
        updateDashboard();
    } catch (error) {
        console.error('Error saving customer:', error);
        showNotification('Error saving customer', 'error');
    }
}

function editCustomer(id) {
    showCustomerForm(id);
}

async function deleteCustomer(id) {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    
    try {
        await axios.delete(`/api/customers/${id}`);
        showNotification('Customer deleted successfully');
        await loadAllData();
        loadCustomers();
        updateDashboard();
    } catch (error) {
        console.error('Error deleting customer:', error);
        showNotification('Error deleting customer', 'error');
    }
}

// Template functions
function showTemplateForm(id = null) {
    document.getElementById('template-form-modal').classList.remove('hidden');
    if (id) {
        const template = templates.find(t => t.id == id);
        if (template) {
            document.getElementById('template-id').value = template.id;
            document.getElementById('template-name').value = template.name;
            document.getElementById('template-description').value = template.description || '';
            document.getElementById('template-content').value = template.content;
        }
    } else {
        document.getElementById('template-form').reset();
        document.getElementById('template-id').value = '';
    }
}

function closeTemplateForm() {
    document.getElementById('template-form-modal').classList.add('hidden');
    document.getElementById('template-form').reset();
}

async function handleTemplateSave(e) {
    e.preventDefault();
    const id = document.getElementById('template-id').value;
    const data = {
        name: document.getElementById('template-name').value,
        description: document.getElementById('template-description').value,
        content: document.getElementById('template-content').value
    };
    
    try {
        if (id) {
            await axios.put(`/api/templates/${id}`, data);
            showNotification('Template updated successfully');
        } else {
            await axios.post('/api/templates', data);
            showNotification('Template created successfully');
        }
        closeTemplateForm();
        await loadAllData();
        loadTemplates();
    } catch (error) {
        console.error('Error saving template:', error);
        showNotification('Error saving template', 'error');
    }
}

function editTemplate(id) {
    showTemplateForm(id);
}

async function deleteTemplate(id) {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    try {
        await axios.delete(`/api/templates/${id}`);
        showNotification('Template deleted successfully');
        await loadAllData();
        loadTemplates();
    } catch (error) {
        console.error('Error deleting template:', error);
        showNotification('Error deleting template', 'error');
    }
}

// Template change handler
async function handleTemplateChange(e) {
    const templateId = e.target.value;
    if (!templateId) {
        document.getElementById('agreement-content').value = '';
        return;
    }
    
    try {
        const res = await axios.get(`/api/templates/${templateId}`);
        const template = res.data;
        document.getElementById('agreement-content').value = template.content;
    } catch (error) {
        console.error('Error loading template:', error);
    }
}

// Service sections
function addServiceSection() {
    serviceSectionCounter++;
    const section = document.createElement('div');
    section.className = 'border border-gray-200 rounded-lg p-3 bg-gray-50';
    section.id = `service-${serviceSectionCounter}`;
    
    // Create service library options
    const serviceOptions = serviceLibrary.map(s => 
        `<option value="${s.id}" data-price="${s.default_price}" data-desc="${s.description}">${s.name} - $${s.default_price}</option>`
    ).join('');
    
    section.innerHTML = `
        <div class="space-y-2">
            <div class="flex gap-3">
                <select class="flex-1 px-3 py-2 border border-gray-300 rounded" data-service-library onchange="fillServiceFromLibrary(${serviceSectionCounter}, this)">
                    <option value="">Select from Service Library (or type custom)</option>
                    ${serviceOptions}
                </select>
                <button type="button" onclick="removeServiceSection(${serviceSectionCounter})" class="text-red-600 hover:text-red-800 px-3">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="flex gap-3">
                <input type="text" placeholder="Service Title *" class="flex-1 px-3 py-2 border border-gray-300 rounded" data-service-title required>
                <input type="number" placeholder="Price" step="0.01" class="w-32 px-3 py-2 border border-gray-300 rounded" data-service-price>
            </div>
            <input type="text" placeholder="Description" class="w-full px-3 py-2 border border-gray-300 rounded" data-service-description>
        </div>
    `;
    document.getElementById('service-sections').appendChild(section);
}

function fillServiceFromLibrary(sectionId, selectElement) {
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    if (!selectedOption.value) return;
    
    const section = document.getElementById(`service-${sectionId}`);
    const title = section.querySelector('[data-service-title]');
    const desc = section.querySelector('[data-service-description]');
    const price = section.querySelector('[data-service-price]');
    
    // Get data from service library
    const serviceId = parseInt(selectedOption.value);
    const service = serviceLibrary.find(s => s.id === serviceId);
    
    if (service) {
        title.value = service.name;
        desc.value = service.description;
        price.value = service.default_price;
    }
}

function removeServiceSection(id) {
    document.getElementById(`service-${id}`).remove();
}

function getServiceSections() {
    const sections = [];
    document.querySelectorAll('#service-sections > div').forEach(section => {
        const title = section.querySelector('[data-service-title]').value;
        const description = section.querySelector('[data-service-description]').value;
        const price = section.querySelector('[data-service-price]').value;
        if (title) {
            sections.push({ title, description, price: price ? parseFloat(price) : null });
        }
    });
    return sections;
}

// Agreement save
async function handleAgreementSave(e) {
    e.preventDefault();
    
    // Validation
    const agencyId = document.getElementById('agreement-agency').value;
    const customerId = document.getElementById('agreement-customer').value;
    const title = document.getElementById('agreement-title').value;
    const startDate = document.getElementById('agreement-start-date').value;
    const content = document.getElementById('agreement-content').value;
    
    if (!agencyId) {
        showNotification('Please select an agency', 'error');
        return;
    }
    if (!customerId) {
        showNotification('Please select a customer', 'error');
        return;
    }
    if (!title) {
        showNotification('Please enter agreement title', 'error');
        return;
    }
    if (!startDate) {
        showNotification('Please select start date', 'error');
        return;
    }
    if (!content) {
        showNotification('Please enter agreement content', 'error');
        return;
    }
    
    const data = {
        agency_id: parseInt(agencyId),
        customer_id: parseInt(customerId),
        template_id: document.getElementById('agreement-template').value || null,
        title: title,
        content: content,
        monthly_payment: document.getElementById('agreement-payment').value || null,
        payment_day: parseInt(document.getElementById('agreement-payment-day').value),
        start_date: startDate,
        end_date: document.getElementById('agreement-end-date').value || null,
        status: 'draft',
        services: getServiceSections()
    };
    
    try {
        const response = await axios.post('/api/agreements', data);
        showNotification('✅ Agreement created successfully!');
        document.getElementById('new-agreement-form').reset();
        document.getElementById('service-sections').innerHTML = '';
        await loadAllData();
        showTab('agreements');
        updateDashboard();
    } catch (error) {
        console.error('Error creating agreement:', error);
        const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
        showNotification(`❌ Error: ${errorMsg}`, 'error');
    }
}

// View agreement
async function viewAgreement(id) {
    try {
        const res = await axios.get(`/api/agreements/${id}`);
        const agreement = res.data;
        
        const servicesHtml = agreement.services && agreement.services.length > 0
            ? agreement.services.map(s => `
                <div class="border-b border-gray-200 py-2">
                    <div class="flex justify-between">
                        <span class="font-medium">${s.title}</span>
                        ${s.price ? `<span>$${s.price}</span>` : ''}
                    </div>
                    ${s.description ? `<p class="text-sm text-gray-600 mt-1">${s.description}</p>` : ''}
                </div>
            `).join('')
            : '<p class="text-gray-500">No services listed</p>';
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-start mb-6">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900">${agreement.title}</h2>
                        <p class="text-sm text-gray-600 mt-1">${agreement.agreement_number}</p>
                    </div>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <div class="grid grid-cols-2 gap-6 mb-6">
                    <div class="border border-gray-200 rounded-lg p-4">
                        <h3 class="font-semibold text-gray-900 mb-2">Agency</h3>
                        <p class="text-gray-800">${agreement.agency_name}</p>
                        ${agreement.agency_email ? `<p class="text-sm text-gray-600">${agreement.agency_email}</p>` : ''}
                        ${agreement.agency_address ? `<p class="text-sm text-gray-600 mt-1">${agreement.agency_address}</p>` : ''}
                        ${agreement.agency_signed ? `
                            <div class="mt-3 text-green-600 text-sm">
                                <i class="fas fa-check-circle mr-1"></i>Signed on ${formatDate(agreement.agency_signed_at)}
                            </div>
                        ` : ''}
                    </div>
                    <div class="border border-gray-200 rounded-lg p-4">
                        <h3 class="font-semibold text-gray-900 mb-2">Customer</h3>
                        <p class="text-gray-800">${agreement.customer_name}</p>
                        ${agreement.customer_email ? `<p class="text-sm text-gray-600">${agreement.customer_email}</p>` : ''}
                        ${agreement.customer_company ? `<p class="text-sm text-gray-600">${agreement.customer_company}</p>` : ''}
                        ${agreement.customer_signed ? `
                            <div class="mt-3 text-green-600 text-sm">
                                <i class="fas fa-check-circle mr-1"></i>Signed on ${formatDate(agreement.customer_signed_at)}
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="mb-6">
                    <h3 class="font-semibold text-gray-900 mb-3">Agreement Details</h3>
                    <div class="grid grid-cols-4 gap-4 text-sm">
                        <div>
                            <span class="text-gray-600">Start Date:</span>
                            <p class="font-medium">${formatDate(agreement.start_date)}</p>
                        </div>
                        ${agreement.end_date ? `
                            <div>
                                <span class="text-gray-600">End Date:</span>
                                <p class="font-medium">${formatDate(agreement.end_date)}</p>
                            </div>
                        ` : ''}
                        ${agreement.monthly_payment ? `
                            <div>
                                <span class="text-gray-600">Monthly Payment:</span>
                                <p class="font-medium">$${agreement.monthly_payment}</p>
                            </div>
                        ` : ''}
                        <div>
                            <span class="text-gray-600">Status:</span>
                            <p class="font-medium">${agreement.status}</p>
                        </div>
                    </div>
                </div>
                
                <div class="mb-6">
                    <h3 class="font-semibold text-gray-900 mb-3">Services</h3>
                    <div class="space-y-2">
                        ${servicesHtml}
                    </div>
                </div>
                
                <div class="mb-6">
                    <h3 class="font-semibold text-gray-900 mb-3">Agreement Content</h3>
                    <div class="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-sm">
                        ${agreement.content}
                    </div>
                </div>
                
                <div class="flex justify-end gap-3">
                    <button onclick="this.closest('.fixed').remove()" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        Close
                    </button>
                    <button onclick="printAgreement(${id})" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <i class="fas fa-print mr-2"></i>Print
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    } catch (error) {
        console.error('Error viewing agreement:', error);
        showNotification('Error loading agreement', 'error');
    }
}

// Delete agreement
async function deleteAgreement(id) {
    if (!confirm('Are you sure you want to delete this agreement?')) return;
    
    try {
        await axios.delete(`/api/agreements/${id}`);
        showNotification('Agreement deleted successfully');
        await loadAllData();
        loadAgreements();
        updateDashboard();
    } catch (error) {
        console.error('Error deleting agreement:', error);
        showNotification('Error deleting agreement', 'error');
    }
}

// Print agreement
function printAgreement(id) {
    window.open(`/api/agreements/${id}/print`, '_blank');
}

// Mark reminder as paid
async function markReminderPaid(id) {
    try {
        await axios.put(`/api/reminders/${id}/mark-paid`);
        showNotification('Reminder marked as paid');
        await loadAllData();
        loadReminders();
        updateDashboard();
    } catch (error) {
        console.error('Error marking reminder as paid:', error);
        showNotification('Error updating reminder', 'error');
    }
}

// Email settings save
async function handleEmailSettingsSave(e) {
    e.preventDefault();
    const id = document.getElementById('email-settings-id').value;
    const data = {
        provider: document.getElementById('email-provider').value,
        api_key: document.getElementById('email-api-key').value,
        from_email: document.getElementById('email-from').value,
        from_name: document.getElementById('email-from-name').value,
        reminder_days_before: parseInt(document.getElementById('email-reminder-days').value)
    };
    
    try {
        if (id) {
            await axios.put(`/api/email-settings/${id}`, data);
            showNotification('Email settings updated successfully');
        } else {
            await axios.post('/api/email-settings', data);
            showNotification('Email settings saved successfully');
        }
        await loadSettings();
    } catch (error) {
        console.error('Error saving email settings:', error);
        showNotification('Error saving email settings', 'error');
    }
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getStatusColor(status) {
    const colors = {
        'draft': 'bg-gray-100 text-gray-800',
        'active': 'bg-green-100 text-green-800',
        'pending': 'bg-yellow-100 text-yellow-800',
        'expired': 'bg-red-100 text-red-800',
        'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 ${
        type === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`;
    notification.innerHTML = `
        <div class="flex items-center gap-2">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}
