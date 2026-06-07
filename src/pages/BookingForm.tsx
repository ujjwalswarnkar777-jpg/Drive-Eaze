/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../lib/supabase';
import { Car, Booking } from '../types';
import { ArrowLeft, Calculator, KeyRound, MessageSquare, ShieldAlert, Sparkles, CheckCircle2, Calendar, Clock } from 'lucide-react';
import { toast } from '../components/Toast';
import { getWhatsAppLink as getWhatsAppAppFallback, isMobileUser } from '../lib/deepLink';
import DateTimePicker from '../components/DateTimePicker';

export default function BookingForm() {
  const { carId } = useParams<{ carId: string }>();
  const navigate = useNavigate();

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // Sane initialization values for pickers (today & tomorrow 10:00 AM)
  const getTodayWithTime = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T10:00`;
  };

  const getTomorrowWithTime = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T10:00`;
  };

  const [pickupDate, setPickupDate] = useState(getTodayWithTime());
  const [returnDate, setReturnDate] = useState(getTomorrowWithTime());

  const [pickupLocation, setPickupLocation] = useState('Shop K 02, Kisan Bazar, Gomti Nagar, Lucknow');
  const [dropLocation, setDropLocation] = useState('Shop K 02, Kisan Bazar, Gomti Nagar, Lucknow');
  const [notes, setNotes] = useState('');

  // Settle States
  const [calcHours, setCalcHours] = useState(0);
  const [selectedTier, setSelectedTier] = useState<'hourly' | 'daily' | 'weekly' | 'monthly'>('daily');
  const [priceBreakdown, setPriceBreakdown] = useState({
    base: 0,
    deposit: 0,
    total: 0
  });

  const [submitting, setSubmitting] = useState(false);
  const [successBooking, setSuccessBooking] = useState<Booking | null>(null);

  useEffect(() => {
    async function loadCar() {
      if (!carId) return;
      try {
        const item = await db.getCarById(carId);
        if (!item) {
          toast.error("Selected vehicle no longer available.");
          navigate('/cars');
          return;
        }
        setCar(item);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    }
    loadCar();
  }, [carId]);

  // Handle live math pricing calculation
  useEffect(() => {
    if (!car || !pickupDate || !returnDate) {
      setCalcHours(0);
      setPriceBreakdown({ base: 0, deposit: Number(car?.deposit_amount || 5000), total: Number(car?.deposit_amount || 5000) });
      return;
    }

    const start = new Date(pickupDate).getTime();
    const end = new Date(returnDate).getTime();

    if (end <= start) {
      setCalcHours(0);
      return;
    }

    const diffMs = end - start;
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    setCalcHours(diffHours);

    const diffDays = diffHours / 24;

    // Pick best pricing tier mathematically
    let computedTier: 'hourly' | 'daily' | 'weekly' | 'monthly' = 'daily';
    let basePrice = 0;

    if (diffDays >= 28) {
      computedTier = 'monthly';
      // Compute monthly chunks + remainder
      const months = Math.floor(diffDays / 30);
      const remainderDays = diffDays % 30;
      basePrice = (months * Number(car.price_per_month)) + (remainderDays * Number(car.price_per_day));
    } else if (diffDays >= 7) {
      computedTier = 'weekly';
      const weeks = Math.floor(diffDays / 7);
      const remainderDays = diffDays % 7;
      basePrice = (weeks * Number(car.price_per_week)) + (remainderDays * Number(car.price_per_day));
    } else if (diffHours >= 24) {
      computedTier = 'daily';
      basePrice = Math.ceil(diffDays) * Number(car.price_per_day);
    } else {
      computedTier = 'hourly';
      basePrice = diffHours * Number(car.price_per_hour);
    }

    // Double check if hourly is worse than daily limit
    if (computedTier === 'hourly' && basePrice > Number(car.price_per_day)) {
      computedTier = 'daily';
      basePrice = Number(car.price_per_day);
    }

    const deposit = Number(car.deposit_amount);
    const total = basePrice + deposit;

    setSelectedTier(computedTier);
    setPriceBreakdown({
      base: Math.round(basePrice),
      deposit,
      total: Math.round(total)
    });

  }, [car, pickupDate, returnDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!car) return;

    if (!customerName || !customerPhone || !pickupDate || !returnDate) {
      toast.error("Please fill in all required high priority fields.");
      return;
    }

    // Indian phone format simple validation
    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      toast.error("Please enter a valid 10-digit Indian WhatsApp Number.");
      return;
    }

    if (calcHours <= 0) {
      toast.error("Return date must be strictly after pickup date & time.");
      return;
    }

    setSubmitting(true);

    try {
      const bookingData = {
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail || undefined,
        car_id: car.id,
        start_time: pickupDate,
        end_time: returnDate,
        pickup_location: pickupLocation,
        drop_location: dropLocation,
        duration_type: selectedTier,
        total_hours: calcHours,
        total_amount: priceBreakdown.base,
        deposit_paid: false,
        payment_status: 'pending' as const,
        booking_status: 'upcoming' as const,
        notes: notes || undefined
      };

      const result = await db.createBooking(bookingData);
      setSuccessBooking(result);
      toast.success("🚗 Booking Inquiry Registered Successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit booking inquiry.");
    } finally {
      setSubmitting(false);
    }
  };

  // Construct pre-filled WhatsApp message for success redirect
  const getWhatsAppLink = () => {
    if (!successBooking || !car) return '#';
    const startStr = new Date(successBooking.start_time).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
    const endStr = new Date(successBooking.end_time).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
    
    const text = `Hi Drive-Eaze! I have submitted a booking inquiry on your website.\n\n` + 
                 `*Ref Code:* ${successBooking.booking_ref}\n` +
                 `*Car Model:* ${car.brand} ${car.name}\n` +
                 `*Customer Name:* ${successBooking.customer_name}\n` +
                 `*Pickup Time:* ${startStr}\n` +
                 `*Return Time:* ${endStr}\n` +
                 `*Calculated Base Price:* ₹${successBooking.total_amount}\n\n` +
                 `Please confirm my booking and verify my details. Thank you!`;
    
    return getWhatsAppAppFallback('918960695050', text);
  };

  if (loading) {
    return (
      <div className="bg-[#0d0d0d] text-center py-24 animate-pulse">
        <Calculator className="mx-auto text-orange-500 mb-4 animate-spin" size={40} />
        <p className="text-[#737373] text-sm">Synchronizing live rate catalogs...</p>
      </div>
    );
  }

  if (!car) return null;

  return (
    <div className="bg-[#0d0d0d] min-h-screen text-[#f5f5f5]" id="booking-inquiry-viewport">
      
      {/* HEADER BAR */}
      <div className="border-b border-[#262626] py-6 bg-[#0a0a0a]" id="booking-navline">
        <div className="max-w-7xl mx-auto px-4">
          <Link 
            to={`/cars/${car.id}`} 
            className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase text-gray-400 hover:text-[#f97316]"
          >
            <ArrowLeft size={14} /> Back to {car.name} Spec sheets
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12" id="booking-inquiry-layout">
        
        {/* SUCCESS OVERLAY STATE SCREEN */}
        {successBooking ? (
          <div className="bg-[#161616] border border-[#262626] rounded-2xl p-8 sm:p-16 max-w-xl mx-auto text-center space-y-8 shadow-2xl relative" id="booking-success-box">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="inline-flex items-center justify-center p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full">
              <CheckCircle2 size={44} />
            </div>

            <div className="space-y-3">
              <span className="font-mono text-xs text-[#737373] uppercase tracking-widest">[ SUCCESS REGISTRATION ]</span>
              <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-white">Inquiry Registered!</h1>
              <div className="bg-[#0b0b0b] px-4 py-2 bg-[#0c0c0c] border border-[#262626] rounded font-mono text-white text-sm inline-block tracking-widest">
                REF: {successBooking.booking_ref}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#737373] leading-relaxed max-w-sm mx-auto">
              We have successfully locked this vehicle for your selected dates. To complete verification and release the keys, please send this auto formatted reference code to our Gomti Nagar office on WhatsApp.
            </p>

            <div className="space-y-3 pt-4">
              <a 
                href={getWhatsAppLink()} 
                target="_blank"  
                rel="noreferrer"
                className="w-full sm:w-auto px-8 py-3.5 bg-[#f97316] hover:bg-orange-600 font-display font-black text-black rounded-lg transition-all active:scale-95 text-center flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-500/10"
              >
                <MessageSquare size={18} /> Confirm booking on WhatsApp
              </a>

              <Link 
                to="/cars" 
                className="block text-xs font-mono text-[#737373] hover:text-[#fcc15] underline pt-2"
              >
                Browse other vehicles
              </Link>
            </div>
          </div>
        ) : (
          
          /* VIEW 1: ACTIVE INQUIRY FORM */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Col: Capturing fields */}
            <form onSubmit={handleSubmit} className="lg:col-span-7 bg-[#161616] border border-[#262626] rounded-xl p-6 sm:p-8 space-y-6" id="booking-form-box">
              
              <div className="border-b border-[#262626] pb-4" id="booking-headline">
                <h2 className="font-display text-2xl font-black text-white">Inquire Reservation.</h2>
                <p className="text-xs text-[#737373] mt-1">Submit your name & trip times. Standard approval takes &lt;15 mins.</p>
              </div>

              <div className="space-y-4" id="form-fields-group">
                
                {/* 1. Name */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-mono font-medium text-white block">Full Name <span className="text-[#f97316]">*</span></label>
                  <input 
                    type="text" 
                    required
                    placeholder="Enter your registered name (e.g. Aditya Gupta)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-[#0d0d0d] border border-[#262626] text-white text-xs p-3.5 rounded-lg focus:outline-none focus:border-[#f97316]"
                  />
                </div>

                {/* 2. Indian WhatsApp */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-mono font-medium text-white block">Indian WhatsApp Number <span className="text-[#f97316]">*</span></label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-[#737373]">+91</span>
                    <input 
                      type="tel" 
                      required
                      placeholder="8960695050"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full pl-12 pr-4 bg-[#0d0d0d] border border-[#262626] text-white text-xs p-3.5 rounded-lg focus:outline-none focus:border-[#f97316] font-mono"
                    />
                  </div>
                  <span className="text-[10px] text-[#737373] font-mono block">We will message booking status to this number instantly</span>
                </div>

                {/* 3. Email */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-mono font-medium text-[#737373] block">Email Address (Optional)</label>
                  <input 
                    type="email" 
                    placeholder="e.g. customer@gmail.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-[#0d0d0d] border border-[#262626] text-white text-xs p-3.5 rounded-lg focus:outline-none focus:border-[#f97316]"
                  />
                </div>

                {/* 4. Dates row with Premium Custom DateTimePickers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
                  {/* Start Pickup Section */}
                  <div className="space-y-3 bg-[#0a0a0a] p-4 rounded-xl border border-[#1b1b1b] relative">
                    <div className="flex items-center justify-between border-b border-[#181818] pb-1.5 mb-1">
                      <span className="text-[10px] uppercase tracking-wider text-[#dfb15b] font-mono font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> [01] START SCHEDULE
                      </span>
                    </div>
                    <DateTimePicker 
                      label="Pickup Date & Time"
                      value={pickupDate}
                      onChange={(val) => setPickupDate(val)}
                      idPrefix="pickup"
                    />
                  </div>

                  {/* Return Drop Section */}
                  <div className="space-y-3 bg-[#0a0a0a] p-4 rounded-xl border border-[#1b1b1b] relative">
                    <div className="flex items-center justify-between border-b border-[#181818] pb-1.5 mb-1">
                      <span className="text-[10px] uppercase tracking-wider text-[#dfb15b] font-mono font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> [02] RETURN SCHEDULE
                      </span>
                    </div>
                    <DateTimePicker 
                      label="Return Date & Time"
                      value={returnDate}
                      onChange={(val) => setReturnDate(val)}
                      minDate={pickupDate ? pickupDate.split('T')[0] : undefined}
                      idPrefix="return"
                    />
                  </div>
                </div>

                {/* 5. Locations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-mono font-medium text-[#737373] block">Delivery Location</label>
                    <input 
                      type="text" 
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      className="w-full bg-[#0d0d0d] border border-[#262626] text-white text-[11px] p-3 rounded-lg focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-mono font-medium text-[#737373] block">Return Location</label>
                    <input 
                      type="text" 
                      value={dropLocation}
                      onChange={(e) => setDropLocation(e.target.value)}
                      className="w-full bg-[#0d0d0d] border border-[#262626] text-white text-[11px] p-3 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                {/* 6. Special Requests */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-mono font-medium text-[#737373] block">Special instructions / notes (Optional)</label>
                  <textarea 
                    rows={3}
                    placeholder="e.g. Please deliver at Hazratganj crossroads at 8:00 AM, clean car glass thoroughly."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-[#0d0d0d] border border-[#262626] text-white text-xs p-3.5 rounded-lg focus:outline-none focus:border-[#f97316] resize-none"
                  />
                </div>

              </div>

              {/* Submit panel */}
              <div className="pt-4 border-t border-[#2d2d2d] text-left">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-[#f97316] hover:bg-orange-600 disabled:bg-[#202020] text-black font-display font-black text-sm rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  {submitting ? "Registering and locking lot..." : "Submit Reservation Inquiry 🚗"}
                </button>
              </div>

            </form>

            {/* Right Col: Price calculator breakdown summary */}
            <div className="lg:col-span-5 space-y-6" id="booking-right-calculator">
              
              {/* Selected Car header */}
              <div className="bg-[#161616] border border-[#262626] rounded-xl p-5 text-left space-y-3.5">
                <div className="aspect-video bg-black rounded overflow-hidden select-none">
                  <img src={car.images[0]} alt={car.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="font-mono text-[9px] text-[#f97316] uppercase tracking-wider font-bold">{car.brand} Luxury</span>
                  <h3 className="font-display font-extrabold text-white text-lg leading-none">{car.name}</h3>
                  <span className="font-mono text-[9px] text-[#737373] uppercase tracking-wider mt-1 block">Lucknow, Uttar Pradesh</span>
                </div>
              </div>

              {/* Live Calculator breakdown card */}
              <div className="bg-[#161616] border border-[#262626] rounded-xl p-6 text-left space-y-6">
                
                <h3 className="font-display font-bold text-white text-sm flex items-center gap-1">
                  <Calculator size={16} className="text-[#f97316]" /> Live Expense Calculator
                </h3>

                {calcHours > 0 ? (
                  <div className="space-y-4" id="live-calculator-breakdown">
                    
                    {/* Duration math */}
                    <div className="flex justify-between items-center text-xs border-b border-[#262626] pb-4">
                      <span className="text-[#a3a3a3] font-sans">Total Duration:</span>
                      <span className="font-mono font-bold text-white bg-black px-2.5 py-1 rounded">
                        {calcHours} Hours ({Math.ceil(calcHours / 24)} Days)
                      </span>
                    </div>

                    {/* Applied Rate Tier */}
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#a3a3a3]">Best Match Rate Strategy:</span>
                      <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                        {selectedTier} Rates
                      </span>
                    </div>

                    {/* Breakdowns list */}
                    <div className="space-y-2 border-t border-b border-[#262626] py-4 text-xs font-mono text-[#737373]">
                      <div className="flex justify-between text-white">
                        <span>Base Rental Amount:</span>
                        <span>₹{priceBreakdown.base.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Refundable Security Deposit:</span>
                        <span>₹{priceBreakdown.deposit.toLocaleString('en-IN')}</span>
                      </div>
                      <span className="text-[9px] text-[#737373] block italic mt-1">
                        * The Security Deposit is 100% refunded within 24 hrs of return.
                      </span>
                    </div>

                    {/* Grand Total */}
                    <div className="flex justify-between items-baseline pt-2">
                      <span className="text-xs text-white">Estimated Grand Total:</span>
                      <div className="text-right">
                        <span className="font-display font-black text-white text-3xl">₹{priceBreakdown.total.toLocaleString('en-IN')}</span>
                        <span className="text-[10px] text-[#737373] font-mono block mt-0.5">* Including Base + Security</span>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="py-12 text-center space-y-2">
                    <Sparkles className="mx-auto text-amber-500 animate-pulse" size={24} />
                    <h4 className="text-xs font-mono font-bold text-[#737373] uppercase tracking-wider">Awaiting Trip Parameters</h4>
                    <p className="text-xs text-[#525252] max-w-xs mx-auto font-sans">Select your start & return dates to display exact pricing tier comparisons live on screen.</p>
                  </div>
                )}

                {/* Limits reminder */}
                <div className="bg-[#0e0e0e] border border-[#202020] rounded-lg p-4 space-y-2 text-xs text-[#737373] font-mono leading-tight">
                  <div className="flex justify-between text-white text-xs font-bold">
                    <span>Includes:</span>
                    <span>300 KMs / day</span>
                  </div>
                  <p className="text-[10px] leading-relaxed">
                    Extra distance driven beyond daily limits is charged straight at ₹{car.extra_km_charge}/KM. Keep keys returned on time to prevent extensions penalties.
                  </p>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}
