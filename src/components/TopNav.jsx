import { Search, MapPin, MessageCircle, Menu, Flame, LogIn } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function TopNav() {
  const { user, userProfile } = useAuth();
  const isGuest = userProfile?.displayName === 'Anonymous Guest' || user?.isAnonymous === true;

  const navItems = [
    { icon: Search, label: 'Explore', path: '/', end: true },
    { icon: MapPin, label: 'Map View', path: '/map' },
    { icon: Flame, label: 'Trending', path: '/trending' },
    { icon: MessageCircle, label: 'Messages', path: '/messages' },
    ...(isGuest ? [{ icon: LogIn, label: 'Log In', path: '/login' }] : []),
    { icon: Menu, label: 'My Menu', path: '/menu' },
  ];

  return (
    <div className="hidden md:flex w-full h-20 fixed left-0 top-0 bg-white/90 dark:bg-[#38000A]/90 backdrop-blur-md border-b border-gray-100 dark:border-[#5e1a20] shadow-sm z-50 items-center px-8 justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#CD1C18] to-[#9B1313] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#CD1C18]/30">
          Tv
        </div>
        <h1 className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white">
          TzVibe.
        </h1>
      </div>
      
      <nav className="flex items-center gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all duration-300 ${
                isActive
                  ? 'bg-[#CD1C18]/10 dark:bg-[#FFA896]/10 text-[#CD1C18] dark:text-[#FFA896] font-bold'
                  : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium'
              }`
            }
          >
            <item.icon size={20} className="shrink-0" />
            <span className="text-[14px]">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
