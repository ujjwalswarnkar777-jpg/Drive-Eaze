/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { db, subscribeToRealtime } from '../../lib/supabase';
import { Offer } from '../../types';
import { Plus, ToggleLeft, ToggleRight, Trash2, Ticket, Check, X } from 'lucide-react';
import { toast } from '../Toast';
import { TableSkeleton } from '../Skeleton';

export default function OffersTab() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(10);
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo] = useState('');
  const [description, setDescription] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const loadOffers = async () => {
    try {
      const data = await db.getOffers();
      setOffers(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadOffers();
    return subscribeToRealtime('offers', loadOffers);
  }, []);

  const toggleOfferState = async (offerId: string, currentActive: boolean) => {
    try {
      await db.updateOffer(offerId, { is_active: !currentActive });
      toast.success(currentActive ? "Voucher deactivated." : "✅ Promo Code activated live!");
      loadOffers();
    } catch (err) {
      toast.error("Status update failed.");
    }
  };

  const deleteOffer = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to completely erase the coupon code "${name}"?`)) {
      try {
        await db.deleteOffer(id);
        toast.success("Promo code wiped.");
        loadOffers();
      } catch (err) {
        toast.error("Wiping error.");
      }
    }
  };

  const createPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountPercent) {
      toast.error("Please supply Code and discount multiplier.");
      return;
    }

    try {
      await db.createOffer({
        code: code.trim().toUpperCase(),
        title: `${discountPercent}% Off Holiday Promo`,
        discount_percent: Number(discountPercent),
        max_discount: 3000,
        valid_till: validTo || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
        is_active: true,
        description: description || 'Special Lucknow drive holiday discount coupon.'
      });

      toast.success(`Coupon "${code}" generated on server!`);
      setCode('');
      setDiscountPercent(15);
      setDescription('');
      setValidFrom('');
      setValidTo('');
      setShowAddForm(false);
      loadOffers();
    } catch (err) {
      toast.error("Coupons generate error.");
    }
  };

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-6 text-left" id="offers-tab-context">
      
      {/* ────────────────────────────────────────────────────────────── */}
      {/* HEADER ACTION BAR                                             */}
      {/* ────────────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-center bg-[#161616] p-4 rounded-lg border border-[#262626]">
        <div>
          <h2 className="font-display font-bold text-lg text-white">Lucknow Sales & Promo Campaigns</h2>
          <span className="font-mono text-[9px] text-[#737373] uppercase block mt-0.5">Control active website voucher scopes, and reward rates</span>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          type="button"
          className="px-4 py-2.5 bg-[#facc15] hover:bg-yellow-500 text-black font-display font-black text-xs rounded transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={16} /> Create Promo Voucher
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* CREATE OFFER BOX                                               */}
      {/* ────────────────────────────────────────────────────────────── */}
      {showAddForm && (
        <form onSubmit={createPromo} className="bg-[#161616] border border-[#262626] rounded-xl p-6 space-y-4 max-w-xl text-xs text-left" id="promo-code-creation-form">
          <div className="border-b border-[#262626] pb-2">
            <h3 className="font-display font-bold text-white text-sm">Generate promo codes trigger</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Promo Code string */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono font-medium text-white block">Promo Code String</label>
              <input 
                type="text" 
                required
                placeholder="e.g. LKO2026"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-[#0d0d0d] border border-[#262626] text-white p-2.5 rounded focus:outline-none placeholder-stone-700 uppercase"
              />
            </div>

            {/* Discount Percent */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono font-medium text-white block">Discount Percent (%)</label>
              <input 
                type="number" 
                required
                min={1}
                max={99}
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                className="w-full bg-[#0d0d0d] border border-[#262626] text-white p-2.5 rounded focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Valid From */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono font-medium text-[#737373] block">Valid From date</label>
              <input 
                type="date" 
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
                className="w-full bg-[#0d0d0d] border border-[#262626] text-white p-2 rounded focus:outline-none"
              />
            </div>

            {/* Valid To */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono font-medium text-[#737373] block">Valid To date</label>
              <input 
                type="date" 
                value={validTo}
                onChange={(e) => setValidTo(e.target.value)}
                className="w-full bg-[#0d0d0d] border border-[#262626] text-white p-2 rounded focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono font-medium text-white block">Brief Campaign Narrative</label>
            <input 
              type="text" 
              placeholder="e.g. Lucknow festival flat 10% promo for first-time renters in Gomti Nagar."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#0d0d0d] border border-[#262626] text-white p-2.5 rounded focus:outline-none"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-transparent text-white rounded font-mono text-[10px]"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-5 py-2 bg-[#facc15] text-black font-display font-black rounded hover:bg-yellow-500"
            >
              Issue Promo Voucher
            </button>
          </div>
        </form>
      )}

      {/* ────────────────────────────────────────────────────────────── */}
      {/* VOUCHER TABLE ROWS                                            */}
      {/* ────────────────────────────────────────────────────────────── */}
      <div className="bg-[#161616] border border-[#262626] rounded-xl overflow-hidden" id="vouchers-admin-list">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#262626] text-[#737373] uppercase font-mono text-[9px] bg-[#0c0c0c]">
                <th className="py-4 px-4 w-36">Promo Code</th>
                <th className="py-4 px-3">Multiplier Reward</th>
                <th className="py-4 px-3">Validity Span</th>
                <th className="py-4 px-3">Description Narrative</th>
                <th className="py-4 px-3 text-center">Status Flag</th>
                <th className="py-4 px-4 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]/40">
              {offers.map((off) => (
                <tr key={off.id} className="hover:bg-[#1a1a1a]/30 transition-colors">
                  
                  {/* Code */}
                  <td className="py-4 px-4 font-mono font-black text-white text-sm select-all flex items-center gap-2">
                    <Ticket size={13} className="text-[#facc15]" /> {off.code}
                  </td>

                  {/* Discount */}
                  <td className="py-4 px-3">
                    <span className="font-mono text-xs text-emerald-400 font-extrabold bg-emerald-950/40 px-2 py-1 rounded inline-block border border-emerald-500/20">
                      FLAT {off.discount_percent}% OFF
                    </span>
                  </td>

                  {/* Dates */}
                  <td className="py-4 px-3 font-mono text-[#a3a3a3]">
                    {off.valid_from && off.valid_to ? (
                      <span className="text-[10px]">{off.valid_from} / {off.valid_to}</span>
                    ) : (
                      <span className="text-[#525252] text-[10px] uppercase font-bold italic">No expiry set</span>
                    )}
                  </td>

                  {/* Narrative */}
                  <td className="py-4 px-3 text-gray-400 font-light max-w-xs truncate">
                    {off.description || "General seasonal tourism rental benefit code."}
                  </td>

                  {/* Toggle */}
                  <td className="py-4 px-3 text-center">
                    <button
                      onClick={() => toggleOfferState(off.id, off.is_active)}
                      type="button"
                      className="inline-flex transition-colors cursor-pointer"
                    >
                      {off.is_active ? (
                        <ToggleRight size={26} className="text-[#facc15]" />
                      ) : (
                        <ToggleLeft size={26} className="text-[#444]" />
                      )}
                    </button>
                  </td>

                  {/* Delete Button */}
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => deleteOffer(off.id, off.code)}
                      className="p-1.5 bg-[#202020] hover:bg-rose-950 text-gray-500 hover:text-rose-400 rounded cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
