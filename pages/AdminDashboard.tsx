
import React, { useState, useContext, useEffect } from 'react';
import { 
  LayoutDashboard, Package, ShoppingBag, Users, Settings, 
  TrendingUp, AlertCircle, Search, Bell, Cloud,
  MoreHorizontal, ArrowUpRight, ArrowDownRight, Filter, LogOut, Menu, X, Plus, Trash2, Edit2, Save, Loader2, Briefcase, Ban, CheckCircle, RotateCcw, CreditCard, ExternalLink, Image as ImageIcon, DollarSign, XCircle, RefreshCw,
  Clock, MousePointer, Lock, Shield, Printer, Boxes, AlertTriangle, Percent, FileSpreadsheet, List, AlignLeft, Box, Coins,
  ChevronDown, Check, Truck, Smartphone, Landmark, Map, MapPin, Mail, User as UserIcon, FileText, MessageSquare, Eye, Globe, Trophy
} from 'lucide-react';
import { SALES_DATA } from '../constants';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';
import { Badge, Button } from '../components/UI';
import { Link } from 'react-router-dom';
import { StoreContext } from '../contexts/StoreContext';
import { Product, Order, Affiliate, ShippingZone, Courier, EmailTemplate, LandingPageSettings, PaymentSettings, User } from '../types';

const AdminDashboard: React.FC = () => {
  // --- Authentication State ---
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('dito_admin_auth') === 'true';
  });
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');

  // --- Dashboard State ---
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { 
    products, orders, customers, affiliates, stats, settings, paymentSettings, smtpSettings, payouts,
    addProduct, updateProduct, deleteProduct,
    updateOrderStatus, deleteOrder,
    deleteCustomer, updateSettings, updatePaymentSettings, updateSMTPSettings, isSyncing, isLoading, isRefreshing, refreshData,
    updateAffiliate, updatePayoutStatus, forceInventorySync
  } = useContext(StoreContext);

  // --- Product Modal State ---
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProductForm, setNewProductForm] = useState<Partial<Product>>({});
  const [activeProductTab, setActiveProductTab] = useState<'general' | 'inventory' | 'images' | 'advanced'>('general');
  
  // Inputs
  const [specInput, setSpecInput] = useState({ key: '', value: '' });
  const [inclusionInput, setInclusionInput] = useState('');
  const [galleryInput, setGalleryInput] = useState('');
  const [bulkDiscountInput, setBulkDiscountInput] = useState({ minQty: 0, percentage: 0 });

  // --- Order Modal State ---
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  // --- Customer View Modal State ---
  const [viewingCustomer, setViewingCustomer] = useState<User | null>(null);

  // --- Affiliate Modal State ---
  const [isAffiliateModalOpen, setIsAffiliateModalOpen] = useState(false);
  const [editingAffiliate, setEditingAffiliate] = useState<Affiliate | null>(null);
  const [walletAdjustment, setWalletAdjustment] = useState(0);
  const [activeAffiliateTab, setActiveAffiliateTab] = useState<'wallet' | 'profile'>('wallet');

  // --- Settings Forms ---
  const [settingsForm, setSettingsForm] = useState(settings);
  const [paymentSettingsForm, setPaymentSettingsForm] = useState(paymentSettings);
  const [smtpSettingsForm, setSmtpSettingsForm] = useState(smtpSettings);

  // --- Sub-Tabs ---
  const [activeSMTPTab, setActiveSMTPTab] = useState<'server' | 'templates'>('server');
  const [activeShippingTab, setActiveShippingTab] = useState<'general' | 'couriers' | 'zones'>('general');
  const [newCourierName, setNewCourierName] = useState('');
  const [newCourierUrl, setNewCourierUrl] = useState('');

  // Sync Forms with Context
  useEffect(() => { setSettingsForm(settings); }, [settings]);
  useEffect(() => { setPaymentSettingsForm(paymentSettings); }, [paymentSettings]);
  useEffect(() => { setSmtpSettingsForm(smtpSettings); }, [smtpSettings]);

  // --- Auth Handlers ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (authForm.username === 'admin' && authForm.password === 'M@y191992') {
      setIsAuthenticated(true);
      localStorage.setItem('dito_admin_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Invalid username or password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('dito_admin_auth');
    setAuthForm({ username: '', password: '' });
    setActiveTab('Dashboard');
  };

  // --- Product Logic ---
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setNewProductForm(JSON.parse(JSON.stringify(product))); // Deep copy
    setActiveProductTab('general');
    setIsProductModalOpen(true);
  };

  const handleNewProduct = () => {
    setEditingProduct(null);
    setNewProductForm({
      id: `prod-${Date.now()}`,
      name: '', description: '', price: 0, costPrice: 0,
      category: 'Modems', image: '', gallery: [],
      specs: {}, features: [], inclusions: [],
      stock: 0, minStockLevel: 5, sku: '',
      commissionType: 'percentage', commissionValue: 5,
      bulkDiscounts: []
    });
    setActiveProductTab('general');
    setIsProductModalOpen(true);
  };

  const saveProduct = () => {
    if (editingProduct) {
      updateProduct(editingProduct.id, { ...editingProduct, ...newProductForm } as Product);
    } else {
      addProduct({
        ...newProductForm,
        id: newProductForm.id || `prod-${Date.now()}`,
        rating: 5,
        reviews: 0
      } as Product);
    }
    setIsProductModalOpen(false);
  };

  // Product Array Manipulators
  const addSpec = () => {
    if (specInput.key && specInput.value) {
      setNewProductForm(p => ({ ...p, specs: { ...p.specs, [specInput.key]: specInput.value } }));
      setSpecInput({ key: '', value: '' });
    }
  };
  const removeSpec = (k: string) => {
    const s = { ...newProductForm.specs }; delete s[k];
    setNewProductForm(p => ({ ...p, specs: s }));
  };
  const addInclusion = () => {
    if (inclusionInput) {
       setNewProductForm(p => ({ ...p, inclusions: [...(p.inclusions || []), inclusionInput] }));
       setInclusionInput('');
    }
  };
  const removeInclusion = (i: number) => {
    setNewProductForm(p => ({ ...p, inclusions: p.inclusions?.filter((_, idx) => idx !== i) }));
  };
  const addGalleryImage = () => {
    if (galleryInput) {
      setNewProductForm(p => ({ ...p, gallery: [...(p.gallery || []), galleryInput] }));
      setGalleryInput('');
    }
  };
  const removeGalleryImage = (i: number) => {
    setNewProductForm(p => ({ ...p, gallery: p.gallery?.filter((_, idx) => idx !== i) }));
  };
  const addBulkDiscount = () => {
    if (bulkDiscountInput.minQty > 0 && bulkDiscountInput.percentage > 0) {
      setNewProductForm(p => ({ ...p, bulkDiscounts: [...(p.bulkDiscounts || []), bulkDiscountInput] }));
      setBulkDiscountInput({ minQty: 0, percentage: 0 });
    }
  };
  const removeBulkDiscount = (i: number) => {
    setNewProductForm(p => ({ ...p, bulkDiscounts: p.bulkDiscounts?.filter((_, idx) => idx !== i) }));
  };

  // --- Affiliate Logic ---
  const handleEditAffiliate = (aff: Affiliate) => {
    setEditingAffiliate(aff);
    setWalletAdjustment(0);
    setActiveAffiliateTab('wallet');
    setIsAffiliateModalOpen(true);
  };
  const saveAffiliate = () => { 
    if (editingAffiliate) {
        const updated = { ...editingAffiliate };
        if (walletAdjustment !== 0) updated.walletBalance += walletAdjustment;
        updateAffiliate(editingAffiliate.id, updated);
        setIsAffiliateModalOpen(false); 
    }
  };
  const toggleAffiliateStatus = (id: string, status: string) => {
      updateAffiliate(id, { status: status === 'active' ? 'banned' : 'active' } as any);
  };

  // --- Settings Logic ---
  const handleSettingsChange = (section: any, key: any, value: any) => {
      setSettingsForm(prev => ({ ...prev, [section]: { ...prev[section as keyof LandingPageSettings], [key]: value } }));
  };
  const handlePaymentSettingsChange = (method: any, key: any, value: any) => {
      setPaymentSettingsForm(prev => ({ ...prev, [method]: { ...prev[method as keyof PaymentSettings], [key]: value } }));
  };
  const handleSmtpSettingsChange = (key: string, value: any) => {
    setSmtpSettingsForm(prev => ({ ...prev, [key]: value }));
  };
  const handleTemplateChange = (templateKey: string, field: keyof EmailTemplate, value: any) => {
     setSmtpSettingsForm(prev => ({
        ...prev,
        templates: { ...prev.templates, [templateKey]: { ...prev.templates[templateKey], [field]: value } }
     }));
  };
  
  const saveSettings = () => updateSettings(settingsForm);
  const savePaymentSettings = () => updatePaymentSettings(paymentSettingsForm);
  const saveSmtpSettings = () => updateSMTPSettings(smtpSettingsForm);

  // --- Shipping Logic ---
  const handleShippingChange = (key: any, value: any) => {
      setSettingsForm(prev => ({ ...prev, shipping: { ...prev.shipping, [key]: value } }));
  };
  const handleUpdateZone = (idx: number, field: any, value: any) => {
      const z = [...settingsForm.shipping.zones];
      z[idx] = { ...z[idx], [field]: value };
      setSettingsForm(prev => ({ ...prev, shipping: { ...prev.shipping, zones: z } }));
  };
  const handleAddCourier = () => { 
    if(newCourierName && newCourierUrl) {
      const newC: Courier = { id: `cour-${Date.now()}`, name: newCourierName, trackingUrl: newCourierUrl, status: 'active' };
      setSettingsForm(prev => ({ ...prev, shipping: { ...prev.shipping, couriers: [...prev.shipping.couriers, newC] } }));
      setNewCourierName(''); setNewCourierUrl('');
    }
  };
  const handleDeleteCourier = (id: string) => {
      setSettingsForm(prev => ({ ...prev, shipping: { ...prev.shipping, couriers: prev.shipping.couriers.filter(c => c.id !== id) } }));
  };

  // --- Quick Inventory Logic ---
  const handleStockChange = (id: string, change: number) => {
    const p = products.find(x => x.id === id);
    if (p) updateProduct(id, { ...p, stock: Math.max(0, (p.stock || 0) + change) });
  };

  const handlePrintWaybill = (order: Order) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      const html = `
        <html>
          <head>
            <title>Waybill - ${order.id}</title>
            <style>
              body { font-family: 'Courier New', Courier, monospace; padding: 20px; border: 2px solid #000; max-width: 800px; margin: 0 auto; }
              .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
              .row { display: flex; border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
              .col { flex: 1; padding: 0 10px; }
              .label { font-weight: bold; font-size: 10px; text-transform: uppercase; color: #555; margin-bottom: 4px; }
              .value { font-size: 14px; font-weight: bold; }
              .barcode-area { text-align: center; padding: 20px; border: 2px solid #000; margin: 20px 0; }
              .footer { font-size: 10px; text-align: center; margin-top: 20px; }
              @media print {
                body { border: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>DITO HOME FULFILLMENT</h1>
              <p>WAYBILL / PACKING LIST</p>
            </div>
            <div class="row">
              <div class="col" style="border-right: 1px solid #000;">
                <div class="label">Sender</div>
                <div class="value">DITO Home Store<br>Manila Fulfillment Center<br>Philippines</div>
              </div>
              <div class="col">
                <div class="label">Order ID</div>
                <div class="value" style="font-size: 18px;">${order.id}</div>
                <div class="label" style="margin-top: 10px;">Date</div>
                <div class="value">${order.date}</div>
              </div>
            </div>
            <div class="row">
              <div class="col">
                <div class="label">Ship To</div>
                <div class="value">
                  ${order.customer}<br>
                  ${order.shippingDetails?.mobile || ''}<br>
                  ${order.shippingDetails?.street || ''}<br>
                  ${order.shippingDetails?.barangay || ''}, ${order.shippingDetails?.city || ''}<br>
                  ${order.shippingDetails?.province || ''} ${order.shippingDetails?.zipCode || ''}
                </div>
              </div>
            </div>
            <div class="barcode-area">
              <div class="label">Tracking Number</div>
              <div style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${order.trackingNumber || 'PENDING'}</div>
              <div style="margin-top: 10px; font-size: 12px;">${order.id}</div>
            </div>
            <div class="row" style="border: none;">
              <div class="col">
                <div class="label">Payment Method</div>
                <div class="value">${order.paymentMethod}</div>
              </div>
              <div class="col" style="text-align: right;">
                <div class="label">Amount to Collect</div>
                <div class="value" style="font-size: 20px;">${order.paymentMethod === 'COD' ? 'P' + order.total.toLocaleString() : 'PAID'}</div>
              </div>
            </div>
            <div class="row" style="border-top: 1px solid #000; padding-top: 10px;">
               <div class="col">
                  <div class="label">Items</div>
                  ${order.orderItems?.map(item => `
                    <div style="display: flex; justify-content: space-between; font-size: 12px;">
                      <span>${item.quantity}x ${item.name}</span>
                    </div>
                  `).join('') || ''}
               </div>
            </div>
            <script>window.print();</script>
          </body>
        </html>
      `;
      printWindow.document.write(html);
      printWindow.document.close();
    }
  };

  const pendingPayoutsCount = payouts.filter(p => p.status === 'Pending').length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        {/* ... Login UI same as before ... */}
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100 animate-fade-in-up">
           <div className="text-center mb-8">
             <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-primary shadow-inner">
               <Shield size={32} />
             </div>
             <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
             <p className="text-gray-500 mt-2">Enter your credentials to access.</p>
           </div>

           <form onSubmit={handleLogin} className="space-y-4">
              {authError && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl text-center flex items-center justify-center gap-2 animate-pulse">
                  <AlertCircle size={16} /> {authError}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Username</label>
                <input 
                  type="text"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={authForm.username}
                  onChange={e => setAuthForm({...authForm, username: e.target.value})}
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                <input 
                  type="password"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={authForm.password}
                  onChange={e => setAuthForm({...authForm, password: e.target.value})}
                  placeholder="••••••••"
                />
              </div>
              <Button fullWidth className="py-4 shadow-lg shadow-red-900/20 text-lg mt-4">
                 <Lock size={18} className="mr-2"/> Secure Login
              </Button>
              <Link to="/" className="block text-center text-sm text-gray-400 hover:text-gray-600 mt-6">
                ← Back to Store
              </Link>
           </form>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-primary mb-4" size={48} />
        <h2 className="text-xl font-bold text-gray-900">Loading Dashboard...</h2>
        <p className="text-gray-500">Fetching data from Google Sheets</p>
      </div>
    );
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard' },
    { icon: Package, label: 'Products' },
    { icon: Boxes, label: 'Inventory' },
    { icon: ShoppingBag, label: 'Orders' },
    { icon: Truck, label: 'Shipping' },
    { icon: CreditCard, label: 'Payment Gateway' },
    { icon: Mail, label: 'SMTP Email' },
    { icon: Briefcase, label: 'Affiliates' },
    { icon: DollarSign, label: 'Payouts' },
    { icon: Users, label: 'Customers' },
    { icon: Settings, label: 'Settings' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard': 
        const pendingPayoutTotal = payouts.filter(p => p.status === 'Pending').reduce((acc, p) => acc + p.amount, 0);
        const totalPaidOut = payouts.filter(p => p.status === 'Approved').reduce((acc, p) => acc + p.amount, 0);
        
        return (
          <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 1. Total Revenue */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full relative overflow-hidden">
                   <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-2 tracking-tight">₱{stats.revenue.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400 mt-1">(Excl. Shipping)</p>
                      </div>
                      <div className="p-3 bg-red-50 text-primary rounded-2xl">
                        <TrendingUp size={24} />
                      </div>
                   </div>
                </div>
                
                {/* 2. Net Profit */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full">
                   <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-gray-500 text-sm font-medium">Net Profit</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-2 tracking-tight">₱{stats.netProfit.toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
                        <DollarSign size={24} />
                      </div>
                   </div>
                </div>

                {/* 3. Total Items Sold */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full">
                   <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-gray-500 text-sm font-medium">Total Items Sold</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-2 tracking-tight">{stats.totalItemsSold}</p>
                      </div>
                      <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                         <Package size={24} />
                      </div>
                   </div>
                </div>
                
                {/* 4. Total Orders */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full">
                   <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-2 tracking-tight">{stats.totalOrders}</p>
                      </div>
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                         <ShoppingBag size={24} />
                      </div>
                   </div>
                </div>

                {/* 5. Affiliates */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full">
                   <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-gray-500 text-sm font-medium">Affiliates</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-2 tracking-tight">{affiliates.length}</p>
                      </div>
                      <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
                         <Briefcase size={24} />
                      </div>
                   </div>
                </div>

                {/* 6. Customers */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full">
                   <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-gray-500 text-sm font-medium">Customers</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-2 tracking-tight">{stats.totalCustomers}</p>
                      </div>
                      <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
                         <Users size={24} />
                      </div>
                   </div>
                </div>
                
                {/* 7. Pending Payout */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full">
                   <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-gray-500 text-sm font-medium">Pending Payout</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-2 tracking-tight">₱{pendingPayoutTotal.toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-yellow-50 text-yellow-600 rounded-2xl">
                         <Clock size={24} />
                      </div>
                   </div>
                </div>
                
                {/* 8. Total Paid Out */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full">
                   <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-gray-500 text-sm font-medium">Total Paid Out</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-2 tracking-tight">₱{totalPaidOut.toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                         <CheckCircle size={24} />
                      </div>
                   </div>
                </div>
             </div>
             
             {/* Charts and Activity */}
             <div className="grid lg:grid-cols-3 gap-6">
                {/* Sales Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                   <div className="flex justify-between items-center mb-6">
                      <div>
                         <h3 className="font-bold text-gray-900">Revenue Analytics</h3>
                         <p className="text-sm text-gray-500">Sales performance trends</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"><Filter size={18} /></button>
                      </div>
                   </div>
                   <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={SALES_DATA}>
                            <defs>
                               <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#C8102E" stopOpacity={0.1}/>
                                  <stop offset="95%" stopColor="#C8102E" stopOpacity={0}/>
                               </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} tickFormatter={(value) => `₱${value/1000}k`} />
                            <Tooltip 
                               contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}
                               formatter={(value: number) => [`₱${value.toLocaleString()}`, 'Sales']}
                            />
                            <Area type="monotone" dataKey="sales" stroke="#C8102E" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                   <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-gray-900">Recent Activity</h3>
                      <button onClick={() => setActiveTab('Orders')} className="text-xs font-bold text-primary hover:underline">View All</button>
                   </div>
                   <div className="space-y-4 overflow-y-auto flex-1 pr-2 max-h-[300px]">
                      {orders.slice(0, 6).map(order => (
                         <div key={order.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100 cursor-pointer" onClick={() => setViewingOrder(order)}>
                            <div className="flex items-center gap-3">
                               <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                                  order.status === 'Delivered' ? 'bg-green-500' : 
                                  order.status === 'Processing' ? 'bg-blue-500' : 'bg-orange-400'
                               }`}>
                                  {order.customer.substring(0, 2).toUpperCase()}
                               </div>
                               <div>
                                  <p className="text-sm font-bold text-gray-900 line-clamp-1">{order.customer}</p>
                                  <p className="text-[10px] text-gray-400">{new Date(order.date).toLocaleDateString()}</p>
                               </div>
                            </div>
                            <div className="text-right">
                               <p className="text-sm font-bold text-gray-900">₱{order.total.toLocaleString()}</p>
                               <p className={`text-[10px] font-bold uppercase ${
                                  order.status === 'Delivered' ? 'text-green-600' : 
                                  order.status === 'Processing' ? 'text-blue-600' : 'text-orange-500'
                               }`}>{order.status}</p>
                            </div>
                         </div>
                      ))}
                      {orders.length === 0 && <p className="text-center text-gray-400 text-sm py-4">No recent orders</p>}
                   </div>
                </div>
             </div>
          </div>
        );

      case 'Products': return (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-bold text-gray-900">Product Catalog</h2>
                <Button onClick={handleNewProduct} className="py-2 text-sm"><Plus size={16}/> Add Product</Button>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                   <thead className="bg-gray-50 text-gray-500 font-medium">
                      <tr>
                         <th className="p-4">Product</th>
                         <th className="p-4">Category</th>
                         <th className="p-4">Price</th>
                         <th className="p-4">Inventory</th>
                         <th className="p-4 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {products.map(product => (
                         <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4">
                               <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                                     <img src={product.image} alt="" className="w-full h-full object-cover" />
                                  </div>
                                  <div>
                                     <div className="font-bold text-gray-900">{product.name}</div>
                                     <div className="text-xs text-gray-400">SKU: {product.sku || 'N/A'}</div>
                                  </div>
                                </div>
                            </td>
                            <td className="p-4"><Badge color="blue">{product.category}</Badge></td>
                            <td className="p-4 font-bold">₱{product.price.toLocaleString()}</td>
                            <td className="p-4">
                               <span className={`font-bold ${product.stock === 0 ? 'text-red-500' : (product.stock || 0) < 10 ? 'text-orange-500' : 'text-green-500'}`}>
                                  {product.stock} units
                               </span>
                            </td>
                            <td className="p-4 text-right">
                               <div className="flex justify-end gap-2">
                                  <button onClick={() => handleEditProduct(product)} className="p-2 hover:bg-gray-200 rounded-full text-gray-600"><Edit2 size={16}/></button>
                                  <button onClick={() => deleteProduct(product.id)} className="p-2 hover:bg-red-100 rounded-full text-red-500"><Trash2 size={16}/></button>
                               </div>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
      );

      case 'Inventory': 
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-bold text-gray-900">Inventory Management</h2>
                <Button onClick={forceInventorySync} disabled={isSyncing} variant="outline" className="py-2 text-sm flex items-center gap-2">
                  <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''}/> Sync Sheet
                </Button>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                   <thead className="bg-gray-50 text-gray-500 font-medium">
                      <tr>
                         <th className="p-4">SKU</th>
                         <th className="p-4">Product Name</th>
                         <th className="p-4 text-center">Current Stock</th>
                         <th className="p-4 text-center">Status</th>
                         <th className="p-4 text-center">Quick Adjust</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {products.map(p => (
                         <tr key={p.id} className="hover:bg-gray-50">
                            <td className="p-4 font-mono text-gray-500">{p.sku || 'N/A'}</td>
                            <td className="p-4 font-bold text-gray-900">{p.name}</td>
                            <td className="p-4 text-center font-bold text-lg">{p.stock || 0}</td>
                            <td className="p-4 text-center">
                               {(p.stock || 0) === 0 ? <Badge color="red">Out of Stock</Badge> : (p.stock || 0) <= (p.minStockLevel || 10) ? <Badge color="yellow">Low Stock</Badge> : <Badge color="green">In Stock</Badge>}
                            </td>
                            <td className="p-4">
                               <div className="flex items-center justify-center gap-2">
                                  <button onClick={() => handleStockChange(p.id, -1)} className="w-8 h-8 rounded-lg border hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors">-</button>
                                  <button onClick={() => handleStockChange(p.id, 1)} className="w-8 h-8 rounded-lg border hover:bg-green-50 hover:text-green-600 flex items-center justify-center transition-colors">+</button>
                               </div>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        );

      case 'Orders': 
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-6 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Order Management</h2>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                   <thead className="bg-gray-50 text-gray-500 font-medium">
                      <tr>
                         <th className="p-4">Order ID</th>
                         <th className="p-4">Customer</th>
                         <th className="p-4">Date</th>
                         <th className="p-4">Total</th>
                         <th className="p-4">Payment</th>
                         <th className="p-4">Status</th>
                         <th className="p-4 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {orders.map(order => (
                         <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-mono text-xs font-bold">{order.id}</td>
                            <td className="p-4">
                               <div className="font-bold text-gray-900">{order.customer}</div>
                               <div className="text-xs text-gray-400">{order.shippingDetails?.city || 'N/A'}</div>
                            </td>
                            <td className="p-4 text-gray-500">{order.date}</td>
                            <td className="p-4 font-bold">₱{order.total.toLocaleString()}</td>
                            <td className="p-4 text-xs">{order.paymentMethod}</td>
                            <td className="p-4">
                               <select 
                                 value={order.status}
                                 onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                                 className={`text-xs font-bold px-2 py-1 rounded-full border-none outline-none cursor-pointer ${
                                    order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                    order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                                    order.status === 'Processing' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-700'
                                 }`}
                               >
                                  <option value="Pending">Pending</option>
                                  <option value="Processing">Processing</option>
                                  <option value="Shipped">Shipped</option>
                                  <option value="Delivered">Delivered</option>
                               </select>
                            </td>
                            <td className="p-4 text-right">
                               <div className="flex justify-end gap-2">
                                  <button onClick={() => setViewingOrder(order)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-full" title="View Details">
                                     <Eye size={16} />
                                  </button>
                                  <button onClick={() => handlePrintWaybill(order)} className="p-2 hover:bg-gray-100 text-gray-600 rounded-full" title="Print Waybill">
                                     <Printer size={16} />
                                  </button>
                                  <button onClick={() => deleteOrder(order.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-full">
                                     <Trash2 size={16} />
                                  </button>
                               </div>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        );

      case 'Affiliates': 
        // Calculations
        const affTotalSales = affiliates.reduce((acc, a) => acc + a.totalSales, 0);
        const affPendingPayout = payouts.filter(p => p.status === 'Pending').reduce((acc, p) => acc + p.amount, 0);
        const affTotalPaid = payouts.filter(p => p.status === 'Approved').reduce((acc, p) => acc + p.amount, 0);
        const affActiveCount = affiliates.filter(a => a.status === 'active').length;
        const topAffiliates = [...affiliates].sort((a, b) => b.totalSales - a.totalSales).slice(0, 5);

        return (
           <div className="space-y-6">
             {/* 4 KPIs */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                   <div>
                      <p className="text-gray-500 text-xs font-bold uppercase">Total Sales</p>
                      <h3 className="text-2xl font-black text-gray-900 mt-2">₱{affTotalSales.toLocaleString()}</h3>
                   </div>
                   <div className="mt-4 flex justify-end">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><TrendingUp size={20}/></div>
                   </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                   <div>
                      <p className="text-gray-500 text-xs font-bold uppercase">Pending Payout</p>
                      <h3 className="text-2xl font-black text-gray-900 mt-2">₱{affPendingPayout.toLocaleString()}</h3>
                   </div>
                   <div className="mt-4 flex justify-end">
                      <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Clock size={20}/></div>
                   </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                   <div>
                      <p className="text-gray-500 text-xs font-bold uppercase">Total Paid Out</p>
                      <h3 className="text-2xl font-black text-gray-900 mt-2">₱{affTotalPaid.toLocaleString()}</h3>
                   </div>
                   <div className="mt-4 flex justify-end">
                      <div className="p-2 bg-green-50 text-green-600 rounded-lg"><CheckCircle size={20}/></div>
                   </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                   <div>
                      <p className="text-gray-500 text-xs font-bold uppercase">Active Affiliates</p>
                      <h3 className="text-2xl font-black text-gray-900 mt-2">{affActiveCount}</h3>
                   </div>
                   <div className="mt-4 flex justify-end">
                      <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Users size={20}/></div>
                   </div>
                </div>
             </div>

             <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Table - Col Span 2 */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                   <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                      <h2 className="font-bold text-gray-900">Partner List</h2>
                   </div>
                   <div className="overflow-x-auto flex-1">
                      <table className="w-full text-sm text-left">
                         <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                               <th className="p-4">Partner</th>
                               <th className="p-4">Wallet</th>
                               <th className="p-4">Sales</th>
                               <th className="p-4">Status</th>
                               <th className="p-4 text-right">Actions</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-100">
                            {affiliates.map(aff => (
                               <tr key={aff.id} className="hover:bg-gray-50">
                                  <td className="p-4">
                                     <div className="font-bold text-gray-900">{aff.name}</div>
                                     <div className="text-xs text-gray-400">{aff.email}</div>
                                  </td>
                                  <td className="p-4 font-bold text-primary">₱{aff.walletBalance.toLocaleString()}</td>
                                  <td className="p-4">₱{aff.totalSales.toLocaleString()}</td>
                                  <td className="p-4"><Badge color={aff.status === 'active' ? 'green' : 'red'}>{aff.status}</Badge></td>
                                  <td className="p-4 text-right">
                                     <div className="flex justify-end gap-2">
                                        <button onClick={() => handleEditAffiliate(aff)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600"><Edit2 size={16}/></button>
                                     </div>
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>

                {/* Top 5 Card - Col Span 1 */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
                   <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <div className="p-1.5 bg-yellow-100 text-yellow-600 rounded-lg"><Trophy size={16}/></div>
                      Top Performers
                   </h3>
                   <div className="space-y-6">
                      {topAffiliates.map((aff, idx) => (
                         <div key={aff.id} className="flex items-center gap-4 group">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm border-2 ${
                               idx === 0 ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                               idx === 1 ? 'bg-gray-50 text-gray-600 border-gray-200' :
                               idx === 2 ? 'bg-orange-50 text-orange-600 border-orange-200' :
                               'bg-white text-gray-400 border-transparent'
                            }`}>
                               {idx + 1}
                            </div>
                            
                            <div className="relative">
                               <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center text-gray-500 font-bold border border-gray-100 group-hover:border-primary transition-colors">
                                 {/* Initials */}
                                 {aff.firstName ? aff.firstName[0] : aff.name[0]}
                               </div>
                               {/* Rank Badge for top 3 */}
                               {idx < 3 && (
                                  <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-[8px] ${
                                     idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-gray-400' : 'bg-orange-400'
                                  }`}>
                                     <Trophy size={8} className="text-white" fill="currentColor"/>
                                  </div>
                               )}
                            </div>

                            <div className="flex-1 min-w-0">
                               <p className="font-bold text-gray-900 text-sm truncate">{aff.name}</p>
                               <p className="text-xs text-gray-500 truncate">{aff.email}</p>
                            </div>

                            <div className="text-right">
                               <p className="font-bold text-primary text-sm">₱{aff.totalSales.toLocaleString()}</p>
                               <p className="text-[10px] text-gray-400">Sales</p>
                            </div>
                         </div>
                      ))}
                      {topAffiliates.length === 0 && (
                         <div className="text-center py-8 text-gray-400 text-sm">No sales recorded yet.</div>
                      )}
                   </div>
                </div>
             </div>
           </div>
        );

      case 'Payouts': 
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                 <h2 className="font-bold text-gray-900">Payout Requests</h2>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium">
                       <tr>
                          <th className="p-4">Request ID</th>
                          <th className="p-4">Affiliate</th>
                          <th className="p-4">Amount</th>
                          <th className="p-4">Method</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Action</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                       {payouts.map(p => (
                          <tr key={p.id} className="hover:bg-gray-50">
                             <td className="p-4 font-mono text-xs text-gray-500">{p.id}</td>
                             <td className="p-4 font-bold text-gray-900">{p.affiliateName}</td>
                             <td className="p-4 font-bold text-primary">₱{p.amount.toLocaleString()}</td>
                             <td className="p-4 text-xs">
                                <div className="font-bold">{p.method}</div>
                                <div className="text-gray-500">{p.accountNumber}</div>
                             </td>
                             <td className="p-4"><Badge color={p.status === 'Approved' ? 'green' : p.status === 'Rejected' ? 'red' : 'yellow'}>{p.status}</Badge></td>
                             <td className="p-4 text-right">
                                {p.status === 'Pending' && (
                                   <div className="flex justify-end gap-2">
                                      <button onClick={() => updatePayoutStatus(p.id, 'Approved')} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"><Check size={16}/></button>
                                      <button onClick={() => updatePayoutStatus(p.id, 'Rejected')} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><X size={16}/></button>
                                   </div>
                                )}
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
          </div>
        );

      case 'Customers': return (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-6 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Customer Database</h2>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                   <thead className="bg-gray-50 text-gray-500 font-medium">
                      <tr>
                         <th className="p-4">Name</th>
                         <th className="p-4">Email</th>
                         <th className="p-4">Phone</th>
                         <th className="p-4">Joined</th>
                         <th className="p-4 text-right">Action</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {customers.map((c, i) => (
                         <tr key={i} className="hover:bg-gray-50">
                            <td className="p-4">
                               <div className="font-bold text-gray-900">{c.name}</div>
                               {c.username && <div className="text-xs text-gray-400">@{c.username}</div>}
                            </td>
                            <td className="p-4 text-gray-600">{c.email}</td>
                            <td className="p-4 text-gray-600">{c.phone || c.mobile}</td>
                            <td className="p-4 text-gray-500">{c.joinDate ? new Date(c.joinDate).toLocaleDateString() : 'N/A'}</td>
                            <td className="p-4 text-right">
                               <div className="flex justify-end gap-2">
                                  <button onClick={() => setViewingCustomer(c)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-full" title="View Details">
                                     <Eye size={16}/>
                                  </button>
                                  <button onClick={() => deleteCustomer(c.email)} className="text-red-500 hover:bg-red-50 p-2 rounded-full" title="Delete">
                                     <Trash2 size={16}/>
                                  </button>
                                </div>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
      );

      case 'Settings': 
        return (
          <div className="max-w-4xl mx-auto space-y-8 pb-20">
             <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                   <h2 className="text-lg font-bold text-gray-900">Landing Page Configuration</h2>
                   <Button onClick={saveSettings} disabled={isSyncing} className="flex items-center gap-2"><Save size={16} /> {isSyncing ? 'Saving...' : 'Save Changes'}</Button>
                </div>
                <div className="p-6 space-y-6">
                   <div className="p-4 border rounded-xl bg-gray-50">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><LayoutDashboard size={18}/> Hero Section</h3>
                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                         <div><label className="text-xs font-bold text-gray-500 uppercase">Prefix</label><input className="w-full border rounded-lg p-2 mt-1" value={settingsForm.hero.titlePrefix} onChange={e => handleSettingsChange('hero', 'titlePrefix', e.target.value)} /></div>
                         <div><label className="text-xs font-bold text-gray-500 uppercase">Highlight</label><input className="w-full border rounded-lg p-2 mt-1 text-primary font-bold" value={settingsForm.hero.titleHighlight} onChange={e => handleSettingsChange('hero', 'titleHighlight', e.target.value)} /></div>
                         <div><label className="text-xs font-bold text-gray-500 uppercase">Suffix</label><input className="w-full border rounded-lg p-2 mt-1" value={settingsForm.hero.titleSuffix} onChange={e => handleSettingsChange('hero', 'titleSuffix', e.target.value)} /></div>
                      </div>
                      <div className="mb-4"><label className="text-xs font-bold text-gray-500 uppercase">Subtitle</label><textarea className="w-full border rounded-lg p-2 mt-1" rows={2} value={settingsForm.hero.subtitle} onChange={e => handleSettingsChange('hero', 'subtitle', e.target.value)} /></div>
                      <div><label className="text-xs font-bold text-gray-500 uppercase">Hero Image URL</label><input className="w-full border rounded-lg p-2 mt-1" value={settingsForm.hero.heroImage} onChange={e => handleSettingsChange('hero', 'heroImage', e.target.value)} /></div>
                   </div>
                </div>
             </div>
          </div>
        );

      case 'Payment Gateway': return (
          <div className="max-w-4xl mx-auto space-y-8 pb-20">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                 <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                       <h2 className="text-lg font-bold text-gray-900">Payment Methods</h2>
                       <p className="text-gray-500 text-sm">Configure accepted payment options.</p>
                    </div>
                    <Button onClick={savePaymentSettings} disabled={isSyncing} className="flex items-center gap-2"><Save size={16} /> Save</Button>
                 </div>
                 <div className="p-6 space-y-6">
                    {/* COD */}
                    <div className="p-4 border rounded-xl bg-gray-50 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm"><DollarSign size={20} className="text-green-600"/></div>
                          <div><h4 className="font-bold text-gray-900">Cash on Delivery</h4><p className="text-xs text-gray-500">Allow customers to pay upon receipt.</p></div>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={paymentSettingsForm.cod.enabled} onChange={e => handlePaymentSettingsChange('cod', 'enabled', e.target.checked)} />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                       </label>
                    </div>
                    {/* GCash */}
                    <div className="p-4 border rounded-xl bg-blue-50 border-blue-100">
                       <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                             <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600 font-bold text-xs">GC</div>
                             <div><h4 className="font-bold text-gray-900">GCash Payment</h4><p className="text-xs text-gray-500">Manual transfer verification.</p></div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                             <input type="checkbox" className="sr-only peer" checked={paymentSettingsForm.gcash.enabled} onChange={e => handlePaymentSettingsChange('gcash', 'enabled', e.target.checked)} />
                             <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                          </label>
                       </div>
                       {paymentSettingsForm.gcash.enabled && (
                          <div className="grid md:grid-cols-2 gap-4 animate-fade-in">
                             <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Account Name</label><input className="w-full border rounded-lg p-2" value={paymentSettingsForm.gcash.accountName} onChange={e => handlePaymentSettingsChange('gcash', 'accountName', e.target.value)} /></div>
                             <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Account Number</label><input className="w-full border rounded-lg p-2" value={paymentSettingsForm.gcash.accountNumber} onChange={e => handlePaymentSettingsChange('gcash', 'accountNumber', e.target.value)} /></div>
                             <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">QR Code Image URL</label><input className="w-full border rounded-lg p-2" value={paymentSettingsForm.gcash.qrImage} onChange={e => handlePaymentSettingsChange('gcash', 'qrImage', e.target.value)} /></div>
                          </div>
                       )}
                    </div>
                 </div>
              </div>
          </div>
      );

      case 'Shipping': return (
          <div className="max-w-6xl mx-auto space-y-8 pb-20">
             <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                   <div className="flex gap-4">
                      <button onClick={() => setActiveShippingTab('general')} className={`text-sm font-bold pb-1 border-b-2 transition-colors ${activeShippingTab === 'general' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}>Settings</button>
                      <button onClick={() => setActiveShippingTab('couriers')} className={`text-sm font-bold pb-1 border-b-2 transition-colors ${activeShippingTab === 'couriers' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}>Couriers</button>
                      <button onClick={() => setActiveShippingTab('zones')} className={`text-sm font-bold pb-1 border-b-2 transition-colors ${activeShippingTab === 'zones' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}>Zones & Rates</button>
                   </div>
                   <Button onClick={saveSettings} disabled={isSyncing} size="sm"><Save size={14}/> Save</Button>
                </div>
                <div className="p-6">
                   {activeShippingTab === 'general' && (
                      <div className="max-w-lg space-y-4">
                         <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <span className="font-bold text-gray-900">Enable Shipping Module</span>
                            <input type="checkbox" checked={settingsForm.shipping.enabled} onChange={e => handleShippingChange('enabled', e.target.checked)} className="w-5 h-5 accent-primary" />
                         </div>
                         <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Base Shipping Fee</label><input type="number" className="w-full border rounded-lg p-2" value={settingsForm.shipping.baseFee} onChange={e => handleShippingChange('baseFee', Number(e.target.value))} /></div>
                         <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Free Shipping Threshold (Amount)</label><input type="number" className="w-full border rounded-lg p-2" value={settingsForm.shipping.freeThreshold} onChange={e => handleShippingChange('freeThreshold', Number(e.target.value))} /></div>
                      </div>
                   )}
                   {activeShippingTab === 'couriers' && (
                      <div>
                         <div className="flex gap-2 mb-4">
                            <input className="border rounded-lg p-2 text-sm flex-1" placeholder="Courier Name" value={newCourierName} onChange={e => setNewCourierName(e.target.value)} />
                            <input className="border rounded-lg p-2 text-sm flex-1" placeholder="Tracking URL ({TRACKING})" value={newCourierUrl} onChange={e => setNewCourierUrl(e.target.value)} />
                            <Button onClick={handleAddCourier} size="sm">Add</Button>
                         </div>
                         <div className="space-y-2">
                            {settingsForm.shipping.couriers.map(c => (
                               <div key={c.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                                  <div><p className="font-bold text-sm">{c.name}</p><p className="text-xs text-gray-400 truncate w-64">{c.trackingUrl}</p></div>
                                  <button onClick={() => handleDeleteCourier(c.id)} className="text-red-500 p-1"><Trash2 size={14}/></button>
                               </div>
                            ))}
                         </div>
                      </div>
                   )}
                   {activeShippingTab === 'zones' && (
                      <div className="space-y-2">
                         <div className="grid grid-cols-3 gap-4 mb-2 text-xs font-bold text-gray-500 uppercase"><div>Zone Name</div><div>Fee</div><div>Delivery Days</div></div>
                         {settingsForm.shipping.zones.map((z, i) => (
                            <div key={i} className="grid grid-cols-3 gap-4">
                               <input className="border rounded-lg p-2 text-sm bg-gray-50" value={z.name} disabled />
                               <input type="number" className="border rounded-lg p-2 text-sm" value={z.fee} onChange={e => handleUpdateZone(i, 'fee', Number(e.target.value))} />
                               <input className="border rounded-lg p-2 text-sm" value={z.days} onChange={e => handleUpdateZone(i, 'days', e.target.value)} />
                            </div>
                         ))}
                      </div>
                   )}
                </div>
             </div>
          </div>
      );

      case 'SMTP Email':
        return (
          <div className="max-w-4xl mx-auto space-y-8 pb-20">
             <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                   <div>
                      <h2 className="text-lg font-bold text-gray-900">SMTP Email Setup</h2>
                      <p className="text-gray-500 text-sm">Configure settings for sending system emails.</p>
                   </div>
                   <Button onClick={saveSmtpSettings} disabled={isSyncing} className="flex items-center gap-2">
                      <Save size={16} /> {isSyncing ? 'Saving...' : 'Save Configuration'}
                   </Button>
                </div>
                
                <div className="flex border-b bg-gray-50 px-6">
                   <button onClick={() => setActiveSMTPTab('server')} className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeSMTPTab === 'server' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}>Server Config</button>
                   <button onClick={() => setActiveSMTPTab('templates')} className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeSMTPTab === 'templates' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}>Templates</button>
                </div>

                <div className="p-6">
                   {activeSMTPTab === 'server' && (
                      <div className="space-y-4 max-w-lg">
                         <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-6">
                            <span className="font-bold text-gray-900">Enable Email Notifications</span>
                            <input type="checkbox" checked={smtpSettingsForm.enabled} onChange={e => handleSmtpSettingsChange('enabled', e.target.checked)} className="w-5 h-5 accent-primary" />
                         </div>
                         <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">SMTP Host</label><input className="w-full border rounded-lg p-2" value={smtpSettingsForm.host} onChange={e => handleSmtpSettingsChange('host', e.target.value)} placeholder="smtp.gmail.com" /></div>
                         <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Port</label><input type="number" className="w-full border rounded-lg p-2" value={smtpSettingsForm.port} onChange={e => handleSmtpSettingsChange('port', Number(e.target.value))} placeholder="587" /></div>
                         <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Username / Email</label><input className="w-full border rounded-lg p-2" value={smtpSettingsForm.username} onChange={e => handleSmtpSettingsChange('username', e.target.value)} /></div>
                         <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password / App Key</label><input type="password" className="w-full border rounded-lg p-2" value={smtpSettingsForm.password} onChange={e => handleSmtpSettingsChange('password', e.target.value)} /></div>
                         <div className="flex items-center gap-2 mt-2"><input type="checkbox" checked={smtpSettingsForm.secure} onChange={e => handleSmtpSettingsChange('secure', e.target.checked)} /><span className="text-sm text-gray-600">Use Secure Connection (SSL/TLS)</span></div>
                      </div>
                   )}
                   {activeSMTPTab === 'templates' && (
                      <div className="space-y-6">
                         {Object.entries(smtpSettingsForm.templates).map(([key, tpl]) => {
                            const template = tpl as EmailTemplate;
                            return (
                            <div key={key} className="p-4 border rounded-xl bg-gray-50">
                               <div className="flex justify-between items-center mb-4">
                                  <h4 className="font-bold text-gray-900 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                                  <input type="checkbox" checked={template.enabled} onChange={e => handleTemplateChange(key, 'enabled', e.target.checked)} />
                               </div>
                               <div className="space-y-3">
                                  <div><label className="text-xs font-bold text-gray-400">Subject</label><input className="w-full border rounded p-2 text-sm" value={template.subject} onChange={e => handleTemplateChange(key, 'subject', e.target.value)} /></div>
                                  <div><label className="text-xs font-bold text-gray-400">Body</label><textarea className="w-full border rounded p-2 text-sm h-24" value={template.body} onChange={e => handleTemplateChange(key, 'body', e.target.value)} /></div>
                               </div>
                            </div>
                         )})}
                      </div>
                   )}
                </div>
             </div>
          </div>
        );

      default: return <div className="p-10 text-center text-gray-500">Module {activeTab} loaded.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar ... */}
      <aside className="hidden md:flex w-64 bg-white border-r flex-col fixed h-full z-10">
        <div className="p-6 border-b">
           <Link to="/" className="flex items-center gap-2 text-primary font-black text-xl tracking-tighter">
             <div className="bg-primary text-white p-1 rounded-lg"><Cloud size={16} strokeWidth={3} /></div> DITO Admin
           </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map(item => (
            <button key={item.label} onClick={() => setActiveTab(item.label)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === item.label ? 'bg-primary text-white shadow-lg shadow-red-500/20' : 'text-gray-600 hover:bg-gray-50'}`}>
              <div className="flex items-center gap-3"><item.icon size={18} />{item.label}</div>
              {item.label === 'Payouts' && pendingPayoutsCount > 0 && (<span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm ring-1 ring-white/20">{pendingPayoutsCount}</span>)}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t space-y-1">
           <Link to="/" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors text-sm font-medium"><LogOut size={18} /> Exit to Store</Link>
           <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium"><Lock size={18} /> Logout</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8">
        {/* Top Bar ... */}
        <div className="flex justify-between items-center mb-8">
           <div><h1 className="text-2xl font-bold text-gray-900">{activeTab}</h1><p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
           <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200">
                 {isSyncing ? <><Loader2 className="animate-spin text-primary" size={16} /><span className="text-xs font-medium text-gray-500">Syncing...</span></> : <><Cloud size={16} className="text-green-500" /><span className="text-xs font-medium text-gray-500">Saved</span></>}
              </div>
              <button onClick={() => refreshData()} className="p-2 bg-white border rounded-full text-gray-500 hover:bg-gray-50"><RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} /></button>
              <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-sm"><img src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff" alt="Admin" /></div>
           </div>
        </div>

        {renderContent()}

        {/* --- Modals --- */}
        
        {/* Product Modal (Existing) */}
        {isProductModalOpen && (
           /* ... Product Modal Code ... */
           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white rounded-2xl w-full max-w-4xl p-0 shadow-2xl animate-fade-in-up max-h-[90vh] overflow-hidden flex flex-col">
                {/* ... content ... */}
                <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
                   <h3 className="text-xl font-bold text-gray-900">{editingProduct ? 'Edit Product' : 'New Product'}</h3>
                   <button onClick={() => setIsProductModalOpen(false)} className="text-gray-400 hover:text-gray-600"><XCircle size={24} /></button>
                </div>
                <div className="flex border-b bg-gray-50 px-6">
                   {['general', 'inventory', 'images', 'advanced'].map(tab => (
                      <button key={tab} onClick={() => setActiveProductTab(tab as any)} className={`px-6 py-3 text-sm font-bold capitalize border-b-2 transition-colors ${activeProductTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                         {tab}
                      </button>
                   ))}
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                   {/* ... fields ... */}
                   {activeProductTab === 'general' && (
                      <div className="grid md:grid-cols-2 gap-6">
                         <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product Name</label><input className="w-full border rounded-lg p-2" value={newProductForm.name} onChange={e => setNewProductForm({...newProductForm, name: e.target.value})} /></div>
                         <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label><select className="w-full border rounded-lg p-2 bg-white" value={newProductForm.category} onChange={e => setNewProductForm({...newProductForm, category: e.target.value})}><option value="Modems">Modems</option><option value="Pocket WiFi">Pocket WiFi</option><option value="SIM Cards">SIM Cards</option><option value="Accessories">Accessories</option></select></div>
                         <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Selling Price (₱)</label><input type="number" className="w-full border rounded-lg p-2" value={newProductForm.price} onChange={e => setNewProductForm({...newProductForm, price: Number(e.target.value)})} /></div>
                         <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cost Price (₱) <span className="text-gray-400 font-normal lowercase">(for profit calc)</span></label><input type="number" className="w-full border rounded-lg p-2" value={newProductForm.costPrice} onChange={e => setNewProductForm({...newProductForm, costPrice: Number(e.target.value)})} /></div>
                         <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label><textarea className="w-full border rounded-lg p-2 h-32" value={newProductForm.description} onChange={e => setNewProductForm({...newProductForm, description: e.target.value})} /></div>
                      </div>
                   )}
                   {activeProductTab === 'inventory' && (
                      <div className="grid md:grid-cols-3 gap-6">
                         <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">SKU Code</label><input className="w-full border rounded-lg p-2" value={newProductForm.sku} onChange={e => setNewProductForm({...newProductForm, sku: e.target.value})} /></div>
                         <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Current Stock</label><input type="number" className="w-full border rounded-lg p-2" value={newProductForm.stock} onChange={e => setNewProductForm({...newProductForm, stock: Number(e.target.value)})} /></div>
                         <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Low Stock Alert Level</label><input type="number" className="w-full border rounded-lg p-2" value={newProductForm.minStockLevel} onChange={e => setNewProductForm({...newProductForm, minStockLevel: Number(e.target.value)})} /></div>
                      </div>
                   )}
                   {activeProductTab === 'images' && (
                      <div className="space-y-6">
                         <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Main Image URL</label><input className="w-full border rounded-lg p-2" value={newProductForm.image} onChange={e => setNewProductForm({...newProductForm, image: e.target.value})} /></div>
                         <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Image Gallery</label>
                            <div className="flex gap-2 mb-3"><input className="flex-1 border rounded-lg p-2 text-sm" placeholder="https://..." value={galleryInput} onChange={e => setGalleryInput(e.target.value)} /><button onClick={addGalleryImage} className="bg-primary text-white p-2 rounded-lg"><Plus size={16}/></button></div>
                            <div className="grid grid-cols-5 gap-2">{newProductForm.gallery && newProductForm.gallery.map((img, i) => (<div key={i} className="relative aspect-square bg-white rounded border overflow-hidden group"><img src={img} alt="" className="w-full h-full object-cover" /><button onClick={() => removeGalleryImage(i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button></div>))}</div>
                         </div>
                      </div>
                   )}
                   {activeProductTab === 'advanced' && (
                      <div className="space-y-6">
                         <div className="grid md:grid-cols-2 gap-6 p-4 border rounded-xl bg-blue-50 border-blue-100">
                            <div><label className="block text-xs font-bold text-blue-800 uppercase mb-1">Commission Type</label><select className="w-full border rounded-lg p-2 bg-white" value={newProductForm.commissionType} onChange={e => setNewProductForm({...newProductForm, commissionType: e.target.value as any})}><option value="percentage">Percentage (%)</option><option value="fixed">Fixed Amount (₱)</option></select></div>
                            <div><label className="block text-xs font-bold text-blue-800 uppercase mb-1">Commission Value</label><input type="number" className="w-full border rounded-lg p-2" value={newProductForm.commissionValue} onChange={e => setNewProductForm({...newProductForm, commissionValue: Number(e.target.value)})} /></div>
                         </div>
                         <div className="p-4 border rounded-xl bg-green-50 border-green-100">
                            <label className="block text-xs font-bold text-green-800 uppercase mb-2">Bulk Discounts</label>
                            <div className="flex gap-2 mb-2"><input type="number" className="w-24 border rounded-lg p-2 text-sm" placeholder="Min Qty" value={bulkDiscountInput.minQty || ''} onChange={e => setBulkDiscountInput({...bulkDiscountInput, minQty: Number(e.target.value)})} /><input type="number" className="flex-1 border rounded-lg p-2 text-sm" placeholder="Discount %" value={bulkDiscountInput.percentage || ''} onChange={e => setBulkDiscountInput({...bulkDiscountInput, percentage: Number(e.target.value)})} /><button onClick={addBulkDiscount} className="bg-green-600 text-white p-2 rounded-lg"><Plus size={16}/></button></div>
                            <div className="space-y-1">{newProductForm.bulkDiscounts?.map((d, i) => (<div key={i} className="flex justify-between text-xs bg-white px-3 py-1.5 rounded border border-green-200 text-green-800"><span className="font-bold">Buy {d.minQty}+ items</span><span>Get {d.percentage}% Off</span><button onClick={() => removeBulkDiscount(i)} className="text-red-400"><X size={12}/></button></div>))}</div>
                         </div>
                         <div className="grid md:grid-cols-2 gap-6">
                            <div>
                               <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Specifications</label>
                               <div className="flex gap-2 mb-2"><input className="w-1/3 border rounded-lg p-2 text-xs" placeholder="Key" value={specInput.key} onChange={e => setSpecInput({...specInput, key: e.target.value})} /><input className="flex-1 border rounded-lg p-2 text-xs" placeholder="Value" value={specInput.value} onChange={e => setSpecInput({...specInput, value: e.target.value})} /><button onClick={addSpec} className="bg-gray-200 p-2 rounded text-gray-600"><Plus size={14}/></button></div>
                               <div className="space-y-1 h-32 overflow-y-auto">{newProductForm.specs && Object.entries(newProductForm.specs).map(([k, v]) => (<div key={k} className="flex justify-between text-xs bg-gray-50 px-2 py-1 rounded border border-gray-100"><span><span className="font-bold">{k}:</span> {v}</span><button onClick={() => removeSpec(k)} className="text-red-400"><X size={12}/></button></div>))}</div>
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Inclusions</label>
                               <div className="flex gap-2 mb-2"><input className="flex-1 border rounded-lg p-2 text-xs" placeholder="Item Name" value={inclusionInput} onChange={e => setInclusionInput(e.target.value)} /><button onClick={addInclusion} className="bg-gray-200 p-2 rounded text-gray-600"><Plus size={14}/></button></div>
                               <div className="space-y-1 h-32 overflow-y-auto">{newProductForm.inclusions && newProductForm.inclusions.map((inc, i) => (<div key={i} className="flex justify-between text-xs bg-gray-50 px-2 py-1 rounded border border-gray-100"><span>{inc}</span><button onClick={() => removeInclusion(i)} className="text-red-400"><X size={12}/></button></div>))}</div>
                            </div>
                         </div>
                      </div>
                   )}
                </div>
                <div className="p-4 border-t flex justify-end gap-3 bg-gray-50">
                   <Button variant="ghost" onClick={() => setIsProductModalOpen(false)}>Cancel</Button>
                   <Button onClick={saveProduct}>Save Product</Button>
                </div>
              </div>
           </div>
        )}

        {/* NEW: Customer View Modal */}
        {viewingCustomer && (
           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
             <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in-up">
                <div className="flex justify-between items-start mb-6">
                   <div>
                      <h3 className="text-xl font-bold text-gray-900">Customer Details</h3>
                      <p className="text-xs text-gray-500">Registered User Info</p>
                   </div>
                   <button onClick={() => setViewingCustomer(null)} className="text-gray-400 hover:text-gray-600"><XCircle size={24} /></button>
                </div>

                <div className="space-y-6">
                   <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
                         {(viewingCustomer.firstName || viewingCustomer.name || 'U')[0]}
                      </div>
                      <div>
                         <p className="font-bold text-gray-900 text-lg">{viewingCustomer.name}</p>
                         <p className="text-sm text-gray-500">@{viewingCustomer.username || 'guest'}</p>
                      </div>
                   </div>

                   <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                         <span className="text-gray-500">Email</span>
                         <span className="font-medium">{viewingCustomer.email}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                         <span className="text-gray-500">Mobile</span>
                         <span className="font-medium">{viewingCustomer.mobile || viewingCustomer.phone}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                         <span className="text-gray-500">Join Date</span>
                         <span className="font-medium">{viewingCustomer.joinDate ? new Date(viewingCustomer.joinDate).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                         <span className="text-gray-500">First Name</span>
                         <span className="font-medium">{viewingCustomer.firstName || '-'}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                         <span className="text-gray-500">Last Name</span>
                         <span className="font-medium">{viewingCustomer.lastName || '-'}</span>
                      </div>
                   </div>
                   
                   <Button fullWidth onClick={() => setViewingCustomer(null)}>Close</Button>
                </div>
             </div>
           </div>
        )}

        {/* ... Other Modals (Order, Affiliate) ... */}
        {viewingOrder && (
           /* ... Order Modal ... */
           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white rounded-2xl w-full max-w-3xl p-8 shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto relative">
                  <button onClick={() => setViewingOrder(null)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"><XCircle size={24}/></button>
                  {/* ... content ... */}
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                     <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><ShoppingBag size={24}/></div>
                     <div>
                        <h3 className="text-2xl font-bold text-gray-900">Order {viewingOrder.id}</h3>
                        <p className="text-gray-500">{new Date(viewingOrder.date).toLocaleDateString()} • {viewingOrder.status}</p>
                     </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                     <div className="space-y-4">
                        <h4 className="font-bold text-gray-900 border-b pb-2">Customer Details</h4>
                        <div className="grid grid-cols-[100px_1fr] gap-y-2 text-sm">
                           <span className="text-gray-500">Name:</span> <span className="font-medium">{viewingOrder.customer}</span>
                           <span className="text-gray-500">Mobile:</span> <span className="font-medium">{viewingOrder.shippingDetails?.mobile || 'N/A'}</span>
                        </div>
                        <h4 className="font-bold text-gray-900 border-b pb-2 mt-6">Shipping Address</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                           {viewingOrder.shippingDetails?.street}, {viewingOrder.shippingDetails?.barangay}<br/>
                           {viewingOrder.shippingDetails?.city}, {viewingOrder.shippingDetails?.province}<br/>
                           {viewingOrder.shippingDetails?.zipCode}
                        </p>
                     </div>
                     <div className="space-y-4">
                        <h4 className="font-bold text-gray-900 border-b pb-2">Payment Info</h4>
                        <div className="grid grid-cols-[100px_1fr] gap-y-2 text-sm">
                           <span className="text-gray-500">Method:</span> <Badge color="blue">{viewingOrder.paymentMethod}</Badge>
                           <span className="text-gray-500">Status:</span> <Badge color={viewingOrder.status === 'Delivered' ? 'green' : 'yellow'}>{viewingOrder.status}</Badge>
                        </div>
                        {viewingOrder.proofOfPayment && (
                           <div className="mt-4">
                              <span className="text-xs font-bold text-gray-500 uppercase">Payment Proof</span>
                              <a href={viewingOrder.proofOfPayment} target="_blank" rel="noreferrer" className="block mt-2 relative group rounded-lg overflow-hidden border hover:border-primary">
                                 <img src={viewingOrder.proofOfPayment} alt="Proof" className="w-full h-32 object-cover" />
                                 <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold text-xs">View Full</div>
                              </a>
                           </div>
                        )}
                     </div>
                  </div>
                  <h4 className="font-bold text-gray-900 border-b pb-2 mb-4">Order Items</h4>
                  <table className="w-full text-sm text-left mb-6">
                     <thead className="bg-gray-50 text-gray-500"><tr><th className="p-3 rounded-l-lg">Item</th><th className="p-3">Qty</th><th className="p-3 text-right rounded-r-lg">Price</th></tr></thead>
                     <tbody>
                        {viewingOrder.orderItems?.map((item, i) => (
                           <tr key={i} className="border-b last:border-0">
                              <td className="p-3 font-medium text-gray-900">{item.name}</td>
                              <td className="p-3">{item.quantity}</td>
                              <td className="p-3 text-right">₱{(item.price * item.quantity).toLocaleString()}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
                  <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-sm">
                     <div className="flex justify-between"><span>Subtotal</span><span>₱{(viewingOrder.total - (viewingOrder.shippingFee || 0)).toLocaleString()}</span></div>
                     <div className="flex justify-between"><span>Shipping Fee</span><span>₱{(viewingOrder.shippingFee || 0).toLocaleString()}</span></div>
                     <div className="flex justify-between pt-2 border-t border-gray-200 font-bold text-lg"><span>Total</span><span className="text-primary">₱{viewingOrder.total.toLocaleString()}</span></div>
                  </div>
              </div>
           </div>
        )}

        {/* ... Affiliate Modal (Existing) ... */}
        {isAffiliateModalOpen && editingAffiliate && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
             <div className="bg-white rounded-2xl w-full max-w-2xl p-8 shadow-2xl animate-fade-in-up">
                {/* ... content ... */}
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-xl font-bold text-gray-900">Manage Partner</h3>
                   <button onClick={() => setIsAffiliateModalOpen(false)} className="text-gray-400 hover:text-gray-600"><XCircle size={24} /></button>
                </div>
                <div className="flex gap-4 mb-6 border-b">
                   <button onClick={() => setActiveAffiliateTab('wallet')} className={`pb-2 px-2 text-sm font-bold border-b-2 transition-colors ${activeAffiliateTab === 'wallet' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}>Wallet & Status</button>
                   <button onClick={() => setActiveAffiliateTab('profile')} className={`pb-2 px-2 text-sm font-bold border-b-2 transition-colors ${activeAffiliateTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}>Profile & Verification</button>
                </div>
                {activeAffiliateTab === 'wallet' && (
                   <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                         <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Partner Name</label><input disabled className="w-full border rounded-lg p-2 bg-gray-50" value={editingAffiliate.name} /></div>
                         <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Current Wallet</label><input disabled className="w-full border rounded-lg p-2 bg-gray-50 font-bold text-primary" value={`₱${editingAffiliate.walletBalance.toLocaleString()}`} /></div>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                         <label className="block text-xs font-bold text-yellow-700 uppercase mb-2">Manual Wallet Adjustment</label>
                         <div className="flex gap-2 items-center"><button onClick={() => setWalletAdjustment(prev => prev - 100)} className="p-2 bg-white border rounded-lg hover:bg-gray-50">-</button><input type="number" className="flex-1 border rounded-lg p-2 text-center font-bold" value={walletAdjustment} onChange={e => setWalletAdjustment(Number(e.target.value))} /><button onClick={() => setWalletAdjustment(prev => prev + 100)} className="p-2 bg-white border rounded-lg hover:bg-gray-50">+</button></div>
                         <p className="text-xs text-yellow-600 mt-2 text-center">New Balance: ₱{(editingAffiliate.walletBalance + walletAdjustment).toLocaleString()}</p>
                      </div>
                      <Button fullWidth onClick={saveAffiliate} disabled={walletAdjustment === 0}>Apply Adjustment</Button>
                   </div>
                )}
                {activeAffiliateTab === 'profile' && (
                   <div className="space-y-6 max-h-[60vh] overflow-y-auto">
                      <div className="grid md:grid-cols-2 gap-4">
                         <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mobile</label><input disabled className="w-full border rounded-lg p-2 bg-gray-50" value={editingAffiliate.mobile || 'N/A'} /></div>
                         <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Address</label><input disabled className="w-full border rounded-lg p-2 bg-gray-50" value={editingAffiliate.address || 'N/A'} /></div>
                         <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Username</label><input disabled className="w-full border rounded-lg p-2 bg-gray-50" value={editingAffiliate.username || 'N/A'} /></div>
                         <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">GCash Name</label><input disabled className="w-full border rounded-lg p-2 bg-gray-50" value={editingAffiliate.gcashName || 'N/A'} /></div>
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Government ID</label>
                         {editingAffiliate.govtId ? (
                            <img src={editingAffiliate.govtId} alt="ID" className="w-full h-48 object-contain bg-gray-100 rounded-lg border" />
                         ) : (
                            <div className="w-full h-32 bg-gray-50 rounded-lg border border-dashed flex items-center justify-center text-gray-400 text-sm">No ID Uploaded</div>
                         )}
                      </div>
                   </div>
                )}
             </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;
