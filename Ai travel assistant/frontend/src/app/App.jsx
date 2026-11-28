import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function App() {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  // Smooth scrolling initialization via Lenis
  useEffect(() => {
    // Respect user's motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let lenis;
    try {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
      });

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }

      const rafId = requestAnimationFrame(raf);

      return () => {
        cancelAnimationFrame(rafId);
        lenis?.destroy();
      };
    } catch (_err) {
      // Fallback to standard native scrolling if Lenis fails
    }
  }, []);

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-[#0B100D] text-[#F1F3ED] font-sans selection:bg-[#315B40] selection:text-[#F1F3ED] overflow-x-hidden">
        {/* Single Unified Dark Luxury Glass Topbar */}
        <Navbar />

        {/* Main Page Outlet */}
        <div className="flex-1">
          <Outlet />
        </div>

        {/* Global Luxury Footer */}
        <Footer />
      </div>
    </AuthProvider>
  );
}
