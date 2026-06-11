import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email address');

    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      setSent(true);
      toast.success('OTP sent! Check your inbox.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

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
            <ShieldCheck size={28} color="#10b981" />
          </div>
          <h2 className="text-2xl font-extrabold text-text">Forgot Password?</h2>
          <p className="text-sm text-text-muted text-center">
            Enter your registered email. We'll send a 6-digit OTP to reset your password.
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-muted tracking-wider uppercase">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-text-muted" size={18} />
                <input
                  type="email"
                  id="forgot-email"
                  placeholder="you@college.edu"
                  className="input pl-11"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              id="forgot-submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 flex items-center justify-center gap-2 mt-2 shadow-lg"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'} <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          /* Success State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 text-center"
          >
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(16,185,129,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 32 }}>📬</span>
            </div>
            <div>
              <h3 className="font-bold text-text text-lg">Check Your Inbox</h3>
              <p className="text-sm text-text-muted mt-1">
                We've sent a 6-digit OTP to <strong className="text-primary">{email}</strong>.
                It expires in 15 minutes.
              </p>
            </div>
            <Link
              to="/reset-password"
              state={{ email }}
              className="btn btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              Enter OTP & Reset Password <ArrowRight size={16} />
            </Link>
            <button
              onClick={() => { setSent(false); setEmail(''); }}
              className="text-sm text-text-muted hover:text-primary transition-colors"
            >
              Try a different email
            </button>
          </motion.div>
        )}

        <div className="flex items-center gap-2 justify-center mt-6">
          <ArrowLeft size={14} className="text-text-muted" />
          <Link to="/login" className="text-sm text-text-muted hover:text-primary transition-colors font-medium">
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
