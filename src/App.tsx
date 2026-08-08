import { useState, useEffect } from 'react';
import Hero from '@/components/Hero';
import FeaturedProjects from '@/components/FeaturedProjects';
import HowItWorks from '@/components/HowItWorks';
import WhatWeDeliver from '@/components/WhatWeDeliver';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
import AuroraAuth from '@/components/AuroraAuth';
import AdminDashboard from '@/components/AdminDashboard';

interface Transaction {
  id: string;
  userEmail: string;
  userName: string;
  projectTitle: string;
  amount: number;
  date: string;
}

interface UserSession {
  email: string;
  name: string;
  role: 'admin' | 'user';
}

const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: 'pay_P1o98G7sL9kH',
    userEmail: 'alex.dev@gmail.com',
    userName: 'Alex Chen',
    projectTitle: 'AI Chat Bot Interface',
    amount: 50,
    date: new Date(Date.now() - 3600000 * 4).toISOString() // 4 hours ago
  },
  {
    id: 'pay_J2m54K8aQ2wX',
    userEmail: 'sarah.smith@outlook.com',
    userName: 'Sarah Smith',
    projectTitle: 'SaaS Platform Boilerplate',
    amount: 50,
    date: new Date(Date.now() - 3600000 * 24).toISOString() // 24 hours ago
  },
  {
    id: 'pay_N9p12V6cR7tM',
    userEmail: 'rohit.k@yahoo.com',
    userName: 'Rohit Kumar',
    projectTitle: 'Creative Studio Portfolio',
    amount: 50,
    date: new Date(Date.now() - 3600000 * 48).toISOString() // 2 days ago
  }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Load from localStorage or seed
  useEffect(() => {
    const cachedUser = localStorage.getItem('cb_user');
    if (cachedUser) {
      setCurrentUser(JSON.parse(cachedUser));
    }

    const cachedPurchased = localStorage.getItem('cb_purchased');
    if (cachedPurchased) {
      setPurchasedIds(JSON.parse(cachedPurchased));
    }

    const cachedTxs = localStorage.getItem('cb_txs');
    if (cachedTxs) {
      setTransactions(JSON.parse(cachedTxs));
    } else {
      setTransactions(SEED_TRANSACTIONS);
      localStorage.setItem('cb_txs', JSON.stringify(SEED_TRANSACTIONS));
    }
  }, []);

  const handleLoginSuccess = (user: UserSession) => {
    setCurrentUser(user);
    localStorage.setItem('cb_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('cb_user');
  };

  const handlePurchaseSuccess = (projectId: string, projectTitle: string) => {
    if (!currentUser) return;

    // Add to purchased project IDs list
    const updatedPurchases = [...purchasedIds, projectId];
    setPurchasedIds(updatedPurchases);
    localStorage.setItem('cb_purchased', JSON.stringify(updatedPurchases));

    // Register transaction log
    const newTx: Transaction = {
      id: `pay_${Math.random().toString(36).substring(2, 14).toUpperCase()}`,
      userEmail: currentUser.email,
      userName: currentUser.name,
      projectTitle,
      amount: 50,
      date: new Date().toISOString()
    };

    const updatedTxs = [newTx, ...transactions];
    setTransactions(updatedTxs);
    localStorage.setItem('cb_txs', JSON.stringify(updatedTxs));

    alert(`Payment successful! "${projectTitle}" codebase is now unlocked for download.`);
  };

  return (
    <div className="bg-[#020316] text-white min-h-screen relative font-sans antialiased selection:bg-purple-500 selection:text-white">
      {/* Hero Header & Nav */}
      <Hero 
        currentUser={currentUser}
        onLoginClick={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onAdminClick={() => setIsAdminOpen(true)}
      />

      {/* How it works section */}
      <HowItWorks />

      {/* Featured Projects Grid */}
      <FeaturedProjects 
        currentUser={currentUser}
        purchasedIds={purchasedIds}
        onTriggerAuth={() => setIsAuthOpen(true)}
        onPurchaseSuccess={handlePurchaseSuccess}
      />

      {/* What we deliver guarantees */}
      <WhatWeDeliver />

      {/* Accordion FAQ details */}
      <FAQ />

      {/* Bottom Footer links */}
      <Footer />

      {/* Login & Sign Up view (covering screen when open) */}
      {isAuthOpen && (
        <AuroraAuth 
          onClose={() => setIsAuthOpen(false)}
          onSuccess={handleLoginSuccess}
        />
      )}

      {/* Admin Panel Dashboard dialog */}
      <AdminDashboard 
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        transactions={transactions}
      />
    </div>
  );
}
