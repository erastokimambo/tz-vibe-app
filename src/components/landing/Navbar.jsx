import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 transition-all duration-300 bg-white/80 dark:bg-[#38000A]/80 backdrop-blur-md border-b border-gray-200 dark:border-[#4a0d13]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#CD1C18] to-[#9B1313] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#CD1C18]/30">
              Tv
            </div>
            <span className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
              TzVibe.
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-[#CD1C18] dark:hover:text-[#FFA896] font-medium transition-colors">Features</a>
            <a href="#how-it-works" className="text-gray-600 dark:text-gray-300 hover:text-[#CD1C18] dark:hover:text-[#FFA896] font-medium transition-colors">How it Works</a>
            <a href="#business" className="text-gray-600 dark:text-gray-300 hover:text-[#CD1C18] dark:hover:text-[#FFA896] font-medium transition-colors">For Business</a>
            <a href="/login" className="bg-[#CD1C18] hover:bg-[#9B1313] text-white px-6 py-2.5 rounded-full font-bold transition-all hover:scale-105 shadow-lg shadow-[#CD1C18]/30 inline-block">
              Launch App
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 dark:text-gray-300 hover:text-[#CD1C18] focus:outline-none p-2"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-[#38000A] border-b border-gray-200 dark:border-gray-800">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <a href="#features" className="block px-3 py-3 text-lg font-medium text-gray-900 dark:text-white hover:text-[#CD1C18] dark:hover:text-[#FFA896]">Features</a>
            <a href="#how-it-works" className="block px-3 py-3 text-lg font-medium text-gray-900 dark:text-white hover:text-[#CD1C18] dark:hover:text-[#FFA896]">How it Works</a>
            <a href="#business" className="block px-3 py-3 text-lg font-medium text-gray-900 dark:text-white hover:text-[#CD1C18] dark:hover:text-[#FFA896]">For Business</a>
            <div className="pt-4">
              <a href="/app/" className="block text-center w-full bg-[#CD1C18] text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg">
                Launch App
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
