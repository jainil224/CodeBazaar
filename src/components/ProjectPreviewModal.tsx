import { useState, useEffect } from 'react';
import { X, Share2, Heart, ExternalLink, ShieldCheck, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductDownloadButton from '@/features/digitalProducts/components/ProductDownloadButton';

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
  features: string[];
  highlights: {
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
}


export default function ProjectPreviewModal({
  project,
  isFavorited,
  onToggleFavorite,
  onClose,
  onPurchase,
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
    : [
        project.imageUrl,
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80'
      ];

  const handleShare = () => {
    const url = `${window.location.origin}/#projects`;
    navigator.clipboard.writeText(url).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9998] flex items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop Click to Close */}
        <div className="absolute inset-0 cursor-default" onClick={onClose} />

        {/* Modal Sheet Container */}
        <motion.div
          className="relative w-full max-w-5xl bg-[#f8fafc] text-slate-800 rounded-none sm:rounded-3xl shadow-2xl flex flex-col max-h-none sm:max-h-[92vh] overflow-hidden border border-slate-200/50 z-10"
          initial={{ scale: 0.95, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        >
          {/* ── TOP HEADER BREADCRUMBS ─────────────────────────────── */}
          <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium shrink-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="hover:text-violet-600 cursor-pointer">Home</span>
              <span>/</span>
              <span className="hover:text-violet-600 cursor-pointer">Projects</span>
              <span>/</span>
              <span className="hover:text-violet-600 cursor-pointer uppercase">{project.techStack[0]?.items[0] || 'Web App'}</span>
              <span>/</span>
              <span className="text-slate-600 font-semibold">{project.title}</span>
            </div>
            
            {/* Close Icon Button */}
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── MAIN CONTENT AREA (SCROLLABLE) ──────────────────────── */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-8 min-h-0 [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
            
            {/* ── LEFT COLUMN: BROWSER MOCKUP & CAROUSEL ────────────── */}
            <div className="flex-1 flex flex-col gap-4">
              {/* Browser frame mockup */}
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                {/* Browser top-bar */}
                <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center justify-between shrink-0 select-none">
                  {/* macOS dots */}
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  
                  {/* Address input */}
                  <div className="bg-white border border-slate-200/60 text-slate-400 text-[11px] font-mono rounded-lg px-4 py-1 w-64 text-center truncate shadow-inner">
                    codebazaar.dev/demo/{project.id}
                  </div>
                  
                  {/* Empty right flex placeholder */}
                  <div className="w-12" />
                </div>

                {/* Screenshot viewport */}
                <div className="aspect-video relative bg-slate-100 overflow-hidden">
                  <img
                    src={activeImage}
                    alt={project.title}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>

              {/* Thumbnail Selector Carousel */}
              <div className="grid grid-cols-4 gap-3">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`aspect-video rounded-xl overflow-hidden bg-white border-2 shadow-sm transition-all ${
                      activeImage === img
                        ? 'border-violet-500 ring-2 ring-violet-500/10'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-full object-cover object-top"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* ── RIGHT COLUMN: DETAILS & ACTIONS ───────────────────── */}
            <div className="w-full md:w-[400px] shrink-0 flex flex-col gap-6">
              
              {/* Top metadata actions */}
              <div className="flex items-center justify-between shrink-0">
                <span className="bg-violet-50 text-violet-600 border border-violet-100 text-[10px] font-extrabold tracking-wider uppercase px-3 py-1 rounded-full">
                  {project.techStack[0]?.category || 'Landing Page'}
                </span>
                
                <div className="flex gap-2">
                  {/* Share button */}
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors shadow-sm"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{shareCopied ? 'Copied' : 'Share'}</span>
                  </button>
                  
                  {/* Wishlist toggle */}
                  <button
                    onClick={onToggleFavorite}
                    className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors shadow-sm"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                    <span>Wishlist</span>
                  </button>
                </div>
              </div>

              {/* Title & Posted info */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight">
                  {project.title}
                </h1>
                <p className="text-slate-400 text-xs mt-1.5 font-medium">
                  Posted {project.postedTime || 'recently'} · Version {project.postedTime ? '1.0.0' : '2.0.0'}
                </p>
              </div>

              {/* Description text box */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-600 text-sm leading-relaxed">
                {project.longDescription}
              </div>

              {/* Price card */}
              <div className="bg-white border border-slate-200/70 shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-3xl p-5 flex flex-col gap-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">{project.price}</span>
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">One-time license fee</span>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <ProductDownloadButton
                      productId={project.id}
                      price={project.price}
                      productTitle={project.title}
                      onPurchase={onPurchase}
                      className="flex-1"
                    />

                    {project.previewUrl && (
                      <a
                        href={project.previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm border border-slate-200 transition-colors self-start h-[48px]"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Live Demo
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Technical Details panel */}
              <div className="bg-white border border-slate-200/70 shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-3xl p-5 flex flex-col gap-4">
                <h3 className="text-slate-900 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                  <Code className="w-4 h-4 text-violet-500" />
                  Technical Details
                </h3>

                <div className="flex flex-col gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Tech Stack</span>
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-slate-50 border border-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-lg"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">System Requirements</span>
                    <p className="text-slate-600 text-xs font-semibold">{project.systemRequirements || 'None'}</p>
                  </div>
                </div>
              </div>

              {/* Safe Escrow Box */}
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 flex gap-3 items-start">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Instant Escrow Delivery</h4>
                  <p className="text-emerald-700/80 text-[11px] leading-relaxed mt-1">
                    Payment is held securely in escrow. Download the complete ZIP archive immediately after transaction approval.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
