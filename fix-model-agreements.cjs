const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Migration mapping: old customer_id -> new model_id
const migration = {
  7: 1,  // Original xx -> Model ID 1
  8: 2,  // Jack Kambona -> Model ID 2
  9: 3   // GIZEM SEYHAN -> Model ID 3
};

// Update model agreements
db.modelAgreements.forEach(agreement => {
  if (agreement.customer_id && migration[agreement.customer_id]) {
    agreement.model_id = migration[agreement.customer_id];
    console.log(`Updated agreement ${agreement.id}: customer_id ${agreement.customer_id} -> model_id ${agreement.model_id}`);
  }
});

// Save database
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log('\nModel agreements migration complete!');
