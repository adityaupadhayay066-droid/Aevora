import React from 'react';
import { Compass, Sparkles, ArrowRight } from 'lucide-react';
import Container from '../ui/Container';
import Destination3DTiltCard from './Destination3DTiltCard';

export default function DestinationSection({ onSelectDestination }) {
  const destinations = [
    {
      id: 'himalayas',
      title: 'Himalayan Sanctuaries',
      region: 'Himachal & Kashmir',
      tagline: 'High Altitude Alpine',
      description: 'Majestic cedar valleys, snow-draped passes, and high-altitude rail connections via Kalka-Shimla.',
      startingRoute: 'Delhi ➔ Shimla',
      startingFare: '₹840',
      image: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'kyoto',
      title: 'Kyoto Bamboo Trails',
      region: 'Kansai, Japan',
      tagline: 'Ancient Heritage',
      description: 'Centuries-old Zen temples, Arashiyama cedar groves, and seamless Shinkansen rail velocity.',
      startingRoute: 'Tokyo ➔ Kyoto',
      startingFare: '₹4,890',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'swiss-alps',
      title: 'Swiss Alpine Passes',
      region: 'Valais, Switzerland',
      tagline: 'Glacier Express Corridor',
      description: 'Panoramic mountain rail routes traversing dramatic viaducts, pine gorges, and glacial peaks.',
      startingRoute: 'Zürich ➔ Zermatt',
      startingFare: '₹5,200',
      image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'kerala',
      title: 'Kerala Backwaters',
      region: 'Vembanad & Alleppey',
      tagline: 'Emerald Waterways',
      description: 'Tranquil palm-lined canal labyrinths, Kochi water metro lines, and heritage wooden houseboats.',
      startingRoute: 'Ernakulam ➔ Alleppey',
      startingFare: '₹220',
      image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'ladakh',
      title: 'Ladakh Moonscapes',
      region: 'Trans-Himalayan Plateau',
      tagline: 'Pangong Tso & Khardung',
      description: 'Cold-desert mountain passes, azure glacial lakes, and Buddhist monastery promontories.',
      startingRoute: 'Manali ➔ Leh',
      startingFare: '₹1,450',
      image: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  return (
    <section id="destinations-section" className="py-24 sm:py-32 bg-[#0B100D] relative">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#17221A] border border-white/10 text-xs font-semibold text-[#91B39A] uppercase tracking-wider mb-4">
              <Compass className="w-3.5 h-3.5 text-[#C4A77D]" />
              <span>Spatial Escapes</span>
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-5xl text-[#F1F3ED] tracking-tight leading-tight">
              Curated destinations, <span className="font-editorial italic font-normal text-[#C4A77D]">reimagined</span>.
            </h2>
            <p className="text-[#A6B1A7] text-base sm:text-lg mt-3 font-light">
              Explore extraordinary destinations with authentic transit routes and verified fare indicators.
            </p>
          </div>
          <div className="text-xs text-[#6F8D76] font-mono">
            3D PERSPECTIVE CAROUSEL • 05 SANCTUARIES
          </div>
        </div>

        {/* 3D Tilt Cards Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest) => (
            <Destination3DTiltCard
              key={dest.id}
              destination={dest}
              onSelect={onSelectDestination}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
