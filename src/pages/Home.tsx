/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, MessageSquare, Phone, ChevronDown, ChevronLeft, ChevronRight, Star, Sparkles, 
  MapPin, Shield, Check, Fuel, User, Gauge, CircleDot, Zap, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, subscribeToRealtime } from '../lib/supabase';
import { Car, Review } from '../types';
import { CarCardSkeleton } from '../components/Skeleton';
import { toast } from '../components/Toast';
import { getWhatsAppLink, getGoogleMapsLink, getPhoneLink, getAppLink, isMobileUser } from '../lib/deepLink';
import Logo from '../components/Logo';
import BackgroundVideo from '../components/BackgroundVideo';

export default function Home() {
  const navigate = useNavigate();
  const [isDriveAnimating, setIsDriveAnimating] = useState(false);
  const [smokeParticles, setSmokeParticles] = useState<{ id: number; x: number; y: number; scale: number; opacity: number; driftX: number; driftY: number }[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [carsLoaded, setCarsLoaded] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [appBannerOpen, setAppBannerOpen] = useState(true);

  const [isReviewsHovered, setIsReviewsHovered] = useState(false);
  const reviewsScrollRef = useRef<HTMLDivElement>(null);
  const [processedTharSrc, setProcessedTharSrc] = useState("/thar_orange_transparent_1780859149893.png");

  // Dynamic client-side transparency processing to clean up absolute white background squares
  useEffect(() => {
    const rawSrc = "/thar_orange_transparent_1780859149893.png";
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = rawSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        // Sweep all absolute near-white boundary pixels and paint them completely transparent
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Solid white threshold check
          if (r > 240 && g > 240 && b > 240) {
            data[i + 3] = 0; // Alpha
          }
        }
        ctx.putImageData(imgData, 0, 0);
        setProcessedTharSrc(canvas.toDataURL());
      }
    };
  }, []);

  // Moving drive launch with trailing tire smoke simulation
  useEffect(() => {
    if (!isDriveAnimating) return;

    let particleId = 0;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      
      // Calculate current car position as it accelerates to the right side (takes off after 250ms)
      let carPercentX = 0;
      if (elapsed > 250) {
        const progress = Math.min((elapsed - 250) / 1250, 1);
        // Exponential-like acceleration for a realistic "peeling out" launch!
        carPercentX = Math.pow(progress, 1.8) * 160;
      }

      // Emitter is located at the rear wheels/exhaust of the car.
      // Initially, the rear wheel is at roughly 22% of the container width. 
      // As the car moves to the right, the emitter moves coordinate-wise with it.
      const emitterX = 22 + carPercentX;

      // Add smoke particles with backward drift
      setSmokeParticles(prev => [
        ...prev,
        {
          id: particleId++,
          x: emitterX + (Math.random() - 0.5) * 3, // local scatter
          y: 75 + (Math.random() - 0.5) * 10, // exhaust height alignment
          scale: Math.random() * 0.9 + 0.6,
          driftX: -3.5 - Math.random() * 3.5, // dynamic backward drift
          driftY: -1.2 + Math.random() * 2.4, // smoke dispersal
          opacity: Math.random() * 0.55 + 0.45,
        }
      ]);
    }, 20);

    // Coordinate the full transition & redirection to /cars
    const timer = setTimeout(() => {
      clearInterval(interval);
      navigate('/cars');
    }, 1500);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [isDriveAnimating, navigate]);

  // Auto-scroll loop for customer reviews carousel
  useEffect(() => {
    const container = reviewsScrollRef.current;
    if (!container || reviews.length === 0 || isReviewsHovered) return;

    let frameId: number;
    let lastTime = performance.now();

    const step = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;
      
      // Extremely smooth subgradient-based panning speed
      container.scrollLeft += delta * 0.04; 

      // Loop content seamlessly by checking if scrollLeft is near half of the scrollWidth
      if (container.scrollLeft >= container.scrollWidth / 2) {
        container.scrollLeft = 0;
      }

      frameId = requestAnimationFrame(step);
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [reviews, isReviewsHovered]);

  const handleScrollPrev = () => {
    const container = reviewsScrollRef.current;
    if (container) {
      // Temporarily pause auto-scroll behavior for fine control
      setIsReviewsHovered(true);
      container.scrollBy({ left: -360, behavior: 'smooth' });
      setTimeout(() => setIsReviewsHovered(false), 3000);
    }
  };

  const handleScrollNext = () => {
    const container = reviewsScrollRef.current;
    if (container) {
      setIsReviewsHovered(true);
      container.scrollBy({ left: 360, behavior: 'smooth' });
      setTimeout(() => setIsReviewsHovered(false), 3000);
    }
  };

  // Live Stats calculations
  const [liveStats, setLiveStats] = useState({
    avgDailyPrice: '0',
    popularCar: 'Thar Convertible',
    cheapestHourly: '0',
    avgRating: '4.9'
  });

  const loadAllData = async () => {
    try {
      // 1. Fetch site settings
      const siteSg = await db.getSiteSettings();
      setSettings(siteSg);

      // 2. Fetch featured available cars
      const allCars = await db.getCars(true);
      const featured = allCars
        .filter(c => c.is_featured && c.status === 'available')
        .slice(0, 6);
      setFeaturedCars(featured);
      setCarsLoaded(true);

      // 3. Fetch approved reviews
      const approvedReviews = await db.getReviews(true);
      setReviews(approvedReviews);

      // 4. Calculate Live stats mathematically
      const availableCars = allCars.filter(c => c.status === 'available');
      if (availableCars.length > 0) {
        const sumDaily = availableCars.reduce((acc, c) => acc + Number(c.price_per_day), 0);
        const avgDaily = Math.round(sumDaily / availableCars.length);
        
        const minHourly = Math.round(Math.min(...availableCars.map(c => Number(c.price_per_hour))));
        
        // Find most booked or rated car in database state
        const popular = allCars.sort((a,b) => b.total_trips - a.total_trips)[0]?.name || 'Thar LX Convertible';
        
        // Avg reviews
        const sumRating = approvedReviews.reduce((acc, r) => acc + r.rating, 0);
        const avgRev = approvedReviews.length > 0 
          ? (sumRating / approvedReviews.length).toFixed(2)
          : '4.9';

        setLiveStats({
          avgDailyPrice: avgDaily.toLocaleString('en-IN'),
          cheapestHourly: minHourly.toString(),
          popularCar: popular,
          avgRating: avgRev
        });
      }
    } catch (err) {
      console.error("Home loading error", err);
    }
  };

  useEffect(() => {
    loadAllData();

    // Setup realtime subscription mimicking so changes reflect within 2 seconds
    const unsubCars = subscribeToRealtime('cars', loadAllData);
    const unsubSettings = subscribeToRealtime('settings', loadAllData);
    const unsubReviews = subscribeToRealtime('reviews', loadAllData);

    return () => {
      unsubCars();
      unsubSettings();
      unsubReviews();
    };
  }, []);

  const toggleFaq = (index: number) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  // Site Settings placeholders
  const phone = settings.phone || '+91-8960695050';
  const whatsappKey = settings.whatsapp || '918960695050';
  const waLink = getWhatsAppLink(whatsappKey, 'Hello Drive-Eaze! I am contacting you on your mobile platform to ask about premium self-drive car rentals.');
  const tagline = settings.hero_tagline || 'Drive Smart. Pay Less.';
  const subtitle = settings.hero_subtitle || 'Premium self-drive rentals in Lucknow. Hourly, daily, weekly, monthly.';
  
  const startingHourly = settings.price_hourly_start || '99';
  const startingDaily = settings.price_daily_start || '1499';
  const startingWeekly = settings.price_weekly_start || '8999';
  const startingMonthly = settings.price_monthly_start || '29999';

  return (
    <div className="bg-[#070c0e] relative" id="homepage-container">
      
      {/* ────────────────────────────────────────────────────────────────── */}
      {/* [HERO SECTION]                                                    */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden border-b border-[#132125]" id="section-hero">
        
        {/* Play smoothly in the background, adjusted correctly */}
        <BackgroundVideo />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Centered Large Circular Logo Badge */}
          <div className="flex justify-center mb-8 transform scale-95 sm:scale-100 hover:scale-[1.02] transition-transform duration-500">
            <Logo size={160} variant="badge" />
          </div>

          <p className="font-mono text-xs text-[#8da4a8] tracking-widest uppercase mb-6 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00dfc1] inline-block animate-ping" />
            Est. 2024 / Self-Drive Rentals / Lucknow
          </p>

          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-none mb-8">
            <div className="text-white">Drive the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00dfc1] via-[#e6fffc] to-[#008b81]">{tagline.split('.')[0] || 'Difference'}</span>.</div>
            <div className="text-white/80 text-2xl sm:text-4xl lg:text-5xl font-extrabold mt-2">Pay by the hour, day, or week.</div>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#737373] mb-12 font-sans font-light">
            {subtitle}
          </p>

          {/* Call to Actions with high-performance responsive motion */}
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            <Link 
              to="/cars" 
              className="w-full sm:w-auto px-8 py-4 bg-[#00dfc1] hover:bg-[#00bfa5] text-black font-display font-black text-xs uppercase tracking-wider rounded-lg transition-all active:scale-95 text-center cursor-pointer shadow-lg shadow-[#00dfc1]/15 flex items-center justify-center gap-2"
              id="hero-cta-book"
            >
              Book a Car <ArrowRight size={14} className="animate-[pulse_1.5s_infinite]" />
            </Link>
            
            <a 
              href={waLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full sm:w-auto px-8 py-4 bg-[#0c1518]/80 hover:bg-[#132125] border border-[#132125] hover:border-[#00dfc1]/30 text-white font-display font-bold text-xs uppercase tracking-wider rounded-lg transition-all active:scale-95 text-center flex items-center justify-center gap-2"
              id="hero-cta-whatsapp"
            >
              <MessageSquare size={14} className="text-[#00dfc1]" /> WhatsApp Us
            </a>

            {/* High-end Replay Intro Trigger */}
            <button
              onClick={() => {
                sessionStorage.removeItem('drive_eaze_intro_played');
                window.location.reload();
              }}
              className="w-full sm:w-auto px-6 py-4 bg-[#0c1518]/40 hover:bg-[#132125] border border-[#132125] hover:border-[#00dfc1]/30 text-[#8da4a8] hover:text-white font-mono text-[10px] uppercase tracking-wider rounded-lg transition-all active:scale-95 text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap size={11} className="text-[#00dfc1]" /> Replay Thar 3D Intro
            </button>
          </motion.div>

          {/* Pricing Stat Pills with dynamic tilt physics mimicking shock-absorbers */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl mx-auto" id="hero-pricing-stats">
            <motion.div 
              whileHover={{ y: -6, rotateZ: -0.6, scale: 1.02, boxShadow: "0px 10px 30px rgba(0, 223, 193, 0.15)" }}
              className="bg-[#0c1518]/95 backdrop-blur-md border border-[#132125] hover:border-[#00dfc1]/30 px-4 py-4 rounded-lg flex flex-col justify-center items-center transition-all duration-350 cursor-pointer group"
            >
              <span className="font-mono text-[9px] text-[#8da4a8] uppercase tracking-widest">Hourly Tier</span>
              <span className="font-display font-black text-[#00dfc1] group-hover:text-white text-lg mt-0.5 transition-colors">₹{startingHourly}<span className="text-xs text-[#8da4a8] font-normal">/hr</span></span>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -6, rotateZ: 0.6, scale: 1.02, boxShadow: "0px 10px 30px rgba(0, 223, 193, 0.15)" }}
              className="bg-[#0c1518]/95 backdrop-blur-md border border-[#132125] hover:border-[#00dfc1]/30 px-4 py-4 rounded-lg flex flex-col justify-center items-center transition-all duration-350 cursor-pointer group"
            >
              <span className="font-mono text-[9px] text-[#8da4a8] uppercase tracking-widest">Daily Tier</span>
              <span className="font-display font-black text-[#00dfc1] group-hover:text-white text-lg mt-0.5 transition-colors">₹{startingDaily}<span className="text-xs text-[#8da4a8] font-normal">/day</span></span>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -6, rotateZ: -0.6, scale: 1.02, boxShadow: "0px 10px 30px rgba(0, 223, 193, 0.15)" }}
              className="bg-[#0c1518]/95 backdrop-blur-md border border-[#132125] hover:border-[#00dfc1]/30 px-4 py-4 rounded-lg flex flex-col justify-center items-center transition-all duration-350 cursor-pointer group"
            >
              <span className="font-mono text-[9px] text-[#8da4a8] uppercase tracking-widest">Weekly Tier</span>
              <span className="font-display font-black text-[#00dfc1] group-hover:text-white text-lg mt-0.5 transition-colors">₹{startingWeekly}<span className="text-xs text-[#8da4a8] font-normal">/wk</span></span>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -6, rotateZ: 0.6, scale: 1.02, boxShadow: "0px 10px 30px rgba(0, 223, 193, 0.15)" }}
              className="bg-[#0c1518]/95 backdrop-blur-md border border-[#132125] hover:border-[#00dfc1]/30 px-4 py-4 rounded-lg flex flex-col justify-center items-center transition-all duration-350 cursor-pointer group"
            >
              <span className="font-mono text-[9px] text-[#8da4a8] uppercase tracking-widest">Monthly Tier</span>
              <span className="font-display font-black text-[#00dfc1] group-hover:text-white text-lg mt-0.5 transition-colors">₹{parseFloat(startingMonthly).toLocaleString('en-IN')}<span className="text-xs text-[#8da4a8] font-normal">/mo</span></span>
            </motion.div>
          </div>

        </div>

        {/* Brand infinite marquee ticker styled with luxury muted cyan borders */}
        <div className="mt-20 border-t border-b border-[#132125] py-5 bg-[#04080a]" id="hero-marquee">
          <div className="relative w-full overflow-hidden whitespace-nowrap mb-3.5">
            <div className="inline-block scroller-left font-display font-extrabold uppercase tracking-widest text-[#132125] text-xl sm:text-2xl select-none">
              Maruti Suzuki • Hyundai • Tata • Mahindra • Kia • Renault • MG Motors • Volkswagen • Skoda • Honda • Toyota • BMW • Audi • Maruti Suzuki • Hyundai • Tata • Mahindra • Kia • Renault • MG Motors • Volkswagen • Skoda • Honda • Toyota • BMW • Audi • 
            </div>
          </div>
          <div className="relative w-full overflow-hidden whitespace-nowrap">
            <div className="inline-block scroller-right font-display font-extrabold uppercase tracking-widest text-[#132125] text-xl sm:text-2xl select-none opacity-50">
              Toyota • BMW • Audi • MG Motors • Suzuki • Kia • Tata • Hyundai • Nexon • Fortuner • Legender • Creta • Thar • Swift • Carens • Innova Hycross • Toyota • BMW • Audi • MG Motors • Suzuki • Kia • Tata • Hyundai • Nexon • Fortuner • Legender 
            </div>
          </div>
        </div>

      </section>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* [SECTION 03 — INTERACTIVE MAHINDRA THAR BURNOUT ACTION BUTTON]    */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <section className="relative py-28 border-b border-[#132125] bg-[#0c1518]/30 overflow-hidden" id="section-03-fleet">
        {/* Dynamic mesh glow background to draw focus */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#00dfc1]/5 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="mb-6">
            <p className="font-mono text-xs text-[#00dfc1] uppercase mb-2 tracking-widest">[03] / Select Your Vehicle</p>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white">
              {isDriveAnimating ? "Harnessing the Powertrain..." : "Ready to take the wheel?"}
            </h2>
          </div>
          
          {/* Beautiful Car-Shaped 3D Glowing Button */}
          <div className="flex justify-center items-center py-6">
            <button 
              id="thar-launch-btn"
              onClick={() => {
                if (isDriveAnimating) return;
                setIsDriveAnimating(true);
              }}
              className="block w-full max-w-xl cursor-pointer text-left focus:outline-none"
              disabled={isDriveAnimating}
            >
              <motion.div
                whileHover={!isDriveAnimating ? { 
                  y: -8, 
                  scale: 1.03, 
                  boxShadow: "0px 25px 60px rgba(0, 223, 193, 0.28)",
                } : {}}
                whileTap={!isDriveAnimating ? { scale: 0.98 } : {}}
                transition={{ type: "spring", stiffness: 350, damping: 18 }}
                className="relative bg-gradient-to-br from-[#0c1518] via-[#05090b] to-[#020405] border-2 border-[#132125] hover:border-[#00dfc1]/60 px-6 py-10 rounded-[32px] overflow-hidden group shadow-2xl transition-colors duration-500 flex flex-col items-center justify-center min-h-[220px]"
              >
                {/* Glowing outline glow layer */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#00dfc1]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                {/* Underglow Ground Shadow glow below the Thar */}
                <div className="absolute top-[64%] left-1/2 -translate-x-1/2 w-3/4 h-5 bg-gradient-to-r from-transparent via-[#00dfc1]/15 to-transparent rounded-full blur-md opacity-80 pointer-events-none group-hover:via-[#00dfc1]/30 transition-all duration-300" />
                
                {/* Dynamic animated neon light bars representing grid headlights */}
                <div className="absolute left-6 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-[#00dfc1]/50 rounded-full blur-sm opacity-50 group-hover:opacity-100 transition-opacity animate-pulse pointer-events-none" />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-[#00dfc1]/50 rounded-full blur-sm opacity-50 group-hover:opacity-100 transition-opacity animate-pulse pointer-events-none" />
                
                {/* Top/roof indicator style */}
                <span className="absolute top-3.5 font-mono text-[9px] tracking-[0.35em] text-[#8da4a8] uppercase font-bold text-center pointer-events-none">
                  {isDriveAnimating ? "REV COUNTER AT PEAK" : "DRIVE-EAZE LUCKNOW SPEC"}
                </span>

                {/* ANIMATED SMOKE EMITTER CONTAINER */}
                <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                  {smokeParticles.map(p => (
                    <motion.div
                      key={p.id}
                      className="absolute rounded-full bg-gradient-to-br from-[#8da4a8]/50 to-[#132125]/20 mix-blend-screen filter blur-[5px]"
                      style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: '26px',
                        height: '26px',
                      }}
                      initial={{ scale: p.scale * 0.3, opacity: p.opacity, x: 0, y: 0 }}
                      animate={{ 
                        scale: p.scale * 4.8, 
                        opacity: 0, 
                        x: p.driftX * 18, 
                        y: p.driftY * 12,
                      }}
                      transition={{ duration: 1.1, ease: 'easeOut' }}
                    />
                  ))}
                </div>

                {/* RUGGED ILLUSTRATED MAHINDRA THAR CONTAINER */}
                <div className="relative w-full max-w-sm h-36 flex justify-center items-center z-20 mt-4 overflow-visible">
                  <motion.div
                    id="thar-intro-car-vehicle"
                    className="relative w-[280px] h-full flex items-center justify-center pointer-events-none"
                    animate={isDriveAnimating ? {
                      // Burnout vibrate from 0 to 250ms, then launch exponentially off the right side of the screen!
                      x: [
                        "0%", "1.5%", "-1.5%", "2%", "-1%", // rumble vibration (0 to 250ms)
                        "4%", "20%", "50%", "90%", "140%", "180%" // speed away to the right (250ms to 1500ms)
                      ],
                      y: [
                        0, -2, 2, -1.5, 1.5, // rumble (0 to 250ms)
                        -3, 1, -2, 1, 0, 0 // flight suspension settle (250ms to 1500ms)
                      ],
                      skewX: [
                        0, -1, 1, -1.5, 1.5, // rumble (0 to 250ms)
                        -3, -6, -10, -12, -4, 0 // drag slant (250ms to 1500ms)
                      ],
                      scale: [
                        1, 1.015, 0.985, 1.02, 0.99, // rumble (0 to 250ms)
                        1.01, 1.025, 1.01, 0.97, 0.94, 0.90 // perspective size reduction (250ms to 1500ms)
                      ],
                    } : {
                      y: [0, -2.5, 0],
                    }}
                    transition={isDriveAnimating ? {
                      times: [0, 0.05, 0.1, 0.15, 0.17, 0.25, 0.4, 0.55, 0.75, 0.9, 1.0],
                      duration: 1.5,
                      ease: [0.42, 0, 0.58, 1]
                    } : {
                      repeat: Infinity,
                      duration: 3.5,
                      ease: "easeInOut"
                    }}
                  >
                    {/* Vibrant Custom Vector Thar Image with Transparent Background and Horizontal Flip */}
                    <img 
                      src={processedTharSrc}
                      alt="Mahindra Thar Vector"
                      className="w-full h-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.65)] -scale-x-100 hover:scale-105 transition-all duration-300"
                      referrerPolicy="no-referrer"
                    />

                    {/* Cyber Neon Underglow attached immediately under wheels inside layout */}
                    <div className="absolute bottom-4 left-[20%] right-[20%] h-[3px] bg-[#00dfc1] opacity-50 group-hover:opacity-90 rounded-full blur-[1.5px] animate-pulse transition-all pointer-events-none" />
                  </motion.div>
                </div>

                {/* Typography label showing available cars activation */}
                <div className="mt-2 text-center relative z-20 px-8">
                  <h3 
                    className={`font-display font-black text-lg sm:text-2xl uppercase tracking-wider text-center mb-1.5 transition-all duration-300 ${
                      isDriveAnimating ? "text-[#00dfc1] animate-pulse" : "text-white group-hover:text-[#00dfc1]"
                    }`}
                  >
                    {isDriveAnimating ? "BURNOUT IN PROGRESS..." : "Browse The Available Cars"}
                  </h3>
                  
                  <div className="flex items-center justify-center gap-1 text-[9px] font-mono tracking-widest text-[#8da4a8] uppercase">
                    <span>{isDriveAnimating ? "LEAVING DRAG LINE..." : "ENTER FLEET ENGINE"}</span>
                    <Sparkles size={8} className={`text-[#00dfc1] ${isDriveAnimating ? "animate-spin" : ""}`} />
                    <span>{isDriveAnimating ? "ZERO TO SIXTY..." : "ZERO SECURITY DEPOSIT"}</span>
                  </div>
                </div>

                {/* Sleek Underglow reflecting off the bottom edge */}
                <div className="absolute bottom-1.5 w-2/3 h-[1.5px] bg-gradient-to-r from-transparent via-[#00dfc1]/30 to-transparent group-hover:via-[#00dfc1]/70 group-hover:blur-[1px] transition-all duration-300 pointer-events-none" />
              </motion.div>
            </button>
          </div>
          
          <p className="text-xs text-[#8da4a8] font-mono tracking-wider mt-4">
            {isDriveAnimating ? (
              <span className="text-[#00dfc1] font-bold">Unleashing 4x4 offroad torque. Launch sequence initiated...</span>
            ) : (
              <>Click to launch instant reservation system. Rates starting at just <strong>₹{startingHourly}/hr</strong>!</>
            )}
          </p>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* [SECTION 02 — WHY US]                                             */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <section className="relative py-24 bg-[#0a0f12]/90 border-b border-[#132125]" id="section-02-why">
        {/* Underglow decorative mesh */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-[#00dfc1]/3 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-left mb-16">
            <p className="font-mono text-xs text-[#00dfc1] uppercase mb-2 tracking-widest">[02] / Core Integrity</p>
            <h2 className="font-display text-3xl sm:text-5xl font-black text-white">Why choose Drive-Eaze.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            <motion.div 
              whileHover={{ y: -8, rotateZ: -1, scale: 1.025, boxShadow: "0px 15px 35px rgba(0, 223, 193, 0.12)" }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="bg-[#0c1518]/90 border border-[#132125] p-8 rounded-xl space-y-4 cursor-pointer group transition-all duration-350"
            >
              <div className="w-12 h-12 rounded bg-[#00dfc1]/10 border border-[#00dfc1]/30 flex items-center justify-center text-[#00dfc1] group-hover:rotate-12 transition-transform duration-300">
                <MapPin size={22} className="group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-display text-white group-hover:text-[#00dfc1] font-bold text-lg transition-colors">Doorstep Delivery</h3>
              <p className="text-xs text-[#8da4a8] leading-relaxed">
                Home Pickup & Return. Choose to pick up from Gomti Nagar or get it delivered straight to Lucknow airport/hotel limits.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -8, rotateZ: 1, scale: 1.025, boxShadow: "0px 15px 35px rgba(0, 223, 193, 0.12)" }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="bg-[#0c1518]/90 border border-[#132125] p-8 rounded-xl space-y-4 cursor-pointer group transition-all duration-350"
            >
              <div className="w-12 h-12 rounded bg-[#00dfc1]/10 border border-[#00dfc1]/30 flex items-center justify-center text-[#00dfc1] group-hover:-rotate-12 transition-transform duration-300">
                <Zap size={22} className="group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-display text-white group-hover:text-[#00dfc1] font-bold text-lg transition-colors">Flexible Pricing</h3>
              <p className="text-xs text-[#8da4a8] leading-relaxed">
                Pay by hour, day, week or month. Select the perfect duration and only pay for exactly what you intend to drive.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -8, rotateZ: -1, scale: 1.025, boxShadow: "0px 15px 35px rgba(0, 223, 193, 0.12)" }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="bg-[#0c1518]/90 border border-[#132125] p-8 rounded-xl space-y-4 cursor-pointer group transition-all duration-350"
            >
              <div className="w-12 h-12 rounded bg-[#00dfc1]/10 border border-[#00dfc1]/30 flex items-center justify-center text-[#00dfc1] group-hover:rotate-12 transition-transform duration-300">
                <Shield size={22} className="group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-display text-white group-hover:text-[#00dfc1] font-bold text-lg transition-colors">Highly Maintained Fleet</h3>
              <p className="text-xs text-[#8da4a8] leading-relaxed">
                Inspected, vacuumed, and sanitized before keys are handed out. Zero mechanical compromises and full health logs.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -8, rotateZ: 1, scale: 1.025, boxShadow: "0px 15px 35px rgba(0, 223, 193, 0.12)" }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="bg-[#0c1518]/90 border border-[#132125] p-8 rounded-xl space-y-4 cursor-pointer group transition-all duration-350"
            >
              <div className="w-12 h-12 rounded bg-[#00dfc1]/10 border border-[#00dfc1]/30 flex items-center justify-center text-[#00dfc1] group-hover:-rotate-12 transition-transform duration-300">
                <User size={22} className="group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-display text-white group-hover:text-[#00dfc1] font-bold text-lg transition-colors">24/7 Support</h3>
              <p className="text-xs text-[#8da4a8] leading-relaxed">
                We answer at 3 AM. No robotic filters. Genuine, professional support assistants ready to assist on Lucknow outstations.
              </p>
            </motion.div>

          </div>

        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* [SECTION 04 — USE CASES]                                          */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <section className="py-24 border-b border-[#262626]" id="section-04-usecases">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-left mb-16">
            <p className="font-mono text-xs text-[#f97316] uppercase mb-2 tracking-widest">[04] / Use Cases</p>
            <h2 className="font-display text-3xl sm:text-5xl font-black text-white">Rent for any occasion.</h2>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-orange-500 text-left snap-x" id="usecases-scroll">
            
            <div className="min-w-[280px] xs:min-w-[320px] bg-[#161616] border border-[#262626] p-8 rounded-xl snap-align-start flex-1 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs text-[#737373]">[01] Weddings & Events</span>
                <h3 className="font-display text-white text-lg font-bold mt-4 mb-2">Grand Arrivals</h3>
                <p className="text-xs text-[#737373] leading-relaxed">Rent a pristine Toyota Fortuner or luxury cruiser and make unforgettable statements representing power & respect.</p>
              </div>
              <Link to="/cars" className="text-[#f97316] text-xs font-mono flex items-center gap-1.5 mt-8 hover:underline">
                Explore Cars <ArrowRight size={12} />
              </Link>
            </div>

            <div className="min-w-[280px] xs:min-w-[320px] bg-[#161616] border border-[#262626] p-8 rounded-xl snap-align-start flex-1 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs text-[#737373]">[02] Corporate Travel</span>
                <h3 className="font-display text-white text-lg font-bold mt-4 mb-2">Executive Commutes</h3>
                <p className="text-xs text-[#737373] leading-relaxed">Arrive in clean SUVs with panoramic sunroofs. Best suitable for delegates visiting Lucknow Technology parks & business centers.</p>
              </div>
              <Link to="/cars" className="text-[#f97316] text-xs font-mono flex items-center gap-1.5 mt-8 hover:underline">
                Explore Cars <ArrowRight size={12} />
              </Link>
            </div>

            <div className="min-w-[280px] xs:min-w-[320px] bg-[#161616] border border-[#262626] p-8 rounded-xl snap-align-start flex-1 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs text-[#737373]">[03] Pilgrimage Trips</span>
                <h3 className="font-display text-white text-lg font-bold mt-4 mb-2">Ayodhya & Beyond</h3>
                <p className="text-xs text-[#737373] leading-relaxed">6-Seater spacious MUV captains like Kia Carens to journey with family together comfortably, with complete peace of mind.</p>
              </div>
              <Link to="/cars" className="text-[#f97316] text-xs font-mono flex items-center gap-1.5 mt-8 hover:underline">
                Explore Cars <ArrowRight size={12} />
              </Link>
            </div>

            <div className="min-w-[280px] xs:min-w-[320px] bg-[#161616] border border-[#262626] p-8 rounded-xl snap-align-start flex-1 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs text-[#737373]">[04] Outstation Highway</span>
                <h3 className="font-display text-white text-lg font-bold mt-4 mb-2">Weekend Escapes</h3>
                <p className="text-xs text-[#737373] leading-relaxed text-slate-400">Piped highway cruisers featuring 300 KM per day thresholds to drive around Uttar Pradesh and adjoining districts.</p>
              </div>
              <Link to="/cars" className="text-[#f97316] text-xs font-mono flex items-center gap-1.5 mt-8 hover:underline">
                Explore Cars <ArrowRight size={12} />
              </Link>
            </div>

            <div className="min-w-[280px] xs:min-w-[320px] bg-[#161616] border border-[#262626] p-8 rounded-xl snap-align-start flex-1 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs text-[#737373]">[05] Political Conventions</span>
                <h3 className="font-display text-white text-lg font-bold mt-4 mb-2">High Security Fleet</h3>
                <p className="text-xs text-[#737373] leading-relaxed">Robust bulletproof styling SUVs including the Thar convertible to rally around the capital city securely.</p>
              </div>
              <Link to="/cars" className="text-[#f97316] text-xs font-mono flex items-center gap-1.5 mt-8 hover:underline">
                Explore Cars <ArrowRight size={12} />
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* [SECTION 05 — HOW IT WORKS]                                       */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#0a0a0a] border-b border-[#262626]" id="section-05-process">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-20">
            <p className="font-mono text-xs text-[#f97316] uppercase mb-2 tracking-widest">[05] / Process</p>
            <h2 className="font-display text-3xl sm:text-5xl font-black text-white">Four steps to the wheel.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            
            <div className="space-y-4 text-left p-2">
              <span className="font-display font-black text-[#262626] text-5xl">01</span>
              <h3 className="font-mono text-xs text-[#f97316] uppercase font-bold">Verify Identity</h3>
              <p className="text-xs text-[#737373] leading-relaxed">Share your name, valid driving license, and WhatsApp number through our swift inquiry gateway.</p>
            </div>

            <div className="space-y-4 text-left p-2">
              <span className="font-display font-black text-[#262626] text-5xl">02</span>
              <h3 className="font-mono text-xs text-[#facc15] uppercase font-bold">Choose Vehicle</h3>
              <p className="text-xs text-[#737373] leading-relaxed">Pick from our well-maintained luxury hatchback, sedan, SUV, or family captain MUV fleet.</p>
            </div>

            <div className="space-y-4 text-left p-2">
              <span className="font-display font-black text-[#262626] text-5xl">03</span>
              <h3 className="font-mono text-xs text-[#f97316] uppercase font-bold">Set Duration</h3>
              <p className="text-xs text-[#737373] leading-relaxed">Lock in your duration strategy: hourly rates, daily benchmarks, weekly promos, or monthly options.</p>
            </div>

            <div className="space-y-4 text-left p-2">
              <span className="font-display font-black text-[#262626] text-5xl">04</span>
              <h3 className="font-mono text-xs text-[#facc15] uppercase font-bold">Drive Safely</h3>
              <p className="text-xs text-[#737373] leading-relaxed">Pick up your key or accept doorstep delivery limits, cruise peacefully, and return the vehicle on target time.</p>
            </div>

          </div>

        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* [SECTION 06 — GOOGLE REVIEWS]                                     */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <section className="py-24 border-b border-[#1b1b1b] overflow-hidden" id="section-06-reviews">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
            <div>
              <p className="font-mono text-xs text-[#dfb15b] uppercase mb-2 tracking-widest">[06] / Client Endorsements</p>
              <h2 className="font-display text-3xl sm:text-5xl font-black text-white">What customers say.</h2>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              {/* Manual navigation triggers for high-end control */}
              {reviews.length > 0 && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleScrollPrev}
                    className="p-2.5 rounded-full border border-[#1a1a1a] bg-[#121212] text-gray-400 hover:text-white hover:border-[#dfb15b]/40 cursor-pointer transition-all active:scale-95"
                    aria-label="Previous Reviews"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    onClick={handleScrollNext}
                    className="p-2.5 rounded-full border border-[#1a1a1a] bg-[#121212] text-gray-400 hover:text-white hover:border-[#dfb15b]/40 cursor-pointer transition-all active:scale-95"
                    aria-label="Next Reviews"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}

              <a 
                href={getGoogleMapsLink('https://maps.app.goo.gl/ZbuLB43ozXLPUu5X7')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#121212] hover:bg-[#161616] p-3 rounded-lg border border-[#1b1b1b] transition-all hover:border-[#dfb15b]/40 cursor-pointer group"
                id="google-maps-ratings-badge"
              >
                <span className="font-display text-white text-lg font-black">{settings.google_rating || '4.9'}</span>
                <div className="flex text-[#dfb15b]">
                  {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" className="group-hover:scale-110 transition-transform" />)}
                </div>
                <span className="font-mono text-[10px] text-[#737373] group-hover:text-white transition-colors">({settings.review_count || '240+'} Google Reviews ↗)</span>
              </a>
            </div>
          </div>

          <div 
            className="relative w-full overflow-hidden" 
            id="reviews-marquee-box"
            onMouseEnter={() => setIsReviewsHovered(true)}
            onMouseLeave={() => setIsReviewsHovered(false)}
            onTouchStart={() => setIsReviewsHovered(true)}
            onTouchEnd={() => setIsReviewsHovered(false)}
          >
            {/* Soft left/right vignettes to make the scroll area look elite */}
            <div className="absolute top-0 bottom-0 left-0 w-16 bg-gradient-to-r from-[#080808] to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 bottom-0 right-0 w-16 bg-gradient-to-l from-[#080808] to-transparent z-10 pointer-events-none" />

            <div 
              ref={reviewsScrollRef}
              className="flex gap-6 overflow-x-auto pb-6 snap-x scrollbar-none scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {reviews.length === 0 ? (
                <div className="bg-[#121212] p-12 rounded-2xl border border-[#1b1b1b] w-full text-center">
                  <p className="text-[#888888] text-xs uppercase font-mono tracking-widest">No review entries approved yet. Check back soon.</p>
                </div>
              ) : (
                /* Replicating review items to support smooth continuous carousel sliding loops */
                [...reviews, ...reviews, ...reviews].map((r, itemIdx) => (
                  <div 
                    key={`${r.id}-${itemIdx}`} 
                    className="min-w-[290px] xs:min-w-[340px] md:min-w-[420px] bg-[#121212] border border-[#1b1b1b] hover:border-[#dfb15b]/30 p-6 rounded-2xl flex flex-col justify-between transition-all duration-300"
                  >
                    <div>
                      {/* Rating row */}
                      <div className="flex text-[#dfb15b] gap-0.5 mb-4">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} size={14} fill="currentColor" />
                        ))}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-300 font-sans font-light italic leading-relaxed line-clamp-4">
                        "{r.review_text}"
                      </p>
                    </div>

                    <div className="mt-6 flex items-center gap-3 border-t border-[#1b1b1b] pt-4">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#dfb15b] to-[#cca43b] text-black flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                        {r.reviewer_name?.slice(0, 2) || 'DE'}
                      </div>
                      <div className="text-left">
                        <h4 className="font-display text-xs text-white font-bold">{r.reviewer_name}</h4>
                        <span className="font-mono text-[9px] text-[#888888]">
                          Verified Renter • {r.car?.name || 'Drive-Eaze Premium Car'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="text-center mt-10">
            <a 
              href={getGoogleMapsLink('https://maps.app.goo.gl/ZbuLB43ozXLPUu5X7')} 
              target="_blank" 
              rel="noreferrer" 
              className="inline-flex items-center gap-1.5 text-[#dfb15b] hover:text-[#cca43b] text-xs font-mono font-bold uppercase tracking-widest transition-all hover:translate-x-1"
            >
              View All Reviews on Google Maps Page ↗
            </a>
          </div>

        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* [SECTION 10 — LIVE STATS]                                         */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#0a0a0a] border-b border-[#262626]" id="section-10-livestats">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-left mb-16">
            <p className="font-mono text-xs text-[#f97316] uppercase mb-2 tracking-widest">[10] / Live Data</p>
            <h2 className="font-display text-3xl sm:text-5xl font-black text-white">Real-time stats.</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-[#161616] border border-[#262626] p-6 rounded-xl flex flex-col justify-between h-40">
              <span className="font-mono text-[10px] text-[#737373] uppercase tracking-wider">Average Daily Price</span>
              <div className="my-auto">
                <span className="font-display font-black text-white text-3xl sm:text-4xl text-left">₹{liveStats.avgDailyPrice}</span>
              </div>
              <span className="font-mono text-[9px] text-emerald-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse" /> Calculates from live listings
              </span>
            </div>

            <div className="bg-[#161616] border border-[#262626] p-6 rounded-xl flex flex-col justify-between h-40">
              <span className="font-mono text-[10px] text-[#737373] uppercase tracking-wider">Top Rated Vehicle</span>
              <div className="my-auto lg:line-clamp-2">
                <span className="font-display font-black text-white text-2xl tracking-tight text-left block leading-none">{liveStats.popularCar}</span>
              </div>
              <span className="font-mono text-[9px] text-emerald-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse" /> Based on total bookings
              </span>
            </div>

            <div className="bg-[#161616] border border-[#262626] p-6 rounded-xl flex flex-col justify-between h-40">
              <span className="font-mono text-[10px] text-[#737373] uppercase tracking-wider">Cheapest Rate Smart</span>
              <div className="my-auto">
                <span className="font-display font-black text-white text-3xl sm:text-4xl text-left">₹{liveStats.cheapestHourly}<span className="text-xs text-[#737373] font-normal font-mono">/hr</span></span>
              </div>
              <span className="font-mono text-[9px] text-emerald-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse" /> Refreshed 2 sec ago
              </span>
            </div>

            <div className="bg-[#161616] border border-[#262626] p-6 rounded-xl flex flex-col justify-between h-40">
              <span className="font-mono text-[10px] text-[#737373] uppercase tracking-wider">Average Customer Rating</span>
              <div className="my-auto">
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-white text-3xl sm:text-4xl text-left">{liveStats.avgRating}</span>
                  <div className="flex text-[#facc15]">
                    <Star size={20} fill="currentColor" />
                  </div>
                </div>
              </div>
              <span className="font-mono text-[9px] text-emerald-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse" /> Verified Google feed
              </span>
            </div>

          </div>

        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* [SECTION 11 — NUMBERS]                                            */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <section className="py-24 border-b border-[#262626]" id="section-11-numbers">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-left mb-16">
            <p className="font-mono text-xs text-[#facc15] uppercase mb-2 tracking-widest">[11] / Our Journey</p>
            <h2 className="font-display text-3xl sm:text-5xl font-black text-white">The numbers speak for us.</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            
            <div className="border-l border-[#262626] pl-6 py-2">
              <div className="font-display font-black text-white text-4xl sm:text-5xl">{settings.total_renters || '5,000+'}</div>
              <p className="text-xs text-[#737373] mt-2 font-mono uppercase tracking-wider">Happy Renters</p>
            </div>

            <div className="border-l border-[#262626] pl-6 py-2">
              <div className="font-display font-black text-white text-4xl sm:text-5xl">2 Cities</div>
              <p className="text-xs text-[#737373] mt-2 font-mono uppercase tracking-wider">Lucknow + Kanpur</p>
            </div>

            <div className="border-l border-[#262626] pl-6 py-2">
              <div className="font-display font-black text-white text-4xl sm:text-5xl">{settings.total_km || '800K+'}</div>
              <p className="text-xs text-[#737373] mt-2 font-mono uppercase tracking-wider">KMs Driven</p>
            </div>

            <div className="border-l border-[#262626] pl-6 py-2">
              <div className="font-display font-black text-white text-4xl sm:text-5xl">{settings.google_rating || '4.9'} / 5</div>
              <p className="text-xs text-[#737373] mt-2 font-mono uppercase tracking-wider">Google Rating</p>
            </div>

            <div className="border-l border-[#262626] pl-6 py-2">
              <div className="font-display font-black text-white text-4xl sm:text-5xl">₹15 Lakh</div>
              <p className="text-xs text-[#737373] mt-2 font-mono uppercase tracking-wider">Paid to Hosts Monthly</p>
            </div>

            <div className="border-l border-[#262626] pl-6 py-2">
              <div className="font-display font-black text-white text-4xl sm:text-5xl">60+</div>
              <p className="text-xs text-[#737373] mt-2 font-mono uppercase tracking-wider">Active Hosts</p>
            </div>

            <div className="border-l border-[#262626] pl-6 py-2">
              <div className="font-display font-black text-white text-4xl sm:text-5xl">98%</div>
              <p className="text-xs text-[#737373] mt-2 font-mono uppercase tracking-wider">On-Time Delivery</p>
            </div>

            <div className="border-l border-[#262626] pl-6 py-2">
              <div className="font-display font-black text-white text-4xl sm:text-5xl">24/7 Support</div>
              <p className="text-xs text-[#737373] mt-2 font-mono uppercase tracking-wider">Human Powered Help</p>
            </div>

          </div>

        </div>
      </section>



      {/* ────────────────────────────────────────────────────────────────── */}
      {/* [SECTION 12 — HOST EARNING]                                       */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#060606] border-b border-[#1b1b1b]" id="section-12-host">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-[#121212] border border-[#1b1b1b] rounded-2xl p-8 sm:p-16 relative overflow-hidden" id="host-cta-box">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#dfb15b]/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="max-w-3xl space-y-6 text-left">
              <p className="font-mono text-xs text-[#f97316] uppercase tracking-widest">[12] / Earn With Us</p>
              <h2 className="font-display text-3xl sm:text-5xl font-black text-white leading-none">
                List your car. <br />Earn ₹25,000+ / month.
              </h2>
              <p className="text-sm text-[#737373] leading-relaxed max-w-xl">
                Own a vehicle in Lucknow? Keep it from lying idle in the garage. We handle bookings, insurance vetting, 24/7 security checks, and client support. You get monthly payouts directly into your bank.
              </p>

              {/* Host stats pill */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-left">
                <div className="border-l border-[#f97316] pl-3">
                  <span className="font-mono text-[10px] text-[#737373] uppercase tracking-wider block">Avg Earning</span>
                  <span className="font-display font-extrabold text-white text-base">₹35K+/mo</span>
                </div>
                <div className="border-l border-[#facc15] pl-3">
                  <span className="font-mono text-[10px] text-[#737373] uppercase tracking-wider block">Active Hosts</span>
                  <span className="font-display font-extrabold text-white text-base">60+ Live</span>
                </div>
                <div className="border-l border-[#f97316] pl-3">
                  <span className="font-mono text-[10px] text-[#737373] uppercase tracking-wider block">Fleet Pool</span>
                  <span className="font-display font-extrabold text-white text-base">150+ Cars</span>
                </div>
                <div className="border-l border-[#facc15] pl-3">
                  <span className="font-mono text-[10px] text-[#737373] uppercase tracking-wider block">Trips Completed</span>
                  <span className="font-display font-extrabold text-white text-base">5,000+ Done</span>
                </div>
              </div>

              <div className="pt-8">
                <a 
                  href={waLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-8 py-4 bg-[#f97316] hover:bg-orange-600 font-display font-bold text-black rounded-lg transition-all active:scale-95 inline-block text-center cursor-pointer"
                >
                  Become a Host (WhatsApp Team)
                </a>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* [SECTION 08 — FAQ]                                                */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <section className="py-24 border-b border-[#262626]" id="section-08-faq">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          <div className="text-center mb-16">
            <p className="font-mono text-xs text-[#f97316] uppercase mb-2 tracking-widest">[08] / FAQ</p>
            <h2 className="font-display text-3xl sm:text-5xl font-black text-white">Frequently asked.</h2>
          </div>

          <div className="space-y-4" id="faq-accordion-container">
            
            {[
              { q: "What is the minimum age to rent?", a: "To rent any self-drive vehicle from Drive-Eaze, the minimum age requirement is 18 years with a valid driving license." },
              { q: "Do I need a driving licence?", a: "Yes, a valid, original Indian Driving Licence (LMV passenger cars) is strictly required at delivery. Digital DigiLocker DL is acceptable on verification." },
              { q: "What documents do foreigners need?", a: "Foreign travelers need a valid International Driving Permit (IDP) along with their original home-country driving license and passport credentials." },
              { q: "Who pays for traffic violations?", a: "The registered renter is fully responsible for all traffic rules violations (E-Challans, overspeeding alerts, parking tickets) incurred during the rental trip window." },
              { q: "Is there a KM limit?", a: "We provide an extremely generous limit of 300 Kilometers per calendar day. Any extra driving range beyond this is charged dynamically at ₹12 per KM." },
              { q: "Can I get home delivery?", a: "Yes, we provide doorstep home delivery and pickup options across Lucknow limits including Gomti Nagar, Aliganj, Hazratganj, and Amausi Airport." },
              { q: "What if the car breaks down?", a: "We have 24/7 dedicated Roadside Assistance (RSA) support. In case of mechanical alerts, dial our direct staff hotlines immediately." },
              { q: "Self-drive vs taxi — why self-drive?", a: "Enjoy 100% complete privacy with your friends/family, fly at your own pace, and save tons of budget on long multi-stop outstation itineraries." }
            ].map((item, index) => (
              <div 
                key={index} 
                className="bg-[#161616] border border-[#262626] rounded-xl overflow-hidden hover:border-[#f97316]/20 transition-all font-sans"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left p-6 flex justify-between items-center text-white focus:outline-none cursor-pointer"
                >
                  <span className="font-display text-sm sm:text-base font-bold text-left">{item.q}</span>
                  <ChevronDown 
                    size={18} 
                    className={`text-[#f97316] transition-transform ${faqOpen === index ? 'rotate-180' : ''}`} 
                  />
                </button>
                
                <AnimatePresence initial={false}>
                  {faqOpen === index && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 text-xs sm:text-sm text-[#737373] leading-relaxed border-t border-[#262626]/20 pt-4 text-left">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

          </div>

        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* [SECTION 13 — CONTACT CTA]                                        */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#0a0a0a]" id="section-13-contact">
        <div className="max-w-4xl mx-auto px-4 text-center">
          
          <p className="font-mono text-xs text-[#f97316] uppercase mb-4 tracking-widest">[13] / Talk to Us</p>
          <h2 className="font-display text-4xl sm:text-6xl font-black text-white leading-none mb-6">
            Still have questions?
          </h2>
          <p className="text-sm text-[#737373] mb-12 max-w-lg mx-auto">
            Our Lucknow-based staff responds instantly to all calls & inquiry messages. We pick up client phone calls 24/7, even at 3:00 AM.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            
            <a 
              href={waLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full sm:flex-1 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 font-display font-bold text-white rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/20"
            >
              <MessageSquare size={18} /> Chat on WhatsApp
            </a>

            <a 
              href={getPhoneLink(phone)} 
              className="w-full sm:flex-1 px-6 py-4 bg-[#161616] hover:bg-[#262626] border border-[#262626] font-display font-bold text-white rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Phone size={18} className="text-[#facc15]" /> Call Us Now
            </a>

          </div>

        </div>
      </section>

    </div>
  );
}
