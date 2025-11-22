
import React, { useContext, useState, useEffect } from 'react';
import { CartContext } from '../contexts/CartContext';
import { StoreContext } from '../contexts/StoreContext';
import { Order, ShippingDetails } from '../types';
import { CheckCircle, CreditCard, Truck, Lock, Upload, Landmark, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/UI';
import { LocationService, LocationOption } from '../services/locationService';

// Helper to categorize provinces into Island Groups/Regions for Zone Matching
const getRegion = (province: string): string => {
  const p = province.toLowerCase();
  if (!p) return '';

  if (p.includes('metro manila') || p === 'manila') return 'metro manila';
  
  const luzon = ['abra','albay','aurora','bataan','batanes','batangas','benguet','bulacan','cagayan','camarines','catanduanes','cavite','ifugao','ilocos','isabela','kalinga','la union','laguna','marinduque','masbate','mindoro','mountain province','nueva','palawan','pampanga','pangasinan','quezon','quirino','rizal','romblon','sorsogon','tarlac','zambales'];
  if (luzon.some(l => p.includes(l))) return 'luzon';
  
  const visayas = ['aklan','antique','biliran','bohol','capiz','cebu','guimaras','iloilo','leyte','negros','samar','siquijor'];
  if (visayas.some(v => p.includes(v))) return 'visayas';
  
  const mindanao = ['agusan','basilan','bukidnon','camiguin','compostela','cotabato','davao','dinagat','lanao','maguindanao','misamis','sarangani','sultan kudarat','sulu','surigao','tawi-tawi','zamboanga'];
  if (mindanao.some(m => p.includes(m))) return 'mindanao';
  
  return '';
};

const CheckoutPage: React.FC = () => {
  const { items, cartTotal, clearCart } = useContext(CartContext);
  const { addOrder, paymentSettings, settings } = useContext(StoreContext);
  const [step, setStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  
  // Address State
  const [shippingDetails, setShippingDetails] = useState<ShippingDetails>({
    firstName: '',
    lastName: '',
    mobile: '',
    street: '',
    province: '',
    city: '',
    barangay: '',
    zipCode: ''
  });

  // Location Data State
  const [provinces, setProvinces] = useState<LocationOption[]>([]);
  const [cities, setCities] = useState<LocationOption[]>([]);
  const [barangays, setBarangays] = useState<LocationOption[]>([]);
  
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedCityCode, setSelectedCityCode] = useState('');
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);

  const [proofOfPayment, setProofOfPayment] = useState<string>('');
  const [fileName, setFileName] = useState('');

  // Shipping Fee State
  const [shippingFee, setShippingFee] = useState(0);

  // Effect to calculate fee based on settings and address
  useEffect(() => {
    if (!settings.shipping.enabled) {
        setShippingFee(0);
        return;
    }
    
    // Check Free Shipping Threshold
    if (settings.shipping.freeThreshold > 0 && cartTotal >= settings.shipping.freeThreshold) {
        setShippingFee(0);
        return;
    }

    if (settings.shipping.calculationType === 'flat') {
        setShippingFee(settings.shipping.baseFee);
        return;
    }

    if (settings.shipping.calculationType === 'zone') {
        // Zone Logic
        const userProvince = shippingDetails.province?.trim().toLowerCase() || '';
        const userCity = shippingDetails.city?.trim().toLowerCase() || '';
        const userRegion = getRegion(userProvince);
        
        // Priority 1: Specific Zone Match (e.g., "Cavite" defined in zones)
        let matchedZone = settings.shipping.zones.find(z => {
            const zoneName = z.name.toLowerCase();
            // Check if User Province/City contains Zone Name OR Zone Name contains User Province
            return userProvince && (userProvince.includes(zoneName) || zoneName.includes(userProvince) || userCity.includes(zoneName));
        });

        // Priority 2: Broad Region Match (e.g., "Luzon" defined in zones, but user selected "Cavite")
        if (!matchedZone && userRegion) {
            matchedZone = settings.shipping.zones.find(z => z.name.toLowerCase() === userRegion);
        }

        if (matchedZone) {
            setShippingFee(matchedZone.fee);
        } else {
            // Fallback to Base Fee if no specific zone match found
            // This ensures the user sees a cost if their specific province isn't zoned but they are outside known regions
            setShippingFee(settings.shipping.baseFee); 
        }
    }
  }, [settings.shipping, cartTotal, shippingDetails.province, shippingDetails.city]);

  // Fetch Provinces on Mount
  useEffect(() => {
    const fetchProvinces = async () => {
      setIsLoadingLocations(true);
      const data = await LocationService.getProvinces();
      setProvinces(data);
      setIsLoadingLocations(false);
    };
    fetchProvinces();
  }, []);

  // Fetch Cities when Province changes
  useEffect(() => {
    if (selectedProvinceCode) {
      const fetchCities = async () => {
        setIsLoadingLocations(true);
        const data = await LocationService.getCities(selectedProvinceCode);
        setCities(data);
        setBarangays([]);
        setShippingDetails(prev => ({ ...prev, city: '', barangay: '', zipCode: '' }));
        setSelectedCityCode('');
        setIsLoadingLocations(false);
      };
      fetchCities();
    }
  }, [selectedProvinceCode]);

  // Fetch Barangays and Set Zip when City changes
  useEffect(() => {
    if (selectedCityCode) {
      const fetchBarangays = async () => {
        setIsLoadingLocations(true);
        const data = await LocationService.getBarangays(selectedCityCode);
        setBarangays(data);
        
        // Auto-fill Zip Code (User can still edit this)
        const zip = LocationService.getZipCode(shippingDetails.city, shippingDetails.province);
        setShippingDetails(prev => ({ ...prev, zipCode: zip, barangay: '' }));
        
        setIsLoadingLocations(false);
      };
      fetchBarangays();
    }
  }, [selectedCityCode, shippingDetails.city, shippingDetails.province]);

  // Set default selected method based on enabled settings
  React.useEffect(() => {
    if (!selectedMethod) {
      if (paymentSettings.cod.enabled) setSelectedMethod('cod');
      else if (paymentSettings.gcash.enabled) setSelectedMethod('gcash');
      else if (paymentSettings.bank.enabled) setSelectedMethod('bank');
    }
  }, [paymentSettings, selectedMethod]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      
      // Compress Image to avoid hitting Google Sheets Cell Limit (50k chars)
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Resize to max 600px to reduce data size significantly
          const MAX_SIZE = 600;
          if (width > height) {
            if (width > MAX_SIZE) {
               height *= MAX_SIZE / width;
               width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
               width *= MAX_SIZE / height;
               height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Aggressive JPEG compression (0.6 quality)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
          setProofOfPayment(dataUrl);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShippingDetails(prev => ({ ...prev, [name]: value }));

    // Handle specialized dropdown logic for names/codes
    if (name === 'province') {
      const province = provinces.find(p => p.name === value);
      if (province) setSelectedProvinceCode(province.code);
    }
    if (name === 'city') {
      const city = cities.find(c => c.name === value);
      if (city) setSelectedCityCode(city.code);
    }
  };

  if (items.length === 0 && step !== 3) {
    return (
      <div className="pt-40 pb-20 min-h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Truck size={40} className="text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
        <Link to="/catalog">
          <Button variant="outline">Go back shopping</Button>
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation for Proof of Payment
    if ((selectedMethod === 'gcash' || selectedMethod === 'bank') && !proofOfPayment) {
      alert("Please upload a proof of payment (receipt) to continue.");
      return;
    }
    
    const referralId = localStorage.getItem('dito_referral_id');
    
    // Calculate Commission if referred
    let totalCommission = 0;
    if (referralId) {
      items.forEach(item => {
        const commType = item.commissionType || 'percentage';
        const commValue = item.commissionValue ?? 5; // Default 5%

        if (commType === 'fixed') {
          totalCommission += commValue * item.quantity;
        } else {
          // Percentage calculation
          totalCommission += (item.price * (commValue / 100)) * item.quantity;
        }
      });
    }

    const newOrder: Order = {
      id: `#ORD-${Math.floor(Math.random() * 10000)}`,
      customer: `${shippingDetails.firstName} ${shippingDetails.lastName}`,
      date: new Date().toISOString().split('T')[0],
      total: cartTotal + shippingFee,
      status: 'Pending',
      items: items.reduce((acc, item) => acc + item.quantity, 0),
      orderItems: items.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      referralId: referralId || '',
      commission: totalCommission,
      paymentMethod: selectedMethod === 'cod' ? 'COD' : selectedMethod === 'gcash' ? 'GCash' : 'Bank Transfer',
      proofOfPayment: proofOfPayment,
      shippingDetails: shippingDetails, // Include the full address object
      shippingFee: shippingFee
    };

    addOrder(newOrder);
    clearCart();
    setStep(3);
    window.scrollTo(0,0);
  };

  return (
    <div className="pt-32 pb-20 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Step Indicator */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-4">
            {['Shipping', 'Payment', 'Confirmation'].map((label, i) => {
              const stepNum = i + 1;
              const isActive = step >= stepNum;
              return (
                <div key={label} className="flex items-center">
                  <div className={`flex items-center gap-2 ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${isActive ? 'bg-primary border-primary text-white' : 'border-gray-300'}`}>
                      {stepNum}
                    </div>
                    <span className="font-bold hidden sm:block">{label}</span>
                  </div>
                  {stepNum < 3 && (
                    <div className={`w-12 h-0.5 mx-4 ${step > stepNum ? 'bg-primary' : 'bg-gray-300'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {step === 3 ? (
          <div className="max-w-md mx-auto text-center bg-white p-12 rounded-3xl shadow-xl shadow-gray-200/50 animate-fade-in-up">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={48} className="text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
            <p className="text-gray-500 mb-8">
              Thank you for your purchase. Your order has been placed successfully.
              {selectedMethod !== 'cod' && " We are verifying your payment."}
            </p>
            <Link to="/">
              <Button fullWidth className="py-4">Return Home</Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left: Form */}
            <div className="lg:col-span-2">
              <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-8">
                {/* Section: Address */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative">
                  {isLoadingLocations && (
                     <div className="absolute top-4 right-4 text-primary animate-spin">
                       <Loader2 size={20} />
                     </div>
                  )}
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="bg-red-50 p-2 rounded-xl"><Truck size={20} className="text-primary" /></div>
                    Delivery Address
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">First Name</label>
                      <input 
                        required 
                        type="text" 
                        name="firstName"
                        value={shippingDetails.firstName}
                        onChange={handleInputChange}
                        className="w-full border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary p-3 border transition-all outline-none" 
                        placeholder="Juan"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Last Name</label>
                      <input 
                        required 
                        type="text" 
                        name="lastName"
                        value={shippingDetails.lastName}
                        onChange={handleInputChange}
                        className="w-full border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary p-3 border transition-all outline-none" 
                        placeholder="Dela Cruz"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Mobile Number</label>
                      <input 
                        required 
                        type="tel" 
                        name="mobile"
                        value={shippingDetails.mobile}
                        onChange={handleInputChange}
                        className="w-full border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary p-3 border transition-all outline-none" 
                        placeholder="0917 123 4567"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Street Address</label>
                      <input 
                        required 
                        type="text" 
                        name="street"
                        value={shippingDetails.street}
                        onChange={handleInputChange}
                        className="w-full border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary p-3 border transition-all outline-none" 
                        placeholder="House No., Street Name, Subdivision"
                      />
                    </div>
                    
                    {/* Dropdowns */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Province</label>
                      <select 
                        required 
                        name="province"
                        value={shippingDetails.province}
                        onChange={handleInputChange}
                        className="w-full border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary p-3 border transition-all outline-none appearance-none"
                      >
                        <option value="">Select Province</option>
                        {provinces.map(p => (
                          <option key={p.code} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Municipality / City</label>
                      <select 
                        required 
                        name="city"
                        value={shippingDetails.city}
                        onChange={handleInputChange}
                        disabled={!shippingDetails.province}
                        className="w-full border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary p-3 border transition-all outline-none appearance-none disabled:bg-gray-100 disabled:text-gray-400"
                      >
                        <option value="">Select City/Municipality</option>
                        {cities.map(c => (
                          <option key={c.code} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Barangay</label>
                      <select 
                        required 
                        name="barangay"
                        value={shippingDetails.barangay}
                        onChange={handleInputChange}
                        disabled={!shippingDetails.city}
                        className="w-full border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary p-3 border transition-all outline-none appearance-none disabled:bg-gray-100 disabled:text-gray-400"
                      >
                        <option value="">Select Barangay</option>
                        {barangays.map(b => (
                          <option key={b.code} value={b.name}>{b.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Zip Code</label>
                      <input 
                        required 
                        type="text" 
                        name="zipCode"
                        value={shippingDetails.zipCode}
                        onChange={handleInputChange}
                        className="w-full border-gray-200 bg-white rounded-xl p-3 border outline-none text-gray-900 font-bold" 
                        placeholder="Zip Code"
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Payment */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="bg-red-50 p-2 rounded-xl"><CreditCard size={20} className="text-primary" /></div>
                    Payment Method
                  </h2>
                  
                  <div className="space-y-4">
                    {/* COD Option */}
                    {paymentSettings.cod.enabled && (
                      <label className={`flex items-center p-4 border rounded-2xl cursor-pointer transition-all ${selectedMethod === 'cod' ? 'border-primary bg-red-50/50 ring-1 ring-primary' : 'border-gray-200 hover:border-red-200 bg-gray-50'}`}>
                        <input 
                          type="radio" 
                          name="payment" 
                          value="cod" 
                          checked={selectedMethod === 'cod'}
                          onChange={() => setSelectedMethod('cod')}
                          className="w-5 h-5 text-primary border-gray-300 focus:ring-primary"
                        />
                        <span className="ml-4 font-bold text-gray-900">Cash on Delivery</span>
                      </label>
                    )}

                    {/* GCash Option */}
                    {paymentSettings.gcash.enabled && (
                      <div className={`border rounded-2xl transition-all overflow-hidden ${selectedMethod === 'gcash' ? 'border-primary bg-red-50/30 ring-1 ring-primary' : 'border-gray-200 bg-gray-50'}`}>
                        <label className="flex items-center p-4 cursor-pointer">
                          <input 
                            type="radio" 
                            name="payment" 
                            value="gcash" 
                            checked={selectedMethod === 'gcash'}
                            onChange={() => setSelectedMethod('gcash')}
                            className="w-5 h-5 text-primary border-gray-300 focus:ring-primary"
                          />
                          <div className="ml-4 flex items-center gap-2">
                            <span className="font-bold text-gray-900">GCash</span>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full">E-Wallet</span>
                          </div>
                        </label>
                        
                        {selectedMethod === 'gcash' && (
                          <div className="px-6 pb-6 pt-2 border-t border-primary/10 bg-white">
                             <div className="flex flex-col md:flex-row gap-6 mt-4">
                               {paymentSettings.gcash.qrImage && (
                                 <div className="w-32 h-32 bg-gray-100 rounded-xl shrink-0 border p-1">
                                    <img src={paymentSettings.gcash.qrImage} alt="GCash QR" className="w-full h-full object-contain rounded-lg" />
                                 </div>
                               )}
                               <div className="space-y-2 text-sm">
                                  <p className="text-gray-500">Scan the QR code or send payment to:</p>
                                  <div className="font-bold text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                     <p>{paymentSettings.gcash.accountName}</p>
                                     <p className="text-lg tracking-wider text-blue-600">{paymentSettings.gcash.accountNumber}</p>
                                  </div>
                               </div>
                             </div>
                             
                             <div className="mt-6">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Upload Proof of Payment (Screenshot)</label>
                                <div className="relative">
                                   <input 
                                     type="file" 
                                     accept="image/*" 
                                     onChange={handleFileChange}
                                     className="hidden" 
                                     id="proof-upload-gcash"
                                   />
                                   <label htmlFor="proof-upload-gcash" className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary hover:bg-blue-50 transition-colors text-gray-500">
                                      <Upload size={20} />
                                      {fileName ? <span className="text-primary font-bold">{fileName}</span> : "Click to upload Receipt"}
                                   </label>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1 text-center">Max size 2MB. Images are compressed automatically.</p>
                             </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Bank Transfer Option */}
                    {paymentSettings.bank.enabled && (
                      <div className={`border rounded-2xl transition-all overflow-hidden ${selectedMethod === 'bank' ? 'border-primary bg-red-50/30 ring-1 ring-primary' : 'border-gray-200 bg-gray-50'}`}>
                        <label className="flex items-center p-4 cursor-pointer">
                          <input 
                            type="radio" 
                            name="payment" 
                            value="bank" 
                            checked={selectedMethod === 'bank'}
                            onChange={() => setSelectedMethod('bank')}
                            className="w-5 h-5 text-primary border-gray-300 focus:ring-primary"
                          />
                          <div className="ml-4 flex items-center gap-2">
                            <span className="font-bold text-gray-900">Bank Transfer</span>
                          </div>
                        </label>
                        
                        {selectedMethod === 'bank' && (
                          <div className="px-6 pb-6 pt-2 border-t border-primary/10 bg-white">
                             <div className="space-y-4 mt-4">
                                <p className="text-gray-500 text-sm">Please transfer the total amount to:</p>
                                <div className="font-bold text-gray-900 bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-start gap-3">
                                   <div className="p-2 bg-white rounded-lg border shadow-sm text-primary"><Landmark size={24} /></div>
                                   <div>
                                      <p className="text-sm text-gray-500 uppercase tracking-wide font-bold">{paymentSettings.bank.bankName}</p>
                                      <p className="text-lg">{paymentSettings.bank.accountName}</p>
                                      <p className="text-xl tracking-widest text-blue-600 font-mono mt-1">{paymentSettings.bank.accountNumber}</p>
                                   </div>
                                </div>
                             </div>
                             
                             <div className="mt-6">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Upload Proof of Payment</label>
                                <div className="relative">
                                   <input 
                                     type="file" 
                                     accept="image/*" 
                                     onChange={handleFileChange}
                                     className="hidden" 
                                     id="proof-upload-bank"
                                   />
                                   <label htmlFor="proof-upload-bank" className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary hover:bg-blue-50 transition-colors text-gray-500">
                                      <Upload size={20} />
                                      {fileName ? <span className="text-primary font-bold">{fileName}</span> : "Click to upload Receipt"}
                                   </label>
                                </div>
                             </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* If no methods enabled */}
                    {!paymentSettings.cod.enabled && !paymentSettings.gcash.enabled && !paymentSettings.bank.enabled && (
                       <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center text-sm">
                          No payment methods are currently available. Please contact support.
                       </div>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Right: Summary */}
            <div className="lg:col-span-1">
               <div className="bg-white p-8 rounded-3xl shadow-lg shadow-gray-200 border border-gray-100 sticky top-32">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
                  <div className="space-y-4 max-h-60 overflow-y-auto mb-8 pr-2 scrollbar-thin">
                     {items.map(item => (
                       <div key={item.id} className="flex gap-4">
                          <div className="w-14 h-14 rounded-lg bg-gray-50 border border-gray-100 p-1 flex-shrink-0">
                             <img src={item.image} alt="" className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-sm font-bold">₱{(item.price * item.quantity).toLocaleString()}</div>
                       </div>
                     ))}
                  </div>
                  
                  <div className="border-t border-gray-100 pt-6 space-y-3 text-sm">
                    <div className="flex justify-between text-gray-500"><span>Subtotal</span> <span>₱{cartTotal.toLocaleString()}</span></div>
                    <div className="flex justify-between text-gray-500">
                      <span>Shipping</span>
                      {shippingFee === 0 && settings.shipping.freeThreshold > 0 && cartTotal >= settings.shipping.freeThreshold ? (
                         <span className="text-green-600 font-bold">Free</span>
                      ) : (
                         <span className="font-bold text-gray-900">₱{shippingFee.toLocaleString()}</span>
                      )}
                    </div>
                    <div className="flex justify-between text-gray-500"><span>Tax</span> <span>Included</span></div>
                  </div>
                  
                  <div className="border-t border-gray-100 mt-6 pt-6 flex justify-between items-center mb-8">
                     <span className="font-bold text-gray-900 text-lg">Total</span>
                     <span className="font-black text-primary text-2xl">₱{(cartTotal + shippingFee).toLocaleString()}</span>
                  </div>

                  <Button 
                    onClick={() => (document.getElementById('checkout-form') as HTMLFormElement)?.requestSubmit()}
                    fullWidth 
                    className="py-4 shadow-red-500/20 shadow-lg text-lg"
                    disabled={(!paymentSettings.cod.enabled && !paymentSettings.gcash.enabled && !paymentSettings.bank.enabled)}
                  >
                    Place Order
                  </Button>
                  
                  <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
                    <Lock size={12} /> Secure SSL Encryption
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
