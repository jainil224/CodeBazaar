import { useState, useEffect } from 'react';
import { X, Share2, Heart, ExternalLink, ShieldCheck, Code, Maximize2, CheckCircle2, Sparkles, Layers, ZoomIn, Zap, Smartphone, FileCode2 } from 'lucide-react';
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
  isFavorited,
  onToggleFavorite,
  onClose,
  onPurchase,
  isStandalone = false,
}: ProjectPreviewModalProps) {
  const [activeImage, setActiveImage] = useState<string>('');
  const [shareCopied, setShareCopied] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Sync active image when project opens
  useEffect(() => {
    if (project) {
      setActiveImage(project.imageUrl);
    }
  }, [project]);

  if (!project) return null;

  // Compile list of gallery images (main image + variants/thumbnails)
  const gallery = project.thumbnails && project.thumbnails.length > 0
    ? project.thumbnails
    : [project.imageUrl];

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
    if (isFavorited) {
      trackEvent('wishlist_removed', { productId: project.id, productTitle: project.title });
    } else {
      trackEvent('wishlist_added', { productId: project.id, productTitle: project.title });
    }
  };

  const modalContent = (
    <div
      className={
        isStandalone
          ? "relative w-full flex-1 bg-transparent text-white flex flex-col overflow-hidden z-10"
          : "relative w-full h-full bg-[#0c0c14] text-white flex flex-col overflow-hidden"
      }
    >
      {/* ── TOP HEADER BREADCRUMBS ─────────────────────────────── */}
      <div className="px-4 sm:px-8 py-3 bg-[#0c0c14]/95 border-b border-white/10 flex items-center justify-between text-xs text-white/50 font-medium shrink-0 backdrop-blur-xl">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap overflow-hidden text-[11px] sm:text-xs">
          <span className="hover:text-purple-400 transition-colors cursor-pointer shrink-0" onClick={onClose}>Home</span>
          <span className="text-white/20 shrink-0">/</span>
          <span className="hover:text-purple-400 transition-colors cursor-pointer shrink-0" onClick={onClose}>Templates</span>
          <span className="text-white/20 shrink-0">/</span>
          <span className="text-white font-semibold truncate">{project.title}</span>
        </div>
        
        {/* Header controls: Open in New Page button + Close button */}
        {!isStandalone && (
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <button
              onClick={() => window.open(`?preview=${project.id}`, '_blank')}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-semibold text-xs transition-colors border border-white/10 cursor-pointer"
              title="Open Preview in New Tab"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open in New Tab</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* ── MAIN CONTENT AREA (SCROLLABLE) ──────────────────────── */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-8 flex flex-col lg:flex-row gap-5 sm:gap-8 min-h-0 [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
        
        {/* ── LEFT COLUMN: BROWSER MOCKUP & SHOWCASE ────────────── */}
        <div className="flex-1 flex flex-col gap-4 sm:gap-6">
          
          {/* Browser frame mockup */}
          <div className="bg-[#121021] border border-white/15 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col shrink-0">
            {/* Browser top-bar */}
            <div className="bg-[#18162b] border-b border-white/10 px-3.5 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between shrink-0 select-none">
              {/* macOS traffic light dots */}
              <div className="flex gap-1.5 sm:gap-2">
                <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              </div>
              
              {/* Address input */}
              <div className="bg-black/60 border border-white/15 text-zinc-300 text-[10px] sm:text-[11px] font-mono rounded-lg px-3 sm:px-4 py-1 sm:py-1.5 max-w-[200px] sm:max-w-none sm:w-72 text-center truncate shadow-inner flex items-center justify-center gap-1.5">
                <span className="text-emerald-400 text-[10px]">🔒</span>
                <span className="truncate">codebazaar.dev/preview/{project.id}</span>
              </div>
              
              {/* Right badge */}
              <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider text-purple-300 bg-purple-500/20 border border-purple-500/40 px-2 sm:px-2.5 py-0.5 rounded-full shadow-sm">
                <Sparkles className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-purple-300" />
                <span>Live View</span>
              </div>
            </div>

            {/* Screenshot viewport (Proper aspect & ambient background so full image is visible without cut-off) */}
            <div className="relative bg-[#080712] overflow-hidden flex items-center justify-center min-h-[260px] sm:min-h-[380px] max-h-[520px] aspect-video group select-none">
              {/* Ambient blurred backdrop for aesthetic fit */}
              <img
                src={activeImage}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-30 scale-110 pointer-events-none"
              />
              {/* Foreground crisp screenshot */}
              <img
                src={activeImage}
                alt={project.title}
                className="relative z-10 w-full h-full object-contain object-top drop-shadow-2xl transition-transform duration-500 group-hover:scale-[1.01]"
              />

              {/* Full view overlay button */}
              <button
                onClick={() => setIsLightboxOpen(true)}
                className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/80 hover:bg-black/95 text-white/90 hover:text-white text-xs font-semibold backdrop-blur-md border border-white/20 transition-all opacity-0 group-hover:opacity-100 shadow-xl cursor-pointer"
                title="View Full Resolution Image"
              >
                <ZoomIn className="w-3.5 h-3.5 text-purple-300" />
                <span>Full View</span>
              </button>
            </div>
          </div>

          {/* Thumbnail Selector Carousel */}
          {gallery.length > 1 && (
            <div className="grid grid-cols-4 gap-2 sm:gap-3 shrink-0">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-[#0a0914] border-2 transition-all cursor-pointer ${
                    activeImage === img
                      ? 'border-purple-400 ring-2 ring-purple-400/40 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                      : 'border-white/15 hover:border-white/40 opacity-75 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Preview thumbnail ${idx + 1}`}
                    className="w-full h-full object-contain object-top"
                  />
                </button>
              ))}
            </div>
          )}

          {/* ── WHAT'S INCLUDED IN THIS TEMPLATE ────────────────── */}
          <div className="bg-[#131124] border border-purple-500/20 hover:border-purple-500/35 rounded-3xl p-5 sm:p-6 shadow-xl shrink-0 transition-all duration-300">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 shadow-sm">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-zinc-200">
                What's Included In This Template
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(project.features && project.features.length > 0 ? project.features : [
                'Full React / Next.js source code repository',
                'Modular component architecture & Tailwind CSS styles',
                'Instant ZIP package download with full commercial license',
                'Lifetime access with zero recurring subscription fees',
              ]).map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-[#181530]/70 border border-white/[0.07] hover:border-purple-500/40 hover:bg-[#1f1b3d] transition-all duration-200 group"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-xs sm:text-[13px] text-zinc-200 group-hover:text-white font-medium leading-snug">
                    {feat}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── KEY HIGHLIGHTS & ARCHITECTURE METRICS ───────────── */}
          <div className="bg-[#131124] border border-white/[0.08] hover:border-purple-500/30 rounded-3xl p-5 sm:p-6 shadow-xl shrink-0 transition-all duration-300">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-zinc-200">
                Core Architecture & Highlights
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Build Speed */}
              <div className="bg-[#181530]/70 border border-white/[0.07] hover:border-amber-500/40 hover:bg-[#1f1a3b] rounded-2xl p-3.5 flex flex-col justify-between transition-all duration-200 group">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-zinc-400 group-hover:text-zinc-300">Build Speed</span>
                  <div className="p-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400">
                    <Zap className="w-3 h-3" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xl sm:text-2xl font-black text-white tracking-tight">&lt; 1s</div>
                  <span className="text-[10px] text-zinc-400 font-mono block mt-0.5">Vite / Fast Bundler</span>
                </div>
              </div>

              {/* Responsive */}
              <div className="bg-[#181530]/70 border border-white/[0.07] hover:border-cyan-500/40 hover:bg-[#17203b] rounded-2xl p-3.5 flex flex-col justify-between transition-all duration-200 group">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-zinc-400 group-hover:text-zinc-300">Responsive</span>
                  <div className="p-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                    <Smartphone className="w-3 h-3" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xl sm:text-2xl font-black text-white tracking-tight">100%</div>
                  <span className="text-[10px] text-zinc-400 font-mono block mt-0.5">All Screen Sizes</span>
                </div>
              </div>

              {/* Source Code */}
              <div className="bg-[#181530]/70 border border-white/[0.07] hover:border-emerald-500/40 hover:bg-[#152331] rounded-2xl p-3.5 flex flex-col justify-between transition-all duration-200 group">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-zinc-400 group-hover:text-zinc-300">Source Code</span>
                  <div className="p-1 rounded-lg bg-emerald-500/15 border border-emerald-400/30 text-emerald-400">
                    <FileCode2 className="w-3 h-3" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xl sm:text-2xl font-black text-white tracking-tight">Clean</div>
                  <span className="text-[10px] text-zinc-400 font-mono block mt-0.5">Modular TypeScript</span>
                </div>
              </div>

              {/* License */}
              <div className="bg-[#181530]/70 border border-white/[0.07] hover:border-purple-500/40 hover:bg-[#20183b] rounded-2xl p-3.5 flex flex-col justify-between transition-all duration-200 group">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-zinc-400 group-hover:text-zinc-300">License</span>
                  <div className="p-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300">
                    <ShieldCheck className="w-3 h-3" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xl sm:text-2xl font-black text-white tracking-tight">Lifetime</div>
                  <span className="text-[10px] text-zinc-400 font-mono block mt-0.5">Unlimited Projects</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── RIGHT COLUMN: DETAILS & ACTIONS ───────────────────── */}
        <div className="w-full lg:w-[420px] shrink-0 flex flex-col gap-4 sm:gap-6">
          
          {/* Top metadata actions */}
          <div className="flex items-center justify-between shrink-0">
            <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] sm:text-[11px] font-extrabold tracking-wider uppercase px-3 sm:px-3.5 py-1 rounded-full font-mono shadow-sm">
              {project.techStack?.[0]?.category || 'Landing Page'}
            </span>
            
            <div className="flex gap-2">
              {/* Share button */}
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 bg-[#18162b] hover:bg-[#201d3a] border border-white/15 rounded-xl px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold text-zinc-200 hover:text-white transition-all cursor-pointer active:scale-95 shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5 text-purple-300" />
                <span>{shareCopied ? 'Copied!' : 'Share'}</span>
              </button>
              
              {/* Wishlist toggle */}
              <button
                onClick={handleToggleFavorite}
                className="flex items-center gap-1.5 bg-[#18162b] hover:bg-[#201d3a] border border-white/15 rounded-xl px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold text-zinc-200 hover:text-white transition-all cursor-pointer active:scale-95 shadow-sm"
              >
                <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-zinc-400'}`} />
                <span>{isFavorited ? 'Saved' : 'Wishlist'}</span>
              </button>
            </div>
          </div>

          {/* Title & Posted info */}
          <div>
            <h1 className="text-xl sm:text-3xl font-black text-white leading-tight tracking-tight">
              {project.title}
            </h1>
            <p className="text-purple-300/80 text-[11px] sm:text-xs mt-1.5 font-mono flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span>Production Ready · Flat ₹50 Instant License</span>
            </p>
          </div>

          {/* ── PRICE & PURCHASE HERO CARD ─────────────────────────── */}
          <div className="shrink-0 bg-gradient-to-b from-[#181533] via-[#141129] to-[#0f0d20] border border-purple-500/35 shadow-[0_16px_40px_rgba(0,0,0,0.6)] rounded-2xl sm:rounded-3xl p-4.5 sm:p-6 flex flex-col gap-4 relative overflow-hidden">
            {/* Ambient background glow accents */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Price Header Row */}
            <div className="relative z-10 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-baseline gap-2 sm:gap-2.5">
                  <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">{project.price}</span>
                  <span className="text-zinc-500 text-xs sm:text-sm line-through font-mono">₹499</span>
                  <span className="text-[10px] sm:text-[11px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md font-mono">
                    90% OFF
                  </span>
                </div>
                <span className="text-zinc-400 text-[10px] sm:text-[11px] font-mono block mt-1 uppercase tracking-wider font-semibold">
                  Lifetime Developer License
                </span>
              </div>

              <div className="shrink-0">
                <span className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 sm:px-3 py-1 rounded-full shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Instant Access
                </span>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="relative z-10 flex flex-col gap-2.5 pt-0.5">
              <ProductDownloadButton
                productId={project.id}
                price={project.price}
                productTitle={project.title}
                onPurchase={onPurchase}
                className="w-full shadow-purple-900/50"
              />

              {project.previewUrl && (
                <a
                  href={project.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#1e1b38] hover:bg-[#28244b] text-white/90 hover:text-white font-bold py-3 px-4 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider border border-white/15 hover:border-purple-500/40 transition-all active:scale-95 shadow-md cursor-pointer"
                >
                  <ExternalLink className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-purple-400" />
                  <span>Open Live Demo</span>
                </a>
              )}
            </div>

            {/* Trust & Assurance Micro-Features */}
            <div className="relative z-10 pt-2.5 border-t border-white/10 grid grid-cols-2 gap-2 text-[10px] sm:text-[11px] text-zinc-300 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Instant ZIP Download</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Full Source Code</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Commercial Rights</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Razorpay Secured</span>
              </div>
            </div>
          </div>

          {/* ── DESCRIPTION TEXT BOX ───────────────────────────────── */}
          <div className="bg-[#131124] border border-white/[0.08] hover:border-purple-500/25 rounded-3xl p-5 sm:p-6 shadow-xl transition-all duration-300 flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-zinc-200">
                Template Overview
              </h3>
            </div>
            <p className="text-zinc-300 text-xs sm:text-[13px] leading-relaxed font-normal">
              {project.longDescription || project.description}
            </p>
          </div>

          {/* Key Deliverables - Visible on Mobile view right after description */}
          <div className="block lg:hidden bg-[#131124] border border-purple-500/25 rounded-2xl p-4.5 shadow-xl">
            <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-purple-300 flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>What's Included</span>
            </h3>
            <div className="flex flex-col gap-2.5">
              {(project.features && project.features.length > 0 ? project.features : [
                'Full React / Next.js source code repository',
                'Modular component architecture & Tailwind CSS styles',
                'Instant ZIP package download with full commercial license',
                'Lifetime access with zero recurring subscription fees',
              ]).map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-zinc-100 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── TECHNICAL DETAILS PANEL ───────────────────────────── */}
          <div className="bg-[#131124] border border-white/[0.08] hover:border-purple-500/25 rounded-3xl p-5 sm:p-6 flex flex-col gap-4 shadow-xl transition-all duration-300">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300">
                <Code className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-zinc-200">
                Technical Specifications
              </h3>
            </div>

            <div className="flex flex-col gap-3.5">
              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-2 font-mono">Tech Stack</span>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-[#181530] border border-white/[0.09] hover:border-purple-400/50 hover:bg-[#201b40] text-zinc-200 hover:text-white text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-xl shadow-sm transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-white/[0.06]">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1 font-mono">System Requirements</span>
                <p className="text-zinc-200 text-xs font-mono font-medium bg-black/40 border border-white/[0.06] px-3 py-2 rounded-xl">
                  {project.systemRequirements || 'Node.js >= 18.x, modern browser'}
                </p>
              </div>
            </div>
          </div>

          {/* ── SAFE ESCROW BOX ───────────────────────────────────── */}
          <div className="bg-gradient-to-br from-[#0c1f17] to-[#07130e] border border-emerald-500/35 hover:border-emerald-500/50 rounded-2xl p-4 sm:p-4.5 flex gap-3 sm:gap-3.5 items-start shadow-lg transition-all duration-300">
            <div className="p-1.5 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider font-mono">Secure Direct Source Download</h4>
              <p className="text-emerald-100/80 text-[11px] sm:text-xs leading-relaxed mt-1 font-sans">
                Your payment is verified securely via Razorpay. The complete ZIP archive and source code files are unlocked immediately upon purchase.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );

  const lightboxModal = (
    <AnimatePresence>
      {isLightboxOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8 bg-black/95 backdrop-blur-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer z-10"
            title="Close Full View"
          >
            <X className="w-6 h-6" />
          </button>
          
          <motion.div
            className="relative max-w-6xl max-h-[90vh] flex items-center justify-center overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 shadow-2xl bg-[#090814]"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeImage}
              alt={project.title}
              className="w-auto h-auto max-w-full max-h-[85vh] object-contain rounded-xl select-none"
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
          className="fixed inset-0 z-[9998] flex items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-2xl overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop Click to Close */}
          <div className="absolute inset-0 cursor-default" onClick={onClose} />

          <motion.div
            className="relative w-full max-w-6xl bg-[#0c0c14] text-white rounded-none sm:rounded-3xl shadow-2xl flex flex-col max-h-none sm:max-h-[92vh] overflow-hidden border border-white/15 z-10"
            initial={{ scale: 0.95, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          >
            {modalContent}
          </motion.div>
        </motion.div>
      </AnimatePresence>
      {lightboxModal}
    </>
  );
}

