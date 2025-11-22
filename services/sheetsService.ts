
import { LandingPageSettings, Product, Order, User, Affiliate, PaymentSettings, PayoutRequest, SMTPSettings } from '../types';
import { DEFAULT_SETTINGS, HERO_PRODUCT, RELATED_PRODUCTS, RECENT_ORDERS, DEFAULT_PAYMENT_SETTINGS, DEFAULT_SMTP_SETTINGS } from '../constants';

// Updated URL
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzNTTB_z9qMoE93XgJTGC11s-rbRvVV_ErfU_9CpzKFxnVsZhcDtE_lCHdKofO8tQ0LRg/exec"; 

interface ApiResponse {
  status: 'success' | 'error';
  message?: string;
}

interface DashboardData {
  products: Product[];
  orders: Order[];
  customers: User[];
  affiliates: Affiliate[];
  payouts: PayoutRequest[];
  settings: LandingPageSettings;
  paymentSettings: PaymentSettings;
  smtpSettings: SMTPSettings;
}

export const DEMO_AFFILIATE: Affiliate = {
  id: 'AFF-DEMO',
  name: 'Demo Partner',
  email: 'demo@dito.ph',
  walletBalance: 2500,
  totalSales: 15000,
  joinDate: new Date().toISOString().split('T')[0],
  status: 'active',
  clicks: 42,
  lifetimeEarnings: 750,
  firstName: 'Demo',
  lastName: 'Partner',
  username: 'demouser',
  password: 'password123',
  mobile: '09171234567',
  address: 'Makati City',
  govtId: ''
};

export const SheetsService = {
  // Fetch all data from Sheets
  getAllData: async (): Promise<DashboardData | null> => {
    try {
      if (!GOOGLE_SCRIPT_URL) throw new Error("Google Script URL is not configured");

      // 10 Second Timeout to handle cold starts better
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      console.log("Fetching data from Sheets...");
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=read&t=${Date.now()}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
      
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.warn("Invalid JSON from Sheets.", text.substring(0, 50));
        throw new Error("Invalid JSON response");
      }

      // 1. Parse Products
      let products: Product[] = (data.Products || []).map((p: any) => {
        let details: any = {};
        try {
          if (p.json_data) details = JSON.parse(p.json_data);
        } catch (e) { /* ignore */ }

        return {
          id: String(p.id),
          name: String(p.name),
          category: String(p.category),
          price: Number(p.price),
          image: String(p.image),
          description: String(p.description || details.description || ''),
          subtitle: String(p.subtitle || details.subtitle || ''),
          gallery: details.gallery || (p.image ? [p.image] : []), 
          specs: details.specs || {}, 
          features: details.features || [],
          inclusions: details.inclusions || [],
          rating: 5, 
          reviews: 0,
          ...details,
          sku: p.sku ? String(p.sku) : (details.sku || ''),
          stock: (p.stock !== undefined && p.stock !== "") ? Number(p.stock) : (details.stock !== undefined ? Number(details.stock) : 0),
          minStockLevel: (p.min_stock_level !== undefined && p.min_stock_level !== "") ? Number(p.min_stock_level) : (details.minStockLevel !== undefined ? Number(details.minStockLevel) : 10),
          bulkDiscounts: details.bulkDiscounts || [],
          commissionType: p.commissionType,
          commissionValue: Number(p.commissionValue),
          costPrice: details.costPrice ? Number(details.costPrice) : 0
        };
      });

      if (products.length === 0) {
        products = [HERO_PRODUCT, ...RELATED_PRODUCTS];
      }

      // 2. Parse Orders
      const orders: Order[] = (data.Orders || []).map((o: any) => {
        let details: any = {};
        try {
          if (o.json_data) details = JSON.parse(o.json_data);
        } catch (e) { /* ignore */ }

        return {
          id: String(o.id),
          customer: String(o.customer),
          date: o.date ? new Date(o.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          total: Number(o.total),
          status: o.status,
          items: Number(o.items_count || o.items || 1),
          referralId: o.referralId ? String(o.referralId) : undefined,
          commission: o.commission ? Number(o.commission) : 0,
          paymentMethod: o.paymentMethod || 'COD',
          proofOfPayment: o.proofOfPayment || '',
          shippingDetails: details.shippingDetails || undefined,
          orderItems: details.orderItems || undefined,
          shippingFee: details.shippingFee ? Number(details.shippingFee) : 0,
          courier: details.courier || '',
          trackingNumber: details.trackingNumber || ''
        };
      });

      // 3. Parse Customers
      const customers: User[] = (data.Customers || []).map((c: any) => {
        let details: any = {};
        try {
          if (c.json_data) details = JSON.parse(c.json_data);
        } catch (e) { /* ignore */ }

        return {
          id: String(c.id || details.id || `CUST-${Date.now()}`), // Fallback ID
          name: String(c.name),
          email: String(c.email),
          mobile: String(c.phone || details.mobile || ''), // Normalize
          
          // Extended Fields
          firstName: String(details.firstName || c.name.split(' ')[0] || ''),
          lastName: String(details.lastName || c.name.split(' ').slice(1).join(' ') || ''),
          username: String(details.username || ''),
          password: String(details.password || ''),
          joinDate: String(details.joinDate || new Date().toISOString()),
          role: 'customer'
        };
      });

      // 4. Parse Affiliates
      let affiliates: Affiliate[] = (data.Affiliates || []).map((a: any) => {
        let details: any = {};
        try {
          if (a.json_data) details = JSON.parse(a.json_data);
        } catch (e) { /* ignore */ }

        return {
          id: String(a.id),
          name: String(a.name),
          email: String(a.email),
          walletBalance: Number(a.walletBalance || 0),
          totalSales: Number(a.totalSales || 0),
          joinDate: a.joinDate ? new Date(a.joinDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          status: a.status || 'active',
          clicks: Number(a.clicks || 0),
          lifetimeEarnings: Number(a.lifetimeEarnings || 0),
          username: String(a.username || details.username || ''),
          password: String(a.password || details.password || ''),
          firstName: String(a.firstName || details.firstName || ''),
          middleName: String(a.middleName || details.middleName || ''),
          lastName: String(a.lastName || details.lastName || ''),
          birthDate: String(a.birthDate || details.birthDate || ''),
          gender: (a.gender || details.gender || 'Male') as 'Male' | 'Female',
          mobile: String(a.mobile || details.mobile || ''),
          address: String(a.address || details.address || ''),
          agencyName: String(a.agencyName || details.agencyName || ''),
          govtId: String(a.govtId || details.govtId || ''),
          gcashName: String(a.gcashName || details.gcashName || ''),
          gcashNumber: String(a.gcashNumber || details.gcashNumber || '')
        };
      });

      if (affiliates.length === 0) {
         affiliates = [DEMO_AFFILIATE];
      }

      // 5. Parse Payouts
      const payouts: PayoutRequest[] = (data.Payouts || []).map((p: any) => ({
        id: String(p.id),
        affiliateId: String(p.affiliateId),
        affiliateName: String(p.affiliateName),
        amount: Number(p.amount),
        method: p.method || 'GCash',
        accountName: String(p.accountName),
        accountNumber: String(p.accountNumber),
        status: p.status || 'Pending',
        dateRequested: p.dateRequested || new Date().toISOString(),
        dateProcessed: p.dateProcessed || ''
      }));

      // 6. Parse Settings
      const rawSettings: any = { ...DEFAULT_SETTINGS, payment: DEFAULT_PAYMENT_SETTINGS, smtp: DEFAULT_SMTP_SETTINGS };
      if (data.Settings && Array.isArray(data.Settings)) {
        data.Settings.forEach((row: any) => {
          if (!row.Key || row.Value === undefined) return;
          const keys = row.Key.split('.');
          let current: any = rawSettings;
          for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            current = current[keys[i]];
          }
          let val = row.Value;
          if (val === 'true') val = true;
          if (val === 'false') val = false;
          if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
             try { val = JSON.parse(val); } catch (e) { /* keep as string */ }
          }
          if (!isNaN(Number(val)) && val !== '' && typeof val === 'string' && !val.startsWith('0')) {
             val = Number(val);
          }
          current[keys[keys.length - 1]] = val;
        });
      }
      
      const payment = rawSettings.payment || DEFAULT_PAYMENT_SETTINGS;
      const smtp = rawSettings.smtp || DEFAULT_SMTP_SETTINGS;
      if (!smtp.templates) smtp.templates = DEFAULT_SMTP_SETTINGS.templates;
      const { payment: _, smtp: __, ...landingSettings } = rawSettings;
      if (!landingSettings.shipping) landingSettings.shipping = DEFAULT_SETTINGS.shipping;

      return { 
        products, orders, customers, affiliates, payouts,
        settings: landingSettings as LandingPageSettings, 
        paymentSettings: payment as PaymentSettings, 
        smtpSettings: smtp as SMTPSettings
      };

    } catch (error) {
      console.warn("Sheets API Fetch Failed:", error);
      return null;
    }
  },

  sendData: async (action: string, payload: any): Promise<ApiResponse> => {
    if (!GOOGLE_SCRIPT_URL) return { status: 'error', message: 'No Script URL' };
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, payload })
      });
      const text = await response.text();
      try { return JSON.parse(text); } catch { return { status: 'error', message: 'Invalid JSON' }; }
    } catch (error) {
      return { status: 'error', message: 'Network Error' };
    }
  },

  saveSettings: async (settings: any): Promise<ApiResponse> => {
      const processedSettings = JSON.parse(JSON.stringify(settings));
      if (processedSettings.shipping) {
          if (processedSettings.shipping.zones) processedSettings.shipping.zones = JSON.stringify(processedSettings.shipping.zones);
          if (processedSettings.shipping.couriers) processedSettings.shipping.couriers = JSON.stringify(processedSettings.shipping.couriers);
      }
      return SheetsService.sendData('SAVE_SETTINGS', processedSettings);
  },

  saveSMTPSettings: async (settings: SMTPSettings): Promise<ApiResponse> => {
      const processedSettings = JSON.parse(JSON.stringify(settings));
      if (processedSettings.templates) processedSettings.templates = JSON.stringify(processedSettings.templates);
      return SheetsService.sendData('SAVE_SMTP_SETTINGS', processedSettings);
  },
  
  syncProducts: async (products: Product[]): Promise<ApiResponse> => {
    const payload = products.map(p => {
      const { 
        id, name, category, price, image, description, subtitle,
        commissionType, commissionValue, 
        sku, stock, minStockLevel, bulkDiscounts,
        gallery, specs, features, inclusions, costPrice,
        ...rest 
      } = p;

      const discountSummary = bulkDiscounts 
        ? bulkDiscounts.map(d => `Buy ${d.minQty} Get ${d.percentage}% Off`).join('; ') 
        : '';

      return {
        id, name, subtitle: subtitle || '', description: description || '', category, price, image, commissionType, commissionValue,
        sku: sku || '', stock: stock || 0, min_stock_level: minStockLevel || 10, bulk_discounts_summary: discountSummary,
        json_data: JSON.stringify({ 
          ...rest, sku, stock, minStockLevel, bulkDiscounts, gallery, specs, features, inclusions, subtitle, description, costPrice
        })
      };
    });
    return SheetsService.sendData('SYNC_PRODUCTS', payload);
  },
  
  syncInventory: async (products: Product[]): Promise<ApiResponse> => {
    const payload = products.map(p => {
      const stock = p.stock || 0;
      const minStock = p.minStockLevel || 10;
      let status = 'In Stock';
      if (stock === 0) status = 'Out of Stock';
      else if (stock <= minStock) status = 'Low Stock';

      return {
        'Product ID': p.id,
        'Name': p.name,
        'SKU': p.sku || 'N/A',
        'Category': p.category,
        'Cost Price': p.costPrice || 0,
        'Selling Price': p.price,
        'Stock Level': stock,
        'Min Limit': minStock,
        'Status': status,
        'Last Updated': new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' })
      };
    });
    return SheetsService.sendData('SYNC_INVENTORY', payload);
  },

  syncOrders: async (orders: Order[]): Promise<ApiResponse> => {
    const payload = orders.map(o => {
      const shipping = o.shippingDetails;
      const address = shipping ? `${shipping.street}, ${shipping.barangay}, ${shipping.city}, ${shipping.province} ${shipping.zipCode}` : '';
      
      let safeProof = o.proofOfPayment || '';
      if (safeProof.length > 45000) {
         safeProof = "Image too large for Sheet (View in App only if cached)";
      }

      return {
        ...o,
        proofOfPayment: safeProof, 
        shipping_name: shipping ? `${shipping.firstName} ${shipping.lastName}` : '',
        shipping_phone: shipping ? shipping.mobile : '',
        shipping_address: address,
        json_data: JSON.stringify({ 
           shippingDetails: o.shippingDetails,
           orderItems: o.orderItems,
           shippingFee: o.shippingFee,
           courier: o.courier,
           trackingNumber: o.trackingNumber
        })
      };
    });
    return SheetsService.sendData('SYNC_ORDERS', payload);
  },
  
  syncAffiliates: async (affiliates: Affiliate[]): Promise<ApiResponse> => {
    const payload = affiliates.map(aff => {
      const { 
        id, name, email, walletBalance, totalSales, joinDate, status, clicks, lifetimeEarnings,
        username, password, firstName, middleName, lastName, birthDate, gender, mobile, address, agencyName, govtId,
        gcashName, gcashNumber
      } = aff;
      const details = { username, password, firstName, middleName, lastName, birthDate, gender, mobile, address, agencyName, govtId, gcashName, gcashNumber };
      return {
        id, name, email, walletBalance, totalSales, joinDate, status, clicks, lifetimeEarnings,
        username, password, firstName, middleName, lastName, birthDate, gender, mobile, address, agencyName, govtId, gcashName, gcashNumber,
        json_data: JSON.stringify(details)
      };
    });
    return SheetsService.sendData('SYNC_AFFILIATES', payload);
  },

  // New Customer Sync
  syncCustomers: async (customers: User[]): Promise<ApiResponse> => {
    const payload = customers.map(c => {
      const { name, email, id, firstName, lastName, username, password, joinDate, mobile } = c;
      // Store extended fields in json_data
      const details = { id, firstName, lastName, username, password, joinDate, mobile };
      
      return {
        name, 
        email, 
        phone: mobile, 
        json_data: JSON.stringify(details)
      };
    });
    return SheetsService.sendData('SYNC_CUSTOMERS', payload);
  },

  syncPayouts: async (payouts: PayoutRequest[]): Promise<ApiResponse> => SheetsService.sendData('SYNC_PAYOUTS', payouts)
};
