/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { db, subscribeToRealtime } from '../../lib/supabase';
import { Car, CarCategory, FuelType, TransmissionType } from '../../types';
import { 
  Plus, Edit2, Trash2, CheckCircle2, XCircle, Star, Sparkles, 
  Tag, ListPlus, X, HelpCircle, Eye, RefreshCw 
} from 'lucide-react';
import { toast } from '../Toast';
import { TableSkeleton } from '../Skeleton';

export default function CarsTab() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  // Form overlay states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);

  // Form Fields
  const [brand, setBrand] = useState('');
  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(2024);
  const [category, setCategory] = useState<CarCategory>('SUV');
  const [fuelType, setFuelType] = useState<FuelType>('Petrol');
  const [transmission, setTransmission] = useState<TransmissionType>('Automatic');
  const [seats, setSeats] = useState(5);
  const [priceHour, setPriceHour] = useState(150);
  const [priceDay, setPriceDay] = useState(1999);
  const [priceWeek, setPriceWeek] = useState(11999);
  const [priceMonth, setPriceMonth] = useState(39999);
  const [kmLimit, setKmLimit] = useState(300);
  const [extraKm, setExtraKm] = useState(12);
  const [deposit, setDeposit] = useState(5000);
  const [location, setLocation] = useState('Lucknow');
  const [status, setStatus] = useState<'available' | 'booked' | 'maintenance'>('available');
  const [isFeatured, setIsFeatured] = useState(true);
  const [description, setDescription] = useState('');
  
  // Tag input states
  const [features, setFeatures] = useState<string[]>(['Smart AC', 'Ventilated Seats', 'GPS Security Guard', 'Apple CarPlay']);
  const [tagInput, setTagInput] = useState('');
  
  // Image list inputs
  const [imageUrls, setImageUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop'
  ]);
  const [newUrlInput, setNewUrlInput] = useState('');

  const loadCars = async () => {
    try {
      const all = await db.getCars(true);
      setCars(all);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCars();
    return subscribeToRealtime('cars', loadCars);
  }, []);

  const openAddForm = () => {
    setEditingCar(null);
    setBrand('');
    setName('');
    setModel('');
    setYear(2024);
    setCategory('SUV');
    setFuelType('Petrol');
    setTransmission('Automatic');
    setSeats(5);
    setPriceHour(150);
    setPriceDay(1999);
    setPriceWeek(11999);
    setPriceMonth(39999);
    setKmLimit(300);
    setExtraKm(12);
    setDeposit(5000);
    setLocation('Lucknow');
    setStatus('available');
    setIsFeatured(true);
    setDescription('');
    setFeatures(['Digital AC Air Conditioner', 'Bluetooth Audio Infotainment', 'Steering Mounted Controls', 'Rear Parking Sensors']);
    setImageUrls([
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop'
    ]);
    setShowAddForm(true);
  };

  const openEditForm = (car: Car) => {
    setEditingCar(car);
    setBrand(car.brand);
    setName(car.name);
    setModel(car.model);
    setYear(car.year);
    setCategory(car.category);
    setFuelType(car.fuel_type);
    setTransmission(car.transmission);
    setSeats(car.seats);
    setPriceHour(Number(car.price_per_hour));
    setPriceDay(Number(car.price_per_day));
    setPriceWeek(Number(car.price_per_week));
    setPriceMonth(Number(car.price_per_month));
    setKmLimit(Number(car.km_limit_per_day));
    setExtraKm(Number(car.extra_km_charge));
    setDeposit(Number(car.deposit_amount));
    setLocation(car.location || 'Lucknow');
    setStatus(car.status);
    setIsFeatured(car.is_featured);
    setDescription(car.description || '');
    setFeatures(car.features || []);
    setImageUrls(car.images || []);
    setShowAddForm(true);
  };

  const deleteCar = async (id: string, name: string) => {
    if (confirm(`Are you absolutely sure you want to permanently remove ${name} from key records?`)) {
      try {
        await db.deleteCar(id);
        toast.success("Car deleted from local and cloud state!");
        loadCars();
      } catch (err) {
        toast.error("Failed to delete.");
      }
    }
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    try {
      await db.updateCar(id, { is_featured: !current });
      toast.success("Featured status swapped successfully!");
      loadCars();
    } catch (err) {
      toast.error("Failed to swap featured tag.");
    }
  };

  const cycleStatus = async (id: string, current: string) => {
    let next: 'available' | 'booked' | 'maintenance' = 'available';
    if (current === 'available') next = 'booked';
    else if (current === 'booked') next = 'maintenance';
    
    try {
      await db.updateCar(id, { status: next });
      toast.success(`Lot status set to ${next.toUpperCase()}`);
      loadCars();
    } catch (err) {
      toast.error("Status update error.");
    }
  };

  // Tag interactions
  const renderTagInputPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = tagInput.trim();
      if (val && !features.includes(val)) {
        setFeatures([...features, val]);
        setTagInput('');
      }
    }
  };

  const removeTag = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  // Image URL helpers
  const addImageUrl = () => {
    const val = newUrlInput.trim();
    if (val && !imageUrls.includes(val)) {
      setImageUrls([...imageUrls, val]);
      setNewUrlInput('');
    }
  };

  const removeImageUrl = (index: number) => {
    if (imageUrls.length <= 1) {
      toast.error("Vehicle must have at least 1 visual image URL.");
      return;
    }
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const saveCar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!brand || !name || !model || !year) {
      toast.error("Must supply Brand, Name, Year, and model.");
      return;
    }

    const payload = {
      brand,
      name,
      model,
      year: Number(year),
      category,
      fuel_type: fuelType,
      transmission,
      seats: Number(seats),
      price_per_hour: Number(priceHour),
      price_per_day: Number(priceDay),
      price_per_week: Number(priceWeek),
      price_per_month: Number(priceMonth),
      km_limit_per_day: Number(kmLimit),
      extra_km_charge: Number(extraKm),
      deposit_amount: Number(deposit),
      location,
      status,
      is_featured: isFeatured,
      description,
      features,
      images: imageUrls
    };

    try {
      if (editingCar) {
        await db.updateCar(editingCar.id, payload);
        toast.success("✅ Vehicle database entry updated!");
      } else {
        await db.createCar(payload);
        toast.success("✅ Created new vehicle catalog entry!");
      }

      setShowAddForm(false);
      loadCars();
    } catch (err) {
      toast.error("An error occurred during submission.");
    }
  };

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-6 text-left" id="cars-tab-viewport">
      
      {/* ────────────────────────────────────────────────────────────── */}
      {/* ACTION TOP LINE                                               */}
      {/* ────────────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-center bg-[#161616] p-4 rounded-lg border border-[#262626]">
        <div>
          <h2 className="font-display font-bold text-lg text-white">Lucknow Lot Fleet Coordinator</h2>
          <span className="font-mono text-[9px] text-[#737373] uppercase block mt-0.5">Manage cars, set price structures, and manage garage updates</span>
        </div>

        <button
          onClick={openAddForm}
          type="button"
          className="px-4 py-2.5 bg-[#f97316] hover:bg-orange-600 active:scale-95 text-black font-display font-bold text-xs rounded transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={16} /> Add New Fleet Vehicle
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* DATA TABLE VIEW                                               */}
      {/* ────────────────────────────────────────────────────────────── */}
      <div className="bg-[#161616] border border-[#262626] rounded-xl overflow-hidden" id="car-admin-list">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#262626] text-[#737373] uppercase font-mono text-[10px] bg-[#0f0f0f]">
                <th className="py-4 px-4 w-20">Preview</th>
                <th className="py-4 px-3">Vehicle Details</th>
                <th className="py-4 px-3">Category Class</th>
                <th className="py-4 px-3">Day rate</th>
                <th className="py-4 px-3">Lot Status</th>
                <th className="py-4 px-3 text-center">Featured</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]/40">
              {cars.map((car) => (
                <tr key={car.id} className="hover:bg-[#1f1f1f]/30 transition-colors">
                  
                  {/* Thumbnail */}
                  <td className="py-3 px-4">
                    <div className="w-16 aspect-video bg-black rounded overflow-hidden border border-[#262626]">
                      <img src={car.images[0]} alt={car.name} className="w-full h-full object-cover" />
                    </div>
                  </td>

                  {/* Details */}
                  <td className="py-3 px-3">
                    <div className="font-display font-bold text-sm text-white">{car.brand} {car.name}</div>
                    <div className="text-[10px] text-[#737373] font-mono mt-0.5 uppercase">
                      {car.year} • {car.fuel_type} • {car.transmission} • {car.seats} Captains
                    </div>
                  </td>

                  {/* Class Badge */}
                  <td className="py-3 px-3">
                    <span className="bg-[#0c0c0c] text-[#a3a3a3] border border-[#222] px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-wider font-semibold">
                      {car.category}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="py-3 px-3 font-mono font-bold text-white text-sm">
                    ₹{Number(car.price_per_day).toLocaleString('en-IN')}<span className="text-[10px] text-[#737373] font-normal font-sans">/day</span>
                  </td>

                  {/* Status Block */}
                  <td className="py-3 px-3">
                    <button
                      onClick={() => cycleStatus(car.id, car.status)}
                      type="button"
                      className={`px-3 py-1.5 rounded-full text-[9px] uppercase font-mono font-black tracking-wider transition-colors cursor-pointer border ${
                        car.status === 'available' ? 'bg-emerald-950/30 border-emerald-500/20 text-emerald-400 hover:bg-emerald-950/70' :
                        car.status === 'booked' ? 'bg-rose-950/20 border-rose-500/10 text-rose-400 hover:bg-rose-950/70' :
                        'bg-amber-950/20 border-amber-500/10 text-amber-400 hover:bg-amber-950/70'
                      }`}
                      title="Click to cycle status"
                    >
                      {car.status} ↺
                    </button>
                  </td>

                  {/* Featured */}
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => toggleFeatured(car.id, car.is_featured)}
                      type="button"
                      className={`inline-flex p-1.5 rounded border transition-colors cursor-pointer ${
                        car.is_featured 
                          ? 'bg-amber-500/10 border-amber-500/30 text-[#facc15]' 
                          : 'bg-[#121212] border-[#222] text-[#444] hover:text-[#737373]'
                      }`}
                      title="Toggle show on Homepage featuring"
                    >
                      <Star size={14} fill={car.is_featured ? "currentColor" : "none"} />
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => openEditForm(car)}
                        className="p-2 bg-[#202020] hover:bg-[#333] hover:text-[#facc15] text-white rounded transition-colors cursor-pointer"
                        title="Edit specifications"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => deleteCar(car.id, `${car.brand} ${car.name}`)}
                        className="p-2 bg-[#202020] hover:bg-rose-950 hover:text-rose-400 text-gray-500 rounded transition-colors cursor-pointer"
                        title="Delete entry"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* OVERLAY FORM DIALOG (ADD & EDIT MULTI PANEL FORM)             */}
      {/* ────────────────────────────────────────────────────────────── */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 flex items-center justify-center p-4" id="fleet-form-overlay">
          <div className="bg-[#161616] border border-[#262626] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative text-sm">
            
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-[#262626] bg-[#0c0c0c]">
              <div className="flex items-center gap-2 text-white">
                <ListPlus size={18} className="text-[#f97316]" />
                <h3 className="font-display text-base font-bold tracking-tight">
                  {editingCar ? `Edit Metadata — ${editingCar.brand} ${editingCar.name}` : "Integrate New Vehicle to Lucknow Fleet"}
                </h3>
              </div>
              <button 
                onClick={() => setShowAddForm(false)} 
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Scroll Context */}
            <form onSubmit={saveCar} className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
              
              {/* Row 1: Brand, Model Name, Variant, Year */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                
                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-medium text-white block">Brand Manufacturer *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Toyota"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-[#0d0d0d] border border-[#262626] text-white text-xs p-3 rounded focus:outline-none focus:border-[#f97316]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-medium text-white block">Car Name model *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Fortuner"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#0d0d0d] border border-[#262626] text-white text-xs p-3 rounded focus:outline-none focus:border-[#f97316]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-medium text-[#737373] block">Variant model details</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Legender Flagship 4x4"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-[#0d0d0d] border border-[#262626] text-white text-xs p-3 rounded focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-medium text-white block">Mfg Year *</label>
                  <input 
                    type="number" 
                    required
                    min={2000}
                    max={2030}
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full bg-[#0d0d0d] border border-[#262626] text-white text-xs p-3 rounded focus:outline-none focus:border-[#f97316] font-mono"
                  />
                </div>

              </div>

              {/* Row 2: Category, Fuel, Transmission, Seats */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                
                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-medium block text-white">Category Class</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CarCategory)}
                    className="w-full bg-[#0d0d0d] text-white border border-[#262626] rounded text-xs p-3 focus:outline-none focus:border-[#f97316]"
                  >
                    <option value="Hatchback">Hatchback</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Luxury">Luxury</option>
                    <option value="MUV">MUV</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-medium block text-white">Fuel Engine Type</label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value as FuelType)}
                    className="w-full bg-[#0d0d0d] text-white border border-[#262626] rounded text-xs p-3 focus:outline-none focus:border-[#f97316]"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="CNG">CNG</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-medium block text-white">Transmission Box</label>
                  <select
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value as TransmissionType)}
                    className="w-full bg-[#0d0d0d] text-white border border-[#262626] rounded text-xs p-3 focus:outline-none focus:border-[#f97316]"
                  >
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-medium text-white block">Seating Seats count</label>
                  <input 
                    type="number" 
                    required
                    min={2}
                    max={12}
                    value={seats}
                    onChange={(e) => setSeats(Number(e.target.value))}
                    className="w-full bg-[#0d0d0d] border border-[#262626] text-white text-xs p-3 rounded focus:outline-none focus:border-[#f97316] font-mono"
                  />
                </div>

              </div>

              {/* Row 3: Hour Price, Day Price, Week Price, Month Price */}
              <div className="bg-[#0c0c0c] p-4.5 rounded-lg border border-[#202020] space-y-4">
                <h4 className="font-mono text-xs text-[#f97316] uppercase font-bold tracking-wider">[ PRICING METRIC CHUNKS (INR) ]</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-medium block text-white">Rate/Hour</label>
                    <input 
                      type="number" 
                      value={priceHour}
                      onChange={(e) => setPriceHour(Number(e.target.value))}
                      className="w-full bg-[#030303] border border-[#262626] text-white text-xs p-2.5 rounded font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-medium block text-white">Rate/Day</label>
                    <input 
                      type="number" 
                      value={priceDay}
                      onChange={(e) => setPriceDay(Number(e.target.value))}
                      className="w-full bg-[#030303] border border-[#262626] text-white text-xs p-2.5 rounded font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-medium block text-white">Rate/Week</label>
                    <input 
                      type="number" 
                      value={priceWeek}
                      onChange={(e) => setPriceWeek(Number(e.target.value))}
                      className="w-full bg-[#030303] border border-[#262626] text-white text-xs p-2.5 rounded font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-medium block text-white">Rate/Month</label>
                    <input 
                      type="number" 
                      value={priceMonth}
                      onChange={(e) => setPriceMonth(Number(e.target.value))}
                      className="w-full bg-[#030303] border border-[#262626] text-white text-xs p-2.5 rounded font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: KM Limits, Extra Cost, Deposit Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                
                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-medium text-white block">KM Limit/Day</label>
                  <input 
                    type="number" 
                    value={kmLimit}
                    onChange={(e) => setKmLimit(Number(e.target.value))}
                    className="w-full bg-[#0d0d0d] border border-[#262626] text-white text-xs p-3 rounded font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-medium text-white block">Extra KM Surcharge</label>
                  <input 
                    type="number" 
                    value={extraKm}
                    onChange={(e) => setExtraKm(Number(e.target.value))}
                    className="w-full bg-[#0d0d0d] border border-[#262626] text-white text-xs p-3 rounded font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-medium text-white block">Security Deposit *</label>
                  <input 
                    type="number" 
                    required
                    value={deposit}
                    onChange={(e) => setDeposit(Number(e.target.value))}
                    className="w-full bg-[#0d0d0d] border border-[#262626] text-white text-xs p-3 rounded focus:outline-none focus:border-[#f97316] font-mono"
                  />
                </div>

                <div className="space-y-1 col-span-1">
                  <label className="text-[11px] font-mono font-medium text-white block">Default Location</label>
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[#0d0d0d] border border-[#262626] text-white text-xs p-3 rounded"
                  />
                </div>

              </div>

              {/* Toggles features and status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-2 select-none">
                  <label className="text-[11px] font-mono font-medium block text-[#737373]">Featured Promotion</label>
                  <label className="flex items-center gap-3 bg-[#0d0d0d] p-3 border border-[#262626] rounded cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-4 h-4 accent-[#f97316]" 
                    />
                    <span className="text-xs text-white">Show in featured catalog stream</span>
                  </label>
                </div>

                <div className="space-y-1 select-all">
                  <label className="text-[11px] font-mono font-medium block text-white">Lot Status Option</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-[#0d0d0d] text-white border border-[#262626] rounded text-xs p-3 focus:outline-none"
                  >
                    <option value="available">Available lot-ready</option>
                    <option value="booked">Booked out</option>
                    <option value="maintenance">Maintenance check</option>
                  </select>
                </div>

              </div>

              {/* Description Narrative */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono font-medium text-white block">Narrative Description</label>
                <textarea 
                  rows={3} 
                  required
                  placeholder="Describe luxury points, smart sound decks, air sanitization protocols thoroughly..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#0d0d0d] border border-[#262626] text-white text-xs p-3 rounded focus:outline-none focus:border-[#f97316] resize-none"
                />
              </div>

              {/* Interactive Features Tag Input */}
              <div className="space-y-2 bg-[#0c0c0c] p-4 rounded-lg border border-[#202020]">
                <label className="text-[11px] font-mono font-medium text-white block flex items-center gap-1.5 uppercase tracking-wide">
                  <Tag size={13} className="text-[#facc15]" /> Equipment Extras (Press Enter to Append)
                </label>
                
                <input 
                  type="text" 
                  placeholder="e.g. Adaptive Cruise Control, type and press Enter..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={renderTagInputPress}
                  className="w-full bg-black border border-[#262626] text-white text-xs p-2.5 rounded focus:outline-none focus:border-[#f97316]"
                />

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {features.map((feat, index) => (
                    <span 
                      key={index} 
                      className="bg-black border border-[#222] px-2.5 py-1 text-[10px] text-white rounded flex items-center gap-1.5 font-mono"
                    >
                      <span>{feat}</span>
                      <button 
                        type="button" 
                        onClick={() => removeTag(index)} 
                        className="text-[#f97316] hover:text-white transition-colors ml-0.5 cursor-pointer"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Dynamic Images list URL input list */}
              <div className="space-y-4 bg-[#0c0c0c] p-4 rounded-lg border border-[#202020]">
                <label className="text-[11px] font-mono font-medium text-white block uppercase tracking-wide">
                  📷 Vehicle Visual Cover and Gallery (Absolute HTTP URL strings)
                </label>
                
                <div className="flex gap-2">
                  <input 
                    type="url" 
                    placeholder="https://images.unsplash.com/photo-... URL link"
                    value={newUrlInput}
                    onChange={(e) => setNewUrlInput(e.target.value)}
                    className="w-full bg-black border border-[#262626] text-white text-xs p-2.5 rounded focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="px-4 bg-[#262626] hover:bg-[#333] select-none text-xs rounded text-white font-mono"
                  >
                    Append
                  </button>
                </div>

                <div className="space-y-2 max-h-36 overflow-y-auto" id="gallery-urls-admin-list">
                  {imageUrls.map((url, i) => (
                    <div key={i} className="flex gap-2 items-center bg-black/60 p-2 rounded border border-[#262626] justify-between">
                      <span className="text-[10px] font-mono truncate text-gray-400 max-w-sm sm:max-w-xl">{i === 0 ? "★ [Cover Image] " : ""}{url}</span>
                      <button 
                        type="button" 
                        onClick={() => removeImageUrl(i)}
                        className="text-rose-500 hover:text-white cursor-pointer px-1 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </form>

            {/* Form Actions Footer */}
            <div className="p-6 border-t border-[#262626] bg-[#0c0c0c] flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-5 py-2.5 bg-transparent hover:bg-[#202020] text-white text-xs font-mono rounded"
              >
                Dismiss Form
              </button>
              <button
                type="button"
                onClick={saveCar}
                className="px-6 py-2.5 bg-[#f97316] hover:bg-orange-600 text-black font-display font-black text-xs rounded transition-all"
              >
                Confirm metadata write
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
