import { useState, useEffect } from 'react';
import {
  X, Share2, Heart, ExternalLink, ShieldCheck, Code2,
  CheckCircle2, Sparkles, Layers, ZoomIn, Zap, Smartphone,
  FileCode2, Copy, Check, ArrowUpRight, Package, Download,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductDownloadButton from '@/features/digitalProducts/components/ProductDownloadButton';
import { trackEvent } from '@/lib/analytics';

export interface ProjectDetail {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  tags: string[];
  price: string;
  imageUrl: string;
  previewUrl?: string;
  techStack: {
    category: string;
    color: string;
    items: string[];
  }[];
  features?: string[];
  highlights?: {
    icon: React.ReactNode;
    label: string;
    value: string;
    color: string;
  }[];
  thumbnails?: string[];
  postedTime?: string;
  systemRequirements?: string;
}

interface ProjectPreviewModalProps {
  project: ProjectDetail | null;
  isPurchased: boolean;
  isLoading: boolean;
  isFavorited: boolean;
  onToggleFavorite: () => void;
  onClose: () => void;
  onPurchase: () => void;
  onDownload: () => void;
  isStandalone?: boolean;
}

export default function ProjectPreviewModal({
  project,
  isPurchased,
  isFavorited,
  onToggleFavorite,
  onClose,
  onPurchase,
  onDownload,
  isStandalone = false,
}: ProjectPreviewModalProps) {
  const [activeImage, setActiveImage] = useState<string>('');
  const [shareCopied, setShareCopied] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    if (project) setActiveImage(project.imageUrl);
  }, [project]);

  if (!project) return null;

  const gallery = project.thumbnails?.length ? project.thumbnails : [project.imageUrl];

  const handleShare = () => {
    const url = `${window.location.origin}/?preview=${project.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setShareCopied(true);
      trackEvent('share_clicked', { productId: project.id, productTitle: project.title });
      setTimeout(() => setShareCopied(false), 2000);
    });
  };

  const handleToggleFavorite = () => {
    onToggleFavorite();
    trackEvent(isFavorited ? 'wishlist_removed' : 'wishlist_added', { productId: project.id, productTitle: project.title });
  };

  const FEATURES_LIST = project.features?.length ? project.features : [
    'Full React / Next.js source code repository',
    'Modular component architecture & Tailwind CSS',
    'Instant ZIP download with commercial license',
    'Lifetime access with no recurring fees',
    'Complete setup documentation included',
    'Mobile-first responsive design',
  ];

  /* ══════════════════════════════════════════════════════
     MODAL CONTENT
  ══════════════════════════════════════════════════════ */
  const modalContent = (
    <div
      className={
        isStandalone
          ? 'relative w-full flex-1 bg-transparent text-white flex flex-col overflow-hidden z-10'
          : 'relative w-full h-full text-white flex flex-col overflow-hidden'
      }
      style={{ background: isStandalone ? 'transparent' : '#0a0914' }}
    >
      {/* ── STICKY HEADER ─────────────────────────────────── */}
      <div
        className="sticky top-0 z-50 px-3 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between shrink-0 border-b"
        style={{
          background: 'rgba(10,9,20,0.95)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderColor: 'rgba(255,255,255,0.08)',
        }}
      >
        {/* Left: Category badge */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
          <span
            className="text-[9px] sm:text-[10px] font-extrabold tracking-wider uppercase px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-mono shrink-0"
            style={{
              background: 'rgba(139,92,246,0.15)',
              border: '1px solid rgba(139,92,246,0.3)',
              color: '#c4b5fd',
            }}
          >
            {project.techStack?.[0]?.category || 'Template'}
          </span>
          <span className="hidden sm:block text-xs text-white/40 truncate max-w-[200px]">{project.title}</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={handleShare}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold transition-all cursor-pointer active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            {shareCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span className="hidden sm:inline">{shareCopied ? 'Copied!' : 'Share'}</span>
          </button>

          <button
            onClick={handleToggleFavorite}
            className="p-1.5 sm:p-2 rounded-lg transition-all cursor-pointer active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            title={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-white/50'}`} />
          </button>

          {!isStandalone && (
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
      </div>

      {/* ── SCROLLABLE BODY ───────────────────────────────── */}
      <div className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
        <div className="p-3 sm:p-5 lg:p-6 max-w-5xl mx-auto">

          {/* ═══ HERO IMAGE ═══════════════════════════════ */}
          <div
            className="relative overflow-hidden mb-4 sm:mb-5 group cursor-pointer"
            style={{
              borderRadius: 16,
              background: '#0d0b1e',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            }}
            onClick={() => setIsLightboxOpen(true)}
          >
            {/* Image container */}
            <div className="relative bg-[#080712] overflow-hidden flex items-center justify-center aspect-video max-h-[320px] sm:max-h-[420px]">
              <img
                src={activeImage}
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-20 scale-110 pointer-events-none"
              />
              <img
                src={activeImage}
                alt={project.title}
                className="relative z-10 w-full h-full object-contain object-top drop-shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
              />

              {/* Zoom hint */}
              <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-[1px]">
                <div
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{
                    background: 'rgba(0,0,0,0.7)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                  }}
                >
                  <ZoomIn className="w-4 h-4 text-purple-300" />
                  Click to enlarge
                </div>
              </div>
            </div>

            {/* Thumbnails (if multiple) */}
            {gallery.length > 1 && (
              <div
                className="flex gap-2 p-2 overflow-x-auto no-scrollbar"
                style={{ background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImage(img);
                    }}
                    className={`aspect-video rounded-lg overflow-hidden transition-all cursor-pointer shrink-0 ${
                      activeImage === img ? 'ring-2 ring-purple-400' : 'opacity-50 hover:opacity-80'
                    }`}
                    style={{
                      width: 80,
                      background: '#0a0914',
                      border: `2px solid ${activeImage === img ? 'rgba(168,85,247,0.6)' : 'rgba(255,255,255,0.1)'}`,
                    }}
                  >
                    <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ═══ TITLE & DESCRIPTION CARD ═════════════════ */}
          <div
            className="p-4 sm:p-5 mb-4 sm:mb-5 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight tracking-tight mb-2">
              {project.title}
            </h1>
            <p className="text-white/60 text-sm sm:text-base leading-relaxed">
              {project.longDescription || project.description}
            </p>
          </div>

          {/* ═══ 2-COLUMN LAYOUT (Desktop) / STACKED (Mobile) ═ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">

            {/* LEFT COLUMN - 2 cols on desktop */}
            <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-5">

              {/* KEY METRICS ROW */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                {[
                  { label: 'Build', value: '<1s', Icon: Zap, color: '#f59e0b' },
                  { label: 'Mobile', value: '100%', Icon: Smartphone, color: '#06b6d4' },
                  { label: 'Source', value: 'Full', Icon: FileCode2, color: '#10b981' },
                  { label: 'License', value: 'Lifetime', Icon: ShieldCheck, color: '#8b5cf6' },
                ].map(({ label, value, Icon, color }) => (
                  <div
                    key={label}
                    className="flex flex-col gap-2 p-3 sm:p-3.5 rounded-xl"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] sm:text-[10px] uppercase font-mono font-bold text-white/35 tracking-wider">
                        {label}
                      </span>
                      <div className="p-1 rounded-lg" style={{ background: `${color}18`, border: `1px solid ${color}35` }}>
                        <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3" style={{ color }} />
                      </div>
                    </div>
                    <div className="text-base sm:text-lg font-black text-white tracking-tight">{value}</div>
                  </div>
                ))}
              </div>

              {/* WHAT'S INCLUDED */}
              <div
                className="p-4 sm:p-5 rounded-2xl"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="p-1.5 rounded-xl"
                    style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}
                  >
                    <Package className="w-4 h-4 text-purple-300" />
                  </div>
                  <h3 className="text-xs uppercase font-mono font-bold tracking-[0.14em] text-white/70">
                    What's Included
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {FEATURES_LIST.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{
                          background: 'rgba(52,211,153,0.12)',
                          border: '1px solid rgba(52,211,153,0.25)',
                        }}
                      >
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                      </div>
                      <span className="text-xs sm:text-[13px] text-white/70 font-medium leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* TECH STACK */}
              <div
                className="p-4 sm:p-5 rounded-2xl"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="p-1.5 rounded-xl"
                    style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}
                  >
                    <Code2 className="w-4 h-4 text-purple-300" />
                  </div>
                  <h3 className="text-xs uppercase font-mono font-bold tracking-[0.14em] text-white/70">
                    Tech Stack
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.75)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {project.systemRequirements && (
                  <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="text-[10px] text-white/35 font-bold uppercase tracking-wider block mb-2 font-mono">
                      Requirements
                    </span>
                    <div
                      className="text-xs text-white/65 font-mono px-3 py-2 rounded-lg"
                      style={{
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      {project.systemRequirements}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDEBAR - 1 col on desktop */}
            <div className="flex flex-col gap-4 sm:gap-5">

              {/* PRICE & CTA CARD */}
              <div
                className="relative overflow-hidden rounded-2xl p-4 sm:p-5 flex flex-col gap-4 sticky top-[60px]"
                style={{
                  background: 'linear-gradient(145deg, rgba(20,17,45,0.95) 0%, rgba(12,10,28,0.98) 100%)',
                  border: '1px solid rgba(139,92,246,0.35)',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                }}
              >
                {/* Corner glows */}
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
                  style={{ background: 'rgba(139,92,246,0.12)', filter: 'blur(30px)' }}
                />
                <div
                  className="absolute bottom-0 left-0 w-24 h-24 rounded-full pointer-events-none"
                  style={{ background: 'rgba(99,102,241,0.08)', filter: 'blur(20px)' }}
                />

                {/* Price row */}
                <div className="relative z-10 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                        {project.price}
                      </span>
                      <span className="text-white/30 text-xs sm:text-sm line-through font-mono">₹499</span>
                      <span
                        className="text-[9px] sm:text-[10px] font-bold font-mono px-1.5 sm:px-2 py-0.5 rounded-md"
                        style={{
                          background: 'rgba(52,211,153,0.15)',
                          border: '1px solid rgba(52,211,153,0.3)',
                          color: '#6ee7b7',
                        }}
                      >
                        90% OFF
                      </span>
                    </div>
                    <span className="text-white/40 text-[9px] sm:text-[10px] font-mono uppercase tracking-wider block mt-1">
                      Lifetime License
                    </span>
                  </div>

                  <div
                    className="shrink-0 flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      background: 'rgba(52,211,153,0.12)',
                      border: '1px solid rgba(52,211,153,0.35)',
                      color: '#6ee7b7',
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="hidden sm:inline">Instant</span>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="relative z-10">
                  {isPurchased ? (
                    <button
                      onClick={onDownload}
                      className="w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-xl font-bold text-sm text-white transition-all active:scale-95"
                      style={{
                        background: 'linear-gradient(135deg, #059669, #10b981)',
                        boxShadow: '0 8px 24px rgba(16,185,129,0.35)',
                      }}
                    >
                      <Download className="w-4 h-4" />
                      Download ZIP
                    </button>
                  ) : (
                    <ProductDownloadButton
                      productId={project.id}
                      price={project.price}
                      productTitle={project.title}
                      onPurchase={onPurchase}
                      className="w-full"
                    />
                  )}

                  {project.previewUrl && (
                    <a
                      href={project.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer mt-2.5"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: 'rgba(255,255,255,0.8)',
                      }}
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
                      Live Demo
                    </a>
                  )}
                </div>

                {/* Trust badges */}
                <div
                  className="relative z-10 grid grid-cols-2 gap-2 pt-3"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {['Instant ZIP', 'Full Source', 'Commercial', 'Secured'].map((bullet) => (
                    <div key={bullet} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-[9px] sm:text-[10px] text-white/60 font-medium">{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECURITY BADGE */}
              <div
                className="flex gap-3 items-start p-3.5 sm:p-4 rounded-2xl"
                style={{
                  background: 'rgba(4,120,87,0.08)',
                  border: '1px solid rgba(16,185,129,0.25)',
                }}
              >
                <div
                  className="p-1.5 rounded-xl shrink-0"
                  style={{
                    background: 'rgba(16,185,129,0.15)',
                    border: '1px solid rgba(16,185,129,0.3)',
                  }}
                >
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-[10px] sm:text-xs font-bold text-emerald-300 uppercase tracking-wider font-mono">
                    Secure Purchase
                  </h4>
                  <p className="text-emerald-100/60 text-[10px] sm:text-[11px] leading-relaxed mt-1">
                    Payment verified via Razorpay. Complete ZIP unlocked immediately.
                  </p>
                </div>
              </div>

              {/* QUICK OVERVIEW */}
              <div
                className="p-4 sm:p-5 rounded-2xl"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="p-1.5 rounded-xl"
                    style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}
                  >
                    <Sparkles className="w-4 h-4 text-purple-300" />
                  </div>
                  <h3 className="text-xs uppercase font-mono font-bold tracking-[0.14em] text-white/70">
                    Overview
                  </h3>
                </div>
                <p className="text-white/60 text-xs sm:text-[13px] leading-relaxed">
                  {project.longDescription || project.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* ── Lightbox ─────────────────────────────────────────── */
  const lightboxModal = (
    <AnimatePresence>
      {isLightboxOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8"
          style={{ background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-2xl text-white/60 hover:text-white transition-all cursor-pointer z-10"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <X className="w-6 h-6" />
          </button>
          <motion.div
            className="relative max-w-6xl max-h-[90vh] flex items-center justify-center overflow-hidden"
            style={{
              borderRadius: 20,
              border: '1px solid rgba(255,255,255,0.15)',
              background: '#09081a',
            }}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeImage}
              alt={project.title}
              className="w-auto h-auto max-w-full max-h-[85vh] object-contain select-none"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (isStandalone) {
    return (
      <>
        {modalContent}
        {lightboxModal}
      </>
    );
  }

  return (
    <>
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-[9998] flex items-center justify-center p-0 sm:p-4"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 cursor-default" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-5xl flex flex-col overflow-hidden z-10"
            style={{
              background: '#0a0914',
              borderRadius: 'clamp(0px, 2vw, 24px)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
              maxHeight: 'clamp(100vh, 94vh, 94vh)',
            }}
            initial={{ scale: 0.96, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 16, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 380 }}
          >
            {modalContent}
          </motion.div>
        </motion.div>
      </AnimatePresence>
      {lightboxModal}
    </>
  );
}
