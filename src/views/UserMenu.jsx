import { User, Heart, Calendar, PlusSquare, Settings, LogOut, LogIn, ShieldCheck, X, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { signOut, updateProfile } from 'firebase/auth';
import { db, auth } from '../firebase/config';

export default function UserMenu() {
  const { userProfile, loading, isGuest } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();



  const menuGroups = [
    {
      title: "My Activity",
      items: [
        { icon: Calendar, label: "My Plans", bg: "bg-blue-500", link: "/dashboard/plans" },
        { icon: Heart, label: "Saved Listings", bg: "bg-pink-500", link: "/dashboard/saved" },
      ]
    },
    {
      title: "Business",
      items: [
        { icon: PlusSquare, label: "Record Data / List Business", bg: "bg-green-500", link: "/list-business" },
        { icon: Settings, label: "Manage Listings", bg: "bg-gray-600", link: "/dashboard/manage" },
      ]
    },
    ...(userProfile?.isAdmin ? [{
      title: "Settings & Admin",
      items: [
        { icon: ShieldCheck, label: "Admin Panel", bg: "bg-purple-600", link: "/admin" },
      ]
    }] : [])
  ];

  const handleSaveProfile = () => {
    if (!newName.trim() || !userProfile?.uid) return;
    setIsSaving(true);
    
    try {
      // Execute Firestore update in the background (no await) to prevent hanging UI 
      // when network connections are spotty or WebSockets drop.
      setDoc(doc(db, 'users', userProfile.uid), {
        displayName: newName.trim()
      }, { merge: true }).catch(err => {
        console.error("Error updating profile in db:", err);
      });

      // Synchronize changes to Firebase Auth native profile
      if (auth.currentUser) {
        updateProfile(auth.currentUser, { displayName: newName.trim() }).catch(e => console.error(e));
      }
      
      // Close modal and force a refresh to pull the updated username state globally
      setTimeout(() => {
        setIsSaving(false);
        setIsEditing(false);
        window.location.reload();
      }, 500);

    } catch (error) {
      console.error("Error initiating profile save:", error);
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
       console.error("Failed to sign out:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#38000A] p-4 pt-12 pb-24 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-[#CD1C18] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#38000A] p-4 pt-12 pb-24">
      <h1 className="text-3xl font-bold mb-6 text-[#CD1C18] dark:text-[#FFA896]">Menu</h1>

      {/* Profile Card */}
      <div className="bg-white dark:bg-[#4a0d13] rounded-2xl p-4 shadow-sm mb-6 flex items-center justify-between border dark:border-gray-800">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 dark:bg-[#38000A] rounded-full flex flex-shrink-0 items-center justify-center border-2 border-[transparent]">
            <User size={32} className="text-gray-400 dark:text-gray-600" />
          </div>
          <div className="overflow-hidden">
            <h2 className="text-xl font-bold truncate dark:text-white">
              {isGuest ? 'Anonymous Guest' : (userProfile?.displayName || 'User')}
            </h2>
            {!isGuest && (
              <p 
                onClick={() => {
                  setNewName(userProfile?.displayName || '');
                  setIsEditing(true);
                }}
                className="text-sm text-[#CD1C18] dark:text-[#FFA896] font-medium cursor-pointer hover:underline"
              >
                Edit Profile
              </p>
            )}
          </div>
        </div>
      </div>



      {/* Menu Content or Guest Splash */}
      {!isGuest ? (
        <>
          {/* Menu Groups */}
          {menuGroups.map((group, idx) => (
            <div key={idx} className="mb-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-2">
                {group.title}
              </h3>
              <div className="bg-white dark:bg-[#4a0d13] rounded-2xl shadow-sm border dark:border-gray-800 overflow-hidden">
                {group.items.map((item, i) => {
                  const ItemContent = (
                    <div 
                      className={`flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${i !== group.items.length - 1 ? 'border-b border-gray-100 dark:border-gray-800/50' : ''}`}
                    >
                      <div className={`p-2 rounded-xl text-white ${item.bg}`}>
                        <item.icon size={20} />
                      </div>
                      <span className="font-semibold flex-1">{item.label}</span>
                    </div>
                  );

                  return item.link ? (
                    <Link key={i} to={item.link}>{ItemContent}</Link>
                  ) : (
                    <div key={i}>{ItemContent}</div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Authentication Action */}
          <div className="mt-8 px-2">
            <button 
              onClick={handleSignOut}
              className="flex items-center justify-center gap-2 w-full py-4 text-[#CD1C18] font-bold bg-[#CD1C18]/10 rounded-2xl hover:bg-[#CD1C18]/20 transition-colors"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-in fade-in slide-in-from-bottom-4">
          <div className="w-20 h-20 bg-gradient-to-br from-[#CD1C18] to-[#9B1313] rounded-3xl flex items-center justify-center text-white mb-6 shadow-xl shadow-[#CD1C18]/20 rotate-3">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">Join the Vibe</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs font-medium leading-relaxed">
            Create a free account to unlock exclusive features, save your favorite venues, and list your own business on the radar.
          </p>
          <Link to="/login" className="w-full max-w-sm py-4 bg-[#CD1C18] hover:bg-[#9B1313] text-white font-bold rounded-2xl shadow-lg shadow-[#CD1C18]/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-3">
            <LogIn size={22} />
            Sign In / Create Account
          </Link>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#4a0d13] w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold dark:text-white">Edit Profile</h2>
              <button 
                onClick={() => setIsEditing(false)}
                className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400 hover:text-red-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Display Name</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl py-4 px-4 outline-none focus:ring-2 focus:ring-[#CD1C18]"
                  autoFocus
                />
              </div>

              <button 
                onClick={handleSaveProfile}
                disabled={isSaving || !newName.trim()}
                className="w-full bg-[#CD1C18] hover:bg-[#9B1313] disabled:opacity-50 text-white rounded-xl py-4 font-bold flex items-center justify-center gap-2 transition-all mt-6"
              >
                {isSaving ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>
                    <Check size={20} /> Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
