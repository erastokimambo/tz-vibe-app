import { User, Heart, Calendar, PlusSquare, Settings, LogOut, ShieldCheck, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UserMenu() {
  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
  };

  const menuGroups = [
    {
      title: "My Activity",
      items: [
        { icon: Calendar, label: "My Plans", bg: "bg-blue-500", link: null },
        { icon: Heart, label: "Saved Listings", bg: "bg-pink-500", link: null },
      ]
    },
    {
      title: "Business",
      items: [
        { icon: PlusSquare, label: "Record Data / List Business", bg: "bg-green-500", link: "/list-business" },
        { icon: Settings, label: "Manage Listings", bg: "bg-gray-600", link: null },
      ]
    },
    {
      title: "Settings & Admin",
      items: [
        { icon: ShieldCheck, label: "Admin Panel", bg: "bg-purple-600", link: null },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#38000A] p-4 pt-12 pb-24">
      <h1 className="text-3xl font-bold mb-6 text-[#CD1C18] dark:text-[#FFA896]">Menu</h1>

      {/* Profile Card */}
      <div className="bg-white dark:bg-[#4a0d13] rounded-2xl p-4 shadow-sm mb-6 flex items-center justify-between border dark:border-gray-800">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <User size={32} className="text-gray-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Anonymous Guest</h2>
            <p className="text-sm text-[#CD1C18] dark:text-[#FFA896] font-medium cursor-pointer">Edit Profile</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#4a0d13] rounded-2xl shadow-sm border dark:border-gray-800 overflow-hidden mb-6">
        <div 
          onClick={toggleTheme}
          className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
        >
          <div className={`p-2 rounded-xl text-white bg-yellow-500 dark:bg-indigo-500`}>
            <span className="dark:hidden"><Sun size={20} /></span>
            <span className="hidden dark:inline"><Moon size={20} /></span>
          </div>
          <span className="font-semibold flex-1">Toggle Dark Mode</span>
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

      {/* Log out */}
      <div className="mt-8 px-2">
        <button className="flex items-center justify-center gap-2 w-full py-4 text-[#CD1C18] font-bold bg-[#CD1C18]/10 rounded-2xl hover:bg-[#CD1C18]/20 transition-colors">
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
