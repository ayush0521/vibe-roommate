import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft, MessageCircle, Mail, Phone } from 'lucide-react';

const FAQ = [
  { q: 'How does matching work?', a: 'We use an 8-factor compatibility algorithm that considers your sleep schedule, food preferences, cleanliness standards, study habits, social preferences, noise tolerance, guest policy, and budget. Hard filters (gender, budget range, city) are applied first, then we calculate a 0–100% compatibility score.' },
  { q: 'Why do I only see 3 matches?', a: 'Free accounts see up to 3 matches. Upgrade to VibeRoommate Premium (₹299/month) to unlock unlimited matches, advanced filters, and priority listing placement.' },
  { q: 'How do I get verified?', a: 'Go to Settings → Student Verification. Submit your official college email (.ac.in or .edu) to get instantly verified, or upload your college ID card for manual review within 24 hours.' },
  { q: 'Is my personal data safe?', a: 'Yes. Your password is hashed with bcrypt-12 (never stored in plaintext). Your session token is stored in an httpOnly cookie (not accessible to JavaScript). All data is encrypted in transit (TLS) and at rest (MongoDB Atlas, Cloudinary). See our Privacy Policy for full details.' },
  { q: 'Can I delete my account?', a: 'Yes. Go to Settings → Danger Zone → Delete Account. Type DELETE to confirm. All your data (profile, messages, matches) is permanently deleted within 30 days.' },
  { q: 'What if someone is harassing me?', a: 'Use the "Block User" option (three dots menu in chat) to block them immediately. Use the "Report" option to submit a formal report. Our team reviews all reports within 24 hours. For emergencies, contact Police: 100 or Women\'s Helpline: 1091.' },
  { q: 'Why is my profile not showing in matches?', a: 'Make sure you have: (1) Completed your profile (all required fields), (2) Submitted the quiz, (3) Set your city correctly. Matches are only shown between users in the same city and gender.' },
  { q: 'How does the chat work?', a: 'Once two users are matched, they can start a conversation. Chats are real-time using Socket.IO. You can send text messages, images, and schedule Google Meet calls. Your messages are private and only visible to you and the other user.' },
  { q: 'I forgot my password. What do I do?', a: 'On the login page, click "Forgot Password". Enter your registered email. You will receive a password reset link. If you signed up with Google, you can only login with Google.' },
  { q: 'What cities are currently supported?', a: 'VibeRoommate is currently focused on Nanded, Maharashtra, supporting students at MGM College, SGGS College, and other local institutions. We are expanding to Aurangabad, Pune, and Latur soon.' },
];

export default function HelpPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: '80px 16px 64px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem', marginBottom: 32 }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HelpCircle size={26} style={{ color: '#f59e0b' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-text)', margin: 0 }}>Help Center</h1>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>Everything you need to know about VibeRoommate</p>
            </div>
          </div>

          {/* Contact Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, margin: '24px 0' }}>
            {[
              { icon: <Mail size={20} />, title: 'Email Support', value: 'support@vibeRoommate.in', sub: 'Response within 24 hours', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
              { icon: <MessageCircle size={20} />, title: 'Community', value: 'In-app chat support', sub: 'Talk to verified students', color: '#6366f1', bg: 'rgba(99,102,241,0.08)' },
              { icon: <Phone size={20} />, title: 'Emergency', value: 'Police: 100', sub: 'Women\'s Helpline: 1091', color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
            ].map((card, i) => (
              <div key={i} style={{ background: card.bg, borderRadius: 16, padding: '20px', border: `1.5px solid ${card.bg}`, textAlign: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: card.color }}>{card.icon}</div>
                <h3 style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--color-text)', margin: '0 0 4px' }}>{card.title}</h3>
                <p style={{ fontWeight: 700, fontSize: '0.8rem', color: card.color, margin: '0 0 4px' }}>{card.value}</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: 0 }}>{card.sub}</p>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <h2 style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--color-text)', marginBottom: 16, marginTop: 32 }}>Frequently Asked Questions</h2>
          {FAQ.map((item, i) => (
            <details key={i} style={{ marginBottom: 12, cursor: 'pointer' }} open={i === 0}>
              <summary style={{
                background: 'var(--color-surface)', borderRadius: 14, padding: '16px 20px',
                border: '1.5px solid var(--color-border)', fontWeight: 700, fontSize: '0.9rem',
                color: 'var(--color-text)', listStyle: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                {item.q}
                <span style={{ color: '#10b981', fontSize: '1.2rem', marginLeft: 8 }}>+</span>
              </summary>
              <div style={{
                padding: '16px 20px', background: 'var(--color-surface-2)',
                borderRadius: '0 0 14px 14px', border: '1.5px solid var(--color-border)', borderTop: 'none',
                fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.7,
              }}>
                {item.a}
              </div>
            </details>
          ))}

          <div style={{ textAlign: 'center', padding: '32px 0', borderTop: '1px solid var(--color-border)', marginTop: 32 }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Can't find your answer? Email us at <strong style={{ color: '#10b981' }}>support@vibeRoommate.in</strong>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
