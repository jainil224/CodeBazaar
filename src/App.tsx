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
import { useAuth } from '@/context/AuthContext';
import { doc, collection, onSnapshot, setDoc } from 'firebase/firestore';
import { db, auth } from '@/firebase';
import { loadRazorpay } from './utils/razorpayLoader';
import { DEFAULT_PRODUCTS } from '@/features/digitalProducts/data/defaultProducts';
import MyPurchasesModal from '@/features/digitalProducts/components/MyPurchasesModal';
import { createPurchaseRecord } from '@/features/digitalProducts/services/purchaseService';
import type { DigitalProduct } from '@/features/digitalProducts/types/digitalProduct';
import { trackEvent } from '@/lib/analytics';


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
  const [isAllTemplatesOpen, setIsAllTemplatesOpen] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);
  const [currentPlaygroundId, setCurrentPlaygroundId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('project');
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

  // Check URL route for /admin or view=admin, purchases, etc.
  useEffect(() => {
    const handleUrlRoute = () => {
      const path = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      
      const isAdminRoute = path === '/admin' || path === '/admin/dashboard' || params.get('view') === 'admin';
      const isPurchasesRoute = path === '/my-purchases' || path === '/purchases' || params.get('view') === 'purchases';

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
      }
    };

    if (authResolved) {
      handleUrlRoute();
    }
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

  // Track dashboard & purchases overlay views
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
  };

  const handlePurchasePlayground = async (projectId: string, projectTitle: string) => {
    if (!currentUser) {
      setIsAuthOpen(true);
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
      />
    );
  }

  return (
    <div className="bg-black text-white min-h-screen relative font-sans antialiased selection:bg-purple-500 selection:text-white overflow-x-hidden">
      <AnimatedGradientBackground containerClassName="fixed inset-0 z-0 pointer-events-none" />

      {/* Main Content wrapper */}
      <div className="relative z-10">
        {isAllTemplatesOpen ? (
          <div className="py-12">
            <FeaturedProjects 
              currentUser={currentUser}
              purchasedIds={purchasedIds}
              onTriggerAuth={() => setIsAuthOpen(true)}
              onPurchaseSuccess={handlePurchaseSuccess}
              products={products}
              isFullCatalogView={true}
              onBackClick={() => setIsAllTemplatesOpen(false)}
              onViewAllClick={() => {}}
            />
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
              onViewAllClick={() => setIsAllTemplatesOpen(true)}
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
    </div>
  );
}
