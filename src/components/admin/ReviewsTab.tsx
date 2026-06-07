/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { db, subscribeToRealtime } from '../../lib/supabase';
import { Car, Review } from '../../types';
import { 
  Plus, ShieldCheck, XCircle, Trash2, Star, 
  MessageSquare, User, Sparkles, RefreshCw, KeyRound 
} from 'lucide-react';
import { toast } from '../Toast';
import { TableSkeleton } from '../Skeleton';

export default function ReviewsTab() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  // Manual Review Injection fields
  const [reviewerName, setReviewerName] = useState('');
  const [selectedCarId, setSelectedCarId] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const loadData = async () => {
    try {
      const allReviews = await db.getReviews(false); // Fetch ALL including unapproved
      const allCars = await db.getCars(true);
      setReviews(allReviews);
      setCars(allCars);
      if (allCars.length > 0 && !selectedCarId) {
        setSelectedCarId(allCars[0].id);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
    const unsubR = subscribeToRealtime('reviews', loadData);
    const unsubC = subscribeToRealtime('cars', loadData);
    return () => {
      unsubR();
      unsubC();
    };
  }, []);

  const toggleApproval = async (id: string, current: boolean) => {
    try {
      await db.approveReview(id, !current);
      toast.success(current ? "Review marks as hidden." : "✅ Review marked as Approved!");
      loadData();
    } catch (err) {
      toast.error("Error setting approval state.");
    }
  };

  const deleteReview = async (id: string) => {
    if (confirm("Permanently wipe this review feedback from your database record?")) {
      try {
        await db.deleteReview(id);
        toast.success("Feedback destroyed from server logs.");
        loadData();
      } catch (err) {
        toast.error("Deletion error.");
      }
    }
  };

  const insertOfflineReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName || !reviewText || !selectedCarId) {
      toast.error("Please supply Reviewer Name, Select Car, and write feedback.");
      return;
    }

    try {
      await db.createReview({
        reviewer_name: reviewerName,
        car_id: selectedCarId,
        rating,
        review_text: reviewText,
        is_approved: true // Manual inserts are pre-approved by the staff
      });

      toast.success("✅ Offline Google Review synced into carousel!");
      setReviewerName('');
      setReviewText('');
      setRating(5);
      setShowAddForm(false);
      loadData();
    } catch (err) {
      toast.error("Failed to inject manual review.");
    }
  };

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-6 text-left" id="reviews-tab-context">
      
      {/* ────────────────────────────────────────────────────────────── */}
      {/* HEADER ACTION LINE                                            */}
      {/* ────────────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-center bg-[#161616] p-4 rounded-lg border border-[#262626]">
        <div>
          <h2 className="font-display font-bold text-lg text-white">Lucknow Reviews Approval Console</h2>
          <span className="font-mono text-[9px] text-[#737373] uppercase block mt-0.5">Toggle live website visibility or key in manual Google reviews</span>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          type="button"
          className="px-4 py-2.5 bg-[#f97316] hover:bg-orange-600 text-black font-display font-medium text-xs rounded transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={16} /> Key Manual Review
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* MANUAL INJECT FORM BOX                                        */}
      {/* ────────────────────────────────────────────────────────────── */}
      {showAddForm && (
        <form onSubmit={insertOfflineReview} className="bg-[#161616] border border-[#262626] rounded-xl p-6 space-y-4 max-w-xl text-xs label-left" id="manual-review-form">
          <div className="border-b border-[#262626] pb-2">
            <h3 className="font-display font-bold text-white text-sm">Key offline feedback details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Reviewer */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono font-medium text-white block">Reviewer Name</label>
              <input 
                type="text" 
                required
                placeholder="Aditya Verma"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="w-full bg-[#0d0d0d] border border-[#262626] text-white p-2.5 rounded focus:outline-none"
              />
            </div>

            {/* Link Car */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono font-medium text-white block">Select Mapped vehicle</label>
              <select
                value={selectedCarId}
                onChange={(e) => setSelectedCarId(e.target.value)}
                className="w-full bg-[#0d0d0d] text-white border border-[#262626] rounded p-2.5 focus:outline-none"
              >
                {cars.map((c) => (
                  <option key={c.id} value={c.id}>{c.brand} {c.name}</option>
                ))}
              </select>
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Rating Stars select */}
            <div className="space-y-1 text-left">
              <label className="text-[11px] font-mono font-medium text-white block">Star Score Rating</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full bg-[#0d0d0d] text-white border border-[#262626] rounded p-2.5 focus:outline-none"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5 / 5 Optimal Stellar)</option>
                <option value={4}>⭐⭐⭐⭐ (4 / 5 Excellent)</option>
                <option value={3}>⭐⭐⭐ (3 / 5 Average)</option>
              </select>
            </div>
          </div>

          {/* Review Text */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono font-medium text-white block">Review Feedback Narrative Text</label>
            <textarea 
              rows={3} 
              required
              placeholder="e.g. Clean car, on-time Gomti nagar delivery without delays. Highly satisfied with Varanasi tour."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full bg-[#0d0d0d] border border-[#262626] text-white p-3 rounded focus:outline-none resize-none"
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
              className="px-5 py-2 bg-[#f97316] text-black font-display font-medium rounded hover:bg-orange-600"
            >
              Authorize Review publish
            </button>
          </div>
        </form>
      )}

      {/* ────────────────────────────────────────────────────────────── */}
      {/* DATA VIEW TABLE                                               */}
      {/* ────────────────────────────────────────────────────────────── */}
      <div className="bg-[#161616] border border-[#262626] rounded-xl overflow-hidden" id="reviews-admin-list">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#262626] text-[#737373] uppercase font-mono text-[9px] bg-[#0c0c0c]">
                <th className="py-4 px-4 w-40">Reviewer</th>
                <th className="py-4 px-3">Vehicle Match</th>
                <th className="py-4 px-3">Feedback Statement</th>
                <th className="py-4 px-3">Stars Rating</th>
                <th className="py-4 px-3 text-center">Approved Status</th>
                <th className="py-4 px-4 text-right">Force Wipe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]/40">
              {reviews.map((r) => (
                <tr key={r.id} className="hover:bg-[#1a1a1a]/30 transition-colors">
                  
                  {/* Name */}
                  <td className="py-3.5 px-4">
                    <div className="font-display font-extrabold text-white text-xs">{r.reviewer_name}</div>
                    <span className="font-mono text-[9px] text-[#737373] uppercase block mt-0.5">Verified Renter</span>
                  </td>

                  {/* Car */}
                  <td className="py-3.5 px-3">
                    {r.car ? (
                      <span className="text-[#a3a3a3] font-mono tracking-tight text-[10px]">{r.car.brand} {r.car.name}</span>
                    ) : (
                      <span className="text-[#525252] font-mono italic">General platform</span>
                    )}
                  </td>

                  {/* Text */}
                  <td className="py-3.5 px-3 max-w-sm text-gray-300 font-sans italic tracking-wide">
                    "{r.review_text}"
                  </td>

                  {/* Stars */}
                  <td className="py-3.5 px-3">
                    <div className="flex text-[#facc15] gap-0.5">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} size={11} fill="currentColor" />
                      ))}
                    </div>
                  </td>

                  {/* Status Toggle option */}
                  <td className="py-3.5 px-3 text-center">
                    <button
                      onClick={() => toggleApproval(r.id, r.is_approved)}
                      type="button"
                      className={`px-3 py-1 rounded font-mono text-[9px] uppercase tracking-wider font-bold transition-all cursor-pointer ${
                        r.is_approved 
                          ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-amber-950/20 text-amber-500 border border-amber-500/10'
                      }`}
                    >
                      {r.is_approved ? "Approved ✔" : "Pending Approval"}
                    </button>
                  </td>

                  {/* Delete */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => deleteReview(r.id)}
                      className="p-1.5 bg-[#202020] hover:bg-rose-950 text-gray-400 hover:text-rose-400 rounded cursor-pointer"
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
