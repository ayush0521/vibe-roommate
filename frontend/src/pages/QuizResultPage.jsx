import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quizAPI } from '../services/api';
import { PersonalityTag, CompatibilityBar } from '../components/ui';
import { motion } from 'framer-motion';
import { Award, ArrowRight, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';

export default function QuizResultPage() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const { data } = await quizAPI.getResult();
        setResult(data.data);
      } catch (err) {
        console.warn('Quiz result not found in DB', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, []);

  const tags = result?.personalityTags || profile?.personalityTags || [];
  const scores = result?.hiddenScores || profile?.compatibilityScores || {};

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4 pt-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className="w-full max-w-2xl bg-surface border border-border p-8 rounded-2xl shadow-xl glass text-center flex flex-col gap-6"
      >
        <div className="flex-col-center gap-2">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 flex-center shadow-lg relative animate-bounce">
            <Award size={36} />
            <Sparkles className="absolute -top-1 -right-1 text-yellow-500" size={16} />
          </div>
          <h2 className="text-3xl font-extrabold text-text mt-3">Personality Revealed!</h2>
          <p className="text-text-muted text-sm max-w-md">We've calculated your lifestyle metrics to help match you with roommates of similar frequencies.</p>
        </div>

        {/* Personality Tags Display */}
        <div className="bg-surface-2 p-6 rounded-xl border border-border flex flex-col gap-3">
          <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Your Roommate Personality Badges</h4>
          {tags.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {tags.map((tag, i) => (
                <PersonalityTag key={i} tag={tag} index={i} />
              ))}
            </div>
          ) : (
            <span className="text-sm font-semibold text-text-muted">No tags computed yet. Complete the setup.</span>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="text-left bg-surface p-6 rounded-xl border border-border flex flex-col gap-4">
          <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider text-center">Compatibility Dimensions</h4>
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-2 mt-2">
            <CompatibilityBar label="Cleanliness & Organization" score={(scores.cleanliness || 5) * 10} />
            <CompatibilityBar label="Sleep Schedule" score={(scores.sleep || 5) * 10} />
            <CompatibilityBar label="Social / Guest Vibe" score={(scores.social || 5) * 10} />
            <CompatibilityBar label="Study & Focus Habits" score={(scores.study || 5) * 10} />
            <CompatibilityBar label="Budget Sensitivity" score={(scores.financial || 5) * 10} />
            <CompatibilityBar label="Conflict Resolution" score={(scores.conflict || 5) * 10} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          <div
            title="Retake Quiz is a Premium feature — coming soon!"
            style={{ position: 'relative', display: 'inline-block' }}
          >
            <button
              disabled
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 20px', borderRadius: 12, fontWeight: 700, fontSize: '0.9rem',
                background: 'var(--color-surface-2)', color: 'var(--color-text-muted)',
                border: '1.5px solid var(--color-border)', cursor: 'not-allowed', opacity: 0.7,
              }}
            >
              <RefreshCw size={16} /> Retake Quiz
              <span style={{
                fontSize: '0.6rem', fontWeight: 800, background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white', padding: '2px 6px', borderRadius: 99, marginLeft: 2, letterSpacing: '0.05em'
              }}>PREMIUM</span>
            </button>
          </div>
          <Link to="/matches" className="btn btn-primary flex items-center gap-1.5 shadow-lg font-bold">
            Explore Roommate Matches <ArrowRight size={16} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
