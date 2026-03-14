import { Search, MapPin, Flame, MessageCircle, Menu, LogIn } from 'lucide-react';
import clsx from 'clsx';
import { NavLink } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";

export default function BottomNav() {
  const { isGuest, userProfile } = useAuth();
  const userName = userProfile?.displayName?.split(' ')?.shift() || 'Profile';

  const navItems = [
    { path: '/', label: 'Explore', icon: Search },
    { path: '/map', label: 'Map', icon: MapPin },
    { path: '/trending', label: 'Trending', icon: Flame },
    { path: '/messages', label: 'Messages', icon: MessageCircle },
    ...(isGuest ? [{ path: '/login', label: 'Log In', icon: LogIn }] : []),
    { path: '/menu', label: isGuest ? 'Menu' : userName, icon: Menu, isProfile: true },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#4a0d13] border-t dark:border-gray-800 pb-safe">
      <nav className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
        {navItems.map(({ path, label, icon: Icon, isProfile }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              clsx(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                label === 'Log In' 
                  ? "text-[#CD1C18] font-bold" // Distinct color for Log In not active
                  : isActive 
                    ? "text-[#CD1C18]" 
                    : "text-gray-500 dark:text-gray-400 hover:text-[#9B1313] dark:hover:text-gray-200"
              )
            }
          >
            <div className={clsx(
                "p-1.5 rounded-xl flex items-center justify-center transition-colors",
                label === 'Log In' ? "bg-[#CD1C18]/10 text-[#CD1C18]" : ""
              )}>
              {isProfile && !isGuest ? (
                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-xs text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                  {userProfile?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              ) : (
                <Icon size={22} className={label === 'Log In' ? 'ml-0.5' : ''} />
              )}
            </div>
            <span className={clsx("text-[10px] truncate max-w-[64px]", label === 'Log In' ? "font-bold" : "font-medium")}>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
