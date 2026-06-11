import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: '80px 16px 64px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem', marginBottom: 32 }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={26} style={{ color: '#10b981' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-text)', margin: 0 }}>Privacy Policy</h1>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>Last updated: June 2026 · Effective immediately</p>
            </div>
          </div>

          {[
            {
              title: '1. Who We Are',
              content: 'VibeRoommate ("we", "our", "us") is a student roommate and housing discovery platform built specifically for college students in Nanded, Maharashtra, India. We are committed to protecting your privacy under India\'s Digital Personal Data Protection Act (DPDPA) 2023.',
            },
            {
              title: '2. Data We Collect',
              content: `We collect only what\'s necessary to provide our service:
• Account data: Email address, password (hashed with bcrypt-12), Google account ID if you use Google login
• Profile data: Full name, gender, college, course, year, city, budget range, food/lifestyle preferences, bio
• Quiz answers: Behavioral quiz responses used to compute your compatibility score (stored as aggregate scores, not raw answers permanently)
• Profile photo: Stored securely on Cloudinary (encrypted at rest)
• Messages: Chat messages between matched users, stored encrypted in our database
• Device data: Browser type, IP address (for rate limiting and fraud prevention only)`,
            },
            {
              title: '3. How We Use Your Data',
              content: `Your data is used to:
• Match you with compatible roommates using our scoring algorithm
• Display your profile to other users in the same city/college
• Send you email verification and match notification emails
• Show you relevant housing listings based on your city
• Improve our matching algorithm (using anonymized aggregate data only)

We do NOT sell your data to any third party. We do NOT use your data for advertising.`,
            },
            {
              title: '4. Who Can See Your Data',
              content: `• Other VibeRoommate users in your city can see your: Name, college, course, year, profile photo, personality tags, verification status, and bio
• Your phone number is visible only to users you have an active conversation with
• Your exact budget range, quiz scores, smoking/drinking habits are NOT shown to other users directly — they are only used internally for matching
• VibeRoommate admins can access your profile for verification and safety purposes only`,
            },
            {
              title: '5. Data Storage & Security',
              content: `• Database: MongoDB Atlas (hosted in AWS Mumbai region) — encrypted at rest and in transit (TLS 1.3)
• Passwords: Hashed using bcrypt with salt rounds of 12 — we never store plaintext passwords
• Sessions: JWT tokens stored in httpOnly cookies (not accessible by JavaScript — XSS-safe)
• Images: Stored on Cloudinary with HTTPS-only access URLs
• Communication: All API traffic is encrypted via HTTPS in production`,
            },
            {
              title: '6. Your Rights (DPDPA 2023)',
              content: `Under India\'s DPDPA 2023, you have the right to:
• Access your personal data (email support@vibeRoommate.in)
• Correct inaccurate data (via Profile Settings)
• Delete your account and all associated data (via Settings → Danger Zone → Delete Account)
• Withdraw consent at any time by deleting your account
• Raise a grievance with us at support@vibeRoommate.in (response within 5 business days)`,
            },
            {
              title: '7. Data Retention',
              content: 'We retain your data as long as your account is active. When you delete your account, all personal data (profile, messages, matches) is permanently deleted within 30 days. Some anonymized aggregate data may be retained for service improvement.',
            },
            {
              title: '8. Third-Party Services',
              content: `We use the following third-party services:
• Cloudinary (image storage) — https://cloudinary.com/privacy
• MongoDB Atlas (database) — https://www.mongodb.com/legal/privacy-policy
• Google OAuth (login option) — https://policies.google.com/privacy
• Razorpay (payments, if applicable) — https://razorpay.com/privacy/
• Nodemailer via Gmail SMTP (email sending)`,
            },
            {
              title: '9. Cookies',
              content: 'We use a single httpOnly cookie (vr_token) to maintain your login session. This cookie is essential for the service to function. We do not use advertising cookies, tracking pixels, or analytics cookies. You can clear this cookie by logging out.',
            },
            {
              title: '10. Changes to This Policy',
              content: 'We will notify registered users of any significant changes to this Privacy Policy via email at least 7 days before the change takes effect.',
            },
            {
              title: '11. Contact Us',
              content: `For privacy concerns, data requests, or grievances:
Email: support@vibeRoommate.in
Address: Nanded, Maharashtra, India
Support hours: 9 AM – 9 PM IST (Monday to Saturday)`,
            },
          ].map((section, i) => (
            <div key={i} style={{
              background: 'var(--color-surface)', borderRadius: 16, padding: '24px 28px',
              border: '1.5px solid var(--color-border)', marginBottom: 16,
            }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)', margin: '0 0 12px' }}>{section.title}</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-line' }}>{section.content}</p>
            </div>
          ))}

          <div style={{ textAlign: 'center', padding: '32px 0', borderTop: '1px solid var(--color-border)', marginTop: 16 }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              © {new Date().getFullYear()} VibeRoommate · Built with ❤️ for Indian College Students 🇮🇳
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
