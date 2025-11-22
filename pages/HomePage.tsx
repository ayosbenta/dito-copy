


import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, Shield, Wifi, CreditCard, Star, ArrowRight, Check, Loader2, 
  AlertTriangle, Smartphone, Globe, Unlock, ShoppingCart, CheckCircle2, 
  ChevronDown, ChevronUp, HelpCircle, Box, Tag, Layers
} from 'lucide-react';
import { StoreContext } from '../contexts/StoreContext';
import { CartContext } from '../contexts/CartContext';
import { Button } from '../components/UI';

// Icon Mapper for Dynamic Rendering
const IconMap: Record<string, any> = {
  Zap, Shield, Wifi, CreditCard, Smartphone, Globe, Unlock, ShoppingCart, CheckCircle2, Box, Tag, Layers
};

const HomePage: React.FC = () => {
  const { addToCart, setIsCartOpen } = useContext(CartContext);
  const { products, settings, isLoading } = useContext(StoreContext);
  
  // Accordion State for FAQ
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const heroProduct = products.find(p => p.id === 'dito-wowfi-pro') || products[0];

  const handleShopNow = () => {
    if (heroProduct) {
      addToCart(heroProduct);
      setIsCartOpen(true);
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-100 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary">
             <Wifi size={20} />
          </div>
        </div>
        <p className="text-gray-500 font-medium mt-6">Connecting to Store...</p>
        <p className="text-xs text-gray-400 mt-2">Getting things ready</p>
      </div>
    );
  }

  if (!heroProduct) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 mx-auto">
           <AlertTriangle className="text-red-500" size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Store Unavailable</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          We couldn't load the product catalog. Please check your internet connection or try again later.
        </p>
        <Button variant="primary" onClick={() => window.location.reload()} className="mt-6">
           Reload Page
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white font-sans">
      {/* Hero Section */}
      <section className="relative pt-28 pb-16 lg:pt-40 lg:pb-24 overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
           <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-red-50 rounded-full blur-3xl opacity-60"></div>
           <div className="absolute bottom-[10%] left-[-10%] w-[400px] h-[400px] bg-gray-50 rounded-full blur-3xl opacity-60"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Content - Top on Mobile */}
            <div className="space-y-8 text-center lg:text-left animate-fade-in-up order-1 w-full">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-red-100 text-primary font-bold text-xs tracking-widest uppercase mx-auto lg:mx-0">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                Best Seller
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 leading-[1.1] tracking-tight">
                {settings.hero.titlePrefix} <span className="text-primary block sm:inline">{settings.hero.titleHighlight}</span><br className="hidden sm:block" /> {settings.hero.titleSuffix}
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-500 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
                {settings.hero.subtitle}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-2 justify-center lg:justify-start">
                <Button variant="primary" className="px-12 py-4 text-lg shadow-xl shadow-red-600/20 rounded-full w-full sm:w-auto transition-transform hover:-translate-y-1" onClick={handleShopNow}>
                   {settings.hero.btnPrimary}
                </Button>
                <Link to={`/product/${heroProduct.id}`} className="w-full sm:w-auto">
                   <Button variant="outline" className="px-12 py-4 text-lg w-full rounded-full border-2 border-gray-200 text-gray-700 hover:border-primary hover:text-primary hover:bg-white transition-all">
                     {settings.hero.btnSecondary}
                   </Button>
                </Link>
              </div>
              
              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm font-bold text-gray-500">
                <div className="flex items-center gap-2">
                   <Check size={18} className="text-primary"/>
                   Plug & Play
                </div>
                <div className="flex items-center gap-2">
                   <Check size={18} className="text-primary"/>
                   Free 50GB Data
                </div>
                <div className="flex items-center gap-2">
                   <Check size={18} className="text-primary"/>
                   No Lock-in
                </div>
              </div>
            </div>

            {/* Image - Bottom on Mobile */}
            <div className="relative w-full order-2 mt-6 lg:mt-0 flex justify-center lg:justify-end">
              <div className="relative z-10 w-full max-w-md">
                <div className="relative bg-white rounded-[3rem] shadow-2xl shadow-gray-200/80 border border-gray-100 p-8 aspect-[4/5] sm:aspect-square flex items-center justify-center overflow-hidden group">
                   
                   {/* Scenic Background Gradient Simulation */}
                   <div className="absolute inset-0 bg-gradient-to-b from-[#F0F4FF] to-white opacity-80"></div>
                   <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-white to-transparent opacity-100"></div>
                   
                   <img 
                     src={settings.hero.heroImage || heroProduct.image} 
                     alt="DITO Home WoWFi Pro" 
                     className="relative z-10 w-[110%] h-auto object-contain transform group-hover:scale-105 transition-transform duration-700 ease-out drop-shadow-xl"
                   />

                   {/* Floating Price Tag */}
                   <div className="absolute bottom-8 bg-white/95 backdrop-blur-md border border-gray-100 pl-6 pr-8 py-4 rounded-2xl shadow-xl flex items-center gap-4 animate-fade-in-up">
                      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-primary">
                        <Wifi size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Start Today</p>
                        <p className="text-2xl font-black text-gray-900">₱{heroProduct.price.toLocaleString()}</p>
                      </div>
                   </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-dashed border-gray-200 rounded-full -z-10 animate-[spin_60s_linear_infinite]"></div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">{settings.features.title}</h2>
            <p className="text-gray-500">{settings.features.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {settings.features.list.map((feature, idx) => {
              const Icon = IconMap[feature.icon] || Zap;
              return (
                <div key={idx} className="p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:border-red-100 transition-all group">
                  <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="text-primary" size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
             <h2 className="text-3xl font-bold text-gray-900 mb-4">{settings.howItWorks.title}</h2>
             <div className="w-20 h-1 bg-primary mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
             {/* Connector Line (Desktop) */}
             <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gray-200 -z-10"></div>
             
             {settings.howItWorks.list.map((step, i) => {
               const Icon = IconMap[step.icon] || Box;
               return (
                 <div key={i} className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center mb-6 border-4 border-gray-50 relative z-10">
                       <Icon size={32} className="text-primary" />
                       <div className="absolute top-0 right-0 bg-gray-900 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white">
                          {step.step}
                       </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-500 max-w-xs">{step.desc}</p>
                 </div>
               );
             })}
          </div>
          
          <div className="text-center mt-12">
             <Button onClick={handleShopNow} className="px-10 py-4 shadow-xl shadow-red-500/20">
                Buy Now & Get Connected
             </Button>
          </div>
        </div>
      </section>

      {/* Pricing / Plans Section */}
      <section className="py-24 bg-white">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 max-w-2xl mx-auto">
               <h2 className="text-3xl font-bold text-gray-900 mb-4">{settings.pricing.title}</h2>
               <p className="text-gray-500">{settings.pricing.subtitle}</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
               {settings.pricing.list.map((plan, idx) => (
                  <div key={idx} className={`rounded-3xl p-8 transition-all relative overflow-hidden group ${
                     plan.highlight 
                      ? 'border-2 border-primary shadow-2xl shadow-red-900/10 bg-white transform lg:-translate-y-4' 
                      : 'border border-gray-200 hover:shadow-xl'
                  }`}>
                    {plan.highlight && <div className="absolute top-0 inset-x-0 bg-primary h-1.5"></div>}
                    {plan.tag && (
                      <div className={`absolute top-0 right-0 text-xs font-bold px-3 py-1 rounded-bl-xl ${plan.highlight ? 'bg-red-50 text-primary top-4 right-4 rounded-lg' : 'bg-gray-100 text-gray-600'}`}>
                         {plan.tag}
                      </div>
                    )}
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                       {plan.description && <span className="text-sm text-gray-500 mr-1">{plan.description}</span>}
                       <span className="text-4xl font-black text-gray-900">₱{plan.price}</span>
                       {plan.period && <span className="text-gray-400 font-medium">{plan.period}</span>}
                    </div>

                    <ul className="space-y-4 mb-8 text-sm text-gray-600">
                       {plan.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-center gap-2">
                             <CheckCircle2 size={16} className={plan.highlight ? "text-primary" : "text-green-500"}/> 
                             {feat}
                          </li>
                       ))}
                    </ul>
                    
                    {/* Dynamic Link Logic */}
                    {plan.productId ? (
                      <Link to={`/product/${plan.productId}`} className="w-full">
                         <Button 
                           variant={plan.highlight ? 'primary' : 'outline'} 
                           fullWidth 
                           className={plan.highlight ? 'shadow-lg shadow-red-500/20' : 'group-hover:bg-gray-900 group-hover:text-white group-hover:border-gray-900'}
                        >
                           {plan.btnText}
                        </Button>
                      </Link>
                    ) : (
                       <Button 
                          onClick={handleShopNow} 
                          variant={plan.highlight ? 'primary' : 'outline'} 
                          fullWidth 
                          className={plan.highlight ? 'shadow-lg shadow-red-500/20' : 'group-hover:bg-gray-900 group-hover:text-white group-hover:border-gray-900'}
                       >
                          {plan.btnText}
                       </Button>
                    )}
                    
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{settings.testimonials.title}</h2>
              <p className="text-gray-500 mt-2">{settings.testimonials.subtitle}</p>
            </div>
            <div className="hidden sm:flex gap-2">
               <button className="p-2 rounded-full border bg-white hover:bg-gray-50"><ArrowRight className="rotate-180" size={20}/></button>
               <button className="p-2 rounded-full border bg-primary text-white hover:bg-secondary"><ArrowRight size={20}/></button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {settings.testimonials.list.map((t, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex gap-1 text-yellow-400 mb-6">
                  {[...Array(5)].map((_, j) => <Star key={j} size={16} fill="currentColor" />)}
                </div>
                <p className="text-gray-700 mb-8 italic leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                     <img src={`https://ui-avatars.com/api/?name=${t.name}&background=random`} alt={t.name} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{t.name}</h4>
                    <p className="text-xs text-gray-500">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
         <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
               <h2 className="text-3xl font-bold text-gray-900 mb-4">{settings.faqs.title}</h2>
               <div className="w-20 h-1 bg-gray-200 mx-auto rounded-full"></div>
            </div>

            <div className="space-y-4">
               {settings.faqs.list.map((item, i) => (
                 <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden">
                    <button 
                      onClick={() => toggleFaq(i)}
                      className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                    >
                       <span className="font-bold text-gray-900 flex items-center gap-3">
                          <HelpCircle size={18} className="text-primary" /> {item.q}
                       </span>
                       {openFaqIndex === i ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                    </button>
                    {openFaqIndex === i && (
                       <div className="px-6 pb-6 pt-0 text-gray-600 text-sm leading-relaxed animate-fade-in">
                          <div className="pl-8">{item.a}</div>
                       </div>
                    )}
                 </div>
               ))}
            </div>
         </div>
      </section>
      
      {/* Final CTA Strip */}
      <section className="py-20 bg-gray-900 text-white relative overflow-hidden">
         {settings.cta.image && (
            <div className="absolute inset-0 opacity-20">
               <img src={settings.cta.image} alt="" className="w-full h-full object-cover" />
            </div>
         )}
         <div className="absolute top-0 right-0 w-1/2 h-full bg-gray-800 skew-x-12 translate-x-20 opacity-50"></div>
         <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{settings.cta.title}</h2>
            <p className="text-gray-400 mb-8 text-lg">{settings.cta.subtitle}</p>
            <Button variant="primary" className="px-12 py-4 text-lg mx-auto rounded-full shadow-lg shadow-red-900/50 hover:scale-105 transform transition-all" onClick={handleShopNow}>
               {settings.cta.btnText}
            </Button>
         </div>
      </section>
    </div>
  );
};

export default HomePage;