const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Add placeholder model ID 1 (the original xx model that was lost)
const placeholderModel = {
  id: 1,
  name: 'Model (Original)',
  email: 'kanalmedyainternational@gmail.com',
  phone: '',
  address: '',
  date_of_birth: null,
  height: null,
  weight: null,
  eye_color: null,
  skin_color: null,
  notes: 'Original model from first agreement - migrated from old customer data',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Add at the beginning
db.models.unshift(placeholderModel);

// Save database
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log('Added placeholder Model ID 1 successfully!');
console.log(`Total models: ${db.models.length}`);
