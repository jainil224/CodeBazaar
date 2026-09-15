import { Code2, Download, Heart, ShoppingBag, Search, ArrowRight, Maximize2, Star, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { loadRazorpay } from '../utils/razorpayLoader';
import { downloadProjectZip } from '../utils/downloadHelper';
import ProjectPreviewModal, { type ProjectDetail } from './ProjectPreviewModal';
import { getDoc, doc } from 'firebase/firestore';
import { db, storage } from '@/firebase';
import type { DigitalProduct } from '../features/digitalProducts/types/digitalProduct';
import { ref, getBlob } from 'firebase/storage';
import { trackEvent } from '@/lib/analytics';
import { isTestUser, generateTestPaymentId } from '../utils/testConfig';

interface FeaturedProjectsProps {
  currentUser: { email: string; name: string; role: 'admin' | 'user' } | null;
  purchasedIds: string[];
  onTriggerAuth: () => void;
  onPurchaseSuccess: (projectId: string, projectTitle: string, paymentId?: string, amount?: number) => void;
  products: DigitalProduct[];
  isFullCatalogView?: boolean;
  onBackClick?: () => void;
  onViewAllClick?: () => void;
}

/* ── Category accent colours ───────────────────────────── */
const CATEGORY_COLORS: Record<string, { from: string; to: string; text: string; border: string; bg: string }> = {
  'Landing Page':  { from: '#3b82f6', to: '#6366f1', text: '#93c5fd', border: 'rgba(59,130,246,0.35)', bg: 'rgba(59,130,246,0.12)' },
  'SaaS setup':   { from: '#8b5cf6', to: '#d946ef', text: '#c4b5fd', border: 'rgba(139,92,246,0.35)', bg: 'rgba(139,92,246,0.12)' },
  'AI Interface': { from: '#06b6d4', to: '#3b82f6', text: '#67e8f9', border: 'rgba(6,182,212,0.35)',  bg: 'rgba(6,182,212,0.12)'  },
  'E-Commerce':   { from: '#f59e0b', to: '#ef4444', text: '#fbbf24', border: 'rgba(245,158,11,0.35)', bg: 'rgba(245,158,11,0.12)' },
  'Portfolio':    { from: '#10b981', to: '#06b6d4', text: '#6ee7b7', border: 'rgba(16,185,129,0.35)', bg: 'rgba(16,185,129,0.12)' },
  'All':          { from: '#8b5cf6', to: '#6366f1', text: '#c4b5fd', border: 'rgba(139,92,246,0.35)', bg: 'rgba(139,92,246,0.12)' },
};
const DEFAULT_CAT = CATEGORY_COLORS['All'];

export default function FeaturedProjects({
  currentUser,
  purchasedIds,
  onTriggerAuth,
  onPurchaseSuccess,
  products,
  isFullCatalogView = false,
  onViewAllClick,
}: FeaturedProjectsProps) {
  const [loadingId, setLoadingId]     = useState<string | null>(null);
  const [previewProject, setPreviewProject] = useState<ProjectDetail | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [favorites, setFavorites]     = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('codebazaar_favorites') || '[]'); }
    catch { return []; }
  });

  /* ── Debounced search analytics ─────────────────────── */
  useEffect(() => {
    if (!searchQuery.trim()) return;
    const t = setTimeout(() => {
      const count = products.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      ).length;
      trackEvent('search_submitted', { searchTerm: searchQuery.trim(), resultsCount: count });
    }, 1500);
    return () => clearTimeout(t);
  }, [searchQuery, products]);

  /* ── Filtered products ──────────────────────────────── */
  const filteredProducts = products.filter(p => {
    const matchesCat    = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  /* ── Handlers ───────────────────────────────────────── */
  const handleOpenPreview = (project: DigitalProduct) => {
    setPreviewProject(project.detail);
    trackEvent('product_clicked',  { productId: project.id, productTitle: project.title });
    trackEvent('product_viewed',   { productId: project.id, productTitle: project.title });
    trackEvent('page_view', { pagePath: `/details/${project.id}`, pageTitle: `Product - ${project.title}` });
  };

  const handleOpenPreviewInNewTab = (project: DigitalProduct, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    trackEvent('preview_opened_new_tab', { productId: project.id, productTitle: project.title });
    window.open(`?preview=${project.id}`, '_blank');
  };

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    trackEvent('category_clicked', { category: cat });
    trackEvent('filter_used', { filterType: 'category', filterValue: cat });
  };

  const toggleFavorite = (projectId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites(prev => {
      const updated = prev.includes(projectId) ? prev.filter(id => id !== projectId) : [...prev, projectId];
      localStorage.setItem('codebazaar_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  const handlePurchase = async (project: DigitalProduct) => {
    if (!currentUser) { onTriggerAuth(); return; }
    setLoadingId(project.id);
    trackEvent('buy_now_clicked', { productId: project.id, productTitle: project.title });

    if (isTestUser(currentUser.email)) {
      const numericPrice  = parseFloat(project.price.replace(/[^0-9.]/g, '')) || 0;
      const testPaymentId = generateTestPaymentId();
      setTimeout(() => { setLoadingId(null); setPreviewProject(null); onPurchaseSuccess(project.id, project.title, testPaymentId, numericPrice); }, 350);
      return;
    }

    const isLoaded = await loadRazorpay();
    if (!isLoaded) { setLoadingId(null); alert('Unable to connect to Razorpay. Please check your internet connection.'); return; }

    const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!RAZORPAY_KEY) { setLoadingId(null); alert('Razorpay key is not configured.'); return; }

    const numericPrice   = parseFloat(project.price.replace(/[^0-9.]/g, '')) || 0;
    const razorpayAmount = Math.round(numericPrice * 100);
    const options = {
      key: RAZORPAY_KEY, amount: razorpayAmount, currency: 'INR',
      name: 'CodeBazaar', description: `Purchase: ${project.title}`,
      handler: function (response: { razorpay_payment_id: string }) {
        setLoadingId(null); setPreviewProject(null);
        onPurchaseSuccess(project.id, project.title, response.razorpay_payment_id, numericPrice);
      },
      prefill: { name: currentUser.name, email: currentUser.email },
      notes: { project_id: project.id, project_title: project.title },
      theme: { color: '#6938FF' },
      modal: { ondismiss: () => setLoadingId(null) },
    };
    trackEvent('checkout_started', { productId: project.id, productTitle: project.title });
    const rzp = new (window as any).Razorpay(options);
    rzp.on('payment.failed', (r: { error: { description: string } }) => {
      setLoadingId(null);
      alert(`Payment failed: ${r.error.description}. Please try again.`);
    });
    rzp.open();
  };

  const downloadProductSecurely = async (project: DigitalProduct) => {
    setLoadingId(project.id);
    trackEvent('download_clicked', { productId: project.id, productTitle: project.title });
    try {
      const productSnap = await getDoc(doc(db, 'products', project.id));
      if (!productSnap.exists()) throw new Error('Product not found.');
      const productData  = productSnap.data();
      const downloadFile = productData.downloadFile;
      if (!downloadFile?.storagePath) { downloadProjectZip(project.title); return; }
      const fileRef = ref(storage, downloadFile.storagePath);
      const blob    = await getBlob(fileRef);
      const url     = window.URL.createObjectURL(blob);
      const a       = document.createElement('a');
      a.href = url;
      a.download = downloadFile.fileName || `${project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.zip`;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      let msg = 'Download failed. Please try again.';
      if (error.code === 'storage/unauthorized') msg = 'You do not have permission to download this file.';
      alert(msg);
    } finally { setLoadingId(null); }
  };

  const handleDownload = (project: DigitalProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) { onTriggerAuth(); return; }
    downloadProductSecurely(project);
  };

  const CATEGORIES = ['All', 'Landing Page', 'SaaS setup', 'AI Interface', 'E-Commerce', 'Portfolio'];

  return (
    <>
      <section
        id="projects"
        className={`${isFullCatalogView ? 'pt-6 sm:pt-10 pb-20' : 'py-24'} relative z-10 w-full overflow-hidden bg-transparent`}
      >
        <div className="relative z-10 max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">

          {/* ── Section Header ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`text-center ${isFullCatalogView ? 'mb-8 sm:mb-10' : 'mb-16'}`}
          >
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/25">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_rgba(168,85,247,0.8)]" />
              <span className="text-[11px] sm:text-xs font-bold tracking-[0.13em] uppercase text-purple-300">
                {isFullCatalogView ? 'Complete Catalog' : 'Bazaar Showroom'}
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mt-2" style={{ lineHeight: 1.1 }}>
              {isFullCatalogView ? 'All Project Templates' : 'Featured Project'}{' '}
              <span className="italic font-serif text-purple-300">
                {isFullCatalogView ? '' : 'Templates'}
              </span>
            </h2>

            <p className="text-white/55 max-w-[600px] mx-auto mt-4 text-sm sm:text-base leading-relaxed">
              {isFullCatalogView
                ? `Browse all ${products.length} production-ready digital products and templates. Instant code download for flat ₹50.`
                : 'Get production-ready, beautifully designed project bases for just ₹50. Instant source code download.'}
            </p>
          </motion.div>

          {/* ── Search & Filter Bar ────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
            className={`flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 ${isFullCatalogView ? 'mb-6 sm:mb-8' : 'mb-10 sm:mb-12'}`}
          >
            {/* Category pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0 flex-nowrap">
              {CATEGORIES.map(cat => {
                const isActive = activeCategory === cat;
                const cc = CATEGORY_COLORS[cat] || DEFAULT_CAT;
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    className="px-3.5 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all whitespace-nowrap shrink-0 border"
                    style={isActive
                      ? { background: cc.bg, borderColor: cc.border, color: cc.text, boxShadow: `0 4px 16px ${cc.from}25` }
                      : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }
                    }
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-[300px] lg:w-[340px] shrink-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35 pointer-events-none" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 focus:border-purple-500/50 focus:bg-white/[0.06] rounded-xl pl-11 pr-4 py-2.5 text-xs sm:text-sm outline-none transition-all text-white placeholder-white/30 font-sans"
              />
            </div>
          </motion.div>

          {/* ── Product Grid ───────────────────────────────── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeCategory}-${searchQuery}-${products.length}`}
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
              className={`grid gap-5 sm:gap-6 ${isFullCatalogView
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1 md:grid-cols-2'
              }`}
            >
              {(isFullCatalogView ? filteredProducts : filteredProducts.slice(0, 4)).map(project => {
                const isPurchased = purchasedIds.includes(project.id);
                const isFavorited = favorites.includes(project.id);
                const isLoading   = loadingId === project.id;
                const cc = CATEGORY_COLORS[project.category] || DEFAULT_CAT;

                return (
                  <motion.div
                    key={project.id}
                    variants={{
                      hidden:   { opacity: 0, y: 24 },
                      visible:  { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
                    }}
                    className="group relative flex flex-col overflow-hidden cursor-pointer"
                    style={{
                      borderRadius: 24,
                      background: 'rgba(255,255,255,0.035)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255,255,255,0.09)',
                      boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.06) inset',
                    }}
                    onClick={() => handleOpenPreview(project)}
                  >
                    {/* Hover accent glow */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[24px]"
                      style={{ background: `radial-gradient(ellipse at 50% 0%, ${cc.from}18 0%, transparent 65%)` }}
                    />
                    {/* Top accent stripe */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[1.5px] rounded-t-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: `linear-gradient(to right, transparent, ${cc.from}, ${cc.to}, transparent)` }}
                    />

                    {/* ── Image area ───────────────────────── */}
                    <div className="relative w-full overflow-hidden" style={{ height: isFullCatalogView ? 200 : 240 }}>
                      {project.imageUrl ? (
                        <img
                          src={project.imageUrl}
                          alt={project.title}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center"
                          style={{ background: `linear-gradient(145deg, ${cc.from}20, ${cc.to}20)` }}
                        >
                          <Code2 className="w-10 h-10 opacity-40" style={{ color: cc.text }} />
                          <span className="text-xs font-semibold mt-2 font-mono uppercase tracking-wider opacity-40" style={{ color: cc.text }}>Preview Pending</span>
                        </div>
                      )}

                      {/* Dark image overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Badges — top-left */}
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span
                          className="text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-full"
                          style={{ background: cc.bg, border: `1px solid ${cc.border}`, color: cc.text, backdropFilter: 'blur(8px)' }}
                        >
                          {project.category}
                        </span>
                        {isPurchased && (
                          <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300" style={{ backdropFilter: 'blur(8px)' }}>
                            Purchased
                          </span>
                        )}
                      </div>

                      {/* Favorite — top-right */}
                      <button
                        onClick={e => toggleFavorite(project.id, e)}
                        className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 z-10"
                        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}
                      >
                        <Heart className={`w-4 h-4 transition-colors ${isFavorited ? 'fill-red-500 text-red-500' : 'text-white/60 hover:text-red-400'}`} />
                      </button>

                      {/* Version — bottom-left */}
                      <div className="absolute bottom-3 left-3">
                        <span className="text-[10px] font-mono font-semibold text-white/50 bg-black/40 px-2 py-0.5 rounded-md" style={{ backdropFilter: 'blur(8px)' }}>
                          {project.version}
                        </span>
                      </div>

                      {/* Open in new tab — bottom-right */}
                      <button
                        onClick={e => handleOpenPreviewInNewTab(project, e)}
                        className="absolute bottom-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 z-10"
                        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}
                        title="Open in new tab"
                      >
                        <Maximize2 className="w-3.5 h-3.5 text-white/70" />
                      </button>
                    </div>

                    {/* ── Card body ────────────────────────── */}
                    <div className="flex flex-col gap-3 p-4 sm:p-5 flex-1">
                      {/* Title */}
                      <h4 className="text-base sm:text-lg font-bold text-white leading-snug group-hover:text-purple-200 transition-colors">
                        {project.title}
                      </h4>

                      {/* Description */}
                      <p className="text-white/50 text-xs sm:text-[13px] leading-relaxed line-clamp-2">
                        {project.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-auto">
                        {project.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="text-[10px] sm:text-[11px] font-medium px-2.5 py-1 rounded-lg"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
                          >
                            {tag}
                          </span>
                        ))}
                        {project.tags.length > 3 && (
                          <span className="text-[10px] font-medium px-2.5 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.3)' }}>
                            +{project.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ── Card Footer ──────────────────────── */}
                    <div
                      className="px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3"
                      style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
                    >
                      {/* Price */}
                      <div>
                        <div className="text-xl sm:text-2xl font-black text-white tracking-tight">{project.price}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Zap className="w-3 h-3 text-emerald-400" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Instant Download</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {isPurchased ? (
                          <button
                            onClick={e => handleDownload(project, e)}
                            disabled={isLoading}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white transition-all active:scale-95 disabled:opacity-60"
                            style={{ background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 4px 16px rgba(16,185,129,0.35)' }}
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>{isLoading ? 'Loading…' : 'Download'}</span>
                          </button>
                        ) : (
                          <button
                            onClick={e => { e.stopPropagation(); handleOpenPreview(project); }}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white transition-all hover:brightness-110 active:scale-95"
                            style={{ background: `linear-gradient(135deg, ${cc.from}, ${cc.to})`, boxShadow: `0 4px 16px ${cc.from}40` }}
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Explore</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {/* ── Empty state ────────────────────────────────── */}
          {filteredProducts.length === 0 && (
            <div
              className="text-center py-14 px-4 mt-4 max-w-[520px] mx-auto rounded-3xl"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}
              >
                <Search className="w-6 h-6 text-purple-400" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">No templates found</h4>
              <p className="text-xs text-white/40 mb-6 leading-relaxed">
                No templates matched "<span className="text-white/60">{searchQuery}</span>" in category "<span className="text-white/60">{activeCategory}</span>".
              </p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer"
                style={{ background: 'rgba(139,92,246,0.25)', border: '1px solid rgba(139,92,246,0.4)' }}
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* ── View All CTA ───────────────────────────────── */}
          {!isFullCatalogView && filteredProducts.length > 4 && (
            <div className="flex justify-center mt-10 sm:mt-14 px-4">
              <a
                href="?view=templates"
                onClick={e => { if (!e.ctrlKey && !e.metaKey && e.button === 0) { e.preventDefault(); onViewAllClick?.(); } }}
                className="group w-full sm:w-auto max-w-sm justify-center flex items-center gap-2.5 px-7 py-4 rounded-2xl font-bold text-sm text-white transition-all hover:scale-[1.02] active:scale-95 no-underline select-none"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                }}
              >
                <Star className="w-4 h-4 text-purple-400 group-hover:text-yellow-400 transition-colors" />
                <span>View All {products.length} Templates</span>
                <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform shrink-0" />
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ── Project Preview Modal ───────────────────────────── */}
      {previewProject && (
        <ProjectPreviewModal
          project={previewProject}
          isPurchased={purchasedIds.includes(previewProject.id)}
          isLoading={loadingId === previewProject.id}
          isFavorited={favorites.includes(previewProject.id)}
          onToggleFavorite={() => toggleFavorite(previewProject.id)}
          onClose={() => setPreviewProject(null)}
          onPurchase={() => {
            const proj = products.find(p => p.id === previewProject.id);
            if (proj) handlePurchase(proj);
          }}
          onDownload={() => {
            const proj = products.find(p => p.id === previewProject.id);
            if (proj) downloadProductSecurely(proj);
            setPreviewProject(null);
          }}
        />
      )}
    </>
  );
}
