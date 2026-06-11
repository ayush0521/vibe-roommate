let twilio = null;
try {
  twilio = require('twilio');
} catch (err) {
  // Twilio npm module is not installed or could not be loaded
}

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

let client = null;
if (twilio && TWILIO_SID && TWILIO_AUTH_TOKEN) {
  try {
    client = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);
  } catch (err) {
    console.error('⚠️ Twilio Initialization Error:', err.message);
  }
}

/**
 * Send a WhatsApp notification using Twilio WhatsApp API
 * Falls back to console logging in development if credentials/packages are not configured.
 * 
 * @param {string} to - Recipient phone number (without +91, e.g. '7387919142')
 * @param {string} message - Message body
 */
const sendWhatsApp = async (to, message) => {
  if (!to) return;
  
  if (client) {
    try {
      await client.messages.create({
        from: TWILIO_WHATSAPP_FROM,
        to: `whatsapp:+91${to}`,
        body: message,
      });
      console.log(`💬 WhatsApp sent successfully via Twilio to +91${to}`);
    } catch (err) {
      console.error(`⚠️ Twilio WhatsApp Error to +91${to}:`, err.message);
    }
  } else {
    console.log(`[MOCK WHATSAPP ALERT] To: +91${to} | Body: ${message}`);
  }
};

module.exports = { sendWhatsApp };
