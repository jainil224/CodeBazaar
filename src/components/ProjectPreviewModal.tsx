import { useState, useEffect } from 'react';
import { X, Share2, Heart, ExternalLink, ShieldCheck, Code, Maximize2, CheckCircle2, Sparkles, Layers } from 'lucide-react';
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
      <div className="px-4 sm:px-8 py-3.5 bg-[#0c0c14]/90 border-b border-white/10 flex items-center justify-between text-xs text-white/50 font-medium shrink-0 backdrop-blur-xl">
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="hover:text-purple-400 transition-colors cursor-pointer" onClick={onClose}>Home</span>
          <span className="text-white/20">/</span>
          <span className="hover:text-purple-400 transition-colors cursor-pointer" onClick={onClose}>Templates</span>
          <span className="text-white/20">/</span>
          <span className="text-purple-400 font-mono font-bold uppercase text-[11px] bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
            {project.techStack?.[0]?.items?.[0] || 'Template'}
          </span>
          <span className="text-white/20">/</span>
          <span className="text-white font-semibold truncate max-w-[200px] sm:max-w-[320px]">{project.title}</span>
        </div>
        
        {/* Header controls: Open in New Page button + Close button */}
        {!isStandalone && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => window.open(`?preview=${project.id}`, '_blank')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-semibold text-xs transition-colors border border-white/10 cursor-pointer"
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
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col lg:flex-row gap-8 min-h-0 [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
        
        {/* ── LEFT COLUMN: BROWSER MOCKUP & SHOWCASE ────────────── */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Browser frame mockup */}
          <div className="bg-[#121021] border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            {/* Browser top-bar */}
            <div className="bg-[#18162b] border-b border-white/10 px-4 py-3 flex items-center justify-between shrink-0 select-none">
              {/* macOS traffic light dots */}
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              </div>
              
              {/* Address input */}
              <div className="bg-black/60 border border-white/15 text-zinc-300 text-[11px] font-mono rounded-lg px-4 py-1.5 w-64 text-center truncate shadow-inner flex items-center justify-center gap-1.5">
                <span className="text-emerald-400 text-[11px]">🔒</span>
                <span>codebazaar.dev/preview/{project.id}</span>
              </div>
              
              {/* Right badge */}
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-purple-300 bg-purple-500/20 border border-purple-500/40 px-2.5 py-0.5 rounded-full shadow-sm">
                <Sparkles className="w-3 h-3 text-purple-300" />
                <span>Live View</span>
              </div>
            </div>

            {/* Screenshot viewport */}
            <div className="aspect-video relative bg-black/60 overflow-hidden flex items-center justify-center group">
              <img
                src={activeImage}
                alt={project.title}
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-102"
              />
            </div>
          </div>

          {/* Thumbnail Selector Carousel */}
          {gallery.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`aspect-video rounded-2xl overflow-hidden bg-black/60 border-2 transition-all cursor-pointer ${
                    activeImage === img
                      ? 'border-purple-400 ring-2 ring-purple-400/40 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                      : 'border-white/15 hover:border-white/40 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Preview thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover object-top"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Key Deliverables & Highlights */}
          <div className="bg-[#131124] border border-purple-500/25 rounded-3xl p-6 shadow-xl">
            <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-purple-300 flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>What's Included In This Template</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {(project.features && project.features.length > 0 ? project.features : [
                'Full React / Next.js source code repository',
                'Modular component architecture & Tailwind CSS styles',
                'Instant ZIP package download with full commercial license',
                'Lifetime access with zero recurring subscription fees',
              ]).map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-100 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{feat}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── RIGHT COLUMN: DETAILS & ACTIONS ───────────────────── */}
        <div className="w-full lg:w-[420px] shrink-0 flex flex-col gap-6">
          
          {/* Top metadata actions */}
          <div className="flex items-center justify-between shrink-0">
            <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[11px] font-extrabold tracking-wider uppercase px-3.5 py-1 rounded-full font-mono shadow-sm">
              {project.techStack?.[0]?.category || 'Landing Page'}
            </span>
            
            <div className="flex gap-2">
              {/* Share button */}
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 bg-[#18162b] hover:bg-[#201d3a] border border-white/15 rounded-xl px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:text-white transition-all cursor-pointer active:scale-95 shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5 text-purple-300" />
                <span>{shareCopied ? 'Copied Link!' : 'Share'}</span>
              </button>
              
              {/* Wishlist toggle */}
              <button
                onClick={handleToggleFavorite}
                className="flex items-center gap-1.5 bg-[#18162b] hover:bg-[#201d3a] border border-white/15 rounded-xl px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:text-white transition-all cursor-pointer active:scale-95 shadow-sm"
              >
                <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-zinc-400'}`} />
                <span>{isFavorited ? 'Saved' : 'Wishlist'}</span>
              </button>
            </div>
          </div>

          {/* Title & Posted info */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
              {project.title}
            </h1>
            <p className="text-purple-300/80 text-xs mt-2 font-mono flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span>Production Ready · Flat ₹50 Instant License</span>
            </p>
          </div>

          {/* Price & Purchase Hero Card (Moved UP for instant visibility on mobile & desktop) */}
          <div className="bg-[#15122b] border border-purple-500/40 shadow-[0_12px_40px_rgba(0,0,0,0.8)] rounded-3xl p-5 sm:p-6 flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">{project.price}</span>
                <span className="text-zinc-400 text-[11px] font-mono block mt-0.5 uppercase tracking-wider font-semibold">Lifetime Developer License</span>
              </div>
              <span className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                Instant Download
              </span>
            </div>

            <div className="flex flex-col gap-2.5 pt-1">
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
                  className="w-full bg-[#1e1b38] hover:bg-[#28244b] text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider border border-white/15 transition-all active:scale-95 shadow-md"
                >
                  <ExternalLink className="w-4 h-4 text-purple-400" />
                  <span>Open Live Demo</span>
                </a>
              )}
            </div>
          </div>

          {/* Description text box */}
          <div className="bg-[#121021] border border-white/15 rounded-2xl p-5 text-zinc-200 text-sm leading-relaxed font-normal shadow-lg">
            {project.longDescription || project.description}
          </div>

          {/* Technical Details panel */}
          <div className="bg-[#131124] border border-white/15 rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
            <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-purple-300 flex items-center gap-2">
              <Code className="w-4 h-4 text-purple-400" />
              <span>Technical Specifications</span>
            </h3>

            <div className="flex flex-col gap-4">
              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-2 font-mono">Tech Stack</span>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-white/10 border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1 font-mono">System Requirements</span>
                <p className="text-zinc-200 text-xs font-mono font-medium">{project.systemRequirements || 'Node.js >= 18.x, Modern Web Browser'}</p>
              </div>
            </div>
          </div>

          {/* Safe Escrow Box */}
          <div className="bg-[#0d1f17] border border-emerald-500/40 rounded-2xl p-4.5 flex gap-3.5 items-start shadow-lg">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider font-mono">Secure Direct Source Download</h4>
              <p className="text-emerald-100/90 text-xs leading-relaxed mt-1 font-sans">
                Your payment is verified securely via Razorpay. The complete ZIP archive and source code files are unlocked immediately upon purchase.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );

  if (isStandalone) {
    return modalContent;
  }

  return (
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
  );
}

