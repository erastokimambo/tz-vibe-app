import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, GlassWater, Music, CalendarHeart, Utensils } from 'lucide-react';
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
      expiresAt: '' // We will store this as a local string and convert to Timestamp on submit
    },
    hasEvents: false,
    events: [],
    capacity: '',
    setting: 'Indoor',
    amenities: [],
    pricingModel: 'Venue Rental Fee'
  });

  const availableAmenities = ['Parking', 'Bride Room', 'Generator', 'Kitchen', 'Catering', 'Sound System', 'Security'];

  const [toast, setToast] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle nested liveStatus fields
    if (name.startsWith('liveStatus.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        liveStatus: {
          ...prev.liveStatus,
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
      const isSelected = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: isSelected 
          ? prev.amenities.filter(a => a !== amenity)
          : [...prev.amenities, amenity]
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
    e.preventDefault();
    
    // Show saving feedback
    setToast('Saving to database...');

    try {
      // Build Logistics and liveStatus schema properly
      let expirationTimestamp = null;
      if (formData.liveStatus.active && formData.liveStatus.expiresAt) {
        expirationTimestamp = new Date(formData.liveStatus.expiresAt).toISOString();
      }

      // Create new object
      const newBusiness = {
        name: formData.name,
        category: formData.category,
        location: formData.location, // Kept for simple backwards compatibility
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
        
        // New Nested Schema
        logistics: {
           coordinates: formData.mapCoordinates ? { lat: formData.mapCoordinates.lat, lng: formData.mapCoordinates.lng } : null,
           addressString: formData.location || formData.googleMapsUrl || ''
        },
        liveStatus: {
           active: formData.liveStatus.active,
           locationName: formData.liveStatus.locationName,
           expiresAt: expirationTimestamp
        },
        // Wedding Venues Specific Schema
        ...(formData.category === 'Wedding Venues' && {
           capacity: parseInt(formData.capacity) || 0,
           setting: formData.setting,
           amenities: formData.amenities,
           pricingModel: formData.pricingModel
        })
      };

      // Push to live Firestore database
      const docRef = await addDoc(collection(db, 'businesses'), newBusiness);

      // If a native file was uploaded, sync it to Firebase Storage and update the document
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
        // No native file, just standard save
        setToast('✅ Business saved successfully!');
        setTimeout(() => {
          setToast(null);
          navigate('/'); // Go back home immediately
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

  const handleCategorySelect = (categoryId) => {
    setFormData(prev => ({ ...prev, category: categoryId }));
    setStep(2);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#38000A] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-[#38000A]/90 backdrop-blur-lg px-4 pt-12 pb-4 border-b dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => step === 2 ? setStep(1) : navigate(-1)} className="p-2 -ml-2 text-gray-900 dark:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-[#CD1C18] dark:text-[#FFA896]">{step === 1 ? 'Select Category' : 'Record Data'}</h1>
        </div>
        {step === 2 && (
          <button 
            onClick={handleSubmit}
            className="bg-[#CD1C18] hover:bg-[#9B1313] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md transition"
          >
            <Save size={16} /> Save
          </button>
        )}
      </div>

      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-4 py-2 rounded-xl shadow-lg font-bold text-sm animate-in fade-in slide-in-from-top-4">
          {toast}
        </div>
      )}

      {step === 1 ? (
        <div className="p-4 max-w-2xl mx-auto space-y-4 pt-8">
          <p className="text-gray-500 dark:text-gray-400 font-medium mb-6">Choose the type of business or entity you are listing. The form will adapt to your choice.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4">
            {availableCategories.map(cat => (
              <button 
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className="flex items-center gap-4 bg-white/50 dark:bg-[#4a0d13] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800/60 hover:border-[#CD1C18] dark:hover:border-[#CD1C18]/50 transition-colors text-left group"
              >
                <div className={`p-4 rounded-2xl ${cat.bg} ${cat.color} group-hover:scale-110 transition-transform`}>
                  <cat.icon size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black dark:text-white">{cat.id}</h3>
                  <p className="text-sm font-medium text-gray-400 dark:text-gray-500">{cat.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
      <form onSubmit={handleSubmit} className="p-4 max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-8">
        {/* Selected Category Banner */}
        <div className="flex items-center justify-between bg-white/50 dark:bg-[#4a0d13] p-4 rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#CD1C18]/10 rounded-lg text-[#CD1C18] dark:text-[#FFA896]">
              {(() => {
                const Icon = availableCategories.find(c => c.id === formData.category)?.icon || Plus;
                return <Icon size={20} />;
              })()}
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest leading-tight">Selected Category</p>
              <h2 className="text-lg font-black dark:text-white leading-tight">{formData.category}</h2>
            </div>
          </div>
          <button 
            type="button" 
            onClick={() => setStep(1)}
            className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-white bg-gray-100 dark:bg-gray-800 rounded-xl transition-colors"
          >
            Change
          </button>
        </div>

        {/* Basic Info Container */}
        <div className="bg-white/50 dark:bg-[#4a0d13] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800/60 space-y-6">
          <h2 className="text-xl font-black tracking-tight mb-2 dark:text-white border-b border-gray-100 dark:border-gray-800/50 pb-4">Basic Details</h2>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Business Name</label>
            <input 
              required type="text" name="name" value={formData.name} onChange={handleChange}
              placeholder={formData.category === 'DJs' ? 'e.g. DJ Snake' : 'e.g. Elements Club'}
              className="w-full bg-transparent border-b-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white py-2 outline-none focus:border-[#CD1C18] transition-colors placeholder-gray-300 dark:placeholder-gray-600 font-medium text-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Price Range</label>
            <select 
              name="priceRange" value={formData.priceRange} onChange={handleChange}
              className="w-full bg-gray-50 dark:bg-[#38000A] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#CD1C18] appearance-none font-medium text-center"
            >
              <option>$</option>
              <option>$$</option>
              <option>$$$</option>
              <option>$$$$</option>
            </select>
          </div>

          {formData.category === 'DJs' ? (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Region (Tanzania)</label>
              <select 
                required name="location" value={formData.location} onChange={handleChange}
                className="w-full bg-gray-50 dark:bg-[#38000A] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#CD1C18] appearance-none font-medium"
              >
                <option value="" disabled>Select Region</option>
                {tanzaniaRegions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          ) : (
            <div className="space-y-6 pt-4 border-t border-gray-100 dark:border-gray-800/50">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Location Details</h3>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Location Name / Address</label>
                <input 
                  required type="text" name="location" value={formData.location} onChange={handleChange}
                  placeholder="e.g. Masaki, Dar es Salaam"
                  className="w-full bg-transparent border-b-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white py-2 outline-none focus:border-[#CD1C18] transition-colors placeholder-gray-300 dark:placeholder-gray-600 font-medium"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Google Maps Link (Optional)</label>
                <input 
                  type="url" name="googleMapsUrl" value={formData.googleMapsUrl} onChange={handleChange}
                  placeholder="https://maps.app.goo.gl/..."
                  className="w-full bg-transparent border-b-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white py-2 outline-none focus:border-[#CD1C18] transition-colors placeholder-gray-300 dark:placeholder-gray-600 font-medium whitespace-nowrap overflow-hidden text-ellipsis"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Pin on Radar Map</label>
                  {formData.mapCoordinates && <span className="text-xs text-green-500 font-bold">✓ Pinned</span>}
                </div>
                <div className="h-64 rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-sm relative z-0">
                  <MapContainer center={[-6.7924, 39.2083]} zoom={12} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                    <LocationMarker 
                      position={formData.mapCoordinates} 
                      setPosition={(latlng) => setFormData(p => ({...p, mapCoordinates: latlng}))} 
                    />
                  </MapContainer>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 italic">Tap the map to set the exact coordinates for the live Explore radar.</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Description</label>
            <textarea 
              name="description" value={formData.description} onChange={handleChange}
              placeholder="Tell us about the vibe..." rows="4"
              className="w-full bg-gray-50 dark:bg-[#38000A] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl py-4 px-4 outline-none focus:ring-2 focus:ring-[#CD1C18] resize-none font-medium leading-relaxed"
            />
          </div>
        </div>

        {/* Wedding Venue Extended Info */}
        {formData.category === 'Wedding Venues' && (
          <div className="bg-white/50 dark:bg-[#4a0d13] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800/60 space-y-6">
            <h2 className="text-xl font-black tracking-tight mb-2 dark:text-white border-b border-gray-100 dark:border-gray-800/50 pb-4">Venue Logistics</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Capacity (Pax)</label>
                <input 
                  type="number" required placeholder="e.g. 500" name="capacity" value={formData.capacity} onChange={handleChange}
                  className="w-full bg-transparent border-b-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white py-2 outline-none focus:border-[#CD1C18] transition-colors font-medium text-center"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Setting</label>
                <select 
                  name="setting" value={formData.setting} onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-[#38000A] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl py-2 px-3 outline-none focus:ring-2 focus:ring-[#CD1C18] appearance-none font-medium text-center h-[42px]"
                >
                  <option>Indoor</option>
                  <option>Outdoor</option>
                  <option>Both</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Pricing Model</label>
              <select 
                name="pricingModel" value={formData.pricingModel} onChange={handleChange}
                className="w-full bg-gray-50 dark:bg-[#38000A] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#CD1C18] appearance-none font-medium"
              >
                <option>Venue Rental Fee</option>
                <option>Per Plate / Package</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Amenities Included</label>
              <div className="flex flex-wrap gap-2">
                {availableAmenities.map(amenity => (
                  <button
                    type="button"
                    key={amenity}
                    onClick={() => handleAmenityToggle(amenity)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                      formData.amenities.includes(amenity) 
                        ? 'bg-[#CD1C18] text-white shadow-md' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Media & Links */}
        <div className="bg-white/50 dark:bg-[#4a0d13] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800/60 space-y-6">
          <h2 className="text-xl font-black tracking-tight mb-2 dark:text-white border-b border-gray-100 dark:border-gray-800/50 pb-4">Media & Links</h2>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Thumbnail Image (Upload)</label>
            <input 
              type="file" accept="image/*" onChange={handleImageChange}
              className="w-full bg-transparent border-b-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white py-2 outline-none focus:border-[#CD1C18] transition-colors mb-4"
            />
            {imagePreview && (
              <div className="mt-2 relative w-full h-40 rounded-2xl overflow-hidden bg-gray-200 border-4 border-white dark:border-gray-800 shadow-xl">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
            {!imagePreview && formData.image && (
              <div className="mt-2 relative w-full h-40 rounded-2xl overflow-hidden bg-gray-200 border-4 border-white dark:border-gray-800 shadow-xl">
                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} />
              </div>
            )}
            
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mt-6 mb-2">Or paste an Image URL manually</label>
             <input 
              type="url" name="image" value={formData.image} onChange={handleChange} disabled={!!imagePreview}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-transparent border-b-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white py-2 outline-none focus:border-[#CD1C18] transition-colors placeholder-gray-300 dark:placeholder-gray-600 font-medium disabled:opacity-30 disabled:cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">WhatsApp / Phone</label>
              <input 
                type="tel" name="phone" value={formData.phone} onChange={handleChange}
                placeholder="+255..."
                className="w-full bg-transparent border-b-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white py-2 outline-none focus:border-[#CD1C18] transition-colors placeholder-gray-300 dark:placeholder-gray-600 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Instagram Handle</label>
              <input 
                type="text" name="instagram" value={formData.instagram} onChange={handleChange}
                placeholder="@tzvibe"
                className="w-full bg-transparent border-b-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white py-2 outline-none focus:border-[#CD1C18] transition-colors placeholder-gray-300 dark:placeholder-gray-600 font-medium"
              />
            </div>
          </div>
          {(formData.category === 'Bars & Clubs' || formData.category === 'Restaurants') && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Menu Link URL (Optional)</label>
              <input 
                type="url" name="menuUrl" value={formData.menuUrl} onChange={handleChange}
                placeholder="https://..."
                className="w-full bg-transparent border-b-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white py-2 outline-none focus:border-[#CD1C18] transition-colors placeholder-gray-300 dark:placeholder-gray-600 font-medium whitespace-nowrap overflow-hidden text-ellipsis"
              />
            </div>
          )}
        </div>

        {/* Mock Analytics properties */}
        <div className="bg-white/50 dark:bg-[#4a0d13] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800/60 space-y-6">
          <h2 className="text-xl font-black tracking-tight mb-2 dark:text-white border-b border-gray-100 dark:border-gray-800/50 pb-4">Attributes</h2>
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-gray-700 dark:text-white">Admin: Verified Badge</span>
            <input 
              type="checkbox" name="isVerified" checked={formData.isVerified} onChange={handleChange}
              className="w-6 h-6 text-[#CD1C18] rounded-md border-gray-300 focus:ring-[#CD1C18] accent-[#CD1C18]"
            />
          </div>
          {formData.category === 'DJs' && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-[#38000A] dark:to-[#4a0d13] p-4 rounded-2xl border border-red-100 dark:border-[#CD1C18]/30 shadow-sm mb-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#CD1C18] dark:text-[#FFA896] flex items-center gap-2">Live Tonight?</span>
                <input 
                  type="checkbox" name="liveStatus.active" checked={formData.liveStatus.active} onChange={handleChange}
                  className="w-6 h-6 rounded-md accent-[#CD1C18]"
                />
              </div>
              
              {formData.liveStatus.active && (
                <div className="space-y-4 pt-4 border-t border-red-200/50 dark:border-[#CD1C18]/20 animate-in fade-in slide-in-from-top-2">
                  <div>
                    <label className="block text-xs font-bold text-[#CD1C18]/70 dark:text-[#FFA896]/70 uppercase tracking-widest mb-2">Location Tonight</label>
                    <input 
                      required type="text" name="liveStatus.locationName" value={formData.liveStatus.locationName} onChange={handleChange}
                      placeholder="e.g. Samaki Samaki Masaki"
                      className="w-full bg-white/50 dark:bg-[#2A0008]/50 border-b-2 border-red-200 dark:border-[#CD1C18]/30 text-gray-900 dark:text-white py-2 outline-none focus:border-[#CD1C18] transition-colors placeholder-gray-400 dark:placeholder-gray-600 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#CD1C18]/70 dark:text-[#FFA896]/70 uppercase tracking-widest mb-2">Banner Expires At</label>
                    <input 
                      required type="datetime-local" name="liveStatus.expiresAt" value={formData.liveStatus.expiresAt} onChange={handleChange}
                      className="w-full bg-white/50 dark:bg-[#2A0008]/50 border-b-2 border-red-200 dark:border-[#CD1C18]/30 text-gray-900 dark:text-white py-2 px-1 outline-none focus:border-[#CD1C18] transition-colors font-medium appearance-none"
                    />
                    <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-bold">The pulsing banner will automatically hide after this time.</p>
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Initial Rating</label>
              <input 
                type="number" step="0.1" max="5" name="rating" value={formData.rating} onChange={handleChange}
                className="w-full bg-gray-50 dark:bg-[#38000A] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#CD1C18] font-bold text-center"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Trending Score</label>
              <input 
                type="number" name="trendingScore" value={formData.trendingScore} onChange={handleChange}
                className="w-full bg-gray-50 dark:bg-[#38000A] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#CD1C18] font-bold text-center"
              />
            </div>
          </div>
        </div>

        {/* Event List Maker */}
        <div className="bg-white/50 dark:bg-[#4a0d13] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800/60">
          <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-800/50 pb-4">
            <h2 className="text-xl font-black tracking-tight dark:text-white">Upcoming Events</h2>
            <button 
              type="button" onClick={handleAddEvent}
              className="bg-[#CD1C18]/10 text-[#CD1C18] dark:text-[#FFA896] hover:bg-[#CD1C18]/20 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1 transition-colors"
            >
              <Plus size={16} /> Add Event
            </button>
          </div>

          {formData.events.length === 0 ? (
            <p className="text-sm font-medium text-gray-400 dark:text-gray-500 italic text-center py-6">No events recorded. Click "Add Event" to create one.</p>
          ) : (
            <div className="space-y-4">
              {formData.events.map((ev, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-2xl border-l-4 border-[#CD1C18] bg-white dark:bg-[#38000A] shadow-sm">
                  <div className="flex-1 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Event Name</label>
                        <input 
                        required type="text" placeholder="e.g. Afrobeat Fridays"
                        value={ev.name} onChange={(e) => handleEventChange(index, 'name', e.target.value)}
                        className="w-full bg-transparent border-b border-gray-200 dark:border-gray-700 font-bold text-gray-900 dark:text-white py-1 outline-none focus:border-[#CD1C18] placeholder-gray-300 dark:placeholder-gray-600"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Date & Time</label>
                        <input 
                        required type="text" placeholder="e.g. This Friday, 10 PM"
                        value={ev.date} onChange={(e) => handleEventChange(index, 'date', e.target.value)}
                        className="w-full bg-transparent border-b border-gray-200 dark:border-gray-700 font-medium text-gray-700 dark:text-gray-300 py-1 outline-none focus:border-[#CD1C18] placeholder-gray-300 dark:placeholder-gray-600"
                        />
                    </div>
                  </div>
                  <button 
                    type="button" onClick={() => handleRemoveEvent(index)}
                    className="p-3 text-gray-400 hover:text-white hover:bg-red-500 transition-colors bg-gray-50 dark:bg-gray-800 rounded-xl"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </form>
      )}
    </div>
  );
}
