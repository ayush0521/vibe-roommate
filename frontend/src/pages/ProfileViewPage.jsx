import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersAPI, messagesAPI, reportsAPI } from '../services/api';
import { Avatar, VerifiedBadge, PersonalityTag, CompatibilityBar, SkeletonProfile } from '../components/ui';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  GraduationCap, MapPin, MessageCircle, AlertTriangle, ArrowLeft,
  Calendar, Check, UserCheck, Flame, Compass, Heart
} from 'lucide-react';

export default function ProfileViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [targetUser, setTargetUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Report Modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('inappropriate_profile');
  const [reportDesc, setReportDesc] = useState('');
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await usersAPI.getProfile(id);
        setTargetUser(data.data);
      } catch (err) {
        toast.error('Failed to load profile');
        navigate('/matches');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, navigate]);

  const handleStartChat = async () => {
    try {
      const { data } = await messagesAPI.startConversation(id);
      toast.success('Chat started!');
      navigate(`/chat/${data.data._id}`);
    } catch (err) {
      toast.error('Failed to start chat');
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    setReporting(true);
    try {
      await reportsAPI.createReport({
        targetType: 'profile',
        targetId: id,
        reason: reportReason,
        description: reportDesc
      });
      toast.success('Report submitted. Our team will review it.');
      setShowReportModal(false);
      setReportDesc('');
    } catch (err) {
      toast.error('Failed to submit report');
    } finally {
      setReporting(false);
    }
  };

  if (loading) return <SkeletonProfile />;

  const scores = targetUser?.compatibilityScores || {};

  return (
    <div className="min-h-screen bg-bg p-4 pt-24 pb-12">
      <div className="container max-w-4xl flex flex-col gap-6">
        
        {/* Back Link */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-text-muted hover:text-text font-bold text-sm self-start">
          <ArrowLeft size={16} /> Back
        </button>

        {/* Profile Card Header */}
        <div className="glass-card p-8 flex flex-col md:flex-row items-center md:items-start gap-8 border border-border">
          <Avatar
            src={targetUser?.profilePhoto?.url}
            name={targetUser?.fullName}
            size={120}
            online={false}
            verified={targetUser?.verificationStatus === 'verified'}
          />

          <div className="flex-1 flex flex-col gap-4 text-center md:text-left">
            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <h2 className="text-3xl font-extrabold text-text">{targetUser?.fullName}</h2>
                {targetUser?.verificationStatus === 'verified' && <VerifiedBadge size="md" />}
              </div>
              
              <p className="text-sm text-text-muted flex items-center justify-center md:justify-start gap-1.5 mt-1 font-semibold">
                <GraduationCap size={16} /> {targetUser?.college} • {targetUser?.course} ({targetUser?.year} Year)
              </p>
              
              <p className="text-xs text-text-muted flex items-center justify-center md:justify-start gap-1 mt-1 font-medium">
                <MapPin size={14} className="text-emerald-500" /> Lives in {targetUser?.area}, {targetUser?.city}
              </p>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              {targetUser?.personalityTags?.map((tag, idx) => (
                <PersonalityTag key={idx} tag={tag} index={idx} />
              ))}
            </div>

            {targetUser?.bio && (
              <p className="text-sm text-text-muted italic leading-relaxed border-l-2 border-emerald-500 pl-3 max-w-xl text-left">
                "{targetUser.bio}"
              </p>
            )}

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
              <button
                onClick={handleStartChat}
                className="btn btn-primary flex items-center gap-2 shadow-lg px-6 font-bold"
              >
                <MessageCircle size={18} /> Chat with Roommate
              </button>

              <button
                onClick={() => setShowReportModal(true)}
                className="btn btn-ghost text-red-500 hover:bg-red-500/10 flex items-center gap-1.5 px-4 font-bold"
              >
                <AlertTriangle size={16} /> Report Profile
              </button>
            </div>
          </div>
        </div>

        {/* Breakdown Panel */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Lifestyle Overview */}
          <div className="glass-card p-6 flex flex-col gap-4 border border-border">
            <h3 className="font-extrabold text-base text-text flex items-center gap-2">
              <Compass className="text-emerald-500" size={18} /> Lifestyle & Choices
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-surface-2 p-3.5 rounded-xl border border-border">
                <span className="text-[10px] font-bold text-text-muted uppercase block">Sleep Schedule</span>
                <span className="font-extrabold text-text mt-1 block capitalize">
                  {targetUser?.sleepSchedule?.replace('-', ' ') || 'Flexible'}
                </span>
              </div>
              <div className="bg-surface-2 p-3.5 rounded-xl border border-border">
                <span className="text-[10px] font-bold text-text-muted uppercase block">Food Preference</span>
                <span className="font-extrabold text-text mt-1 block capitalize">
                  {targetUser?.foodPreference || 'Veg'} ({targetUser?.foodArrangement || 'Mess'})
                </span>
              </div>
              <div className="bg-surface-2 p-3.5 rounded-xl border border-border">
                <span className="text-[10px] font-bold text-text-muted uppercase block">Smoking / Drinking</span>
                <span className="font-extrabold text-text mt-1 block capitalize">
                  Smoke: {targetUser?.smokingHabit || 'No'} • Drink: {targetUser?.drinkingHabit || 'No'}
                </span>
              </div>
              <div className="bg-surface-2 p-3.5 rounded-xl border border-border">
                <span className="text-[10px] font-bold text-text-muted uppercase block">Budget Goal</span>
                <span className="font-extrabold text-emerald-600 mt-1 block">
                  ₹{targetUser?.budgetRange?.min || 2000} - ₹{targetUser?.budgetRange?.max || 8000}/mo
                </span>
              </div>
            </div>
          </div>

          {/* Compatibility score breakdown */}
          <div className="glass-card p-6 flex flex-col gap-4 border border-border">
            <h3 className="font-extrabold text-base text-text flex items-center gap-2">
              <Flame className="text-emerald-500 animate-pulse" size={18} /> Compatibility Scores
            </h3>
            <div className="flex flex-col gap-2">
              <CompatibilityBar label="Cleanliness" score={(scores.cleanliness || 5) * 10} />
              <CompatibilityBar label="Sleep Rhythm" score={(scores.sleep || 5) * 10} />
              <CompatibilityBar label="Social & Noise" score={(scores.social || 5) * 10} />
              <CompatibilityBar label="Study & Focus" score={(scores.study || 5) * 10} />
            </div>
          </div>
        </div>

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-surface border border-border rounded-xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <h3 className="font-extrabold text-lg text-text mb-4">Report This Profile</h3>
              <form onSubmit={handleReport} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-text-muted uppercase">Reason for Report</label>
                  <select
                    className="select mt-1"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                  >
                    <option value="inappropriate_profile">Inappropriate bio/profile photos</option>
                    <option value="fake_account">Fake student / impersonation</option>
                    <option value="harassment">Harassment or abusive behavior</option>
                    <option value="spam">Spam / advertising</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-text-muted uppercase">Detailed Description</label>
                  <textarea
                    rows={3}
                    placeholder="Provide details of the violation..."
                    className="input mt-1 py-3"
                    value={reportDesc}
                    onChange={(e) => setReportDesc(e.target.value)}
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="btn btn-secondary py-2 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reporting}
                    className="btn btn-danger py-2 text-xs font-bold shadow-md"
                  >
                    {reporting ? 'Reporting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

      </div>
    </div>
  );
}
