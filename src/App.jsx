import { Outlet } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import TopNav from './components/TopNav';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-screen font-sans selection:bg-[#CD1C18] selection:text-white dark pb-16 md:pb-0 bg-white dark:bg-[#38000A]">
      <TopNav />
      {/* 
        On mobile: pb-16 to clear bottom nav
        On desktop: w-full, pt-20 to clear fixed TopNav
      */}
      <main className="w-full relative min-h-screen md:pt-20">
         <div className="w-full h-full relative">
            <Outlet />
         </div>
      </main>

      <BottomNav />
    </div>
  );
}

export default App;
