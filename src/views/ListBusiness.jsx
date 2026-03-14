import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { db } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';

export default function ListBusiness() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    category: 'Bars & Clubs',
    location: '',
    description: '',
    phone: '',
    instagram: '',
    image: '',
    menuUrl: '',
    priceRange: '$$',
    rating: 5.0,
    trendingScore: 50,
    isVerified: false,
    isLiveTonight: false,
    hasEvents: false,
    events: []
  });

  const [toast, setToast] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
      // Create new object
      const newBusiness = {
        ...formData,
        rating: parseFloat(formData.rating) || 5.0,
        trendingScore: parseInt(formData.trendingScore) || 50,
        createdAt: new Date().toISOString()
      };

      // Push to live Firestore database in the background (no await)
      addDoc(collection(db, 'businesses'), newBusiness).catch(err => {
        console.error("Error adding document: ", err);
      });

      // Show instant success feedback and route home immediately
      setToast('✅ Business saved successfully!');
      setTimeout(() => {
        setToast(null);
        navigate('/'); // Go back home immediately
      }, 500);
    } catch (err) {
      console.error("Error adding document: ", err);
      setToast('❌ Error saving business');
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#38000A] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-[#38000A]/90 backdrop-blur-lg px-4 pt-12 pb-4 border-b dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-900 dark:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-[#CD1C18] dark:text-[#FFA896]">Record Data</h1>
        </div>
        <button 
          onClick={handleSubmit}
          className="bg-[#CD1C18] hover:bg-[#9B1313] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md transition"
        >
          <Save size={16} /> Save
        </button>
      </div>

      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-4 py-2 rounded-xl shadow-lg font-bold text-sm animate-in fade-in slide-in-from-top-4">
          {toast}
        </div>
      )}

      {/* Form Context */}
      <form onSubmit={handleSubmit} className="p-4 max-w-2xl mx-auto space-y-6">
        
        {/* Basic Info Container */}
        <div className="bg-white/50 dark:bg-[#4a0d13] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800/60 space-y-6">
          <h2 className="text-xl font-black tracking-tight mb-2 dark:text-white border-b border-gray-100 dark:border-gray-800/50 pb-4">Basic Details</h2>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Business Name</label>
            <input 
              required type="text" name="name" value={formData.name} onChange={handleChange}
              placeholder="e.g. Elements Club"
              className="w-full bg-transparent border-b-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white py-2 outline-none focus:border-[#CD1C18] transition-colors placeholder-gray-300 dark:placeholder-gray-600 font-medium text-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Category</label>
              <select 
                name="category" value={formData.category} onChange={handleChange}
                className="w-full bg-gray-50 dark:bg-[#38000A] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#CD1C18] appearance-none font-medium"
              >
                <option>Bars & Clubs</option>
                <option>DJs</option>
                <option>Wedding Venues</option>
              </select>
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
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Location / City</label>
            <input 
              required type="text" name="location" value={formData.location} onChange={handleChange}
              placeholder="e.g. Masaki, Dar es Salaam"
              className="w-full bg-transparent border-b-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white py-2 outline-none focus:border-[#CD1C18] transition-colors placeholder-gray-300 dark:placeholder-gray-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Description</label>
            <textarea 
              name="description" value={formData.description} onChange={handleChange}
              placeholder="Tell us about the vibe..." rows="4"
              className="w-full bg-gray-50 dark:bg-[#38000A] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl py-4 px-4 outline-none focus:ring-2 focus:ring-[#CD1C18] resize-none font-medium leading-relaxed"
            />
          </div>
        </div>

        {/* Media & Links */}
        <div className="bg-white/50 dark:bg-[#4a0d13] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800/60 space-y-6">
          <h2 className="text-xl font-black tracking-tight mb-2 dark:text-white border-b border-gray-100 dark:border-gray-800/50 pb-4">Media & Links</h2>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Thumbnail Image URL</label>
            <input 
              required type="url" name="image" value={formData.image} onChange={handleChange}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-transparent border-b-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white py-2 outline-none focus:border-[#CD1C18] transition-colors placeholder-gray-300 dark:placeholder-gray-600 font-medium"
            />
            {formData.image && (
              <div className="mt-4 relative w-full h-40 rounded-2xl overflow-hidden bg-gray-200 border-4 border-white dark:border-gray-800 shadow-xl">
                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} />
              </div>
            )}
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
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Menu Link URL (Optional)</label>
            <input 
              type="url" name="menuUrl" value={formData.menuUrl} onChange={handleChange}
              placeholder="https://..."
              className="w-full bg-transparent border-b-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white py-2 outline-none focus:border-[#CD1C18] transition-colors placeholder-gray-300 dark:placeholder-gray-600 font-medium whitespace-nowrap overflow-hidden text-ellipsis"
            />
          </div>
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
            <div className="flex items-center justify-between mb-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-[#38000A] dark:to-[#4a0d13] p-4 rounded-2xl border border-red-100 dark:border-[#CD1C18]/30 shadow-sm">
              <span className="font-bold text-[#CD1C18] dark:text-[#FFA896] flex items-center gap-2">Live Tonight?</span>
              <input 
                type="checkbox" name="isLiveTonight" checked={formData.isLiveTonight} onChange={handleChange}
                className="w-6 h-6 rounded-md accent-[#CD1C18]"
              />
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
    </div>
  );
}
