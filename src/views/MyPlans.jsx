import { ArrowLeft, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyPlans() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#38000A]">
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-[#38000A]/90 backdrop-blur-lg px-4 pt-12 pb-4 border-b dark:border-gray-800 flex items-center gap-3">
        <Link to="/app/menu" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-gray-900 dark:text-white" />
        </Link>
        <h1 className="text-xl font-bold text-[#CD1C18] dark:text-[#FFA896]">My Plans</h1>
      </div>

      <div className="p-4 flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
          <Calendar size={32} className="text-[#CD1C18] dark:text-[#FFA896]" />
        </div>
        <h3 className="text-xl font-bold dark:text-white mb-2">No Plans Yet</h3>
        <p className="text-gray-500 max-w-xs mx-auto">
          RSVP to an event or book a table to see your upcoming plans here.
        </p>
      </div>
    </div>
  );
}
