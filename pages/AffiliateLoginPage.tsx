
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../contexts/StoreContext';
import { Affiliate } from '../types';
import { Button } from '../components/UI';
import { 
  Users, ArrowRight, Loader2, User, Mail, Smartphone, 
  Calendar, MapPin, Lock, Briefcase, ShieldCheck, Upload, 
  CheckCircle, AlertCircle, Eye, EyeOff, X, KeyRound
} from 'lucide-react';

const AffiliateLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { affiliates, registerAffiliate, isSyncing } = useContext(StoreContext);
  
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Login State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Registration State
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    birthDate: '',
    gender: 'Male',
    email: '',
    mobile: '',
    username: '',
    password: '',
    confirmPassword: '',
    agencyName: '',
    address: '',
    govtId: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  
  // --- Handlers ---

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5000000) { // 5MB limit
        setErrors(prev => ({ ...prev, govtId: 'File size too large (Max 5MB)' }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, govtId: reader.result as string }));
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.govtId;
            return newErrors;
          });
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName) newErrors.firstName = 'First Name is required';
    if (!formData.lastName) newErrors.lastName = 'Last Name is required';
    if (!formData.birthDate) newErrors.birthDate = 'Birth Date is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    
    if (!formData.mobile) newErrors.mobile = 'Mobile Number is required';
    if (!formData.username) newErrors.username = 'Username is required';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 chars';
    
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.govtId) newErrors.govtId = 'Valid Government ID is required';

    // Check duplication
    const emailExists = affiliates.some(a => a.email.toLowerCase() === formData.email.toLowerCase());
    if (emailExists) newErrors.email = 'Email is already registered';
    
    const usernameExists = affiliates.some(a => String(a.username || '').toLowerCase() === formData.username.toLowerCase());
    if (usernameExists) newErrors.username = 'Username is taken';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginUsername.trim()) {
      setLoginError('Please enter your username');
      return;
    }
    
    // Find affiliate by Username only (case-insensitive)
    // Ensure robust string comparison
    const affiliate = affiliates.find(a => 
      String(a.username || '').toLowerCase() === loginUsername.trim().toLowerCase()
    );
    
    if (affiliate) {
      if (affiliate.status === 'banned') {
        setLoginError('This account has been suspended. Please contact support.');
        return;
      }

      // Check Password with explicit string conversion
      const storedPassword = String(affiliate.password || '');
      if (storedPassword && storedPassword !== loginPassword) {
        setLoginError('Invalid password.');
        return;
      }
      
      localStorage.setItem('dito_affiliate_id', affiliate.id);
      navigate('/affiliate/dashboard');
    } else {
      setLoginError('Account not found. Please check your username.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      window.scrollTo(0,0); // Scroll to top to see errors
      return;
    }

    const newAffiliate: Affiliate = {
      id: `AFF-${Math.floor(Math.random() * 100000)}`,
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      walletBalance: 0,
      totalSales: 0,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'active',
      clicks: 0,
      lifetimeEarnings: 0,
      // Detailed Info
      firstName: formData.firstName,
      middleName: formData.middleName,
      lastName: formData.lastName,
      birthDate: formData.birthDate,
      gender: formData.gender as 'Male' | 'Female',
      mobile: formData.mobile,
      username: formData.username,
      password: formData.password,
      agencyName: formData.agencyName,
      address: formData.address,
      govtId: formData.govtId
    };

    registerAffiliate(newAffiliate);
    localStorage.setItem('dito_affiliate_id', newAffiliate.id);
    // Small delay to allow sync start
    setTimeout(() => navigate('/affiliate/dashboard'), 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
       <div className={`w-full bg-white rounded-3xl shadow-xl border border-gray-100 transition-all duration-500 ${isRegistering ? 'max-w-4xl' : 'max-w-md'}`}>
          
          {/* Header */}
          <div className="text-center pt-8 px-8">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Users size={32} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isRegistering ? 'Create Affiliate Account' : 'Affiliate Partner Login'}
            </h1>
            <p className="text-gray-500 mt-2">
              {isRegistering ? 'Join our program and earn commissions.' : 'Access your dashboard and sales reports.'}
            </p>
          </div>

          <div className="p-8">
            {!isRegistering ? (
              // --- LOGIN FORM ---
              <form onSubmit={handleLogin} className="space-y-6">
                {loginError && (
                  <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl text-center flex items-center justify-center gap-2">
                    <AlertCircle size={16} /> {loginError}
                  </div>
                )}
                
                {/* Username Input */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      required
                      value={loginUsername}
                      onChange={e => { setLoginUsername(e.target.value); setLoginError(''); }}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="Enter your username"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Password</label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type={showLoginPassword ? "text" : "password"}
                      required
                      value={loginPassword}
                      onChange={e => { setLoginPassword(e.target.value); setLoginError(''); }}
                      className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <Button fullWidth className="py-4 text-lg shadow-red-900/10" disabled={isSyncing}>
                  {isSyncing ? <Loader2 className="animate-spin" /> : 'Login to Dashboard'}
                </Button>

                {/* Demo Hint */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl text-center">
                   <p className="text-xs text-blue-600 font-bold uppercase mb-1">Demo Access</p>
                   <p className="text-sm text-blue-800">Username: <strong>demouser</strong></p>
                   <p className="text-sm text-blue-800">Password: <strong>password123</strong></p>
                   <button type="button" onClick={() => { setLoginUsername('demouser'); setLoginPassword('password123'); }} className="text-xs text-blue-500 underline mt-1 hover:text-blue-700">
                     Auto-fill Credentials
                   </button>
                </div>
              </form>
            ) : (
              // --- REGISTRATION FORM ---
              <form onSubmit={handleRegister} className="space-y-8 animate-fade-in">
                
                {/* Section 1: Personal Details */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 border-b pb-2">
                    <User className="text-primary" size={20} /> Personal Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="form-label">First Name <span className="text-red-500">*</span></label>
                      <input 
                        type="text"
                        name="firstName" 
                        value={formData.firstName} 
                        onChange={handleInputChange} 
                        className={`form-input ${errors.firstName ? 'border-red-500 bg-red-50' : ''}`}
                        placeholder="Juan"
                      />
                      {errors.firstName && <span className="form-error">{errors.firstName}</span>}
                    </div>
                    <div>
                      <label className="form-label">Middle Name</label>
                      <input 
                        type="text"
                        name="middleName" 
                        value={formData.middleName} 
                        onChange={handleInputChange} 
                        className="form-input"
                        placeholder="(Optional)"
                      />
                    </div>
                    <div>
                      <label className="form-label">Last Name <span className="text-red-500">*</span></label>
                      <input 
                        type="text"
                        name="lastName" 
                        value={formData.lastName} 
                        onChange={handleInputChange} 
                        className={`form-input ${errors.lastName ? 'border-red-500 bg-red-50' : ''}`}
                        placeholder="Dela Cruz"
                      />
                      {errors.lastName && <span className="form-error">{errors.lastName}</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Birth Date <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        <input 
                          type="date"
                          name="birthDate" 
                          value={formData.birthDate} 
                          onChange={handleInputChange} 
                          className={`form-input pl-10 ${errors.birthDate ? 'border-red-500 bg-red-50' : ''}`}
                        />
                      </div>
                      {errors.birthDate && <span className="form-error">{errors.birthDate}</span>}
                    </div>
                    <div>
                      <label className="form-label">Gender</label>
                      <select 
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="form-input bg-white"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Email Address <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        <input 
                          type="email"
                          name="email" 
                          value={formData.email} 
                          onChange={handleInputChange} 
                          className={`form-input pl-10 ${errors.email ? 'border-red-500 bg-red-50' : ''}`}
                          placeholder="email@example.com"
                        />
                      </div>
                      {errors.email && <span className="form-error">{errors.email}</span>}
                    </div>
                    <div>
                      <label className="form-label">Mobile Number <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        <input 
                          type="tel"
                          name="mobile" 
                          value={formData.mobile} 
                          onChange={handleInputChange} 
                          className={`form-input pl-10 ${errors.mobile ? 'border-red-500 bg-red-50' : ''}`}
                          placeholder="0917 123 4567"
                        />
                      </div>
                      {errors.mobile && <span className="form-error">{errors.mobile}</span>}
                    </div>
                  </div>
                </div>

                {/* Section 2: Credentials */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 border-b pb-2">
                    <Lock className="text-primary" size={20} /> Account Credentials
                  </h3>
                  <div>
                    <label className="form-label">Username <span className="text-red-500">*</span></label>
                    <input 
                      type="text"
                      name="username" 
                      value={formData.username} 
                      onChange={handleInputChange} 
                      className={`form-input ${errors.username ? 'border-red-500 bg-red-50' : ''}`}
                      placeholder="Create a unique username"
                    />
                    {errors.username && <span className="form-error">{errors.username}</span>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Password <span className="text-red-500">*</span></label>
                      <div className="relative">
                         <input 
                           type={showPassword ? "text" : "password"}
                           name="password" 
                           value={formData.password} 
                           onChange={handleInputChange} 
                           className={`form-input pr-10 ${errors.password ? 'border-red-500 bg-red-50' : ''}`}
                           placeholder="Min. 6 characters"
                         />
                         <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                           {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                         </button>
                      </div>
                      {errors.password && <span className="form-error">{errors.password}</span>}
                      {/* Password Strength Indicator */}
                      {formData.password && (
                         <div className="mt-2 flex gap-1 h-1">
                            <div className={`flex-1 rounded-full ${formData.password.length > 0 ? 'bg-red-500' : 'bg-gray-200'}`}></div>
                            <div className={`flex-1 rounded-full ${formData.password.length > 5 ? 'bg-yellow-500' : 'bg-gray-200'}`}></div>
                            <div className={`flex-1 rounded-full ${formData.password.length > 8 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                         </div>
                      )}
                    </div>
                    <div>
                      <label className="form-label">Confirm Password <span className="text-red-500">*</span></label>
                      <input 
                         type="password"
                         name="confirmPassword" 
                         value={formData.confirmPassword} 
                         onChange={handleInputChange} 
                         className={`form-input ${errors.confirmPassword ? 'border-red-500 bg-red-50' : ''}`}
                         placeholder="Re-enter password"
                       />
                       {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
                    </div>
                  </div>
                </div>

                {/* Section 3: Affiliate Details */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 border-b pb-2">
                    <Briefcase className="text-primary" size={20} /> Affiliate Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Affiliate / Agency Name</label>
                      <input 
                        type="text"
                        name="agencyName" 
                        value={formData.agencyName} 
                        onChange={handleInputChange} 
                        className="form-input"
                        placeholder="e.g. Juan's Digital Store (Optional)"
                      />
                    </div>
                    <div>
                       <label className="form-label">Address / Location <span className="text-red-500">*</span></label>
                       <div className="relative">
                         <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                         <input 
                           type="text"
                           name="address" 
                           value={formData.address} 
                           onChange={handleInputChange} 
                           className={`form-input pl-10 ${errors.address ? 'border-red-500 bg-red-50' : ''}`}
                           placeholder="City, Province"
                         />
                       </div>
                       {errors.address && <span className="form-error">{errors.address}</span>}
                    </div>
                  </div>
                </div>

                {/* Section 4: Verification */}
                <div className="space-y-4">
                   <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 border-b pb-2">
                    <ShieldCheck className="text-primary" size={20} /> Verification
                  </h3>
                  <div>
                    <label className="form-label">Upload Valid Government ID <span className="text-red-500">*</span></label>
                    <div className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-colors overflow-hidden ${errors.govtId ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-primary hover:bg-gray-50'}`}>
                       {formData.govtId ? (
                         <div className="relative w-full max-w-xs z-10">
                            <img src={formData.govtId} alt="ID Preview" className="w-full h-40 object-cover rounded-lg shadow-md" />
                            <button 
                              type="button"
                              onClick={() => setFormData(prev => ({...prev, govtId: ''}))}
                              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 z-20"
                            >
                              <X size={16} />
                            </button>
                            <p className="text-center text-xs text-green-600 font-bold mt-2 flex items-center justify-center gap-1"><CheckCircle size={12}/> Image Uploaded</p>
                         </div>
                       ) : (
                         <>
                           <Upload className="text-gray-400 mb-2" size={32} />
                           <p className="text-sm text-gray-500 font-medium">Click to upload or drag and drop</p>
                           <p className="text-xs text-gray-400 mt-1">PNG, JPG (Max 5MB)</p>
                           <input 
                             type="file" 
                             accept="image/*" 
                             onChange={handleFileChange}
                             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                           />
                         </>
                       )}
                    </div>
                    {errors.govtId && <span className="form-error block mt-2 text-center">{errors.govtId}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4">
                   <Button fullWidth className="py-4 text-lg shadow-lg shadow-red-900/10" disabled={isSyncing}>
                     {isSyncing ? <Loader2 className="animate-spin" /> : 'Create Affiliate Account'}
                   </Button>
                </div>

              </form>
            )}

            {/* Toggle Login/Register */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
               <p className="text-sm text-gray-500 mb-4">
                 {isRegistering ? 'Already have an account?' : 'Don\'t have an account yet?'}
               </p>
               <button 
                 onClick={() => { 
                   setIsRegistering(!isRegistering); 
                   setLoginError(''); 
                   setErrors({}); 
                   window.scrollTo(0,0); 
                 }}
                 className="text-primary font-bold hover:text-secondary transition-colors flex items-center justify-center gap-2 mx-auto"
               >
                 {isRegistering ? 'Login to existing account' : 'Register as a new partner'} <ArrowRight size={16} />
               </button>
            </div>

            <div className="mt-6 text-center">
               <button onClick={() => navigate('/')} className="text-xs text-gray-400 hover:text-gray-600">
                 ← Back to DITO Home Store
               </button>
            </div>
          </div>
       </div>

       <style>{`
         .form-label {
           display: block;
           font-size: 0.75rem;
           font-weight: 700;
           text-transform: uppercase;
           color: #6b7280;
           margin-bottom: 0.25rem;
           margin-left: 0.25rem;
         }
         .form-input {
           width: 100%;
           padding: 0.75rem 1rem;
           border-radius: 0.75rem;
           border: 1px solid #e5e7eb;
           outline: none;
           transition: all 0.2s;
           font-size: 0.875rem;
         }
         .form-input:focus {
           border-color: #C8102E;
           box-shadow: 0 0 0 2px rgba(200, 16, 46, 0.1);
         }
         .form-error {
           font-size: 0.75rem;
           color: #ef4444;
           margin-top: 0.25rem;
           margin-left: 0.25rem;
           display: block;
         }
       `}</style>
    </div>
  );
};

export default AffiliateLoginPage;
