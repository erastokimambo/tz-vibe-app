import { Outlet } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import { useState, useEffect } from 'react';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#38000A] text-black dark:text-white transition-colors duration-200 pb-16">
      {/* Top utility for dark mode toggle (can be moved to Menu later) */}
      <button 
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-2 right-2 z-50 p-2 bg-gray-100 dark:bg-gray-800 rounded-full shadow"
      >
        {darkMode ? '☀️' : '🌙'}
      </button>

      <main className="max-w-md mx-auto w-full relative min-h-screen">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}

export default App;
