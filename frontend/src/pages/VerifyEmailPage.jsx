import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Mail, ShieldCheck, RefreshCw, ArrowRight } from 'lucide-react';

export default function VerifyEmailPage() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [otp, setOtp]           = useState('');
  const [loading, setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [done, setDone]         = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error('Enter the 6-digit OTP from your email');

    setLoading(true);
    try {
      await authAPI.verifyEmail({ otp });
      setDone(true);
      await refreshProfile?.();
      toast.success('Email verified successfully! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Incorrect OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authAPI.resendVerification();
      toast.success('New OTP sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend. Try again.');
    } finally {
      setResending(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-surface border border-border p-10 rounded-2xl shadow-xl glass text-center"
        >
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(16,185,129,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <ShieldCheck size={36} color="#10b981" />
          </div>
          <h2 className="text-2xl font-extrabold text-text mb-2">Email Verified! ✅</h2>
          <p className="text-sm text-text-muted mb-8">
            Your account is now fully verified. You now have access to all matching features.
          </p>
          <button
            onClick={() => navigate('/home')}
            className="btn btn-primary w-full py-3 flex-center gap-2"
          >
            Go to Dashboard <ArrowRight size={16} />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-surface border border-border p-8 rounded-2xl shadow-xl glass"
      >
        {/* Header */}
        <div className="flex-col-center gap-2 mb-8">
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'rgba(16,185,129,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 8,
          }}>
            <Mail size={28} color="#10b981" />
          </div>
          <h2 className="text-2xl font-extrabold text-text">Verify Your Email</h2>
          <p className="text-sm text-text-muted text-center">
            We sent a 6-digit OTP to <strong className="text-primary">{user?.email}</strong>.
            Enter it below to verify your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-text-muted tracking-wider uppercase">OTP Code</label>
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline disabled:opacity-50"
              >
                <RefreshCw size={12} className={resending ? 'animate-spin' : ''} />
                {resending ? 'Sending...' : 'Resend OTP'}
              </button>
            </div>
            <input
              type="text"
              id="verify-email-otp"
              placeholder="6-digit OTP"
              className="input text-center font-bold text-2xl tracking-[0.4em]"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              autoFocus
              required
            />
          </div>

          <button
            type="submit"
            id="verify-email-submit"
            disabled={loading || otp.length !== 6}
            className="btn btn-primary w-full py-3 flex-center gap-2 mt-2 shadow-lg disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Email'} <ShieldCheck size={16} />
          </button>
        </form>

        <p className="text-center text-xs text-text-muted mt-6">
          Check your spam folder if you don't see the email.
        </p>
      </motion.div>
    </div>
  );
}
