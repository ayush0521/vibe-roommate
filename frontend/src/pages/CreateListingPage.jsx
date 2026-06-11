import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  Building2, ArrowLeft, Check, Upload, DollarSign,
  Phone, Plus, Trash2, Info
} from 'lucide-react';

const AMENITY_OPTIONS = [
  { value: 'wifi', label: 'WiFi 📶' },
  { value: 'parking', label: 'Parking 🅿️' },
  { value: 'laundry', label: 'Laundry 🫧' },
  { value: 'mess', label: 'Mess 🍽️' },
  { value: 'water', label: 'Water Supply 💧' },
  { value: 'security', label: 'Security Guard 🔒' },
  { value: 'ac', label: 'Air Conditioner ❄️' },
  { value: 'gym', label: 'Gym 🏋️' },
  { value: 'cctv', label: 'CCTV 📹' },
  { value: 'power-backup', label: 'Power Backup ⚡' }
];

export default function CreateListingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [type, setType] = useState('pg');
  const [rent, setRent] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [distanceFromCollege, setDistanceFromCollege] = useState('');
  const [occupancy, setOccupancy] = useState('single');
  const [genderAllowed, setGenderAllowed] = useState('male');
  const [contactNumber, setContactNumber] = useState('');
  const [description, setDescription] = useState('');
  
  // Facilities
  const [selectedFacilities, setSelectedFacilities] = useState([]);

  // Images
  const [imageFiles, setImageFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFacilityToggle = (value) => {
    if (selectedFacilities.includes(value)) {
      setSelectedFacilities(selectedFacilities.filter((f) => f !== value));
    } else {
      setSelectedFacilities([...selectedFacilities, value]);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles([...imageFiles, ...files]);
  };

  const removeFile = (index) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !rent || !city || !area || !contactNumber) {
      return toast.error('Please fill in all required fields');
    }

    setLoading(true);
    try {
      const payload = {
        title,
        type,
        rent: parseInt(rent, 10),
        city,
        area,
        distanceFromCollege,
        occupancy,
        genderAllowed,
        contactNumber,
        description,
        facilities: selectedFacilities,
      };

      const { data } = await listingsAPI.createListing(payload);
      const listingId = data.data._id;

      // Handle Image uploads if files are attached
      if (imageFiles.length > 0) {
        setUploading(true);
        try {
          const formData = new FormData();
          imageFiles.forEach((file) => {
            formData.append('images', file);
          });
          await listingsAPI.uploadImages(listingId, formData);
          toast.success('Listing created with images!');
        } catch (uploadErr) {
          console.warn('Image upload failed, but listing was created:', uploadErr);
          toast.success('Listing created successfully! (Images failed to upload — server config pending)');
        }
      } else {
        toast.success('Listing created successfully!');
      }

      navigate('/listings');
    } catch (err) {
      toast.error('Failed to create listing');
      console.error(err);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg p-4 pt-24 pb-12">
      <div className="container max-w-3xl flex flex-col gap-6">
        
        {/* Back Link */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-text-muted hover:text-text font-bold text-sm self-start">
          <ArrowLeft size={16} /> Back
        </button>

        {/* Card Form */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 border border-border"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl gradient-primary flex-center text-white shadow-md">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-text">Create Housing Listing</h2>
              <p className="text-xs text-text-muted mt-0.5">Advertise your property to college students near campuses.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Title */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-text-muted uppercase">Property Title *</label>
              <input
                type="text"
                placeholder="e.g. Luxury Single Room for Boys"
                className="input mt-1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Rent & Type */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-text-muted uppercase">Accommodation Type *</label>
                <select
                  className="select mt-1"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="pg">PG (Paying Guest)</option>
                  <option value="hostel">Hostel</option>
                  <option value="shared-room">Shared Room</option>
                  <option value="flat">Independent Flat/Apartment</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-text-muted uppercase">Monthly Rent (₹) *</label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3.5 top-3.5 text-text-muted" size={16} />
                  <input
                    type="number"
                    placeholder="4500"
                    className="input pl-9"
                    value={rent}
                    onChange={(e) => setRent(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* City & Area */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-text-muted uppercase">City *</label>
                <input
                  type="text"
                  placeholder="e.g. Nanded"
                  className="input mt-1"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-text-muted uppercase">Area / Neighborhood *</label>
                <input
                  type="text"
                  placeholder="e.g. Cidco Colony, Namaskar Chowk"
                  className="input mt-1"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Distance & Contact */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-text-muted uppercase">Campus Proximity</label>
                <input
                  type="text"
                  placeholder="e.g. 500m from MGM / 10 mins walk from SGGS"
                  className="input mt-1"
                  value={distanceFromCollege}
                  onChange={(e) => setDistanceFromCollege(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-text-muted uppercase">Contact Mobile Number *</label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3.5 top-3.5 text-text-muted" size={16} />
                  <input
                    type="tel"
                    placeholder="+91 99999 88888"
                    className="input pl-9"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Genders & Occupancy */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-text-muted uppercase">Genders Allowed *</label>
                <select
                  className="select mt-1"
                  value={genderAllowed}
                  onChange={(e) => setGenderAllowed(e.target.value)}
                >
                  <option value="male">Boys Only</option>
                  <option value="female">Girls Only</option>
                  <option value="any">Co-Ed (Any)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-text-muted uppercase">Sharing Occupancy</label>
                <select
                  className="select mt-1"
                  value={occupancy}
                  onChange={(e) => setOccupancy(e.target.value)}
                >
                  <option value="single">Single Room</option>
                  <option value="double">Double Sharing</option>
                  <option value="triple">Triple Sharing</option>
                  <option value="dormitory">Dormitory Style</option>
                </select>
              </div>
            </div>

            {/* Facilities Checkboxes */}
            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-xs font-bold text-text-muted uppercase">Amenities Provided</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-1.5">
                {AMENITY_OPTIONS.map((opt) => {
                  const isChecked = selectedFacilities.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleFacilityToggle(opt.value)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border text-left transition-colors flex items-center justify-between ${
                        isChecked
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600'
                          : 'bg-surface hover:bg-surface-2 border-border text-text'
                      }`}
                    >
                      {opt.label}
                      {isChecked && <Check size={12} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1 mt-2">
              <label className="text-xs font-bold text-text-muted uppercase">Description</label>
              <textarea
                rows={4}
                placeholder="Mention features like mess timings, security rules, cleanliness, additional expenses..."
                className="input mt-1 py-3 resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Image attachment */}
            <div className="flex flex-col gap-2 bg-surface-2 p-4 rounded-xl border border-border mt-2">
              <label className="text-xs font-bold text-text uppercase">Accommodation Images</label>
              <p className="text-[10px] text-text-muted">Attach high resolution photos. The first image will be set as primary cover.</p>
              
              <div className="flex flex-wrap gap-3 mt-2">
                {imageFiles.map((file, idx) => (
                  <div key={idx} className="w-16 h-16 rounded-lg border border-border overflow-hidden relative group">
                    <img src={URL.createObjectURL(file)} alt="Upload preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="absolute inset-0 bg-black/60 flex-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                <label className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex-col-center gap-1 text-text-muted hover:text-emerald-500 hover:border-emerald-500 transition-colors cursor-pointer text-center bg-surface">
                  <Upload size={18} />
                  <span className="text-[8px] font-bold">Add</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 flex items-center justify-center gap-1.5 shadow-lg mt-4"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-t-white border-r-transparent border-b-transparent animate-spin"></span>
                  Saving listing details...
                </>
              ) : (
                <>
                  Create Listing <Check size={16} />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
