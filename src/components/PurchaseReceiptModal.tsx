import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Download,
  Copy,
  Check,
  Printer,
  ShieldCheck,
  RefreshCw,
  FileCode,
  Package,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import faviconLogo from '@/assets/favicons.png';
import { ReceiptPrinter, type ReceiptPrinterStage } from './ui/ReceiptPrinter';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface PurchaseReceiptData {
  projectId: string;
  projectTitle: string;
  projectCategory?: string;
  projectImage?: string;
  techStack?: string[];
  paymentId: string;
  orderId?: string;
  amount: number;
  currency?: string;
  buyerName?: string;
  buyerEmail?: string;
  date?: string;
  time?: string;
}

interface PurchaseReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadCode?: () => void;
  receiptData: PurchaseReceiptData;
  autoPlayStages?: boolean;
}

export default function PurchaseReceiptModal({
  isOpen,
  onClose,
  onDownloadCode,
  receiptData,
  autoPlayStages = true,
}: PurchaseReceiptModalProps) {
  const [stage, setStage] = useState<ReceiptPrinterStage>('processing');
  const [feedMotion] = useState<'stepped' | 'smooth'>('stepped');
  const [isCopied, setIsCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  // Formatted date & time
  const now = new Date();
  const displayDate = receiptData.date || now.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const displayTime = receiptData.time || now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const orderNumber = receiptData.orderId || `CB-${receiptData.paymentId.replace(/^pay_/, '').slice(0, 8).toUpperCase()}`;

  // Stage progression timer
  useEffect(() => {
    if (!isOpen) return;

    if (autoPlayStages) {
      setStage('processing');
      const printTimer = setTimeout(() => {
        setStage('printing');
      }, 900);

      const completeTimer = setTimeout(() => {
        setStage('complete');
      }, 3300);

      return () => {
        clearTimeout(printTimer);
        clearTimeout(completeTimer);
      };
    } else {
      setStage('complete');
    }
  }, [isOpen, autoPlayStages]);

  const handleCopyPaymentId = () => {
    navigator.clipboard.writeText(receiptData.paymentId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleReplayPrint = () => {
    setStage('processing');
    setTimeout(() => setStage('printing'), 500);
    setTimeout(() => setStage('complete'), 2900);
  };

  const handleDownloadPdf = async () => {
    if (!receiptRef.current) return;
    try {
      setIsGeneratingPdf(true);

      const receiptElement = receiptRef.current;

      const canvas = await html2canvas(receiptElement, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 80; // mm standard receipt width
      const pageHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [imgWidth, pageHeight + 6],
      });

      pdf.addImage(imgData, 'PNG', 0, 3, imgWidth, pageHeight);
      pdf.save(`CodeBazaar-Receipt-${orderNumber}.pdf`);
    } catch (error) {
      console.error('Failed to export receipt PDF:', error);
      alert('Could not export PDF automatically. You can use system print.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleBrowserPrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/85 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Ambient Glowing Blobs matching Website Hero Section */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden select-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-primary-indigo/30 via-primary-pink/20 to-primary-orange/20 rounded-full blur-[95px] opacity-75 animate-pulse" />
          <div className="absolute top-1/2 left-1/3 w-[380px] h-[380px] bg-purple-600/25 rounded-full blur-[85px]" />
        </div>

        {/* Backdrop click to dismiss */}
        <div className="fixed inset-0" onClick={onClose} />

        {/* Modal Container */}
        <motion.div
          className="relative z-10 w-full max-w-lg my-auto max-h-[94vh] flex flex-col items-center overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full"
          initial={{ scale: 0.88, opacity: 0, y: 35 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 24, stiffness: 320 }}
        >
          {/* Header Controls Bar */}
          <div className="w-full max-w-[420px] flex items-center justify-between px-2 py-2 mb-2 text-white">
            {/* Hero style status pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-white/90 font-mono shadow-sm">
              <span className="w-2 h-2 rounded-full bg-primary-green animate-pulse" />
              <span>Official Proof of Purchase</span>
            </div>

            <div className="flex items-center gap-2">
              {stage === 'complete' && (
                <button
                  onClick={handleReplayPrint}
                  title="Replay printing animation"
                  className="px-2.5 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white transition-all text-xs flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span className="text-[11px] font-medium font-sans">Replay</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all cursor-pointer active:scale-95"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Receipt Printer Machine & Animated Output */}
          <ReceiptPrinter.Root stage={stage} feedMotion={feedMotion} className="w-full">
            {/* Machine Top Body */}
            <ReceiptPrinter.Machine className="w-full max-w-[420px]">
              <ReceiptPrinter.Header>
                {/* Brand in printer header */}
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-primary-indigo to-primary-pink p-[1px] shadow-sm">
                    <div className="w-full h-full bg-[#0c0c16] rounded-[11px] flex items-center justify-center p-1">
                      <img src={faviconLogo} alt="CodeBazaar" className="w-full h-full object-contain" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-sans text-xs font-black text-white tracking-tight uppercase leading-none">
                      CODEBAZAAR <span className="text-[9px] font-mono text-primary-pink font-semibold">POS-PRO</span>
                    </span>
                    <span className="text-[9px] font-mono text-white/40 leading-tight">Instant License Engine</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ONLINE
                </div>
              </ReceiptPrinter.Header>

              {/* Glowing OLED LCD Screen */}
              <ReceiptPrinter.Screen className="border-purple-500/30">
                <ReceiptPrinter.Status />
                <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                  <span className="truncate max-w-[200px] text-white/70 font-medium">
                    {receiptData.projectTitle}
                  </span>
                  <span className="font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    ₹{receiptData.amount}
                  </span>
                </div>
              </ReceiptPrinter.Screen>
            </ReceiptPrinter.Machine>

            {/* Stepped Paper Ejection Slot */}
            <ReceiptPrinter.Output className="w-full max-w-[395px]">
              <ReceiptPrinter.Paper>
                {/* Ref for PDF export capture */}
                <div ref={receiptRef} className="printable-receipt text-left select-text bg-gradient-to-b from-[#ffffff] via-[#faf9ff] to-[#f4f2fd] p-3 text-[#131127] rounded-sm relative">
                  
                  {/* Top Gradient Decorative Bar on the Receipt */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-primary-indigo via-primary-pink to-primary-orange rounded-full mb-3 shadow-xs" />

                  {/* Receipt Header with Centered Favicon Logo (Brand text removed) */}
                  <div className="text-center pb-3 border-b-2 border-dashed border-purple-200 flex flex-col items-center">
                    {/* Centered Favicon Emblem */}
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary-indigo/15 via-primary-pink/15 to-primary-orange/15 p-1.5 flex items-center justify-center border border-purple-200 shadow-xs mb-2">
                      <img src={faviconLogo} alt="CodeBazaar Logo" className="w-full h-full object-contain" />
                    </div>
                    
                    <div className="flex items-center justify-center gap-1.5 text-[10.5px] font-black uppercase tracking-[0.2em] text-purple-950 font-mono">
                      <span>•</span>
                      <span>OFFICIAL DIGITAL RECEIPT</span>
                      <span>•</span>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-0.5 font-sans">
                      Ready-to-Use Projects & Complete Source Code
                    </p>

                    {/* Verified Guarantee Badge */}
                    <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-0.5 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300/80 text-emerald-800 text-[10px] font-bold shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>VERIFIED PURCHASE • 100% SECURE</span>
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="py-3 border-b border-dashed border-purple-200 grid grid-cols-2 gap-y-2 text-[11px] font-mono">
                    <div className="bg-slate-50/80 p-2 rounded-lg border border-slate-200/60">
                      <span className="text-slate-400 flex items-center gap-1 text-[8.5px] uppercase font-sans font-bold">
                        <Package className="w-2.5 h-2.5 text-purple-500" /> Order Reference
                      </span>
                      <span className="font-bold text-slate-900 text-xs mt-0.5 block">{orderNumber}</span>
                    </div>

                    <div className="bg-slate-50/80 p-2 rounded-lg border border-slate-200/60 text-right">
                      <span className="text-slate-400 inline-flex items-center gap-1 text-[8.5px] uppercase font-sans font-bold">
                        <Calendar className="w-2.5 h-2.5 text-primary-indigo" /> Date & Time
                      </span>
                      <span className="font-medium text-slate-800 text-[10px] mt-0.5 block">{displayDate}, {displayTime}</span>
                    </div>
                    
                    <div className="col-span-2 pt-0.5">
                      <span className="text-slate-400 block text-[9px] uppercase font-sans font-bold">Payment Transaction ID</span>
                      <div className="flex items-center justify-between gap-1 bg-purple-50/50 border border-purple-200/70 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-slate-900 break-all mt-1 shadow-xs">
                        <span className="truncate">{receiptData.paymentId}</span>
                        <button
                          onClick={handleCopyPaymentId}
                          title="Copy Payment ID"
                          className="shrink-0 text-purple-600 hover:text-purple-900 transition-colors p-0.5 cursor-pointer"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {receiptData.buyerName && (
                      <div className="col-span-2 pt-0.5">
                        <span className="text-slate-400 block text-[9px] uppercase font-sans font-bold">Licensed To (Owner)</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-primary-indigo to-primary-pink text-white text-[9px] font-bold flex items-center justify-center font-mono shrink-0">
                            {receiptData.buyerName.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-900 text-[11px] truncate">
                            {receiptData.buyerName} {receiptData.buyerEmail ? `(${receiptData.buyerEmail})` : ''}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Purchased Item Box with Thumbnail & Hero Category Pill */}
                  <div className="py-3 border-b-2 border-dashed border-purple-200">
                    <span className="text-slate-400 block text-[9px] uppercase font-sans font-bold mb-2">
                      Purchased Asset Details
                    </span>
                    
                    <div className="flex gap-2.5 items-center bg-white p-2.5 rounded-xl border border-purple-100 shadow-sm">
                      {receiptData.projectImage && (
                        <div className="w-14 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200 shadow-inner">
                          <img
                            src={receiptData.projectImage}
                            alt={receiptData.projectTitle}
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous"
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] uppercase tracking-wider font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-900 border border-purple-200/60">
                            {receiptData.projectCategory || 'Full Project'}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 truncate mt-1">
                          {receiptData.projectTitle}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-mono">
                          Commercial License • Complete ZIP
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-black text-sm text-slate-900">
                          ₹{receiptData.amount}
                        </span>
                      </div>
                    </div>

                    {/* What's included checklist */}
                    <div className="mt-2.5 space-y-1.5 text-[10px] text-slate-600 font-sans">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-medium">Commercial Developer License (Royalty-free)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileCode className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span className="font-medium">Complete Source Code ZIP & Future Updates</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Summary Table */}
                  <div className="py-3 border-b-2 border-dashed border-purple-200 space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between text-slate-600">
                      <span>Base License Fee:</span>
                      <span>₹{receiptData.amount}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Platform Fee & Taxes:</span>
                      <span className="text-emerald-700 font-bold">₹0.00 (Included)</span>
                    </div>
                    
                    {/* Bold Grand Total with Hero Gradient Accent */}
                    <div className="flex justify-between items-baseline pt-2 border-t border-purple-100 text-sm font-black">
                      <span className="text-slate-900 uppercase tracking-tight">TOTAL PAID:</span>
                      <span className="text-lg font-black bg-gradient-to-r from-primary-indigo via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        ₹{receiptData.amount}
                      </span>
                    </div>
                  </div>

                  {/* Authentic Stamp & Barcode / Security Seal */}
                  <div className="pt-3 pb-2 flex flex-col items-center text-center">
                    {/* SVG High-Contrast Barcode */}
                    <div className="w-full flex flex-col items-center py-1">
                      <svg className="w-48 h-9" viewBox="0 0 192 36" fill="currentColor">
                        <rect x="0" y="0" width="3" height="36" fill="#111827"/>
                        <rect x="6" y="0" width="2" height="36" fill="#111827"/>
                        <rect x="11" y="0" width="4" height="36" fill="#111827"/>
                        <rect x="18" y="0" width="1" height="36" fill="#111827"/>
                        <rect x="22" y="0" width="3" height="36" fill="#111827"/>
                        <rect x="28" y="0" width="2" height="36" fill="#111827"/>
                        <rect x="33" y="0" width="5" height="36" fill="#111827"/>
                        <rect x="41" y="0" width="2" height="36" fill="#111827"/>
                        <rect x="46" y="0" width="3" height="36" fill="#111827"/>
                        <rect x="52" y="0" width="1" height="36" fill="#111827"/>
                        <rect x="56" y="0" width="4" height="36" fill="#111827"/>
                        <rect x="63" y="0" width="2" height="36" fill="#111827"/>
                        <rect x="68" y="0" width="3" height="36" fill="#111827"/>
                        <rect x="74" y="0" width="1" height="36" fill="#111827"/>
                        <rect x="78" y="0" width="4" height="36" fill="#111827"/>
                        <rect x="85" y="0" width="2" height="36" fill="#111827"/>
                        <rect x="90" y="0" width="3" height="36" fill="#111827"/>
                        <rect x="96" y="0" width="2" height="36" fill="#111827"/>
                        <rect x="101" y="0" width="5" height="36" fill="#111827"/>
                        <rect x="109" y="0" width="1" height="36" fill="#111827"/>
                        <rect x="113" y="0" width="3" height="36" fill="#111827"/>
                        <rect x="119" y="0" width="2" height="36" fill="#111827"/>
                        <rect x="124" y="0" width="4" height="36" fill="#111827"/>
                        <rect x="131" y="0" width="1" height="36" fill="#111827"/>
                        <rect x="135" y="0" width="3" height="36" fill="#111827"/>
                        <rect x="141" y="0" width="2" height="36" fill="#111827"/>
                        <rect x="146" y="0" width="5" height="36" fill="#111827"/>
                        <rect x="154" y="0" width="2" height="36" fill="#111827"/>
                        <rect x="159" y="0" width="3" height="36" fill="#111827"/>
                        <rect x="165" y="0" width="1" height="36" fill="#111827"/>
                        <rect x="169" y="0" width="4" height="36" fill="#111827"/>
                        <rect x="176" y="0" width="2" height="36" fill="#111827"/>
                        <rect x="181" y="0" width="3" height="36" fill="#111827"/>
                        <rect x="187" y="0" width="2" height="36" fill="#111827"/>
                      </svg>
                      <p className="text-[8.5px] font-mono text-slate-500 tracking-[0.2em] mt-1 font-bold">
                        TX-AUTH-{receiptData.paymentId.slice(-10).toUpperCase()}
                      </p>
                    </div>

                    <div className="mt-2 text-[9px] text-slate-500 font-sans leading-tight">
                      Thank you for building with <span className="font-bold text-slate-900">CodeBazaar</span>!
                      <br />
                      Need assistance? <span className="font-semibold text-purple-700">support@codebazaar.dev</span>
                    </div>
                  </div>
                </div>
              </ReceiptPrinter.Paper>
            </ReceiptPrinter.Output>
          </ReceiptPrinter.Root>

          {/* Action Buttons matching the Hero Section CTAs */}
          <motion.div
            className="w-full max-w-[420px] mt-4 mb-3 flex flex-col gap-2.5 z-40"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: stage === 'complete' ? 1 : 0.85, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-2 gap-3">
              {/* Download PDF Button with Hero Gradient */}
              <button
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="group bg-gradient-to-r from-primary-indigo via-primary-pink to-primary-orange hover:brightness-110 text-white font-semibold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(61,90,254,0.3)] hover:shadow-[0_8px_32px_rgba(61,90,254,0.45)] active:scale-95 transition-all cursor-pointer text-xs uppercase tracking-wider disabled:opacity-60"
              >
                {isGeneratingPdf ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Exporting PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </>
                )}
              </button>

              {/* Source Code Download Button with Hero Glass Style */}
              {onDownloadCode && (
                <button
                  onClick={onDownloadCode}
                  className="bg-white/[0.08] hover:bg-white/[0.15] text-white font-semibold py-3.5 px-4 rounded-2xl border border-white/15 hover:border-white/30 active:scale-95 transition-all cursor-pointer text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
                >
                  <Package className="w-4 h-4 text-primary-pink" />
                  <span>Download Code</span>
                </button>
              )}
            </div>

            {/* Print & Return Controls */}
            <div className="flex items-center justify-between text-xs text-white/50 px-2 pt-1">
              <button
                onClick={handleBrowserPrint}
                className="hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>System Print</span>
              </button>

              <button
                onClick={onClose}
                className="hover:text-white font-semibold underline underline-offset-4 transition-colors cursor-pointer"
              >
                Back to Store
              </button>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
