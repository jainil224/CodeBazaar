import { useEffect, useState } from 'react';
import { CheckCircle, Download, X, Sparkles, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PaymentSuccessModalProps {
  isOpen: boolean;
  projectTitle: string;
  paymentId: string;
  amount: number;
  onClose: () => void;
  onDownload: () => void;
}

export default function PaymentSuccessModal({
  isOpen,
  projectTitle,
  paymentId,
  amount,
  onClose,
  onDownload,
}: PaymentSuccessModalProps) {
  const [copied, setCopied] = useState(false);

  // Auto close after 30s
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(onClose, 30000);
    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  const handleCopy = () => {
    navigator.clipboard.writeText(paymentId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal Card */}
          <motion.div
            className="relative w-full max-w-md bg-[#0e0e1a] border border-white/10 rounded-3xl shadow-[0_0_80px_rgba(105,56,255,0.35)] overflow-hidden"
            initial={{ scale: 0.8, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          >
            {/* Gradient top bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-violet-600 via-purple-500 to-pink-500" />

            {/* Glow blob */}
            <div className="absolute top-[-60px] left-1/2 -translate-x-1/2 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative z-10 p-8 flex flex-col items-center text-center gap-5">
              {/* Animated Success Icon */}
              <motion.div
                className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-[0_0_40px_rgba(52,211,153,0.4)]"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.15, duration: 0.5, times: [0, 0.7, 1] }}
              >
                <CheckCircle className="w-10 h-10 text-white" strokeWidth={2.5} />
              </motion.div>

              {/* Sparkle decoration */}
              <motion.div
                className="absolute top-12 left-12 text-yellow-400"
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 0.9, 1] }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                <Sparkles className="w-5 h-5 opacity-60" />
              </motion.div>
              <motion.div
                className="absolute top-10 right-16 text-violet-400"
                animate={{ rotate: [0, -20, 20, 0], scale: [1, 0.8, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 4, delay: 1 }}
              >
                <Sparkles className="w-4 h-4 opacity-50" />
              </motion.div>

              {/* Title */}
              <div>
                <h2 className="text-2xl font-bold text-white">Payment Successful!</h2>
                <p className="text-white/50 text-sm mt-1">Your purchase is confirmed 🎉</p>
              </div>

              {/* Amount Badge */}
              <div className="bg-emerald-500/10 border border-emerald-400/25 text-emerald-300 font-bold text-lg px-6 py-2 rounded-full">
                ₹{amount} Paid
              </div>

              {/* Project name */}
              <div className="w-full bg-white/[0.05] border border-white/10 rounded-2xl p-4 text-left">
                <p className="text-white/40 text-xs uppercase tracking-widest font-mono mb-1">Project Unlocked</p>
                <p className="text-white font-semibold text-base leading-snug">{projectTitle}</p>
              </div>

              {/* Payment ID */}
              <div className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3 flex items-center justify-between gap-2">
                <div className="overflow-hidden">
                  <p className="text-white/30 text-[10px] uppercase tracking-widest font-mono">Payment ID</p>
                  <p className="text-white/70 text-xs font-mono truncate">{paymentId}</p>
                </div>
                <button
                  onClick={handleCopy}
                  className="shrink-0 text-white/40 hover:text-white transition-colors"
                  title="Copy Payment ID"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Download CTA */}
              <motion.button
                onClick={onDownload}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(105,56,255,0.3)] hover:shadow-[0_0_40px_rgba(105,56,255,0.5)] transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download className="w-5 h-5" />
                Download Source Code
              </motion.button>

              <p className="text-white/25 text-[11px]">
                Keep your Payment ID safe for future reference
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
