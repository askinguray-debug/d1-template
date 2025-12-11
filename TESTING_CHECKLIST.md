# Testing Checklist - Cancellation System & Model Separation

## Test Environment
- **URL**: https://3000-ipmaf4jd9cziaxxnq9sow-b237eb32.sandbox.novita.ai
- **Login**: Recluma / 123123
- **GitHub**: https://github.com/askinguray-debug/d1-template

## ✅ COMPLETED FEATURES

### 1. Customer/Model Separation
- [x] Models table created with fields:
  - id, name, email, phone, company, address
  - date_of_birth, height, weight, eye_color, skin_color
  - notes, created_at
- [x] 3 Models in database:
  - Model ID 1: "Model (Original)"
  - Model ID 2: "Jack Kambona" 
  - Model ID 3: "GIZEM SEYHAN"
- [x] Model API endpoints: GET, POST, PUT, DELETE `/api/models`
- [x] Model Agreements use `model_id` instead of `customer_id`
- [x] Backend properly looks up models from `db.models` table

### 2. Cancellation Templates System
- [x] 4 Default cancellation templates created:
  - Model Agreement Cancellation
  - Project Agreement Cancellation
  - Service Agreement Cancellation
  - Customer Agreement Cancellation
- [x] Backend APIs for cancellation templates:
  - GET `/api/cancellation-templates` - List all
  - GET `/api/cancellation-templates/:id` - Get one
  - POST `/api/cancellation-templates` - Create
  - PUT `/api/cancellation-templates/:id` - Update
  - DELETE `/api/cancellation-templates/:id` - Delete
- [x] Template fields: id, name, type, subject, content, created_at
- [x] Variable replacement: {{AGREEMENT_NUMBER}}, {{AGENCY_NAME}}, {{CUSTOMER_NAME}}, {{START_DATE}}, {{END_DATE}}, {{CANCELLATION_DATE}}

### 3. Cancel Agreement Functionality
- [x] Cancel endpoints for all agreement types:
  - POST `/api/agreements/:id/cancel` - Service agreements
  - POST `/api/model-agreements/:id/cancel` - Model agreements
  - POST `/api/project-agreements/:id/cancel` - Project agreements
- [x] Cancel button appears on SIGNED agreements only
- [x] Status set to 'cancelled' with timestamp
- [x] Automatic email sent using selected template

### 4. UI Components
- [x] Cancellation Templates section in Templates tab
- [x] Add/Edit/Delete/View cancellation templates
- [x] Template type dropdown (service, model, project, customer)
- [x] Subject and Message fields with variable placeholders
- [x] Cancel Agreement button on signed agreements:
  - Service Agreements modal
  - Model Agreements modal
  - Project Agreements modal
- [x] Template selector in cancel dialog

## 📋 TESTING STEPS

### Test 1: View Cancellation Templates
1. Login: Recluma / 123123
2. Navigate to "Templates" tab
3. Scroll down to "Cancellation Templates" section
4. **VERIFY**: You see 4 default templates:
   - Model Agreement Cancellation (purple badge)
   - Project Agreement Cancellation (green badge)
   - Service Agreement Cancellation (blue badge)
   - Customer Agreement Cancellation (gray badge)

### Test 2: Add New Cancellation Template
1. In Templates tab, click "+ Add Cancellation Template"
2. Fill in:
   - Name: "Test Cancellation Template"
   - Type: "Model Agreement"
   - Subject: "Agreement {{AGREEMENT_NUMBER}} Cancelled"
   - Message: "Dear {{CUSTOMER_NAME}}, Agreement cancelled on {{CANCELLATION_DATE}}"
3. Click "Save"
4. **VERIFY**: New template appears in list

### Test 3: Edit Cancellation Template
1. Click "Edit" (purple icon) on any template
2. Modify the message
3. Click "Save"
4. **VERIFY**: Changes are saved

### Test 4: View Model Names in Model Agreements
1. Navigate to "Model Agreements" tab
2. **VERIFY**: You see 3 model agreements with names:
   - Model (Original)
   - Jack Kambona
   - GIZEM SEYHAN
3. Click on each agreement
4. **VERIFY**: Model name displays correctly in modal

### Test 5: Cancel Agreement Button Visibility
1. Navigate to "Model Agreements" tab
2. Click on a SIGNED agreement (both agency & customer signed)
3. **VERIFY**: You see "🚫 Cancel Agreement" button (red)
4. Test with Project Agreements
5. **VERIFY**: Cancel button appears on signed agreements only

### Test 6: Cancel Agreement Flow
1. Open a signed model agreement
2. Click "Cancel Agreement" button
3. **VERIFY**: Dialog appears with template selector
4. Select a cancellation template from dropdown
5. Click "Send Cancellation Email"
6. **VERIFY**: 
   - Success notification appears
   - Agreement status changes to "cancelled"
   - Email sent to customer/model

### Test 7: API Endpoints (Backend Testing)
```bash
# Test cancellation templates API
curl -X GET http://localhost:3000/api/cancellation-templates

# Test models API
curl -X GET http://localhost:3000/api/models

# Test cancel agreement
curl -X POST http://localhost:3000/api/model-agreements/1/cancel \
  -H "Content-Type: application/json" \
  -d '{"templateId": 1}'
```

## 🎯 SUCCESS CRITERIA

### Visual Verification
- ✅ Cancellation Templates section visible in Templates tab
- ✅ All 4 default templates display with correct type badges
- ✅ Add/Edit/Delete buttons functional
- ✅ Cancel Agreement button appears ONLY on signed agreements
- ✅ Cancel Agreement button has red styling with ban icon

### Functional Verification
- ✅ Can create new cancellation templates
- ✅ Can edit existing templates
- ✅ Can delete templates (with confirmation)
- ✅ Can view template content
- ✅ Cancel dialog shows template selector
- ✅ Cancellation updates agreement status to 'cancelled'
- ✅ Cancellation email sent with template content
- ✅ Variable replacement works in emails

### Data Verification
- ✅ Model names display correctly (not "Customer")
- ✅ Model agreements reference `model_id` not `customer_id`
- ✅ Cancelled agreements show status='cancelled'
- ✅ cancellation_date timestamp recorded

## 🔍 KNOWN LIMITATIONS
1. Authentication required for API endpoints (expected behavior)
2. Email sending requires Brevo API key configuration
3. Cancel button only appears after BOTH parties sign

## 📝 NEXT STEPS (If needed)
- [ ] Add preview functionality for cancellation emails
- [ ] Add cancellation history/audit log
- [ ] Add ability to reverse cancellation
- [ ] Add bulk cancellation feature
- [ ] Add cancellation reasons field

## 🎉 DEPLOYMENT STATUS
- ✅ All backend APIs implemented
- ✅ All frontend UI components added
- ✅ Database properly structured
- ✅ Git committed (commit: b280ff1)
- ✅ GitHub pushed
- ✅ Server running and accessible
