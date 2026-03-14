export const mockBusinesses = [
  {
    id: '1',
    name: 'Elements Club',
    category: 'Bars & Clubs',
    location: 'Masaki, Dar es Salaam',
    image: 'https://images.unsplash.com/photo-1574096079513-d8259312b785?q=80&w=2000&auto=format&fit=crop',
    rating: 4.8,
    isVerified: true,
    hasEvents: true,
    phone: '+255700000000',
    menuUrl: 'https://example.com/menu',
    trendingScore: 98,
    description: 'The premier nightlife destination in Dar es Salaam. Experience the best DJs, premium drinks, and an unforgettable vibe.',
    events: [
      { name: 'Afrobeat Fridays', date: 'This Friday, 10 PM' },
      { name: 'Amapiano Sundays', date: 'This Sunday, 8 PM' }
    ]
  },
  {
    id: '2',
    name: 'Johari Rotana Venues',
    category: 'Wedding Venues',
    location: 'City Center, Dar es Salaam',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2000&auto=format&fit=crop',
    rating: 4.9,
    isVerified: true,
    hasEvents: false,
    phone: '+255700000001',
    trendingScore: 85,
    description: 'Luxury hall and outdoor venues for your perfect wedding. Let our team of experts handle your special day.',
    events: []
  },
  {
    id: '3',
    name: 'DJ Spinny',
    category: 'DJs',
    location: 'Dar es Salaam (Mobile)',
    image: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?q=80&w=2000&auto=format&fit=crop',
    rating: 4.7,
    isVerified: false,
    hasEvents: true,
    phone: '+255700000002',
    trendingScore: 92,
    description: 'Versatile DJ specializing in Amapiano, Bongo Flava, and Afrobeats for weddings and private parties.',
    events: [
      { name: 'Elements Guest Set', date: 'Next Friday, 12 AM' }
    ]
  }
];
