
export interface Product {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  price: number;
  costPrice?: number; // Purchase/Acquisition Price
  category: string;
  image: string;
  gallery: string[];
  specs: Record<string, string>;
  inclusions?: string[];
  rating: number;
  reviews: number;
  features: string[];
  commissionType?: 'fixed' | 'percentage';
  commissionValue?: number;
  // Inventory Fields
  sku?: string;
  stock?: number;
  minStockLevel?: number; // For low stock alerts
  // Discount Fields
  bulkDiscounts?: {
    minQty: number;
    percentage: number;
  }[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  username: string;
  password?: string; // Optional for display, required for auth
  firstName: string;
  lastName: string;
  name: string; // Combined name for legacy compatibility
  email: string;
  mobile: string;
  joinDate?: string;
  role?: 'customer';
}

export interface Affiliate {
  id: string;
  name: string;
  email: string;
  walletBalance: number;
  totalSales: number;
  joinDate: string;
  status?: 'active' | 'inactive' | 'banned';
  clicks?: number;
  lifetimeEarnings?: number;
  // Extended Profile Fields
  username?: string;
  password?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  birthDate?: string;
  gender?: 'Male' | 'Female';
  mobile?: string;
  address?: string;
  agencyName?: string;
  govtId?: string;
  // Payment Settings
  gcashName?: string;
  gcashNumber?: string;
}

export interface ShippingDetails {
  firstName: string;
  lastName: string;
  mobile: string;
  street: string;
  province: string;
  city: string;
  barangay: string;
  zipCode: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customer: string;
  date: string;
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Pending';
  items: number;
  orderItems?: OrderItem[]; // Detailed list of items purchased
  referralId?: string; // The affiliate ID who referred this order
  commission?: number; // The amount earned by the affiliate
  paymentMethod?: string;
  proofOfPayment?: string; // Base64 string or URL of the receipt
  shippingDetails?: ShippingDetails;
  shippingFee?: number;
  courier?: string;
  trackingNumber?: string;
}

export interface PayoutRequest {
  id: string;
  affiliateId: string;
  affiliateName: string;
  amount: number;
  method: 'GCash' | 'Bank Transfer';
  accountName: string;
  accountNumber: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  dateRequested: string;
  dateProcessed?: string;
}

// --- Shipping Interfaces ---
export interface Courier {
  id: string;
  name: string;
  trackingUrl: string; // URL template (e.g., https://track.jnt.com?no={TRACKING})
  status: 'active' | 'inactive';
}

export interface ShippingZone {
  name: string; // e.g., Metro Manila, Luzon, Visayas, Mindanao
  fee: number;
  days: string; // e.g., "1-3 Days"
}

export interface ShippingSettings {
  enabled: boolean;
  baseFee: number;
  freeThreshold: number; // 0 to disable
  calculationType: 'flat' | 'zone';
  zones: ShippingZone[];
  couriers: Courier[];
}

export interface LandingPageSettings {
  hero: {
    titlePrefix: string;
    titleHighlight: string;
    titleSuffix: string;
    subtitle: string;
    btnPrimary: string;
    btnSecondary: string;
    heroImage: string;
  };
  features: {
    title: string;
    subtitle: string;
  };
  testimonials: {
    title: string;
    subtitle: string;
  };
  cta: {
    title: string;
    subtitle: string;
    btnText: string;
  };
  shipping: ShippingSettings;
}

export interface PaymentSettings {
  cod: {
    enabled: boolean;
  };
  gcash: {
    enabled: boolean;
    accountName: string;
    accountNumber: string;
    qrImage: string;
  };
  bank: {
    enabled: boolean;
    bankName: string;
    accountName: string;
    accountNumber: string;
  };
}

export interface EmailTemplate {
  subject: string;
  body: string;
  enabled: boolean;
}

export interface SMTPSettings {
  enabled: boolean;
  host: string;
  port: number;
  username: string;
  password: string;
  secure: boolean; // true for SSL/TLS
  fromEmail: string;
  fromName: string;
  templates: {
    newOrder: EmailTemplate;
    orderShipped: EmailTemplate;
    orderDelivered: EmailTemplate;
    affiliateSale: EmailTemplate;
    affiliatePayout: EmailTemplate;
    [key: string]: EmailTemplate;
  };
}

export interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  cartTotal: number;
  discountAmount: number;
  itemCount: number;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

export enum PaymentMethod {
  COD = 'Cash on Delivery',
  GCASH = 'GCash',
  BANK = 'Bank Transfer',
}