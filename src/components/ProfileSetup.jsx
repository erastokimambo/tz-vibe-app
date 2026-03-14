import { useState } from 'react';
import { db } from "../services/config";
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';

const tanzaniaRegions = [
  'Arusha', 'Dar es Salaam', 'Dodoma', 'Geita', 'Iringa', 'Kagera', 'Katavi', 'Kigoma', 'Kilimanjaro', 'Lindi', 'Manyara', 'Mara', 'Mbeya', 'Morogoro', 'Mtwara', 'Mwanza', 'Njombe', 'Pemba North', 'Pemba South', 'Pwani', 'Rukwa', 'Ruvuma', 'Shinyanga', 'Simiyu', 'Singida', 'Songwe', 'Tabora', 'Tanga', 'Zanzibar Central/South', 'Zanzibar North', 'Zanzibar Urban/West'
];

export default function ProfileSetup() {
  const { user, setUserProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: user?.phoneNumber || '+255',
    city: 'Dar es Salaam',
    isVendor: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || formData.phone.length < 9) {
      alert("Please enter a valid name and phone number including the country code.");
      return;
    }

    setLoading(true);
    try {
      const newProfile = {
        uid: user.uid,
        displayName: formData.name,
        phone: formData.phone,
        city: formData.city,
        createdAt: new Date().toISOString(),
        savedListings: [],
        isAdmin: false
      };

      // 1. Save to Firestore
      await setDoc(doc(db, 'users', user.uid), newProfile);
      
      // 2. Update local context to bypass the Gate
      setUserProfile(newProfile);

      // 3. Route accordingly
      if (formData.isVendor) {
        navigate('/list-business');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1a0005]/95 p-6 backdrop-blur-3xl overflow-y-auto">
      <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-300 relative top-10 mb-20">
        <h2 className="text-3xl font-extrabold text-white mb-2">Welcome to TzVibe</h2>
        <p className="text-gray-400 mb-8 text-sm font-medium">Let's set up your profile to start booking.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#FFA896] mb-2 font-bold">Full Name</label>
            <input 
              required
              type="text"
              value={formData.name}
              className="w-full bg-[#38000A]/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-[#CD1C18] outline-none font-medium"
              placeholder="e.g. Juma Rashid"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          {/* WhatsApp Input */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#FFA896] mb-2 font-bold">WhatsApp Number</label>
            <input 
              required
              type="tel"
              value={formData.phone}
              className="w-full bg-[#38000A]/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-[#CD1C18] outline-none font-medium"
              placeholder="+255..."
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          {/* City Selection */}
          <div>
             <label className="block text-xs uppercase tracking-widest text-[#FFA896] mb-2 font-bold">Primary City</label>
             <select 
               value={formData.city}
               onChange={(e) => setFormData({...formData, city: e.target.value})}
               className="w-full bg-[#38000A]/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-[#CD1C18] outline-none appearance-none font-medium"
             >
               {tanzaniaRegions.map(city => (
                 <option key={city} value={city} className="bg-[#38000A]">{city}</option>
               ))}
             </select>
          </div>

          {/* User Role Toggle */}
          <div className="flex items-center justify-between p-4 bg-[#CD1C18]/10 rounded-xl border border-[#CD1C18]/30 mt-8">
            <div>
              <p className="text-white font-bold text-sm">Are you a Business / DJ?</p>
              <p className="text-[#FFA896]/70 text-xs">Toggle this to list your service.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={formData.isVendor}
                onChange={(e) => setFormData({...formData, isVendor: e.target.checked})}
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#CD1C18]"></div>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#CD1C18] to-[#9B1313] disabled:opacity-50 text-white py-4 rounded-xl font-bold text-lg hover:shadow-[0_0_20px_rgba(205,28,24,0.4)] transition-all mt-4"
          >
            {loading ? 'Saving...' : 'Start Vibing'}
          </button>
        </form>
      </div>
    </div>
  );
}
