import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function CTA() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      // Mock API call
      setTimeout(() => setSubmitted(true), 500);
    }
  };

  return (
    <section className="relative py-32 bg-[#CD1C18] dark:bg-[#38000A] overflow-hidden">
      {/* Background visual flair */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1574096079513-d8259312b785?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Ready to elevate your nights?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join thousands of others in Dar es Salaam who are already on the waitlist. Get early access and exclusive VIP perks when we launch.
          </p>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 justify-center max-w-xl mx-auto">
              <input 
                type="email" 
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white/10 dark:bg-black/20 backdrop-blur-md text-white placeholder-white/50 border border-white/20 rounded-xl px-6 py-4 outline-none focus:ring-2 focus:ring-white transition"
              />
              <button 
                type="submit"
                className="flex items-center justify-center gap-2 bg-white text-[#CD1C18] dark:bg-[#FFA896] dark:text-[#38000A] px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-all shadow-xl"
              >
                Join Waitlist <ArrowRight size={20} />
              </button>
            </form>
          ) : (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center justify-center gap-3 bg-white/20 backdrop-blur-md text-white p-6 rounded-2xl max-w-md mx-auto border border-white/30"
            >
              <CheckCircle2 size={32} className="text-[#FFA896]" />
              <div className="text-left">
                <h3 className="font-bold text-lg">You're on the list!</h3>
                <p className="text-white/80 text-sm">Keep an eye on your inbox for updates.</p>
              </div>
            </motion.div>
          )}

          <div className="mt-12 flex items-center justify-center gap-8 text-white/60 text-sm font-semibold">
            <div className="flex items-center gap-2"><CheckCircle2 size={16} /> Free forever</div>
            <div className="flex items-center gap-2"><CheckCircle2 size={16} /> No spam</div>
            <div className="flex items-center gap-2"><CheckCircle2 size={16} /> VIP access</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
