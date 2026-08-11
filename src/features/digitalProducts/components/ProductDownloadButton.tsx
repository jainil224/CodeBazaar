import { useState, useEffect } from 'react';
import { auth, db } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { subscribeToPurchase } from '../services/purchaseService';
import { downloadProductBlob } from '../services/productFileService';
import { doc, getDoc } from 'firebase/firestore';
import { Download, ShoppingBag, Loader2, AlertCircle } from 'lucide-react';
import { formatBytes } from '../utils/downloadUtils';

interface ProductDownloadButtonProps {
  productId: string;
  price: string;
  productTitle: string;
  onPurchase: () => void;
  className?: string;
}

export default function ProductDownloadButton({
  productId,
  price,
  productTitle,
  onPurchase,
  className = '',
}: ProductDownloadButtonProps) {
  const [user, setUser] = useState(auth.currentUser);
  const [purchaseStatus, setPurchaseStatus] = useState<'checking' | 'not-purchased' | 'purchased' | 'error'>('checking');
  const [downloadState, setDownloadState] = useState<'idle' | 'preparing' | 'downloading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [fileMeta, setFileMeta] = useState<{ fileName: string; fileSize: number } | null>(null);

  // 1. Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setPurchaseStatus('not-purchased');
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Listen to Firestore Purchase status in real time
  useEffect(() => {
    if (!user) {
      setPurchaseStatus('not-purchased');
      return;
    }

    setPurchaseStatus('checking');
    const unsubscribe = subscribeToPurchase(user.uid, productId, (purchase) => {
      if (purchase && purchase.status === 'paid') {
        setPurchaseStatus('purchased');
        fetchFileMeta();
      } else {
        setPurchaseStatus('not-purchased');
      }
    });

    return () => unsubscribe();
  }, [user, productId]);

  const fetchFileMeta = async () => {
    try {
      const productSnap = await getDoc(doc(db, 'products', productId));
      if (productSnap.exists()) {
        const data = productSnap.data();
        if (data.downloadFile) {
          setFileMeta({
            fileName: data.downloadFile.fileName,
            fileSize: data.downloadFile.fileSize,
          });
        }
      }
    } catch (e) {
      console.warn("Could not load file metadata:", e);
    }
  };

  const handleDownload = async () => {
    if (!user) {
      alert("You must be logged in to download this product.");
      return;
    }

    try {
      setDownloadState('preparing');
      setErrorMessage('');

      // 1. Fetch product file details from Firestore
      const productSnap = await getDoc(doc(db, 'products', productId));
      if (!productSnap.exists()) {
        throw new Error("Product not found in database.");
      }

      const productData = productSnap.data();
      const downloadFile = productData.downloadFile;
      if (!downloadFile || !downloadFile.storagePath) {
        throw new Error("storage/missing-file");
      }

      setDownloadState('downloading');

      // 2. Direct Blob download from Firebase Storage
      const blob = await downloadProductBlob(downloadFile.storagePath);

      // 3. Trigger Browser Download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadFile.fileName || `${productTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setDownloadState('idle');
    } catch (error: any) {
      console.error("Secure download error:", error);
      let friendlyError = "Download failed. Please try again.";
      if (error.code === 'storage/unauthorized') {
        friendlyError = "You do not have permission to download this file.";
      } else if (error.message === 'storage/missing-file') {
        friendlyError = "The product file is currently unavailable.";
      } else if (error.code === 'storage/retry-limit-exceeded' || error.message?.includes('network')) {
        friendlyError = "Network error. Download failed. Please try again.";
      }

      setErrorMessage(friendlyError);
      setDownloadState('error');
    }
  };

  const getButtonText = () => {
    if (downloadState === 'preparing') return 'Preparing download...';
    if (downloadState === 'downloading') return 'Downloading...';
    if (downloadState === 'error') return 'Try Again';

    if (purchaseStatus === 'checking') return 'Checking access...';
    if (purchaseStatus === 'purchased') return 'Download ZIP';
    return `Buy Now • ${price}`;
  };

  const getButtonIcon = () => {
    if (downloadState === 'preparing' || downloadState === 'downloading' || purchaseStatus === 'checking') {
      return <Loader2 className="w-4 h-4 animate-spin text-white/70" />;
    }
    if (downloadState === 'error') {
      return <AlertCircle className="w-4 h-4 text-red-200" />;
    }
    if (purchaseStatus === 'purchased') {
      return <Download className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition-transform" />;
    }
    return <ShoppingBag className="w-4 h-4 text-violet-200 group-hover:scale-110 transition-transform" />;
  };

  return (
    <div className="flex flex-col gap-2 w-full text-slate-800">
      <button
        onClick={purchaseStatus === 'purchased' ? handleDownload : onPurchase}
        disabled={purchaseStatus === 'checking' || downloadState === 'preparing' || downloadState === 'downloading'}
        className={`w-full py-3.5 px-6 rounded-2xl font-bold flex items-center justify-center gap-2.5 text-sm transition-all duration-300 group cursor-pointer shadow-lg disabled:opacity-60 disabled:cursor-not-allowed ${
          purchaseStatus === 'purchased'
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-950/20'
            : 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-950/20'
        } ${className}`}
      >
        {getButtonIcon()}
        <span>{getButtonText()}</span>
      </button>

      {/* Show file details if purchased */}
      {purchaseStatus === 'purchased' && fileMeta && (
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-500 font-medium">
          <span className="truncate max-w-[200px]" title={fileMeta.fileName}>
            File: {fileMeta.fileName}
          </span>
          <span>Size: {formatBytes(fileMeta.fileSize)}</span>
        </div>
      )}

      {/* Show Error Message */}
      {errorMessage && (
        <p className="text-xs font-semibold text-red-500 text-center mt-1 flex items-center justify-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {errorMessage}
        </p>
      )}
    </div>
  );
}
