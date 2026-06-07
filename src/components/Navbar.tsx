/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Key, ShieldCheck, HelpCircle } from 'lucide-react';
import { db } from '../lib/supabase';

interface NavbarProps {}

export default function Navbar({}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-[#f97316] font-medium' : 'text-[#f5f5f5] hover:text-[#f97316] transition-colors';
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0d0d0d]/95 backdrop-blur-md border-b border-[#262626]" id="main-nav-header">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand Identity */}
          <Link to="/" className="flex items-center gap-1 group" id="nav-brand-logo">
            <span className="font-display text-2xl font-extrabold tracking-tighter text-white select-none">
              <span className="text-[#f97316]">D</span>RIVE<span className="text-[#f97316]">-</span>EAZE
            </span>
            <span className="hidden xs:inline-block font-mono text-[9px] tracking-widest text-[#737373] mt-2 ml-1 uppercase group-hover:text-white transition-colors">
              LKO
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm" id="desktop-navbar">
            <Link to="/" className={isActive('/')}>
              Home
            </Link>
            <Link to="/cars" className={isActive('/cars')}>
              Fleet
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="p-2 text-gray-400 hover:text-white hover:bg-[#161616] rounded-md focus:outline-none"
              aria-label="Toggle Menu"
              id="mobile-menu-hamburger"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-[#262626] bg-[#0d0d0d] px-4 pt-4 pb-6 space-y-3" id="mobile-drawer">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2.5 rounded-md text-base font-medium text-white hover:bg-[#161616]"
          >
            Home
          </Link>
          <Link
            to="/cars"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2.5 rounded-md text-base font-medium text-white hover:bg-[#161616]"
          >
            Fleet Listing
          </Link>
        </div>
      )}
    </header>
  );
}
