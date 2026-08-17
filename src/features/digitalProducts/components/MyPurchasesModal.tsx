import { useState, useEffect } from 'react';
import { auth } from '@/firebase';
import { getUserPurchases } from '../services/purchaseService';
import type { PurchaseRecord, DigitalProduct } from '../types/digitalProduct';
import { X, Calendar, Package, ExternalLink, ShieldAlert, Receipt } from 'lucide-react';
import ProductDownloadButton from './ProductDownloadButton';
import PurchaseReceiptModal, { type PurchaseReceiptData } from '@/components/PurchaseReceiptModal';

interface MyPurchasesModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: DigitalProduct[];
}

export default function MyPurchasesModal({
  isOpen,
  onClose,
  products,
}: MyPurchasesModalProps) {
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<PurchaseReceiptData | null>(null);

  useEffect(() => {
    if (!isOpen || !auth.currentUser) return;

    const loadPurchases = async () => {
      setIsLoading(true);
      try {
        const records = await getUserPurchases(auth.currentUser!.uid);
        // Sort by purchase date descending
        records.sort((a, b) => {
          const aTime = a.purchasedAt?.seconds || new Date(a.purchasedAt).getTime() / 1000 || 0;
          const bTime = b.purchasedAt?.seconds || new Date(b.purchasedAt).getTime() / 1000 || 0;
          return bTime - aTime;
        });
        setPurchases(records);
      } catch (error) {
        console.error("Failed to load user purchases:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPurchases();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/75 backdrop-blur-md text-slate-800">
        <div className="relative w-full max-w-[800px] bg-zinc-950 border-[2px] border-white/10 rounded-[36px] p-8 shadow-[0_0_32px_rgba(0,0,0,0.5)] backdrop-blur-[32px] overflow-hidden max-h-[85vh] flex flex-col text-white">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-8 top-8 text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Title */}
          <div className="mb-8">
            <div className="flex items-center gap-2.5 text-purple-400">
              <Package className="w-5 h-5" />
              <span className="font-mono text-xs uppercase tracking-widest font-semibold">User Dashboard</span>
            </div>
            <h2 className="text-2xl font-bold mt-1">My Purchased Templates</h2>
            <p className="text-sm text-white/60">Access files, view receipt prints and download PDF receipts</p>
          </div>

          {/* Content list */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-6 [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
                <span className="text-sm text-white/50 font-medium">Retrieving licenses...</span>
              </div>
            ) : purchases.length === 0 ? (
              <div className="py-20 text-center border border-white/5 bg-white/[0.01] rounded-2xl flex flex-col items-center justify-center p-6 gap-2">
                <ShieldAlert className="w-10 h-10 text-white/20" />
                <h4 className="text-white/80 font-bold">No purchases found</h4>
                <p className="text-sm text-white/40 max-w-[320px]">
                  You haven't purchased any project source code yet. Head back to the store to explore templates!
                </p>
              </div>
            ) : (
              purchases.map((purchase) => {
                const product = products.find((p) => p.id === purchase.productId);
                const purchaseDateObj = purchase.purchasedAt
                  ? new Date(
                      purchase.purchasedAt.seconds
                        ? purchase.purchasedAt.seconds * 1000
                        : purchase.purchasedAt
                    )
                  : null;

                const formattedDate = purchaseDateObj
                  ? purchaseDateObj.toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Recent';

                const formattedTime = purchaseDateObj
                  ? purchaseDateObj.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : undefined;

                return (
                  <div
                    key={purchase.id || purchase.paymentId}
                    className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:border-white/20 transition-all group"
                  >
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[9px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded-full">
                          {product?.category || 'Template'}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                        {product?.title || purchase.productId}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-white/50 mt-2 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-white/40" />
                          Purchased: {formattedDate}
                        </span>
                        <span className="flex items-center">
                          Price: ₹{purchase.amount}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="w-full sm:w-[220px] flex flex-col gap-2 shrink-0">
                      <ProductDownloadButton
                        productId={purchase.productId}
                        price={`₹${purchase.amount}`}
                        productTitle={product?.title || purchase.productId}
                        onPurchase={() => {}}
                      />

                      <div className="grid grid-cols-2 gap-2">
                        {/* View Printed Receipt & PDF */}
                        <button
                          onClick={() => {
                            setSelectedReceipt({
                              projectId: purchase.productId,
                              projectTitle: product?.title || purchase.productId,
                              projectCategory: product?.category,
                              projectImage: product?.imageUrl || product?.detail?.imageUrl,
                              paymentId: purchase.paymentId,
                              orderId: purchase.orderId,
                              amount: purchase.amount,
                              buyerName: auth.currentUser?.displayName || 'Licensed Customer',
                              buyerEmail: auth.currentUser?.email || undefined,
                              date: formattedDate,
                              time: formattedTime,
                            });
                          }}
                          className="py-2 border border-purple-500/20 hover:border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5 text-purple-400" />
                          <span>Receipt</span>
                        </button>
                        
                        {/* Demo Sandbox Link */}
                        {product ? (
                          <button
                            onClick={() => window.open(`?project=${product.id}`, '_blank')}
                            className="py-2 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Demo</span>
                          </button>
                        ) : (
                          <div />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Reusable Receipt Modal */}
      {selectedReceipt && (
        <PurchaseReceiptModal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          receiptData={selectedReceipt}
          autoPlayStages={true}
        />
      )}
    </>
  );
}
