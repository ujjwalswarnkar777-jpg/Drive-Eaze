/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isDestructive = false
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121212] border border-[#222] rounded-xl max-w-sm w-full p-6 shadow-2xl relative text-left">
        {/* Close Button */}
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-lg shrink-0 ${isDestructive ? 'bg-red-500/10 text-red-500' : 'bg-[#dfb15b]/10 text-[#dfb15b]'}`}>
            <AlertTriangle size={20} />
          </div>

          <div className="space-y-2">
            <h3 className="font-display font-bold text-sm text-white">{title}</h3>
            <p className="text-xs text-[#737373] leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#222] text-gray-400 hover:text-white font-mono text-[10px] font-bold rounded cursor-pointer transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 font-mono text-[10px] font-bold rounded cursor-pointer transition-colors ${
              isDestructive 
                ? 'bg-rose-600 hover:bg-rose-700 text-white' 
                : 'bg-[#dfb15b] hover:bg-[#cca43b] text-black'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
