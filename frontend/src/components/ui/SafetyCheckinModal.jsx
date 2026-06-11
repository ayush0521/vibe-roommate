import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { meetingsAPI, usersAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { Shield, X, Calendar, MapPin, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * SafetyCheckinModal
 * Opens a modal to fill meeting details and sends a safety email to trusted contact.
 *
 * Props:
 *   isOpen     - boolean
 *   onClose    - () => void
 *   matchName  - string (name of person being met)
 */
export default function SafetyCheckinModal({ isOpen, onClose, matchName = '' }) {
  const { profile } = useAuth();
  const [meetingTime,     setMeetingTime]     = useState('');
  const [meetingLocation, setMeetingLocation] = useState('');
  const [loading,         setLoading]         = useState(false);
  const [done,            setDone]            = useState(false);

  const hasTrustedContact = !!profile?.trustedContact?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!meetingTime || !meetingLocation) return toast.error('Please fill in both fields');

    setLoading(true);
    try {
      const { data } = await meetingsAPI.safetyCheckin({
        meetingTime, meetingLocation, otherPersonName: matchName,
      });
      setDone(true);
      toast.success(data.message || 'Safety check-in sent! 🛡️');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send check-in';
      if (msg.includes('No trusted contact')) {
        toast.error('Add a trusted contact in Settings → Safety first!');
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDone(false);
    setMeetingTime('');
    setMeetingLocation('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-text-muted hover:text-text"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>

          {done ? (
            /* Success State */
            <div className="flex-col-center gap-4 py-4">
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={32} color="#10b981" />
              </div>
              <h3 className="text-lg font-extrabold text-text">Check-in Sent! 🛡️</h3>
              <p className="text-sm text-text-muted text-center">
                Your trusted contact has been notified about your meeting.
                Have a safe meetup!
              </p>
              <button onClick={handleClose} className="btn btn-primary w-full py-2.5 mt-2">
                Got it
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Shield size={20} color="#f59e0b" />
                </div>
                <div>
                  <h3 className="font-extrabold text-text">Safety Check-in</h3>
                  <p className="text-xs text-text-muted">
                    Notify your trusted contact before meeting {matchName || 'your roommate match'}
                  </p>
                </div>
              </div>

              {!hasTrustedContact && (
                <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 10, padding: 12, marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <AlertTriangle size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
                  <p className="text-xs" style={{ color: '#d97706' }}>
                    No trusted contact set. Go to <strong>Settings → Safety</strong> to add one first.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-muted tracking-wider uppercase flex items-center gap-1.5">
                    <Calendar size={12} /> Meeting Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    className="input"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    required
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-muted tracking-wider uppercase flex items-center gap-1.5">
                    <MapPin size={12} /> Meeting Location
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Café Coffee Day, Station Road, Nanded"
                    value={meetingLocation}
                    onChange={(e) => setMeetingLocation(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !hasTrustedContact}
                  className="btn btn-primary w-full py-3 flex-center gap-2 shadow-lg disabled:opacity-50 mt-2"
                >
                  <Shield size={16} />
                  {loading ? 'Sending...' : 'Notify Trusted Contact'}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
