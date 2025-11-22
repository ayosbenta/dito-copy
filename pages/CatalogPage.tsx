import React, { useState, useContext } from 'react';
import { Search, Filter } from 'lucide-react';
import { StoreContext } from '../contexts/StoreContext';
import { ProductCard } from '../components/UI';

const CatalogPage: React.FC = () => {
  const { products } = useContext(StoreContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const categories = ['All', 'Modems', 'Pocket WiFi', 'SIM Cards'];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pt-32 pb-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-32">
              <div className="flex items-center gap-2 font-bold text-gray-900 mb-6 pb-4 border-b">
                <Filter size={20} className="text-primary" />
                Filters
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Category</h3>
                  <div className="space-y-2">
                    {categories.map(cat => (
                      <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedCategory === cat ? 'bg-primary border-primary' : 'border-gray-300 bg-white group-hover:border-primary'}`}>
                          {selectedCategory === cat && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <input 
                          type="radio" 
                          name="category" 
                          className="hidden"
                          checked={selectedCategory === cat}
                          onChange={() => setSelectedCategory(cat)}
                        />
                        <span className={`text-sm ${selectedCategory === cat ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                   <h3 className="text-sm font-bold text-gray-900 mb-3">Price Range</h3>
                   <div className="flex items-center gap-2">
                     <input type="text" placeholder="Min" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none" />
                     <span className="text-gray-400">-</span>
                     <input type="text" placeholder="Max" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none" />
                   </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Header & Search */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
                <p className="text-gray-500 mt-1">Showing {filteredProducts.length} results</p>
              </div>
              
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search devices..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white shadow-sm"
                />
              </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500">Try adjusting your search or filters.</p>
                <button 
                  onClick={() => {setSearchTerm(''); setSelectedCategory('All');}}
                  className="mt-4 text-primary font-medium hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default CatalogPage;