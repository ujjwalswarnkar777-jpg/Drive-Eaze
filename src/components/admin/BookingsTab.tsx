/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { db, subscribeToRealtime } from '../../lib/supabase';
import { Booking, BookingStatus } from '../../types';
import { 
  Search, ShieldAlert, KeyRound, Check, X, RefreshCw, 
  MessageSquare, Phone, MapPin, Eye, FileText, Trash2 
} from 'lucide-react';
import { toast } from '../Toast';
import { TableSkeleton } from '../Skeleton';
import ConfirmModal from '../ConfirmModal';

interface BookingsTabProps {
  initialSearchRef?: string;
  onClearSearchRef?: () => void;
}

export default function BookingsTab({ initialSearchRef, onClearSearchRef }: BookingsTabProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; ref: string } | null>(null);

  // Search parameters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Selected Booking detail modal overlay
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [notesInput, setNotesInput] = useState('');

  const loadBookings = async () => {
    try {
      const data = await db.getBookings();
      setBookings(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadBookings();
    const unsub = subscribeToRealtime('bookings', loadBookings);
    return unsub;
  }, []);

  // Monitor parent navigation clicks (clicking "Details" in Dashboard)
  useEffect(() => {
    if (initialSearchRef) {
      setSearch(initialSearchRef);
      const match = bookings.find(b => b.booking_ref === initialSearchRef);
      if (match) {
        openDetailModal(match);
      }
      if (onClearSearchRef) onClearSearchRef();
    }
  }, [initialSearchRef, bookings]);

  const openDetailModal = (b: Booking) => {
    setSelectedBooking(b);
    setNotesInput(b.notes || '');
  };

  const closeDetailModal = () => {
    setSelectedBooking(null);
  };

  const updateStatus = async (bookingId: string, nextStatus: BookingStatus) => {
    try {
      await db.updateBookingStatus(bookingId, nextStatus, { notes: notesInput || undefined });
      toast.success(`Booking status set to ${nextStatus.toUpperCase()}!`);
      
      // Auto update active modal state
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking((prev) => prev ? { ...prev, booking_status: nextStatus } : null);
      }

      loadBookings();
    } catch (err) {
      toast.error("Failed to alter booking state.");
    }
  };

  const saveNotesInline = async () => {
    if (!selectedBooking) return;
    try {
      await db.updateBookingStatus(selectedBooking.id, selectedBooking.booking_status, { notes: notesInput || undefined });
      toast.success("Internal notes memo updated.");
      loadBookings();
    } catch (err) {
      toast.error("Failed to append notes.");
    }
  };

  const handleDeleteBooking = async (id: string, ref: string) => {
    try {
      await db.deleteBooking(id);
      toast.success(`Inquiry ${ref} deleted successfully.`);
      setSelectedBooking(null);
      loadBookings();
    } catch (err) {
      toast.error("An error occurred during booking deletion.");
    }
  };

  // Filter computation
  const filtered = bookings.filter((b) => {
    const matchesSearch = 
      b.booking_ref.toLowerCase().includes(search.toLowerCase()) ||
      b.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      b.customer_phone.includes(search);

    const matchesStatus = statusFilter === 'All' || b.booking_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <TableSkeleton />;
  }

  // Aggregate stats totals counts
  const totalCount = bookings.length;
  const upcomingCount = bookings.filter(b => b.booking_status === 'upcoming').length;
  const activeCount = bookings.filter(b => b.booking_status === 'active').length;
  const completedCount = bookings.filter(b => b.booking_status === 'completed').length;
  const cancelledCount = bookings.filter(b => b.booking_status === 'cancelled').length;
  const totalRevenue = bookings
    .filter(b => b.booking_status !== 'cancelled')
    .reduce((sum, b) => sum + Number(b.total_amount), 0);

  return (
    <div className="space-y-6 text-left" id="bookings-tab-viewport">
      
      {/* ────────────────────────────────────────────────────────────── */}
      {/* COUNTERS METRIC STRIP                                         */}
      {/* ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 bg-[#161616] border border-[#262626] p-4 rounded-xl text-xs font-mono">
        <div className="p-2 bg-[#0c0c0c] border border-[#222] rounded text-center">
          <span className="text-[#737373] block uppercase text-[9px]">Total Queries</span>
          <span className="font-display font-bold text-white text-sm">{totalCount} Trips</span>
        </div>
        <div className="p-2 bg-[#0c0c0c] border border-[#222] rounded text-center">
          <span className="text-[#737373] block uppercase text-[9px]">Upcoming</span>
          <span className="font-display font-medium text-amber-500 text-sm">{upcomingCount} Pending</span>
        </div>
        <div className="p-2 bg-[#0c0c0c] border border-[#222] rounded text-center">
          <span className="text-[#737373] block uppercase text-[9px]">Active Trips</span>
          <span className="font-display font-medium text-blue-400 text-sm">{activeCount} Running</span>
        </div>
        <div className="p-2 bg-[#0c0c0c] border border-[#222] rounded text-center">
          <span className="text-[#737373] block uppercase text-[9px]">Completed</span>
          <span className="font-display font-medium text-emerald-400 text-sm">{completedCount} Done</span>
        </div>
        <div className="p-2 bg-[#0c0c0c] border border-[#222] rounded text-center">
          <span className="text-[#737373] block uppercase text-[9px]">Cancelled</span>
          <span className="font-display font-medium text-rose-500 text-sm">{cancelledCount} Voided</span>
        </div>
        <div className="p-2 bg-[#0c0c0c] border border-[#f97316]/20 rounded text-center">
          <span className="text-[#f97316] block uppercase text-[9px] font-bold">Total revenue</span>
          <span className="font-display font-bold text-white text-sm">₹{totalRevenue.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* FILTER SEARCH LINE                                            */}
      {/* ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="bookings-admin-filterbar">
        
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737373]" size={14} />
          <input 
            type="text" 
            placeholder="Search by name, reference index, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#161616] border border-[#262626] text-xs text-white rounded-lg focus:outline-none"
          />
        </div>

        {/* Status Dropdown */}
        <div className="md:col-span-2 text-left">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-[#161616] text-white border border-[#262626] rounded-lg text-xs p-3 focus:outline-none"
          >
            <option value="All">All Booking Statuses</option>
            <option value="upcoming">Upcoming Pending</option>
            <option value="active">Active On Trip</option>
            <option value="completed">Completed Returned</option>
            <option value="cancelled">Cancelled Voided</option>
          </select>
        </div>

      </div>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* TABLE VIEW                                                     */}
      {/* ────────────────────────────────────────────────────────────── */}
      <div className="bg-[#161616] border border-[#262626] rounded-xl overflow-hidden" id="bookings-admin-list">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#262626] text-[#737373] uppercase font-mono text-[9px] bg-[#0c0c0c]">
                <th className="py-4 px-4 w-28">Ref Code</th>
                <th className="py-4 px-3">Renter Details</th>
                <th className="py-4 px-3">Vehicle</th>
                <th className="py-4 px-3">Pickup & Drop Date</th>
                <th className="py-4 px-3">Subtotal Amount</th>
                <th className="py-4 px-3 text-center">Inquiry status</th>
                <th className="py-4 px-4 text-right">Review Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]/40">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-[#1a1a1a]/30 transition-colors">
                  
                  {/* Ref */}
                  <td className="py-3.5 px-4 font-mono font-bold text-[#f97316] select-all">
                    {b.booking_ref}
                  </td>

                  {/* Customer */}
                  <td className="py-3.5 px-3">
                    <div className="font-display font-extrabold text-white text-xs">{b.customer_name}</div>
                    <div className="text-[10px] text-[#737373] font-mono mt-0.5">{b.customer_phone}</div>
                  </td>

                  {/* Vehicle */}
                  <td className="py-3.5 px-3">
                    {b.car ? (
                      <span className="text-[#a3a3a3] font-semibold text-xs block">{b.car.brand} {b.car.name}</span>
                    ) : (
                      <span className="text-[#737373] text-[10px] italic">No vehicle mapped</span>
                    )}
                  </td>

                  {/* Dates */}
                  <td className="py-3.5 px-3 font-mono text-[#a3a3a3]">
                    <div className="text-[10px] text-white">
                      Start: {new Date(b.start_time).toLocaleDateString('en-IN', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'})}
                    </div>
                    <div className="text-[9px] text-[#737373] mt-0.5">
                      Return: {new Date(b.end_time).toLocaleDateString('en-IN', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'})}
                    </div>
                  </td>

                  {/* Subtotal */}
                  <td className="py-3.5 px-3 font-mono font-black text-white text-sm">
                    ₹{Number(b.total_amount).toLocaleString('en-IN')}
                    <span className="text-[9px] text-[#737373] block font-sans font-normal mt-0.5">({b.duration_type})</span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-mono font-bold tracking-wider inline-block ${
                      b.booking_status === 'upcoming' ? 'bg-amber-950/40 text-amber-500 border border-amber-500/10' :
                      b.booking_status === 'active' ? 'bg-blue-950/40 text-blue-400 border border-blue-500/10' :
                      b.booking_status === 'completed' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-400/10' :
                      'bg-rose-950/30 text-rose-500 border border-rose-500/10'
                    }`}>
                      {b.booking_status}
                    </span>
                  </td>

                  {/* Details Trigger */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openDetailModal(b)}
                        className="px-3 py-1.5 bg-[#202020] hover:bg-orange-500 hover:text-black font-mono text-[10px] font-bold rounded cursor-pointer transition-colors"
                      >
                        Manage Log
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete({ id: b.id, ref: b.booking_ref })}
                        className="p-1.5 bg-rose-950/20 border border-rose-900/30 hover:border-rose-500 hover:bg-rose-950 text-rose-400 hover:text-white rounded cursor-pointer transition-colors"
                        title="Void/Delete Booking"
                      >
                        <Trash2 size={12} />
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
      {/* SELECTED BOOKING DETAIL MODAL                                 */}
      {/* ────────────────────────────────────────────────────────────── */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/85 overflow-y-auto flex items-center justify-center p-4 text-xs font-sans" id="booking-detail-modal">
          <div className="bg-[#161616] border border-[#262626] rounded-xl max-w-2xl w-full flex flex-col shadow-2xl relative text-left">
            
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-[#262626] bg-[#0c0c0c]">
              <div className="space-y-1 text-white">
                <span className="font-mono text-[#f97316] text-[10px] font-black block">REF CODE: {selectedBooking.booking_ref}</span>
                <h3 className="font-display text-base font-bold">Manage Booking Reservation</h3>
              </div>
              <button onClick={closeDetailModal} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* Form list context */}
            <div className="p-6 overflow-y-auto space-y-6 max-h-[750px] text-gray-300">
              
              {/* Customer summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-[#262626]/40 pb-5">
                <div>
                  <span className="font-mono text-[9px] text-[#737373] block uppercase">Customer Particulars</span>
                  <div className="font-display text-white text-base font-extrabold mt-1">{selectedBooking.customer_name}</div>
                  <div className="font-mono text-[11px] text-[#a3a3a3] mt-0.5">{selectedBooking.customer_phone}</div>
                  {selectedBooking.customer_email && <div className="text-[11px] text-[#737373] mt-0.5">{selectedBooking.customer_email}</div>}
                </div>
                
                <div>
                  <span className="font-mono text-[9px] text-[#737373] block uppercase">Mapped Fleet Vehicle</span>
                  {selectedBooking.car && (
                    <div className="mt-1">
                      <div className="font-display font-black text-sm text-white uppercase">{selectedBooking.car.brand} {selectedBooking.car.name}</div>
                      <span className="font-mono text-[10px] bg-[#0c0c0c] border border-[#222] px-2 py-0.5 rounded text-white inline-block mt-1">
                        Deposit: ₹{Number(selectedBooking.car.deposit_amount).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status workflow triggers */}
              <div className="bg-[#0b0b0b] p-4.5 rounded-lg border border-[#202020] space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[9px] text-[#737373] uppercase block font-bold">Switch inquiry lot status</span>
                  <span className="font-mono text-[10px] text-[#facc15] font-bold">STATE: {selectedBooking.booking_status.toUpperCase()}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    onClick={() => updateStatus(selectedBooking.id, 'upcoming')}
                    className={`px-3 py-2 border rounded font-mono text-[10px] font-bold transition-all cursor-pointer ${
                      selectedBooking.booking_status === 'upcoming'
                        ? 'bg-amber-500 border-amber-500 text-black'
                        : 'bg-[#121212] border-[#222] hover:border-amber-500/20 text-[#a3a3a3]'
                    }`}
                  >
                    Upcoming
                  </button>
                  <button
                    onClick={() => updateStatus(selectedBooking.id, 'active')}
                    className={`px-3 py-2 border rounded font-mono text-[10px] font-bold transition-all cursor-pointer ${
                      selectedBooking.booking_status === 'active'
                        ? 'bg-blue-500 border-blue-500 text-black font-bold'
                        : 'bg-[#121212] border-[#222] hover:border-blue-500/20 text-[#a3a3a3]'
                    }`}
                  >
                    Mark Active
                  </button>
                  <button
                    onClick={() => updateStatus(selectedBooking.id, 'completed')}
                    className={`px-3 py-2 border rounded font-mono text-[10px] font-bold transition-all cursor-pointer ${
                      selectedBooking.booking_status === 'completed'
                        ? 'bg-emerald-500 border-emerald-500 text-black font-bold'
                        : 'bg-[#121212] border-[#222] hover:border-emerald-500/20 text-[#a3a3a3]'
                    }`}
                  >
                    Mark Completed
                  </button>
                  <button
                    onClick={() => updateStatus(selectedBooking.id, 'cancelled')}
                    className={`px-3 py-2 border rounded font-mono text-[10px] font-bold transition-all cursor-pointer ${
                      selectedBooking.booking_status === 'cancelled'
                        ? 'bg-rose-500 border-rose-500 text-black'
                        : 'bg-[#121212] border-[#222] hover:border-rose-500/25 text-[#a3a3a3]'
                    }`}
                  >
                    Cancel Trip
                  </button>
                </div>
              </div>

              {/* Specific Trip Locations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-[#0f0f0f] p-3 rounded.lg border border-[#222]">
                  <span className="font-mono text-[9px] text-[#525252] uppercase block font-bold">Delivery Pickup Location</span>
                  <p className="mt-1 flex items-start gap-1.5 text-[#a3a3a3]">
                    <MapPin size={12} className="text-[#f97316] shrink-0 mt-0.5" />
                    <span>{selectedBooking.pickup_location || "Shop K 02, Kisan Bazar, Vibhuti Khand"}</span>
                  </p>
                </div>
                <div className="bg-[#0f0f0f] p-3 rounded.lg border border-[#222]">
                  <span className="font-mono text-[9px] text-[#525252] uppercase block font-bold">Return Drop Location</span>
                  <p className="mt-1 flex items-start gap-1.5 text-[#a3a3a3]">
                    <MapPin size={12} className="text-[#facc15] shrink-0 mt-0.5" />
                    <span>{selectedBooking.drop_location || "Shop K 02, Kisan Bazar, Vibhuti Khand"}</span>
                  </p>
                </div>
              </div>

              {/* Inline internal memos / notes */}
              <div className="space-y-1.5">
                <span className="font-mono text-[9px] text-white block uppercase flex items-center gap-1"><FileText size={12} /> Internal Booking notes Memo</span>
                <textarea
                  rows={3}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="e.g. Deposit ₹5,000 received. Sanitization verified offline, identity documents catalogued in drive."
                  className="w-full bg-[#0d0d0d] border border-[#262626] text-white p-3 rounded text-xs focus:outline-none"
                />
                <button
                  type="button"
                  onClick={saveNotesInline}
                  className="px-4 py-2 bg-[#262626] hover:bg-[#333] font-mono text-[10px] text-white hover:text-[#facc15] rounded border border-[#222] cursor-pointer"
                >
                  Save Internal Notes Memo
                </button>
              </div>

              {/* Renter Communication tools */}
              <div className="flex gap-3 pt-4 border-t border-[#262626]/40">
                <a
                  href={`https://wa.me/${selectedBooking?.customer_phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-mono text-[10px] font-bold flex items-center justify-center gap-1.5"
                >
                  <MessageSquare size={14} className="text-white" /> Connect on WhatsApp
                </a>
                <a
                  href={`tel:${selectedBooking?.customer_phone}`}
                  className="flex-1 py-3 bg-[#262626] hover:bg-[#333] text-white border border-[#222] rounded font-mono text-[10px] font-bold flex items-center justify-center gap-1.5"
                >
                  <Phone size={14} className="text-[#facc15]" /> Call Client Now
                </a>
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[#262626] bg-[#0c0c0c] flex justify-between items-center">
              <button
                type="button"
                onClick={() => setConfirmDelete({ id: selectedBooking.id, ref: selectedBooking.booking_ref })}
                className="px-4 py-2 bg-[#231515] hover:bg-rose-950 text-rose-400 font-mono text-[10px] uppercase font-black rounded border border-rose-900/30 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Trash2 size={12} /> Void & Delete Inquiry
              </button>
              <button
                type="button"
                onClick={closeDetailModal}
                className="px-6 py-2 bg-[#f97316] hover:bg-orange-600 text-black font-display font-black text-xs rounded transition-all"
              >
                Dismiss Booking Sheet
              </button>
            </div>

          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmDelete}
        title="Void & Delete Inquiry"
        message={`Are you sure you want to void and completely delete the booking inquiry with reference ${confirmDelete?.ref}? This action is permanent.`}
        confirmLabel="Void & Delete"
        isDestructive
        onConfirm={async () => {
          if (confirmDelete) {
            await handleDeleteBooking(confirmDelete.id, confirmDelete.ref);
            setConfirmDelete(null);
          }
        }}
        onCancel={() => setConfirmDelete(null)}
      />

    </div>
  );
}
