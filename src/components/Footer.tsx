/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowUpRight, MessageSquare } from 'lucide-react';
import { db } from '../lib/supabase';
import { getWhatsAppLink, getPhoneLink } from '../lib/deepLink';

export default function Footer() {
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadSettings() {
      const data = await db.getSiteSettings();
      setSettings(data);
    }
    loadSettings();
  }, []);

  const phone = settings.phone || '+91-8960695050';
  const whatsappCode = settings.whatsapp || '918960695050';
  const email = settings.email || 'hello@driveeaze.in';
  const address = settings.address || 'Shop K 02, Kisan Bazar, Vibhuti Khand, Lucknow, Uttar Pradesh 226010';

  return (
    <footer className="bg-[#0c0c0c] border-t border-[#262626] text-[#737373] text-sm" id="main-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1.5" id="footer-col-brand">
            <span className="font-display text-2xl font-black text-white tracking-tighter">
              <span className="text-[#f97316]">D</span>RIVE<span className="text-[#f97316]">-</span>EAZE
            </span>
            <p className="text-xs text-[#737373] mt-2 max-w-sm">
              Premium self-drive vehicle rentals based in Lucknow. Clean luxury, rigid maintenance, and zero hassle booking. Est. 2024.
            </p>
            <div className="pt-2 font-mono text-[10px] text-[#f97316]" id="footer-est">
              [01] / Lucknow / Lucknow No. 1 Rental
            </div>
          </div>

          {/* Core Routes Column */}
          <div className="space-y-4" id="footer-col-links">
            <h3 className="font-mono text-xs text-white uppercase tracking-wider">[02] / Quick Directory</h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/" className="hover:text-white transition-colors flex items-center gap-1 group">
                  Home <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#f97316]" />
                </Link>
              </li>
              <li>
                <Link to="/cars" className="hover:text-white transition-colors flex items-center gap-1 group">
                  Browse Our Fleet <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#f97316]" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Policy */}
          <div className="space-y-4" id="footer-col-legal">
            <h3 className="font-mono text-xs text-white uppercase tracking-wider">[03] / Legal Rules</h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#terms" onClick={(e) => { e.preventDefault(); alert("Self-Drive License terms: 1. Valid DL required. 2. Min age 18. 3. ₹5,000 Refundable Security Deposit."); }} className="hover:text-white transition-colors">
                  Rental Agreement & Terms
                </a>
              </li>
              <li>
                <a href="#privacy" onClick={(e) => { e.preventDefault(); alert("We protect your logs. GPS trackers are installed for safety. We never disclose data."); }} className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <span className="text-[#a3a3a3]">Lucknow RTO Permitted</span>
              </li>
            </ul>
          </div>

          {/* Direct Address / Contact info */}
          <div className="space-y-4" id="footer-col-contact">
            <h3 className="font-mono text-xs text-white uppercase tracking-wider">[04] / Headquarters</h3>
            <div className="space-y-3.5 text-xs text-gray-400">
              <p className="flex items-start gap-2">
                <MapPin size={14} className="text-[#f97316] shrink-0 mt-0.5" />
                <span>{address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone size={14} className="text-[#facc15] shrink-0" />
                <a href={getPhoneLink(phone)} className="hover:text-white transition-colors">{phone}</a>
              </p>
              <p className="flex items-center gap-2">
                <MessageSquare size={14} className="text-[#f97316] shrink-0" />
                <a href={getWhatsAppLink(whatsappCode, 'Hello Drive-Eaze! I am contacting you from the footer link on your mobile platform.')} className="hover:text-white transition-colors">WhatsApp Direct</a>
              </p>
            </div>
          </div>

        </div>

        {/* Separator & Copy */}
        <div className="mt-12 pt-8 border-t border-[#1a1a1a] flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono">
          <p>© 2026 Drive-Eaze. Lucknow, Uttar Pradesh. Build Verified.</p>
          <div className="flex items-center gap-3 text-[#525252]">
            <span>STABLE_V1.44</span>
            <span>•</span>
            <span>LUCKNOW EXCLUSIVE</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
