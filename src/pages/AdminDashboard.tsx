/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Car, CalendarRange, MessageSquare, 
  Percent, Settings, LogOut, ShieldCheck, AlignJustify, Menu, X 
} from 'lucide-react';
import { toast } from '../components/Toast';

// Subcomponents
import DashboardTab from '../../src/components/admin/DashboardTab';
import CarsTab from '../../src/components/admin/CarsTab';
import BookingsTab from '../../src/components/admin/BookingsTab';
import ReviewsTab from '../../src/components/admin/ReviewsTab';
import OffersTab from '../../src/components/admin/OffersTab';
import SettingsTab from '../../src/components/admin/SettingsTab';

type AdminTab = 'dashboard' | 'cars' | 'bookings' | 'reviews' | 'offers' | 'settings';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [adminEmail, setAdminEmail] = useState('');
  const [initialSearchRef, setInitialSearchRef] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Protected admin check
    const authed = localStorage.getItem('driveeaze_admin_authed');
    const email = localStorage.getItem('driveeaze_admin_email') || 'staff@driveeaze.in';
    
    if (authed !== 'true') {
      toast.error("Unauthenticated session. Please authenticate first.");
      navigate('/admin');
      return;
    }
    
    setAdminEmail(email);
  }, [navigate]);

  const handleLogout = () => {
    if (confirm("Disconnect and sign out of the Drive-Eaze Staff session?")) {
      localStorage.removeItem('driveeaze_admin_authed');
      localStorage.removeItem('driveeaze_admin_email');
      toast.info("Security session invalidated.");
      navigate('/');
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Overview Metrics', icon: LayoutDashboard },
    { id: 'cars', label: 'Cars Coordinator', icon: Car },
    { id: 'bookings', label: 'Active Bookings', icon: CalendarRange },
    { id: 'reviews', label: 'Reviews Verification', icon: MessageSquare },
    { id: 'offers', label: 'Deals & Coupons', icon: Percent },
    { id: 'settings', label: 'Global Specs', icon: Settings },
  ] as const;

  return (
    <div className="bg-[#0c0c0c] min-h-screen flex flex-col lg:flex-row text-[#f5f5f5]" id="admin-workspace-viewport">
      
      {/* ────────────────────────────────────────────────────────────── */}
      {/* SIDEBAR NAVIGATION (DESKTOP)                                   */}
      {/* ────────────────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#161616] border-r border-[#262626] shrink-0" id="admin-desktop-sidebar">
        
        {/* Sidebar Header branding */}
        <div className="p-6 border-b border-[#262626] flex items-center justify-between">
          <div className="text-left space-y-0.5">
            <span className="font-mono text-[#f97316] text-[10px] font-black uppercase tracking-widest">[ Staff Console ]</span>
            <h1 className="font-display font-black text-white text-lg tracking-tight">Drive-Eaze</h1>
          </div>
          <ShieldCheck className="text-[#f97316]" size={20} />
        </div>

        {/* User identification */}
        <div className="p-4.5 bg-[#000]/10 border-b border-[#262626]/40 text-left font-mono text-[10px] text-[#737373]">
          <span>Logged as:</span>
          <div className="text-white truncate font-semibold mt-0.5" title={adminEmail}>{adminEmail}</div>
        </div>

        {/* Sidebar items */}
        <nav className="p-4 flex-1 space-y-1.5 text-left" id="sidebar-navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                type="button"
                className={`w-full py-2.5 px-3.5 rounded text-xs font-mono font-medium flex items-center gap-3 transition-colors cursor-pointer ${
                  isSelected 
                    ? 'bg-[#fbb314]/5 hover:bg-[#fbb314]/10 text-[#facc15] font-black' 
                    : 'text-[#a3a3a3] hover:text-white hover:bg-[#202020]'
                }`}
              >
                <Icon size={16} className={isSelected ? "text-[#f97316]" : "text-gray-500"} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Logout bottom */}
        <div className="p-4 border-t border-[#262626]" id="sidebar-footer">
          <button
            onClick={handleLogout}
            type="button"
            className="w-full py-2.5 px-3 bg-[#202020] hover:bg-rose-950 hover:text-rose-400 text-[#a3a3a3] hover:font-bold rounded text-xs font-mono flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut size={14} /> Exit Staff Portal
          </button>
        </div>

      </aside>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* MOBILE HEADER BAR                                              */}
      {/* ────────────────────────────────────────────────────────────── */}
      <header className="lg:hidden bg-[#161616] border-b border-[#262626] px-4 py-4 flex items-center justify-between z-40 sticky top-0" id="admin-mobile-header">
        <div className="text-left">
          <h1 className="font-display font-black text-white text-base">Drive-Eaze</h1>
          <span className="font-mono text-[8px] text-[#f97316] uppercase mt-0.5 tracking-wider font-extrabold">[ Live Staff Terminal ]</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] text-gray-500 truncate max-w-24">{adminEmail.split('@')[0]}</span>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-gray-400 hover:text-white cursor-pointer"
          >
            {mobileMenuOpen ? <X size={20} /> : <AlignJustify size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Backdrop & dropdown items */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[60px] z-30 bg-black/90 backdrop-blur-sm p-4 text-left" id="admin-mobile-menu">
          <div className="bg-[#161616] rounded-lg border border-[#2d2d2d] overflow-hidden p-3.5 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  type="button"
                  className={`w-full py-3.5 px-3 rounded text-xs font-mono font-medium flex items-center gap-3 transition-colors ${
                    isSelected ? 'bg-orange-950/20 text-[#f97316] font-bold' : 'text-[#a3a3a3]'
                  }`}
                >
                  <Icon size={14} />
                  {item.label}
                </button>
              );
            })}
            <div className="border-t border-[#262626] pt-3.5 mt-3.5">
              <button
                onClick={handleLogout}
                className="w-full py-3 bg-[#202020] hover:bg-rose-950 text-rose-400 rounded text-xs font-mono flex items-center justify-center gap-2"
              >
                <LogOut size={14} /> Exit Portal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────── */}
      {/* ACTIONS WORKSPACE AREA                                         */}
      {/* ────────────────────────────────────────────────────────────── */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto max-h-[100vh] lg:max-h-screen" id="admin-workspace-core">
        
        {/* Dynamic header label corresponding to route state */}
        <div className="border-b border-[#262626]/25 pb-6 mb-8 text-left uppercase" id="workspace-state-label">
          <span className="font-mono text-xs text-[#f97316] uppercase tracking-widest font-black">
            [ STAFF ADMINISTRATION NODE / {activeTab.toUpperCase()} ]
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight mt-1 capitalize">
            {activeTab === 'dashboard' ? 'Overview Stats' : activeTab}
          </h1>
        </div>

        {/* Tab contents switcher widgets */}
        <div id="tab-views">
          {activeTab === 'dashboard' && (
            <DashboardTab 
              onSelectBooking={(ref) => {
                setInitialSearchRef(ref);
                setActiveTab('bookings');
              }} 
            />
          )}

          {activeTab === 'cars' && <CarsTab />}

          {activeTab === 'bookings' && (
            <BookingsTab 
              initialSearchRef={initialSearchRef} 
              onClearSearchRef={() => setInitialSearchRef('')} 
            />
          )}

          {activeTab === 'reviews' && <ReviewsTab />}

          {activeTab === 'offers' && <OffersTab />}

          {activeTab === 'settings' && <SettingsTab />}
        </div>

      </main>

    </div>
  );
}
