import { Code2, Download, Heart, ShoppingBag, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { loadRazorpay } from '../utils/razorpayLoader';
import { downloadProjectZip } from '../utils/downloadHelper';
import PaymentSuccessModal from './PaymentSuccessModal';
import ProjectPreviewModal, { type ProjectDetail } from './ProjectPreviewModal';
import type { DigitalProduct } from '@/features/digitalProducts/types/digitalProduct';
import { db, storage } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ref, getBlob } from 'firebase/storage';

interface FeaturedProjectsProps {
  currentUser: { email: string; name: string; role: 'admin' | 'user' } | null;
  purchasedIds: string[];
  onTriggerAuth: () => void;
  onPurchaseSuccess: (projectId: string, projectTitle: string, paymentId?: string) => void;
  products: DigitalProduct[];
}

export default function FeaturedProjects({
  currentUser,
  purchasedIds,
  onTriggerAuth,
  onPurchaseSuccess,
  products,
}: FeaturedProjectsProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [previewProject, setPreviewProject] = useState<ProjectDetail | null>(null);
  const [successModal, setSuccessModal] = useState<{
    open: boolean;
    projectId: string;
    projectTitle: string;
    paymentId: string;
    amount: number;
  } | null>(null);

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

  const handleOpenPlayground = (project: DigitalProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`?project=${project.id}`, '_blank');
  };

  const handlePurchase = async (project: DigitalProduct) => {
    if (!currentUser) {
      onTriggerAuth();
      return;
    }

    setLoadingId(project.id);

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

    const options = {
      key: RAZORPAY_KEY,
      amount: 5000,
      currency: 'INR',
      name: 'CodeBazaar',
      description: `Purchase: ${project.title}`,
      handler: function (response: { razorpay_payment_id: string }) {
        setLoadingId(null);
        onPurchaseSuccess(project.id, project.title, response.razorpay_payment_id);
        setPreviewProject(null);
        setSuccessModal({
          open: true,
          projectId: project.id,
          projectTitle: project.title,
          paymentId: response.razorpay_payment_id,
          amount: 50,
        });
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

    const rzp = new (window as any).Razorpay(options);
    rzp.on('payment.failed', function (response: { error: { description: string } }) {
      setLoadingId(null);
      alert(`Payment failed: ${response.error.description}. Please try again.`);
    });
    rzp.open();
  };

  const downloadProductSecurely = async (project: DigitalProduct) => {
    setLoadingId(project.id);
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
          {/* Title */}
          <div className="text-center mb-16">
            <h2 className="text-xs uppercase tracking-widest font-bold text-primary-indigo font-mono">Bazaar Showroom</h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-white mt-2">Featured Project Templates</h3>
            <p className="text-white/60 max-w-[600px] mx-auto mt-4 text-base">
              Get production-ready, beautifully designed project bases for just ₹50. Instant source code download.
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {products.map((project) => {
              const isPurchased = purchasedIds.includes(project.id);
              const isFavorited = favorites.includes(project.id);

              return (
                <div
                  key={project.id}
                  className="bg-white text-zinc-900 rounded-[32px] overflow-hidden flex flex-col justify-between border border-zinc-200/80 shadow-[0_4px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_45px_rgba(105,56,255,0.15)] hover:border-violet-300 transition-all duration-300 group"
                >
                  {/* Media Box */}
                  <div
                    className="relative w-full h-[240px] sm:h-[265px] overflow-hidden cursor-pointer bg-zinc-50 border-b border-zinc-100 flex items-center justify-center"
                    onClick={() => setPreviewProject(project.detail)}
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
                      onClick={() => setPreviewProject(project.detail)}
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
                      {/* Live Preview / Share Square Button */}
                      <button
                        onClick={(e) => handleOpenPlayground(project, e)}
                        className="w-12 h-12 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 hover:text-violet-600 flex items-center justify-center transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)] relative"
                        title="Open Demo Sandbox"
                      >
                        <ExternalLink className="w-5 h-5" />
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
                          onClick={() => setPreviewProject(project.detail)}
                          className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-5 py-3 rounded-2xl flex items-center gap-2 shadow-[0_4px_15px_rgba(109,40,217,0.2)] hover:shadow-[0_6px_20px_rgba(109,40,217,0.3)] transition-all text-sm group"
                        >
                          <ShoppingBag className="w-4 h-4 text-violet-200 group-hover:scale-110 transition-transform" />
                          Explore
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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

      {/* Payment Success Modal */}
      {successModal && (
        <PaymentSuccessModal
          isOpen={successModal.open}
          projectTitle={successModal.projectTitle}
          paymentId={successModal.paymentId}
          amount={successModal.amount}
          onClose={() => setSuccessModal(null)}
          onDownload={() => {
            const proj = products.find(p => p.id === successModal.projectId);
            if (proj) {
              downloadProductSecurely(proj);
            } else {
              downloadProjectZip(successModal.projectTitle);
            }
            setSuccessModal(null);
          }}
        />
      )}
    </>
  );
}
