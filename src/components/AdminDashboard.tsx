import React, { useState } from 'react';
import { 
  X, DollarSign, ShoppingCart, Users, Terminal, Plus, Edit2, 
  Trash2, Image, FileArchive, ArrowLeft, Save
} from 'lucide-react';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { uploadProductImage, deleteProductFile } from '@/features/digitalProducts/services/productFileService';
import { formatBytes } from '@/features/digitalProducts/utils/downloadUtils';
import ProductFileUpload from '@/features/digitalProducts/components/ProductFileUpload';
import type { DigitalProduct, DownloadFileMetadata, TechStackCategory } from '@/features/digitalProducts/types/digitalProduct';

interface Transaction {
  id: string;
  userEmail: string;
  userName: string;
  projectTitle: string;
  amount: number;
  date: string;
}

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  products: DigitalProduct[];
}

export default function AdminDashboard({ isOpen, onClose, transactions, products }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'transactions' | 'products'>('transactions');
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DigitalProduct | null>(null);
  
  // Form fields
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
  const [prodSystemRequirements, setProdSystemRequirements] = useState('Modern browser, internet connection');
  const [prodPreviewUrl, setProdPreviewUrl] = useState('');
  
  const [prodDownloadFile, setProdDownloadFile] = useState<DownloadFileMetadata | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Tech stack editor
  const [techStackCategories, setTechStackCategories] = useState<TechStackCategory[]>([
    { category: 'Frontend', color: '#a78bfa', items: ['React', 'TypeScript', 'Tailwind CSS'] }
  ]);

  if (!isOpen) return null;

  // Calculate statistics
  const totalRevenue = transactions.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPurchases = transactions.length;
  const uniqueUsers = new Set(transactions.map(t => t.userEmail)).size;

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

    // If editing and zip was replaced, delete old zip from storage safely
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
        downloadFile: prodDownloadFile || undefined,
        updatedAt: serverTimestamp()
      };

      if (!editingProduct) {
        productDoc.createdAt = serverTimestamp();
      } else {
        productDoc.createdAt = editingProduct.createdAt || serverTimestamp();
      }

      await setDoc(doc(db, 'products', prodId), productDoc);
      setIsEditing(false);
    } catch (error: any) {
      console.error("Save product error:", error);
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
      if (product.downloadFile?.storagePath) {
        await deleteProductFile(product.downloadFile.storagePath);
      }
    } catch (error: any) {
      alert("Error deleting product: " + error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/75 backdrop-blur-md text-white">
      <div className="relative w-full max-w-[900px] bg-white/[0.05] border-[2px] border-white/20 rounded-[36px] p-8 shadow-[0_0_32px_rgba(0,0,0,0.4)] backdrop-blur-[32px] overflow-hidden max-h-[85vh] flex flex-col">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-8 top-8 text-white/50 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Title */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 text-purple-400">
              <Terminal className="w-5 h-5" />
              <span className="font-mono text-xs uppercase tracking-widest font-semibold">System Dashboard</span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-1">Admin Panel — CodeBazaar</h2>
            <p className="text-sm text-white/60">Overview of purchases, users, and product catalog</p>
          </div>

          {/* Tab buttons */}
          {!isEditing && (
            <div className="flex bg-white/5 border border-white/10 rounded-full p-1 self-start shrink-0">
              <button
                onClick={() => setActiveTab('transactions')}
                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition-colors cursor-pointer ${
                  activeTab === 'transactions' ? 'bg-purple-600 text-white shadow' : 'text-white/60 hover:text-white'
                }`}
              >
                Sales
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition-colors cursor-pointer ${
                  activeTab === 'products' ? 'bg-purple-600 text-white shadow' : 'text-white/60 hover:text-white'
                }`}
              >
                Products
              </button>
            </div>
          )}
        </div>

        {/* Tab 1: Transactions */}
        {!isEditing && activeTab === 'transactions' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
              {/* Revenue */}
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center justify-center text-green-400">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-white/50 uppercase tracking-wider">Total Revenue</p>
                  <h3 className="text-xl font-bold text-white mt-0.5">₹{totalRevenue}</h3>
                </div>
              </div>

              {/* Sales */}
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500/20 border border-purple-500/30 rounded-xl flex items-center justify-center text-purple-400">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-white/50 uppercase tracking-wider">Total Purchases</p>
                  <h3 className="text-xl font-bold text-white mt-0.5">{totalPurchases}</h3>
                </div>
              </div>

              {/* Customers */}
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center text-blue-400">
                  <Users className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-white/50 uppercase tracking-wider">Unique Customers</p>
                  <h3 className="text-xl font-bold text-white mt-0.5">{uniqueUsers}</h3>
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="flex-1 overflow-y-auto border border-white/10 rounded-2xl bg-white/[0.02] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03] text-white/70 text-xs font-semibold uppercase tracking-wider">
                    <th className="p-4 pl-6">Customer</th>
                    <th className="p-4">Project Purchased</th>
                    <th className="p-4">Transaction ID</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 pr-6 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-white/40">
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors text-white/80">
                        <td className="p-4 pl-6 text-left">
                          <div className="font-medium text-white">{tx.userName}</div>
                          <div className="text-xs text-white/40">{tx.userEmail}</div>
                        </td>
                        <td className="p-4 text-left font-medium">{tx.projectTitle}</td>
                        <td className="p-4 text-left font-mono text-xs text-purple-300/80">{tx.id}</td>
                        <td className="p-4 text-left text-xs text-white/60">
                          {new Date(tx.date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="p-4 pr-6 text-right font-semibold text-green-400">₹{tx.amount}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Tab 2: Products Manager Catalog */}
        {!isEditing && activeTab === 'products' && (
          <div className="flex-1 flex flex-col gap-4 overflow-hidden min-h-0">
            {/* Catalog Action Bar */}
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold font-mono uppercase tracking-widest text-white/60">
                Templates Catalog ({products.length})
              </h3>
              <button
                onClick={startAddNew}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-purple-900/25"
              >
                <Plus className="w-4 h-4" /> Add Digital Product
              </button>
            </div>

            {/* Products List Grid */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
              {products.length === 0 ? (
                <div className="p-12 text-center text-white/40 border border-white/10 border-dashed rounded-2xl bg-white/[0.01]">
                  No products registered. Click Add Product to get started.
                </div>
              ) : (
                products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 rounded-2xl p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4.5 transition-all group"
                  >
                    {/* Thumbnail & Title info */}
                    <div className="flex items-center gap-4.5 min-w-0 flex-1">
                      <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                          <Image className="w-6 h-6 text-white/30" />
                        )}
                      </div>
                      <div className="min-w-0 text-left">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-white truncate">{product.title}</h4>
                          <span className="bg-purple-500/10 text-purple-300 text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded-full border border-purple-500/25 font-mono uppercase">
                            {product.category}
                          </span>
                        </div>
                        <p className="text-xs text-white/50 mt-1 truncate">{product.description}</p>
                        
                        {/* ZIP File details */}
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-white/40 mt-1.5">
                          <FileArchive className="w-3.5 h-3.5" />
                          {product.downloadFile ? (
                            <span className="text-emerald-400">
                              {product.downloadFile.fileName} ({formatBytes(product.downloadFile.fileSize)})
                            </span>
                          ) : (
                            <span className="text-red-400/80">No source ZIP uploaded</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Price and Action Buttons */}
                    <div className="flex items-center gap-4 shrink-0 max-sm:w-full max-sm:justify-between">
                      <div className="text-left sm:text-right">
                        <div className="text-lg font-black text-white">{product.price}</div>
                        <div className="text-[10px] text-white/40 font-mono">ID: {product.id}</div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(product)}
                          className="p-2.5 bg-white/5 hover:bg-purple-600/35 border border-white/10 hover:border-purple-500 text-white rounded-xl transition-all cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product)}
                          className="p-2.5 bg-white/5 hover:bg-red-600/35 border border-white/10 hover:border-red-500 text-white rounded-xl transition-all cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Create / Edit Product Form */}
        {isEditing && (
          <form onSubmit={handleSaveProduct} className="flex-1 overflow-hidden flex flex-col gap-4 min-h-0 text-left">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white cursor-pointer font-bold uppercase tracking-wider"
              >
                <ArrowLeft className="w-4 h-4" /> Back to List
              </button>
              <h3 className="text-sm font-bold font-mono text-purple-400 uppercase tracking-widest">
                {editingProduct ? 'Edit Digital Product' : 'Add New Product'}
              </h3>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
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
                    className="w-full bg-white/5 border border-white/10 focus:border-purple-400 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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
                    className="w-full bg-white/5 border border-white/10 focus:border-purple-400 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
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
                    className="w-full bg-white/5 border border-white/10 focus:border-purple-400 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
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

              {/* Tag array input & Version */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest font-mono text-white/60 mb-1.5">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={prodTags}
                    onChange={(e) => setProdTags(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 focus:border-purple-400 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
                    placeholder="e.g. React, TypeScript, Firebase"
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
                    className="w-full bg-white/5 border border-white/10 focus:border-purple-400 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
                    placeholder="e.g. v1.0.0"
                  />
                </div>
              </div>

              {/* Descriptions block */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest font-mono text-white/60 mb-1.5">
                  Short Catalog Description
                </label>
                <input
                  type="text"
                  required
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-purple-400 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
                  placeholder="e.g. Beautiful one-page portfolio template with GSAP animations."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest font-mono text-white/60 mb-1.5">
                  Detailed Long Description (Product Detail Page)
                </label>
                <textarea
                  value={prodLongDescription}
                  onChange={(e) => setProdLongDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 focus:border-purple-400 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors font-sans resize-none"
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
                      className="flex-1 bg-white/5 border border-white/10 focus:border-purple-400 rounded-xl px-4 py-2.5 text-xs outline-none transition-colors"
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
                  className="w-full bg-white/5 border border-white/10 focus:border-purple-400 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors font-sans resize-none"
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                />
              </div>

              {/* System Requirements & Demo Sandbox URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest font-mono text-white/60 mb-1.5">
                    System Requirements
                  </label>
                  <input
                    type="text"
                    value={prodSystemRequirements}
                    onChange={(e) => setProdSystemRequirements(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 focus:border-purple-400 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
                    placeholder="e.g. Node.js >= 18, VS Code"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest font-mono text-white/60 mb-1.5">
                    Sandbox Demo URL (optional override)
                  </label>
                  <input
                    type="text"
                    value={prodPreviewUrl}
                    onChange={(e) => setProdPreviewUrl(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 focus:border-purple-400 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
                    placeholder="e.g. https://demo.codebazaar.dev"
                  />
                </div>
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="border-t border-white/10 pt-4 flex justify-end gap-3.5 shrink-0">
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
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-purple-900/25 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>Saving Product...</>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Product
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
