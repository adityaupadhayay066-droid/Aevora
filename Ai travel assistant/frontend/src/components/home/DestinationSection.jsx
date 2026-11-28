import React from 'react';
import { ArrowUpRight, MapPin, Compass, Mountain, Trees, Waves, Landmark } from 'lucide-react';
import Container from '../ui/Container';
import GlassCard from '../ui/GlassCard';

export default function DestinationSection() {
  const destinations = [
    {
      id: 'kashmir',
      category: 'Mountain Retreat',
      icon: Mountain,
      title: 'Kashmir & Zanskar Valley',
      region: 'Western Himalayas',
      description: 'Pristine alpine lakes, snow-capped ridges, and cedar valleys with high-altitude rail connectivity.',
      bestTime: 'May – Oct',
      image: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80',
      featured: true,
    },
    {
      id: 'wayanad',
      category: 'Forest Escape',
      icon: Trees,
      title: 'Wayanad Rainforests',
      region: 'Western Ghats',
      description: 'Mist-shrouded evergreen canopies, spice plantations, and protected biosphere corridors.',
      bestTime: 'Sep – Mar',
      image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
      featured: false,
    },
    {
      id: 'goa',
      category: 'Coastal Journey',
      icon: Waves,
      title: 'Gokarna & Konkan Coast',
      region: 'Arabian Coastline',
      description: 'Dramatic coastal cliffs, secluded beaches, and scenic railway crossings along the Konkan route.',
      bestTime: 'Nov – Feb',
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
      featured: false,
    },
    {
      id: 'udaipur',
      category: 'Cultural Destination',
      icon: Landmark,
      title: 'Udaipur & Royal Mewar',
      region: 'Rajasthan',
      description: 'Centuries of Rajput architectural mastery, royal lake palaces, and historic mountain passes.',
      bestTime: 'Oct – Mar',
      image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
      featured: false,
    },
  ];

  return (
    <section id="destinations-section" className="py-24 sm:py-32 bg-[#0B100D] relative">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#17221A] border border-white/10 text-xs font-semibold text-[#91B39A] uppercase tracking-wider mb-4">
              <Compass className="w-3.5 h-3.5 text-[#C4A77D]" />
              <span>Curated Escapes</span>
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-5xl text-[#F1F3ED] tracking-tight leading-tight">
              Find your <span className="font-editorial italic font-normal text-[#C4A77D]">next escape</span>.
            </h2>
            <p className="text-[#A6B1A7] text-base sm:text-lg mt-3 font-light">
              From quiet mountain retreats to extraordinary coastal destinations.
            </p>
          </div>
          <div className="text-xs text-[#6F8D76] font-mono">
            DISCOVERY INDEX • 04 SANCTUARIES
          </div>
        </div>

        {/* Asymmetric Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {destinations.map((dest, idx) => {
            const Icon = dest.icon;
            const colSpan = dest.featured ? 'md:col-span-8' : 'md:col-span-4';

            return (
              <div 
                key={dest.id}
                className={`${colSpan} group relative rounded-3xl overflow-hidden glass-card border border-white/10 hover:border-[#91B39A]/30 transition-all duration-500 min-h-[380px] sm:min-h-[440px] flex flex-col justify-end p-6 sm:p-8 cursor-pointer`}
              >
                {/* Background Photography with Zoom Hover */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                  style={{ backgroundImage: `url('${dest.image}')` }}
                />

                {/* Dark Contrast Gradient Overlay */}
                <div 
                  className="absolute inset-0 bg-gradient-to-t from-[#0B100D] via-[#0B100D]/60 to-transparent opacity-90 group-hover:opacity-80 transition-opacity"
                />

                {/* Card Content */}
                <div className="relative z-10 flex flex-col">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between mb-auto pb-24 sm:pb-32">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111A14]/80 backdrop-blur-md border border-white/10 text-xs text-[#91B39A] font-medium">
                      <Icon className="w-3.5 h-3.5 text-[#C4A77D]" />
                      <span>{dest.category}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Location & Title */}
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#C4A77D] mb-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{dest.region}</span>
                  </div>
                  <h3 className="font-display font-bold text-2xl sm:text-3xl text-[#F1F3ED] mb-2 group-hover:text-white transition-colors">
                    {dest.title}
                  </h3>
                  <p className="text-sm text-[#A6B1A7] font-light leading-relaxed line-clamp-2 mb-4">
                    {dest.description}
                  </p>

                  {/* Best Season */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#91B39A]">
                    <span>Optimal Season</span>
                    <span className="font-mono text-[#F1F3ED]">{dest.bestTime}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
