/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { db } from '../../lib/supabase';
import { toast } from '../Toast';
import { Save, ShieldAlert, Sparkles, AlertTriangle } from 'lucide-react';

export default function SettingsTab() {
  const [loading, setLoading] = useState(true);

  // Bulk Settings key fields mapping
  const [brandName, setBrandName] = useState('Drive-Eaze');
  const [tagline, setTagline] = useState('Drive Smart. Pay Less.');
  const [phone, setPhone] = useState('+91-8960695050');
  const [whatsapp, setWhatsapp] = useState('918960695050');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('Shop K 02, Kisan Bazar, Vibhuti Khand, Lucknow, Uttar Pradesh 226010');
  const [refundPolicy, setRefundPolicy] = useState('Refundable deposit returned on safe delivery within 24 hours of checkout validation.');

  useEffect(() => {
    async function fetchSets() {
      try {
        const specs = await db.getSiteSettings();
        if (specs && Object.keys(specs).length > 0) {
          if (specs.brand_name) setBrandName(specs.brand_name);
          if (specs.tagline) setTagline(specs.tagline);
          if (specs.phone) setPhone(specs.phone);
          if (specs.whatsapp) setWhatsapp(specs.whatsapp);
          if (specs.email) setEmail(specs.email);
          if (specs.address) setAddress(specs.address);
          if (specs.refund_policy) setRefundPolicy(specs.refund_policy);
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }
    fetchSets();
  }, []);

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        brand_name: brandName,
        tagline,
        phone,
        whatsapp,
        email,
        address,
        refund_policy: refundPolicy
      };

      await db.saveSiteSettingsBulk(payload);
      toast.success("✅ Global Site Settings updated successfully! All navigation and footer fields refreshed.");
    } catch (err) {
      toast.error("Failed to commit settings write.");
    }
  };

  if (loading) {
    return (
      <div className="bg-[#161616] p-12 text-center text-[#737373] animate-pulse rounded border border-[#222]">
        Synchronizing settings context...
      </div>
    );
  }

  return (
    <div className="max-w-3xl text-left space-y-6" id="settings-tab-context">
      
      {/* Narrative Header */}
      <div className="bg-[#161616] border border-[#262626] p-5 rounded-lg flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-lg text-white">Drive-Eaze Global Specs</h2>
          <span className="font-mono text-[9px] text-[#737373] uppercase block mt-0.5">Control live copy, phone logs, and addresses shown in headers, footers, and cards</span>
        </div>
        <ShieldAlert className="text-[#facc15]" size={20} />
      </div>

      <form onSubmit={handleUpdateSettings} className="bg-[#161616] border border-[#262626] rounded-xl p-8 space-y-6 text-xs text-left" id="bulk-settings-form">
        
        {/* Core Identity */}
        <div className="space-y-4">
          <h3 className="font-mono text-xs text-[#f97316] uppercase tracking-wider font-extrabold pb-1 border-b border-[#2d2d2d]">[ CORE BRAND ENTITY ]</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-mono font-medium text-white block">Official Brand Name</label>
              <input 
                type="text" 
                required
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full bg-[#0d0d0d] border border-[#262626] text-white p-3 rounded focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono font-medium text-white block">Hero Tagline text</label>
              <input 
                type="text" 
                required
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-[#0d0d0d] border border-[#262626] text-white p-3 rounded focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Contact Links */}
        <div className="space-y-4">
          <h3 className="font-mono text-xs text-[#facc15] uppercase tracking-wider font-extrabold pb-1 border-b border-[#2d2d2d]">[ CONTACT CHANNELS ]</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-mono font-medium text-white block">Official Phone Hub</label>
              <input 
                type="text" 
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#0d0d0d] border border-[#262626] text-white p-3 rounded focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono font-medium text-white block">WhatsApp link (E.164 no prefix)</label>
              <input 
                type="text" 
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="e.g. 918960695050"
                className="w-full bg-[#0d0d0d] border border-[#262626] text-white p-3 rounded focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono font-medium text-white block">Support desk Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0d0d0d] border border-[#262626] text-white p-3 rounded focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Local Geometry */}
        <div className="space-y-4">
          <h3 className="font-mono text-xs text-[#f97316] uppercase tracking-wider font-extrabold pb-1 border-b border-[#2d2d2d]">[ GEOGRAPHY & LEGALITY ]</h3>
          
          <div className="space-y-1">
            <label className="text-[11px] font-mono font-medium text-white block">Headquarters physical street address</label>
            <input 
              type="text" 
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-[#0d0d0d] border border-[#262626] text-white p-3 rounded focus:outline-none font-sans"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono font-medium text-white block">Refund policy notice</label>
            <textarea 
              rows={3}
              value={refundPolicy}
              onChange={(e) => setRefundPolicy(e.target.value)}
              className="w-full bg-[#0d0d0d] border border-[#262626] text-white p-3 rounded focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-[#262626] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-gray-500 font-mono text-[9px] uppercase">
            <AlertTriangle size={13} className="text-[#facc15]" /> Syncs immediately across layout nodes
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-[#f97316] hover:bg-orange-600 active:scale-95 text-black font-display font-black rounded transition-all flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <Save size={14} /> Commit Changes 
          </button>
        </div>

      </form>

    </div>
  );
}
