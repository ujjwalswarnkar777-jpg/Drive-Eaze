/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, MessageSquare, Phone, ChevronDown, ChevronLeft, ChevronRight, Star, Sparkles, 
  MapPin, Shield, Check, Fuel, User, Gauge, CircleDot, Zap, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, subscribeToRealtime } from '../lib/supabase';
import { Car, Review } from '../types';
import { CarCardSkeleton } from '../components/Skeleton';
import { toast } from '../components/Toast';
import { getWhatsAppLink, getGoogleMapsLink, getPhoneLink, getAppLink } from '../lib/deepLink';

export default function Home() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [carsLoaded, setCarsLoaded] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [appBannerOpen, setAppBannerOpen] = useState(true);

  const [isReviewsHovered, setIsReviewsHovered] = useState(false);
  const reviewsScrollRef = useRef<HTMLDivElement>(null);

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
    <div className="bg-[#080808] relative" id="homepage-container">
      
      {/* ────────────────────────────────────────────────────────────────── */}
      {/* [HERO SECTION]                                                    */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden border-b border-[#1b1b1b]" id="section-hero">
        
        {/* Premium Warm Gold Ambient Glow Overlays */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-[#dfb15b]/10 to-[#cca43b]/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -top-12 left-1/4 w-[280px] h-[280px] bg-[#dfb15b]/5 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute bottom-4 right-1/4  w-[320px] h-[320px] bg-[#cca43b]/5 rounded-full blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          <p className="font-mono text-xs text-[#888888] tracking-widest uppercase mb-6 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#dfb15b] inline-block animate-ping" />
            Est. 2024 / Self-Drive Rentals / Lucknow
          </p>

          <h1 className="font-display text-4xl sm:text-6xl lg:text-8xl font-black tracking-tighter leading-none mb-8">
            <div className="text-white">Drive the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dfb15b] via-[#fffbf2] to-[#cca43b]">{tagline.split('.')[0] || 'Difference'}</span>.</div>
            <div className="text-white/80 text-3xl sm:text-5xl lg:text-6xl font-extrabold mt-1">Pay by the hour, day, or week.</div>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#737373] mb-12 font-sans font-light">
            {subtitle}
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link 
              to="/cars" 
              className="w-full sm:w-auto px-8 py-4 bg-[#f97316] hover:bg-orange-600 font-display font-bold text-black rounded-lg transition-all active:scale-95 text-center cursor-pointer shadow-lg shadow-orange-500/10 flex items-center justify-center gap-2"
              id="hero-cta-book"
            >
              Book a Car <ArrowRight size={18} />
            </Link>
            
            <a 
              href={waLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full sm:w-auto px-8 py-4 bg-[#161616] hover:bg-[#262626] border border-[#262626] hover:border-[#f97316]/30 text-white font-display font-bold rounded-lg transition-all active:scale-95 text-center flex items-center justify-center gap-2"
              id="hero-cta-whatsapp"
            >
              <MessageSquare size={18} className="text-green-500" /> WhatsApp Us
            </a>
          </div>

          {/* Pricing Stat Pills */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl mx-auto" id="hero-pricing-stats">
            <div className="bg-[#161616] border border-[#262626] px-4 py-3.5 rounded-lg flex flex-col justify-center items-center">
              <span className="font-mono text-[10px] text-[#737373] uppercase tracking-wider">Hourly Tier</span>
              <span className="font-display font-extrabold text-white text-lg mt-0.5">₹{startingHourly}<span className="text-xs text-[#737373] font-normal">/hr</span></span>
            </div>
            <div className="bg-[#161616] border border-[#262626] px-4 py-3.5 rounded-lg flex flex-col justify-center items-center">
              <span className="font-mono text-[10px] text-[#737373] uppercase tracking-wider">Daily Tier</span>
              <span className="font-display font-extrabold text-white text-lg mt-0.5">₹{startingDaily}<span className="text-xs text-[#737373] font-normal">/day</span></span>
            </div>
            <div className="bg-[#161616] border border-[#262626] px-4 py-3.5 rounded-lg flex flex-col justify-center items-center">
              <span className="font-mono text-[10px] text-[#737373] uppercase tracking-wider">Weekly Tier</span>
              <span className="font-display font-extrabold text-white text-lg mt-0.5">₹{startingWeekly}<span className="text-xs text-[#737373] font-normal">/wk</span></span>
            </div>
            <div className="bg-[#161616] border border-[#262626] px-4 py-3.5 rounded-lg flex flex-col justify-center items-center">
              <span className="font-mono text-[10px] text-[#737373] uppercase tracking-wider">Monthly Tier</span>
              <span className="font-display font-extrabold text-white text-lg mt-0.5">₹{parseFloat(startingMonthly).toLocaleString('en-IN')}<span className="text-xs text-[#737373] font-normal">/mo</span></span>
            </div>
          </div>

        </div>

        {/* Brand infinite marquee ticker  */}
        <div className="mt-20 border-t border-b border-[#262626] py-5 bg-[#0a0a0a]" id="hero-marquee">
          <div className="relative w-full overflow-hidden whitespace-nowrap mb-3.5">
            <div className="inline-block scroller-left font-display font-extrabold uppercase tracking-widest text-[#262626] text-xl sm:text-2xl select-none">
              Maruti Suzuki • Hyundai • Tata • Mahindra • Kia • Renault • MG Motors • Volkswagen • Skoda • Honda • Toyota • BMW • Audi • Maruti Suzuki • Hyundai • Tata • Mahindra • Kia • Renault • MG Motors • Volkswagen • Skoda • Honda • Toyota • BMW • Audi • 
            </div>
          </div>
          <div className="relative w-full overflow-hidden whitespace-nowrap">
            <div className="inline-block scroller-right font-display font-extrabold uppercase tracking-widest text-[#262626] text-xl sm:text-2xl select-none opacity-50">
              Toyota • BMW • Audi • MG Motors • Suzuki • Kia • Tata • Hyundai • Nexon • Fortuner • Legender • Creta • Thar • Swift • Carens • Innova Hycross • Toyota • BMW • Audi • MG Motors • Suzuki • Kia • Tata • Hyundai • Nexon • Fortuner • Legender 
            </div>
          </div>
        </div>

      </section>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* [SECTION 03 — FLEET PREVIEW]                                      */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <section className="py-24 border-b border-[#262626]" id="section-03-fleet">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-4">
            <div>
              <p className="font-mono text-xs text-[#f97316] uppercase mb-2 tracking-widest">[03] / Current Fleet</p>
              <h2 className="font-display text-3xl sm:text-5xl font-black text-white">Available Now.</h2>
            </div>
            <Link 
              to="/cars" 
              className="text-[#f97316] hover:text-[#facc15] font-display font-bold text-sm flex items-center gap-1 group/link cursor-pointer"
            >
              Browse entire fleet ({featuredCars.length}+ luxury cars) 
              <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>

          {!carsLoaded ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => <CarCardSkeleton key={i} />)}
            </div>
          ) : featuredCars.length === 0 ? (
            <div className="bg-[#161616] border border-[#262626] rounded-xl py-16 px-4 text-center">
              <Sparkles className="mx-auto text-[#f97316] mb-4" size={40} />
              <p className="text-[#a3a3a3] font-medium text-lg mb-6">No cars are currently flagged as available. We have more on the lot!</p>
              <a 
                href={waLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-6 py-3 bg-[#f97316] hover:bg-orange-600 font-bold text-black rounded text-sm transition-all"
              >
                WhatsApp staff for custom options
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCars.map((car) => (
                <div 
                  key={car.id} 
                  className="bg-[#161616] border border-[#262626] hover:border-[#f97316]/30 rounded-xl overflow-hidden group transition-all duration-300 flex flex-col justify-between"
                  id={`car-card-${car.id}`}
                >
                  {/* Car Image with Status Indicator overlay */}
                  <div className="relative aspect-video w-full bg-[#0d0d0d] overflow-hidden">
                    <img 
                      src={car.images[0]} 
                      alt={`${car.brand} ${car.name}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Status Dot Ring */}
                    <div className="absolute top-4 right-4 bg-[#0d0d0d]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#262626] flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        car.status === 'available' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 
                        car.status === 'booked' ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]' : 
                        'bg-amber-500'
                      }`} />
                      <span className="font-mono text-[9px] uppercase tracking-wider text-white">{car.status}</span>
                    </div>

                    <div className="absolute bottom-4 left-4 bg-[#f97316] text-black font-mono text-[10px] font-bold px-3 py-1 rounded">
                      {car.category}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                    <div>
                      {/* Name & Year */}
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-display font-bold text-xl text-white group-hover:text-[#f97316] transition-colors">
                          {car.brand} {car.name}
                        </h3>
                        <span className="font-mono text-xs text-[#737373]">{car.year}</span>
                      </div>
                      
                      {/* Small Subtitle */}
                      <p className="text-xs text-[#737373] font-sans line-clamp-1 mb-4">{car.model}</p>

                      {/* Specs Row */}
                      <div className="flex gap-2 flex-wrap text-xs font-mono text-[#a3a3a3]">
                        <span className="bg-[#0f0f0f] border border-[#262626] px-2.5 py-1 rounded flex items-center gap-1">
                          <Fuel size={12} className="text-[#f97316]" /> {car.fuel_type}
                        </span>
                        <span className="bg-[#0f0f0f] border border-[#262626] px-2.5 py-1 rounded flex items-center gap-1">
                          <Gauge size={12} className="text-[#facc15]" /> {car.transmission}
                        </span>
                        <span className="bg-[#0f0f0f] border border-[#262626] px-2.5 py-1 rounded flex items-center gap-1">
                          <User size={12} className="text-[#f97316]" /> {car.seats} Seats
                        </span>
                      </div>
                    </div>

                    {/* Booking Price Row */}
                    <div className="border-t border-[#262626] pt-4 mt-auto flex items-end justify-between">
                      <div className="space-y-0.5">
                        <div className="font-display font-black text-[#f97316] text-2xl">
                          ₹{Number(car.price_per_day).toLocaleString('en-IN')}
                          <span className="text-xs font-mono font-normal text-[#a3a3a3]">/day</span>
                        </div>
                        <div className="font-mono text-[10px] text-[#737373]">
                          or ₹{car.price_per_hour}/hour
                        </div>
                      </div>

                      <Link 
                        to={`/cars/${car.id}`} 
                        className="px-4.5 py-2.5 bg-[#161616] hover:bg-[#f97316] group-hover:bg-[#1f1f1f] text-white hover:text-black font-display font-bold text-xs rounded transition-all border border-[#262626] flex items-center gap-2 cursor-pointer"
                        id={`view-car-btn-${car.id}`}
                      >
                        View Details <ArrowRight size={14} />
                      </Link>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* [SECTION 02 — WHY US]                                             */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#0a0a0a] border-b border-[#262626]" id="section-02-why">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-left mb-16">
            <p className="font-mono text-xs text-[#facc15] uppercase mb-2 tracking-widest">[02] / Why Us</p>
            <h2 className="font-display text-3xl sm:text-5xl font-black text-white">Why choose Drive-Eaze.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            <div className="bg-[#161616] border border-[#262626] p-8 rounded-xl space-y-4 hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded bg-orange-500/10 border border-[#f97316]/30 flex items-center justify-center text-[#f97316]">
                <MapPin size={22} />
              </div>
              <h3 className="font-display text-white font-bold text-lg">Doorstep Delivery</h3>
              <p className="text-xs text-[#737373] leading-relaxed">
                Home Pickup & Return. Choose to pick up from Gomti Nagar or get it delivered straight to Lucknow airport/hotel limits.
              </p>
            </div>

            <div className="bg-[#161616] border border-[#262626] p-8 rounded-xl space-y-4 hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded bg-amber-500/10 border border-[#facc15]/30 flex items-center justify-center text-[#facc15]">
                <Zap size={22} />
              </div>
              <h3 className="font-display text-white font-bold text-lg">Flexible Pricing</h3>
              <p className="text-xs text-[#737373] leading-relaxed">
                Pay by hour, day, week or month. Select the perfect duration and only pay for exactly what you intend to drive.
              </p>
            </div>

            <div className="bg-[#161616] border border-[#262626] p-8 rounded-xl space-y-4 hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded bg-orange-500/10 border border-[#f97316]/30 flex items-center justify-center text-[#f97316]">
                <Shield size={22} />
              </div>
              <h3 className="font-display text-white font-bold text-lg">Highly Maintained Fleet</h3>
              <p className="text-xs text-[#737373] leading-relaxed">
                Inspected, vacuumed, and sanitized before keys are handed out. Zero mechanical compromises and full health logs.
              </p>
            </div>

            <div className="bg-[#161616] border border-[#262626] p-8 rounded-xl space-y-4 hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded bg-amber-500/10 border border-[#facc15]/30 flex items-center justify-center text-[#facc15]">
                <User size={22} />
              </div>
              <h3 className="font-display text-white font-bold text-lg">24/7 Support</h3>
              <p className="text-xs text-[#737373] leading-relaxed">
                We answer at 3 AM. No robotic filters. Genuine, professional support assistants ready to assist on Lucknow outstations.
              </p>
            </div>

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
      {/* [SECTION 11.5 — MOBILE COMPANION APP]                             */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <section className="py-20 border-b border-[#1b1b1b]" id="section-11.5-app-promo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#121212] via-[#0d0d0d] to-[#121212] border border-[#1b1b1b] rounded-2xl p-8 sm:p-12 relative overflow-hidden" id="app-cta-box">
            
            {/* Elegant Background Gold Overlay Shapes */}
            <div className="absolute top-1/2 left-2/3 w-[500px] h-[250px] bg-[#dfb15b]/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-8 left-8 w-[200px] h-[200px] bg-[#cca43b]/5 rounded-full blur-[80px] pointer-events-none" />

            <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
              
              {/* Left Column Description */}
              <div className="text-left space-y-5 max-w-xl">
                <p className="font-mono text-xs text-[#dfb15b] uppercase tracking-widest">[11.5] / Mobile Companion App</p>
                <div className="space-y-2">
                  <h2 className="font-display text-2xl sm:text-4xl font-black text-white">
                    Experience Drive-Eaze. <br />First-Class Native App.
                  </h2>
                  <p className="text-xs sm:text-sm text-[#737373] leading-relaxed">
                    Most drivers prefer using our dedicated Android application on their mobile phones. Unlock lightning-fast search indexing, pre-filled rental security checklists, live vehicle tracking, and offline reservation access with single-tap launches.
                  </p>
                </div>

                {/* Features layout list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-start gap-2.5 text-left">
                    <div className="bg-[#dfb15b]/10 text-[#dfb15b] p-1.5 rounded-lg shrink-0">
                      <Zap size={14} className="fill-current" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-xs text-white">2x Faster Performance</h4>
                      <p className="text-[11px] text-[#737373]">Optimized queries without browser latency.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-left">
                    <div className="bg-[#cca43b]/10 text-[#cca43b] p-1.5 rounded-lg shrink-0">
                      <Shield size={14} />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-xs text-white">Encrypted Checklists</h4>
                      <p className="text-[11px] text-[#737373]">Secure license and document state backups.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column Launcher Controls */}
              <div className="w-full lg:w-auto bg-[#0a0a0a] border border-[#1b1b1b] p-6 sm:p-8 rounded-xl flex flex-col justify-center items-stretch gap-4 min-w-[300px] sm:min-w-[400px]">
                
                <h4 className="font-mono text-[10px] text-gray-400 uppercase tracking-widest text-center border-b border-[#1b1b1b]/60 pb-3">
                  Tap to launch or download file
                </h4>

                <a 
                  href={getAppLink('/cars')}
                  className="px-6 py-4 bg-[#dfb15b] hover:bg-[#cca43b] text-black font-display font-black text-xs uppercase rounded-lg tracking-widest transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap size={14} className="fill-black animate-bounce" /> Launch App Instantly
                </a>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-[#1b1b1b]" />
                  <span className="flex-shrink mx-4 font-mono text-[10px] text-[#525252] uppercase">Or Install Locally</span>
                  <div className="flex-grow border-t border-[#1b1b1b]" />
                </div>

                <a 
                  href="https://driveeaze.in/assets/app/drive-eaze-latest.apk"
                  download="drive-eaze-latest.apk"
                  className="px-6 py-4 bg-[#121212] hover:bg-[#1a1a1a] text-white border border-[#1b1b1b] hover:border-[#dfb15b]/30 font-display font-bold text-xs uppercase rounded-lg tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Download .APK Application
                </a>

                <p className="text-[10px] text-[#525252] text-center font-sans mt-1">
                  Works seamlessly on Android/iOS devices. Perfect fallback for low cellular signal areas.
                </p>

              </div>

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
