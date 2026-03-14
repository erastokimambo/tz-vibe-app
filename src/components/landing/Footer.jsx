import { Twitter, Instagram, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-[#1a0005] py-16 border-t border-gray-200 dark:border-[#38000A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#CD1C18] to-[#9B1313] flex items-center justify-center text-white font-bold shadow-md">
                Tv
              </div>
              <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
                TzVibe.
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6 leading-relaxed">
              The premier mobile-first visual directory for discovering the best vibes, DJs, bars, and venues across Tanzania.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white dark:bg-[#38000A] border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-[#CD1C18] dark:hover:text-[#FFA896] hover:border-[#CD1C18] transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white dark:bg-[#38000A] border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-[#CD1C18] dark:hover:text-[#FFA896] hover:border-[#CD1C18] transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white dark:bg-[#38000A] border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-[#CD1C18] dark:hover:text-[#FFA896] hover:border-[#CD1C18] transition-colors">
                <MapPin size={18} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-6 uppercase text-sm tracking-wider">Product</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-[#CD1C18] dark:hover:text-[#FFA896] transition-colors">Features</a></li>
              <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-[#CD1C18] dark:hover:text-[#FFA896] transition-colors">Waitlist</a></li>
              <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-[#CD1C18] dark:hover:text-[#FFA896] transition-colors">For Business</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-6 uppercase text-sm tracking-wider">Legal</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-[#CD1C18] dark:hover:text-[#FFA896] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-[#CD1C18] dark:hover:text-[#FFA896] transition-colors">Terms of Service</a></li>
            </ul>
          </div>
          
        </div>
        
        <div className="border-t border-gray-200 dark:border-[#38000A] mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            © {new Date().getFullYear()} TzVibe Group. All rights reserved.
          </p>
          <div className="flex gap-4">
            <span className="text-sm font-semibold text-gray-400">Dar es Salaam, TZ</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
