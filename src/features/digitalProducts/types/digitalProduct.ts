export interface DownloadFileMetadata {
  fileName: string;
  storagePath: string;
  fileType: string;
  fileSize: number;
}

export interface HighlightItem {
  icon: string; // Stored as a string name (e.g. "Layers") to be database-friendly
  label: string;
  value: string;
  color: string;
}

export interface TechStackCategory {
  category: string;
  color: string;
  items: string[];
}

export interface DigitalProductDetail {
  id: string;
  title: string;
  price: string;
  description: string;
  longDescription: string;
  imageUrl: string;
  tags: string[];
  techStack: TechStackCategory[];
  features: string[];
  highlights: HighlightItem[];
  thumbnails?: string[];
  postedTime?: string;
  systemRequirements?: string;
  previewUrl?: string;
}

export interface DigitalProduct {
  id: string;
  title: string;
  description: string;
  tags: string[];
  price: string; // e.g. "₹50" or "₹999"
  category: string;
  version: string;
  imageUrl?: string;
  glassMediaBg?: string;
  glassAccentBg?: string;
  glassTagBg?: string;
  detail: DigitalProductDetail;
  downloadFile?: DownloadFileMetadata;
  createdAt?: any;
  updatedAt?: any;
}

export interface PurchaseRecord {
  id?: string;
  userId: string;
  productId: string;
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: 'paid' | 'unpaid';
  purchasedAt: any;
}
