import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { listingsAPI, usersAPI, reportsAPI, messagesAPI } from '../services/api';
import { FacilityChip } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  MapPin, ShieldCheck, Heart, Phone, ArrowLeft,
  Navigation, Eye, Share2, Compass, AlertTriangle, Building2, User, MessageCircle
} from 'lucide-react';
import LeafletMap from '../components/ui/LeafletMap';

const AREA_COORDINATES = {
  // Nanded
  'cidco colony': { lat: 19.1640, lon: 77.2980 },
  'vazirabad': { lat: 19.1500, lon: 77.3150 },
  'taroda naka': { lat: 19.1820, lon: 77.3100 },
  'taroda road': { lat: 19.1820, lon: 77.3100 },
  'shivaji nagar': { lat: 19.1550, lon: 77.3250 },
  'anand nagar': { lat: 19.1610, lon: 77.3020 },
  'vishnupuri': { lat: 19.1126, lon: 77.2913 },
  'namaskar chowk': { lat: 19.176746, lon: 77.325152 },
  'yeshwant college road': { lat: 19.1500, lon: 77.3070 },
  'degloor naka': { lat: 19.1300, lon: 77.3350 },
  'vip road': { lat: 19.1580, lon: 77.3000 },
  'srinagar': { lat: 19.1700, lon: 77.3180 },
  'khadkut road': { lat: 19.1450, lon: 77.3280 },
  'workplace area': { lat: 19.1450, lon: 77.3280 },
  'kala mandir area': { lat: 19.1520, lon: 77.3120 },
  'nanded center': { lat: 19.1383, lon: 77.3210 },
  
  // Pune
  'kothrud': { lat: 18.5074, lon: 73.8077 },
  'shivajinagar': { lat: 18.5308, lon: 73.8474 },
  'viman nagar': { lat: 18.5679, lon: 73.9143 },
  'kalyani nagar': { lat: 18.5463, lon: 73.9033 },
  'hinjawadi': { lat: 18.5913, lon: 73.7389 },
  'aundh': { lat: 18.5580, lon: 73.8075 },
  'katraj': { lat: 18.4529, lon: 73.8546 },
  'baner': { lat: 18.5590, lon: 73.7787 },
  'hadapsar': { lat: 18.4967, lon: 73.9417 },
  'karve nagar': { lat: 18.4900, lon: 73.8200 },
  'pune center': { lat: 18.5204, lon: 73.8567 },

  // Mumbai
  'dadar': { lat: 19.0178, lon: 72.8478 },
  'bandra': { lat: 19.0596, lon: 72.8295 },
  'andheri': { lat: 19.1136, lon: 72.8697 },
  'wadala': { lat: 19.0222, lon: 72.8550 },
  'powai': { lat: 19.1176, lon: 72.9060 },
  'chembur': { lat: 19.0622, lon: 72.8974 },
  'vile parle': { lat: 19.0968, lon: 72.8355 },
  'mulund': { lat: 19.1726, lon: 72.9565 },
  'thane center': { lat: 19.2183, lon: 72.9781 },
  'ghatkopar': { lat: 19.0864, lon: 72.9090 },
  'mumbai center': { lat: 19.0760, lon: 72.8777 }
};

export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  // Report Modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('inappropriate_listing');
  const [reportDesc, setReportDesc] = useState('');
  const [reporting, setReporting] = useState(false);

  const fetchListing = async () => {
    try {
      const { data } = await listingsAPI.getListing(id);
      setListing(data.data);
      if (profile && profile.savedListings) {
        setIsSaved(profile.savedListings.includes(id));
      }
    } catch (err) {
      toast.error('Failed to load listing details');
      navigate('/listings');
    } finally {
      setLoading(false);
    }
  };

  const handleStartOwnerChat = async () => {
    if (!user) {
      return toast.error('Please login to chat with the owner');
    }
    if (!listing?.ownerId) {
      return toast.error('Owner information not available');
    }
    if (profile && listing.ownerId === profile._id) {
      return toast.error("You cannot chat with yourself (you are the owner of this listing)");
    }
    try {
      const { data } = await messagesAPI.startConversation(listing.ownerId);
      navigate(`/chat/${data.data._id}`);
    } catch (err) {
      toast.error('Failed to start chat with property owner');
    }
  };

  useEffect(() => {
    fetchListing();
  }, [id, profile]);

  const handleToggleSave = async () => {
    if (!user) {
      return toast.error('Please login to save properties');
    }
    try {
      const { data } = await usersAPI.toggleSavedListing(id);
      setIsSaved(data.savedListings.includes(id));
      await refreshProfile();
      toast.success(isSaved ? 'Removed from saved properties' : 'Saved property to your profile!');
    } catch (e) {
      toast.error('Failed to update saved list');
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    setReporting(true);
    try {
      await reportsAPI.createReport({
        targetType: 'listing',
        targetId: id,
        reason: reportReason,
        description: reportDesc
      });
      toast.success('Property report submitted.');
      setShowReportModal(false);
      setReportDesc('');
    } catch (err) {
      toast.error('Failed to report listing');
    } finally {
      setReporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex-center flex-col gap-3">
        <div className="spinner" />
        <p className="text-sm text-text-muted">Loading property details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-4 pt-24 pb-12">
      <div className="container max-w-5xl flex flex-col gap-6">
        
        {/* Navigation Actions */}
        <div className="flex-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-text-muted hover:text-text font-bold text-sm">
            <ArrowLeft size={16} /> Back
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={handleToggleSave}
              className={`btn btn-secondary btn-sm flex items-center gap-1.5 font-bold ${isSaved ? 'text-red-500 border-red-500/20' : ''}`}
            >
              <Heart size={14} fill={isSaved ? 'currentColor' : 'none'} />
              {isSaved ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied to clipboard!');
              }}
              className="btn btn-secondary btn-sm flex items-center gap-1.5 font-bold"
            >
              <Share2 size={14} /> Share
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Main Details */}
          <div className="md:col-span-2 flex flex-col gap-6">
            
            {/* Gallery area */}
            <div className="h-64 md:h-96 bg-slate-200 dark:bg-slate-700 rounded-2xl overflow-hidden relative shadow-md">
              {listing?.images?.[0]?.url ? (
                <img src={listing.images[0].url} alt={listing.title} className="w-full h-full object-cover" />
              ) : (
                <div className="gradient-primary w-full h-full flex-center text-white font-extrabold text-2xl uppercase">
                  {listing?.type} Accommodation
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-slate-900/80 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 font-semibold">
                <Eye size={13} /> {listing?.views} Views
              </div>
            </div>

            {/* Title Block */}
            <div className="glass-card p-6 flex flex-col gap-4 border border-border">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                      {listing?.type}
                    </span>
                    {listing?.verificationStatus === 'verified' && (
                      <span className="badge badge-verified flex items-center gap-0.5 text-xs px-2.5">
                        <ShieldCheck size={12} /> Verified Property
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-black text-emerald-600">₹{listing?.rent} <span className="text-xs font-semibold text-text-muted">/month</span></h3>
                </div>
                
                <h1 className="text-2xl font-black text-text mt-2 leading-tight">{listing?.title}</h1>
                
                <p className="text-sm text-text-muted flex items-center gap-1.5 mt-2 font-semibold">
                  <MapPin size={16} className="text-emerald-500" /> {listing?.area}, {listing?.city}
                </p>
                <p className="text-xs text-text-muted flex items-center gap-1 mt-1 font-medium">
                  <Navigation size={13} /> {listing?.distanceFromCollege || 'Close to colleges'}
                </p>
              </div>

              {/* Attributes grid */}
              <div className="grid grid-cols-3 gap-4 border-y border-border/60 py-4 my-2 text-center">
                <div>
                  <span className="text-[10px] font-bold text-text-muted uppercase">Allowed Gender</span>
                  <span className="font-extrabold text-text mt-1 block capitalize">{listing?.genderAllowed}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-text-muted uppercase">Occupancy</span>
                  <span className="font-extrabold text-text mt-1 block capitalize">{listing?.occupancy}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-text-muted uppercase">Verification</span>
                  <span className="font-extrabold text-text mt-1 block capitalize">{listing?.verificationStatus}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-extrabold text-sm text-text mb-2">Description</h4>
                <p className="text-sm text-text-muted leading-relaxed whitespace-pre-line">{listing?.description || 'No description provided by the owner.'}</p>
              </div>
            </div>

            {/* Facilities details */}
            <div className="glass-card p-6 flex flex-col gap-4 border border-border">
              <h4 className="font-extrabold text-base text-text flex items-center gap-2">
                <Compass className="text-emerald-500" size={18} /> Provided Amenities
              </h4>
              <div className="flex flex-wrap gap-2.5">
                {listing?.facilities?.map((f, i) => (
                  <FacilityChip key={i} facility={f} />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Area: Contact + Maps */}
          <div className="flex flex-col gap-6">
            
            {/* Contact Panel */}
            <div className="glass-card p-6 border border-border text-center flex flex-col gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex-center mx-auto shadow-sm">
                <Phone size={22} />
              </div>
              <div>
                <h3 className="font-extrabold text-text">Owner Contact Information</h3>
                <p className="text-xs text-text-muted mt-1">Get in touch with the landlord/owner directly.</p>
              </div>

              {user ? (
                <div className="flex flex-col gap-3 mt-1">
                  <div className="bg-surface-2 p-4 rounded-xl border border-border">
                    <span className="text-[10px] font-bold text-text-muted uppercase block">Mobile Number</span>
                    <a href={`tel:${listing?.contactNumber || '7387919142'}`} className="font-extrabold text-base text-emerald-600 tracking-wider mt-1 block">
                      {listing?.contactNumber || '+91 73879 19142'}
                    </a>
                    <p className="text-[10px] text-text-muted mt-1.5 flex-center gap-1.5">
                      <User size={12} /> Contact person: Property Owner
                    </p>
                  </div>
                  {/* Call + Message buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${listing?.contactNumber || '7387919142'}`}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '10px 0', borderRadius: 12, fontWeight: 700, fontSize: '0.82rem',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white', textDecoration: 'none',
                        boxShadow: '0 4px 14px rgba(16,185,129,0.3)', transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(16,185,129,0.4)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(16,185,129,0.3)'; }}
                    >
                      <Phone size={15} /> Call
                    </a>
                    <button
                      onClick={handleStartOwnerChat}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '10px 0', borderRadius: 12, fontWeight: 700, fontSize: '0.82rem',
                        background: 'var(--color-surface-2)', color: 'var(--color-text)',
                        border: '1.5px solid var(--color-border)', cursor: 'pointer',
                        transition: 'all 0.2s', width: '100%'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.color = '#059669'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text)'; }}
                    >
                      <MessageCircle size={15} /> Message
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 mt-2">
                  <p className="text-xs font-semibold text-amber-600 bg-amber-500/10 p-3 rounded-lg">
                    🔒 You must be logged in to view owner contact details.
                  </p>
                  <Link to="/login" className="btn btn-primary text-xs py-2 font-bold shadow-md">
                    Login to Contact
                  </Link>
                </div>
              )}
            </div>

            {/* OpenStreetMap Location */}
            <div className="glass-card p-4 border border-border flex flex-col gap-3">
              <h4 className="font-extrabold text-xs text-text uppercase tracking-wider flex items-center gap-2">
                <MapPin size={14} className="text-emerald-500" /> Property Location
              </h4>
              <div style={{ height: 320, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--color-border)' }} className="relative">
                {(() => {
                  const getCoords = () => {
                    const normalizedArea = listing?.area?.toLowerCase();
                    if (normalizedArea && AREA_COORDINATES[normalizedArea]) {
                      return AREA_COORDINATES[normalizedArea];
                    }
                    const normalizedCity = listing?.city?.toLowerCase();
                    if (normalizedCity && AREA_COORDINATES[`${normalizedCity} center`]) {
                      return AREA_COORDINATES[`${normalizedCity} center`];
                    }
                    return AREA_COORDINATES['nanded center'];
                  };
                  const coords = getCoords();
                  return (
                    <LeafletMap lat={coords.lat} lon={coords.lon} />
                  );
                })()}
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <MapPin size={11} /> {listing?.area || 'Nanded'}, {listing?.city || 'Nanded'}
              </p>
              {(() => {
                const getCoords = () => {
                  const normalizedArea = listing?.area?.toLowerCase();
                  if (normalizedArea && AREA_COORDINATES[normalizedArea]) {
                    return AREA_COORDINATES[normalizedArea];
                  }
                  const normalizedCity = listing?.city?.toLowerCase();
                  if (normalizedCity && AREA_COORDINATES[`${normalizedCity} center`]) {
                    return AREA_COORDINATES[`${normalizedCity} center`];
                  }
                  return AREA_COORDINATES['nanded center'];
                };
                const coords = getCoords();
                return (
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lon}#map=14/${coords.lat}/${coords.lon}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'block', textAlign: 'center', fontSize: '0.72rem', fontWeight: 700,
                      color: '#10b981', textDecoration: 'none', padding: '6px', borderRadius: 8,
                      background: 'rgba(16,185,129,0.08)', transition: 'all 0.2s',
                    }}
                  >
                    🗺️ Open in OpenStreetMap →
                  </a>
                );
              })()}
            </div>

            <button
              onClick={() => setShowReportModal(true)}
              className="btn btn-ghost text-red-500 hover:bg-red-500/10 w-full flex items-center justify-center gap-2 border border-dashed border-red-500/20 font-bold"
            >
              <AlertTriangle size={16} /> Report Incorrect Listing
            </button>
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
              <h3 className="font-extrabold text-lg text-text mb-4">Report Listing</h3>
              <form onSubmit={handleReport} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-text-muted uppercase">Reason for Report</label>
                  <select
                    className="select mt-1"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                  >
                    <option value="inappropriate_listing">Incorrect rent details or amenities</option>
                    <option value="fake_property">Fake property / scams / non-existent</option>
                    <option value="owner_harassment">Landlord harassment or fraud</option>
                    <option value="sold_out">Property no longer available</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-text-muted uppercase">Detailed Description</label>
                  <textarea
                    rows={3}
                    placeholder="Provide details about why this listing should be flagged..."
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
