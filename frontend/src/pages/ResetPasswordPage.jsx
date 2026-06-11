import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Lock, ShieldCheck, ArrowLeft, Eye, EyeOff, RefreshCw } from 'lucide-react';

export default function ResetPasswordPage() {
  const location = useLocation();
  const navigate  = useNavigate();

  const [email, setEmail]           = useState(location.state?.email || '');
  const [otp, setOtp]               = useState('');
  const [newPassword, setNewPass]   = useState('');
  const [confirmPass, setConfirm]   = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [resending, setResending]   = useState(false);
  const [done, setDone]             = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !otp || !newPassword) return toast.error('All fields are required');
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    if (newPassword !== confirmPass) return toast.error('Passwords do not match');

    setLoading(true);
    try {
      await authAPI.resetPassword({ email, otp, newPassword });
      setDone(true);
      toast.success('Password reset successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Check your OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) return toast.error('Enter your email first');
    setResending(true);
    try {
      await authAPI.forgotPassword({ email });
      toast.success('New OTP sent to your email!');
    } catch {
      toast.error('Failed to resend. Try again.');
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
            <span style={{ fontSize: 36 }}>✅</span>
          </div>
          <h2 className="text-2xl font-extrabold text-text mb-2">Password Reset!</h2>
          <p className="text-sm text-text-muted mb-8">
            Your password has been updated successfully. You can now login with your new password.
          </p>
          <Link to="/login" className="btn btn-primary w-full py-3 flex-center gap-2">
            Go to Login
          </Link>
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
            <ShieldCheck size={28} color="#10b981" />
          </div>
          <h2 className="text-2xl font-extrabold text-text">Reset Password</h2>
          <p className="text-sm text-text-muted text-center">
            Enter the 6-digit OTP from your email and your new password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email — editable if not pre-filled */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-muted tracking-wider uppercase">Email</label>
            <input
              type="email"
              id="reset-email"
              placeholder="your@email.com"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* OTP */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-text-muted tracking-wider uppercase">OTP Code</label>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resending}
                className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline disabled:opacity-50"
              >
                <RefreshCw size={12} className={resending ? 'animate-spin' : ''} />
                {resending ? 'Sending...' : 'Resend OTP'}
              </button>
            </div>
            <input
              type="text"
              id="reset-otp"
              placeholder="6-digit OTP"
              className="input text-center font-bold text-lg tracking-[0.3em]"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              required
            />
          </div>

          {/* New Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-muted tracking-wider uppercase">New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-text-muted" size={18} />
              <input
                type={showPass ? 'text' : 'password'}
                id="reset-new-password"
                placeholder="Min 6 characters"
                className="input pl-11 pr-11"
                value={newPassword}
                onChange={(e) => setNewPass(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-4 top-3.5 text-text-muted hover:text-text"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-muted tracking-wider uppercase">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-text-muted" size={18} />
              <input
                type={showPass ? 'text' : 'password'}
                id="reset-confirm-password"
                placeholder="Re-enter new password"
                className="input pl-11"
                value={confirmPass}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
            {confirmPass && newPassword !== confirmPass && (
              <p className="text-xs text-red-400 font-medium">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            id="reset-submit"
            disabled={loading || (confirmPass && newPassword !== confirmPass)}
            className="btn btn-primary w-full py-3 flex-center gap-2 mt-2 shadow-lg disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="flex items-center gap-2 justify-center mt-6">
          <ArrowLeft size={14} className="text-text-muted" />
          <Link to="/forgot-password" className="text-sm text-text-muted hover:text-primary transition-colors font-medium">
            Back
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
