import { Code2, Download, Heart, ShoppingBag, Search, ArrowLeft, ArrowRight, Maximize2 } from 'lucide-react';
import { motion } from 'framer-motion';
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

export default function FeaturedProjects({
  currentUser,
  purchasedIds,
  onTriggerAuth,
  onPurchaseSuccess,
  products,
  isFullCatalogView = false,
  onBackClick,
  onViewAllClick,
}: FeaturedProjectsProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [previewProject, setPreviewProject] = useState<ProjectDetail | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Debounced search analytics tracking
  useEffect(() => {
    if (!searchQuery.trim()) return;
    const delayDebounceFn = setTimeout(() => {
      const matchingCount = products.filter(project => {
        const titleMatch = project.title.toLowerCase().includes(searchQuery.toLowerCase());
        const descMatch = project.description.toLowerCase().includes(searchQuery.toLowerCase());
        const tagMatch = project.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
        return titleMatch || descMatch || tagMatch;
      }).length;

      trackEvent('search_submitted', { 
        searchTerm: searchQuery.trim(),
        resultsCount: matchingCount
      });
    }, 1500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, products]);

  const handleOpenPreview = (project: DigitalProduct) => {
    setPreviewProject(project.detail);
    trackEvent('product_clicked', { productId: project.id, productTitle: project.title });
    trackEvent('product_viewed', { productId: project.id, productTitle: project.title });
    trackEvent('page_view', { pagePath: `/details/${project.id}`, pageTitle: `Product - ${project.title}` });
  };

  const handleOpenPreviewInNewTab = (project: DigitalProduct, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    trackEvent('preview_opened_new_tab', { productId: project.id, productTitle: project.title });
    window.open(`?preview=${project.id}`, '_blank');
  };


  const [activeCategory, setActiveCategory] = useState('All');

  // Filter products by search and category
  const filteredProducts = products.filter(project => {
    const matchesCategory = activeCategory === 'All' || project.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    trackEvent('category_clicked', { category });
    trackEvent('filter_used', { filterType: 'category', filterValue: category });
  };

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('codebazaar_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (projectId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites(prev => {
      const updated = prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId];
      localStorage.setItem('codebazaar_favorites', JSON.stringify(updated));
      return updated;
    });
  };


  const handlePurchase = async (project: DigitalProduct) => {
    if (!currentUser) {
      onTriggerAuth();
      return;
    }

    setLoadingId(project.id);
    trackEvent('buy_now_clicked', { productId: project.id, productTitle: project.title });

    // ── TEST USER BYPASS (Zero-Payment Testing Mode) ───────────────────
    if (isTestUser(currentUser.email)) {
      const numericPrice = parseFloat(project.price.replace(/[^0-9.]/g, '')) || 0;
      const testPaymentId = generateTestPaymentId();
      setTimeout(() => {
        setLoadingId(null);
        setPreviewProject(null);
        onPurchaseSuccess(project.id, project.title, testPaymentId, numericPrice);
      }, 350);
      return;
    }

    const isLoaded = await loadRazorpay();
    if (!isLoaded) {
      setLoadingId(null);
      alert('Unable to connect to Razorpay. Please check your internet connection and try again.');
      return;
    }

    const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!RAZORPAY_KEY) {
      setLoadingId(null);
      alert('Razorpay key is not configured. Please contact support.');
      return;
    }

    // Parse numeric price from price string e.g. "₹999" → 999
    const numericPrice = parseFloat(project.price.replace(/[^0-9.]/g, '')) || 0;
    const razorpayAmount = Math.round(numericPrice * 100); // Razorpay uses paise

    const options = {
      key: RAZORPAY_KEY,
      amount: razorpayAmount,
      currency: 'INR',
      name: 'CodeBazaar',
      description: `Purchase: ${project.title}`,
      handler: function (response: { razorpay_payment_id: string }) {
        setLoadingId(null);
        setPreviewProject(null);
        onPurchaseSuccess(project.id, project.title, response.razorpay_payment_id, numericPrice);
      },
      prefill: { name: currentUser.name, email: currentUser.email },
      notes: { project_id: project.id, project_title: project.title },
      theme: { color: '#6938FF' },
      modal: {
        ondismiss: function () {
          setLoadingId(null);
        },
      },
    };

    trackEvent('checkout_started', { productId: project.id, productTitle: project.title });
    const rzp = new (window as any).Razorpay(options);
    rzp.on('payment.failed', function (response: { error: { description: string } }) {
      setLoadingId(null);
      alert(`Payment failed: ${response.error.description}. Please try again.`);
    });
    rzp.open();
  };

  const downloadProductSecurely = async (project: DigitalProduct) => {
    setLoadingId(project.id);
    trackEvent('download_clicked', { productId: project.id, productTitle: project.title });
    try {
      // 1. Fetch product file details from Firestore
      const productSnap = await getDoc(doc(db, 'products', project.id));
      if (!productSnap.exists()) {
        throw new Error("Product not found.");
      }

      const productData = productSnap.data();
      const downloadFile = productData.downloadFile;
      if (!downloadFile || !downloadFile.storagePath) {
        // Fallback to mock ZIP if no real ZIP is uploaded yet, to allow easy testing of default templates!
        console.warn("No secure ZIP found for product. Falling back to mock ZIP.");
        downloadProjectZip(project.title);
        return;
      }

      // 2. Direct Blob download from Firebase Storage
      const fileRef = ref(storage, downloadFile.storagePath);
      const blob = await getBlob(fileRef);

      // 3. Trigger Browser Download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadFile.fileName || `${project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Secure download error:", error);
      let friendlyError = "Download failed. Please try again.";
      if (error.code === 'storage/unauthorized') {
        friendlyError = "You do not have permission to download this file.";
      }
      alert(friendlyError);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDownload = (project: DigitalProduct, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!currentUser) {
      onTriggerAuth();
      return;
    }

    downloadProductSecurely(project);
  };

  return (
    <>
      <section id="projects" className="py-24 relative z-10 w-full overflow-hidden bg-transparent">
        <div className="relative z-10 max-w-[1200px] mx-auto px-6">
          {/* Back button (Only if full catalog view) */}
          {isFullCatalogView && onBackClick && (
            <div className="mb-8 flex justify-start">
              <button 
                type="button"
                onClick={onBackClick}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white transition-colors cursor-pointer bg-white/5 border border-white/10 px-4.5 py-2.5 rounded-xl hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </button>
            </div>
          )}

          {/* Title */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <h2 className="text-xs uppercase tracking-widest font-bold text-primary-indigo font-mono">
              {isFullCatalogView ? "Complete Catalog" : "Bazaar Showroom"}
            </h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-white mt-2">
              {isFullCatalogView ? "All Project Templates" : "Featured Project Templates"}
            </h3>
            <p className="text-white/60 max-w-[600px] mx-auto mt-4 text-base">
              {isFullCatalogView 
                ? `Browse all ${products.length} production-ready digital products and templates.`
                : "Get production-ready, beautifully designed project bases for just ₹50. Instant source code download."
              }
            </p>
          </motion.div>

          {/* Search & Filter Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            className="flex flex-col md:flex-row items-center justify-between gap-5 mb-12 p-3 bg-white/[0.03] border border-white/10 rounded-[28px] backdrop-blur-md"
          >
            {/* Categories */}
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              {['All', 'Landing Page', 'SaaS setup', 'AI Interface', 'E-Commerce', 'Portfolio'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all ${
                    activeCategory === cat 
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30 border border-purple-500' 
                      : 'text-white/60 hover:text-white bg-white/5 border border-white/5 hover:border-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-[300px] shrink-0">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-purple-400 rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none transition-colors text-white placeholder-white/40 font-sans"
              />
            </div>
          </motion.div>

          {/* Grid */}
          <motion.div 
            key={`${activeCategory}-${products.length}`}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.1,
                }
              }
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {(isFullCatalogView ? filteredProducts : filteredProducts.slice(0, 4)).map((project) => {
              const isPurchased = purchasedIds.includes(project.id);
              const isFavorited = favorites.includes(project.id);

              return (
                <motion.div
                  key={project.id}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
                  }}
                  className="bg-white text-zinc-900 rounded-[32px] overflow-hidden flex flex-col justify-between border border-zinc-200/80 shadow-[0_4px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_45px_rgba(105,56,255,0.15)] hover:border-violet-300 transition-all duration-300 group"
                >
                  {/* Media Box */}
                  <div
                    className="relative w-full h-[240px] sm:h-[265px] overflow-hidden cursor-pointer bg-zinc-50 border-b border-zinc-100 flex items-center justify-center"
                    onClick={() => handleOpenPreview(project)}
                  >
                    {project.imageUrl ? (
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover object-top group-hover:scale-103 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-violet-50 to-purple-50 flex flex-col items-center justify-center p-4">
                        <Code2 className="w-12 h-12 text-violet-400" />
                        <span className="text-xs font-semibold text-violet-400 mt-2 font-mono uppercase tracking-wider">Preview Pending</span>
                      </div>
                    )}

                    {/* Floating Heart / Like Button */}
                    <button
                      onClick={(e) => toggleFavorite(project.id, e)}
                      className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.15)] border border-zinc-100 flex items-center justify-center transition-all duration-200 z-10 hover:scale-105 active:scale-95"
                    >
                      <Heart
                        className={`w-5 h-5 transition-colors ${
                          isFavorited ? 'fill-red-500 text-red-500' : 'text-zinc-400 hover:text-red-500'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex flex-col gap-4 flex-1">
                    {/* Category & Version Pill Line */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="bg-violet-50 text-violet-600 border border-violet-100 text-[10px] font-extrabold tracking-wider uppercase px-3 py-1 rounded-full">
                        {project.category}
                      </span>
                      <span className="text-zinc-400 font-mono font-medium">
                        {project.version}
                      </span>
                    </div>

                    {/* Title */}
                    <h4
                      className="text-xl font-bold text-zinc-950 hover:text-violet-600 transition-colors leading-tight cursor-pointer"
                      onClick={() => handleOpenPreview(project)}
                    >
                      {project.title}
                    </h4>

                    {/* Description */}
                    <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2">
                      {project.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {project.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="bg-zinc-50 border border-zinc-100/80 text-zinc-600 text-[11px] font-medium py-1 px-3 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 3 && (
                        <span className="bg-zinc-50 border border-zinc-100/80 text-zinc-400 text-[11px] font-medium py-1 px-3 rounded-full">
                          +{project.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 py-5 border-t border-zinc-100 flex items-center justify-between gap-4 bg-zinc-50/50">
                    {/* Left: Price & Download label */}
                    <div className="text-left">
                      <div className="text-2xl font-black text-zinc-950 tracking-tight">{project.price}</div>
                      <span className="text-emerald-600 text-[10px] font-bold uppercase tracking-wider block mt-0.5">
                        Instant Download
                      </span>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2">

                      {/* Open Preview in New Page button */}
                      <button
                        onClick={(e) => handleOpenPreviewInNewTab(project, e)}
                        className="w-12 h-12 rounded-2xl border border-zinc-200 bg-white hover:bg-violet-50 text-zinc-600 hover:text-violet-600 flex items-center justify-center transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)] relative group/btn cursor-pointer"
                        title="Open Product Preview in New Page"
                      >
                        <Maximize2 className="w-5 h-5 transition-transform group-hover/btn:scale-110" />
                      </button>

                      {/* Main Button (Explore / Download) */}
                      {isPurchased ? (
                        <button
                          onClick={(e) => handleDownload(project, e)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-2xl flex items-center gap-2 shadow-[0_4px_15px_rgba(16,185,129,0.2)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.3)] transition-all text-sm group"
                        >
                          <Download className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition-transform" />
                          Download
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenPreview(project)}
                          className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-5 py-3 rounded-2xl flex items-center gap-2 shadow-[0_4px_15px_rgba(109,40,217,0.2)] hover:shadow-[0_6px_20px_rgba(109,40,217,0.3)] transition-all text-sm group"
                        >
                          <ShoppingBag className="w-4 h-4 text-violet-200 group-hover:scale-110 transition-transform" />
                          Explore
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {!isFullCatalogView && filteredProducts.length > 4 && (
            <div className="flex justify-center mt-12">
              <button 
                type="button"
                onClick={onViewAllClick}
                className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-sans text-xs font-bold uppercase tracking-wider px-8 py-4.5 rounded-2xl flex items-center gap-2 transition-all hover:scale-103 active:scale-95 cursor-pointer shadow-lg shadow-black/30"
              >
                <span>View All {filteredProducts.length} Templates</span>
                <ArrowRight className="w-4 h-4 text-purple-400" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Project Preview Modal */}
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
