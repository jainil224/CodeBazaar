import { db } from '@/firebase';
import { doc, setDoc, collection, query, where, getDocs, serverTimestamp, onSnapshot } from 'firebase/firestore';
import type { PurchaseRecord } from '../types/digitalProduct';

/**
 * Creates a purchase record in Firestore at purchases/{userId_productId}.
 * Storing status as 'paid'.
 */
export async function createPurchaseRecord(
  userId: string,
  productId: string,
  paymentId: string,
  orderId: string,
  amount: number,
  currency = 'INR'
): Promise<void> {
  const purchaseId = `${userId}_${productId}`;
  const purchaseDoc: PurchaseRecord = {
    userId,
    productId,
    paymentId,
    orderId,
    amount,
    currency,
    status: 'paid',
    purchasedAt: serverTimestamp()
  };

  await setDoc(doc(db, 'purchases', purchaseId), purchaseDoc);
}

/**
 * Subscribes to real-time changes of a single purchase document.
 */
export function subscribeToPurchase(
  userId: string,
  productId: string,
  onUpdate: (purchase: PurchaseRecord | null) => void
): () => void {
  const purchaseId = `${userId}_${productId}`;
  return onSnapshot(
    doc(db, 'purchases', purchaseId),
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate({ id: docSnap.id, ...docSnap.data() } as PurchaseRecord);
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      console.warn("Purchase subscription error:", err);
      onUpdate(null);
    }
  );
}

/**
 * Retrieves all paid purchases for a specific user.
 */
export async function getUserPurchases(userId: string): Promise<PurchaseRecord[]> {
  const purchasesRef = collection(db, 'purchases');
  const q = query(purchasesRef, where('userId', '==', userId), where('status', '==', 'paid'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data()
  })) as PurchaseRecord[];
}
