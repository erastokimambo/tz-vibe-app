import { Search, MapPin, Flame, MessageCircle } from 'lucide-react';

const features = [
  {
    icon: Search,
    title: "Visual Explore Feed",
    description: "Browse curated, high-quality visuals of the best venues and DJs. Filter natively by categories and instantly see what's happening via real-time event badges.",
    color: "bg-blue-500",
    delay: 0
  },
  {
    icon: MapPin,
    title: "Live Glowing Map",
    description: "Discover the nightlife around you through our custom interactive map. Watch venues pulse like beacons—Red for Clubs, Peach for DJs.",
    color: "bg-[#CD1C18]",
    delay: 0.1
  },
  {
    icon: Flame,
    title: "Trending Rankings",
    description: "Never miss out on the hottest spots. Our proprietary trending score ranks venues based on real-time RSVP velocity and saves.",
    color: "bg-orange-500",
    delay: 0.2
  },
  {
    icon: MessageCircle,
    title: "Direct Messaging",
    description: "Connect instantly with business owners. Book tables or confirm VIP access through an integrated, fast WhatsApp-style inbox.",
    color: "bg-green-500",
    delay: 0.3
  }
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-gray-50 dark:bg-[#1a0005]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-[#CD1C18] dark:text-[#FFA896] font-bold tracking-wide uppercase text-sm mb-3">Redefining Discovery</h2>
          <h3 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">
            Everything you need for the perfect night out.
          </h3>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            TzVibe brings the entire entertainment ecosystem to your fingertips with tools designed specifically for connection and experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: feature.delay }}
              className="bg-white dark:bg-[#38000A] rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-[#4a0d13] hover:shadow-xl transition-shadow relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform translate-x-4 -translate-y-4">
                <feature.icon size={100} className="text-gray-900 dark:text-white" />
              </div>
              
              <div className={`w-14 h-14 rounded-2xl ${feature.color} text-white flex items-center justify-center mb-6 shadow-lg`}>
                <feature.icon size={28} />
              </div>
              
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {feature.title}
              </h4>
              
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
