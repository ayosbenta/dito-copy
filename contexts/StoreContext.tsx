
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { Product, Order, User, LandingPageSettings, Affiliate, PaymentSettings, PayoutRequest, SMTPSettings } from '../types';
import { DEFAULT_SETTINGS, DEFAULT_PAYMENT_SETTINGS, HERO_PRODUCT, RELATED_PRODUCTS, RECENT_ORDERS, DEFAULT_SMTP_SETTINGS } from '../constants';
import { SheetsService, DEMO_AFFILIATE } from '../services/sheetsService';

interface StoreContextType {
  products: Product[];
  orders: Order[];
  customers: User[];
  affiliates: Affiliate[];
  payouts: PayoutRequest[];
  settings: LandingPageSettings;
  paymentSettings: PaymentSettings;
  smtpSettings: SMTPSettings;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updatedProduct: Product) => void;
  deleteProduct: (id: string) => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  deleteOrder: (id: string) => void;
  deleteCustomer: (email: string) => void;
  registerCustomer: (customer: User) => void; // New
  registerAffiliate: (affiliate: Affiliate) => void;
  updateAffiliate: (id: string, data: Partial<Affiliate>) => void;
  trackAffiliateClick: (id: string) => void;
  requestPayout: (req: Omit<PayoutRequest, 'id' | 'status' | 'dateRequested'>) => void;
  updatePayoutStatus: (id: string, status: PayoutRequest['status']) => void;
  updateSettings: (settings: LandingPageSettings) => void;
  updatePaymentSettings: (settings: PaymentSettings) => void;
  updateSMTPSettings: (settings: SMTPSettings) => void;
  forceInventorySync: () => Promise<void>;
  stats: {
    revenue: number;
    netProfit: number;
    totalOrders: number;
    totalItemsSold: number;
    totalCustomers: number;
    lowStock: number;
  };
  isSyncing: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  refreshData: () => void;
}

export const StoreContext = createContext<StoreContextType>({
  products: [],
  orders: [],
  customers: [],
  affiliates: [],
  payouts: [],
  settings: DEFAULT_SETTINGS,
  paymentSettings: DEFAULT_PAYMENT_SETTINGS,
  smtpSettings: DEFAULT_SMTP_SETTINGS,
  addProduct: () => {},
  updateProduct: () => {},
  deleteProduct: () => {},
  addOrder: () => {},
  updateOrderStatus: () => {},
  deleteOrder: () => {},
  deleteCustomer: () => {},
  registerCustomer: () => {},
  registerAffiliate: () => {},
  updateAffiliate: () => {},
  trackAffiliateClick: () => {},
  requestPayout: () => {},
  updatePayoutStatus: () => {},
  updateSettings: () => {},
  updatePaymentSettings: () => {},
  updateSMTPSettings: () => {},
  forceInventorySync: async () => {},
  stats: { revenue: 0, netProfit: 0, totalOrders: 0, totalItemsSold: 0, totalCustomers: 0, lowStock: 0 },
  isSyncing: false,
  isLoading: true,
  isRefreshing: false,
  refreshData: () => {},
});

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [settings, setSettings] = useState<LandingPageSettings>(DEFAULT_SETTINGS);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(DEFAULT_PAYMENT_SETTINGS);
  const [smtpSettings, setSMTPSettings] = useState<SMTPSettings>(DEFAULT_SMTP_SETTINGS);
  
  const [syncCount, setSyncCount] = useState(0);
  const isSyncing = syncCount > 0;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async (isBackground = false) => {
    const isInitial = !isBackground && products.length === 0;
    
    if (isInitial) setIsLoading(true);
    else setIsRefreshing(true);
    
    const safetyTimeout = setTimeout(() => {
       if(isInitial) setIsLoading(false);
       setIsRefreshing(false);
    }, 10000);

    try {
      const data = await SheetsService.getAllData();
      
      if (data) {
        setProducts(data.products || []);
        setOrders(data.orders || []);
        setCustomers(data.customers || []);
        setAffiliates(data.affiliates || []);
        setPayouts(data.payouts || []);
        if (data.settings) setSettings(data.settings);
        if (data.paymentSettings) setPaymentSettings(data.paymentSettings);
        if (data.smtpSettings) setSMTPSettings(data.smtpSettings);
      } else {
        console.warn("Background fetch failed. Preserving existing state.");
        if (products.length === 0) {
           console.log("Using Fallback/Demo Data");
           setProducts([HERO_PRODUCT, ...RELATED_PRODUCTS]);
           setOrders(RECENT_ORDERS);
           setAffiliates([DEMO_AFFILIATE]);
           setPayouts([]);
        }
      }
    } catch (err) {
      console.error("Critical Error in loadData", err);
    } finally {
      clearTimeout(safetyTimeout);
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!isSyncing) loadData(true);
    }, 15000);
    return () => clearInterval(intervalId);
  }, [isSyncing]); 

  const triggerProductSync = (newProducts: Product[]) => {
    setSyncCount(c => c + 1);
    Promise.all([
        SheetsService.syncProducts(newProducts),
        SheetsService.syncInventory(newProducts)
    ]).finally(() => setSyncCount(c => c - 1));
  };

  const forceInventorySync = async () => {
    setSyncCount(c => c + 1);
    try {
      await SheetsService.syncInventory(products);
    } finally {
      setSyncCount(c => c - 1);
    }
  };

  const triggerOrderSync = (newOrders: Order[]) => {
    setSyncCount(c => c + 1);
    SheetsService.syncOrders(newOrders).finally(() => setSyncCount(c => c - 1));
  };

  const triggerAffiliateSync = (newAffiliates: Affiliate[]) => {
    setSyncCount(c => c + 1);
    SheetsService.syncAffiliates(newAffiliates).finally(() => setSyncCount(c => c - 1));
  };

  const triggerCustomerSync = (newCustomers: User[]) => {
    setSyncCount(c => c + 1);
    SheetsService.syncCustomers(newCustomers).finally(() => setSyncCount(c => c - 1));
  };

  const triggerSettingsSync = (newSettings: LandingPageSettings) => {
    setSyncCount(c => c + 1);
    SheetsService.saveSettings(newSettings).finally(() => setSyncCount(c => c - 1));
  };

  const addProduct = (product: Product) => {
    const updated = [...products, product];
    setProducts(updated);
    triggerProductSync(updated);
  };

  const updateProduct = (id: string, updatedProduct: Product) => {
    const updated = products.map(p => p.id === id ? updatedProduct : p);
    setProducts(updated);
    triggerProductSync(updated);
  };

  const deleteProduct = (id: string) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    triggerProductSync(updated);
  };

  const addOrder = (order: Order) => {
    const updatedOrders = [order, ...orders];
    setOrders(updatedOrders);
    triggerOrderSync(updatedOrders);

    if (order.orderItems && order.orderItems.length > 0) {
      let inventoryChanged = false;
      const updatedProducts = products.map(p => {
        const soldItem = order.orderItems?.find(i => i.id === p.id);
        if (soldItem) {
          inventoryChanged = true;
          return { ...p, stock: Math.max(0, (p.stock || 0) - soldItem.quantity) };
        }
        return p;
      });

      if (inventoryChanged) {
        setProducts(updatedProducts);
        triggerProductSync(updatedProducts);
      }
    }

    if (order.referralId) {
       const affiliate = affiliates.find(a => a.id === order.referralId);
       if (affiliate) {
         const updatedAffiliates = affiliates.map(a => {
            if (a.id === order.referralId) {
               return { ...a, totalSales: a.totalSales + (order.total - (order.shippingFee || 0)) }; 
            }
            return a;
         });
         setAffiliates(updatedAffiliates);
         triggerAffiliateSync(updatedAffiliates);
       }
    }
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    const oldOrder = orders.find(o => o.id === id);
    const updatedOrders = orders.map(o => o.id === id ? { ...o, status } : o);
    setOrders(updatedOrders);
    triggerOrderSync(updatedOrders);

    if (oldOrder && oldOrder.status !== 'Delivered' && status === 'Delivered' && oldOrder.referralId) {
       const updatedAffiliates = affiliates.map(a => {
          if (a.id === oldOrder.referralId) {
             const comm = oldOrder.commission || ((oldOrder.total - (oldOrder.shippingFee || 0)) * 0.05);
             return {
               ...a,
               walletBalance: a.walletBalance + comm,
               lifetimeEarnings: (a.lifetimeEarnings || 0) + comm
             };
          }
          return a;
       });
       setAffiliates(updatedAffiliates);
       triggerAffiliateSync(updatedAffiliates);
    }
  };

  const deleteOrder = (id: string) => {
    const updated = orders.filter(o => o.id !== id);
    setOrders(updated);
    triggerOrderSync(updated);
  };

  const registerCustomer = (customer: User) => {
    const updated = [...customers, customer];
    setCustomers(updated);
    triggerCustomerSync(updated);
  };

  const deleteCustomer = (email: string) => {
    const updated = customers.filter(c => c.email !== email);
    setCustomers(updated);
    triggerCustomerSync(updated);
  };

  const registerAffiliate = (affiliate: Affiliate) => {
    const updated = [...affiliates, affiliate];
    setAffiliates(updated);
    triggerAffiliateSync(updated);
  };

  const updateAffiliate = (id: string, data: Partial<Affiliate>) => {
    const updated = affiliates.map(a => a.id === id ? { ...a, ...data } : a);
    setAffiliates(updated);
    triggerAffiliateSync(updated);
  };

  const trackAffiliateClick = (id: string) => {
    const affiliate = affiliates.find(a => a.id === id);
    if (affiliate) {
      const updated = affiliates.map(a => a.id === id ? { ...a, clicks: (a.clicks || 0) + 1 } : a);
      setAffiliates(updated);
      triggerAffiliateSync(updated);
    }
  };

  const requestPayout = (req: Omit<PayoutRequest, 'id' | 'status' | 'dateRequested'>) => {
    const newPayout: PayoutRequest = {
      ...req,
      id: `PAY-${Date.now()}`,
      status: 'Pending',
      dateRequested: new Date().toISOString()
    };
    const updatedPayouts = [newPayout, ...payouts];
    setPayouts(updatedPayouts);

    const updatedAffiliates = affiliates.map(a => {
      if (a.id === req.affiliateId) {
        return { ...a, walletBalance: Math.max(0, a.walletBalance - req.amount) };
      }
      return a;
    });
    setAffiliates(updatedAffiliates);
    setSyncCount(c => c + 1);
    Promise.all([
      SheetsService.syncPayouts(updatedPayouts),
      SheetsService.syncAffiliates(updatedAffiliates)
    ]).finally(() => setSyncCount(c => c - 1));
  };

  const updatePayoutStatus = (id: string, status: PayoutRequest['status']) => {
    const payoutIndex = payouts.findIndex(p => p.id === id);
    if (payoutIndex === -1) return;
    const payout = payouts[payoutIndex];
    const dateProcessed = new Date().toISOString();
    const updatedPayouts = payouts.map(p => p.id === id ? { ...p, status, dateProcessed } : p);
    setPayouts(updatedPayouts);

    let updatedAffiliates = affiliates;
    if (status === 'Rejected' && payout.status === 'Pending') {
      updatedAffiliates = affiliates.map(a => {
        if (a.id === payout.affiliateId) {
          return { ...a, walletBalance: a.walletBalance + payout.amount };
        }
        return a;
      });
      setAffiliates(updatedAffiliates);
    }

    setSyncCount(c => c + 1);
    const promises = [SheetsService.syncPayouts(updatedPayouts)];
    if (status === 'Rejected') promises.push(SheetsService.syncAffiliates(updatedAffiliates));
    Promise.all(promises).finally(() => setSyncCount(c => c - 1));
  };

  const updateSettings = (newSettings: LandingPageSettings) => {
    setSettings(newSettings);
    triggerSettingsSync(newSettings);
  };

  const updatePaymentSettings = (newSettings: PaymentSettings) => {
    setPaymentSettings(newSettings);
    setSyncCount(c => c + 1);
    SheetsService.sendData('SAVE_PAYMENT_SETTINGS', newSettings).finally(() => setSyncCount(c => c - 1));
  };

  const updateSMTPSettings = (newSettings: SMTPSettings) => {
    setSMTPSettings(newSettings);
    setSyncCount(c => c + 1);
    SheetsService.saveSMTPSettings(newSettings).finally(() => setSyncCount(c => c - 1));
  };

  const calculateNetProfit = () => {
    let totalRevenue = 0;
    let totalCOGS = 0;
    let totalCommissions = 0;

    orders.forEach(order => {
      const orderRevenue = order.total - (order.shippingFee || 0);
      totalRevenue += orderRevenue;
      totalCommissions += (order.commission || 0);

      if (order.orderItems && order.orderItems.length > 0) {
        order.orderItems.forEach(item => {
           const product = products.find(p => p.id === item.id);
           if (product) {
             const cost = product.costPrice || 0;
             totalCOGS += (cost * item.quantity);
           }
        });
      }
    });

    return totalRevenue - totalCOGS - totalCommissions;
  };

  const stats = {
    revenue: orders.reduce((acc, o) => acc + (o.total - (o.shippingFee || 0)), 0),
    netProfit: calculateNetProfit(),
    totalOrders: orders.length,
    totalItemsSold: orders.reduce((acc, o) => acc + (o.items || 0), 0),
    totalCustomers: customers.length,
    lowStock: products.filter(p => (p.stock || 0) <= (p.minStockLevel || 10)).length
  };

  return (
    <StoreContext.Provider value={{
      products, orders, customers, affiliates, payouts, settings, paymentSettings, smtpSettings,
      addProduct, updateProduct, deleteProduct,
      addOrder, updateOrderStatus, deleteOrder,
      deleteCustomer, registerCustomer,
      registerAffiliate, updateAffiliate, trackAffiliateClick,
      requestPayout, updatePayoutStatus,
      updateSettings, updatePaymentSettings, updateSMTPSettings,
      forceInventorySync,
      stats,
      isSyncing, isLoading, isRefreshing, refreshData: () => loadData(false)
    }}>
      {children}
    </StoreContext.Provider>
  );
};
