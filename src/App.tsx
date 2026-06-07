/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ToastContainer from './components/Toast';
import TharIntro from './components/TharIntro';

// Pages
import Home from './pages/Home';
import CarsList from './pages/CarsList';
import CarDetail from './pages/CarDetail';
import BookingForm from './pages/BookingForm';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

// Custom Scroll to Top wrapper on path shift
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

export default function App() {
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    // Check if the intro has run during this session
    const hasPlayed = sessionStorage.getItem('drive_eaze_intro_played');
    if (!hasPlayed) {
      setShowIntro(true);
    }
  }, []);

  const handleIntroComplete = () => {
    sessionStorage.setItem('drive_eaze_intro_played', 'true');
    setShowIntro(false);
  };

  // Client Side Layout wrapper (Navbar + Footer)
  function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
      <div className="flex flex-col min-h-screen bg-[#070c0e]" id="consumer-app-shell">
        <Navbar />
        <div className="flex-grow pt-[80px]" id="client-layout-inner">
          {children}
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <BrowserRouter>
      {/* Reset Scroll anchors instantly */}
      <ScrollToTop />

      {/* Global alert notifications portal */}
      <ToastContainer />

      {/* Mahindra Thar 4x4 Grand 3D Entry Animation */}
      {showIntro && <TharIntro onComplete={handleIntroComplete} />}

      <Routes>
        
        {/* CLIENT END ROUTING VIEWS */}
        <Route path="/" element={
          <ClientLayout><Home /></ClientLayout>
        } />
        <Route path="/cars" element={
          <ClientLayout><CarsList /></ClientLayout>
        } />
        <Route path="/cars/:id" element={
          <ClientLayout><CarDetail /></ClientLayout>
        } />
        <Route path="/booking/:carId" element={
          <ClientLayout><BookingForm /></ClientLayout>
        } />

        {/* STAFF/ADMIN ROUTING VIEWS (Separated layout architecture) */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Catch-all Redirect */}
        <Route path="*" element={
          <ClientLayout><Home /></ClientLayout>
        } />

      </Routes>
    </BrowserRouter>
  );
}
