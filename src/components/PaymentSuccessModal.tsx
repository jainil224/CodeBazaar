import PurchaseReceiptModal, { type PurchaseReceiptData } from './PurchaseReceiptModal';

interface PaymentSuccessModalProps {
  isOpen: boolean;
  projectTitle: string;
  projectId?: string;
  paymentId: string;
  amount: number;
  projectImage?: string;
  projectCategory?: string;
  buyerName?: string;
  buyerEmail?: string;
  onClose: () => void;
  onDownload: () => void;
}

export default function PaymentSuccessModal({
  isOpen,
  projectTitle,
  projectId = 'custom',
  paymentId,
  amount,
  projectImage,
  projectCategory,
  buyerName,
  buyerEmail,
  onClose,
  onDownload,
}: PaymentSuccessModalProps) {
  const receiptData: PurchaseReceiptData = {
    projectId,
    projectTitle,
    paymentId,
    amount,
    projectImage,
    projectCategory,
    buyerName,
    buyerEmail,
  };

  return (
    <PurchaseReceiptModal
      isOpen={isOpen}
      onClose={onClose}
      onDownloadCode={onDownload}
      receiptData={receiptData}
      autoPlayStages={true}
    />
  );
}
