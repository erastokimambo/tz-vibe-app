import { User, Heart, Calendar, PlusSquare, Settings, LogOut, LogIn, ShieldCheck, X, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function UserMenu() {
  const { userProfile, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  // Check if the current user is a guest (anonymous)
  const isGuest = userProfile?.displayName === 'Anonymous Guest';



  const menuGroups = [
    {
      title: "My Activity",
      items: [
        { icon: Calendar, label: "My Plans", bg: "bg-blue-500", link: "/app/dashboard/plans" },
        { icon: Heart, label: "Saved Listings", bg: "bg-pink-500", link: "/app/dashboard/saved" },
      ]
    },
    {
      title: "Business",
      items: [
        { icon: PlusSquare, label: "Record Data / List Business", bg: "bg-green-500", link: "/app/list-business" },
        { icon: Settings, label: "Manage Listings", bg: "bg-gray-600", link: "/app/dashboard/manage" },
      ]
    },
    ...(userProfile?.isAdmin ? [{
      title: "Settings & Admin",
      items: [
        { icon: ShieldCheck, label: "Admin Panel", bg: "bg-purple-600", link: "/app/admin" },
      ]
    }] : [])
  ];

  const handleSaveProfile = async () => {
    if (!newName.trim() || !userProfile?.uid) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'users', userProfile.uid), {
        displayName: newName.trim()
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      // Import signOut if it's missing at the top or use auth.signOut() directly
      await import('firebase/auth').then(({ signOut }) => signOut(db.app.auth()));
      navigate('/login');
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
              {userProfile?.displayName || 'Anonymous Guest'}
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
        {isGuest ? (
          <Link to="/login" className="flex items-center justify-center gap-2 w-full py-4 text-white font-bold bg-[#CD1C18] rounded-2xl hover:bg-[#9B1313] shadow-lg shadow-[#CD1C18]/30 transition-all hover:scale-[1.02]">
            <LogIn size={20} />
            Sign In / Create Account
          </Link>
        ) : (
          <button 
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 w-full py-4 text-[#CD1C18] font-bold bg-[#CD1C18]/10 rounded-2xl hover:bg-[#CD1C18]/20 transition-colors"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        )}
      </div>

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
