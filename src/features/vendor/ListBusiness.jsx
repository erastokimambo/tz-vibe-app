import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, GlassWater, Music, CalendarHeart, Utensils, Image as ImageIcon } from 'lucide-react';
import { db, storage } from "../../services/config";
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useAuth } from "../../context/AuthContext";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return position === null ? null : <Marker position={position}></Marker>;
}

const tanzaniaRegions = [
  'Arusha', 'Dar es Salaam', 'Dodoma', 'Geita', 'Iringa', 'Kagera', 'Katavi', 'Kigoma', 'Kilimanjaro', 'Lindi', 'Manyara', 'Mara', 'Mbeya', 'Morogoro', 'Mtwara', 'Mwanza', 'Njombe', 'Pemba North', 'Pemba South', 'Pwani', 'Rukwa', 'Ruvuma', 'Shinyanga', 'Simiyu', 'Singida', 'Songwe', 'Tabora', 'Tanga', 'Zanzibar Central/South', 'Zanzibar North', 'Zanzibar Urban/West'
];

export default function ListBusiness() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Bars & Clubs',
    location: '',
    description: '',
    phone: '',
    instagram: '',
    image: '',
    menuUrl: '',
    googleMapsUrl: '',
    mapCoordinates: null,
    priceRange: '$$',
    rating: 5.0,
    trendingScore: 50,
    isVerified: false,
    liveStatus: {
      active: false,
      locationName: '',
      expiresAt: ''
    },
    hasEvents: false,
    events: [],
    weddingDetails: {
      maxCapacity: '',
      venueType: 'Both',
      amenities: [],
      isCateringFlexible: false
    }
  });

  const availableAmenities = ['Generator', 'AC', 'Parking', 'Bride Room', 'Catering', 'Sound System', 'Security', 'Garden'];

  const [toast, setToast] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const nextStep = () => {
    // Basic validation before allowing next
    if (step === 1 && (!formData.name)) {
        setToast('Please provide a Business/DJ Name');
        setTimeout(() => setToast(null), 2000);
        return;
    }
    setStep(Math.min(step + 1, 3));
  };
  
  const prevStep = () => setStep(Math.max(step - 1, 1));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle nested liveStatus and weddingDetails fields
    if (name.startsWith('liveStatus.') || name.startsWith('weddingDetails.')) {
      const [parent, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [field]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => {
      const isSelected = prev.weddingDetails?.amenities.includes(amenity);
      return {
        ...prev,
        weddingDetails: {
          ...prev.weddingDetails,
          amenities: isSelected 
            ? prev.weddingDetails.amenities.filter(a => a !== amenity)
            : [...(prev.weddingDetails.amenities || []), amenity]
        }
      };
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData(prev => ({...prev, image: ''}));
    }
  };

  const handleAddEvent = () => {
    setFormData(prev => ({
      ...prev,
      hasEvents: true,
      events: [...prev.events, { name: '', date: '' }]
    }));
  };

  const handleEventChange = (index, field, value) => {
    const updatedEvents = [...formData.events];
    updatedEvents[index][field] = value;
    setFormData(prev => ({ ...prev, events: updatedEvents }));
  };

  const handleRemoveEvent = (index) => {
    const updatedEvents = formData.events.filter((_, i) => i !== index);
    setFormData(prev => ({ 
      ...prev, 
      events: updatedEvents,
      hasEvents: updatedEvents.length > 0
    }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Show saving feedback
    setToast('Saving to database...');

    try {
      let expirationTimestamp = null;
      if (formData.liveStatus.active && formData.liveStatus.expiresAt) {
        expirationTimestamp = new Date(formData.liveStatus.expiresAt).toISOString();
      }

      const newBusiness = {
        name: formData.name,
        category: formData.category,
        location: formData.location,
        description: formData.description,
        phone: formData.phone,
        instagram: formData.instagram,
        image: formData.image,
        menuUrl: formData.menuUrl,
        priceRange: formData.priceRange,
        rating: parseFloat(formData.rating) || 5.0,
        trendingScore: parseInt(formData.trendingScore) || 50,
        isVerified: formData.isVerified,
        hasEvents: formData.hasEvents,
        events: formData.events,
        ownerId: userProfile?.uid || 'anonymous',
        createdAt: new Date().toISOString(),
        
        logistics: {
           coordinates: formData.mapCoordinates ? { lat: formData.mapCoordinates.lat, lng: formData.mapCoordinates.lng } : null,
           addressString: formData.location || formData.googleMapsUrl || ''
        },
        liveStatus: {
           active: formData.liveStatus.active,
           locationName: formData.liveStatus.locationName,
           expiresAt: expirationTimestamp
        },
        ...(formData.category === 'Wedding Venues' && {
           weddingDetails: {
              maxCapacity: parseInt(formData.weddingDetails.maxCapacity) || 0,
              venueType: formData.weddingDetails.venueType,
              amenities: formData.weddingDetails.amenities,
              isCateringFlexible: formData.weddingDetails.isCateringFlexible
           }
        })
      };

      const docRef = await addDoc(collection(db, 'businesses'), newBusiness);

      if (imageFile) {
        setToast('Uploading image... 0%');
        const storageRef = ref(storage, `businesses/${docRef.id}`);
        const uploadTask = uploadBytesResumable(storageRef, imageFile);

        uploadTask.on('state_changed', 
          (snapshot) => {
             const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
             setToast(`Uploading image... ${Math.round(progress)}%`);
          },
          (error) => {
             console.error("Upload error", error);
             setToast('❌ Error uploading image');
             setTimeout(() => setToast(null), 3000);
          },
          async () => {
             const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
             await updateDoc(doc(db, 'businesses', docRef.id), { image: downloadURL });
             setToast('✅ Business saved successfully!');
             setTimeout(() => {
               setToast(null);
               navigate('/'); 
             }, 1000);
          }
        );
      } else {
        setToast('✅ Business saved successfully!');
        setTimeout(() => {
          setToast(null);
          navigate('/');
        }, 500);
      }
    } catch (err) {
      console.error("Error adding document: ", err);
      setToast('❌ Error saving business');
      setTimeout(() => setToast(null), 3000);
    }
  };

  const availableCategories = [
    { id: 'Bars & Clubs', icon: GlassWater, desc: 'Lounges, Nightclubs, Speakeasies', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'DJs', icon: Music, desc: 'Solo Performers, VJs, Sound Engineers', color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { id: 'Wedding Venues', icon: CalendarHeart, desc: 'Halls, Gardens, Resorts', color: 'text-pink-500', bg: 'bg-pink-500/10' },
    { id: 'Restaurants', icon: Utensils, desc: 'Cafes, Fine Dining, Eateries', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#38000A] pb-24 font-sans selection:bg-[#CD1C18] selection:text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-[#38000A]/90 backdrop-blur-lg px-4 pt-12 pb-4 border-b dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-900 dark:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-[#CD1C18] dark:text-[#FFA896]">Listing Wizard</h1>
        </div>
      </div>

      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#CD1C18] text-white px-6 py-3 rounded-full shadow-[0_0_20px_rgba(205,28,24,0.4)] font-bold text-sm animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
          {toast}
        </div>
      )}

      {/* Progress Bar */}
      <div className="flex gap-2 mx-auto max-w-2xl px-6 mt-8 mb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${step >= i ? 'bg-[#CD1C18]' : 'bg-gray-200 dark:bg-white/10'}`} />
        ))}
      </div>

      <div className="p-6 max-w-2xl mx-auto overflow-x-hidden">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 space-y-8 pb-8">
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">Tell us about your vibe</h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Select your category and provide the core details.</p>
            </div>

            <div className="space-y-4">
              <label className="block text-xs uppercase tracking-widest text-gray-500 font-bold">Category</label>
              <div className="grid grid-cols-2 gap-4">
                {availableCategories.map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => setFormData({...formData, category: cat.id})}
                    className={`flex flex-col items-center gap-3 p-4 rounded-3xl border-2 transition-all ${
                        formData.category === cat.id 
                        ? 'border-[#CD1C18] bg-[#CD1C18]/5 shadow-[0_0_15px_rgba(205,28,24,0.1)]' 
                        : 'border-transparent bg-white shadow-sm dark:bg-white/5 hover:border-gray-200 dark:hover:border-gray-700'
                    }`}
                  >
                    <div className={`p-3 rounded-2xl ${formData.category === cat.id ? 'bg-[#CD1C18] text-white' : cat.bg + ' ' + cat.color}`}>
                      <cat.icon size={24} />
                    </div>
                    <span className="font-bold text-sm text-gray-900 dark:text-white text-center">{cat.id}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6 bg-white/50 dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#CD1C18] dark:text-[#FFA896] font-bold mb-2">Business / Entity Name</label>
                  <input 
                    required type="text" name="name" value={formData.name} onChange={handleChange}
                    placeholder={formData.category === 'DJs' ? 'e.g. DJ Snake' : 'e.g. Elements Club'}
                    className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#CD1C18] transition-all font-bold text-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 font-bold mb-2">Description / Bio</label>
                  <textarea 
                    name="description" value={formData.description} onChange={handleChange}
                    placeholder="Describe your vibe in a few sentences..." rows="3"
                    className="w-full bg-white dark:bg-black/20 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl py-4 px-4 outline-none focus:ring-2 focus:ring-[#CD1C18] resize-none font-medium leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 font-bold mb-2">Price Range</label>
                  <select 
                    name="priceRange" value={formData.priceRange} onChange={handleChange}
                    className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#CD1C18] appearance-none font-bold"
                  >
                    <option>$</option>
                    <option>$$</option>
                    <option>$$$</option>
                    <option>$$$$</option>
                  </select>
                </div>
            </div>

            <button onClick={nextStep} className="w-full bg-gradient-to-r from-[#CD1C18] to-[#9B1313] text-white py-4 rounded-xl font-bold text-lg hover:shadow-[0_0_20px_rgba(205,28,24,0.4)] transition-all">
              Next Step
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 space-y-8 pb-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">Visuals & Location</h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">High-quality photos and exact locations get 3x more bookings.</p>
            </div>

            <div className="bg-white/50 dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm space-y-6">
                <div>
                   <label className="block text-xs uppercase tracking-widest text-[#CD1C18] dark:text-[#FFA896] font-bold mb-4">Thumbnail Image</label>
                   
                   {!imagePreview ? (
                      <div 
                         onClick={() => document.getElementById('imageUpload').click()}
                         className="border-2 border-dashed border-gray-300 dark:border-white/10 hover:border-[#CD1C18] bg-white dark:bg-black/20 rounded-2xl p-12 transition-colors cursor-pointer text-center group"
                      >
                         <ImageIcon className="mx-auto text-gray-400 group-hover:text-[#CD1C18] mb-3 transition" size={36} />
                         <p className="text-gray-600 dark:text-gray-300 font-bold text-sm">Click to upload Thumbnail</p>
                      </div>
                   ) : (
                      <div className="relative w-full h-48 rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800">
                         <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                         <button 
                            onClick={() => { setImagePreview(''); setImageFile(null); }}
                            className="absolute top-2 right-2 bg-black/60 backdrop-blur text-white p-2 rounded-full hover:bg-black"
                         >
                            <Trash2 size={16} />
                         </button>
                      </div>
                   )}
                   <input id="imageUpload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </div>
            </div>

            <div className="bg-white/50 dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm space-y-6">
                <label className="block text-xs uppercase tracking-widest text-[#CD1C18] dark:text-[#FFA896] font-bold mb-2">Location Information</label>
                
                {formData.category === 'DJs' ? (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Region (Tanzania)</label>
                    <select 
                      name="location" value={formData.location} onChange={handleChange}
                      className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#CD1C18] font-medium appearance-none"
                    >
                      <option value="" disabled>Select Region</option>
                      {tanzaniaRegions.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Location Name / Area</label>
                      <input 
                        required type="text" name="location" value={formData.location} onChange={handleChange}
                        placeholder="e.g. Masaki, Dar es Salaam"
                        className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#CD1C18] font-medium"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Pin on Radar Map</label>
                        {formData.mapCoordinates && <span className="text-xs text-green-500 font-bold px-2 py-0.5 bg-green-500/10 rounded-full">✓ Pinned</span>}
                      </div>
                      <div className="h-48 rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-inner relative z-0">
                        <MapContainer center={[-6.7924, 39.2083]} zoom={12} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                          <LocationMarker 
                            position={formData.mapCoordinates} 
                            setPosition={(latlng) => setFormData(p => ({...p, mapCoordinates: latlng}))} 
                          />
                        </MapContainer>
                      </div>
                      <p className="text-xs text-gray-400 mt-2 font-medium">Tap the map to set exact coordinates.</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Google Maps URL (Optional)</label>
                      <input 
                        type="url" name="googleMapsUrl" value={formData.googleMapsUrl} onChange={handleChange}
                        placeholder="https://maps.app.goo.gl/..."
                        className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#CD1C18] font-medium"
                      />
                    </div>
                  </>
                )}
            </div>

            <div className="flex gap-4 pt-2">
              <button onClick={prevStep} className="flex-1 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white py-4 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-white/10 transition">
                Back
              </button>
              <button onClick={nextStep} className="flex-1 bg-gradient-to-r from-[#CD1C18] to-[#9B1313] text-white py-4 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(205,28,24,0.4)] transition">
                Next Step
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 space-y-8 pb-8">
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">Final Details</h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Logistics, contact avenues, and event programming.</p>
            </div>

            <div className="bg-white/50 dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm space-y-6">
                <h3 className="text-[#CD1C18] dark:text-[#FFA896] font-bold text-sm tracking-widest uppercase">Contact & Social</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">WhatsApp Number (Required)</label>
                    <input 
                      type="tel" name="phone" value={formData.phone} onChange={handleChange}
                      placeholder="+255..."
                      className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#CD1C18] font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Instagram Handle</label>
                    <input 
                      type="text" name="instagram" value={formData.instagram} onChange={handleChange}
                      placeholder="@tzvibe"
                      className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#CD1C18] font-medium"
                    />
                  </div>
                </div>
                
                {(formData.category === 'Bars & Clubs' || formData.category === 'Restaurants') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Menu Link URL (Optional)</label>
                    <input 
                      type="url" name="menuUrl" value={formData.menuUrl} onChange={handleChange}
                      placeholder="https://..."
                      className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#CD1C18] font-medium"
                    />
                  </div>
                )}
            </div>

            {formData.category === 'Wedding Venues' && (
              <div className="bg-white/50 dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm space-y-6">
                <h3 className="text-[#CD1C18] dark:text-[#FFA896] font-bold text-sm tracking-widest uppercase mb-4">Venue Logistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Max Capacity (Pax)</label>
                    <input 
                      type="number" required placeholder="500" name="weddingDetails.maxCapacity" value={formData.weddingDetails.maxCapacity} onChange={handleChange}
                      className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#CD1C18] font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Venue Type</label>
                    <select 
                      name="weddingDetails.venueType" value={formData.weddingDetails.venueType} onChange={handleChange}
                      className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#CD1C18] font-bold appearance-none text-center"
                    >
                      <option>Indoor</option>
                      <option>Outdoor</option>
                      <option>Both</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span className="font-bold text-gray-700 dark:text-gray-300 text-sm">Outside Catering Allowed?</span>
                  <input 
                    type="checkbox" name="weddingDetails.isCateringFlexible" checked={formData.weddingDetails.isCateringFlexible} onChange={handleChange}
                    className="w-6 h-6 text-[#CD1C18] rounded-md border-gray-300 accent-[#CD1C18]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 mt-4">Amenities Included</label>
                  <div className="flex flex-wrap gap-2">
                    {availableAmenities.map(amenity => (
                      <button
                        type="button"
                        key={amenity}
                        onClick={() => handleAmenityToggle(amenity)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center justify-center ${
                          formData.weddingDetails?.amenities.includes(amenity) 
                            ? 'bg-[#CD1C18] text-white shadow-md' 
                            : 'bg-white dark:bg-white/10 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[#CD1C18]'
                        }`}
                      >
                        {amenity}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {formData.category === 'DJs' && (
              <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/40 dark:to-[#4a0d13] p-6 rounded-3xl border border-red-100 dark:border-[#CD1C18]/20 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#CD1C18] dark:text-[#FFA896] text-lg">Live Tonight?</span>
                  <input 
                    type="checkbox" name="liveStatus.active" checked={formData.liveStatus.active} onChange={handleChange}
                    className="w-6 h-6 rounded-md accent-[#CD1C18]"
                  />
                </div>
                
                {formData.liveStatus.active && (
                  <div className="space-y-4 pt-4 border-t border-red-200 dark:border-[#CD1C18]/20 animate-in fade-in slide-in-from-top-2">
                    <div>
                      <label className="block text-xs font-bold text-[#CD1C18]/80 dark:text-[#FFA896]/80 uppercase tracking-widest mb-2">Location Tonight</label>
                      <input 
                        required type="text" name="liveStatus.locationName" value={formData.liveStatus.locationName} onChange={handleChange}
                        placeholder="e.g. Samaki Samaki Masaki"
                        className="w-full bg-white/70 dark:bg-black/30 border border-red-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#CD1C18] font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#CD1C18]/80 dark:text-[#FFA896]/80 uppercase tracking-widest mb-2">Banner Expires At</label>
                      <input 
                        required type="datetime-local" name="liveStatus.expiresAt" value={formData.liveStatus.expiresAt} onChange={handleChange}
                        className="w-full bg-white/70 dark:bg-black/30 border border-red-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#CD1C18] font-bold appearance-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="bg-white/50 dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[#CD1C18] dark:text-[#FFA896] font-bold text-sm tracking-widest uppercase">Upcoming Events</h3>
                <button 
                  type="button" onClick={handleAddEvent}
                  className="bg-[#CD1C18]/10 text-[#CD1C18] dark:text-[#FFA896] hover:bg-[#CD1C18]/20 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 transition"
                >
                  <Plus size={16} /> Add Event
                </button>
              </div>

              {formData.events.length === 0 ? (
                <p className="text-sm font-medium text-gray-400 text-center py-4">No events listed right now.</p>
              ) : (
                <div className="space-y-4">
                  {formData.events.map((ev, index) => (
                    <div key={index} className="flex gap-4 p-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 shadow-sm relative group">
                      <div className="flex-1 space-y-3">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Event Name</label>
                            <input 
                              type="text" placeholder="e.g. Afrobeat Fridays"
                              value={ev.name} onChange={(e) => handleEventChange(index, 'name', e.target.value)}
                              className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 font-bold text-gray-900 dark:text-white py-1 outline-none focus:border-[#CD1C18]"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date & Time</label>
                            <input 
                              type="text" placeholder="e.g. This Friday, 10 PM"
                              value={ev.date} onChange={(e) => handleEventChange(index, 'date', e.target.value)}
                              className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 font-medium text-gray-700 dark:text-gray-300 py-1 outline-none focus:border-[#CD1C18]"
                            />
                        </div>
                      </div>
                      <button 
                        type="button" onClick={() => handleRemoveEvent(index)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-red-500 rounded-xl transition self-start"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                type="button" 
                onClick={prevStep} 
                className="flex-1 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white py-4 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-white/10 transition"
              >
                Back
              </button>
              <button 
                type="button" 
                onClick={handleSubmit} 
                disabled={!imageFile || !formData.phone || formData.phone.length < 9}
                className="flex-[2] bg-gradient-to-r from-[#CD1C18] to-[#9B1313] text-white py-4 rounded-xl font-bold shadow-[0_0_30px_rgba(205,28,24,0.3)] disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(205,28,24,0.5)] transition"
              >
                Publish My Listing
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
