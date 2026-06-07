/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Fuel, Gauge, User, Star, StarHalf, MessageSquare, Phone, 
  MapPin, ShieldAlert, BadgeInfo, CalendarClock, Ban, ReceiptText, Sparkles 
} from 'lucide-react';
import { db, subscribeToRealtime } from '../lib/supabase';
import { Car, Review } from '../types';
import { DetailedCarSkeleton } from '../components/Skeleton';
import { toast } from '../components/Toast';
import { getWhatsAppLink, getPhoneLink, isMobileUser } from '../lib/deepLink';

export default function CarDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [car, setCar] = useState<Car | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'policy' | 'reviews'>('overview');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [settings, setSettings] = useState<Record<string, string>>({});

  const loadCarDetails = async () => {
    if (!id) return;
    try {
      const data = await db.getCarById(id);
      if (!data) {
        toast.error("Vehicle not found. Redirecting to fleet.");
        navigate('/cars');
        return;
      }
      setCar(data);
      if (data.images && data.images.length > 0) {
        setSelectedImage(data.images[0]);
      }

      // Load approved reviews for this specific car
      const allReviews = await db.getReviews(true);
      const carReviews = allReviews.filter((r) => r.car_id === id);
      setReviews(carReviews);

      const siteSg = await db.getSiteSettings();
      setSettings(siteSg);

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCarDetails();
    
    // Subscribe to realtime updates for instant reflecting (status change, etc.)
    const unsubCars = subscribeToRealtime('cars', loadCarDetails);
    const unsubReviews = subscribeToRealtime('reviews', loadCarDetails);
    return () => {
      unsubCars();
      unsubReviews();
    };
  }, [id]);

  if (loading) {
    return <DetailedCarSkeleton />;
  }

  if (!car) {
    return (
      <div className="bg-[#0d0d0d] text-center py-20">
        <p className="text-white">Car details could not be loaded.</p>
        <Link to="/cars" className="text-[#f97316] underline mt-4 inline-block font-mono">Return to Fleet</Link>
      </div>
    );
  }

  const isAvailable = car.status === 'available';
  const phone = settings.phone || '+91-8960695050';
  const whatsappKey = settings.whatsapp || '918960695050';
  const plainText = `Hi Drive-Eaze! I want to rent the ${car.brand} ${car.name} (Year: ${car.year}). Please let me know the availability details.`;
  const waPreloadedLink = getWhatsAppLink(whatsappKey, plainText);

  return (
    <div className="bg-[#0d0d0d] min-h-screen text-[#f5f5f5]" id="car-detail-viewport">
      
      {/* ────────────────────────────────────────────────────────────────── */}
      {/* BANNER WITH BACK LINK                                             */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <div className="border-b border-[#262626] py-6 bg-[#0a0a0a]" id="car-detail-navline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            to="/cars" 
            className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase text-gray-400 hover:text-[#f97316] transition-colors"
          >
            <ArrowLeft size={14} /> Back to entire fleet list [03]
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="car-detail-layout-grid">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* ────────────────────────────────────────────────────────────── */}
          {/* LEFT 60%: CAR METRIC GALLERY & TAB CONTENT                    */}
          {/* ────────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-10" id="car-detail-left-pane">
            
            {/* Main Display and Carousel strip */}
            <div className="space-y-4" id="car-gallery-box">
              <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden border border-[#262626] shadow-2xl select-none">
                <img 
                  src={selectedImage || car.images[0]} 
                  alt={car.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                
                {/* Available / Booked indicator badge */}
                <span className={`absolute bottom-4 left-4 text-xs font-mono font-semibold px-3 py-1.5 rounded uppercase border flex items-center gap-1.5 ${
                  isAvailable 
                    ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300' 
                    : 'bg-rose-950/80 border-rose-500/30 text-rose-300'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  {car.status} on Lucknow lot
                </span>
              </div>

              {/* Thumbnails list */}
              {car.images && car.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1" id="gallery-strip">
                  {car.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(img)}
                      type="button"
                      className={`relative w-28 aspect-video rounded overflow-hidden border transition-all cursor-pointer ${
                        selectedImage === img ? 'border-[#f97316] ring-2 ring-[#f97316]/20' : 'border-[#262626] hover:border-[#737373]'
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* TAB ACCORDION PANEL SELECTOR */}
            <div className="border border-[#262626] rounded-xl bg-[#161616]" id="car-tabs-accordion">
              
              <div className="flex border-b border-[#262626] overflow-x-auto text-xs font-mono font-bold uppercase text-[#737373]">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 min-w-[100px] text-center py-4 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'overview' ? 'text-white border-[#f97316]' : 'border-transparent hover:text-white'
                  }`}
                >
                  Overview Specs
                </button>
                <button
                  onClick={() => setActiveTab('features')}
                  className={`flex-1 min-w-[100px] text-center py-4 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'features' ? 'text-white border-[#facc15]' : 'border-transparent hover:text-white'
                  }`}
                >
                  Features & Safe Specs
                </button>
                <button
                  onClick={() => setActiveTab('policy')}
                  className={`flex-1 min-w-[100px] text-center py-4 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'policy' ? 'text-white border-[#f97316]' : 'border-transparent hover:text-white'
                  }`}
                >
                  Rental Policies
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`flex-1 min-w-[100px] text-center py-4 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'reviews' ? 'text-white border-[#facc15]' : 'border-transparent hover:text-white'
                  }`}
                >
                  Reviews ({reviews.length})
                </button>
              </div>

              {/* Tab detail views */}
              <div className="p-6 text-sm leading-relaxed" id="car-tab-body">
                
                {/* 1. OVERVIEW TAB */}
                {activeTab === 'overview' && (
                  <div className="space-y-6 text-left" id="tab-overview-content">
                    <div className="space-y-2">
                      <h3 className="font-display font-bold text-white text-lg">Vehicle Narrative Description</h3>
                      <p className="text-xs text-[#a3a3a3] font-light leading-relaxed">
                        {car.description || "Premium self-drive option in Lucknow city. Fitted with smart electronics, rigid mileage limit configurations, and dual airbags for robust safety guidelines."}
                      </p>
                    </div>

                    <div className="border border-[#262626] rounded-lg overflow-hidden bg-[#0d0d0d]">
                      <table className="w-full text-xs font-mono">
                        <tbody>
                          <tr className="border-b border-[#262626]">
                            <td className="px-4 py-3 bg-[#111] text-[#737373] w-1/3">Brand</td>
                            <td className="px-4 py-3 text-white uppercase">{car.brand}</td>
                          </tr>
                          <tr className="border-b border-[#262626]">
                            <td className="px-4 py-3 bg-[#111] text-[#737373]">Model Variant</td>
                            <td className="px-4 py-3 text-white">{car.model}</td>
                          </tr>
                          <tr className="border-b border-[#262626]">
                            <td className="px-4 py-3 bg-[#111] text-[#737373]">Manufacturing Year</td>
                            <td className="px-4 py-3 text-white">{car.year}</td>
                          </tr>
                          <tr className="border-b border-[#262626]">
                            <td className="px-4 py-3 bg-[#111] text-[#737373]">Engine Fuel Type</td>
                            <td className="px-4 py-3 text-white">{car.fuel_type}</td>
                          </tr>
                          <tr className="border-b border-[#262626]">
                            <td className="px-4 py-3 bg-[#111] text-[#737373]">Gearbox Transmission</td>
                            <td className="px-4 py-3 text-white">{car.transmission}</td>
                          </tr>
                          <tr className="border-b border-[#262626]">
                            <td className="px-4 py-3 bg-[#111] text-[#737373]">Seats Seating</td>
                            <td className="px-4 py-3 text-white">{car.seats} Adult passengers</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 bg-[#111] text-[#737373]">Category Class</td>
                            <td className="px-4 py-3 text-white uppercase">{car.category}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 2. FEATURES TAB */}
                {activeTab === 'features' && (
                  <div className="space-y-4 text-left" id="tab-features-content">
                    <h3 className="font-display font-bold text-white text-lg">Curated Dashboard Equipment</h3>
                    {car.features && car.features.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                        {car.features.map((feat, idx) => (
                          <div 
                            key={idx} 
                            className="bg-[#0f0f0f] border border-[#202020] p-3 rounded-lg flex items-center gap-2.5 text-xs text-[#a3a3a3]"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#f97316] inline-block shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#737373]">AC Power Steering, Central Locking, Multimedia Bluetooth integration, Dual Airbags safety guards come pre-equipped.</p>
                    )}
                  </div>
                )}

                {/* 3. POLICIES TAB */}
                {activeTab === 'policy' && (
                  <div className="space-y-6 text-left" id="tab-policy-content">
                    <h3 className="font-display font-bold text-white text-lg">Terms & Conditions of Lucknow Trip</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="bg-[#0f0f0f] border border-[#262626] p-4.5 rounded-lg space-y-2">
                        <h4 className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#f97316] uppercase">
                          <Fuel size={14} /> Fuel Guideline Policy
                        </h4>
                        <p className="text-[11px] text-[#737373] leading-relaxed">
                          We deliver cars with a full tank of fuel. The vehicle should be returned with a full tank or we charge fuel re-fill rates accordingly.
                        </p>
                      </div>

                      <div className="bg-[#0f0f0f] border border-[#262626] p-4.5 rounded-lg space-y-2">
                        <h4 className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#facc15] uppercase">
                          <Ban size={14} /> Smoking & Fine Policies
                        </h4>
                        <p className="text-[11px] text-[#737373] leading-relaxed">
                          Smoking is strictly prohibited inside all Drive-Eaze cars. Clean air is highly key; any violations incur a flat ₹2,000 deep cleaning fine.
                        </p>
                      </div>

                      <div className="bg-[#0f0f0f] border border-[#262626] p-4.5 rounded-lg space-y-2">
                        <h4 className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#f97316] uppercase">
                          <ShieldAlert size={14} /> Traffic challans
                        </h4>
                        <p className="text-[11px] text-[#737373] leading-relaxed">
                          All online RTO Challans registered during the trip timeframe must be cleared by the customer prior to security deposit refunds.
                        </p>
                      </div>

                      <div className="bg-[#0f0f0f] border border-[#262626] p-4.5 rounded-lg space-y-2">
                        <h4 className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#facc15] uppercase">
                          <CalendarClock size={14} /> Cancellation Refund Scale
                        </h4>
                        <p className="text-[11px] text-[#737373] leading-relaxed">
                          Free cancellations made &gt;24 hours before pickup. 50% penalty charge within 24 hours. Zero refund within 6 hours of trip start.
                        </p>
                      </div>

                    </div>
                  </div>
                )}

                {/* 4. REVIEWS TAB */}
                {activeTab === 'reviews' && (
                  <div className="space-y-6 text-left" id="tab-reviews-content">
                    <div className="flex items-center justify-between border-b border-[#262626] pb-4">
                      <div>
                        <h3 className="font-display font-bold text-white text-lg">Verified Customer Reviews</h3>
                        <p className="text-xs text-[#737373] mt-1">Sourced from real travelers who booked this specific vehicle</p>
                      </div>
                      <div className="bg-[#0d0d0d] px-3 py-1.5 rounded border border-[#262626] font-mono text-[#f97316] font-black text-sm flex items-center gap-1">
                        <Star size={14} fill="currentColor" /> {car.rating || '4.9'} <span className="text-[10px] text-[#737373] font-normal">/5</span>
                      </div>
                    </div>

                    {reviews.length === 0 ? (
                      <div className="py-12 text-center bg-[#0d0d0d] rounded-lg border border-[#202020] space-y-2">
                        <Sparkles className="mx-auto text-[#facc15]" size={22} />
                        <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-white">Be the first to review!</h4>
                        <p className="text-xs text-[#737373] max-w-xs mx-auto">No reviews exist for this car in the database yet. Rent it and leave offline feedback in Gomti Nagar!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {reviews.map((r) => (
                          <div key={r.id} className="bg-[#0d0d0d] p-4 rounded-lg border border-[#202020] space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-[#f97316] text-black text-[10px] font-mono font-bold flex items-center justify-center">
                                  {r.reviewer_name?.charAt(0) || 'D'}
                                </span>
                                <span className="text-xs text-white font-bold">{r.reviewer_name}</span>
                              </div>
                              <div className="flex text-[#facc15] gap-0.5">
                                {Array.from({ length: r.rating }).map((_, i) => (
                                  <Star key={i} size={11} fill="currentColor" />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-[#737373] font-light italic leading-relaxed">
                              "{r.review_text}"
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>

          </div>

          {/* ────────────────────────────────────────────────────────────── */}
          {/* RIGHT 40%: STICKY RESERVATION CARD                             */}
          {/* ────────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-5 xl:col-span-4" id="car-detail-right-pane">
            <div className="sticky top-[100px] bg-[#161616] border border-[#262626] rounded-xl p-6 space-y-6 shadow-2xl" id="car-sticky-bookingcard">
              
              {/* Brand and Car header */}
              <div className="space-y-1 text-left">
                <span className="font-mono text-[10px] tracking-widest text-[#f97316] uppercase font-bold">{car.brand} Limited Edition</span>
                <h1 className="font-display font-black text-white text-2xl sm:text-3xl tracking-tight">
                  {car.name}
                </h1>
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex text-[#f97316] gap-0.5">
                    {[1,2,3,4,5].map(i => <Star key={i} size={12} fill="currentColor" />)}
                  </div>
                  <span className="font-mono text-[10px] text-[#737373] font-bold">({car.total_trips || 120} trips completed)</span>
                </div>
              </div>

              {/* Pricing Cards tier */}
              <div className="bg-[#0d0d0d] rounded-xl p-4 border border-[#202020] text-left space-y-3.5">
                <div>
                  <span className="font-mono text-[9px] text-[#737373] uppercase tracking-wider block">Standard Day Rate</span>
                  <div className="font-display font-black text-[#f97316] text-3xl flex items-baseline gap-1">
                    ₹{Number(car.price_per_day).toLocaleString('en-IN')}
                    <span className="text-xs font-mono font-normal text-[#737373]">/day</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center border-t border-[#202020] pt-3.5">
                  <div>
                    <span className="font-mono text-[8px] text-[#737373] uppercase block">Hourly</span>
                    <span className="font-display font-bold text-white text-sm">₹{car.price_per_hour}</span>
                  </div>
                  <div className="border-l border-r border-[#202020]">
                    <span className="font-mono text-[8px] text-[#737373] uppercase block">Weekly</span>
                    <span className="font-display font-bold text-white text-sm">₹{Math.round(Number(car.price_per_week) / 7)}</span>
                  </div>
                  <div>
                    <span className="font-mono text-[8px] text-[#737373] uppercase block">Monthly</span>
                    <span className="font-display font-bold text-white text-sm">₹{Math.round(Number(car.price_per_month) / 30)}</span>
                  </div>
                </div>
              </div>

              {/* Policy Quick bullet points */}
              <div className="space-y-3 font-mono text-[11px] text-[#737373] border-b border-[#262626]/60 pb-5 text-left">
                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5"><ReceiptText size={12} className="text-[#facc15]" /> Refundable Deposit</span>
                  <span className="text-white font-bold">₹{Number(car.deposit_amount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5"><BadgeInfo size={12} className="text-[#f97316]" /> Daily Km threshold</span>
                  <span className="text-white font-bold">{car.km_limit_per_day} KM / day</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5"><ShieldAlert size={12} className="text-[#facc15]" /> Excess Km billing</span>
                  <span className="text-white font-bold">₹{car.extra_km_charge}/KM surcharge</span>
                </div>
              </div>

              {/* Call to action trigger button */}
              <div className="space-y-3">
                <Link
                  to={isAvailable ? `/booking/${car.id}` : '#'}
                  onClick={(e) => {
                    if (!isAvailable) {
                      e.preventDefault();
                      toast.error("Vehicle is pre-booked by another client. Try a different SUV!");
                    }
                  }}
                  className={`w-full py-4 rounded-lg font-display font-bold text-sm text-center flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                    isAvailable 
                      ? 'bg-[#f97316] text-black border-[#f97316] hover:bg-orange-600 active:scale-95' 
                      : 'bg-[#202020] text-gray-500 border-[#262626] cursor-not-allowed'
                  }`}
                  id="right-cta-booknow"
                >
                  {isAvailable ? "Proceed to Booking Inquiry" : "Current Vehicle is Unavailable"}
                </Link>

                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={waPreloadedLink}
                    target="_blank"
                    rel="noreferrer"
                    className="py-3 bg-[#111] hover:bg-[#202020] border border-[#262626] rounded text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5"
                    title="Send prefilled message"
                  >
                    <MessageSquare size={14} className="text-green-500" /> WhatsApp
                  </a>
                  <a
                    href={getPhoneLink(phone)}
                    className="py-3 bg-[#111] hover:bg-[#202020] border border-[#262626] rounded text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5"
                  >
                    <Phone size={14} className="text-[#f97316]" /> Call Desk
                  </a>
                </div>
              </div>

              {/* Safety notice disclaimer */}
              <p className="text-[10px] text-[#737373] text-center font-sans">
                🛡️ All cars come with registered GPS security tags & standard comprehensive comprehensive third party vehicle insurance templates.
              </p>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
