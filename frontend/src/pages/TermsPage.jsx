import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: '80px 16px 64px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem', marginBottom: 32 }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={26} style={{ color: '#6366f1' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-text)', margin: 0 }}>Terms of Use</h1>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>Last updated: June 2026 · By using VibeRoommate, you agree to these terms</p>
            </div>
          </div>

          {[
            {
              title: '1. Acceptance of Terms',
              content: 'By creating an account or using VibeRoommate, you agree to these Terms of Use and our Privacy Policy. If you do not agree, please do not use the service. These terms are governed by Indian law.',
            },
            {
              title: '2. Eligibility',
              content: `To use VibeRoommate you must:
• Be at least 18 years of age
• Be an enrolled student at a recognized Indian college or university
• Provide accurate and truthful profile information
• Use your real identity (no fake profiles)`,
            },
            {
              title: '3. Acceptable Use',
              content: `You agree NOT to:
• Create fake profiles or impersonate another person
• Harass, threaten, or harm other users
• Share another user\'s personal information without their consent
• Use the platform for commercial solicitation or spam
• Attempt to hack, scrape, or disrupt the platform
• Post illegal content or violate any applicable Indian laws

Violations will result in immediate account suspension and may be reported to law enforcement.`,
            },
            {
              title: '4. Matching & Roommate Decisions',
              content: 'VibeRoommate provides compatibility scores and match suggestions based on self-reported preferences. We do not guarantee the accuracy of these scores or the suitability of any match. You are solely responsible for your own roommate decisions. We strongly recommend meeting in a safe public place before agreeing to share accommodation.',
            },
            {
              title: '5. Listings & Housing Information',
              content: 'Property listings on VibeRoommate are posted by owners and may not be verified in real-time. We are not a real estate agent and do not represent any landlord. Always verify listing details, visit the property in person, and sign a proper rental agreement before making any payment.',
            },
            {
              title: '6. Content You Post',
              content: 'You own the content you post (profile information, messages, photos). By posting, you grant VibeRoommate a non-exclusive, royalty-free license to display this content to other users as necessary to operate the service. We will never sell your content.',
            },
            {
              title: '7. Payments & Premium',
              content: 'VibeRoommate Premium subscriptions are processed via Razorpay. Payments are non-refundable except as required by Indian Consumer Protection law. Subscriptions auto-renew monthly unless cancelled at least 24 hours before the renewal date.',
            },
            {
              title: '8. Safety Guidelines',
              content: `Your safety is our priority:
• Never share your bank account details, Aadhaar, or OTPs with other users
• Meet potential roommates in public places first
• Tell a trusted person about any in-person meetings
• Report suspicious behavior using the Report feature in the app
• Emergency contacts: Police 100 · Women\'s Helpline 1091`,
            },
            {
              title: '9. Limitation of Liability',
              content: 'VibeRoommate is provided "as is". We are not liable for any damages arising from roommate disputes, housing arrangements, or reliance on match scores. Our maximum liability is limited to the subscription amount paid in the last 30 days.',
            },
            {
              title: '10. Account Termination',
              content: 'We reserve the right to suspend or terminate accounts that violate these terms, without notice. You can delete your account at any time via Settings. Upon deletion, all your data is permanently removed within 30 days.',
            },
            {
              title: '11. Changes to Terms',
              content: 'We may update these terms at any time. If changes are material, we will notify you via email at least 7 days before the change takes effect. Continued use after notification constitutes acceptance.',
            },
            {
              title: '12. Contact & Grievances',
              content: `For queries, disputes, or grievances:
Email: support@vibeRoommate.in
Grievance Officer: Available within 5 business days
Applicable Law: Indian Contract Act 1872, IT Act 2000, Consumer Protection Act 2019
Jurisdiction: Courts of Nanded, Maharashtra, India`,
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
              © {new Date().getFullYear()} VibeRoommate · Made for Indian Students 🇮🇳 · Governed by Indian Law
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
