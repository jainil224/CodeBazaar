import { useState, useEffect } from 'react';
import Hero from '@/components/Hero';
import FeaturedProjects from '@/components/FeaturedProjects';
import HowItWorks from '@/components/HowItWorks';
import WhatWeDeliver from '@/components/WhatWeDeliver';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
import AuroraAuth from '@/components/AuroraAuth';
import AdminDashboard from '@/components/AdminDashboard';
import AnimatedGradientBackground from '@/components/ui/animated-gradient-background';
import ProjectPlayground from '@/components/ProjectPlayground';
import ProjectPreviewModal from '@/components/ProjectPreviewModal';
import { ArrowLeft, User, Package, LogOut, ChevronDown } from 'lucide-react';
import siteLogo from '@/assets/logo.svg';
import { useAuth } from '@/context/AuthContext';
import { doc, collection, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/firebase';
import { loadRazorpay } from './utils/razorpayLoader';
import { DEFAULT_PRODUCTS } from '@/features/digitalProducts/data/defaultProducts';
import MyPurchasesModal from '@/features/digitalProducts/components/MyPurchasesModal';
import { createPurchaseRecord } from '@/features/digitalProducts/services/purchaseService';
import { downloadProductBlob } from '@/features/digitalProducts/services/productFileService';
import type { DigitalProduct } from '@/features/digitalProducts/types/digitalProduct';
import { trackEvent } from '@/lib/analytics';
import PurchaseReceiptModal, { type PurchaseReceiptData } from '@/components/PurchaseReceiptModal';
import { downloadProjectZip } from '@/utils/downloadHelper';
import { isTestUser, generateTestPaymentId } from '@/utils/testConfig';


interface Transaction {
  id: string;
  userEmail: string;
  userName: string;
  projectTitle: string;
  amount: number;
  status: 'paid';
  date: string;
}





export default function App() {
  const { userProfile, loading, logout } = useAuth();
  
  const currentUser = userProfile;
  const purchasedIds = userProfile?.purchasedIds || [];
  const authResolved = !loading;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<DigitalProduct[]>([]);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isMyPurchasesOpen, setIsMyPurchasesOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isAllTemplatesOpen, setIsAllTemplatesOpen] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    const path = window.location.pathname;
    return path === '/templates' || params.get('view') === 'templates' || params.get('view') === 'all-templates';
  });
  const [globalReceiptData, setGlobalReceiptData] = useState<PurchaseReceiptData | null>(null);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);
  const [currentPlaygroundId, setCurrentPlaygroundId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('project');
  });

  const [currentPreviewId, setCurrentPreviewId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('preview') || params.get('details');
  });

  // ── Products catalog listener ─────────────────────────────────────────
  useEffect(() => {
    const unsubscribeProducts = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        if (snapshot.empty) {
          DEFAULT_PRODUCTS.forEach((product) => {
            setDoc(doc(db, 'products', product.id), product);
          });
        } else {
          const loadedProducts = snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
          })) as DigitalProduct[];
          setProducts(loadedProducts);
        }
      },
      (err) => {
        console.warn('Products database listener error:', err.code);
      }
    );

    return () => unsubscribeProducts();
  }, []);

  // ── Transactions listener for admins ──────────────────────────────────
  useEffect(() => {
    if (userProfile?.role !== 'admin') {
      setTransactions([]);
      return;
    }

    const unsubscribeTxs = onSnapshot(
      collection(db, 'transactions'),
      (snapshot) => {
        const FAKE_SEED_IDS = ['pay_P1o98G7sL9kH', 'pay_J2m54K8aQ2wX', 'pay_N9p12V6cR7tM'];
        const txs = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() }) as Transaction)
          .filter(tx => !FAKE_SEED_IDS.includes(tx.id));
        txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTransactions(txs);
      },
      (err) => {
        console.warn('Transactions listener error:', err.code);
      }
    );

    return () => unsubscribeTxs();
  }, [userProfile?.role]);

  // ── Page View Tracking ────────────────────────────────────────────────
  // IMPORTANT: Only fires AFTER auth has fully resolved so we know the user's role.
  // If the user is an admin, skip tracking — admin visits are never counted.
  useEffect(() => {
    if (!authResolved) return; // Wait for auth to finish loading
    if (userProfile?.role === 'admin') return; // Never track admin visits
    trackEvent('page_view', { pagePath: '/', pageTitle: 'CodeBazaar Home' });
  }, [authResolved]); // Fires exactly once after auth resolves

  // Check URL route for /admin, /templates, /purchases, etc.
  useEffect(() => {
    const handleUrlRoute = () => {
      const path = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      
      const isAdminRoute = path === '/admin' || path === '/admin/dashboard' || params.get('view') === 'admin';
      const isPurchasesRoute = path === '/my-purchases' || path === '/purchases' || params.get('view') === 'purchases';
      const isTemplatesRoute = path === '/templates' || params.get('view') === 'templates' || params.get('view') === 'all-templates';
      const playgroundParam = params.get('project');
      const previewParam = params.get('preview') || params.get('details');

      setCurrentPlaygroundId(playgroundParam);
      setCurrentPreviewId(previewParam);

      if (isAdminRoute) {
        if (currentUser?.role === 'admin') {
          setIsAdminOpen(true);
          window.history.replaceState({}, '', '/');
        } else if (currentUser) {
          alert("Access Denied: Admin authorization required.");
          window.history.replaceState({}, '', '/');
        } else {
          setPendingRedirect('admin');
          setIsAuthOpen(true);
        }
      } else if (isPurchasesRoute) {
        if (currentUser) {
          setIsMyPurchasesOpen(true);
          window.history.replaceState({}, '', '/');
        } else {
          setPendingRedirect('purchases');
          setIsAuthOpen(true);
        }
      } else if (isTemplatesRoute) {
        setIsAllTemplatesOpen(true);
      } else {
        setIsAllTemplatesOpen(false);
      }
    };

    if (authResolved) {
      handleUrlRoute();
    }

    window.addEventListener('popstate', handleUrlRoute);
    return () => window.removeEventListener('popstate', handleUrlRoute);
  }, [currentUser, authResolved]);

  // Handle post-login redirection actions
  useEffect(() => {
    if (currentUser && pendingRedirect) {
      if (pendingRedirect === 'admin') {
        if (currentUser.role === 'admin') {
          setIsAdminOpen(true);
        } else {
          alert("Access Denied: Admin authorization required.");
        }
      } else if (pendingRedirect === 'purchases') {
        setIsMyPurchasesOpen(true);
      }
      setPendingRedirect(null);
      window.history.replaceState({}, '', '/');
    }
  }, [currentUser, pendingRedirect]);

  // Track dashboard, purchases, and templates page views
  useEffect(() => {
    if (isAdminOpen) {
      trackEvent('page_view', { pagePath: '/admin', pageTitle: 'Admin Dashboard' });
    }
  }, [isAdminOpen]);

  useEffect(() => {
    if (isMyPurchasesOpen) {
      trackEvent('page_view', { pagePath: '/my-purchases', pageTitle: 'My Purchases' });
    }
  }, [isMyPurchasesOpen]);

  useEffect(() => {
    if (isAllTemplatesOpen) {
      trackEvent('page_view', { pagePath: '/templates', pageTitle: 'All Templates - CodeBazaar' });
    }
  }, [isAllTemplatesOpen]);

  const handleOpenTemplatesPage = () => {
    window.history.pushState({}, '', '?view=templates');
    setIsAllTemplatesOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    window.history.pushState({}, '', window.location.pathname.includes('/templates') ? '/' : window.location.pathname);
    setIsAllTemplatesOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err: any) {
      alert("Logout failed: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0c14] flex flex-col items-center justify-center text-white select-none">
        <div className="relative flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-purple-500 border-white/5 rounded-full animate-spin"></div>
          <span className="mt-6 text-sm font-semibold tracking-wider uppercase text-white/60 animate-pulse">Checking your account...</span>
        </div>
      </div>
    );
  }

  const handlePurchaseSuccess = async (projectId: string, projectTitle: string, paymentId?: string, realAmount?: number) => {
    if (!currentUser || !auth.currentUser) return;

    // Resolve real amount: use the passed value, or look up in the products list
    const product = products.find(p => p.id === projectId);
    const numericAmount = realAmount ?? (product ? parseFloat(product.price.replace(/[^0-9.]/g, '')) || 0 : 0);

    const updatedPurchases = [...purchasedIds, projectId];

    // Update user profile in Firestore
    await setDoc(doc(db, 'users', auth.currentUser.uid), {
      purchasedIds: updatedPurchases
    }, { merge: true });

    // Register transaction log in Firestore (use real payment ID if available)
    const newTxId = paymentId ?? `pay_${Math.random().toString(36).substring(2, 14).toUpperCase()}`;
    const newTx: Transaction = {
      id: newTxId,
      userEmail: currentUser.email,
      userName: currentUser.name,
      projectTitle,
      amount: numericAmount,
      status: 'paid',
      date: new Date().toISOString()
    };
    await setDoc(doc(db, 'transactions', newTxId), newTx);

    // Create secure purchase record in purchases collection
    try {
      const orderId = `ord_${Math.random().toString(36).substring(2, 14).toUpperCase()}`;
      await createPurchaseRecord(
        auth.currentUser.uid,
        projectId,
        newTxId,
        orderId,
        numericAmount,
        'INR'
      );
    } catch (err) {
      console.warn("Secure purchase record logging failed:", err);
    }

    // Track event
    trackEvent('payment_completed', { 
      productId: projectId, 
      productTitle: projectTitle, 
      paymentId: newTxId,
      amount: numericAmount
    });

    // Set Global Receipt Data for printer animation
    setGlobalReceiptData({
      projectId,
      projectTitle,
      projectCategory: product?.category,
      projectImage: product?.imageUrl || product?.detail?.imageUrl,
      amount: numericAmount,
      paymentId: newTxId,
      buyerName: currentUser.name,
      buyerEmail: currentUser.email,
    });
  };

  const handlePurchasePlayground = async (projectId: string, projectTitle: string) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    // ── TEST USER BYPASS (Zero-Payment Testing Mode) ───────────────────
    if (isTestUser(currentUser.email)) {
      const product = products.find(p => p.id === projectId);
      const numericPrice = product ? parseFloat(product.price.replace(/[^0-9.]/g, '')) || 0 : 0;
      const testPaymentId = generateTestPaymentId();
      handlePurchaseSuccess(projectId, projectTitle, testPaymentId, numericPrice);
      return;
    }

    const isLoaded = await loadRazorpay();
    if (!isLoaded) {
      alert('Unable to connect to Razorpay. Please check your internet connection.');
      return;
    }
    const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!RAZORPAY_KEY) {
      alert('Razorpay key is not configured.');
      return;
    }
    // Resolve real price from products list
    const product = products.find(p => p.id === projectId);
    const numericPrice = product ? parseFloat(product.price.replace(/[^0-9.]/g, '')) || 0 : 0;
    const razorpayAmount = Math.round(numericPrice * 100); // Razorpay uses paise

    const options = {
      key: RAZORPAY_KEY,
      amount: razorpayAmount,
      currency: 'INR',
      name: 'CodeBazaar',
      description: `Purchase: ${projectTitle}`,
      handler: function (response: { razorpay_payment_id: string }) {
        handlePurchaseSuccess(projectId, projectTitle, response.razorpay_payment_id, numericPrice);
      },
      prefill: { name: currentUser.name, email: currentUser.email },
      theme: { color: '#6938FF' }
    };
    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  if (currentPlaygroundId) {
    return (
      <ProjectPlayground
        projectId={currentPlaygroundId}
        onClose={() => {
          window.history.pushState({}, '', window.location.pathname);
          setCurrentPlaygroundId(null);
        }}
        onPurchase={handlePurchasePlayground}
        purchasedIds={purchasedIds}
        products={products}
      />
    );
  }

  if (currentPreviewId) {
    const targetProduct = products.find(p => p.id === currentPreviewId) || DEFAULT_PRODUCTS.find(p => p.id === currentPreviewId);
    if (targetProduct) {
      const isPurchased = purchasedIds.includes(targetProduct.id);
      return (
        <div className="bg-[#0c0c14] text-white min-h-screen relative font-sans selection:bg-purple-500 selection:text-white flex flex-col">
          <AnimatedGradientBackground containerClassName="fixed inset-0 z-0 pointer-events-none" />

          {/* Standalone Header */}
          <div className="relative z-20 px-6 py-4 bg-[#0c0c14]/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
            <button
              onClick={() => {
                window.history.pushState({}, '', window.location.pathname);
                setCurrentPreviewId(null);
              }}
              className="flex items-center gap-2 px-4.5 py-2.5 bg-purple-500/10 border border-purple-500/30 hover:bg-purple-600 hover:border-purple-500 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider text-purple-300 transition-all duration-300 active:scale-95 shadow-[0_0_15px_rgba(139,92,246,0.1)] hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Marketplace</span>
            </button>
            <div className="font-mono text-xs text-white/60 font-semibold truncate max-w-[300px]">
              {targetProduct.title} · Full Preview Page
            </div>
          </div>

          {/* Product Detail Modal rendered full-screen in standalone page */}
          <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
            <ProjectPreviewModal
              project={targetProduct.detail}
              isPurchased={isPurchased}
              isLoading={false}
              isFavorited={false}
              onToggleFavorite={() => {}}
              onClose={() => {
                window.history.pushState({}, '', window.location.pathname);
                setCurrentPreviewId(null);
              }}
              onPurchase={() => {
                handlePurchasePlayground(targetProduct.id, targetProduct.title);
              }}
              onDownload={() => {}}
              isStandalone={true}
            />
          </div>
        </div>
      );
    }
  }

  return (
    <div className="bg-black text-white min-h-screen relative font-sans antialiased selection:bg-purple-500 selection:text-white overflow-x-hidden">
      <AnimatedGradientBackground containerClassName="fixed inset-0 z-0 pointer-events-none" />

      {/* Main Content wrapper */}
      <div className="relative z-10">
        {isAllTemplatesOpen ? (
          <div className="min-h-screen flex flex-col justify-between">
            {/* Standalone Templates Page Navigation Header */}
            <div className="sticky top-0 z-40 px-3 sm:px-8 py-3 sm:py-4 bg-[#0c0c14]/85 backdrop-blur-xl border-b border-white/10 shadow-2xl">
              <div className="max-w-[1320px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
                {/* Left: Brand & Back */}
                <div className="flex items-center gap-2 sm:gap-6 shrink-0">
                  <button
                    onClick={handleBackToHome}
                    className="flex items-center gap-2 select-none group cursor-pointer bg-transparent border-none p-0 text-left shrink-0"
                    title="Return to Home"
                  >
                    <img src={siteLogo} alt="CodeBazaar Logo" className="w-8 h-8 sm:w-10 sm:h-10 group-hover:scale-105 transition-transform" />
                    <span className="font-display text-xl sm:text-2xl text-white tracking-tight leading-none max-xs:hidden">
                      codebazaar
                    </span>
                  </button>

                  <div className="h-5 sm:h-6 w-px bg-white/10" />

                  <button
                    type="button"
                    onClick={handleBackToHome}
                    className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4.5 py-1.5 sm:py-2.5 bg-purple-500/10 border border-purple-500/30 hover:bg-purple-600 hover:border-purple-500 hover:text-white rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider text-purple-300 transition-all duration-300 active:scale-95 shadow-[0_0_15px_rgba(139,92,246,0.1)] hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] cursor-pointer shrink-0"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Back to Home</span>
                    <span className="sm:hidden">Back</span>
                  </button>
                </div>

                {/* Right: Auth & Account actions */}
                <div className="flex items-center gap-3">
                  {currentUser ? (
                    <div className="relative">
                      <button
                        onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                        className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-sans text-[11px] font-semibold uppercase tracking-[0.06em] px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full flex items-center gap-2 transition-all cursor-pointer select-none shrink-0"
                      >
                        {currentUser.photoURL ? (
                          <img
                            src={currentUser.photoURL}
                            alt={currentUser.name}
                            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold font-mono shrink-0">
                            {currentUser.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="max-sm:hidden">{currentUser.name.split(' ')[0]}</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-white/50 transition-transform duration-300 ${isAccountDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown Menu */}
                      {isAccountDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setIsAccountDropdownOpen(false)} />
                          <div className="absolute right-0 mt-3 w-64 bg-[#0c0c14] border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex flex-col gap-2 z-50 text-left">
                            <div className="px-2 py-1">
                              <p className="font-bold text-white text-xs truncate">{currentUser.name}</p>
                              <p className="text-[10px] text-white/40 font-mono truncate">{currentUser.email}</p>
                            </div>
                            <div className="border-b border-white/5 my-1" />
                            {currentUser.role === 'admin' && (
                              <button
                                onClick={() => { setIsAccountDropdownOpen(false); setIsAdminOpen(true); }}
                                className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white px-2.5 py-2 rounded-lg hover:bg-white/5 transition-all text-left cursor-pointer"
                              >
                                <User className="w-4 h-4 text-pink-400" />
                                <span>Admin Panel</span>
                              </button>
                            )}
                            <button
                              onClick={() => { setIsAccountDropdownOpen(false); setIsMyPurchasesOpen(true); }}
                              className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white px-2.5 py-2 rounded-lg hover:bg-white/5 transition-all text-left cursor-pointer"
                            >
                              <Package className="w-4 h-4 text-purple-400" />
                              <span>My Orders</span>
                            </button>
                            <button
                              onClick={() => { setIsAccountDropdownOpen(false); handleLogout(); }}
                              className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 px-2.5 py-2 rounded-lg hover:bg-red-500/10 transition-all text-left cursor-pointer"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Logout</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAuthOpen(true)}
                      className="bg-white text-black font-sans text-[11px] font-bold uppercase tracking-[0.06em] px-4.5 py-2.5 rounded-full transition-all hover:bg-white/90 active:scale-95 shadow-[0_4px_12px_rgba(255,255,255,0.1)] cursor-pointer"
                    >
                      Login / Sign Up
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Catalog Projects Grid - Only Templates Visible */}
            <div className="flex-1">
              <FeaturedProjects 
                currentUser={currentUser}
                purchasedIds={purchasedIds}
                onTriggerAuth={() => setIsAuthOpen(true)}
                onPurchaseSuccess={handlePurchaseSuccess}
                products={products}
                isFullCatalogView={true}
                onBackClick={handleBackToHome}
                onViewAllClick={() => {}}
              />
            </div>
          </div>
        ) : (
          <>
            {/* Hero Header & Nav */}
            <Hero 
              currentUser={currentUser}
              onLoginClick={() => setIsAuthOpen(true)}
              onLogout={handleLogout}
              onAdminClick={() => setIsAdminOpen(true)}
              onMyPurchasesClick={() => setIsMyPurchasesOpen(true)}
            />

            {/* How it works section */}
            <HowItWorks />

            {/* Featured Projects Grid */}
            <FeaturedProjects 
              currentUser={currentUser}
              purchasedIds={purchasedIds}
              onTriggerAuth={() => setIsAuthOpen(true)}
              onPurchaseSuccess={handlePurchaseSuccess}
              products={products}
              isFullCatalogView={false}
              onViewAllClick={handleOpenTemplatesPage}
            />

            {/* What we deliver guarantees */}
            <WhatWeDeliver />

            {/* Accordion FAQ details */}
            <FAQ />
          </>
        )}

        {/* Bottom Footer links */}
        <Footer />
      </div>

      {/* Login & Sign Up view (covering screen when open) */}
      {isAuthOpen && (
        <AuroraAuth 
          onClose={() => setIsAuthOpen(false)}
        />
      )}

      {/* Admin Panel Dashboard dialog */}
      {isAdminOpen && (
        <AdminDashboard 
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          transactions={transactions}
          products={products}
        />
      )}

      {/* My Purchases dashboard dialog */}
      {isMyPurchasesOpen && (
        <MyPurchasesModal
          isOpen={isMyPurchasesOpen}
          onClose={() => setIsMyPurchasesOpen(false)}
          products={products}
        />
      )}

      {/* Global Purchase Receipt Modal */}
      {globalReceiptData && (
        <PurchaseReceiptModal
          isOpen={!!globalReceiptData}
          onClose={() => setGlobalReceiptData(null)}
          receiptData={globalReceiptData}
          onDownloadCode={async () => {
            const proj = products.find(p => p.id === globalReceiptData.projectId) || DEFAULT_PRODUCTS.find(p => p.id === globalReceiptData.projectId);
            try {
              if (proj) {
                const productSnap = await getDoc(doc(db, 'products', proj.id));
                if (productSnap.exists()) {
                  const data = productSnap.data();
                  if (data.downloadFile && data.downloadFile.storagePath) {
                    const blob = await downloadProductBlob(data.downloadFile.storagePath);
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = data.downloadFile.fileName || `${proj.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.zip`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                    return;
                  }
                }
              }
            } catch (e) {
              console.warn("Secure download fallback to starter ZIP:", e);
            }
            downloadProjectZip(globalReceiptData.projectTitle);
          }}
          autoPlayStages={true}
        />
      )}
    </div>
  );
}
