import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { matchesAPI, listingsAPI, meetingsAPI, messagesAPI } from '../services/api';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Heart, MessageCircle, Building2, Video, ShieldCheck,
  ChevronRight, Sparkles, Bell, GraduationCap,
  MapPin, IndianRupee, TrendingUp
} from 'lucide-react';

// ─── Stat Card ────────────────────────────────────────────────
function StatCard({ icon: Icon, value, label, color, to }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => to && navigate(to)}
      style={{
        background: 'var(--color-surface)', border: '1.5px solid var(--color-border)',
        borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'center',
        gap: 14, cursor: to ? 'pointer' : 'default', flex: 1, minWidth: 130,
        transition: 'box-shadow 0.2s, transform 0.2s',
      }}
      onMouseEnter={e => { if (to) { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
    >
      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-text)', lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600, marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

// ─── Match Card ────────────────────────────────────────────────
function MatchCard({ match, onSayHi }) {
  const u = match?.user || {};
  const score = match?.compatibilityScore || 80;
  const scoreColor = score >= 85 ? '#10b981' : score >= 70 ? '#f59e0b' : '#6b7280';
  return (
    <div style={{
      background: 'var(--color-surface)', border: '1.5px solid var(--color-border)',
      borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
    }}>
      {/* Avatar */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%', overflow: 'hidden',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid var(--color-border)',
        }}>
          {u?.profilePhoto?.url
            ? <img src={u.profilePhoto.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem' }}>{(u?.fullName || 'U')[0]}</span>
          }
        </div>
        <span style={{
          position: 'absolute', bottom: -3, right: -3,
          background: scoreColor, color: 'white', borderRadius: 99,
          fontSize: '0.55rem', fontWeight: 900, padding: '1px 5px',
          border: '1.5px solid var(--color-surface)',
        }}>{score}%</span>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 5 }}>
          {u?.fullName || 'Student'}
          {u?.verificationStatus === 'verified' && <ShieldCheck size={12} style={{ color: '#10b981' }} />}
        </div>
        <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginTop: 1 }}>
          {(u?.college || '').split('(')[0].trim().substring(0, 36) || 'Nanded College'}
        </div>
        {match?.explanation?.[0] && (
          <div style={{ fontSize: '0.63rem', color: '#10b981', marginTop: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Sparkles size={9} /> {typeof match.explanation[0] === 'object' ? match.explanation[0].label : match.explanation[0]}
          </div>
        )}
      </div>

      {/* Say Hi */}
      <button
        onClick={() => onSayHi(u?._id)}
        style={{
          padding: '7px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: 'white', fontWeight: 700, fontSize: '0.73rem',
          display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
          boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
        }}
      >
        <MessageCircle size={12} /> Say Hi
      </button>
    </div>
  );
}

// ─── Listing Card ─────────────────────────────────────────────
function ListingCard({ listing }) {
  return (
    <Link to={`/listings/${listing._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{
        background: 'var(--color-surface)', border: '1.5px solid var(--color-border)',
        borderRadius: 14, overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s',
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
      >
        <div style={{ height: 96, background: 'var(--color-surface-2)', position: 'relative', overflow: 'hidden' }}>
          {listing?.images?.[0]?.url
            ? <img src={listing.images[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={26} style={{ color: 'var(--color-text-muted)', opacity: 0.4 }} />
              </div>
          }
          <span style={{
            position: 'absolute', top: 7, left: 7, background: '#10b981', color: 'white',
            borderRadius: 6, fontSize: '0.58rem', fontWeight: 800, padding: '2px 7px', textTransform: 'uppercase',
          }}>{listing?.type || 'pg'}</span>
        </div>
        <div style={{ padding: '10px 12px' }}>
          <div style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--color-text)', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {listing?.title || 'Listing'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-text-muted)', fontSize: '0.66rem', marginBottom: 5 }}>
            <MapPin size={9} /> {listing?.area}, {listing?.city}
          </div>
          <div style={{ fontWeight: 900, fontSize: '0.88rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 2 }}>
            <IndianRupee size={11} />{(listing?.rent || 0).toLocaleString()}
            <span style={{ fontWeight: 500, color: 'var(--color-text-muted)', fontSize: '0.62rem' }}>/mo</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Shimmer Skeleton ─────────────────────────────────────────
function Shimmer({ height = 80, radius = 14 }) {
  return (
    <div style={{
      height, borderRadius: radius, background: 'var(--color-surface-2)',
      animation: 'shimmer 1.5s ease-in-out infinite',
    }} />
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function HomePage() {
  const { profile, hasCompletedQuiz } = useAuth();
  const navigate = useNavigate();
  const { notifications = [], unreadCount = 0 } = useNotifications() || {};

  const [matches, setMatches] = useState([]);
  const [listings, setListings] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [mRes, lRes, meetRes] = await Promise.allSettled([
          matchesAPI.getMatches(),
          listingsAPI.getListings({ city: profile?.city || 'Nanded', limit: 3 }),
          meetingsAPI.getHistory(),
        ]);
        if (mRes.status === 'fulfilled') setMatches((mRes.value?.data?.data || []).slice(0, 3));
        if (lRes.status === 'fulfilled') setListings((lRes.value?.data?.data || []).slice(0, 3));
        if (meetRes.status === 'fulfilled') setMeetings((meetRes.value?.data?.data || []).filter(m => m?.status !== 'completed').slice(0, 2));
      } catch (_) {
        // fail silently — show empty state
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [profile?.city]);

  const handleSayHi = async (userId) => {
    if (!userId) return;
    try {
      const { data } = await messagesAPI.startConversation(userId);
      navigate(`/chat/${data?.data?._id}`);
    } catch {
      toast.error('Could not open chat. Try again.');
    }
  };

  // Profile completion %
  const profilePct = (() => {
    if (!profile) return 0;
    const fields = ['fullName', 'college', 'city', 'area', 'bio', 'gender', 'course'];
    const filled = fields.filter(f => !!profile[f]).length;
    const hasPhoto = !!profile?.profilePhoto?.url;
    const pts = filled + (hasPhoto ? 1 : 0) + (hasCompletedQuiz ? 1 : 0);
    return Math.round((pts / (fields.length + 2)) * 100);
  })();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return '🌅 Good morning';
    if (h < 17) return '☀️ Good afternoon';
    return '🌙 Good evening';
  };

  const firstName = profile?.fullName?.split(' ')[0] || 'there';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: '88px 16px 48px' }}>
      {/* Shimmer keyframe */}
      <style>{`
        @keyframes shimmer {
          0%,100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>

      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── WELCOME BANNER ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            borderRadius: 22,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 55%, #047857 100%)',
            padding: '28px 28px 22px',
            position: 'relative', overflow: 'hidden',
            boxShadow: '0 10px 36px rgba(16,185,129,0.32)',
          }}
        >
          {/* Background orbs */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', filter: 'blur(24px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -20, left: 80, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', filter: 'blur(18px)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.72)', fontWeight: 600, margin: '0 0 4px' }}>{greeting()}</p>
              <h1 style={{ fontSize: '1.7rem', fontWeight: 900, color: 'white', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
                {firstName} 👋
              </h1>
              {profile?.college && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.73rem', color: 'rgba(255,255,255,0.82)', fontWeight: 600 }}>
                  <GraduationCap size={13} />
                  {profile.college.split('(')[0].trim().substring(0, 50)}{profile.college.length > 50 ? '…' : ''}
                </div>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                {profile?.verificationStatus === 'verified' && (
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, background: 'rgba(255,255,255,0.2)', color: 'white', padding: '3px 10px', borderRadius: 99, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ShieldCheck size={11} /> Verified
                  </span>
                )}
                {hasCompletedQuiz && (
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, background: 'rgba(255,255,255,0.15)', color: 'white', padding: '3px 10px', borderRadius: 99 }}>
                    ✅ Quiz Done
                  </span>
                )}
              </div>
            </div>

            {/* Profile ring */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flexShrink: 0 }}>
              <div style={{ position: 'relative', width: 64, height: 64 }}>
                <svg width="64" height="64" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
                  <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
                  <circle cx="32" cy="32" r="28" fill="none" stroke="white" strokeWidth="4"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - profilePct / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {profile?.profilePhoto?.url
                    ? <img src={profile.profilePhoto.url} alt="" style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover', border: '2px solid white' }} />
                    : <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: 'white', fontWeight: 900, fontSize: '1.2rem' }}>{firstName[0]?.toUpperCase()}</span>
                      </div>
                  }
                </div>
              </div>
              <span style={{ fontSize: '0.63rem', color: 'rgba(255,255,255,0.82)', fontWeight: 700 }}>{profilePct}% Profile</span>
            </div>
          </div>

          {/* Quick links */}
          <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 18 }}>
            {[
              { label: '🔥 Matches', to: '/matches' },
              { label: '💬 Chat', to: '/chat' },
              { label: '🏠 Listings', to: '/listings' },
              { label: '🎬 Meets', to: '/meetings' },
            ].map(({ label, to }) => (
              <Link key={to} to={to} style={{
                padding: '6px 14px', borderRadius: 9, textDecoration: 'none',
                background: 'rgba(255,255,255,0.18)', color: 'white',
                fontSize: '0.73rem', fontWeight: 700,
                border: '1px solid rgba(255,255,255,0.22)',
                backdropFilter: 'blur(8px)',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.28)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
              >{label}</Link>
            ))}
          </div>
        </motion.div>

        {/* ── STATS BAR ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
        >
          <StatCard icon={Heart}          value={matches.length || 0}  label="Matches"         color="#10b981" to="/matches"  />
          <StatCard icon={MessageCircle}  value={unreadCount || 0}     label="Unread Msgs"     color="#6366f1" to="/chat"     />
          <StatCard icon={Building2}      value={listings.length || 0} label="Nearby Listings" color="#f59e0b" to="/listings" />
          <StatCard icon={Video}          value={meetings.length || 0} label="Pending Meets"   color="#ec4899" to="/meetings" />
        </motion.div>

        {/* ── TWO-COLUMN GRID ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 20 }}>

          {/* Top Matches */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 7, margin: 0 }}>
                <Heart size={16} style={{ color: '#10b981' }} /> Top Matches
              </h2>
              <Link to="/matches" style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
                See all <ChevronRight size={13} />
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {loading
                ? [1,2,3].map(i => <Shimmer key={i} height={78} />)
                : matches.length > 0
                  ? matches.map((m, i) => <MatchCard key={m?.matchId || i} match={m} onSayHi={handleSayHi} />)
                  : (
                    <div style={{ padding: '28px 16px', textAlign: 'center', background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', borderRadius: 14 }}>
                      <Sparkles size={26} style={{ margin: '0 auto 8px', color: '#10b981', opacity: 0.5 }} />
                      <p style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: '0 0 8px' }}>
                        {hasCompletedQuiz ? 'No matches yet — check back soon!' : 'Take the quiz to see your matches'}
                      </p>
                      {!hasCompletedQuiz && (
                        <Link to="/quiz" style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700 }}>Take Quiz →</Link>
                      )}
                    </div>
                  )
              }
            </div>
          </motion.div>

          {/* Right col: Activity + Meets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Recent Activity */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <h2 style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 7, margin: 0 }}>
                  <TrendingUp size={16} style={{ color: '#6366f1' }} /> Recent Activity
                </h2>
                <Link to="/notifications" style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
                  See all <ChevronRight size={13} />
                </Link>
              </div>
              <div style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', borderRadius: 14, overflow: 'hidden' }}>
                {notifications.slice(0, 4).length > 0
                  ? notifications.slice(0, 4).map((n, i, arr) => (
                    <div key={n?._id || i}
                      onClick={() => navigate(n?.link || '/notifications')}
                      style={{
                        padding: '11px 14px', display: 'flex', alignItems: 'flex-start', gap: 10,
                        cursor: 'pointer', borderBottom: i < arr.length - 1 ? '1px solid var(--color-border)' : 'none',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: n?.isRead ? 'var(--color-border)' : '#10b981', flexShrink: 0, marginTop: 6 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text)' }}>{n?.title}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginTop: 1 }}>{n?.content}</div>
                      </div>
                    </div>
                  ))
                  : (
                    <div style={{ padding: '22px', textAlign: 'center' }}>
                      <Bell size={22} style={{ margin: '0 auto 6px', opacity: 0.3, color: 'var(--color-text-muted)' }} />
                      <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600, margin: 0 }}>No activity yet</p>
                    </div>
                  )
                }
              </div>
            </motion.div>

            {/* Upcoming Meets */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <h2 style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 7, margin: 0 }}>
                  <Video size={16} style={{ color: '#ec4899' }} /> Upcoming Meets
                </h2>
                <Link to="/meetings" style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
                  See all <ChevronRight size={13} />
                </Link>
              </div>
              <div style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', borderRadius: 14, overflow: 'hidden' }}>
                {meetings.length > 0
                  ? meetings.map((meet, i) => (
                    <div key={meet?._id || i} style={{ padding: '13px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, borderBottom: i < meetings.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(236,72,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Video size={15} style={{ color: '#ec4899' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text)' }}>Meet Pending</div>
                          <div style={{ fontSize: '0.65rem', color: '#f59e0b', fontWeight: 600 }}>Both Ready • Awaiting call</div>
                        </div>
                      </div>
                      <Link to="/meetings" style={{ padding: '5px 12px', borderRadius: 8, textDecoration: 'none', background: 'rgba(236,72,153,0.1)', color: '#ec4899', fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap' }}>Join</Link>
                    </div>
                  ))
                  : (
                    <div style={{ padding: '22px', textAlign: 'center' }}>
                      <Video size={22} style={{ margin: '0 auto 6px', opacity: 0.3, color: 'var(--color-text-muted)' }} />
                      <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600, margin: '0 0 6px' }}>No pending meets</p>
                      <Link to="/chat" style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>Start chatting to schedule →</Link>
                    </div>
                  )
                }
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── NEARBY LISTINGS ── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 7, margin: 0 }}>
              <Building2 size={16} style={{ color: '#f59e0b' }} /> Nearby Listings
              {profile?.city && <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>· {profile.city}</span>}
            </h2>
            <Link to="/listings" style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
              Browse all <ChevronRight size={13} />
            </Link>
          </div>
          {loading
            ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                {[1,2,3].map(i => <Shimmer key={i} height={160} />)}
              </div>
            : listings.length > 0
              ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                  {listings.map((l) => <ListingCard key={l?._id} listing={l} />)}
                </div>
              : (
                <div style={{ padding: '28px', textAlign: 'center', background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', borderRadius: 14 }}>
                  <Building2 size={26} style={{ margin: '0 auto 8px', opacity: 0.3, color: 'var(--color-text-muted)' }} />
                  <p style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: '0 0 8px' }}>No listings near your area yet</p>
                  <Link to="/listings" style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700 }}>Browse all listings →</Link>
                </div>
              )
          }
        </motion.div>

      </div>
    </div>
  );
}
