
import React, { useContext, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Truck, Shield, Wifi, ChevronRight, Info, Minus, Plus, AlertTriangle, Tag, Box, CheckCircle } from 'lucide-react';
import { StoreContext } from '../contexts/StoreContext';
import { CartContext } from '../contexts/CartContext';
import { Button } from '../components/UI';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart, setIsCartOpen } = useContext(CartContext);
  const { products } = useContext(StoreContext);
  const [quantity, setQuantity] = useState(1);
  
  const product = products.find(p => p.id === id);
  const [activeImage, setActiveImage] = useState<string>('');

  useEffect(() => {
    if (product) {
      setActiveImage(product.image);
    }
  }, [product]);

  if (!product) {
    return <div className="pt-40 text-center">Product not found</div>;
  }

  const stock = product.stock ?? 0; 
  const isLowStock = stock <= (product.minStockLevel ?? 10);
  const isOutOfStock = stock === 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    // Logic to prevent adding more than stock is handled in Context, 
    // but here we pass quantity relative to single add actions usually.
    // However, context's addToCart adds 1 at a time or merges.
    // Let's loop to add 'quantity' times or improve context later. 
    // For safety, we check stock here too.
    if (quantity > stock) {
        alert(`Only ${stock} items available.`);
        return;
    }
    
    for(let i=0; i<quantity; i++) addToCart(product);
    setIsCartOpen(true);
  };

  return (
    <div className="pt-28 pb-20 min-h-screen bg-white">
       {/* Breadcrumbs */}
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
         <nav className="flex text-sm text-gray-500 items-center gap-2">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link to="/catalog" className="hover:text-primary transition-colors">Catalog</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium truncate">{product.name}</span>
        </nav>
       </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left: Images */}
          <div className="space-y-6">
            <div className="aspect-square bg-[#F9FAFB] rounded-3xl overflow-hidden border border-gray-100 shadow-sm flex items-center justify-center p-8 relative group">
              <img 
                src={activeImage} 
                alt={product.name} 
                className={`w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ${isOutOfStock ? 'grayscale opacity-60' : ''}`} 
              />
              <div className="absolute top-6 left-6">
                 {isOutOfStock ? (
                    <div className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm border border-red-200 flex items-center gap-2">
                       <AlertTriangle size={14} /> Out of Stock
                    </div>
                 ) : (
                    <div className="bg-white/80 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm text-gray-900 border border-gray-100 flex items-center gap-2">
                       <CheckCircle size={14} className="text-green-600" /> In Stock
                    </div>
                 )}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.gallery && product.gallery.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveImage(img)}
                  className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all p-2 bg-gray-50 ${activeImage === img ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-gray-200'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col pt-4">
            <div className="mb-6">
              <span className="text-primary font-bold tracking-wider text-xs uppercase bg-red-50 px-3 py-1 rounded-full">{product.category}</span>
              <h1 className="text-4xl font-extrabold text-gray-900 mt-4 mb-2 leading-tight">{product.name}</h1>
              <p className="text-lg text-gray-500 font-light">{product.subtitle}</p>
            </div>

            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} />
                ))}
              </div>
              <span className="text-sm text-gray-400">|</span>
              <span className="text-sm text-gray-600 font-medium hover:text-primary cursor-pointer underline-offset-2 hover:underline">{product.reviews} Verified Reviews</span>
            </div>

            <div className="mb-8">
               <div className="flex items-baseline gap-2">
                 <span className="text-5xl font-bold text-primary tracking-tight">₱{product.price.toLocaleString()}</span>
                 <span className="text-gray-400 text-lg line-through">₱{(product.price * 1.2).toFixed(0).toLocaleString()}</span>
               </div>
               <p className="text-sm text-gray-500 mt-2">Inclusive of VAT. Free shipping nationwide.</p>
               
               {/* Explicit Stock Display */}
               <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Availability:</span>
                  {isOutOfStock ? (
                    <span className="text-sm font-bold text-red-600">Sold Out</span>
                  ) : (
                    <span className={`text-sm font-bold ${isLowStock ? 'text-orange-600' : 'text-green-600'}`}>
                      {stock} units available
                    </span>
                  )}
               </div>
               
               {isLowStock && !isOutOfStock && (
                 <p className="mt-2 flex items-center gap-2 text-orange-600 font-bold text-xs animate-pulse">
                    <AlertTriangle size={14} /> Low stock - Order soon!
                 </p>
               )}
            </div>

            {/* Bulk Discounts Badge */}
            {product.bulkDiscounts && product.bulkDiscounts.length > 0 && (
              <div className="mb-8 p-4 bg-green-50 border border-green-100 rounded-xl">
                <h4 className="text-sm font-bold text-green-800 flex items-center gap-2 mb-3">
                   <Tag size={16} /> Bulk Savings Available
                </h4>
                <div className="flex flex-wrap gap-2">
                  {product.bulkDiscounts.sort((a,b) => a.minQty - b.minQty).map((d, idx) => (
                    <div key={idx} className="bg-white border border-green-200 px-3 py-1 rounded-lg text-xs text-green-700 shadow-sm">
                       Buy {d.minQty}+ get <strong>{d.percentage}% OFF</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-8">
               <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4 mb-10">
               <div className="flex gap-4">
                  <div className={`flex items-center border border-gray-200 rounded-xl w-32 bg-white ${isOutOfStock ? 'opacity-50 pointer-events-none' : ''}`}>
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                      className="w-10 h-full flex items-center justify-center hover:bg-gray-50 text-gray-500"
                      disabled={isOutOfStock}
                    >
                       <Minus size={16}/>
                    </button>
                    <div className="flex-1 text-center font-bold text-gray-900">{quantity}</div>
                    <button 
                      onClick={() => setQuantity(Math.min(stock, quantity + 1))} 
                      className="w-10 h-full flex items-center justify-center hover:bg-gray-50 text-gray-500"
                      disabled={isOutOfStock || quantity >= stock}
                    >
                       <Plus size={16}/>
                    </button>
                  </div>
                  <Button onClick={handleAddToCart} disabled={isOutOfStock} className={`flex-1 py-4 text-lg shadow-red-500/20 shadow-lg ${isOutOfStock ? 'bg-gray-400 shadow-none cursor-not-allowed hover:bg-gray-400' : ''}`}>
                    {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
               </div>
               {!isOutOfStock && (
                 <Button variant="outline" className="w-full py-4">
                    Buy Now
                 </Button>
               )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 text-center text-sm text-gray-500 bg-gray-50 p-4 rounded-2xl">
               <div className="flex flex-col items-center gap-2">
                 <Truck className="text-gray-900" size={20} />
                 <span>Free Shipping</span>
               </div>
               <div className="flex flex-col items-center gap-2">
                 <Shield className="text-gray-900" size={20} />
                 <span>1 Year Warranty</span>
               </div>
               <div className="flex flex-col items-center gap-2">
                 <Wifi className="text-gray-900" size={20} />
                 <span>4G/5G Enabled</span>
               </div>
            </div>
          </div>
        </div>

        {/* Specifications Section */}
        {product.specs && Object.keys(product.specs).length > 0 && (
          <div className="mt-24 max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-gray-900">Technical Specifications</h2>
              <div className="w-12 h-1 bg-primary mx-auto mt-4 rounded-full"></div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-gray-200">
                  {/* We split specs into two columns dynamically */}
                  <div className="p-8 space-y-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Wifi size={20} className="text-primary" /> General Specs
                    </h3>
                    <ul className="space-y-4">
                        {Object.entries(product.specs).slice(0, Math.ceil(Object.keys(product.specs).length / 2)).map(([key, value]) => (
                          <li key={key} className="flex justify-between text-sm border-b border-gray-50 pb-2 last:border-0">
                            <span className="text-gray-500">{key}</span> 
                            <span className="font-medium text-gray-900">{value}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                  <div className="p-8 space-y-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Info size={20} className="text-primary" /> Additional Info
                    </h3>
                    <ul className="space-y-4">
                        {Object.entries(product.specs).slice(Math.ceil(Object.keys(product.specs).length / 2)).map(([key, value]) => (
                          <li key={key} className="flex justify-between text-sm border-b border-gray-50 pb-2 last:border-0">
                            <span className="text-gray-500">{key}</span> 
                            <span className="font-medium text-gray-900">{value}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
              </div>
            </div>
          </div>
        )}

        {/* Inclusions Section */}
        {product.inclusions && product.inclusions.length > 0 && (
          <div className="mt-12 max-w-2xl mx-auto">
             <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg">
                   <Box size={24} className="text-primary" /> What's in the box?
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                   {product.inclusions.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                         <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                         <span className="text-gray-700 font-medium text-sm">{item}</span>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductDetailPage;
