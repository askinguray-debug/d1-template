const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Ensure models array exists
if (!db.models) db.models = [];

// IDs to migrate
const idsToMigrate = [8, 9]; // Jack Kambona and GIZEM SEYHAN

// Move customers to models
idsToMigrate.forEach(id => {
  const customerIndex = db.customers.findIndex(c => c.id === id);
  if (customerIndex !== -1) {
    const customer = db.customers[customerIndex];
    
    // Create model entry with additional fields
    const model = {
      id: db.models.length > 0 ? Math.max(...db.models.map(m => m.id)) + 1 : 1,
      name: customer.name.trim(),
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      date_of_birth: null,
      height: null,
      weight: null,
      eye_color: null,
      skin_color: null,
      notes: '',
      created_at: customer.created_at,
      updated_at: new Date().toISOString()
    };
    
    db.models.push(model);
    
    // Remove from customers
    db.customers.splice(customerIndex, 1);
    
    console.log(`Moved ${customer.name} (ID: ${id}) to models as model ID: ${model.id}`);
  }
});

// Save database
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log('Migration complete!');
console.log(`Total models: ${db.models.length}`);
console.log(`Total customers: ${db.customers.length}`);
