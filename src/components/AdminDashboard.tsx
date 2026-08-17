import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  X, DollarSign, ShoppingCart, Users, Terminal, Plus, Edit2, 
  Trash2, Image, ArrowLeft, Save, RefreshCw,
  BarChart3, Layers, Settings, Search, Download, 
  ArrowRight, UserCheck, Calendar, Menu, Sparkles
} from 'lucide-react';
import siteLogo from '@/assets/logo.svg';
import { doc, setDoc, deleteDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { uploadProductImage, deleteProductFile } from '@/features/digitalProducts/services/productFileService';
import ProductFileUpload from '@/features/digitalProducts/components/ProductFileUpload';
import { trackEvent } from '@/lib/analytics';
import { fetchDashboardAnalytics, clearAllAnalyticsEvents } from '../features/admin/services/adminAnalyticsService';
import type { 
  DateRangeFilter, 
  DateRangeType, 
  DashboardStats 
} from '../features/admin/services/adminAnalyticsService';
import type { DigitalProduct, DownloadFileMetadata, TechStackCategory } from '@/features/digitalProducts/types/digitalProduct';

// Import Custom SVG charts
import KpiCard from '@/features/admin/components/KpiCard';
import RevenueChart from '@/features/admin/components/RevenueChart';
import VisitorsChart from '@/features/admin/components/VisitorsChart';
import AudienceBreakdown from '@/features/admin/components/AudienceBreakdown';
import ConversionFunnel from '@/features/admin/components/ConversionFunnel';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: any[];
  products: DigitalProduct[];
}

export default function AdminDashboard({ isOpen, onClose, products: propProducts }: AdminDashboardProps) {
  const { userProfile: adminUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'listings' | 'orders' | 'customers' | 'settings'>('dashboard');
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>({ type: '7days' });
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Custom Date inputs
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [isPurgingEvents, setIsPurgingEvents] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NAVIGATION_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: <Terminal className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'listings', label: 'My Listings', icon: <Layers className="w-4 h-4" /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'customers', label: 'Customers', icon: <Users className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  // Listings CRUD States
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DigitalProduct | null>(null);
  const [prodId, setProdId] = useState('');
  const [prodTitle, setProdTitle] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodLongDescription, setProdLongDescription] = useState('');
  const [prodPrice, setProdPrice] = useState('₹50');
  const [prodCategory, setProdCategory] = useState('Landing Page');
  const [prodVersion, setProdVersion] = useState('v1.0.0');
  const [prodTags, setProdTags] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [prodFeatures, setProdFeatures] = useState('');
  const [prodSystemRequirements, setProdSystemRequirements] = useState('Node.js >= 18, modern browser');
  const [prodPreviewUrl, setProdPreviewUrl] = useState('');
  const [prodDownloadFile, setProdDownloadFile] = useState<DownloadFileMetadata | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [techStackCategories, setTechStackCategories] = useState<TechStackCategory[]>([
    { category: 'Frontend', color: '#a78bfa', items: ['React', 'TypeScript', 'Tailwind CSS'] }
  ]);

  // Search & Filters for tables
  const [orderSearch, setOrderSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [allCustomers, setAllCustomers] = useState<any[]>([]);

  // Fetch Dashboard Stats
  const loadData = async (showSpinner = true) => {
    if (showSpinner) setIsLoading(true);
    try {
      const dashboardStats = await fetchDashboardAnalytics(dateFilter);
      setStats(dashboardStats);
      setLastUpdated(new Date());

      // Fetch all users to display in Customers list
      let customersList: any[] = [];
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        customersList = usersSnap.docs.map(docSnap => {
          const u = docSnap.data();
          const userTxs = dashboardStats.allOrders.filter(tx => tx.customerEmail === u.email);
          const totalSpent = userTxs.reduce((sum, tx) => sum + tx.amount, 0);
          return {
            id: docSnap.id,
            name: u.name || 'Anonymous User',
            email: u.email || 'no-email',
            role: u.role || 'user',
            totalSpent,
            orderCount: userTxs.length,
            createdAt: u.createdAt?.toDate ? u.createdAt.toDate() : (u.createdAt ? new Date(u.createdAt) : null)
          };
        });
      } catch (cErr) {
        console.warn("Customers load warning:", cErr);
      }
      setAllCustomers(customersList);
    } catch (err: any) {
      console.error("Dashboard data load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData(true);
      // Background auto-refresh every 30 seconds while admin console is open (without flashing spinner)
      const interval = setInterval(() => {
        loadData(false);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isOpen, dateFilter]);

  if (!isOpen) return null;

  const handleDateFilterChange = (type: DateRangeType) => {
    if (type === 'custom') {
      setShowCustomPicker(true);
    } else {
      setShowCustomPicker(false);
      setDateFilter({ type });
    }
  };

  const applyCustomRange = () => {
    if (!customStart || !customEnd) return;
    setDateFilter({
      type: 'custom',
      customStart: new Date(customStart),
      customEnd: new Date(customEnd)
    });
    setShowCustomPicker(false);
  };

  // CSV Exporter
  const exportToCsv = (filename: string, headers: string[], dataRows: string[][]) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...dataRows.map(e => e.map(val => `"${(val || '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportOrders = () => {
    if (!stats) return;
    const headers = ['Order ID', 'Customer Name', 'Customer Email', 'Product Name', 'Amount', 'Status', 'Date'];
    const rows = stats.allOrders.map(o => [
      o.id,
      o.customerName,
      o.customerEmail,
      o.productTitle,
      `₹${o.amount}`,
      o.status,
      new Date(o.date).toLocaleDateString()
    ]);
    exportToCsv('orders_report.csv', headers, rows);
  };

  const handleClearAnalytics = async () => {
    if (!window.confirm("Are you sure you want to clear all test analytics events? This will delete old test page views and reset analytics stats.")) return;
    setIsPurgingEvents(true);
    try {
      await clearAllAnalyticsEvents();
      await loadData();
      alert("Test analytics events successfully cleared!");
    } catch (err: any) {
      alert("Failed to clear analytics: " + err.message);
    } finally {
      setIsPurgingEvents(false);
    }
  };

  const handleExportListings = () => {
    if (!stats) return;
    const headers = ['Product ID', 'Title', 'Category', 'Price', 'Views', 'Clicks', 'Sales Count', 'Revenue', 'Conversion Rate', 'Downloads'];
    const rows = stats.productPerformance.map(p => [
      p.id,
      p.title,
      p.category,
      p.price,
      p.views.toString(),
      p.clicks.toString(),
      p.orders.toString(),
      `₹${p.revenue}`,
      `${p.conversion}%`,
      p.downloads.toString()
    ]);
    exportToCsv('listings_performance.csv', headers, rows);
  };

  // CRUD Product Actions
  const startAddNew = () => {
    setProdId(`proj-${Math.random().toString(36).substring(2, 9)}`);
    setProdTitle('');
    setProdDescription('');
    setProdLongDescription('');
    setProdPrice('₹50');
    setProdCategory('Landing Page');
    setProdVersion('v1.0.0');
    setProdTags('React, TypeScript, Framer Motion, Tailwind');
    setProdImageUrl('');
    setProdFeatures('Stunning dark glassmorphism UI\nFully responsive layout\nSmooth transitions and micro-animations');
    setProdSystemRequirements('Node.js >= 18, modern browser');
    setProdPreviewUrl('');
    setProdDownloadFile(null);
    setTechStackCategories([
      { category: 'Frontend', color: '#a78bfa', items: ['React 19', 'TypeScript', 'Tailwind CSS'] },
      { category: 'Build Tools', color: '#60a5fa', items: ['Vite'] }
    ]);
    setEditingProduct(null);
    setIsEditing(true);
  };

  const startEdit = (product: DigitalProduct) => {
    setProdId(product.id);
    setProdTitle(product.title);
    setProdDescription(product.description);
    setProdLongDescription(product.detail?.longDescription || '');
    setProdPrice(product.price);
    setProdCategory(product.category);
    setProdVersion(product.version);
    setProdTags(product.tags.join(', '));
    setProdImageUrl(product.imageUrl || '');
    setProdFeatures(product.detail?.features.join('\n') || '');
    setProdSystemRequirements(product.detail?.systemRequirements || '');
    setProdPreviewUrl(product.detail?.previewUrl || '');
    setProdDownloadFile(product.downloadFile || null);
    setTechStackCategories(product.detail?.techStack || [
      { category: 'Frontend', color: '#a78bfa', items: ['React 19', 'TypeScript', 'Tailwind CSS'] }
    ]);
    setEditingProduct(product);
    setIsEditing(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setImageUploadProgress(0);
    try {
      const url = await uploadProductImage(prodId, file, (prog) => {
        setImageUploadProgress(prog);
      });
      setProdImageUrl(url);
    } catch (err: any) {
      alert("Failed to upload image: " + err.message);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleZipUploadComplete = async (storagePath: string, fileName: string, fileSize: number) => {
    const oldPath = prodDownloadFile?.storagePath;
    const newDownloadFile: DownloadFileMetadata = {
      fileName,
      storagePath,
      fileType: 'application/zip',
      fileSize
    };
    setProdDownloadFile(newDownloadFile);

    if (editingProduct && oldPath && oldPath !== storagePath) {
      await deleteProductFile(oldPath);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodTitle || !prodDescription) {
      alert("Please enter title and description.");
      return;
    }

    setIsSaving(true);
    try {
      const parsedPrice = prodPrice.startsWith('₹') ? prodPrice : `₹${prodPrice}`;
      const parsedTags = prodTags.split(',').map(t => t.trim()).filter(Boolean);
      const parsedFeatures = prodFeatures.split('\n').map(f => f.trim()).filter(Boolean);

      const productDoc: DigitalProduct = {
        id: prodId,
        title: prodTitle,
        description: prodDescription,
        tags: parsedTags,
        price: parsedPrice,
        category: prodCategory,
        version: prodVersion,
        imageUrl: prodImageUrl,
        glassMediaBg: 'bg-violet-500/15 border-violet-400/20',
        glassAccentBg: 'bg-violet-600/40 border-violet-400/30',
        glassTagBg: 'bg-violet-500/10 border-violet-400/20',
        detail: {
          id: prodId,
          title: prodTitle,
          price: parsedPrice,
          description: prodDescription,
          longDescription: prodLongDescription || prodDescription,
          imageUrl: prodImageUrl,
          tags: parsedTags,
          techStack: techStackCategories,
          features: parsedFeatures,
          previewUrl: prodPreviewUrl,
          systemRequirements: prodSystemRequirements,
          highlights: [
            { icon: 'Zap', label: 'Build Time', value: '< 1s', color: '#fbbf24' },
            { icon: 'Layers', label: 'Components', value: '15+', color: '#a78bfa' },
            { icon: 'Shield', label: 'License', value: 'Personal', color: '#fb923c' },
            { icon: 'Smartphone', label: 'Responsive', value: '100%', color: '#34d399' }
          ]
        },
        updatedAt: serverTimestamp()
      };

      if (prodDownloadFile) {
        productDoc.downloadFile = prodDownloadFile;
      }

      if (!editingProduct) {
        productDoc.createdAt = serverTimestamp();
      } else {
        productDoc.createdAt = editingProduct.createdAt || serverTimestamp();
      }

      await setDoc(doc(db, 'products', prodId), productDoc);
      trackEvent(editingProduct ? 'admin_product_updated' : 'admin_product_created', {
        productId: prodId,
        productTitle: prodTitle
      });
      setIsEditing(false);
      loadData();
    } catch (error: any) {
      alert("Error saving product: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (product: DigitalProduct) => {
    if (!confirm(`Are you sure you want to delete the product "${product.title}"?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'products', product.id));
      trackEvent('admin_product_deleted', {
        productId: product.id,
        productTitle: product.title
      });
      if (product.downloadFile?.storagePath) {
        await deleteProductFile(product.downloadFile.storagePath);
      }
      loadData();
    } catch (error: any) {
      alert("Error deleting product: " + error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-[#0c0c14] text-white font-sans overflow-hidden">
      {/* ── TOP HERO GRADIENT ACCENT STRIPE ─────────────────────────────────── */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary-indigo via-primary-pink to-primary-orange z-50 pointer-events-none shadow-[0_0_12px_rgba(61,90,254,0.6)]" />

      {/* ── AMBIENT HERO GLOW BLOBS ─────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <div className="absolute -top-40 right-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-primary-indigo/15 via-primary-pink/10 to-primary-orange/10 rounded-full blur-[140px] opacity-70" />
        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[120px] opacity-70" />
      </div>

      {/* ── LEFT SIDEBAR ────────────────────────────────────────────────────── */}
      <div className="w-[260px] bg-white/[0.02] border-r border-white/10 flex flex-col justify-between shrink-0 select-none max-md:hidden relative z-10">
        <div>
          {/* Logo / Portal header */}
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-indigo via-primary-pink to-primary-orange p-[1px] shadow-sm">
              <div className="w-full h-full bg-[#0c0c16] rounded-[11px] flex items-center justify-center p-1.5">
                <img src={siteLogo} alt="CodeBazaar Logo" className="w-full h-full object-contain" />
              </div>
            </div>
            <div>
              <h1 className="font-extrabold text-base leading-none tracking-tight text-white">codebazaar</h1>
              <span className="text-[10px] text-primary-pink font-mono tracking-widest uppercase font-semibold mt-1 block">Seller Console</span>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="p-4 space-y-1.5 mt-4">
            {NAVIGATION_ITEMS.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setIsEditing(false);
                  setActiveTab(tab.id as any);
                }}
                className={`w-full flex items-center gap-3 px-4.5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-95 cursor-pointer ${
                  activeTab === tab.id 
                    ? 'bg-gradient-to-r from-primary-indigo via-purple-600 to-primary-pink text-white shadow-[0_8px_24px_rgba(61,90,254,0.35)] border border-white/20' 
                    : 'text-white/50 hover:text-white hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <span className={`transition-transform duration-300 ${activeTab === tab.id ? 'scale-110 text-white' : 'text-white/40'}`}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff] ml-auto animate-pulse" />
                )}
              </button>
            ))}
            
            <div className="pt-4 mt-4 border-t border-white/10">
              <button
                onClick={onClose}
                className="w-full flex items-center gap-3.5 px-4.5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-95 cursor-pointer text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 border border-purple-500/20"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Website</span>
              </button>
            </div>
          </div>
        </div>

        {/* User profile & exit */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between gap-3">
          <div className="min-w-0 text-left">
            <p className="text-xs font-bold truncate text-white">Administrator</p>
            <p className="text-[10px] text-white/40 truncate font-mono">{adminUser?.email || 'admin'}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 bg-white/5 border border-white/10 hover:bg-red-600/30 hover:border-red-500 hover:text-white rounded-xl transition-all cursor-pointer"
            title="Exit Console"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── MOBILE SLIDE-OVER DRAWER MENU ───────────────────────────────────── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex flex-col md:hidden animate-in fade-in duration-200">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-indigo via-primary-pink to-primary-orange p-[1px] shadow-sm">
                <div className="w-full h-full bg-[#0c0c16] rounded-[11px] flex items-center justify-center p-1">
                  <img src={siteLogo} alt="CodeBazaar Logo" className="w-full h-full object-contain" />
                </div>
              </div>
              <div>
                <h1 className="font-extrabold text-sm leading-none text-white">codebazaar</h1>
                <span className="text-[10px] text-primary-pink font-mono tracking-widest uppercase block mt-0.5 font-bold">Seller Console</span>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-4 space-y-2 overflow-y-auto">
            <p className="text-[10px] text-white/40 font-mono font-bold uppercase tracking-widest px-2 mb-2">Console Navigation</p>
            {NAVIGATION_ITEMS.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setIsEditing(false);
                  setActiveTab(tab.id as any);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-primary-indigo via-purple-600 to-primary-pink text-white shadow-lg shadow-purple-900/40 border border-white/20'
                    : 'text-white/70 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5'
                }`}
              >
                <span className={activeTab === tab.id ? 'text-white' : 'text-white/40'}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="w-2 h-2 rounded-full bg-white ml-auto shadow-[0_0_8px_#ffffff]" />
                )}
              </button>
            ))}
            
            <div className="pt-4 mt-4 border-t border-white/10">
              <button
                onClick={onClose}
                className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 border border-purple-500/20"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Website</span>
              </button>
            </div>
          </div>

          {/* Footer Profile & Exit */}
          <div className="p-4 border-t border-white/10 bg-white/[0.01] flex items-center justify-between gap-3">
            <div className="min-w-0 text-left">
              <p className="text-xs font-bold text-white truncate">Administrator</p>
              <p className="text-[10px] text-white/40 font-mono truncate">{adminUser?.email || 'admin'}</p>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Exit Console
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT CONTAINER ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative z-10">
        
        {/* Main Dashboard Header */}
        <div className="px-4 sm:px-8 py-3.5 sm:py-5 border-b border-white/10 flex items-center justify-between shrink-0 flex-wrap gap-3 bg-white/[0.01]">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white md:hidden cursor-pointer shrink-0"
              title="Open Navigation Menu"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>

            <div className="text-left min-w-0">
              <h2 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2 truncate">
                {activeTab.toUpperCase()}
              </h2>
              <p className="text-[11px] sm:text-xs text-white/50 font-medium hidden sm:block">Overview and parameters log</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3.5">
            {/* Global Date selector */}
            <div className="relative shrink-0 flex items-center gap-1.5 sm:gap-2">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
              <select
                onChange={(e) => handleDateFilterChange(e.target.value as any)}
                value={dateFilter.type}
                className="bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs font-semibold outline-none focus:border-purple-500 text-white cursor-pointer"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
                <option value="thisYear">This Year</option>
                <option value="custom">Custom Range...</option>
              </select>
            </div>

            {/* Custom Range picker inputs overlay */}
            {showCustomPicker && (
              <div className="flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-xl p-2 z-20">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="bg-black/40 text-xs px-2 py-1 border border-white/5 rounded text-white"
                />
                <span className="text-[10px] text-white/40">to</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="bg-black/40 text-xs px-2 py-1 border border-white/5 rounded text-white"
                />
                <button
                  onClick={applyCustomRange}
                  className="bg-purple-600 hover:bg-purple-700 text-[10px] font-bold px-3 py-1 rounded"
                >
                  Apply
                </button>
              </div>
            )}

            {/* Refresh & Sync */}
            <button
              onClick={() => loadData(true)}
              disabled={isLoading}
              className="p-2 sm:p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              title={`Reload stats (Last: ${lastUpdated.toLocaleTimeString()})`}
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* Mobile Exit Trigger */}
            <button 
              onClick={onClose}
              className="p-2 sm:p-2.5 bg-white/5 border border-white/10 hover:bg-red-600/35 hover:border-red-500 rounded-xl md:hidden cursor-pointer"
              title="Close Admin Panel"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* ── MOBILE HORIZONTALLY SCROLLABLE TAB PILL BAR ───────────────────── */}
        <div className="flex items-center gap-1.5 overflow-x-auto px-4 py-2 bg-white/[0.02] border-b border-white/10 md:hidden [&::-webkit-scrollbar]:hidden scrollbar-none shrink-0 text-left">
          {NAVIGATION_ITEMS.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setIsEditing(false);
                setActiveTab(tab.id as any);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-white/5 text-white/60 border border-white/10 hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Scrollable Dashboard Viewport */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full bg-transparent">
          
          {isLoading ? (
            <div className="h-[40vh] flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
              <p className="text-sm text-white/50 font-mono">Aggregating Firestore records...</p>
            </div>
          ) : !stats ? (
            <div className="h-[40vh] flex flex-col items-center justify-center gap-4">
              <p className="text-sm text-white/50 font-mono">Unable to load dashboard metrics.</p>
              <button
                onClick={() => loadData(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Retry
              </button>
            </div>
          ) : (
            <>
              {/* 📊 TAB 1: DASHBOARD VIEW */}
              {activeTab === 'dashboard' && !isEditing && (
                <div className="space-y-8">
                  {/* KPI Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KpiCard 
                      title="Visitors" 
                      value={stats.kpis.visitors.value} 
                      percentChange={stats.kpis.visitors.percentChange} 
                      status={stats.kpis.visitors.status} 
                      icon={<Users className="w-5 h-5" />}
                    />
                    <KpiCard 
                      title="New Users" 
                      value={stats.kpis.newUsers.value} 
                      percentChange={stats.kpis.newUsers.percentChange} 
                      status={stats.kpis.newUsers.status} 
                      icon={<UserCheck className="w-5 h-5" />}
                    />
                    <KpiCard 
                      title="Orders" 
                      value={stats.kpis.orders.value} 
                      percentChange={stats.kpis.orders.percentChange} 
                      status={stats.kpis.orders.status} 
                      icon={<ShoppingCart className="w-5 h-5" />}
                    />
                    <KpiCard 
                      title="Revenue" 
                      value={stats.kpis.revenue.value} 
                      percentChange={stats.kpis.revenue.percentChange} 
                      status={stats.kpis.revenue.status} 
                      icon={<DollarSign className="w-5 h-5" />}
                    />
                  </div>

                  {/* Core Analytics Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Visitors / Page views chart */}
                    <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 text-left">
                      <h3 className="text-xs text-white/50 uppercase tracking-widest font-mono font-bold mb-4">Traffic & Views</h3>
                      <VisitorsChart 
                        dates={stats.charts.dates}
                        visitors={stats.charts.visitors}
                        pageViews={stats.charts.pageViews}
                      />
                    </div>

                    {/* Revenue Area Chart */}
                    <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 text-left">
                      <h3 className="text-xs text-white/50 uppercase tracking-widest font-mono font-bold mb-4">Earnings History</h3>
                      <RevenueChart 
                        dates={stats.charts.dates}
                        values={stats.charts.revenue}
                      />
                    </div>
                  </div>

                  {/* Conversion & Events Details */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Funnel */}
                    <div className="lg:col-span-1">
                      <ConversionFunnel funnel={stats.funnel} />
                    </div>

                    {/* Recent Orders log */}
                    <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 text-left lg:col-span-1 flex flex-col">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xs text-white/50 uppercase tracking-widest font-mono font-bold">Recent Orders</h3>
                        <button 
                          onClick={() => setActiveTab('orders')}
                          className="text-[10px] text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 cursor-pointer font-mono"
                        >
                          SEE ALL <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto max-h-[400px] space-y-3.5 [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-thumb]:bg-white/10">
                        {stats.recentOrders.length === 0 ? (
                          <div className="text-center text-white/30 text-xs py-12 font-mono">No orders found.</div>
                        ) : (
                          stats.recentOrders.map(order => (
                            <div key={order.id} className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
                              <div className="min-w-0 text-left">
                                <h4 className="font-bold text-white truncate">{order.productTitle}</h4>
                                <p className="text-[10px] text-white/40 truncate mt-0.5">{order.customerEmail}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="font-black text-green-400">₹{order.amount}</p>
                                <span className="text-[9px] text-white/30 font-mono mt-0.5 block">
                                  {new Date(order.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Recent Activity stream */}
                    <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 text-left lg:col-span-1 flex flex-col">
                      <h3 className="text-xs text-white/50 uppercase tracking-widest font-mono font-bold mb-6">System Events</h3>
                      
                      <div className="flex-1 overflow-y-auto max-h-[400px] space-y-4 [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-thumb]:bg-white/10 pr-1">
                        {stats.recentActivity.length === 0 ? (
                          <div className="text-center text-white/30 text-xs py-12 font-mono">No activity logged.</div>
                        ) : (
                          stats.recentActivity.map(act => (
                            <div key={act.id} className="text-xs text-left relative pl-4 border-l border-white/10">
                              <div className="absolute left-[-4.5px] top-1 w-2.5 h-2.5 rounded-full bg-purple-500 border-2 border-[#0c0c14]" />
                              <p className="text-white/80 font-medium leading-relaxed">{act.message}</p>
                              <span className="text-[10px] text-white/30 mt-1 block font-mono">{act.timeLabel}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 📈 TAB 2: DETAILED ANALYTICS VIEW */}
              {activeTab === 'analytics' && (
                <div className="space-y-8">
                  {/* Detailed KPIs comparison list */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KpiCard 
                      title="Page Views" 
                      value={stats.kpis.pageViews.value} 
                      percentChange={stats.kpis.pageViews.percentChange} 
                      status={stats.kpis.pageViews.status} 
                    />
                    <KpiCard 
                      title="Tracked Clicks" 
                      value={stats.kpis.clicks.value} 
                      percentChange={stats.kpis.clicks.percentChange} 
                      status={stats.kpis.clicks.status} 
                    />
                    <KpiCard 
                      title="Active Users" 
                      value={stats.kpis.activeUsers.value} 
                      percentChange={stats.kpis.activeUsers.percentChange} 
                      status={stats.kpis.activeUsers.status} 
                    />
                    <KpiCard 
                      title="Conversion" 
                      value={stats.kpis.conversionRate.value} 
                      percentChange={stats.kpis.conversionRate.percentChange} 
                      status={stats.kpis.conversionRate.status} 
                    />
                  </div>

                  {/* Audience breakdown columns */}
                  <AudienceBreakdown 
                    devices={stats.audience.devices}
                    browsers={stats.audience.browsers}
                    systems={stats.audience.systems}
                    countries={stats.audience.countries}
                  />

                  {/* Searches & Top Terms */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
                    {/* Search Analytics */}
                    <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6">
                      <h3 className="text-sm font-bold font-mono uppercase tracking-widest text-white/50 mb-6">
                        Search Analytics
                      </h3>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-white/40 border-b border-white/10 pb-2">
                              <th className="pb-3 text-left">Search Term</th>
                              <th className="pb-3 text-center">Searches Count</th>
                              <th className="pb-3 text-center">Found Results</th>
                              <th className="pb-3 text-right">No Results</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {stats.searchTerms.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="py-6 text-center text-white/30 font-mono">No searches performed.</td>
                              </tr>
                            ) : (
                              stats.searchTerms.map((s, idx) => (
                                <tr key={idx} className="hover:bg-white/[0.01]">
                                  <td className="py-3 font-semibold text-white">{s.term}</td>
                                  <td className="py-3 text-center font-mono">{s.count}</td>
                                  <td className="py-3 text-center font-mono text-emerald-400">{s.hasResults}</td>
                                  <td className="py-3 text-right font-mono text-red-400">{s.noResults}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Listings Performance */}
                    <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-bold font-mono uppercase tracking-widest text-white/50">
                          Template Performance
                        </h3>
                        <button 
                          onClick={handleExportListings}
                          className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" /> CSV
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-white/40 border-b border-white/10 pb-2">
                              <th className="pb-3 text-left">Template</th>
                              <th className="pb-3 text-center">Views</th>
                              <th className="pb-3 text-center">Orders</th>
                              <th className="pb-3 text-right">Conversion</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {stats.productPerformance.map(p => (
                              <tr key={p.id} className="hover:bg-white/[0.01]">
                                <td className="py-3 font-semibold text-white truncate max-w-[150px]">{p.title}</td>
                                <td className="py-3 text-center font-mono">{p.views}</td>
                                <td className="py-3 text-center font-mono">{p.orders}</td>
                                <td className="py-3 text-right font-mono text-purple-400">{p.conversion}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 🛍️ TAB 3: LISTINGS MANAGER (Reusing CRUD form!) */}
              {activeTab === 'listings' && (
                <div className="space-y-6">
                  {!isEditing ? (
                    <div className="space-y-4">
                      {/* Catalog Action Bar */}
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-semibold font-mono uppercase tracking-widest text-white/60">
                          My Uploaded Templates ({stats.productPerformance.length})
                        </h3>
                        <button
                          onClick={startAddNew}
                          className="bg-gradient-to-r from-primary-indigo via-primary-pink to-primary-orange hover:brightness-110 text-white font-bold py-2.5 px-4.5 rounded-2xl text-xs flex items-center gap-1.5 transition-all active:scale-97 cursor-pointer shadow-[0_4px_20px_rgba(61,90,254,0.35)] border border-white/20"
                        >
                          <Plus className="w-4 h-4" /> Add Product
                        </button>
                      </div>

                      {/* Products List Grid */}
                      <div className="space-y-3.5">
                        {stats.productPerformance.map((product) => (
                          <div
                            key={product.id}
                            className="bg-gradient-to-br from-white/[0.03] to-white/[0.005] hover:from-white/[0.04] hover:to-white/[0.01] border border-white/10 hover:border-purple-500/25 rounded-2xl p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4.5 transition-all duration-300 hover:shadow-xl hover:shadow-black/25 group"
                          >
                            <div className="flex items-center gap-4.5 min-w-0 flex-1">
                              <div className="w-14 h-14 bg-white/[0.03] border border-white/10 group-hover:border-purple-500/30 rounded-xl overflow-hidden shrink-0 flex items-center justify-center transition-all duration-300">
                                {propProducts.find(p => p.id === product.id)?.imageUrl ? (
                                  <img src={propProducts.find(p => p.id === product.id)?.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                                ) : (
                                  <Image className="w-6 h-6 text-white/30" />
                                )}
                              </div>
                              <div className="min-w-0 text-left">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-base font-extrabold text-white group-hover:text-purple-300 transition-colors truncate">{product.title}</h4>
                                  <span className="bg-purple-500/10 text-purple-300 text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded-full border border-purple-500/25 font-mono uppercase">
                                    {product.category}
                                  </span>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-white/40 text-[10.5px] mt-1.5 font-mono">
                                  <span className="text-white/60">Views: <strong className="text-white">{product.views}</strong></span>
                                  <span className="text-white/60">Sales: <strong className="text-white">{product.orders}</strong></span>
                                  <span className="text-white/60">Revenue: <strong className="text-emerald-400 font-bold">₹{product.revenue}</strong></span>
                                  <span className="text-white/60">Conv: <strong className="text-purple-400 font-bold">{product.conversion}%</strong></span>
                                </div>
                              </div>
                            </div>

                            {/* Price and Action Buttons */}
                            <div className="flex items-center gap-4 shrink-0 max-sm:w-full max-sm:justify-between">
                              <div className="text-left sm:text-right">
                                <div className="text-lg font-black text-emerald-400 font-mono">{product.price}</div>
                                <div className="text-[10px] text-white/40 font-mono">ID: {product.id}</div>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => startEdit(propProducts.find(p => p.id === product.id)!)}
                                  className="p-2.5 bg-white/5 hover:bg-purple-600/35 border border-white/10 hover:border-purple-500 text-white rounded-xl transition-all cursor-pointer"
                                  title="Edit Product"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(propProducts.find(p => p.id === product.id)!)}
                                  className="p-2.5 bg-white/5 hover:bg-red-600/35 border border-white/10 hover:border-red-500 text-white rounded-xl transition-all cursor-pointer"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSaveProduct} className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 space-y-4 text-left">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white cursor-pointer font-bold uppercase tracking-wider"
                        >
                          <ArrowLeft className="w-4 h-4" /> Back to Catalog
                        </button>
                        <h3 className="text-sm font-bold font-mono text-purple-400 uppercase tracking-widest">
                          {editingProduct ? 'Edit Digital Product' : 'Add New Product'}
                        </h3>
                      </div>

                      {/* Product ID & Price row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest font-mono text-white/60 mb-1.5">
                            Product ID (unique slug)
                          </label>
                          <input
                            type="text"
                            required
                            disabled={!!editingProduct}
                            value={prodId}
                            onChange={(e) => setProdId(e.target.value.toLowerCase().replace(/[^a-z0-9_-]+/g, ''))}
                            className="w-full bg-white/5 border border-white/10 focus:border-purple-400 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-white"
                            placeholder="e.g. proj-modern-portfolio"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest font-mono text-white/60 mb-1.5">
                            Price (₹ amount or string)
                          </label>
                          <input
                            type="text"
                            required
                            value={prodPrice}
                            onChange={(e) => setProdPrice(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 focus:border-purple-400 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors text-white"
                            placeholder="e.g. ₹999"
                          />
                        </div>
                      </div>

                      {/* Title & Category row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest font-mono text-white/60 mb-1.5">
                            Product Title
                          </label>
                          <input
                            type="text"
                            required
                            value={prodTitle}
                            onChange={(e) => setProdTitle(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 focus:border-purple-400 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors text-white"
                            placeholder="e.g. Modern Portfolio Website"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest font-mono text-white/60 mb-1.5">
                            Category
                          </label>
                          <select
                            value={prodCategory}
                            onChange={(e) => setProdCategory(e.target.value)}
                            className="w-full bg-zinc-900 border border-white/10 focus:border-purple-400 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors text-white"
                          >
                            <option value="Landing Page">Landing Page</option>
                            <option value="SaaS setup">SaaS Setup</option>
                            <option value="AI Interface">AI Interface</option>
                            <option value="E-Commerce">E-Commerce</option>
                            <option value="Portfolio">Portfolio</option>
                            <option value="Website">Website</option>
                          </select>
                        </div>
                      </div>

                      {/* Description & Version */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest font-mono text-white/60 mb-1.5">
                            Short Catalog Description
                          </label>
                          <input
                            type="text"
                            required
                            value={prodDescription}
                            onChange={(e) => setProdDescription(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 focus:border-purple-400 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors text-white"
                            placeholder="e.g. Beautiful one-page portfolio template with GSAP animations."
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest font-mono text-white/60 mb-1.5">
                            Version
                          </label>
                          <input
                            type="text"
                            value={prodVersion}
                            onChange={(e) => setProdVersion(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 focus:border-purple-400 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors text-white"
                            placeholder="e.g. v1.0.0"
                          />
                        </div>
                      </div>

                      {/* Detailed Long Description */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest font-mono text-white/60 mb-1.5">
                          Detailed Long Description (Product Detail Page)
                        </label>
                        <textarea
                          value={prodLongDescription}
                          onChange={(e) => setProdLongDescription(e.target.value)}
                          rows={3}
                          className="w-full bg-white/5 border border-white/10 focus:border-purple-400 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors font-sans resize-none text-white"
                          placeholder="Enter detailed Markdown or plain text description explaining features, stack and setup guide..."
                        />
                      </div>

                      {/* Image upload preview */}
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row gap-4.5 items-center">
                        <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
                          {prodImageUrl ? (
                            <img src={prodImageUrl} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <Image className="w-8 h-8 text-white/30" />
                          )}
                        </div>
                        <div className="flex-1 w-full text-left">
                          <label className="block text-xs font-bold uppercase tracking-widest font-mono text-purple-400 mb-1.5">
                            Product Image
                          </label>
                          
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="text"
                              value={prodImageUrl}
                              onChange={(e) => setProdImageUrl(e.target.value)}
                              className="flex-1 bg-white/5 border border-white/10 focus:border-purple-400 rounded-xl px-4 py-2.5 text-xs outline-none transition-colors text-white"
                              placeholder="Enter Image URL directly, or upload below..."
                            />
                            
                            <label className="bg-white/10 hover:bg-white/15 text-white font-bold py-2.5 px-4 rounded-xl text-xs cursor-pointer flex items-center justify-center shrink-0 border border-white/10">
                              Upload File
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                              />
                            </label>
                          </div>

                          {isUploadingImage && (
                            <div className="space-y-1.5 mt-2">
                              <div className="flex justify-between text-[10px] font-bold text-white/70">
                                <span>Uploading image...</span>
                                <span>{imageUploadProgress}%</span>
                              </div>
                              <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
                                <div className="bg-purple-500 h-full rounded-full" style={{ width: `${imageUploadProgress}%` }} />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Source code upload component */}
                      <ProductFileUpload
                        productId={prodId}
                        currentFileName={prodDownloadFile?.fileName}
                        currentFileSize={prodDownloadFile?.fileSize}
                        onUploadComplete={handleZipUploadComplete}
                        onUploadError={(e) => console.error("Upload error:", e)}
                      />

                      {/* Features List */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest font-mono text-white/60 mb-1.5">
                          Features (one per line)
                        </label>
                        <textarea
                          value={prodFeatures}
                          onChange={(e) => setProdFeatures(e.target.value)}
                          rows={3}
                          className="w-full bg-white/5 border border-white/10 focus:border-purple-400 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors font-sans resize-none text-white"
                          placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                        />
                      </div>

                      {/* Tags & Requirements */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest font-mono text-white/60 mb-1.5">
                            Tags (comma separated)
                          </label>
                          <input
                            type="text"
                            value={prodTags}
                            onChange={(e) => setProdTags(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 focus:border-purple-400 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors text-white"
                            placeholder="e.g. React, TypeScript, Firebase"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest font-mono text-white/60 mb-1.5">
                            System Requirements
                          </label>
                          <input
                            type="text"
                            value={prodSystemRequirements}
                            onChange={(e) => setProdSystemRequirements(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 focus:border-purple-400 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors text-white"
                            placeholder="e.g. Node.js >= 18, VS Code"
                          />
                        </div>
                      </div>

                      {/* Footer Buttons */}
                      <div className="border-t border-white/10 pt-4 flex justify-end gap-3.5">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-5 py-3 border border-white/10 hover:bg-white/5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="px-6 py-3 bg-gradient-to-r from-primary-indigo via-primary-pink to-primary-orange hover:brightness-110 text-white font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-[0_4px_20px_rgba(61,90,254,0.35)] border border-white/20 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isSaving ? <>Saving...</> : <><Save className="w-4 h-4" /> Save Product</>}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* 🧾 TAB 4: DETAILED ORDERS LIST */}
              {activeTab === 'orders' && (
                <div className="space-y-6 text-left">
                  {/* Action row */}
                  <div className="flex justify-between items-center gap-4 flex-wrap">
                    {/* Search box */}
                    <div className="relative w-full sm:w-[280px]">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                        <Search className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        placeholder="Search orders..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 focus:border-purple-500/60 rounded-2xl pl-10 pr-4 py-2.5 text-xs outline-none transition-all text-white focus:ring-1 focus:ring-purple-500/30"
                      />
                    </div>

                    <button 
                      onClick={handleExportOrders}
                      className="bg-gradient-to-r from-primary-indigo via-primary-pink to-primary-orange hover:brightness-110 text-white font-bold py-2.5 px-4.5 rounded-2xl text-xs flex items-center gap-1.5 transition-all active:scale-97 cursor-pointer shadow-[0_4px_20px_rgba(61,90,254,0.35)] border border-white/20"
                    >
                      <Download className="w-3.5 h-3.5" /> Export Orders CSV
                    </button>
                  </div>

                  {/* Orders Table — shows ALL orders in the selected period (no cap) */}
                  <div className="border border-white/10 rounded-3xl bg-gradient-to-br from-white/[0.02] to-white/[0.005] overflow-x-auto shadow-xl">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/[0.03] text-[10px] text-white/40 font-mono font-bold uppercase tracking-widest">
                          <th className="p-4.5 pl-6">Order ID / Tx ID</th>
                          <th className="p-4.5">Customer</th>
                          <th className="p-4.5">Template Product</th>
                          <th className="p-4.5">Purchased Date</th>
                          <th className="p-4.5">Status</th>
                          <th className="p-4.5 pr-6 text-right">Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {stats.allOrders.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-white/30 text-xs font-mono">
                              No orders yet.
                            </td>
                          </tr>
                        ) : (
                          stats.allOrders
                            .filter(o =>
                              o.productTitle.toLowerCase().includes(orderSearch.toLowerCase()) ||
                              o.customerEmail.toLowerCase().includes(orderSearch.toLowerCase()) ||
                              o.id.toLowerCase().includes(orderSearch.toLowerCase())
                            )
                            .map((order) => (
                              <tr key={order.id} className="hover:bg-white/[0.03] transition-all duration-200 text-white/80">
                                <td className="p-4.5 pl-6 font-mono text-purple-300 font-bold">{order.id}</td>
                                <td className="p-4.5 text-left">
                                  <div className="font-extrabold text-white">{order.customerName}</div>
                                  <div className="text-[10px] text-white/40 mt-0.5 font-mono">{order.customerEmail}</div>
                                </td>
                                <td className="p-4.5 font-extrabold text-white">{order.productTitle}</td>
                                <td className="p-4.5 font-mono text-white/50">
                                  {new Date(order.date).toLocaleDateString()} {new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </td>
                                <td className="p-4.5">
                                  <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wider font-mono">
                                    {order.status}
                                  </span>
                                </td>
                                <td className="p-4.5 pr-6 text-right font-black text-emerald-400 font-mono text-sm">₹{order.amount}</td>
                              </tr>
                            ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 👥 TAB 5: CUSTOMERS LIST */}
              {activeTab === 'customers' && (
                <div className="space-y-6 text-left">
                  <div className="relative w-full sm:w-[280px]">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                      <Search className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="Search customers..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 focus:border-purple-500/60 rounded-2xl pl-10 pr-4 py-2.5 text-xs outline-none transition-all text-white focus:ring-1 focus:ring-purple-500/30"
                    />
                  </div>

                  {/* Customers Table */}
                  <div className="border border-white/10 rounded-3xl bg-gradient-to-br from-white/[0.02] to-white/[0.005] overflow-x-auto shadow-xl">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/[0.03] text-[10px] text-white/40 font-mono font-bold uppercase tracking-widest">
                          <th className="p-4.5 pl-6">Client Name</th>
                          <th className="p-4.5">Role</th>
                          <th className="p-4.5">Registration Date</th>
                          <th className="p-4.5 text-center">Purchases Count</th>
                          <th className="p-4.5 pr-6 text-right">Total Spent</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {allCustomers
                          .filter(c => 
                            c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                            c.email.toLowerCase().includes(customerSearch.toLowerCase())
                          )
                          .map((client) => (
                            <tr key={client.id} className="hover:bg-white/[0.03] transition-all duration-200 text-white/80">
                              <td className="p-4.5 pl-6 text-left">
                                <div className="font-extrabold text-white">{client.name}</div>
                                <div className="text-[10px] text-white/40 mt-0.5 font-mono">{client.email}</div>
                              </td>
                              <td className="p-4.5">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider font-mono ${
                                  client.role === 'admin' 
                                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                                    : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                                }`}>
                                  {client.role}
                                </span>
                              </td>
                              <td className="p-4.5 text-white/60 font-mono">
                                {client.createdAt ? client.createdAt.toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="p-4.5 text-center font-mono font-bold text-purple-400 text-sm">
                                {client.orderCount}
                              </td>
                              <td className="p-4.5 pr-6 text-right font-black text-emerald-400 font-mono text-sm">
                                ₹{client.totalSpent}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ⚙️ TAB 6: SETTINGS VIEW */}
              {activeTab === 'settings' && (
                <div className="max-w-[600px] text-left space-y-6">
                  <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 space-y-5">
                    <h3 className="text-sm font-bold font-mono uppercase tracking-widest text-white/50 border-b border-white/10 pb-3">
                      Data Export Operations
                    </h3>
                    
                    <div className="space-y-4 text-xs leading-relaxed">
                      <p className="text-white/60">
                        Export specific datasets as CSV files for spreadsheet analytics. Downloads include transaction lists, earnings reports, and product telemetry metrics.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <button
                          onClick={handleExportOrders}
                          className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                        >
                          <Download className="w-4 h-4 text-purple-400" /> Export Orders List
                        </button>
                        <button
                          onClick={handleExportListings}
                          className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                        >
                          <Download className="w-4 h-4 text-pink-400" /> Export Listings Performance
                        </button>
                        <button
                          onClick={handleClearAnalytics}
                          disabled={isPurgingEvents}
                          className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors sm:col-span-2 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" /> {isPurgingEvents ? "Purging Test Analytics..." : "Clear Test Analytics Events"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 space-y-4">
                    <h3 className="text-sm font-bold font-mono uppercase tracking-widest text-white/50 border-b border-white/10 pb-3">
                      Console Information
                    </h3>
                    
                    <div className="space-y-3.5 text-xs">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-white/40">Connected database:</span>
                        <span className="font-mono text-purple-400">Google Cloud Firestore (live)</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-white/40">Secure file storage:</span>
                        <span className="font-mono text-pink-400">Firebase Storage bucket</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-white/40">Last aggregation time:</span>
                        <span className="font-mono text-white/80">{lastUpdated.toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
