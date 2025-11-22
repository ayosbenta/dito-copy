
import React, { useState, useEffect, useContext, useRef } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartItem, Product } from './types';
import { Navbar, Footer, CartDrawer } from './components/Layout';
import AIChatBot from './components/AIChatBot';
import { CartContext, CartProvider } from './contexts/CartContext';
import { StoreProvider, StoreContext } from './contexts/StoreContext';

// Pages
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminDashboard from './pages/AdminDashboard';
import AffiliateLoginPage from './pages/AffiliateLoginPage';
import AffiliateDashboard from './pages/AffiliateDashboard';
import CustomerLoginPage from './pages/CustomerLoginPage';
import CustomerDashboard from './pages/CustomerDashboard';

// Helper to capture ?ref=ID
const ReferralHandler = () => {
  const location = useLocation();
  const { trackAffiliateClick, isLoading, affiliates } = useContext(StoreContext);
  const processedRef = useRef<string | null>(null);

  useEffect(() => {
    if (isLoading) return;

    const params = new URLSearchParams(location.search);
    let refId = params.get('ref');

    if (!refId) {
      const search = window.location.search;
      const urlParams = new URLSearchParams(search);
      refId = urlParams.get('ref');
    }
    
    if (!refId && window.location.hash.includes('ref=')) {
         const match = window.location.hash.match(/[?&]ref=([^&]+)/);
         if (match) refId = match[1];
    }

    if (refId && refId !== processedRef.current) {
      localStorage.setItem('dito_referral_id', refId);
      
      const isValidAffiliate = affiliates.some(a => a.id === refId);

      if (isValidAffiliate) {
          console.log('Referral Click Tracked:', refId);
          trackAffiliateClick(refId);
          processedRef.current = refId;
      } else if (affiliates.length > 0) {
          console.warn('Invalid Affiliate ID:', refId);
          processedRef.current = refId;
      }
    }
  }, [location.search, trackAffiliateClick, isLoading, affiliates]);

  return null;
};

// Scroll To Top Wrapper
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppContent: React.FC = () => {
  return (
      <CartProvider>
        <Router>
          <ScrollToTop />
          <ReferralHandler />
          <div className="min-h-screen flex flex-col font-sans text-gray-900">
            <Routes>
              {/* Admin Route */}
              <Route path="/admin" element={<AdminDashboard />} />
              
              {/* Affiliate Routes */}
              <Route path="/affiliate/login" element={<AffiliateLoginPage />} />
              <Route path="/affiliate/dashboard" element={
                <>
                  <Navbar />
                  <AffiliateDashboard />
                </>
              } />

              {/* Customer Route */}
              <Route path="/customer/login" element={<CustomerLoginPage />} />
              <Route path="/customer/dashboard" element={
                <>
                  <Navbar />
                  <CustomerDashboard />
                </>
              } />

              {/* Public Routes */}
              <Route path="*" element={
                <>
                  <Navbar />
                  <main className="flex-grow">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/catalog" element={<CatalogPage />} />
                      <Route path="/product/:id" element={<ProductDetailPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                    </Routes>
                  </main>
                  <Footer />
                  <CartDrawer />
                  <AIChatBot />
                </>
              } />
            </Routes>
          </div>
        </Router>
      </CartProvider>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
};

export default App;