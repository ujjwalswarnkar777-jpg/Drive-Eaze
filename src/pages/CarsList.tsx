/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Fuel, Gauge, User, ArrowRight, Table, AlertCircle } from 'lucide-react';
import { db, subscribeToRealtime } from '../lib/supabase';
import { Car, CarCategory, FuelType, TransmissionType } from '../types';
import { CarCardSkeleton } from '../components/Skeleton';

export default function CarsList() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  // States for filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedFuel, setSelectedFuel] = useState<string>('All');
  const [selectedTransmission, setSelectedTransmission] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('Price (Low-High)');
  const [showAvailableOnly, setShowAvailableOnly] = useState<boolean>(true);

  const loadCars = async () => {
    try {
      const data = await db.getCars(true); // Always fetch all to allow state toggling on client
      setCars(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCars();
    return subscribeToRealtime('cars', loadCars);
  }, []);

  // Filter and sort computation
  const filteredCars = cars.filter((car) => {
    // 1. Search text (matches brand or name)
    const matchesSearch = 
      car.brand.toLowerCase().includes(search.toLowerCase()) ||
      car.name.toLowerCase().includes(search.toLowerCase());

    // 2. Category tab
    const matchesCategory = selectedCategory === 'All' || car.category === selectedCategory;

    // 3. Fuel type
    const matchesFuel = selectedFuel === 'All' || car.fuel_type === selectedFuel;

    // 4. Transmission type
    const matchesTransmission = selectedTransmission === 'All' || car.transmission === selectedTransmission;

    // 5. Availability Status filter
    const matchesAvailability = !showAvailableOnly || car.status === 'available';

    return matchesSearch && matchesCategory && matchesFuel && matchesTransmission && matchesAvailability;
  });

  const sortedCars = [...filteredCars].sort((a, b) => {
    switch (sortBy) {
      case 'Price (Low-High)':
        return Number(a.price_per_day) - Number(b.price_per_day);
      case 'Price (High-Low)':
        return Number(b.price_per_day) - Number(a.price_per_day);
      case 'Rating':
        return b.rating - a.rating;
      case 'Newest':
        return b.year - a.year;
      default:
        return 0;
    }
  });

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedFuel('All');
    setSelectedTransmission('All');
    setSortBy('Price (Low-High)');
    setShowAvailableOnly(true);
  };

  return (
    <div className="bg-[#0d0d0d] min-h-screen text-[#f5f5f5]" id="cars-list-container">
      
      {/* ────────────────────────────────────────────────────────────────── */}
      {/* TOP HEADER SECTION                                                 */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <div className="border-b border-[#262626] py-16 bg-[#0a0a0a]" id="cars-list-banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-mono text-xs text-[#f97316] uppercase mb-2 tracking-widest">[03] / Current Fleet</p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl sm:text-5xl font-black text-white">Browse our fleet.</h1>
              <p className="text-xs text-[#737373] mt-2">
                 Lucknow's premier luxury self-drive fleet. Fully sanitized & GPS guarded.
              </p>
            </div>
            {/* Live Count Counter */}
            <div className="bg-[#161616] border border-[#262626] px-4 py-2.5 rounded-lg text-xs font-mono">
              Showing <span className="text-[#f97316] font-bold">{sortedCars.length}</span> live matching vehicles
            </div>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* FILTER & SORTING MECHANISMS PANEL                                 */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <div className="sticky top-[80px] z-30 bg-[#0d0d0d]/95 backdrop-blur-md border-b border-[#262626] py-4" id="cars-sticky-filterbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            
            {/* Search Input Filter */}
            <div className="lg:col-span-4 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                type="text" 
                placeholder="Search brand or model (e.g. Thar, Swift)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#161616] border border-[#262626] text-sm text-white rounded-lg focus:outline-none focus:border-[#f97316]/60 font-sans"
              />
            </div>

            {/* Fuel dropdown */}
            <div className="lg:col-span-2 relative">
              <select
                value={selectedFuel}
                onChange={(e) => setSelectedFuel(e.target.value)}
                className="w-full bg-[#161616] text-white border border-[#262626] focus:border-[#f97316]/60 rounded-lg text-xs p-3 focus:outline-none"
              >
                <option value="All">All Fuel Types</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="CNG">CNG</option>
                <option value="Electric">Electric</option>
              </select>
            </div>

            {/* Transmission dropdown */}
            <div className="lg:col-span-2 relative">
              <select
                value={selectedTransmission}
                onChange={(e) => setSelectedTransmission(e.target.value)}
                className="w-full bg-[#161616] text-white border border-[#262626] focus:border-[#f97316]/60 rounded-lg text-xs p-3 focus:outline-none"
              >
                <option value="All">All Gearboxes</option>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="lg:col-span-2 relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-[#161616] text-white border border-[#262626] focus:border-[#f97316]/60 rounded-lg text-xs p-3 focus:outline-none"
              >
                <option value="Price (Low-High)">Price (Low-High)</option>
                <option value="Price (High-Low)">Price (High-Low)</option>
                <option value="Rating">Top Rated</option>
                <option value="Newest">Newest Fleet</option>
              </select>
            </div>

            {/* Available Toggle Checkbox */}
            <div className="lg:col-span-2 flex items-center justify-end">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={showAvailableOnly}
                  onChange={(e) => setShowAvailableOnly(e.target.checked)}
                  className="w-4 h-4 accent-[#f97316] bg-[#161616] border-[#262626] rounded focus:ring-0" 
                />
                <span className="text-xs font-mono font-medium text-white hover:text-[#f97316] transition-colors">Available Only</span>
              </label>
            </div>

          </div>

          {/* Category Tabs Selection */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1" id="category-scroller-tabs">
            {['All', 'Hatchback', 'Sedan', 'SUV', 'Luxury', 'MUV'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-xs font-mono font-bold rounded-full border transition-all cursor-pointer ${
                  selectedCategory === cat 
                    ? 'bg-[#f97316] text-black border-[#f97316]' 
                    : 'bg-[#161616] hover:bg-[#202020] text-[#a3a3a3] border-[#262626]'
                }`}
              >
                {cat}
              </button>
            ))}
            
            {/* Helper to reset filters */}
            {(search || selectedCategory !== 'All' || selectedFuel !== 'All' || selectedTransmission !== 'All' || !showAvailableOnly) && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs text-[#737373] hover:text-white underline cursor-pointer ml-auto font-mono"
              >
                Reset All Filters
              </button>
            )}
          </div>

        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* CAR GRID RENDERING AREA                                           */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" id="cars-grid-body">
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => <CarCardSkeleton key={i} />)}
          </div>
        ) : sortedCars.length === 0 ? (
          
          /* Empty Search and filter States */
          <div className="bg-[#161616] border border-[#262626] rounded-xl py-20 px-4 text-center max-w-2xl mx-auto">
            <AlertCircle size={44} className="text-[#f97316] mx-auto mb-4" />
            <h3 className="font-display font-bold text-xl text-white mb-2">No cars available.</h3>
            <p className="text-xs text-[#737373] max-w-sm mx-auto mb-8">
              We couldn't find any vehicles matching your selected filters. Let our staff check the back parking lot for you instead!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 bg-[#262626] hover:bg-[#333] text-white text-xs font-mono font-semibold rounded cursor-pointer transition-colors"
              >
                Clear Search Filter
              </button>
              <a
                href="https://wa.me/918960695050"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 bg-[#f97316] hover:bg-orange-600 text-black text-xs font-mono font-semibold rounded cursor-pointer transition-colors"
              >
                WhatsApp Direct Inquiry
              </a>
            </div>
          </div>

        ) : (
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedCars.map((car) => {
              const isUnavailable = car.status !== 'available';
              return (
                <div 
                  key={car.id} 
                  className={`bg-[#161616] border rounded-xl overflow-hidden group transition-all duration-300 flex flex-col justify-between ${
                    isUnavailable 
                      ? 'border-[#262626] opacity-75' 
                      : 'border-[#262626] hover:border-[#f97316]/30'
                  }`}
                >
                  
                  {/* Visual card header cover */}
                  <div className="relative aspect-video bg-black overflow-hidden select-none">
                    <img 
                      src={car.images[0]} 
                      alt={car.name} 
                      className={`w-full h-full object-cover transition-transform duration-500 ${
                        isUnavailable ? 'grayscale blur-[1px]' : 'group-hover:scale-105'
                      }`}
                      referrerPolicy="no-referrer"
                    />

                    {/* Left overlay tag */}
                    <div className="absolute top-4 left-4 bg-black/80 px-3 py-1 rounded border border-[#262626] font-mono text-[9px] text-[#a3a3a3] uppercase tracking-wider">
                      {car.category}
                    </div>

                    {/* Status Ring overlay badge */}
                    <div className="absolute top-4 right-4 bg-[#0d0d0d]/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#262626] flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        car.status === 'available' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 
                        car.status === 'booked' ? 'bg-rose-500' : 
                        'bg-amber-500'
                      }`} />
                      <span className="font-mono text-[9px] uppercase tracking-wider text-white">{car.status}</span>
                    </div>

                    {/* Booked / Maintenance watermark banner cover */}
                    {isUnavailable && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                        <span className="font-display font-black uppercase text-xl text-stone-300 border-2 border-stone-300 px-4 py-1.5 tracking-widest rotate-6">
                          {car.status === 'booked' ? 'Booked Out' : 'Under Service'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Visual card content details */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                    <div>
                      <div className="flex justify-between items-start mb-1.5">
                        <h2 className="font-display font-bold text-xl text-white group-hover:text-[#f97316] transition-colors line-clamp-1">
                          {car.brand} {car.name}
                        </h2>
                        <span className="font-mono text-xs text-[#737373]">{car.year}</span>
                      </div>
                      <p className="text-xs text-[#737373] line-clamp-2 min-h-[32px] font-sans font-light mb-4">{car.description}</p>

                      {/* Fleet Spec metrics row */}
                      <div className="grid grid-cols-3 gap-2 text-xs font-mono text-[#a3a3a3] mb-4">
                        <div className="bg-[#0c0c0c] border border-[#262626] p-2 rounded text-center">
                          <Fuel size={12} className="text-[#f97316] mx-auto mb-1" />
                          <span>{car.fuel_type}</span>
                        </div>
                        <div className="bg-[#0c0c0c] border border-[#262626] p-2 rounded text-center">
                          <Gauge size={12} className="text-[#facc15] mx-auto mb-1" />
                          <span className="line-clamp-1">{car.transmission}</span>
                        </div>
                        <div className="bg-[#0c0c0c] border border-[#262626] p-2 rounded text-center">
                          <User size={12} className="text-[#f97316] mx-auto mb-1" />
                          <span>{car.seats} Captain</span>
                        </div>
                      </div>

                      {/* Deposit and policy terms */}
                      <div className="bg-[#0d0d0d] rounded-lg p-3 border border-[#202020] text-[10px] font-mono text-[#737373] space-y-1">
                        <div className="flex justify-between">
                          <span>Security Deposit:</span>
                          <span className="text-white">₹{Number(car.deposit_amount).toLocaleString('en-IN')} (Refundable)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Trip Limit / Day:</span>
                          <span className="text-white">{car.km_limit_per_day} KM included</span>
                        </div>
                      </div>
                    </div>

                    {/* Book / View Button footer row */}
                    <div className="border-t border-[#262626] pt-4 mt-auto flex items-end justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="font-display font-black text-[#f97316] text-2xl leading-none">
                          ₹{Number(car.price_per_day).toLocaleString('en-IN')}
                          <span className="text-xs font-mono font-normal text-[#737373]">/day</span>
                        </div>
                        <div className="font-mono text-[9px] text-[#737373]">
                          ₹{car.price_per_hour}/hour standard tier
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Link
                          to={`/cars/${car.id}`}
                          className="px-3.5 py-2 hover:bg-[#202020] border border-[#262626] text-white text-xs font-mono font-bold rounded cursor-pointer transition-all"
                        >
                          Specs
                        </Link>
                        
                        <Link
                          to={isUnavailable ? '#' : `/booking/${car.id}`}
                          onClick={(e) => {
                            if (isUnavailable) { e.preventDefault(); alert("This vehicle is currently booked or undergoing maintenance and cannot be reserved."); }
                          }}
                          className={`px-4.5 py-2.5 font-display font-medium text-xs rounded border transition-all flex items-center gap-1 cursor-pointer ${
                            isUnavailable 
                              ? 'bg-[#202020] border-[#262626] text-[#737373] cursor-not-allowed'
                              : 'bg-[#f97316] border-[#f97316] hover:bg-orange-600 text-black font-bold active:scale-95'
                          }`}
                        >
                          Book Now
                        </Link>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

        )}

      </div>

    </div>
  );
}
