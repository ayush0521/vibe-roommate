import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { matchesAPI, messagesAPI } from '../services/api';
import { Avatar, ScoreRing, PersonalityTag, SkeletonCard } from '../components/ui';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter, Sparkles, MessageCircle, Info, Star, ShieldAlert,
  Loader2, GraduationCap, ChevronDown, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ALL_BADGES = [
  'Clean Planner', 'Night Owl', 'Early Bird', 'Social Explorer',
  'Budget Saver', 'Study Focused', 'Easy Going', 'Homebody',
  'Active Lifestyle', 'Balanced'
];

const FALLBACK_MATCHES = [
  {
    matchId: 'm1',
    compatibilityScore: 94,
    explanation: ['Both are vegetarians', 'Similar budget ranges (₹3k–₹6k)', 'Both prefer quiet study rooms'],
    user: {
      _id: 'u1',
      fullName: 'Rohit Deshmukh',
      college: 'MGM College of Engineering, Nanded',
      city: 'Nanded',
      verificationStatus: 'verified',
      personalityTags: ['Clean Planner', 'Study Focused', 'Early Bird'],
      profilePhoto: { url: '' },
      gender: 'male',
      course: 'B.Tech CSE',
      year: 2
    }
  },
  {
    matchId: 'm2',
    compatibilityScore: 88,
    explanation: ['Sleep schedules align (Night Owls)', 'Both okay with occasional guests', 'Mess arrangement preferred'],
    user: {
      _id: 'u2',
      fullName: 'Akash Patil',
      college: 'SGGS Institute of Engineering, Nanded',
      city: 'Nanded',
      verificationStatus: 'verified',
      personalityTags: ['Night Owl', 'Social Explorer', 'Easy Going'],
      profilePhoto: { url: '' },
      gender: 'male',
      course: 'B.Tech ENTC',
      year: 3
    }
  },
  {
    matchId: 'm3',
    compatibilityScore: 81,
    explanation: ['Overlapping budget ranges', 'Both prefer single occupancy', 'Quiet study rooms'],
    user: {
      _id: 'u3',
      fullName: 'Vishal Jadhav',
      college: 'SRTR Government Polytechnic, Nanded',
      city: 'Nanded',
      verificationStatus: 'unverified',
      personalityTags: ['Budget Saver', 'Study Focused', 'Balanced'],
      profilePhoto: { url: '' },
      gender: 'male',
      course: 'Diploma CS',
      year: 1
    }
  }
];

// Custom styled dropdown for personality badge filter
function BadgeFilterDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', minWidth: 180 }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
          background: 'var(--color-surface)', border: '1.5px solid var(--color-border)',
          borderRadius: 10, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
          color: value ? '#10b981' : 'var(--color-text-muted)',
          width: '100%', justifyContent: 'space-between',
          transition: 'all 0.2s',
          boxShadow: open ? '0 0 0 3px rgba(16,185,129,0.12)' : 'none',
          borderColor: open ? '#10b981' : 'var(--color-border)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {value ? (
            <span style={{
              background: 'rgba(16,185,129,0.1)', color: '#059669',
              padding: '2px 8px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700
            }}>{value}</span>
          ) : (
            <span>All Personality Badges</span>
          )}
        </span>
        <ChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
              background: 'var(--color-surface)', border: '1.5px solid var(--color-border)',
              borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              zIndex: 100, overflow: 'hidden', padding: 8
            }}
          >
            <div
              onClick={() => { onChange(''); setOpen(false); }}
              style={{
                padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)',
                background: !value ? 'var(--color-surface-2)' : 'transparent',
                marginBottom: 4
              }}
            >
              All Personality Badges
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '4px 4px 8px' }}>
              {ALL_BADGES.map(badge => (
                <button
                  key={badge}
                  type="button"
                  onClick={() => { onChange(badge); setOpen(false); }}
                  style={{
                    padding: '4px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700,
                    border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                    background: value === badge ? 'rgba(16,185,129,0.15)' : 'var(--color-surface-2)',
                    color: value === badge ? '#059669' : 'var(--color-text-muted)',
                    outline: value === badge ? '1.5px solid #10b981' : '1.5px solid transparent',
                  }}
                >
                  {badge}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MatchDashboard() {
  const { profile } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalMatches, setTotalMatches] = useState(0);

  const [collegeFilter, setCollegeFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  const navigate = useNavigate();

  const fetchMatches = async (pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true);
    try {
      const { data } = await matchesAPI.getMatches({ page: pageNum, limit: 6 });
      if (data.data && data.data.length > 0) {
        if (append) {
          setMatches((prev) => [...prev, ...data.data]);
        } else {
          setMatches(data.data);
        }
        setIsPremium(data.isPremium || false);
        setTotalAvailable(data.totalAvailable || 3);
        setTotalMatches(data.total || data.data.length);
        setHasMore(data.hasMore || false);
      } else {
        if (!append) {
          setMatches(FALLBACK_MATCHES);
          setIsPremium(false);
          setTotalAvailable(3);
          setTotalMatches(FALLBACK_MATCHES.length);
          setHasMore(false);
        }
      }
    } catch (err) {
      console.warn('Matches endpoint error. Using mock data.', err);
      if (!append) {
        setMatches(FALLBACK_MATCHES);
        setIsPremium(false);
        setTotalAvailable(3);
        setTotalMatches(FALLBACK_MATCHES.length);
        setHasMore(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchMatches(1, false);
  }, []);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMatches(nextPage, true);
  };

  const handleStartChat = async (userId, matchId) => {
    try {
      const { data } = await messagesAPI.startConversation(userId);
      toast.success('Chat started!');
      navigate(`/chat/${data.data._id}`);
    } catch (err) {
      // For fallback mock: use matchId as mock conv id
      toast.success('Opening chat...');
      navigate(`/chat/${matchId || 'c1'}`);
    }
  };

  const triggerComputeMatches = async () => {
    setLoading(true);
    try {
      await matchesAPI.computeMatches();
      toast.success('Recalculated matches!');
      await fetchMatches();
    } catch (err) {
      toast.error('Failed to recompute matches');
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches = matches.filter((m) => {
    if (collegeFilter && !m.user?.college?.toLowerCase().includes(collegeFilter.toLowerCase())) return false;
    if (tagFilter && !m.user?.personalityTags?.some(tag => tag.toLowerCase().includes(tagFilter.toLowerCase()))) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-bg p-4 pt-24 pb-12">
        <div className="container max-w-5xl flex flex-col gap-8">
          <div>
            <div style={{ height: 36, background: 'var(--color-surface-2)', borderRadius: 12, width: 260, marginBottom: 8, animation: 'skeleton-shimmer 1.5s ease-in-out infinite', backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, var(--color-surface) 25%, var(--color-surface-2) 50%, var(--color-surface) 75%)' }} />
            <div style={{ height: 14, background: 'var(--color-surface-2)', borderRadius: 8, width: 360, animation: 'skeleton-shimmer 1.5s ease-in-out infinite', backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, var(--color-surface) 25%, var(--color-surface-2) 50%, var(--color-surface) 75%)' }} />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-4 pt-24 pb-12">
      <div className="container max-w-5xl flex flex-col gap-8">

        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-text tracking-tight flex items-center gap-2">
              <Sparkles className="text-emerald-500 animate-pulse-green" size={24} /> Roommate Matches
            </h1>
            <p className="text-sm text-text-muted mt-1">Based on your college, location, budget, and behavioral habits.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={triggerComputeMatches} className="btn btn-secondary font-bold">
              Recalculate Matches
            </button>
            {!isPremium && (
              <button
                onClick={() => toast.success('Premium plan simulation active! Unlock unlimited matches.')}
                className="btn btn-primary font-bold"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 4px 15px rgba(124,58,237,0.35)' }}
              >
                Go Premium ⭐
              </button>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        <div className="glass-card p-4 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 text-text-muted text-sm font-bold">
            <Filter size={16} /> Filters:
          </div>

          {/* College text filter */}
          <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 280 }}>
            <input
              type="text"
              placeholder="Search College (e.g. MGM, SGGS)"
              style={{
                width: '100%', padding: '8px 14px 8px 36px',
                background: 'var(--color-surface)', border: '1.5px solid var(--color-border)',
                borderRadius: 10, fontSize: '0.8rem', fontWeight: 500,
                color: 'var(--color-text)', outline: 'none', transition: 'all 0.2s',
                borderColor: collegeFilter ? '#10b981' : 'var(--color-border)',
              }}
              value={collegeFilter}
              onChange={(e) => setCollegeFilter(e.target.value)}
            />
            <GraduationCap size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            {collegeFilter && (
              <button onClick={() => setCollegeFilter('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                <X size={12} />
              </button>
            )}
          </div>

          <BadgeFilterDropdown value={tagFilter} onChange={setTagFilter} />

          {(collegeFilter || tagFilter) && (
            <button
              onClick={() => { setCollegeFilter(''); setTagFilter(''); }}
              style={{ padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.08)', borderRadius: 8, border: 'none', cursor: 'pointer' }}
            >
              Clear All
            </button>
          )}
        </div>

        {/* Grid of Matches */}
        <div className="grid md:grid-cols-2 gap-6">
          <AnimatePresence>
            {filteredMatches.map((match) => (
              <motion.div
                key={match.matchId}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ scale: 1.025, y: -4 }}
                style={{ cursor: 'default' }}
                className="glass-card p-6 flex flex-col justify-between gap-6 border border-border"
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 8px 40px rgba(16,185,129,0.18), 0 2px 12px rgba(0,0,0,0.08)';
                  e.currentTarget.style.borderColor = 'rgba(16,185,129,0.4)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '';
                  e.currentTarget.style.borderColor = '';
                }}
              >
                {/* Header Card Row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={match.user?.profilePhoto?.url}
                      name={match.user?.fullName}
                      size={56}
                      online={false}
                      verified={match.user?.verificationStatus === 'verified'}
                    />
                    <div>
                      <h3 className="font-extrabold text-text flex items-center gap-1.5">
                        {match.user?.fullName}
                      </h3>
                      <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                        <GraduationCap size={13} /> {match.user?.college || 'N/A'}
                      </p>
                      <p className="text-[10px] text-text-muted mt-0.5">
                        {match.user?.gender?.toUpperCase()} • {match.user?.city}
                        {match.user?.course && ` • ${match.user.course}`}
                        {match.user?.year && ` • Year ${match.user.year}`}
                      </p>
                    </div>
                  </div>
                  <ScoreRing score={match.compatibilityScore} />
                </div>

                {/* Personality Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {match.user?.personalityTags?.map((tag, idx) => (
                    <PersonalityTag key={idx} tag={tag} index={idx} />
                  ))}
                </div>

                {/* Match Explanation & Breakdown */}
                <div className="bg-surface-2 p-4 rounded-xl border border-border flex flex-col gap-4">
                  <div>
                    <h5 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Info size={12} className="text-emerald-500" /> Match Highlights
                    </h5>
                    <ul className="text-xs text-text flex flex-col gap-1.5 font-medium">
                      {match.explanation?.map((exp, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-start gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />
                          <span>{typeof exp === 'object' ? exp.label : exp}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Compatibility Breakdown Charts */}
                  {match.breakdown && (
                    <div style={{ borderTop: '1px dashed var(--color-border)', paddingTop: 12 }}>
                      <h6 className="text-[9px] font-bold text-text-muted uppercase tracking-wider mb-2.5">
                        Compatibility Details
                      </h6>
                      <div className="flex flex-col gap-2">
                        {[
                          { label: '💤 Sleep Schedule', val: match.breakdown.sleepSchedule },
                          { label: '🍔 Food Preference', val: match.breakdown.foodPreference },
                          { label: '📚 Study Style', val: match.breakdown.studyStyle },
                        ].map((factor, idx) => (
                          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                              <span>{factor.label}</span>
                              <span style={{ color: 'var(--color-primary)' }}>{factor.val || 0}%</span>
                            </div>
                            <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'var(--color-border)', overflow: 'hidden' }}>
                              <div style={{ width: `${factor.val || 0}%`, height: '100%', borderRadius: 3, background: 'var(--color-primary)', transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Row */}
                <div className="flex gap-2">
                  <Link
                    to={`/profile/${match.user?._id}`}
                    className="btn btn-secondary flex-1 font-bold text-xs py-2.5"
                    onClick={(e) => {
                      // For mock IDs, show a toast and prevent broken navigation
                      if (match.user?._id?.length <= 3) {
                        e.preventDefault();
                        toast('Profile view coming soon for mock users!', { icon: '👤' });
                      }
                    }}
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={() => handleStartChat(match.user?._id, match.matchId)}
                    className="btn btn-primary flex-1 flex-center gap-1.5 font-bold text-xs py-2.5 shadow-md"
                  >
                    <MessageCircle size={14} /> Send Message
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredMatches.length > 0 && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 24 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Showing {filteredMatches.length} of {totalMatches} compatible roommates
            </span>
            {hasMore && (
              <button
                onClick={loadMore}
                className="btn btn-secondary font-bold"
                style={{ padding: '10px 24px', borderRadius: 12 }}
              >
                Load More Matches
              </button>
            )}
          </div>
        )}

        {/* Premium Banner Box */}
        {!isPremium && totalAvailable > 3 && (
          <div className="p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 mt-4"
            style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(79,70,229,0.08))', border: '1px solid rgba(124,58,237,0.25)' }}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex-center flex-shrink-0"
                style={{ background: 'rgba(124,58,237,0.15)', color: '#7c3aed' }}>
                <ShieldAlert size={20} />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-text">Unlock More Roommate Matches!</h4>
                <p className="text-xs text-text-muted mt-0.5">We found {totalAvailable} total matches for you. Upgrade to Premium to see everyone.</p>
              </div>
            </div>
            <button
              onClick={() => toast.success('Premium package mock transaction success!')}
              className="btn btn-primary text-xs font-bold py-2.5 whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 4px 15px rgba(124,58,237,0.35)' }}
            >
              Unlock Unlimited (₹299)
            </button>
          </div>
        )}

        {filteredMatches.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-muted font-semibold text-sm">No matches found for your filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
