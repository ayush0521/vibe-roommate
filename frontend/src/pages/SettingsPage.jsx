import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { verificationAPI, usersAPI, paymentsAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  Settings, ShieldCheck, Mail, LogOut, ArrowLeft,
  Upload, Star, Key, Check, AlertCircle, Crown,
  User, AtSign, ChevronRight, ExternalLink, Zap, Trash2, AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Section({ title, icon, iconColor = '#10b981', iconBg = 'rgba(16,185,129,0.1)', children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'var(--color-surface)', borderRadius: 24, padding: '28px 32px',
        border: '1.5px solid var(--color-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        display: 'flex', flexDirection: 'column', gap: 20
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 16, borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: iconBg, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </div>
        <h3 style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

export default function SettingsPage() {
  const { user, profile, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [eduEmail, setEduEmail] = useState('');
  const [submittingEdu, setSubmittingEdu] = useState(false);
  const [submittingManual, setSubmittingManual] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [upgradingPremium, setUpgradingPremium] = useState(false);

  // Trusted Contact states
  const [tcName, setTcName] = useState(profile?.trustedContact?.name || '');
  const [tcPhone, setTcPhone] = useState(profile?.trustedContact?.phone || '');
  const [tcEmail, setTcEmail] = useState(profile?.trustedContact?.email || '');
  const [savingTc, setSavingTc] = useState(false);

  useEffect(() => {
    if (profile?.trustedContact) {
      setTcName(profile.trustedContact.name || '');
      setTcPhone(profile.trustedContact.phone || '');
      setTcEmail(profile.trustedContact.email || '');
    }
  }, [profile]);

  const handleSaveTrustedContact = async (e) => {
    e.preventDefault();
    setSavingTc(true);
    try {
      await usersAPI.updateProfile({
        trustedContact: { name: tcName, phone: tcPhone, email: tcEmail }
      });
      toast.success('Trusted contact updated successfully! 🛡️');
      await refreshProfile();
    } catch (err) {
      toast.error('Failed to update trusted contact');
    } finally {
      setSavingTc(false);
    }
  };

  const isVerified = profile?.verificationStatus === 'verified';
  const isPending = profile?.verificationStatus === 'pending';

  const handleCollegeEmailVerify = async (e) => {
    e.preventDefault();
    if (!eduEmail || (!eduEmail.endsWith('.edu') && !eduEmail.includes('college') && !eduEmail.includes('ac.in'))) {
      return toast.error('Please enter a valid college email (.ac.in or .edu)');
    }
    setSubmittingEdu(true);
    try {
      await verificationAPI.submitCollegeEmail({ collegeEmail: eduEmail });
      toast.success('Verification link sent to your college email!');
      setEduEmail('');
      await refreshProfile();
    } catch (err) {
      toast.error('Failed to submit college email');
    } finally {
      setSubmittingEdu(false);
    }
  };

  const handleManualVerify = async () => {
    setSubmittingManual(true);
    try {
      await verificationAPI.submitManual();
      toast.success('Manual verification request submitted! We will verify within 24 hours.');
      await refreshProfile();
    } catch (err) {
      toast.error('Failed to submit verification request');
    } finally {
      setSubmittingManual(false);
    }
  };

  const handleUpgrade = async () => {
    setUpgradingPremium(true);
    try {
      const { data } = await paymentsAPI.createOrder();

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'VibeRoommate',
        description: 'Premium Monthly Subscription',
        image: '/favicon.ico',
        order_id: data.orderId,
        handler: async (response) => {
          try {
            await paymentsAPI.verifyPayment(response);
            toast.success('🎉 Premium activated! Enjoy unlimited matches.');
            await refreshProfile();
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        prefill: {
          email: user?.email || '',
        },
        theme: { color: '#10b981' },
        modal: {
          ondismiss: () => toast('Payment cancelled', { icon: 'ℹ️' }),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      const msg = err.response?.data?.message || 'Payment service unavailable. Try again later.';
      toast.error(msg);
    } finally {
      setUpgradingPremium(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      return toast.error('Type DELETE to confirm account deletion');
    }
    setDeletingAccount(true);
    try {
      await usersAPI.deleteAccount();
      toast.success('Account deleted. Goodbye!');
      logout();
      navigate('/login');
    } catch (err) {
      toast.error('Failed to delete account. Please try again.');
    } finally {
      setDeletingAccount(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: '96px 16px 64px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontWeight: 700, fontSize: '0.85rem', alignSelf: 'flex-start', padding: 0 }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 18,
            background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.08))',
            border: '1.5px solid rgba(16,185,129,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Settings size={26} style={{ color: '#10b981' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-text)', margin: 0, letterSpacing: '-0.5px' }}>Settings &amp; Verification</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>Manage your account, security, and verification credentials.</p>
          </div>
        </div>

        {/* === VERIFICATION STATUS CARD === */}
        <Section title="Student Verification Status" icon={<ShieldCheck size={20} />}>
          <div style={{
            padding: '20px 24px', borderRadius: 16,
            background: isVerified ? 'rgba(16,185,129,0.06)' : isPending ? 'rgba(245,158,11,0.06)' : 'rgba(239,68,68,0.04)',
            border: `1.5px solid ${isVerified ? 'rgba(16,185,129,0.2)' : isPending ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.15)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                background: isVerified ? 'rgba(16,185,129,0.12)' : isPending ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {isVerified
                  ? <Check size={20} style={{ color: '#10b981' }} />
                  : isPending
                    ? <AlertCircle size={20} style={{ color: '#f59e0b' }} />
                    : <AlertCircle size={20} style={{ color: '#ef4444' }} />
                }
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block' }}>Verification Level</span>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text)', margin: '3px 0 4px', textTransform: 'capitalize' }}>
                  {profile?.verificationStatus || 'Unverified'}
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  {isVerified
                    ? '✅ Your account is verified! You get premium matching benefits.'
                    : isPending
                      ? '⏳ Verification in review — usually takes 24 hours.'
                      : 'Verify your student ID or college email to get a ✓ badge.'}
                </p>
              </div>
            </div>
            <span style={{
              padding: '5px 14px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 800,
              textTransform: 'capitalize', letterSpacing: '0.04em', flexShrink: 0,
              background: isVerified ? 'rgba(16,185,129,0.12)' : isPending ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.1)',
              color: isVerified ? '#10b981' : isPending ? '#f59e0b' : '#ef4444',
              border: `1px solid ${isVerified ? 'rgba(16,185,129,0.3)' : isPending ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.25)'}`,
            }}>
              {profile?.verificationStatus || 'Unverified'}
            </span>
          </div>

          {!isVerified && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

              {/* Email Method */}
              <div style={{ background: 'var(--color-surface-2)', borderRadius: 16, padding: '20px', border: '1.5px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mail size={16} style={{ color: '#10b981' }} />
                  </div>
                  <h4 style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--color-text)', margin: 0 }}>Via College Email</h4>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 14, lineHeight: 1.6 }}>
                  Use your official college email (.ac.in or .edu) to get verified instantly.
                  <br /><span style={{ color: '#10b981', fontWeight: 600 }}>Supports: @mgmcen.ac.in, @sggs.ac.in, etc.</span>
                </p>
                <form onSubmit={handleCollegeEmailVerify} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ position: 'relative' }}>
                    <AtSign size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input
                      type="email"
                      placeholder="you@mgmcen.ac.in"
                      style={{
                        width: '100%', padding: '9px 12px 9px 34px', borderRadius: 10,
                        background: 'var(--color-surface)', border: '1.5px solid var(--color-border)',
                        color: 'var(--color-text)', fontSize: '0.8rem', outline: 'none', transition: 'all 0.2s',
                        boxSizing: 'border-box'
                      }}
                      value={eduEmail}
                      onChange={(e) => setEduEmail(e.target.value)}
                      onFocus={e => e.target.style.borderColor = '#10b981'}
                      onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingEdu}
                    style={{
                      padding: '9px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                      fontWeight: 700, fontSize: '0.82rem',
                      background: submittingEdu ? 'var(--color-surface-2)' : 'linear-gradient(135deg, #10b981, #059669)',
                      color: submittingEdu ? 'var(--color-text-muted)' : 'white',
                      boxShadow: submittingEdu ? 'none' : '0 4px 12px rgba(16,185,129,0.3)',
                      transition: 'all 0.2s',
                    }}
                  >
                    {submittingEdu ? 'Sending...' : '✉️ Send Verification Link'}
                  </button>
                </form>
              </div>

              {/* Manual Method */}
              <div style={{ background: 'var(--color-surface-2)', borderRadius: 16, padding: '20px', border: '1.5px solid var(--color-border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Upload size={16} style={{ color: '#10b981' }} />
                    </div>
                    <h4 style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--color-text)', margin: 0 }}>Via Student ID Card</h4>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: 14 }}>
                    No college email? Upload your college ID card or fee receipt. Our admin team verifies within <strong>24 hours</strong>.
                  </p>
                </div>
                <button
                  onClick={handleManualVerify}
                  disabled={submittingManual}
                  style={{
                    padding: '9px 0', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem',
                    background: 'var(--color-surface)', color: 'var(--color-text)',
                    border: '1.5px solid var(--color-border)', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.color = '#10b981'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text)'; }}
                >
                  {submittingManual ? '⏳ Submitting...' : '📤 Request Manual Review'}
                </button>
              </div>
            </div>
          )}
        </Section>

        {/* === PREMIUM CARD === */}
        <div style={{
          borderRadius: 24, padding: '28px 32px', position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, #1a0a00 0%, #2d1b00 50%, #1a0a00 100%)',
          border: '1.5px solid rgba(245,158,11,0.3)', boxShadow: '0 8px 32px rgba(245,158,11,0.12)',
        }}>
          {/* Shine effect */}
          <div style={{
            position: 'absolute', top: -40, right: -40, width: 160, height: 160,
            borderRadius: '50%', background: 'rgba(245,158,11,0.08)', filter: 'blur(30px)',
          }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(245,158,11,0.15)', border: '1.5px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Crown size={24} style={{ color: '#f59e0b' }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <h4 style={{ fontWeight: 900, fontSize: '1rem', color: '#fef3c7', margin: 0 }}>VibeRoommate Premium</h4>
                  <span style={{ fontSize: '0.6rem', fontWeight: 800, background: 'rgba(245,158,11,0.2)', color: '#f59e0b', padding: '2px 8px', borderRadius: 99, letterSpacing: '0.08em' }}>★ PREMIUM</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'rgba(253,230,138,0.7)', margin: 0, lineHeight: 1.5 }}>
                  Unlimited matches • Priority listings • Retake Quiz • Direct chat links
                </p>
              </div>
            </div>
            <button
              onClick={handleUpgrade}
              disabled={upgradingPremium || user?.isPremium}
              style={{
                padding: '11px 24px', borderRadius: 12, border: 'none', cursor: 'pointer',
                fontWeight: 800, fontSize: '0.9rem', whiteSpace: 'nowrap',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white', boxShadow: '0 6px 20px rgba(245,158,11,0.4)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(245,158,11,0.55)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(245,158,11,0.4)'; }}
            >
              ⚡ Upgrade Now (₹299)
            </button>
          </div>
          {/* Feature pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(245,158,11,0.15)', position: 'relative' }}>
            {['Unlimited Matches', 'Retake Quiz', 'Priority Listing', 'Direct Chat Links', 'Advanced Filters'].map(f => (
              <span key={f} style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(253,230,138,0.8)', background: 'rgba(245,158,11,0.1)', padding: '4px 12px', borderRadius: 99, border: '1px solid rgba(245,158,11,0.2)' }}>
                ✓ {f}
              </span>
            ))}
          </div>
        </div>

        {/* === ACCOUNT INFO CARD === */}
        <Section title="Account Information" icon={<User size={20} />} iconColor="#6b7280" iconBg="rgba(107,114,128,0.1)">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { label: 'Registered Email', value: user?.email, icon: <Mail size={14} /> },
              { label: 'Account Role', value: user?.role, icon: <Key size={14} /> },
              { label: 'Full Name', value: profile?.fullName || '—', icon: <User size={14} /> },
              { label: 'College', value: profile?.college || '—', icon: <Zap size={14} /> },
            ].map((info, i) => (
              <div key={i} style={{
                background: 'var(--color-surface-2)', padding: '14px 18px', borderRadius: 14,
                border: '1px solid var(--color-border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, color: 'var(--color-text-muted)' }}>
                  {info.icon}
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{info.label}</span>
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-text)', textTransform: i === 1 ? 'capitalize' : 'none' }}>{info.value || '—'}</span>
              </div>
            ))}
          </div>

          {/* Log Out */}
          <button
            onClick={logout}
            style={{
              width: '100%', padding: '12px 0', borderRadius: 14, border: '1.5px solid rgba(239,68,68,0.3)',
              background: 'rgba(239,68,68,0.06)', color: '#ef4444', cursor: 'pointer',
              fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s', marginTop: 4,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
          >
            <LogOut size={16} /> Log Out Account
          </button>
        </Section>

        {/* === EMERGENCY / TRUSTED CONTACT === */}
        <Section title="Emergency / Trusted Contact" icon={<ShieldCheck size={20} />} iconColor="#10b981" iconBg="rgba(16,185,129,0.1)">
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '0 0 16px', lineHeight: 1.5 }}>
            🛡️ Set a trusted contact (parent, friend, guardian). Before you meet potential roommates in person, you can use the safety check-in feature to send them meeting details (time, location, roommate details).
          </p>
          <form onSubmit={handleSaveTrustedContact} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="grid-hero">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Contact Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Patil"
                  style={{
                    padding: '10px 14px', borderRadius: 12,
                    background: 'var(--color-surface-2)', border: '1.5px solid var(--color-border)',
                    color: 'var(--color-text)', fontSize: '0.82rem', outline: 'none'
                  }}
                  value={tcName}
                  onChange={(e) => setTcName(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Contact Phone</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  style={{
                    padding: '10px 14px', borderRadius: 12,
                    background: 'var(--color-surface-2)', border: '1.5px solid var(--color-border)',
                    color: 'var(--color-text)', fontSize: '0.82rem', outline: 'none'
                  }}
                  value={tcPhone}
                  onChange={(e) => setTcPhone(e.target.value)}
                  required
                />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Contact Email</label>
              <input
                type="email"
                placeholder="e.g. parent@email.com"
                style={{
                  padding: '10px 14px', borderRadius: 12,
                  background: 'var(--color-surface-2)', border: '1.5px solid var(--color-border)',
                  color: 'var(--color-text)', fontSize: '0.82rem', outline: 'none'
                }}
                value={tcEmail}
                onChange={(e) => setTcEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={savingTc}
              style={{
                alignSelf: 'flex-start', padding: '10px 24px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white',
                fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16,185,129,0.3)', transition: 'all 0.2s',
              }}
            >
              {savingTc ? 'Saving...' : '💾 Save Contact'}
            </button>
          </form>
        </Section>

        {/* === DANGER ZONE === */}
        <div style={{
          borderRadius: 24, padding: '28px 32px',
          background: 'rgba(239,68,68,0.04)',
          border: '1.5px solid rgba(239,68,68,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 16, borderBottom: '1px solid rgba(239,68,68,0.15)', marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={20} style={{ color: '#ef4444' }} />
            </div>
            <h3 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Danger Zone</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)', margin: '0 0 4px' }}>Delete Account</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0 }}>Permanently deletes your profile, matches, and all data. This cannot be undone.</p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              style={{
                padding: '10px 20px', borderRadius: 12, border: '1.5px solid rgba(239,68,68,0.4)',
                background: 'rgba(239,68,68,0.08)', color: '#ef4444', cursor: 'pointer',
                fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.borderColor = '#ef4444'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; }}
            >
              <Trash2 size={15} /> Delete My Account
            </button>
          </div>
        </div>

        {/* DELETE CONFIRMATION MODAL */}
        {showDeleteModal && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          }} onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              style={{
                background: 'var(--color-surface)', borderRadius: 24, padding: '32px',
                maxWidth: 420, width: '100%',
                border: '1.5px solid rgba(239,68,68,0.3)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              }}
            >
              <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Trash2 size={24} style={{ color: '#ef4444' }} />
              </div>
              <h3 style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--color-text)', textAlign: 'center', margin: '0 0 8px' }}>Delete Account?</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', textAlign: 'center', lineHeight: 1.6, margin: '0 0 20px' }}>
                This will permanently delete your profile, all matches, messages, and saved listings. <strong style={{ color: '#ef4444' }}>This action cannot be undone.</strong>
              </p>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>
                  Type <strong style={{ color: '#ef4444' }}>DELETE</strong> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={e => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10, boxSizing: 'border-box',
                    border: '1.5px solid rgba(239,68,68,0.3)', background: 'var(--color-surface-2)',
                    color: 'var(--color-text)', fontSize: '0.9rem', fontWeight: 700, outline: 'none',
                    transition: 'border-color 0.2s', letterSpacing: '0.1em',
                  }}
                  onFocus={e => e.target.style.borderColor = '#ef4444'}
                  onBlur={e => e.target.style.borderColor = 'rgba(239,68,68,0.3)'}
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
                  style={{
                    flex: 1, padding: '11px 0', borderRadius: 12, border: '1.5px solid var(--color-border)',
                    background: 'var(--color-surface-2)', color: 'var(--color-text)',
                    cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem', transition: 'all 0.2s',
                  }}
                >Cancel</button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deletingAccount || deleteConfirmText !== 'DELETE'}
                  style={{
                    flex: 1, padding: '11px 0', borderRadius: 12, border: 'none',
                    background: deleteConfirmText === 'DELETE' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'rgba(239,68,68,0.2)',
                    color: deleteConfirmText === 'DELETE' ? 'white' : '#ef4444',
                    cursor: deleteConfirmText === 'DELETE' ? 'pointer' : 'not-allowed',
                    fontWeight: 700, fontSize: '0.88rem', transition: 'all 0.2s',
                    boxShadow: deleteConfirmText === 'DELETE' ? '0 4px 16px rgba(239,68,68,0.4)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <Trash2 size={14} /> {deletingAccount ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

      </div>
    </div>
  );
}
