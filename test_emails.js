import { readFile } from 'fs/promises';
import { Resend } from 'resend';

const db = JSON.parse(await readFile('database.json', 'utf8'));
const resend = new Resend(db.emailSettings.api_key);

console.log('\n📧 Testing Agreement Email vs Payment Reminder Email\n');
console.log('API Key:', db.emailSettings.api_key.substring(0, 20) + '...');
console.log('From:', db.emailSettings.from_email);
console.log('To:', 'kanalmedyainternational@gmail.com');
console.log('\nBoth emails should go to the same recipient...\n');

// Test 1: Simple payment reminder
console.log('🔵 Test 1: Payment Reminder Email');
try {
  const result1 = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: ['kanalmedyainternational@gmail.com'],
    subject: '⏰ TEST Payment Reminder',
    html: '<p>This is a test payment reminder email</p>'
  });
  console.log('✅ Payment Reminder SENT:', result1.data?.id);
} catch (e) {
  console.log('❌ Payment Reminder FAILED:', e.message);
}

// Test 2: Simple agreement email
console.log('\n🔵 Test 2: Agreement Email');
try {
  const result2 = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: ['kanalmedyainternational@gmail.com'],
    subject: '📄 TEST Agreement Email',
    html: '<p>This is a test agreement email</p>'
  });
  console.log('✅ Agreement Email SENT:', result2.data?.id);
} catch (e) {
  console.log('❌ Agreement Email FAILED:', e.message);
}

console.log('\n✅ BOTH EMAILS SENT! Check your inbox AND spam folder!\n');
