import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X, RefreshCw, ChevronRight } from 'lucide-react';

/**
 * EmailVerificationBanner
 * Shown across all authenticated pages when isEmailVerified is false.
 * Non-blocking — user can dismiss it per session.
 */
export default function EmailVerificationBanner() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [resending, setResending] = useState(false);

  // Don't show if verified, not logged in, or dismissed this session
  if (!user || user.isEmailVerified || dismissed) return null;

  const handleResend = async (e) => {
    e.stopPropagation();
    setResending(true);
    try {
      await authAPI.resendVerification();
      toast.success('Verification OTP sent! Check your inbox.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend. Try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 9999,
          background: 'linear-gradient(90deg, #0f766e, #10b981)',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          boxShadow: '0 2px 12px rgba(16,185,129,0.3)',
        }}
      >
        <ShieldAlert size={16} color="#fff" style={{ flexShrink: 0 }} />

        <p style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>
          Verify your email{user?.email && ` (${user.email})`} to unlock all features.
        </p>

        <Link
          to="/verify-email"
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'rgba(255,255,255,0.2)',
            color: '#fff', fontSize: '0.75rem', fontWeight: 700,
            padding: '4px 12px', borderRadius: 99,
            textDecoration: 'none', flexShrink: 0,
            border: '1px solid rgba(255,255,255,0.3)',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
        >
          Verify Now <ChevronRight size={12} />
        </Link>

        <button
          onClick={handleResend}
          disabled={resending}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.8)', fontSize: '0.72rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
            padding: '2px 6px',
          }}
          title="Resend OTP"
        >
          <RefreshCw size={12} className={resending ? 'animate-spin' : ''} />
          {resending ? 'Sending...' : 'Resend'}
        </button>

        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.7)', marginLeft: 'auto', flexShrink: 0,
            padding: 2,
          }}
          title="Dismiss for this session"
        >
          <X size={16} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
