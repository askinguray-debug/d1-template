const SibApiV3Sdk = require('@getbrevo/brevo');
const fs = require('fs');

async function testBrevo() {
  const db = JSON.parse(fs.readFileSync('./database.json', 'utf8'));
  const emailSettings = db.emailSettings;
  
  console.log('Testing Brevo Email Send...\n');
  console.log('From Email:', emailSettings.from_email);
  console.log('From Name:', emailSettings.from_name);
  console.log('To: kanalmedyainternational@gmail.com\n');
  
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  const apiKey = apiInstance.authentications['apiKey'];
  apiKey.apiKey = emailSettings.brevo_api_key;
  
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.sender = { 
    email: emailSettings.from_email,
    name: emailSettings.from_name
  };
  sendSmtpEmail.to = [{ email: 'kanalmedyainternational@gmail.com' }];
  sendSmtpEmail.subject = '🔍 Brevo Test - Check FROM Address';
  sendSmtpEmail.htmlContent = `
    <h2>Brevo Email Test</h2>
    <p><strong>CHECK THE FROM ADDRESS</strong></p>
    <p>This email should be from: <strong>${emailSettings.from_email}</strong></p>
    <p>Sender name: <strong>${emailSettings.from_name}</strong></p>
    <p>If you see "onboarding@resend.dev" then there's still an issue.</p>
    <p>Time sent: ${new Date().toISOString()}</p>
  `;
  
  try {
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Email sent via Brevo!');
    console.log('   Message ID:', result.messageId);
    console.log('\n📧 Check your inbox at: kanalmedyainternational@gmail.com');
    console.log('   Look at the FROM address - it should be: reclumacreative@gmail.com');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.body || error.response.text);
    }
  }
}

testBrevo();
