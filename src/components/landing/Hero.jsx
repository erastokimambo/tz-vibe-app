import { motion } from 'framer-motion';
import { Apple, Play, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-white dark:bg-[#38000A]">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-[#CD1C18]/10 to-transparent dark:from-[#CD1C18]/20 dark:to-transparent blur-3xl -z-10" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#FFA896] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob -z-10 dark:opacity-20" />
      <div className="absolute top-20 -right-20 w-72 h-72 bg-[#CD1C18] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 -z-10 dark:opacity-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left z-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#CD1C18]/10 text-[#CD1C18] dark:text-[#FFA896] font-semibold mb-6">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#CD1C18] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#CD1C18]"></span>
              </span>
              Now rolling out in Dar es Salaam
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 dark:text-white mb-6 leading-[1.1]">
              Find your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#CD1C18] to-[#FFA896]">perfect vibe.</span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              TzVibe is the premier visual directory for discovering the best DJs, exclusive bars, and luxury venues across Tanzania. See who's playing, book a table, and ride there instantly.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-6">
              <Link to="/login" className="flex items-center justify-center gap-2 bg-[#CD1C18] hover:bg-[#9B1313] text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-xl shadow-[#CD1C18]/30">
                <Compass size={24} className="mb-1" />
                Launch Web App
              </Link>
            </div>
            
            <p className="mt-6 text-sm text-gray-500 font-medium">Over 5,000+ early access signups entirely across TZ.</p>
          </motion.div>

          {/* App Mockup Graphic */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: -2 }}
            transition={{ duration: 1, delay: 0.2, type: "spring" }}
            className="relative mx-auto w-full max-w-[320px] lg:max-w-md z-10"
          >
            {/* Pseudo Phone frame */}
            <div className="relative rounded-[3rem] border-8 border-gray-900 dark:border-gray-800 bg-gray-900 dark:bg-[#4a0d13] shadow-2xl overflow-hidden aspect-[9/19]">
              {/* Dynamic Island Notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-full z-20" />
              
              {/* Fake App Screen Image (Placeholder until actual is added) */}
              <img 
                src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000&auto=format&fit=crop" 
                alt="TzVibe App Screen" 
                className="w-full h-full object-cover opacity-90"
              />
              
              {/* Overlay elements simulating the app UI */}
              <div className="absolute bottom-10 left-4 right-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <div className="flex justify-between items-center text-white mb-2">
                  <span className="font-bold text-lg">Elements Club</span>
                  <span className="text-xs bg-[#CD1C18] px-2 py-1 rounded-full font-bold">4.8 ★</span>
                </div>
                <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden mt-3">
                  <div className="h-full bg-gradient-to-r from-[#FFA896] to-[#CD1C18] w-3/4" />
                </div>
              </div>
            </div>
            
            {/* Floating UI Elements */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-8 top-32 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold">DJ</div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">DJ Spinny</p>
                <p className="text-xs text-gray-500">Playing next Friday</p>
              </div>
            </motion.div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
