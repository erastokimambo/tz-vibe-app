import { Search, MapPin, Flame, MessageCircle, Menu } from 'lucide-react';
import clsx from 'clsx';
import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Explore', icon: Search },
  { path: '/map', label: 'Map', icon: MapPin },
  { path: '/trending', label: 'Trending', icon: Flame },
  { path: '/messages', label: 'Messages', icon: MessageCircle },
  { path: '/menu', label: 'Menu', icon: Menu },
];

export default function BottomNav() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#4a0d13] border-t dark:border-gray-800 pb-safe">
      <nav className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              clsx(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-[#CD1C18]" : "text-gray-500 dark:text-gray-400 hover:text-[#9B1313] dark:hover:text-gray-200"
              )
            }
          >
            <Icon size={24} />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
