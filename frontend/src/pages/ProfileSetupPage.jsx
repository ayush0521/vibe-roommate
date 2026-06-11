import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Building2, MapPin, HelpCircle,
  Camera, Check, ChevronRight, ChevronLeft, Save, Menu, IndianRupee,
  Sparkles, Loader2
} from 'lucide-react';
import LeafletMap from '../components/ui/LeafletMap';
import ReactDOM from 'react-dom';

const COLLEGES = [
  // Nanded
  "SGGSIET (Shri Guru Gobind Singhji Institute of Engineering and Technology), Nanded",
  "MGM's College of Engineering, Nanded",
  "SRTMUN (Swami Ramanand Teerth Marathwada University), Nanded",
  "Government Medical College (GMC), Nanded",
  "Government Ayurvedic College, Nanded",
  "Nanded Pharmacy College, Nanded",
  "Yeshwant Mahavidyalaya, Nanded",
  "Science College, Nanded",
  "Law College, Nanded",
  "People's College, Nanded",
  // Pune
  "COEP Technological University, Pune",
  "Pune Institute of Computer Technology (PICT), Pune",
  "Symbiosis International University, Pune",
  "MIT World Peace University (MIT-WPU), Pune",
  "Vishwakarma Institute of Technology (VIT), Pune",
  "Fergusson College, Pune",
  // Mumbai
  "IIT Bombay (Indian Institute of Technology), Mumbai",
  "VJTI (Veermata Jijabai Technological Institute), Mumbai",
  "K. J. Somaiya College of Engineering, Mumbai",
  "H.R. College of Commerce and Economics, Mumbai",
  "St. Xavier's College, Mumbai"
];

const COURSES = [
  { value: "B.Tech", label: "B.Tech (Engineering)" },
  { value: "MBBS", label: "MBBS (Medical)" },
  { value: "B.Pharm", label: "B.Pharm (Pharmacy)" },
  { value: "BCA", label: "BCA (Computer Application)" },
  { value: "BSc", label: "BSc (Science)" },
  { value: "BA", label: "BA (Arts)" },
  { value: "B.Com", label: "B.Com (Commerce)" },
  { value: "LLB", label: "LLB (Law)" },
  { value: "MBA", label: "MBA (Management)" },
  { value: "MCA", label: "MCA (Computer Application)" },
  { value: "M.Tech", label: "M.Tech (Engineering)" },
  { value: "MD / MS", label: "MD / MS (Medical)" }
];

const YEARS = [
  { value: 1, label: "1st Year" },
  { value: 2, label: "2nd Year" },
  { value: 3, label: "3rd Year" },
  { value: 4, label: "4th Year" },
  { value: 5, label: "5th Year" },
  { value: 6, label: "Post-Grad / Intern" }
];

const STATE_DISTRICT_CITY = {
  "Maharashtra": {
    "Nanded": ["Nanded", "Degloor", "Bhokar", "Loha", "Mudkhed", "Mukhed", "Hadgaon", "Kinwat", "Biloli"],
    "Pune": ["Pune", "Pimpri-Chinchwad", "Baramati", "Lonavala", "Chakan"],
    "Mumbai": ["Mumbai City", "Mumbai Suburban", "Thane", "Navi Mumbai"],
    "Aurangabad": ["Aurangabad", "Kannad", "Paithan", "Gangapur"],
    "Nagpur": ["Nagpur", "Kamptee", "Umred"],
    "Nashik": ["Nashik", "Malegaon", "Manmad"]
  },
  "Karnataka": {
    "Bangalore": ["Bangalore", "Kengeri", "Yelahanka"],
    "Bidar": ["Bidar", "Basavakalyan", "Bhalki", "Humnabad"],
    "Gulbarga": ["Gulbarga", "Sedam", "Shahabad"],
    "Mysore": ["Mysore", "Hunsur", "Nanjangud"]
  },
  "Telangana": {
    "Hyderabad": ["Hyderabad", "Secunderabad", "Gachibowli"],
    "Nizamabad": ["Nizamabad", "Bodhan", "Armoor"],
    "Adilabad": ["Adilabad", "Mancherial", "Nirmal"]
  },
  "Goa": {
    "North Goa": ["Panaji", "Mapusa", "Bicholim"],
    "South Goa": ["Margao", "Vasco da Gama", "Ponda"]
  }
};

const CITY_PREFERRED_AREAS = {
  "Nanded": [
    "Cidco Colony", "Vazirabad", "Shivaji Nagar", "Taroda Naka", "Khadkut Road", 
    "Anand Nagar", "Srinagar", "Yeshwant College Road", "Namaskar Chowk", "Vishnupuri", 
    "Degloor Naka", "VIP Road", "Kala Mandir Area"
  ],
  "Pune": [
    "Kothrud", "Shivajinagar", "Viman Nagar", "Kalyani Nagar", "Hinjawadi", 
    "Aundh", "Katraj", "Baner", "Hadapsar", "Karve Nagar"
  ],
  "Mumbai": [
    "Dadar", "Bandra", "Andheri", "Wadala", "Powai", "Chembur", 
    "Vile Parle", "Mulund", "Thane Center", "Ghatkopar"
  ],
  "default": [
    "Cidco Colony", "Vazirabad", "Shivaji Nagar", "Taroda Naka", "Khadkut Road", 
    "Anand Nagar", "Srinagar", "Yeshwant College Road", "Namaskar Chowk", "Vishnupuri", 
    "Degloor Naka", "VIP Road", "Kala Mandir Area"
  ]
};

const PREFERRED_AREAS = CITY_PREFERRED_AREAS["default"];

const AREA_COORDINATES = {
  // Nanded
  'cidco colony': { lat: 19.1640, lon: 77.2980 },
  'vazirabad': { lat: 19.1500, lon: 77.3150 },
  'taroda naka': { lat: 19.1820, lon: 77.3100 },
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
  'pimpri-chinchwad center': { lat: 18.6298, lon: 73.7997 },

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
  'mumbai center': { lat: 19.0760, lon: 72.8777 },
  'mumbai city center': { lat: 19.0760, lon: 72.8777 },
  'mumbai suburban center': { lat: 19.1136, lon: 72.8697 },
  'navi mumbai center': { lat: 19.0330, lon: 73.0297 }
};

// Portal-based dropdown to escape overflow containers
function DropdownPortal({ children, triggerRef, isOpen }) {
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = 240;
      let top = rect.bottom + window.scrollY + 4;
      if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
        top = rect.top + window.scrollY - dropdownHeight - 4;
      }
      setPos({ top, left: rect.left + window.scrollX, width: rect.width });
    }
  }, [isOpen, triggerRef]);

  if (!isOpen) return null;
  return ReactDOM.createPortal(
    <div style={{ position: 'absolute', top: pos.top, left: pos.left, width: pos.width, zIndex: 9999 }}>
      {children}
    </div>,
    document.body
  );
}

// Premium custom select dropdown
function CustomSelect({ label, value, onChange, options, placeholder = "Select option", icon: Icon }) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);
  
  // Find current option label
  const selectedOption = options.find(opt => opt.value === value || opt === value);
  const displayLabel = selectedOption 
    ? (selectedOption.label || selectedOption.value || selectedOption) 
    : placeholder;

  return (
    <div className="flex flex-col gap-1 relative w-full">
      {label && <label className="text-xs font-bold text-text-muted tracking-wider uppercase">{label}</label>}
      
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="input flex items-center justify-between gap-2 text-left cursor-pointer hover:border-emerald-500/50 transition-all duration-200"
      >
        <div className="flex items-center gap-2 truncate">
          {Icon && <Icon size={16} className="text-emerald-500 flex-shrink-0" />}
          <span className={value ? "text-text font-medium" : "text-text-muted"}>
            {displayLabel}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Overlay to close */}
      {isOpen && (
        <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setIsOpen(false)} />
      )}

      {/* Dropdown via Portal */}
      <DropdownPortal triggerRef={triggerRef} isOpen={isOpen}>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.13 }}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 12,
                boxShadow: '0 10px 40px rgba(0,0,0,0.18)',
                maxHeight: 240,
                overflowY: 'auto',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {options.length > 0 ? (
                options.map((opt, idx) => {
                  const optVal = opt.value !== undefined ? opt.value : opt;
                  const optLabel = opt.label !== undefined ? opt.label : opt;
                  const isSelected = optVal === value;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        onChange(optVal);
                        setIsOpen(false);
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        width: '100%', padding: '10px 12px', borderRadius: 8,
                        textAlign: 'left', fontSize: '0.875rem', fontWeight: 600,
                        cursor: 'pointer', border: 'none',
                        background: isSelected ? '#10b981' : 'transparent',
                        color: isSelected ? 'white' : 'var(--color-text)',
                        transition: 'all 0.12s',
                      }}
                      onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.background = 'var(--color-surface-2)'; e.currentTarget.style.color = '#10b981'; } }}
                      onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text)'; } }}
                    >
                      <span>{optLabel}</span>
                      {isSelected && <Check size={14} style={{ color: 'white' }} />}
                    </button>
                  );
                })
              ) : (
                <div style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  No options available
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DropdownPortal>
    </div>
  );
}

// Searchable college dropdown select
function SearchableSelect({ label, value, onChange, options, placeholder = "Search college...", icon: Icon }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setSearchQuery(value || '');
  }, [value]);

  const filteredOptions = options.filter(opt =>
    (opt.label || opt.value || opt).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-1 relative w-full">
      {label && <label className="text-xs font-bold text-text-muted tracking-wider uppercase">{label}</label>}
      
      <div className="relative">
        <input
          type="text"
          className="input pr-10"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        <div className="absolute right-3.5 top-3.5 flex items-center gap-1.5 text-text-muted">
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                onChange('');
              }}
              className="hover:text-text cursor-pointer"
            >
              ×
            </button>
          )}
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            onClick={() => setIsOpen(!isOpen)}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
            
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 mt-2 bg-surface/95 border border-border rounded-xl shadow-xl glass z-40 max-h-60 overflow-y-auto p-1.5 flex flex-col gap-0.5"
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt, idx) => {
                  const optVal = opt.value !== undefined ? opt.value : opt;
                  const optLabel = opt.label !== undefined ? opt.label : opt;
                  const isSelected = optVal === value;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        onChange(optVal);
                        setSearchQuery(optLabel);
                        setIsOpen(false);
                      }}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-left text-sm font-semibold transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'text-text hover:bg-surface-2 hover:text-emerald-500'
                      }`}
                    >
                      <span>{optLabel}</span>
                      {isSelected && <Check size={14} className="text-white" />}
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-4 text-center">
                  <p className="text-xs text-text-muted font-semibold">No colleges match your search</p>
                  {searchQuery.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        onChange(searchQuery);
                        setIsOpen(false);
                      }}
                      className="mt-2 text-xs font-bold text-emerald-500 hover:underline cursor-pointer"
                    >
                      Use custom: "{searchQuery}"
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProfileSetupPage() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [enhancingBio, setEnhancingBio] = useState(false);

  const handleEnhanceBio = async () => {
    if (!bio.trim()) return;
    setEnhancingBio(true);
    try {
      const { data } = await usersAPI.enhanceBio({ bio });
      setBio(data.data);
      if (data.message) {
        toast.success(data.message, { duration: 5000 });
      } else {
        toast.success('Bio polished by Gemini! ✨');
      }
    } catch (err) {
      toast.error('Failed to enhance bio. Please try again.');
      console.error(err);
    } finally {
      setEnhancingBio(false);
    }
  };

  // Form State
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('male');
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState(1);
  const [bio, setBio] = useState('');

  // Location Cascading
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [minBudget, setMinBudget] = useState(2000);
  const [maxBudget, setMaxBudget] = useState(8000);

  const [foodPreference, setFoodPreference] = useState('veg');
  const [foodArrangement, setFoodArrangement] = useState('mess');
  const [smokingHabit, setSmokingHabit] = useState('no');
  const [drinkingHabit, setDrinkingHabit] = useState('no');
  const [sleepSchedule, setSleepSchedule] = useState('flexible');
  const [guestPreference, setGuestPreference] = useState('flexible');
  const [noisePreference, setNoisePreference] = useState('flexible');

  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setGender(profile.gender || 'male');
      setCollege(profile.college || '');
      setCourse(profile.course || '');
      setYear(profile.year || 1);
      setBio(profile.bio || '');
      
      const fetchedState = profile.state || '';
      const fetchedDistrict = profile.district || '';
      setState(fetchedState);
      setDistrict(fetchedDistrict);
      setCity(profile.city || '');
      
      // Auto mapping for fallback if city is Nanded but state/district empty
      if (!fetchedState && !fetchedDistrict && profile.city) {
        let found = false;
        for (const st of Object.keys(STATE_DISTRICT_CITY)) {
          for (const dst of Object.keys(STATE_DISTRICT_CITY[st])) {
            if (STATE_DISTRICT_CITY[st][dst].includes(profile.city)) {
              setState(st);
              setDistrict(dst);
              found = true;
              break;
            }
          }
          if (found) break;
        }
      }

      setArea(profile.area || '');
      setMinBudget(profile.budgetRange?.min || 2000);
      setMaxBudget(profile.budgetRange?.max || 8000);
      setFoodPreference(profile.foodPreference || 'veg');
      setFoodArrangement(profile.foodArrangement || 'mess');
      setSmokingHabit(profile.smokingHabit || 'no');
      setDrinkingHabit(profile.drinkingHabit || 'no');
      setSleepSchedule(profile.sleepSchedule || 'flexible');
      setGuestPreference(profile.guestPreference || 'flexible');
      setNoisePreference(profile.noisePreference || 'flexible');
      setPhotoUrl(profile.profilePhoto?.url || '');
    }
  }, [profile]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return toast.error('Image too large! Max size is 5MB.');
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoUrl(ev.target.result);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('photo', file);

    setUploading(true);
    try {
      const { data } = await usersAPI.uploadPhoto(formData);
      setPhotoUrl(data.data.url);
      toast.success('Profile photo uploaded!');
      await refreshProfile();
    } catch (err) {
      // If Cloudinary not configured, keep the local preview
      const errMsg = err.response?.data?.message || '';
      if (errMsg.toLowerCase().includes('cloudinary') || err.response?.status === 500) {
        toast.success('Photo preview set! (Cloud upload pending configuration)');
      } else {
        toast.error('Failed to upload photo');
        console.error(err);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (isFinal = false) => {
    setLoading(true);
    try {
      const payload = {
        fullName,
        gender,
        college,
        course,
        year: parseInt(year, 10),
        bio,
        state,
        district,
        city,
        area,
        budgetRange: { min: parseInt(minBudget, 10), max: parseInt(maxBudget, 10) },
        foodPreference,
        foodArrangement,
        smokingHabit,
        drinkingHabit,
        sleepSchedule,
        guestPreference,
        noisePreference,
      };

      await usersAPI.updateProfile(payload);
      const updated = await refreshProfile();
      toast.success('Profile saved successfully!');

      if (isFinal) {
        if (!updated.hasCompletedQuiz) {
          navigate('/quiz');
        } else {
          navigate('/matches');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!fullName || !college)) {
      return toast.error('Full Name and College are required');
    }
    if (step === 2 && (!state || !district || !city || maxBudget <= 0)) {
      return toast.error('State, District, City and Budget are required');
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4 pt-24 pb-12">
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-5xl items-stretch justify-center">
        
        {/* Collapsible Progress Left Sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div
              initial={{ opacity: 0, x: -40, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 260 }}
              exit={{ opacity: 0, x: -40, width: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 120 }}
              className="w-full md:w-64 bg-surface border border-border rounded-2xl glass p-5 flex flex-col gap-4 shadow-xl overflow-hidden flex-shrink-0"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="font-extrabold text-sm uppercase tracking-wider text-emerald-500">Profile Progress</span>
                <span className="text-[10px] font-extrabold text-text-muted bg-surface-2 px-2 py-0.5 rounded-full">
                  {Math.round((step / 4) * 100)}%
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { num: 1, label: 'Personal Info', icon: User },
                  { num: 2, label: 'Location & Budget', icon: MapPin },
                  { num: 3, label: 'Preferences', icon: HelpCircle },
                  { num: 4, label: 'Profile Photo', icon: Camera }
                ].map((s) => {
                  const Icon = s.icon;
                  const isActive = step === s.num;
                  const isCompleted = step > s.num;
                  return (
                    <button
                      key={s.num}
                      type="button"
                      onClick={() => setStep(s.num)}
                      className={`flex items-center gap-3 p-3 rounded-xl text-left text-sm font-semibold transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                          : isCompleted
                          ? 'text-emerald-600 bg-emerald-500/5 hover:bg-emerald-500/10'
                          : 'text-text-muted hover:text-text hover:bg-surface-2'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full flex-center text-xs font-bold ${
                        isActive
                          ? 'bg-white text-emerald-600'
                          : isCompleted
                          ? 'bg-emerald-500 text-white'
                          : 'bg-border text-text-muted'
                      }`}>
                        {isCompleted ? <Check size={12} /> : s.num}
                      </span>
                      <span className="truncate">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-grow w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-xl glass overflow-hidden flex flex-col justify-between"
        >
          {/* Progress Bar Header */}
          <div className="bg-surface-2 p-4 border-b border-border flex-between">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-1.5 rounded-lg border border-border bg-surface hover:bg-surface-2 text-text-muted hover:text-text transition-colors flex-center cursor-pointer"
                title="Toggle sidebar progress panel"
              >
                <Menu size={16} />
              </button>
              <h3 className="font-extrabold text-text">Setup Your Profile</h3>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-md">
              Step {step} of 4
            </span>
          </div>
          <div className="w-full h-1 bg-border">
            <div
              className="h-full gradient-primary transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>

          <div className="p-8 flex-grow">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-4"
                >
                  <h4 className="font-extrabold text-lg text-text flex items-center gap-2 mb-2">
                    <User className="text-emerald-500" size={20} /> Personal Information
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-text-muted tracking-wider uppercase">Full Name *</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="e.g. Amit Sharma"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    <CustomSelect
                      label="Gender *"
                      value={gender}
                      onChange={(val) => setGender(val)}
                      options={[
                        { value: 'male', label: 'Male' },
                        { value: 'female', label: 'Female' },
                        { value: 'other', label: 'Other' }
                      ]}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <SearchableSelect
                      label="College *"
                      value={college}
                      onChange={(val) => setCollege(val)}
                      options={COLLEGES}
                      placeholder="Search college (e.g. SGGS Nanded)..."
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <CustomSelect
                        label="Course"
                        value={course}
                        onChange={(val) => setCourse(val)}
                        options={COURSES}
                        placeholder="Course"
                      />
                      <CustomSelect
                        label="Year"
                        value={year}
                        onChange={(val) => setYear(val)}
                        options={YEARS}
                        placeholder="Year"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-text-muted tracking-wider uppercase">Bio</label>
                      <button
                        type="button"
                        onClick={handleEnhanceBio}
                        disabled={enhancingBio || !bio.trim()}
                        className="text-xs font-bold text-emerald-500 hover:text-emerald-600 disabled:opacity-40 flex items-center gap-1.5 transition-colors cursor-pointer bg-emerald-500/5 hover:bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20"
                        title="Rewrite your bio to sound polite, engaging, and friendly using Gemini AI"
                      >
                        {enhancingBio ? (
                          <>
                            <Loader2 className="animate-spin" size={12} />
                            Polishing...
                          </>
                        ) : (
                          <>
                            <Sparkles size={12} />
                            Enhance with Gemini
                          </>
                        )}
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      className="input py-3 resize-none"
                      placeholder="Tell potential roommates about yourself, your hobbies, study routine..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-4"
                >
                  <h4 className="font-extrabold text-lg text-text flex items-center gap-2 mb-2">
                    <MapPin className="text-emerald-500" size={20} /> Location & Budget
                  </h4>
                  
                  <div className="grid md:grid-cols-5 gap-6">
                    {/* Location fields */}
                    <div className="md:col-span-3 flex flex-col gap-4">
                      {/* Cascading State -> District */}
                      <div className="grid grid-cols-2 gap-4">
                        <CustomSelect
                          label="State *"
                          value={state}
                          onChange={(val) => {
                            setState(val);
                            setDistrict('');
                            setCity('');
                          }}
                          options={Object.keys(STATE_DISTRICT_CITY)}
                          placeholder="Select State"
                        />
                        <CustomSelect
                          label="District *"
                          value={district}
                          onChange={(val) => {
                            setDistrict(val);
                            setCity('');
                          }}
                          options={state ? Object.keys(STATE_DISTRICT_CITY[state] || {}) : []}
                          placeholder={state ? "Select District" : "Choose state first"}
                        />
                      </div>

                      {/* Cascading City -> Preferred Area */}
                      <div className="grid grid-cols-2 gap-4">
                        <CustomSelect
                          label="City *"
                          value={city}
                          onChange={(val) => {
                            setCity(val);
                          }}
                          options={district ? (STATE_DISTRICT_CITY[state]?.[district] || []) : []}
                          placeholder={district ? "Select City" : "Choose district first"}
                        />
                        <CustomSelect
                          label="Preferred Area"
                          value={area}
                          onChange={(val) => {
                            setArea(val);
                          }}
                          options={CITY_PREFERRED_AREAS[city] || CITY_PREFERRED_AREAS["default"]}
                          placeholder="Select Preferred Area"
                        />
                      </div>

                      {/* Budget min / max */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-text-muted tracking-wider uppercase">Min Budget (₹)</label>
                          <div className="relative">
                            <IndianRupee className="absolute left-3.5 top-3.5 text-text-muted" size={16} />
                            <input
                              type="number"
                              className="input pl-9"
                              placeholder="2000"
                              value={minBudget}
                              onChange={(e) => setMinBudget(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-text-muted tracking-wider uppercase">Max Budget (₹) *</label>
                          <div className="relative">
                            <IndianRupee className="absolute left-3.5 top-3.5 text-text-muted" size={16} />
                            <input
                              type="number"
                              className="input pl-9"
                              placeholder="8000"
                              value={maxBudget}
                              onChange={(e) => setMaxBudget(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* OpenStreetMap Card */}
                    <div className="md:col-span-2 glass-card p-4 border border-border flex flex-col gap-3 justify-between">
                      <div>
                        <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider block mb-1">
                          📍 Area Locator
                        </span>
                        <p className="text-[11px] text-text-muted leading-tight mb-3">
                          Your preferred area pin is marked on OpenStreetMap.
                        </p>
                      </div>
                      
                      <div style={{ height: 320, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--color-border)' }} className="bg-slate-200 dark:bg-slate-700 relative">
                        {(() => {
                          const getCoords = () => {
                            const normalizedArea = area?.toLowerCase();
                            if (normalizedArea && AREA_COORDINATES[normalizedArea]) {
                              return AREA_COORDINATES[normalizedArea];
                            }
                            const normalizedCity = city?.toLowerCase();
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

                      <div className="text-[10px] text-text-muted mt-2 text-center flex items-center justify-center gap-1 font-semibold">
                        <MapPin size={12} className="text-emerald-500" />
                        <span>{area || `${city || 'Nanded'} Center`}, {city || 'Nanded'}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-4"
                  style={{ paddingBottom: 16 }}
                >
                  <h4 className="font-extrabold text-lg text-text flex items-center gap-2 mb-2">
                    <HelpCircle className="text-emerald-500" size={20} /> Preferences & Habits
                  </h4>

                  <div className="grid md:grid-cols-2 gap-4">
                    <CustomSelect
                      label="Food Preference"
                      value={foodPreference}
                      onChange={(val) => setFoodPreference(val)}
                      options={[
                        { value: "veg", label: "Vegetarian" },
                        { value: "non-veg", label: "Non-Vegetarian" },
                        { value: "eggetarian", label: "Eggetarian" },
                        { value: "jain", label: "Jain" }
                      ]}
                    />
                    <CustomSelect
                      label="Food Arrangement"
                      value={foodArrangement}
                      onChange={(val) => setFoodArrangement(val)}
                      options={[
                        { value: "mess", label: "Mess System" },
                        { value: "tiffin", label: "Tiffin Service" },
                        { value: "self-cooking", label: "Self Cooking" },
                        { value: "online-ordering", label: "Online Ordering" },
                        { value: "mixed", label: "Mixed" }
                      ]}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <CustomSelect
                      label="Smoking Habit"
                      value={smokingHabit}
                      onChange={(val) => setSmokingHabit(val)}
                      options={[
                        { value: "no", label: "Non-Smoker" },
                        { value: "yes", label: "Smoker" },
                        { value: "occasionally", label: "Occasionally" },
                        { value: "flexible", label: "Flexible" }
                      ]}
                    />
                    <CustomSelect
                      label="Drinking Habit"
                      value={drinkingHabit}
                      onChange={(val) => setDrinkingHabit(val)}
                      options={[
                        { value: "no", label: "Teetotaler (No)" },
                        { value: "yes", label: "Regular Drinker" },
                        { value: "occasionally", label: "Occasionally" },
                        { value: "flexible", label: "Flexible" }
                      ]}
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <CustomSelect
                      label="Sleep Schedule"
                      value={sleepSchedule}
                      onChange={(val) => setSleepSchedule(val)}
                      options={[
                        { value: "early-bird", label: "Early Bird 🐦" },
                        { value: "night-owl", label: "Night Owl 🦉" },
                        { value: "flexible", label: "Flexible 😎" }
                      ]}
                    />
                    <CustomSelect
                      label="Guests Vibe"
                      value={guestPreference}
                      onChange={(val) => setGuestPreference(val)}
                      options={[
                        { value: "no-guests", label: "No Guests Allowed" },
                        { value: "occasional", label: "Occasional Guests" },
                        { value: "frequent", label: "Frequent Guests OK" },
                        { value: "flexible", label: "Flexible" }
                      ]}
                    />
                    <CustomSelect
                      label="Noise Tolerance"
                      value={noisePreference}
                      onChange={(val) => setNoisePreference(val)}
                      options={[
                        { value: "quiet", label: "Quiet Study Room" },
                        { value: "moderate", label: "Moderate Noise OK" },
                        { value: "loud-ok", label: "Loud Vibe OK" },
                        { value: "flexible", label: "Flexible" }
                      ]}
                    />
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col items-center gap-6"
                >
                  <h4 className="font-extrabold text-lg text-text self-start flex items-center gap-2">
                    <Camera className="text-emerald-500" size={20} /> Profile Photo
                  </h4>

                  <div className="relative group">
                    <div className="w-40 h-40 rounded-full border-4 border-emerald-500 overflow-hidden bg-slate-100 flex-center shadow-lg relative">
                      {photoUrl ? (
                        <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <User size={64} className="text-text-muted" />
                      )}

                      {uploading && (
                        <div className="absolute inset-0 bg-black/50 flex-center">
                          <div className="w-8 h-8 rounded-full border-4 border-t-emerald-500 border-r-transparent border-b-transparent animate-spin"></div>
                        </div>
                      )}
                    </div>

                    <label className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-emerald-500 text-white flex-center shadow-md cursor-pointer hover:bg-emerald-600 transition-colors">
                      <Camera size={18} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  </div>

                  <div className="text-center max-w-sm">
                    <p className="text-sm font-bold text-text">Upload a friendly photo of yourself!</p>
                    <p className="text-xs text-text-muted mt-1">This helps potential roommates connect a face to your compatibility score.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation Controls */}
          <div className="p-8 border-t border-border flex justify-between items-center bg-surface-2/20">
            {step > 1 ? (
              <button type="button" onClick={prevStep} className="btn btn-secondary flex items-center gap-1.5 cursor-pointer">
                <ChevronLeft size={16} /> Back
              </button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={loading}
                className="btn btn-ghost flex items-center gap-1.5 cursor-pointer"
              >
                <Save size={16} /> Save Progress
              </button>

              {step < 4 ? (
                <button type="button" onClick={nextStep} className="btn btn-primary flex items-center gap-1.5 cursor-pointer">
                  Continue <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  disabled={loading}
                  className="btn btn-primary flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-md cursor-pointer"
                >
                  Complete Setup <Check size={16} />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
