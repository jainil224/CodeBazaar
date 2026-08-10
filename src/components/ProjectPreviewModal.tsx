import { X, ExternalLink, CheckCircle2, Layers, Zap, ArrowRight } from 'lucide-react';
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
}

interface ProjectPreviewModalProps {
  project: ProjectDetail | null;
  isPurchased: boolean;
  isLoading: boolean;
  onClose: () => void;
  onPurchase: () => void;
  onDownload: () => void;
}

// Staggered children animation
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as any } },
};

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
        className="fixed inset-0 z-[9998] flex items-end sm:items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/75 backdrop-blur-2xl"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal Shell */}
        <motion.div
          className="relative w-full sm:max-w-3xl sm:mx-4 sm:my-4 max-h-[96vh] flex flex-col overflow-hidden rounded-t-[32px] sm:rounded-[32px]"
          style={{
            background: 'linear-gradient(145deg, #0f0f1e 0%, #13111f 60%, #0e0c1a 100%)',
            boxShadow: '0 0 0 1px rgba(139,92,246,0.15), 0 40px 120px rgba(0,0,0,0.8), 0 0 60px rgba(105,56,255,0.12)',
          }}
          initial={{ scale: 0.9, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.93, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        >
          {/* ── SCROLLABLE BODY ─────────────────────────────────────── */}
          <div className="overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-violet-500/30 [&::-webkit-scrollbar-thumb]:rounded-full">

            {/* ── HERO IMAGE SECTION ─────────────────────────────── */}
            <div className="relative w-full h-[220px] sm:h-[280px] overflow-hidden flex-shrink-0">
              {project.imageUrl ? (
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-full object-cover object-top scale-[1.02]"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-violet-900/40 to-purple-900/20 flex items-center justify-center">
                  <Layers className="w-16 h-16 text-violet-400/30" />
                </div>
              )}

              {/* Multi-layer image overlays for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1e] via-[#0f0f1e]/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f1e]/40 via-transparent to-transparent" />

              {/* Glowing accent line at bottom */}
              <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

              {/* Floating price pill */}
              <div className="absolute top-4 left-4">
                <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2">
                  <span className="text-white/50 text-xs font-medium">Only</span>
                  <span className="text-white font-black text-lg tracking-tight">{project.price}</span>
                </div>
              </div>

              {/* Live preview button */}
              {project.previewUrl && (
                <a
                  href={project.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-4 right-14 flex items-center gap-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/15 rounded-xl px-3 py-2 text-white text-xs font-semibold transition-all group"
                >
                  <ExternalLink className="w-3 h-3" />
                  Live Preview
                  <ArrowRight className="w-3 h-3 -translate-x-1 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all" />
                </a>
              )}

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-xl border border-white/10 hover:border-white/25 flex items-center justify-center text-white/50 hover:text-white transition-all z-20"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Title overlaid on hero */}
              <div className="absolute bottom-0 inset-x-0 p-6 pb-5">
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    {/* Category pill */}
                    <div className="inline-flex items-center gap-1.5 bg-violet-500/20 border border-violet-400/25 rounded-full px-3 py-1 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                      <span className="text-violet-300 text-[11px] font-semibold uppercase tracking-widest">Template</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight drop-shadow-lg">
                      {project.title}
                    </h2>
                  </div>
                </div>
              </div>
            </div>

            {/* ── CONTENT BODY ───────────────────────────────────── */}
            <motion.div
              className="px-5 sm:px-7 pb-6 pt-5 flex flex-col gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {/* Description */}
              <motion.p
                variants={itemVariants}
                className="text-white/55 text-sm sm:text-[15px] leading-relaxed"
              >
                {project.longDescription}
              </motion.p>

              {/* ── HIGHLIGHTS STRIP ─────────────────────────────── */}
              <motion.div variants={itemVariants} className="grid grid-cols-4 gap-2">
                {project.highlights.map((h, i) => (
                  <div
                    key={i}
                    className="relative flex flex-col items-center justify-center gap-1 py-4 rounded-2xl overflow-hidden border border-white/[0.07]"
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                  >
                    {/* Glow blob behind icon */}
                    <div
                      className="absolute top-1 left-1/2 -translate-x-1/2 w-12 h-6 rounded-full blur-xl opacity-40"
                      style={{ background: h.color }}
                    />
                    <div style={{ color: h.color }} className="relative z-10">
                      {h.icon}
                    </div>
                    <p className="text-white font-black text-base sm:text-lg relative z-10 leading-none">{h.value}</p>
                    <p className="text-white/35 text-[10px] uppercase tracking-widest font-medium relative z-10">{h.label}</p>
                  </div>
                ))}
              </motion.div>

              {/* ── TECH STACK ───────────────────────────────────── */}
              <motion.div variants={itemVariants}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 rounded-md bg-violet-500/20 border border-violet-400/25 flex items-center justify-center">
                    <Layers className="w-3 h-3 text-violet-400" />
                  </div>
                  <h3 className="text-white font-bold text-sm uppercase tracking-[0.15em]">Tech Stack</h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent ml-2" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.techStack.map((group) => (
                    <div
                      key={group.category}
                      className="rounded-2xl border border-white/[0.07] p-4"
                      style={{ background: 'rgba(255,255,255,0.025)' }}
                    >
                      <p
                        className="text-[10px] uppercase tracking-[0.18em] font-bold mb-3"
                        style={{ color: group.color + 'bb' }}
                      >
                        {group.category}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {group.items.map((item) => (
                          <span
                            key={item}
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border"
                            style={{
                              background: group.color + '12',
                              borderColor: group.color + '30',
                              color: group.color + 'dd',
                            }}
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* ── WHAT'S INCLUDED ──────────────────────────────── */}
              <motion.div variants={itemVariants}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 rounded-md bg-emerald-500/20 border border-emerald-400/25 flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  </div>
                  <h3 className="text-white font-bold text-sm uppercase tracking-[0.15em]">What's Included</h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent ml-2" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {project.features.map((f, i) => (
                    <motion.div
                      key={f}
                      className="flex items-start gap-3 rounded-xl px-4 py-3 border border-white/[0.05] group hover:border-emerald-500/20 hover:bg-emerald-500/[0.04] transition-all duration-200"
                      style={{ background: 'rgba(255,255,255,0.02)' }}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + i * 0.04 }}
                    >
                      <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-500/30 transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      </div>
                      <span className="text-white/65 text-xs sm:text-sm leading-relaxed group-hover:text-white/80 transition-colors">
                        {f}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* ── TAGS ─────────────────────────────────────────── */}
              <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-semibold px-3 py-1.5 rounded-full border border-white/[0.08] text-white/40"
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                  >
                    {tag}
                  </span>
                ))}
              </motion.div>
            </motion.div>
          </div>

          {/* ── STICKY CTA FOOTER ──────────────────────────────────── */}
          <div
            className="relative flex-shrink-0 px-5 sm:px-7 py-4 border-t border-white/[0.07]"
            style={{ background: 'linear-gradient(to top, #0e0c1a, #0f0f1e)' }}
          >
            {/* Glow line above */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

            <div className="flex items-center gap-3">
              {isPurchased ? (
                <motion.button
                  onClick={onDownload}
                  className="flex-1 relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm shadow-[0_0_30px_rgba(16,185,129,0.25)] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] transition-all duration-300"
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                >
                  <span className="text-lg">⬇</span>
                  Download Source Code
                </motion.button>
              ) : (
                <motion.button
                  onClick={onPurchase}
                  disabled={isLoading}
                  className="flex-1 relative overflow-hidden text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)',
                    boxShadow: '0 0 30px rgba(124,58,237,0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
                  }}
                  whileHover={{ scale: 1.015, boxShadow: '0 0 45px rgba(124,58,237,0.55), inset 0 1px 0 rgba(255,255,255,0.1)' }}
                  whileTap={{ scale: 0.985 }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
                  {isLoading ? (
                    <span className="flex items-center gap-2 relative z-10">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Processing payment...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 relative z-10">
                      <Zap className="w-4 h-4 text-yellow-300" />
                      Buy Now — {project.price}
                    </span>
                  )}
                </motion.button>
              )}

              <button
                onClick={onClose}
                className="w-12 h-12 rounded-2xl border border-white/10 hover:border-white/20 text-white/40 hover:text-white/70 flex items-center justify-center transition-all shrink-0"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Trust note */}
            {!isPurchased && (
              <p className="text-center text-white/25 text-[11px] mt-2.5 flex items-center justify-center gap-1.5">
                <span>🔒</span> Secured by Razorpay · Instant ZIP download after payment
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export type { ProjectDetail };
