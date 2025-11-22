

import { Product, Order, LandingPageSettings, PaymentSettings, SMTPSettings } from './types';

export const HERO_PRODUCT: Product = {
  id: 'dito-wowfi-pro',
  name: 'DITO Home WoWFi Pro',
  subtitle: 'Unlimited 4G/5G Home WiFi',
  description: 'Experience the future of home internet with ultra-fast 4G/5G speeds up to 100Mbps. Perfect for streaming, gaming, and working from home. No data caps, just pure speed.',
  price: 1990,
  category: 'Modems',
  image: 'https://picsum.photos/seed/routerblue/600/600',
  gallery: [
    'https://picsum.photos/seed/routerblue/600/600',
    'https://picsum.photos/seed/routerback/600/600',
    'https://picsum.photos/seed/routerside/600/600',
    'https://picsum.photos/seed/routerdetail/600/600'
  ],
  specs: {
    'Connectivity': '5G / 4G LTE',
    'Speed': 'Up to 500+ Mbps (Area Dependent)',
    'WiFi': 'WiFi 6 (802.11ax)',
    'Coverage': 'Whole Home',
    'Devices': 'Connect up to 32 devices',
    'Warranty': '1 Year Official Warranty'
  },
  rating: 4.8,
  reviews: 1240,
  features: [
    'Plug & Play Installation',
    'No Monthly Bill (Prepaid)',
    'Load via DITO App',
    'Includes 50GB Bonus Data'
  ],
  sku: 'DITO-MOD-001',
  stock: 150,
  minStockLevel: 20,
  bulkDiscounts: [
    { minQty: 3, percentage: 5 }, // Buy 3 get 5% off
    { minQty: 10, percentage: 12 } // Buy 10 get 12% off
  ]
};

export const RELATED_PRODUCTS: Product[] = [
  {
    id: 'dito-flash-5g',
    name: 'DITO Flash 4G/5G Pocket',
    subtitle: 'Portable High-Speed Internet',
    description: 'Take 4G/5G wherever you go. Compact, powerful, and ready for travel.',
    price: 990,
    category: 'Pocket WiFi',
    image: 'https://picsum.photos/seed/pocketwifi/400/400',
    gallery: ['https://picsum.photos/seed/pocketwifi/400/400'],
    specs: { 'Speed': 'Up to 100 Mbps', 'Battery': '12 Hours' },
    rating: 4.5,
    reviews: 85,
    features: ['Pocket Sized', 'All-day Battery'],
    sku: 'DITO-PKT-002',
    stock: 45,
    minStockLevel: 10
  },
  {
    id: 'dito-sim-starter',
    name: 'DITO 4G/5G SIM Starter',
    subtitle: 'SIM Only Pack',
    description: 'Upgrade your current phone to the DITO network.',
    price: 49,
    category: 'SIM Cards',
    image: 'https://picsum.photos/seed/simcard/400/400',
    gallery: ['https://picsum.photos/seed/simcard/400/400'],
    specs: { 'Data': '3GB Included', 'Calls': 'Unlimited DITO-to-DITO' },
    rating: 4.9,
    reviews: 3000,
    features: ['Triple Cut SIM', '4G/5G Ready'],
    sku: 'DITO-SIM-001',
    stock: 500,
    minStockLevel: 100,
    bulkDiscounts: [
      { minQty: 5, percentage: 10 }
    ]
  }
];

export const RECENT_ORDERS: Order[] = [
  { id: '#ORD-001', customer: 'Maria Clara', date: '2023-10-25', total: 1990, status: 'Delivered', items: 1 },
  { id: '#ORD-002', customer: 'Jose Rizal', date: '2023-10-26', total: 3980, status: 'Processing', items: 2 },
  { id: '#ORD-003', customer: 'Andres B.', date: '2023-10-26', total: 990, status: 'Shipped', items: 1 },
  { id: '#ORD-004', customer: 'Apolinario M.', date: '2023-10-27', total: 49, status: 'Pending', items: 1 },
];

export const SALES_DATA = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 2000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 2390 },
  { name: 'Sun', sales: 3490 },
];

export const DEFAULT_SETTINGS: LandingPageSettings = {
  hero: {
    titlePrefix: 'Fast, Reliable',
    titleHighlight: 'Internet Anywhere',
    titleSuffix: '— No Lock-in, Just Plug & Play!',
    subtitle: 'Get your DITO Home WiFi Prepaid Modem today and enjoy unlimited data, affordable plans, and hassle-free internet — perfect for home, work, or on-the-go.',
    btnPrimary: 'Buy Now',
    btnSecondary: 'Learn More',
    heroImage: 'https://picsum.photos/seed/routerblue/600/600'
  },
  features: {
    title: 'Why Choose DITO Home WiFi Prepaid Modem?',
    subtitle: 'Experience the best value prepaid home internet in the Philippines.',
    list: [
      { icon: 'Zap', title: 'Fast & Reliable', desc: 'Enjoy high-speed internet with wide coverage across the Philippines.' },
      { icon: 'CheckCircle2', title: 'Plug & Play', desc: 'Easy setup in just minutes — no technical skills needed.' },
      { icon: 'CreditCard', title: 'Affordable Plans', desc: 'Only pay for what you need. No monthly bills or hidden charges.' },
      { icon: 'Wifi', title: 'Unlimited Data', desc: 'Stay connected without worrying about data caps or limits.' },
      { icon: 'Globe', title: 'Portable & Flexible', desc: 'Take your internet anywhere — home, office, or on your travels.' },
      { icon: 'Unlock', title: 'No Lock-in', desc: 'Total freedom. Use the modem on your terms without contracts.' },
    ]
  },
  howItWorks: {
    title: 'Get Online in 3 Easy Steps',
    list: [
      { icon: 'ShoppingCart', step: '1', title: 'Buy Your Modem', desc: 'Order online and get it delivered.' },
      { icon: 'Smartphone', step: '2', title: 'Activate SIM', desc: 'Plug it in and register easily.' },
      { icon: 'Wifi', step: '3', title: 'Enjoy Internet', desc: 'Start streaming and browsing instantly.' }
    ]
  },
  testimonials: {
    title: 'Trusted by Thousands of Happy Users',
    subtitle: 'See what our community has to say.',
    list: [
      { name: 'Maria C.', location: 'Manila', quote: "Finally, an internet provider that’s fast and hassle-free. I love the prepaid plan!" },
      { name: 'John P.', location: 'Cebu', quote: "Easy to set up and works anywhere. Highly recommend DITO Home WiFi!" },
      { name: 'Liza R.', location: 'Davao', quote: "Affordable, reliable, and portable. Perfect for my home office setup." }
    ]
  },
  pricing: {
    title: 'Affordable Prepaid Plans',
    subtitle: 'Choose the perfect option that fits your budget and data needs.',
    list: [
      { 
        name: 'Starter Kit', 
        price: '1,990', 
        highlight: false, 
        tag: 'HARDWARE', 
        btnText: 'Buy Starter Kit', 
        features: ['Modem Unit', '5G/4G SIM Card', '50GB Bonus Data', 'Free Delivery'],
        productId: 'dito-wowfi-pro'
      },
      { 
        name: 'Unlimited 5G', 
        price: '1,090', 
        period: '/ 30 days',
        highlight: true, 
        tag: 'BEST VALUE', 
        btnText: 'Get Unlimited', 
        features: ['Unlimited 5G Data', 'No Speed Throttling', 'Valid for 30 Days', 'Works with DITO Modem'],
        productId: ''
      },
      { 
        name: 'Data Top-ups', 
        price: '50', 
        description: 'Starts at', 
        highlight: false, 
        tag: 'ADD-ONS', 
        btnText: 'View Options', 
        features: ['Various Data Buckets', 'Valid for 3-30 Days', 'Easy Reload via App', 'Shareable Data'],
        productId: 'dito-sim-starter'
      }
    ]
  },
  faqs: {
    title: 'Got Questions? We’ve Got Answers!',
    subtitle: '',
    list: [
      { q: 'How do I activate the modem?', a: 'Plug it in, insert the provided SIM card, and follow the simple instructions included in the box. Activation takes less than 5 minutes.' },
      { q: 'Can I use it anywhere?', a: 'Yes! Our coverage extends nationwide. As long as there is DITO signal in your area, you can enjoy high-speed internet.' },
      { q: 'Is there a monthly contract?', a: 'No, DITO Home WiFi is strictly prepaid. You only pay when you reload data. No lock-in periods or termination fees.' },
      { q: 'How do I reload data?', a: 'You can easily reload via the DITO App, GCash, Maya, or at any authorized retail partner stores nationwide.' }
    ]
  },
  cta: {
    title: 'Get Your DITO Home WiFi Prepaid Modem Today!',
    subtitle: 'Fast, reliable, and affordable internet is just a click away.',
    btnText: 'Buy Now',
    image: ''
  },
  shipping: {
    enabled: true,
    baseFee: 150,
    freeThreshold: 2000,
    calculationType: 'zone',
    zones: [
      { name: 'Metro Manila', fee: 100, days: '1-3 Days' },
      { name: 'Luzon', fee: 150, days: '3-5 Days' },
      { name: 'Visayas', fee: 200, days: '5-7 Days' },
      { name: 'Mindanao', fee: 250, days: '7-10 Days' }
    ],
    couriers: [
      { id: 'jnt', name: 'J&T Express', trackingUrl: 'https://www.jtexpress.ph/index/query/gzquery.html?bills={TRACKING}', status: 'active' },
      { id: 'lbc', name: 'LBC Express', trackingUrl: 'https://www.lbcexpress.com/track/?tracking_no={TRACKING}', status: 'active' },
      { id: 'flash', name: 'Flash Express', trackingUrl: 'https://www.flashexpress.ph/tracking/?se={TRACKING}', status: 'inactive' }
    ]
  }
};

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  cod: {
    enabled: true
  },
  gcash: {
    enabled: false,
    accountName: '',
    accountNumber: '',
    qrImage: ''
  },
  bank: {
    enabled: false,
    bankName: '',
    accountName: '',
    accountNumber: ''
  }
};

export const DEFAULT_SMTP_SETTINGS: SMTPSettings = {
  enabled: false,
  host: 'smtp.gmail.com',
  port: 587,
  username: '',
  password: '',
  secure: false,
  fromEmail: 'noreply@dito.ph',
  fromName: 'DITO Home Store',
  templates: {
    newOrder: {
      subject: 'Order Confirmation #{order_id}',
      body: 'Hi {customer_name},\n\nThank you for your order! We have received your order #{order_id} amounting to ₱{total}.\n\nWe will notify you once it ships.',
      enabled: true
    },
    orderShipped: {
      subject: 'Your Order #{order_id} has Shipped!',
      body: 'Good news {customer_name}!\n\nYour order is on the way via {courier}. Tracking Number: {tracking_number}.',
      enabled: true
    },
    orderDelivered: {
      subject: 'Order Delivered - #{order_id}',
      body: 'Hello {customer_name},\n\nYour order #{order_id} has been successfully delivered. Enjoy your DITO Home WiFi!',
      enabled: true
    },
    affiliateSale: {
      subject: 'New Commission Earned! (Order #{order_id})',
      body: 'Congratulations!\n\nYou earned a commission of ₱{commission} for Order #{order_id}. Keep up the great work!',
      enabled: true
    },
    affiliatePayout: {
      subject: 'Payout Processed',
      body: 'Hello,\n\nYour payout request of ₱{amount} has been processed successfully to your account.',
      enabled: true
    }
  }
};