import { Outlet } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import TopNav from './components/TopNav';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-screen font-sans selection:bg-[#CD1C18] selection:text-white dark pb-16 md:pb-0 md:bg-gray-50 dark:md:bg-[#2A0007]">
      <TopNav />
      {/* 
        On mobile: max-w-md, centered.
        On desktop: pb-0, pt-[104px] (to clear header), centered
      */}
      <main className="max-w-md md:max-w-6xl mx-auto w-full relative min-h-screen md:pt-[104px] md:pb-6 md:px-6">
         <div className="md:bg-white dark:md:bg-[#38000A] md:rounded-3xl md:min-h-[calc(100vh-128px)] md:shadow-2xl md:overflow-hidden md:border dark:md:border-[#5e1a20] relative">
            <Outlet />
         </div>
      </main>

      <BottomNav />
    </div>
  );
}

export default App;
