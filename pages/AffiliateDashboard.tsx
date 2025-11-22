
import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { StoreContext } from '../contexts/StoreContext';
import { Copy, DollarSign, ShoppingBag, ExternalLink, CheckCircle, Wallet, Clock, XCircle, CreditCard, LayoutDashboard, MousePointer, CheckCircle2, LogOut, User, Settings, ChevronDown, Lock, Save } from 'lucide-react';
import { Button, Badge } from '../components/UI';

const AffiliateDashboard: React.FC = () => {
  const history = useHistory();
  const { affiliates, orders, payouts, requestPayout, updateAffiliate, isSyncing } = useContext(StoreContext);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'payouts'>('dashboard');
  
  // Simulation: In a real app, we'd get the logged-in ID from AuthContext
  const loggedInAffiliateId = localStorage.getItem('dito_affiliate_id');
  const currentAffiliate = affiliates.find(a => a.id === loggedInAffiliateId);

  // Payout Form State
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // --- Dropdown & Modals State ---
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // --- Edit Profile State ---
  const [profileForm, setProfileForm] = useState<any>({});
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  
  // --- Settings State ---
  const [settingsForm, setSettingsForm] = useState({ gcashName: '', gcashNumber: '' });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!loggedInAffiliateId || !currentAffiliate) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
           <h2 className="text-2xl font-bold text-gray-900 mb-4">Affiliate Access Required</h2>
           <p className="text-gray-500 mb-8">You must log in to view this dashboard.</p>
           <Link to="/affiliate/login">
             <Button fullWidth>Login to Affiliate Portal</Button>
           </Link>
        </div>
      </div>
    );
  }

  // Handlers
  const handleLogout = () => {
    localStorage.removeItem('dito_affiliate_id');
    history.push('/affiliate/login');
  };

  const openProfile = () => {
    setProfileForm({ ...currentAffiliate });
    setPasswordForm({ current: '', new: '', confirm: '' });
    setShowProfile(true);
    setIsMenuOpen(false);
  };

  const openSettings = () => {
    setSettingsForm({ 
      gcashName: currentAffiliate.gcashName || '', 
      gcashNumber: currentAffiliate.gcashNumber || '' 
    });
    setShowSettings(true);
    setIsMenuOpen(false);
  };

  const saveProfile = () => {
    // Update basic details
    const updates: any = {
      mobile: profileForm.mobile,
      address: profileForm.address,
      agencyName: profileForm.agencyName
    };

    // Password Change Logic
    if (passwordForm.new) {
       // Robust string check to handle potential number/string mismatch from sheet data
       if (String(passwordForm.current) !== String(currentAffiliate.password || '')) {
         alert("Current password is incorrect.");
         return;
       }
       if (passwordForm.new.length < 6) {
         alert("New password must be at least 6 characters.");
         return;
       }
       if (passwordForm.new !== passwordForm.confirm) {
         alert("New passwords do not match.");
         return;
       }
       updates.password = passwordForm.new;
    }

    updateAffiliate(currentAffiliate.id, updates);
    setShowProfile(false);
    alert("Profile updated successfully.");
  };

  const saveSettings = () => {
    updateAffiliate(currentAffiliate.id, {
       gcashName: settingsForm.gcashName,
       gcashNumber: settingsForm.gcashNumber
    });
    setShowSettings(false);
  };

  const openPayoutModal = () => {
    setAccountName(currentAffiliate.gcashName || '');
    setAccountNumber(currentAffiliate.gcashNumber || '');
    setIsPayoutModalOpen(true);
  };

  // Stats Logic
  const referredOrders = orders.filter(o => o.referralId === currentAffiliate.id);
  const pendingCommission = referredOrders
    .filter(o => o.status !== 'Delivered')
    .reduce((acc, o) => acc + (o.commission || (o.total * 0.05)), 0); 
  const totalPaidPayouts = payouts
    .filter(p => p.affiliateId === currentAffiliate.id && p.status === 'Approved')
    .reduce((acc, p) => acc + p.amount, 0);
  const referralLink = `${window.location.origin}/?ref=${currentAffiliate.id}`;
  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (payoutAmount > currentAffiliate.walletBalance) return alert("Insufficient balance.");
    if (payoutAmount < 100) return alert("Minimum payout is ₱100");
    requestPayout({
      affiliateId: currentAffiliate.id,
      affiliateName: currentAffiliate.name,
      amount: payoutAmount,
      method: 'GCash',
      accountName,
      accountNumber
    });
    setIsPayoutModalOpen(false);
    setPayoutAmount(0);
  };
  const affiliatePayouts = payouts
    .filter(p => p.affiliateId === currentAffiliate.id)
    .sort((a, b) => new Date(b.dateRequested).getTime() - new Date(a.dateRequested).getTime());

  // Initials for Avatar
  const initials = currentAffiliate.firstName && currentAffiliate.lastName 
    ? `${currentAffiliate.firstName[0]}${currentAffiliate.lastName[0]}` 
    : currentAffiliate.name.substring(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 relative">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {currentAffiliate.firstName || currentAffiliate.name}</h1>
            <p className="text-gray-500">Affiliate Dashboard • ID: {currentAffiliate.id}</p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-200">
               <button 
                 onClick={() => setActiveTab('dashboard')}
                 className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-gray-100 text-primary font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
               >
                 Dashboard
               </button>
               <button 
                 onClick={() => setActiveTab('payouts')}
                 className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'payouts' ? 'bg-gray-100 text-primary font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
               >
                 Payouts
               </button>
             </div>

             {/* Avatar Dropdown */}
             <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 bg-white hover:bg-gray-50 border border-gray-200 rounded-full transition-all shadow-sm"
                >
                  <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-md">
                    {initials}
                  </div>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                       <p className="text-sm font-bold text-gray-900 truncate">{currentAffiliate.name}</p>
                       <p className="text-xs text-gray-400 truncate">{currentAffiliate.username}</p>
                    </div>
                    
                    <button onClick={openProfile} className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary flex items-center gap-2">
                       <User size={16} /> My Profile
                    </button>
                    <button onClick={openSettings} className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary flex items-center gap-2">
                       <CreditCard size={16} /> Payment Settings
                    </button>
                    
                    <div className="h-px bg-gray-100 my-1"></div>
                    
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                       <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
             </div>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <>
            {/* Referral Link Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ExternalLink size={20} className="text-primary" />
                Your Unique Referral Link
              </h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-600 font-mono text-sm truncate select-all">
                  {referralLink}
                </div>
                <Button onClick={copyLink} className="shrink-0 w-full sm:w-auto">
                  {copied ? <span className="flex items-center gap-2"><CheckCircle size={16} /> Copied</span> : <span className="flex items-center gap-2"><Copy size={16} /> Copy Link</span>}
                </Button>
              </div>
              <p className="text-sm text-gray-400 mt-3">
                Share this link to earn commissions on every successful delivery. Rates vary by product.
              </p>
            </div>

            {/* Stats Grid - 3 Columns Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Left Column: Wallet (Full Height) */}
              <div className="lg:col-span-1">
                  <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-6 text-white shadow-lg shadow-red-900/20 relative overflow-hidden h-full flex flex-col justify-between">
                      <div className="relative z-10">
                        <p className="text-red-100 text-sm font-medium mb-1">Current Wallet Balance</p>
                        <h3 className="text-4xl font-black">₱{currentAffiliate.walletBalance.toLocaleString()}</h3>
                        <div className="mt-8 flex gap-2">
                          <button 
                            onClick={() => setActiveTab('payouts')}
                            className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-2.5 rounded-lg backdrop-blur-sm transition-colors flex items-center gap-2 group"
                          >
                            Request Payout <DollarSign size={14} className="group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                      </div>
                      <Wallet className="absolute right-[-20px] bottom-[-20px] text-white/10 rotate-12" size={180} />
                  </div>
              </div>

              {/* Middle Column: Sales & Clicks */}
              <div className="lg:col-span-1 flex flex-col gap-6 h-full">
                  {/* Total Sales */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                          <ShoppingBag size={24} />
                        </div>
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">+ Sales</span>
                      </div>
                      <p className="text-gray-500 text-sm font-medium">Total Referred Sales</p>
                      <h3 className="text-3xl font-bold text-gray-900">₱{currentAffiliate.totalSales.toLocaleString()}</h3>
                  </div>

                  {/* Link Clicks */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                          <MousePointer size={24} />
                        </div>
                      </div>
                      <p className="text-gray-500 text-sm font-medium">Total Link Clicks</p>
                      <h3 className="text-3xl font-bold text-gray-900">{(currentAffiliate.clicks || 0).toLocaleString()}</h3>
                      <p className="text-xs text-gray-400 mt-1">Visitor Traffic</p>
                  </div>
              </div>

              {/* Right Column: Pending & Paid Out */}
              <div className="lg:col-span-1 flex flex-col gap-6 h-full">
                   {/* Pending */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                          <Clock size={24} />
                        </div>
                      </div>
                      <p className="text-gray-500 text-sm font-medium">Pending Commissions</p>
                      <h3 className="text-3xl font-bold text-gray-900">₱{pendingCommission.toLocaleString()}</h3>
                      <p className="text-xs text-gray-400 mt-1">Processing Orders</p>
                  </div>

                  {/* Total Paid Payouts */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                          <CheckCircle2 size={24} />
                        </div>
                      </div>
                      <p className="text-gray-500 text-sm font-medium">Total Paid Out</p>
                      <h3 className="text-3xl font-bold text-gray-900">₱{totalPaidPayouts.toLocaleString()}</h3>
                      <p className="text-xs text-gray-400 mt-1">Approved Withdrawals</p>
                  </div>
              </div>
            </div>

            {/* Referred Orders Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900">Referral History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 font-medium">
                    <tr>
                      <th className="p-4">Order Date</th>
                      <th className="p-4">Order ID</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Commission</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {referredOrders.length > 0 ? referredOrders.map(o => (
                      <tr key={o.id} className="hover:bg-gray-50">
                        <td className="p-4 text-gray-500">{o.date}</td>
                        <td className="p-4 font-medium text-gray-900">{o.id}</td>
                        <td className="p-4">₱{o.total.toLocaleString()}</td>
                        <td className="p-4 font-bold text-primary">
                            ₱{(o.commission || (o.total * 0.05)).toLocaleString()}
                        </td>
                        <td className="p-4">
                            <Badge color={o.status === 'Delivered' ? 'green' : o.status === 'Processing' ? 'blue' : 'gray'}>
                              {o.status}
                            </Badge>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-400">
                          No referrals yet. Share your link to start earning!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'payouts' && (
          <div className="space-y-8 animate-fade-in">
             <div className="flex flex-col md:flex-row gap-8">
                {/* Wallet Card (Compact) */}
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm md:w-1/3 flex flex-col justify-between">
                   <div>
                     <div className="flex items-center justify-between mb-4">
                       <h3 className="font-bold text-gray-900">Available Balance</h3>
                       <div className="p-2 bg-primary/10 text-primary rounded-lg"><Wallet size={20} /></div>
                     </div>
                     <p className="text-4xl font-black text-gray-900 tracking-tight">₱{currentAffiliate.walletBalance.toLocaleString()}</p>
                     <p className="text-sm text-gray-500 mt-2">Ready for withdrawal</p>
                   </div>
                   <Button fullWidth className="mt-8 py-4 text-lg" onClick={openPayoutModal} disabled={currentAffiliate.walletBalance < 100}>
                     Request Payout
                   </Button>
                   {currentAffiliate.walletBalance < 100 && (
                      <p className="text-xs text-center text-orange-500 mt-3 font-medium">Minimum payout is ₱100</p>
                   )}
                </div>

                {/* Payout Info */}
                <div className="flex-1 bg-blue-50 p-8 rounded-2xl border border-blue-100">
                   <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2 text-lg"><CreditCard size={20}/> Payout Information</h3>
                   <p className="text-blue-800 text-sm mb-6 leading-relaxed">We currently process payouts exclusively via <strong>GCash</strong> to ensure fast and reliable transactions for our partners. Requests are typically reviewed and processed within 24-48 hours during business days.</p>
                   
                   <div className="bg-white/50 p-4 rounded-xl">
                     <h4 className="font-bold text-blue-900 text-xs uppercase mb-3">Important Guidelines</h4>
                     <ul className="text-sm text-blue-700 space-y-2 list-disc list-inside">
                       <li>Minimum withdrawal amount is ₱100.</li>
                       <li>Ensure your GCash name matches your registered affiliate name.</li>
                       <li>Incorrect details may cause delays or rejection.</li>
                     </ul>
                   </div>
                </div>
             </div>

             <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">Payout History</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium">
                      <tr>
                        <th className="p-4">Request ID</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Details</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {affiliatePayouts.length > 0 ? affiliatePayouts.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="p-4 font-medium text-gray-900 font-mono text-xs">{p.id}</td>
                          <td className="p-4 text-gray-500">
                            {new Date(p.dateRequested).toLocaleDateString()}
                          </td>
                          <td className="p-4 font-bold text-primary">₱{p.amount.toLocaleString()}</td>
                          <td className="p-4 text-xs text-gray-500">
                             <div className="font-bold text-gray-700 flex items-center gap-1">
                               {p.method === 'GCash' && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
                               {p.method}
                             </div>
                             {p.accountNumber}
                          </td>
                          <td className="p-4">
                            <Badge color={p.status === 'Approved' ? 'green' : p.status === 'Rejected' ? 'red' : 'yellow'}>
                               {p.status}
                            </Badge>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-gray-400">
                            No payout history found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
             </div>
          </div>
        )}

        {/* Payout Request Modal */}
        {isPayoutModalOpen && (
           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
             <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in-up">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Request Payout via GCash</h3>
                  <button onClick={() => setIsPayoutModalOpen(false)} className="text-gray-400 hover:text-gray-600"><XCircle size={20} /></button>
                </div>

                <form onSubmit={handleRequestPayout} className="space-y-6">
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Amount to Withdraw (₱)</label>
                     <div className="relative">
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₱</span>
                       <input 
                          type="number" 
                          required
                          min="100"
                          max={currentAffiliate.walletBalance}
                          value={payoutAmount}
                          onChange={e => setPayoutAmount(Number(e.target.value))}
                          className="w-full pl-8 pr-4 py-4 border border-gray-200 rounded-xl text-2xl font-black text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                          placeholder="0.00"
                       />
                     </div>
                     <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-400">Max available: ₱{currentAffiliate.walletBalance.toLocaleString()}</p>
                        <button 
                          type="button" 
                          onClick={() => setPayoutAmount(currentAffiliate.walletBalance)}
                          className="text-xs font-bold text-primary hover:underline"
                        >
                          Max
                        </button>
                     </div>
                   </div>
                   
                   <div className="p-5 bg-blue-50 rounded-xl border border-blue-100 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-blue-800 uppercase mb-1">GCash Account Name</label>
                        <input 
                           type="text" 
                           required
                           value={accountName}
                           onChange={e => setAccountName(e.target.value)}
                           placeholder="Ex: Juan Dela Cruz"
                           className="w-full p-2.5 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-blue-800 uppercase mb-1">GCash Number</label>
                        <input 
                           type="tel" 
                           required
                           value={accountNumber}
                           onChange={e => setAccountNumber(e.target.value)}
                           placeholder="0917 123 4567"
                           className="w-full p-2.5 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none bg-white"
                        />
                      </div>
                   </div>

                   <div className="pt-2">
                     <Button fullWidth disabled={payoutAmount > currentAffiliate.walletBalance || payoutAmount < 100} className="py-4 shadow-xl">
                       Confirm Request
                     </Button>
                   </div>
                </form>
             </div>
           </div>
        )}

        {/* --- Profile Modal --- */}
        {showProfile && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
             <div className="bg-white rounded-2xl w-full max-w-2xl p-8 shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">My Profile</h3>
                    <p className="text-gray-500 text-sm">Manage your personal and account details.</p>
                  </div>
                  <button onClick={() => setShowProfile(false)} className="text-gray-400 hover:text-gray-600"><XCircle size={24} /></button>
                </div>
                
                <div className="space-y-8">
                   {/* Read-Only Section */}
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-6 bg-gray-50 rounded-xl border border-gray-100">
                      <div>
                         <p className="text-xs font-bold text-gray-400 uppercase mb-1">Full Name</p>
                         <p className="font-medium text-gray-900">{currentAffiliate.firstName} {currentAffiliate.lastName}</p>
                      </div>
                      <div>
                         <p className="text-xs font-bold text-gray-400 uppercase mb-1">Birth Date</p>
                         <p className="font-medium text-gray-900">{currentAffiliate.birthDate}</p>
                      </div>
                      <div>
                         <p className="text-xs font-bold text-gray-400 uppercase mb-1">Gender</p>
                         <p className="font-medium text-gray-900">{currentAffiliate.gender}</p>
                      </div>
                      <div>
                         <p className="text-xs font-bold text-gray-400 uppercase mb-1">Username</p>
                         <p className="font-medium text-gray-900">{currentAffiliate.username}</p>
                      </div>
                      <div>
                         <p className="text-xs font-bold text-gray-400 uppercase mb-1">Email</p>
                         <p className="font-medium text-gray-900">{currentAffiliate.email}</p>
                      </div>
                   </div>

                   {/* Editable Fields */}
                   <div className="space-y-4">
                      <h4 className="font-bold text-gray-900 border-b pb-2">Contact Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                           <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mobile Number</label>
                           <input 
                             className="w-full border border-gray-200 rounded-lg p-2.5"
                             value={profileForm.mobile}
                             onChange={e => setProfileForm({...profileForm, mobile: e.target.value})}
                           />
                         </div>
                         <div>
                           <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Agency Name</label>
                           <input 
                             className="w-full border border-gray-200 rounded-lg p-2.5"
                             value={profileForm.agencyName}
                             onChange={e => setProfileForm({...profileForm, agencyName: e.target.value})}
                           />
                         </div>
                         <div className="md:col-span-2">
                           <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Address</label>
                           <input 
                             className="w-full border border-gray-200 rounded-lg p-2.5"
                             value={profileForm.address}
                             onChange={e => setProfileForm({...profileForm, address: e.target.value})}
                           />
                         </div>
                      </div>
                   </div>

                   {/* Password Change */}
                   <div className="space-y-4">
                      <h4 className="font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                         <Lock size={16} /> Change Password
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Current Password</label>
                             <input 
                               type="password"
                               className="w-full border border-gray-200 rounded-lg p-2.5"
                               placeholder="••••••"
                               value={passwordForm.current}
                               onChange={e => setPasswordForm({...passwordForm, current: e.target.value})}
                             />
                          </div>
                          <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">New Password</label>
                             <input 
                               type="password"
                               className="w-full border border-gray-200 rounded-lg p-2.5"
                               placeholder="••••••"
                               value={passwordForm.new}
                               onChange={e => setPasswordForm({...passwordForm, new: e.target.value})}
                             />
                          </div>
                          <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Confirm New</label>
                             <input 
                               type="password"
                               className="w-full border border-gray-200 rounded-lg p-2.5"
                               placeholder="••••••"
                               value={passwordForm.confirm}
                               onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})}
                             />
                          </div>
                      </div>
                   </div>
                   
                   {currentAffiliate.govtId && (
                      <div>
                         <h4 className="font-bold text-gray-900 border-b pb-2 mb-3">Verification ID</h4>
                         <img src={currentAffiliate.govtId} alt="ID" className="h-32 w-auto rounded-lg border shadow-sm" />
                      </div>
                   )}
                   
                   <div className="pt-4 flex justify-end gap-3 border-t">
                      <Button variant="ghost" onClick={() => setShowProfile(false)}>Cancel</Button>
                      <Button onClick={saveProfile} disabled={isSyncing}>
                        {isSyncing ? 'Saving...' : 'Save Changes'}
                      </Button>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* --- Settings Modal --- */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
             <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in-up">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Payment Settings</h3>
                    <p className="text-gray-500 text-sm">Default Payout Details (GCash)</p>
                  </div>
                  <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600"><XCircle size={20} /></button>
                </div>
                
                <div className="space-y-6">
                   <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-800">
                      These details will be automatically filled when you request a payout.
                   </div>
                   
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Default Account Name</label>
                      <input 
                        className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        value={settingsForm.gcashName}
                        onChange={e => setSettingsForm({...settingsForm, gcashName: e.target.value})}
                        placeholder="Full Name on GCash"
                      />
                   </div>
                   
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Default GCash Number</label>
                      <input 
                        className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        value={settingsForm.gcashNumber}
                        onChange={e => setSettingsForm({...settingsForm, gcashNumber: e.target.value})}
                        placeholder="0917 123 4567"
                      />
                   </div>
                   
                   <div className="pt-4">
                      <Button fullWidth onClick={saveSettings} disabled={isSyncing} className="flex items-center justify-center gap-2">
                        <Save size={18} /> {isSyncing ? 'Saving...' : 'Save Settings'}
                      </Button>
                   </div>
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AffiliateDashboard;