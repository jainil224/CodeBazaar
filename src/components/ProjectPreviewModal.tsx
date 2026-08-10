import { X, ExternalLink, CheckCircle2, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProjectDetail {
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
    items: string[];
  }[];
  features: string[];
  highlights: {
    icon: React.ReactNode;
    label: string;
    value: string;
  }[];
}

interface ProjectPreviewModalProps {
  project: ProjectDetail | null;
  isPurchased: boolean;
  isLoading: boolean;
  onClose: () => void;
  onPurchase: () => void;
  onDownload: () => void;
}

export default function ProjectPreviewModal({
  project,
  isPurchased,
  isLoading,
  onClose,
  onPurchase,
  onDownload,
}: ProjectPreviewModalProps) {
  if (!project) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9998] flex items-center justify-center px-3 py-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0c0c18] border border-white/10 rounded-3xl shadow-[0_0_100px_rgba(105,56,255,0.2)] scrollbar-thin"
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 24, stiffness: 280 }}
        >
          {/* Top gradient bar */}
          <div className="h-1 w-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 rounded-t-3xl" />

          {/* Close btn */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 z-20 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="p-6 sm:p-8">
            {/* ── Hero Screenshot ── */}
            <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 mb-8 group">
              <img
                src={project.imageUrl}
                alt={project.title}
                className="w-full object-cover object-top max-h-[320px] group-hover:scale-[1.02] transition-transform duration-500"
              />
              {/* Overlay gradient at bottom */}
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0c0c18] to-transparent" />

              {/* Price badge */}
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/20 text-white font-bold text-lg px-4 py-1.5 rounded-xl">
                {project.price}
              </div>

              {/* Preview link */}
              {project.previewUrl && (
                <a
                  href={project.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-4 right-14 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Live Preview
                </a>
              )}
            </div>

            {/* ── Title & Description ── */}
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight">
                {project.title}
              </h2>
              <p className="text-white/60 text-sm sm:text-base leading-relaxed">
                {project.longDescription}
              </p>
            </div>

            {/* ── Highlights Row ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {project.highlights.map((h, i) => (
                <div
                  key={i}
                  className="bg-white/[0.05] border border-white/10 rounded-2xl p-4 flex flex-col gap-1.5 text-center items-center"
                >
                  <div className="text-violet-400">{h.icon}</div>
                  <p className="text-white font-bold text-sm">{h.value}</p>
                  <p className="text-white/40 text-[11px] uppercase tracking-wider">{h.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {/* ── Tech Stack ── */}
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
                <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-violet-400" />
                  Tech Stack
                </h3>
                <div className="flex flex-col gap-4">
                  {project.techStack.map((group) => (
                    <div key={group.category}>
                      <p className="text-white/40 text-[11px] uppercase tracking-wider mb-2 font-mono">
                        {group.category}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {group.items.map((item) => (
                          <span
                            key={item}
                            className="bg-violet-500/10 border border-violet-400/20 text-violet-300 text-xs font-semibold px-3 py-1 rounded-full"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Features ── */}
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
                <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  What's Included
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {project.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-white/70 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ── Tags ── */}
            <div className="flex flex-wrap gap-2 mb-8">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-white/[0.06] border border-white/10 text-white/70 text-xs font-semibold px-3.5 py-1.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* ── CTA ── */}
            <div className="flex items-center gap-4">
              {isPurchased ? (
                <motion.button
                  onClick={onDownload}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(52,211,153,0.3)] transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ⬇ Download Source Code
                </motion.button>
              ) : (
                <motion.button
                  onClick={onPurchase}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-60 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(105,56,255,0.3)] transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <>⚡ Buy Now — {project.price}</>
                  )}
                </motion.button>
              )}
              <button
                onClick={onClose}
                className="px-6 py-4 border border-white/10 hover:border-white/30 text-white/60 hover:text-white rounded-2xl font-semibold transition-all text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export type { ProjectDetail };
