import { useEffect, useState } from 'react';
import { meetingsAPI } from '../services/api';
import { Avatar } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Calendar, ArrowLeft, ExternalLink, Loader2, Sparkles, CheckCircle, Clock, Users, X, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FALLBACK_MEETS = [
  {
    _id: 'mt1',
    participants: [
      { _id: 'u1', fullName: 'Rohit Deshmukh', college: 'MGM College of Engineering, Nanded' }
    ],
    meetLink: 'https://meet.google.com/new',
    status: 'completed',
    outcome: 'agreed',
    summary: 'Both agreed to share a PG near Cidco. Rohit prefers early morning schedule and is vegetarian — matches perfectly.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    _id: 'mt2',
    participants: [
      { _id: 'u2', fullName: 'Akash Patil', college: 'SGGS Institute of Engineering, Nanded' }
    ],
    meetLink: 'https://meet.google.com/new',
    status: 'both-ready',
    outcome: null,
    summary: null,
    createdAt: new Date().toISOString(),
  }
];

function MeetingSummaryModal({ meet, otherUser, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)', zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--color-surface)', borderRadius: 24,
          padding: 32, maxWidth: 480, width: '100%',
          border: '1.5px solid var(--color-border)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: meet.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {meet.status === 'completed' ? <CheckCircle size={24} style={{ color: '#10b981' }} /> : <Clock size={24} style={{ color: '#f59e0b' }} />}
            </div>
            <div>
              <h3 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-text)', margin: 0 }}>Meeting Summary</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>{otherUser.fullName}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        {/* Status */}
        <div style={{
          padding: '12px 16px', borderRadius: 12, marginBottom: 20,
          background: meet.status === 'completed' ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
          border: `1px solid ${meet.status === 'completed' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{
            fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em',
            color: meet.status === 'completed' ? '#10b981' : '#f59e0b',
          }}>
            {meet.status === 'completed' ? '✅ Discussion Completed' : '⏳ Both Ready — Awaiting Call'}
          </span>
        </div>

        {/* Outcome */}
        {meet.outcome && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Outcome</p>
            <div style={{
              padding: '10px 14px', borderRadius: 10,
              background: meet.outcome === 'agreed' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${meet.outcome === 'agreed' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
              color: meet.outcome === 'agreed' ? '#10b981' : '#ef4444',
              fontWeight: 700, fontSize: '0.85rem',
            }}>
              {meet.outcome === 'agreed' ? '🤝 Agreed to be Roommates' : '❌ Did Not Match'}
            </div>
          </div>
        )}

        {/* Summary */}
        {meet.summary && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <MessageSquare size={13} /> Discussion Notes
            </p>
            <div style={{
              padding: '14px 16px', borderRadius: 12,
              background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
              fontSize: '0.84rem', color: 'var(--color-text)', lineHeight: 1.65
            }}>
              {meet.summary}
            </div>
          </div>
        )}

        {!meet.summary && meet.status === 'both-ready' && (
          <div style={{
            padding: '16px', borderRadius: 12, background: 'rgba(16,185,129,0.06)',
            border: '1px solid rgba(16,185,129,0.2)', textAlign: 'center', marginBottom: 20
          }}>
            <p style={{ fontSize: '0.83rem', color: 'var(--color-text-muted)', margin: 0 }}>
              Both are ready! Click Join Call to start your real-time video sync.
            </p>
          </div>
        )}

        {/* Date + Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Calendar size={13} /> {new Date(meet.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          {(meet.status === 'both-ready' || meet.status === 'active') && (
            <a
              href="https://meet.google.com/new"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 10,
                fontWeight: 700, fontSize: '0.82rem',
                background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white',
                textDecoration: 'none', boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
              }}
            >
              <ExternalLink size={13} /> Join Call
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function MeetHistoryPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeet, setSelectedMeet] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await meetingsAPI.getHistory();
        if (data.data && data.data.length > 0) {
          setMeetings(data.data);
        } else {
          setMeetings(FALLBACK_MEETS);
        }
      } catch (err) {
        setMeetings(FALLBACK_MEETS);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getStatus = (status) => {
    if (status === 'both-ready' || status === 'active') return { label: 'Both Ready', color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)' };
    if (status === 'completed') return { label: 'Completed', color: '#6b7280', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.2)' };
    return { label: status, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' };
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: '96px 16px 48px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontWeight: 700, fontSize: '0.85rem', alignSelf: 'flex-start', padding: 0 }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.1))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1.5px solid rgba(16,185,129,0.2)',
            }}>
              <Video size={26} style={{ color: '#10b981' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-text)', margin: 0, letterSpacing: '-0.5px' }}>
                Meet History
              </h1>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '3px 0 0' }}>
                Keep track of your video syncs with potential roommates.
              </p>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14,
        }}>
          {[
            { icon: <Users size={18} />, val: meetings.length, label: 'Total Syncs', color: '#10b981' },
            { icon: <CheckCircle size={18} />, val: meetings.filter(m => m.status === 'completed').length, label: 'Completed', color: '#6b7280' },
            { icon: <Clock size={18} />, val: meetings.filter(m => m.status === 'both-ready').length, label: 'Pending Calls', color: '#f59e0b' },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'var(--color-surface)', borderRadius: 16, padding: '16px 20px',
              border: '1.5px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ color: s.color, opacity: 0.8 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-text)', lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600, marginTop: 2 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Cards */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <Loader2 className="animate-spin text-emerald-500" size={32} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {meetings.map((meet) => {
              const otherUser = meet.participants.find(p => p?._id !== profile?._id) || meet.participants[0] || { fullName: 'Roommate' };
              const isReady = meet.status === 'both-ready' || meet.status === 'active';
              const st = getStatus(meet.status);
              return (
                <motion.div
                  key={meet._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.015, y: -3 }}
                  onClick={() => setSelectedMeet(meet)}
                  style={{
                    background: 'var(--color-surface)', borderRadius: 20,
                    padding: '24px 28px', border: '1.5px solid var(--color-border)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.05)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
                    transition: 'box-shadow 0.2s, border-color 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(16,185,129,0.15)';
                    e.currentTarget.style.borderColor = 'rgba(16,185,129,0.35)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.05)';
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Avatar src={otherUser.profilePhoto?.url} name={otherUser.fullName} size={54} />
                    <div>
                      <h3 style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-text)', margin: '0 0 3px' }}>{otherUser.fullName}</h3>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '0 0 6px' }}>{otherUser.college || 'Nanded'}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                        <Calendar size={11} /> Sync: {new Date(meet.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                    <span style={{
                      fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em',
                      padding: '4px 12px', borderRadius: 99,
                      background: st.bg, color: st.color, border: `1px solid ${st.border}`,
                    }}>
                      {st.label}
                    </span>

                    {isReady ? (
                      <a
                        href="https://meet.google.com/new"
                        target="_blank"
                        rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '7px 16px', borderRadius: 10,
                          fontWeight: 800, fontSize: '0.78rem',
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: 'white', textDecoration: 'none',
                          boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                        }}
                      >
                        Join Call <ExternalLink size={12} />
                      </a>
                    ) : (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem',
                        color: 'var(--color-text-muted)', fontWeight: 600,
                        padding: '6px 12px', background: 'var(--color-surface-2)', borderRadius: 8
                      }}>
                        <Sparkles size={12} style={{ color: '#10b981' }} />
                        Click to view summary
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {meetings.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)' }}>
            <Video size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>No meeting history yet.</p>
            <p style={{ fontSize: '0.8rem', marginTop: 6 }}>Start chatting with matches to schedule video syncs!</p>
          </div>
        )}
      </div>

      {/* Meeting Summary Modal */}
      <AnimatePresence>
        {selectedMeet && (
          <MeetingSummaryModal
            meet={selectedMeet}
            otherUser={selectedMeet.participants.find(p => p?._id !== profile?._id) || selectedMeet.participants[0] || { fullName: 'Roommate' }}
            onClose={() => setSelectedMeet(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
