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

      // Push to live Firestore database
      await addDoc(collection(db, 'businesses'), newBusiness);

      // Show success feedback
      setToast('✅ Business saved successfully!');
      setTimeout(() => {
        setToast(null);
        navigate('/app'); // Go back home to see it in Explore tab
      }, 2000);
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
        <div className="bg-white dark:bg-[#4a0d13] p-5 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Basic Info</h2>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Business Name</label>
            <input 
              required type="text" name="name" value={formData.name} onChange={handleChange}
              placeholder="e.g. Elements Club"
              className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#CD1C18]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select 
                name="category" value={formData.category} onChange={handleChange}
                className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#CD1C18] appearance-none"
              >
                <option>Bars & Clubs</option>
                <option>DJs</option>
                <option>Wedding Venues</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Price Range</label>
              <select 
                name="priceRange" value={formData.priceRange} onChange={handleChange}
                className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#CD1C18] appearance-none"
              >
                <option>$</option>
                <option>$$</option>
                <option>$$$</option>
                <option>$$$$</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Location / City</label>
            <input 
              required type="text" name="location" value={formData.location} onChange={handleChange}
              placeholder="e.g. Masaki, Dar es Salaam"
              className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#CD1C18]"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea 
              name="description" value={formData.description} onChange={handleChange}
              placeholder="Tell us about the vibe..." rows="3"
              className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#CD1C18] resize-none"
            />
          </div>
        </div>

        {/* Media & Links */}
        <div className="bg-white dark:bg-[#4a0d13] p-5 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Media & Links</h2>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Thumbnail Image URL</label>
            <input 
              required type="url" name="image" value={formData.image} onChange={handleChange}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#CD1C18]"
            />
            {formData.image && (
              <div className="mt-3 relative w-full h-32 rounded-xl overflow-hidden bg-gray-200">
                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">WhatsApp / Phone</label>
              <input 
                type="tel" name="phone" value={formData.phone} onChange={handleChange}
                placeholder="+255..."
                className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#CD1C18]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Instagram Handle</label>
              <input 
                type="text" name="instagram" value={formData.instagram} onChange={handleChange}
                placeholder="@tzvibe"
                className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#CD1C18]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Menu Link URL (Optional)</label>
            <input 
              type="url" name="menuUrl" value={formData.menuUrl} onChange={handleChange}
              placeholder="https://..."
              className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#CD1C18]"
            />
          </div>
        </div>

        {/* Mock Analytics properties */}
        <div className="bg-white dark:bg-[#4a0d13] p-5 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Attributes & Analytics</h2>
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold dark:text-white">Admin: Verified Badge</span>
            <input 
              type="checkbox" name="isVerified" checked={formData.isVerified} onChange={handleChange}
              className="w-6 h-6 text-[#CD1C18] rounded-md focus:ring-[#CD1C18] accent-[#CD1C18]"
            />
          </div>
          {formData.category === 'DJs' && (
            <div className="flex items-center justify-between mb-4 bg-[#CD1C18]/10 p-3 rounded-xl border border-[#CD1C18]/20">
              <span className="font-bold text-[#CD1C18] dark:text-[#FFA896] flex items-center gap-2">Live Tonight?</span>
              <input 
                type="checkbox" name="isLiveTonight" checked={formData.isLiveTonight} onChange={handleChange}
                className="w-6 h-6 rounded-md accent-[#CD1C18]"
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Rating (Out of 5)</label>
              <input 
                type="number" step="0.1" max="5" name="rating" value={formData.rating} onChange={handleChange}
                className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#CD1C18]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Trending Score</label>
              <input 
                type="number" name="trendingScore" value={formData.trendingScore} onChange={handleChange}
                className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#CD1C18]"
              />
            </div>
          </div>
        </div>

        {/* Event List Maker */}
        <div className="bg-white dark:bg-[#4a0d13] p-5 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold dark:text-white">Upcoming Events</h2>
            <button 
              type="button" onClick={handleAddEvent}
              className="bg-[#CD1C18]/10 text-[#CD1C18] dark:text-[#FFA896] hover:bg-[#CD1C18]/20 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors"
            >
              <Plus size={16} /> Add Event
            </button>
          </div>

          {formData.events.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No events recorded. Click "Add Event" to list one.</p>
          ) : (
            <div className="space-y-4">
              {formData.events.map((ev, index) => (
                <div key={index} className="flex items-start gap-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex-1 space-y-3">
                    <input 
                      required type="text" placeholder="Event Name (e.g. Afrobeat Fridays)"
                      value={ev.name} onChange={(e) => handleEventChange(index, 'name', e.target.value)}
                      className="w-full bg-white dark:bg-gray-900 border-none text-sm rounded-lg py-2 px-3 outline-none focus:ring-1 focus:ring-[#CD1C18]"
                    />
                    <input 
                      required type="text" placeholder="Date/Time (e.g. This Friday, 10 PM)"
                      value={ev.date} onChange={(e) => handleEventChange(index, 'date', e.target.value)}
                      className="w-full bg-white dark:bg-gray-900 border-none text-sm rounded-lg py-2 px-3 outline-none focus:ring-1 focus:ring-[#CD1C18]"
                    />
                  </div>
                  <button 
                    type="button" onClick={() => handleRemoveEvent(index)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-white dark:bg-gray-900 rounded-lg shadow-sm"
                  >
                    <Trash2 size={16} />
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
