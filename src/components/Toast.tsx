/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

// Global emitter helper
export const toast = {
  success: (msg: string) => {
    window.dispatchEvent(new CustomEvent('driveeaze_toast', { detail: { message: msg, type: 'success' } }));
  },
  error: (msg: string) => {
    window.dispatchEvent(new CustomEvent('driveeaze_toast', { detail: { message: msg, type: 'error' } }));
  },
  info: (msg: string) => {
    window.dispatchEvent(new CustomEvent('driveeaze_toast', { detail: { message: msg, type: 'info' } }));
  }
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type: ToastType }>;
      if (!customEvent.detail) return;
      
      const newToast: ToastItem = {
        id: Math.random().toString(36).substr(2, 9),
        message: customEvent.detail.message,
        type: customEvent.detail.type
      };

      setToasts((prev) => [...prev, newToast]);

      // Auto dismiss
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 5000);
    };

    window.addEventListener('driveeaze_toast', handleToastEvent);
    return () => {
      window.removeEventListener('driveeaze_toast', handleToastEvent);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full" id="toast-root">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className={`flex items-start gap-3 p-4 rounded-lg shadow-2xl border ${
              t.type === 'success'
                ? 'bg-[#161616] border-emerald-500/30 text-emerald-100'
                : t.type === 'error'
                ? 'bg-[#161616] border-rose-500/30 text-rose-100'
                : 'bg-[#161616] border-[#f97316]/30 text-[#f5f5f5]'
            }`}
          >
            <div className="mt-0.5" id={`toast-icon-${t.id}`}>
              {t.type === 'success' && <CheckCircle size={18} className="text-emerald-500" />}
              {t.type === 'error' && <AlertCircle size={18} className="text-rose-500" />}
              {t.type === 'info' && <Info size={18} className="text-[#f97316]" />}
            </div>
            
            <div className="flex-1 text-xs font-sans font-medium" id={`toast-msg-${t.id}`}>
              {t.message}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-gray-500 hover:text-white transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
