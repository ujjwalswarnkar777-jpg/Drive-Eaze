/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { db, subscribeToRealtime } from '../../lib/supabase';
import { Car, Booking } from '../../types';
import { 
  CarFront, CalendarClock, CreditCard, Clock, Activity, 
  MessageSquare, User, Eye, RefreshCw, Star, Trash2 
} from 'lucide-react';
import { toast } from '../Toast';
import { TableSkeleton } from '../Skeleton';
import ConfirmModal from '../ConfirmModal';

interface DashboardTabProps {
  onSelectBooking: (ref: string) => void;
}

export default function DashboardTab({ onSelectBooking }: DashboardTabProps) {
  const [cars, setCars] = useState<Car[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; ref: string } | null>(null);

  // Stats summaries
  const [stats, setStats] = useState({
    totalCars: 0,
    available: 0,
    booked: 0,
    maintenance: 0,
    todayBookingsCount: 0,
    monthlyBookingRevenue: 0,
    pendingInquiries: 0
  });

  const loadData = async () => {
    try {
      const allCars = await db.getCars(true);
      const allBookings = await db.getBookings();

      setCars(allCars);
      setBookings(allBookings);

      // Calculations
      const available = allCars.filter(c => c.status === 'available').length;
      const booked = allCars.filter(c => c.status === 'booked').length;
      const maintenance = allCars.filter(c => c.status === 'maintenance').length;

      const today = new Date().toISOString().split('T')[0];
      const todayCount = allBookings.filter(b => b.created_at?.startsWith(today)).length;
      
      const thisMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
      const monthlyRevenue = allBookings
        .filter(b => b.created_at?.startsWith(thisMonth) && b.booking_status !== 'cancelled')
        .reduce((sum, b) => sum + Number(b.total_amount), 0);

      const pending = allBookings.filter(b => b.booking_status === 'upcoming').length;

      setStats({
        totalCars: allCars.length,
        available,
        booked,
        maintenance,
        todayBookingsCount: todayCount,
        monthlyBookingRevenue: monthlyRevenue,
        pendingInquiries: pending
      });

      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
    const unsubCars = subscribeToRealtime('cars', loadData);
    const unsubBookings = subscribeToRealtime('bookings', loadData);
    return () => {
      unsubCars();
      unsubBookings();
    };
  }, []);

  const cycleStatus = async (carId: string, currentStatus: string) => {
    let nextStatus: 'available' | 'booked' | 'maintenance' = 'available';
    if (currentStatus === 'available') nextStatus = 'booked';
    else if (currentStatus === 'booked') nextStatus = 'maintenance';
    
    try {
      await db.updateCar(carId, { status: nextStatus });
      toast.success(`Car status changed to ${nextStatus.toUpperCase()}!`);
      loadData();
    } catch (err) {
      toast.error("Failed to alter status.");
    }
  };

  const handleDeleteBooking = async (id: string, ref: string) => {
    try {
      await db.deleteBooking(id);
      toast.success(`Inquiry ${ref} deleted successfully.`);
      loadData();
    } catch (err) {
      toast.error("An error occurred during booking deletion.");
    }
  };

  if (loading) {
    return <TableSkeleton />;
  }

  // Last 10 bookings
  const recentBookings = bookings.slice(0, 10);

  return (
    <div className="space-y-10 text-left" id="admin-dashboard-tab-content">
      
      {/* ────────────────────────────────────────────────────────────── */}
      {/* STAT CARDS ROW                                                 */}
      {/* ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6" id="dashboard-metric-cards">
        
        {/* Total Fleet */}
        <div className="bg-[#161616] border border-[#262626] p-6 rounded-lg flex items-center gap-4">
          <div className="p-3 bg-orange-500/10 text-[#f97316] rounded border border-[#f97316]/20">
            <CarFront size={22} />
          </div>
          <div>
            <span className="font-mono text-[9px] text-[#737373] uppercase tracking-wider block">Fleet Size</span>
            <div className="font-display font-black text-white text-2xl">{stats.totalCars} Cars</div>
            <span className="text-[10px] text-gray-500 font-sans block mt-0.5">
              {stats.available} Free / {stats.booked} Booked
            </span>
          </div>
        </div>

        {/* Today Bookings count */}
        <div className="bg-[#161616] border border-[#262626] p-6 rounded-lg flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-[#facc15] rounded border border-[#facc15]/20">
            <CalendarClock size={22} />
          </div>
          <div>
            <span className="font-mono text-[9px] text-[#737373] uppercase tracking-wider block">Today's Inquiries</span>
            <div className="font-display font-black text-white text-2xl">{stats.todayBookingsCount} Trips</div>
            <span className="text-[10px] text-emerald-500 font-sans flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live incoming stream
            </span>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-[#161616] border border-[#262626] p-6 rounded-lg flex items-center gap-4">
          <div className="p-3 bg-orange-500/10 text-[#f97316] rounded border border-[#f97316]/20">
            <CreditCard size={22} />
          </div>
          <div>
            <span className="font-mono text-[9px] text-[#737373] uppercase tracking-wider block">Month Revenue</span>
            <div className="font-display font-black text-white text-2xl">₹{stats.monthlyBookingRevenue.toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-gray-500 font-sans block mt-0.5">Excludes cancelled trips</span>
          </div>
        </div>

        {/* Pending Approval Booking requests */}
        <div className="bg-[#161616] border border-[#262626] p-6 rounded-lg flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-[#facc15] rounded border border-[#facc15]/20">
            <Clock size={22} />
          </div>
          <div>
            <span className="font-mono text-[9px] text-[#737373] uppercase tracking-wider block">Action Pending</span>
            <div className="font-display font-black text-white text-2xl">{stats.pendingInquiries} Enquiries</div>
            <span className="text-[10px] text-amber-500 font-sans block mt-0.5">Need WhatsApp response</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* ────────────────────────────────────────────────────────────── */}
        {/* LEFT: RECENT BOOKINGS TABLE                                    */}
        {/* ────────────────────────────────────────────────────────────── */}
        <div className="xl:col-span-8 bg-[#161616] border border-[#262626] rounded-xl p-6 space-y-6" id="dashboard-recent-bookings">
          <div className="flex justify-between items-center border-b border-[#262626] pb-4">
            <div>
              <h3 className="font-display text-white font-bold text-lg">Recent Booking Inquiries</h3>
              <p className="text-xs text-[#737373] mt-0.5">Last 10 rental reservations submitted online.</p>
            </div>
            <Activity className="text-[#f97316] animate-pulse" size={18} />
          </div>

          <div className="overflow-x-auto">
            {recentBookings.length === 0 ? (
              <p className="py-8 text-center text-[#737373] font-mono text-xs">No bookings recorded yet.</p>
            ) : (
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#262626] text-[#737373] uppercase font-mono text-[10px]">
                    <th className="py-3 px-2">Ref Code</th>
                    <th className="py-3 px-2">Customer</th>
                    <th className="py-3 px-2">Car</th>
                    <th className="py-3 px-2">Duration</th>
                    <th className="py-3 px-2">Subtotal</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262626]/40 font-sans">
                  {recentBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-[#1a1a1a]/40 transition-colors">
                      <td className="py-4 px-2 font-mono text-[#f97316] font-bold">{b.booking_ref}</td>
                      <td className="py-4 px-2">
                        <div className="font-bold text-white">{b.customer_name}</div>
                        <div className="text-[10px] text-[#737373] font-mono">{b.customer_phone}</div>
                      </td>
                      <td className="py-4 px-2 text-gray-300 font-medium">
                        {b.car ? `${b.car.brand} ${b.car.name}` : 'Unknown Car'}
                      </td>
                      <td className="py-4 px-2">
                        <div className="text-white text-[10px] font-mono tracking-wider">{new Date(b.start_time).toLocaleDateString('en-IN', {day:'numeric', month:'short'})}</div>
                        <div className="text-[#737373] text-[9px] uppercase font-mono tracking-tight">{b.duration_type} • {b.total_hours} hr</div>
                      </td>
                      <td className="py-4 px-2 text-white font-mono font-bold">₹{Number(b.total_amount).toLocaleString('en-IN')}</td>
                      <td className="py-4 px-2">
                        <span className={`px-2.5 py-1 rounded text-[9px] uppercase font-mono font-bold tracking-wider inline-block ${
                          b.booking_status === 'upcoming' ? 'bg-amber-950/50 text-amber-400 border border-amber-500/20' :
                          b.booking_status === 'active' ? 'bg-blue-950/50 text-blue-400 border border-blue-500/20' :
                          b.booking_status === 'completed' ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/20' :
                          'bg-rose-950/40 text-rose-400 border border-rose-500/10'
                        }`}>
                          {b.booking_status}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectBooking(b.booking_ref)}
                            className="px-2.5 py-1.5 bg-[#262626] hover:bg-[#333] hover:text-[#f97316] text-white rounded font-mono text-[10px] font-bold cursor-pointer transition-colors"
                          >
                            Details
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete({ id: b.id, ref: b.booking_ref })}
                            className="p-1 px-1.5 bg-rose-950/20 border border-rose-900/30 hover:border-rose-500 hover:bg-rose-950 text-rose-400 hover:text-white rounded cursor-pointer transition-colors"
                            title="Delete Inquiry"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ────────────────────────────────────────────────────────────── */}
        {/* RIGHT: RAPID CAR AVAILABILITY QUICK GRID                       */}
        {/* ────────────────────────────────────────────────────────────── */}
        <div className="xl:col-span-4 bg-[#161616] border border-[#262626] rounded-xl p-6 space-y-6" id="dashboard-car-availability-board">
          <div className="border-b border-[#262626] pb-4">
            <h3 className="font-display text-white font-bold text-lg">Lot Status Grid</h3>
            <p className="text-xs text-[#737373] mt-0.5">Click any car box below to cycle lot states.</p>
          </div>

          <div className="grid grid-cols-1 gap-3.5" id="lot-rapid-grid">
            {cars.map((car) => (
              <div 
                key={car.id}
                className="p-3.5 bg-[#0d0d0d] hover:bg-[#121212] border border-[#262626] rounded-lg flex items-center justify-between select-none"
              >
                <div className="text-left">
                  <h4 className="font-display font-extrabold text-xs text-white uppercase">{car.brand} {car.name}</h4>
                  <span className="font-mono text-[9px] text-[#737373] uppercase block mt-0.5">{car.category} • {car.transmission}</span>
                </div>

                <button
                  type="button"
                  onClick={() => cycleStatus(car.id, car.status)}
                  className={`px-3 py-1.5 rounded text-[10px] font-mono font-black uppercase tracking-wider cursor-pointer border transition-all ${
                    car.status === 'available' ? 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400 font-bold hover:bg-emerald-950' :
                    car.status === 'booked' ? 'bg-rose-950/40 border-rose-500/20 text-rose-400 font-bold hover:bg-rose-950' :
                    'bg-amber-950/40 border-amber-500/20 text-amber-400 hover:bg-amber-950'
                  }`}
                  title="Click to cycle status"
                >
                  {car.status} ↺
                </button>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#0c0c0c] rounded border border-[#222] font-mono text-[9px] text-[#525252] text-center uppercase tracking-wide">
            Cycles: Available → Booked → Maintenance
          </div>

        </div>

      </div>

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
