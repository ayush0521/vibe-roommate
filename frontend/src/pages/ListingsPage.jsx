import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listingsAPI } from '../services/api';
import { FacilityChip, SkeletonListingCard } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, MapPin, Building2, ShieldCheck, Plus,
  ChevronRight, Sparkles, Navigation, Info, Loader2
} from 'lucide-react';

const FALLBACK_LISTINGS = [
  {
    _id: 'l1',
    title: 'Shree Ganesh Boys PG',
    type: 'pg',
    rent: 4200,
    area: 'Cidco Colony',
    city: 'Nanded',
    distanceFromCollege: '500m from MGM Engineering',
    occupancy: 'double',
    genderAllowed: 'male',
    verificationStatus: 'verified',
    facilities: ['wifi', 'mess', 'water', 'security'],
    images: [{ url: '' }]
  },
  {
    _id: 'l2',
    title: 'Vasantrao Nagar Shared Flat',
    type: 'flat',
    rent: 5500,
    area: 'Vazirabad',
    city: 'Nanded',
    distanceFromCollege: '1km from SGGS Engineering',
    occupancy: 'single',
    genderAllowed: 'male',
    verificationStatus: 'verified',
    facilities: ['wifi', 'ac', 'laundry', 'parking'],
    images: [{ url: '' }]
  },
  {
    _id: 'l3',
    title: 'Shivaji Nagar Boys Hostel',
    type: 'hostel',
    rent: 3500,
    area: 'Shivaji Nagar',
    city: 'Nanded',
    distanceFromCollege: '800m from Govt Medical College',
    occupancy: 'triple',
    genderAllowed: 'male',
    verificationStatus: 'unverified',
    facilities: ['mess', 'water', 'power-backup', 'security'],
    images: [{ url: '' }]
  },
  {
    _id: 'l4',
    title: 'New Nanded Girls PG',
    type: 'pg',
    rent: 4800,
    area: 'New Nanded',
    city: 'Nanded',
    distanceFromCollege: '600m from SRTR Medical',
    occupancy: 'double',
    genderAllowed: 'female',
    verificationStatus: 'verified',
    facilities: ['wifi', 'mess', 'security', 'cctv'],
    images: [{ url: '' }]
  },
  {
    _id: 'l5',
    title: 'Station Road Co-ed Flat',
    type: 'flat',
    rent: 7500,
    area: 'Station Road',
    city: 'Nanded',
    distanceFromCollege: '1.5km from Vasantrao College',
    occupancy: 'single',
    genderAllowed: 'any',
    verificationStatus: 'verified',
    facilities: ['wifi', 'ac', 'parking', 'power-backup'],
    images: [{ url: '' }]
  },
  {
    _id: 'l6',
    title: 'Gurudwara Road Affordable Hostel',
    type: 'hostel',
    rent: 3000,
    area: 'Gurudwara Road',
    city: 'Nanded',
    distanceFromCollege: '400m from Shyam Institute',
    occupancy: 'triple',
    genderAllowed: 'male',
    verificationStatus: 'unverified',
    facilities: ['mess', 'water', 'security'],
    images: [{ url: '' }]
  }
];

export default function ListingsPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalListings, setTotalListings] = useState(0);

  // Filters
  const [cityFilter, setCityFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [maxRent, setMaxRent] = useState('');

  // Set default city from profile once loaded
  useEffect(() => {
    if (profile?.city && !cityFilter) {
      setCityFilter(profile.city);
    }
  }, [profile]);

  const fetchListings = async (pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true);
    try {
      const params = { page: pageNum, limit: 6 };
      if (cityFilter) params.city = cityFilter;
      if (areaFilter) params.area = areaFilter;
      if (typeFilter) params.type = typeFilter;
      if (genderFilter) params.genderAllowed = genderFilter;
      if (maxRent) params.maxRent = maxRent;

      const { data } = await listingsAPI.getListings(params);
      if (data.data && data.data.length > 0) {
        if (append) {
          setListings((prev) => [...prev, ...data.data]);
        } else {
          setListings(data.data);
        }
        setHasMore(data.hasMore || false);
        setTotalListings(data.total || data.data.length);
      } else {
        if (!append) {
          setListings([]);
          setHasMore(false);
          setTotalListings(0);
        }
      }
    } catch (err) {
      console.warn('API listings fetch issues. Using mocks.', err);
      if (!append) {
        setListings(FALLBACK_LISTINGS);
        setHasMore(false);
        setTotalListings(FALLBACK_LISTINGS.length);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchListings(1, false);
  }, [cityFilter, areaFilter, typeFilter, genderFilter, maxRent]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchListings(nextPage, true);
  };

  const sortedListings = [...listings].sort((a, b) => {
    if (!profile) return 0;
    
    // 1. College Match
    const collName = (profile.college || '').toLowerCase();
    let targetKeyword = '';
    if (collName.includes('mgm')) {
      targetKeyword = 'mgm';
    } else if (collName.includes('sggs')) {
      targetKeyword = 'sggs';
    } else if (collName.includes('srtmu')) {
      targetKeyword = 'srtmu';
    } else if (collName.includes('coep')) {
      targetKeyword = 'coep';
    } else if (collName.includes('pict')) {
      targetKeyword = 'pict';
    } else if (collName.includes('vjti')) {
      targetKeyword = 'vjti';
    } else if (collName.includes('iit')) {
      targetKeyword = 'iit';
    }
    
    if (targetKeyword) {
      const aText = `${a.distanceFromCollege || ''} ${a.title || ''} ${a.approximateLocation || ''}`.toLowerCase();
      const bText = `${b.distanceFromCollege || ''} ${b.title || ''} ${b.approximateLocation || ''}`.toLowerCase();
      const aMatches = aText.includes(targetKeyword);
      const bMatches = bText.includes(targetKeyword);
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
    }
    
    // 2. Preferred Area Match
    const userArea = (profile.area || '').toLowerCase();
    if (userArea) {
      const aAreaMatches = (a.area || '').toLowerCase() === userArea;
      const bAreaMatches = (b.area || '').toLowerCase() === userArea;
      if (aAreaMatches && !bAreaMatches) return -1;
      if (!aAreaMatches && bAreaMatches) return 1;
    }
    
    // 3. Distance Sort
    const getDistanceMeters = (desc) => {
      if (!desc) return 999999;
      const clean = desc.toLowerCase();
      const match = clean.match(/([\d.]+)\s*(m|km)/);
      if (!match) return 999999;
      const num = parseFloat(match[1]);
      const unit = match[2];
      return unit === 'km' ? num * 1000 : num;
    };
    
    return getDistanceMeters(a.distanceFromCollege) - getDistanceMeters(b.distanceFromCollege);
  });

  return (
    <div className="min-h-screen bg-bg p-4 pt-24 pb-12">
      <div className="container max-w-6xl flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-text tracking-tight flex items-center gap-2">
              <Building2 className="text-emerald-500" size={26} /> Housing Discovery
            </h1>
            <p className="text-sm text-text-muted mt-1">Discover PGs, hostels, flats, and rooms near campus.</p>
          </div>
          {user?.role === 'owner' && (
            <Link to="/listings/create" className="btn btn-primary flex items-center gap-1.5 shadow-lg font-bold">
              <Plus size={16} /> Add Listing
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="glass-card p-5 flex flex-wrap gap-3 items-center" style={{ borderRadius: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center gap-2 text-text-muted text-xs font-bold uppercase tracking-wider">
            <Filter size={16} /> Filters
          </div>

          {/* City Filter */}
          <div style={{ position: 'relative' }}>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              style={{
                padding: '9px 32px 9px 14px', borderRadius: 12, appearance: 'none',
                background: 'var(--color-surface)', border: `1.5px solid ${cityFilter ? '#10b981' : 'var(--color-border)'}`,
                fontSize: '0.78rem', fontWeight: 600, color: cityFilter ? '#059669' : 'var(--color-text)',
                cursor: 'pointer', outline: 'none', minWidth: 130, transition: 'all 0.2s'
              }}
            >
              <option value="">All Cities</option>
              <option value="Nanded">📍 Nanded</option>
              <option value="Pune">📍 Pune</option>
              <option value="Mumbai">📍 Mumbai</option>
            </select>
            <ChevronRight size={12} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%) rotate(90deg)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
          </div>

          {/* Area search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
            <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search area (e.g. Cidco, Vazirabad)"
              style={{
                width: '100%', padding: '9px 12px 9px 32px', borderRadius: 12,
                background: 'var(--color-surface)', border: '1.5px solid var(--color-border)',
                fontSize: '0.78rem', fontWeight: 500, color: 'var(--color-text)', outline: 'none',
                transition: 'all 0.2s'
              }}
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              onFocus={e => e.target.style.borderColor = '#10b981'}
              onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
            />
          </div>

          {/* Type styled select */}
          {[{
            value: typeFilter, onChange: e => setTypeFilter(e.target.value),
            options: [{ v: '', l: 'All Types' }, { v: 'pg', l: '🏠 PG' }, { v: 'hostel', l: '🏢 Hostel' }, { v: 'shared-room', l: '🛏 Shared Room' }, { v: 'flat', l: '🏡 Flat' }]
          }, {
            value: genderFilter, onChange: e => setGenderFilter(e.target.value),
            options: [{ v: '', l: 'All Genders' }, { v: 'male', l: '👦 Boys Only' }, { v: 'female', l: '👧 Girls Only' }, { v: 'any', l: '🤝 Co-Ed / Any' }]
          }].map((sel, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <select
                value={sel.value}
                onChange={sel.onChange}
                style={{
                  padding: '9px 32px 9px 14px', borderRadius: 12, appearance: 'none',
                  background: 'var(--color-surface)', border: `1.5px solid ${sel.value ? '#10b981' : 'var(--color-border)'}`,
                  fontSize: '0.78rem', fontWeight: 600, color: sel.value ? '#059669' : 'var(--color-text)',
                  cursor: 'pointer', outline: 'none', minWidth: 140, transition: 'all 0.2s'
                }}
              >
                {sel.options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
              <ChevronRight size={12} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%) rotate(90deg)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
            </div>
          ))}

          {/* Max rent */}
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', fontWeight: 700, color: '#10b981' }}>₹</span>
            <input
              type="number"
              placeholder="Max Rent"
              style={{
                padding: '9px 12px 9px 26px', borderRadius: 12, width: 120,
                background: 'var(--color-surface)', border: '1.5px solid var(--color-border)',
                fontSize: '0.78rem', fontWeight: 500, color: 'var(--color-text)', outline: 'none', transition: 'all 0.2s'
              }}
              value={maxRent}
              onChange={(e) => setMaxRent(e.target.value)}
              onFocus={e => e.target.style.borderColor = '#10b981'}
              onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
            />
          </div>

          {(cityFilter || areaFilter || typeFilter || genderFilter || maxRent) && (
            <button
              onClick={() => { setCityFilter(''); setAreaFilter(''); setTypeFilter(''); setGenderFilter(''); setMaxRent(''); }}
              style={{ padding: '7px 14px', borderRadius: 10, fontSize: '0.75rem', fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: 'none', cursor: 'pointer' }}
            >
              Clear All
            </button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonListingCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <AnimatePresence>
              {sortedListings.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => navigate(`/listings/${item._id}`)}
                  className="glass-card hover:shadow-lg transition-all duration-300 border border-border cursor-pointer flex flex-col justify-between overflow-hidden group"
                >
                  {/* Photo area */}
                  <div className="h-44 bg-slate-200 dark:bg-slate-700 relative flex-center overflow-hidden">
                    {item.images?.[0]?.url ? (
                      <img
                        src={item.images[0].url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="gradient-primary opacity-60 w-full h-full flex-center text-white font-extrabold text-lg">
                        {item.type?.toUpperCase()}
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-white/95 dark:bg-slate-900/95 py-1 px-3 rounded-full text-xs font-extrabold text-emerald-600 shadow-md">
                      ₹{item.rent}/mo
                    </div>
                  </div>

                  {/* Info area */}
                  <div className="p-5 flex flex-col gap-4 flex-1 justify-between">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex-between">
                        <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                          {item.type}
                        </span>
                        {item.verificationStatus === 'verified' && (
                          <span className="badge badge-verified flex items-center gap-0.5 text-[9px] px-2">
                            <ShieldCheck size={10} /> Verified
                          </span>
                        )}
                      </div>

                      <h3 className="font-extrabold text-base text-text group-hover:text-emerald-500 transition-colors leading-tight">
                        {item.title}
                      </h3>
                      
                      <p className="text-xs text-text-muted flex items-center gap-1 font-semibold">
                        <MapPin size={13} className="text-emerald-500" /> {item.area}, {item.city}
                      </p>
                      
                      <p className="text-[10px] text-text-muted flex items-center gap-1 font-medium">
                        <Navigation size={11} /> {item.distanceFromCollege || 'Near Campus'}
                      </p>
                    </div>

                    {/* Facilities summary */}
                    <div className="flex flex-wrap gap-1 mt-1 border-t border-border/60 pt-3">
                      {item.facilities?.slice(0, 3).map((f, i) => (
                        <FacilityChip key={i} facility={f} />
                      ))}
                      {item.facilities?.length > 3 && (
                        <span className="text-[10px] font-bold text-text-muted bg-surface-2 px-2 py-1 rounded-full border border-border">
                          +{item.facilities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {listings.length > 0 && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 24 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Showing {listings.length} of {totalListings} listings
            </span>
            {hasMore && (
              <button
                onClick={loadMore}
                className="btn btn-secondary font-bold"
                style={{ padding: '10px 24px', borderRadius: 12 }}
              >
                Load More Listings
              </button>
            )}
          </div>
        )}

        {listings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-muted font-bold text-sm">No properties matches your search filters.</p>
          </div>
        )}

      </div>
    </div>
  );
}
