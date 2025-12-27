
import React, { useState, useEffect } from 'react';
import { Order, Product, Language, Role } from '../types';
import { translations } from '../translations';

interface MarketplaceProps {
  language: Language;
}

const CATEGORIES = ['All', 'Seeds', 'Fertilizers', 'Irrigation', 'Equipment', 'Organic'];

export const Marketplace: React.FC<MarketplaceProps> = ({ language }) => {
  const t = translations[language];
  const [activeCat, setActiveCat] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [showOrders, setShowOrders] = useState(false);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [buyingProduct, setBuyingProduct] = useState<Product | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const loadData = () => {
    const savedInventory = localStorage.getItem('omkar_inventory');
    if (savedInventory) setProducts(JSON.parse(savedInventory));

    const savedProfile = localStorage.getItem('omkar_user_profile');
    const profile = savedProfile ? JSON.parse(savedProfile) : {};
    const mobile = profile.mobileNumber || '';

    const savedOrdersStr = localStorage.getItem('omkar_orders');
    if (savedOrdersStr) {
      const allOrders: Order[] = JSON.parse(savedOrdersStr);
      const filtered = allOrders.filter(o => o.customerMobile === mobile);
      setUserOrders(filtered);
    }
  };

  useEffect(() => {
    loadData();
    const handleStorageChange = () => loadData();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleBuy = async (product: Product) => {
    setIsProcessing(true);
    
    // 1. Get User Profile
    const savedProfile = localStorage.getItem('omkar_user_profile');
    const profile = savedProfile ? JSON.parse(savedProfile) : {};
    
    if (!profile.name || !profile.mobileNumber) {
      alert("Please complete your profile first to place an order.");
      setIsProcessing(false);
      return;
    }

    // 2. Create Order Object
    const newOrder: Order = {
      id: `ORD-${Math.floor(Math.random() * 100000)}`,
      customerName: profile.name,
      customerEmail: profile.email || '',
      customerMobile: profile.mobileNumber,
      village: profile.village || '',
      city: profile.city || '',
      district: profile.district || '',
      state: profile.state || 'Maharashtra',
      permanentAddress: profile.permanentAddress || '',
      date: new Date().toISOString().split('T')[0],
      total: `₹${product.price}`,
      status: 'Pending',
      items: [product.name]
    };

    // 3. Save Order
    const savedOrdersStr = localStorage.getItem('omkar_orders');
    const allOrders = savedOrdersStr ? JSON.parse(savedOrdersStr) : [];
    localStorage.setItem('omkar_orders', JSON.stringify([newOrder, ...allOrders]));

    // 4. Update Inventory Stock
    const updatedProducts = products.map(p => {
      if (p.id === product.id) {
        return { ...p, stock: Math.max(0, p.stock - 1) };
      }
      return p;
    });
    localStorage.setItem('omkar_inventory', JSON.stringify(updatedProducts));
    setProducts(updatedProducts);

    // 5. Feedback
    setOrderSuccess(true);
    setIsProcessing(false);
    setBuyingProduct(null);
    
    // Trigger update in profile and other components
    window.dispatchEvent(new Event('storage'));
    
    setTimeout(() => setOrderSuccess(false), 3000);
  };

  const filtered = activeCat === 'All' ? products : products.filter(p => p.category === activeCat);

  return (
    <div className="space-y-8 relative pb-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-emerald-900 tracking-tight">{t.navMarket}</h2>
          <p className="text-stone-500 font-medium mt-1">Direct from Omkar Udhyog centers.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide bg-white p-1 rounded-full border border-stone-100 shadow-sm">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => { setActiveCat(cat); setShowOrders(false); }}
                className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeCat === cat && !showOrders ? 'bg-emerald-700 text-white shadow-md' : 'text-stone-400 hover:text-emerald-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setShowOrders(!showOrders)}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm ${
              showOrders ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 border border-stone-100 hover:border-emerald-300'
            }`}
          >
            <i className="fas fa-receipt text-sm"></i>
            {t.myOrders}
            {userOrders.length > 0 && <span className="bg-amber-400 text-stone-900 w-5 h-5 rounded-lg flex items-center justify-center text-[8px] ml-1">{userOrders.length}</span>}
          </button>
        </div>
      </div>

      {!showOrders ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filtered.map(product => (
            <div key={product.id} className="bg-white rounded-[2.5rem] border border-stone-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all group flex flex-col h-full">
              <div className="h-56 relative overflow-hidden shrink-0">
                <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.name} />
                {product.stock <= 0 && (
                  <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center">
                    <span className="bg-red-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Out of Stock</span>
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                   <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">{product.category}</span>
                   <span className={`text-[8px] font-black uppercase tracking-widest ${product.stock < 10 ? 'text-amber-600' : 'text-stone-300'}`}>Stock: {product.stock}</span>
                </div>
                <h3 className="font-black text-stone-800 text-base min-h-[3rem] line-clamp-2 leading-tight">{product.name}</h3>
                <p className="text-stone-400 text-xs line-clamp-2 mt-2 leading-relaxed">{product.description}</p>
                <div className="mt-auto pt-6 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1">{t.mandiPrice}</p>
                    <p className="text-xl font-black text-emerald-800">₹{product.price}</p>
                  </div>
                  <button 
                    disabled={product.stock <= 0}
                    onClick={() => setBuyingProduct(product)}
                    className={`h-12 px-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm ${
                      product.stock <= 0 
                      ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                      : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                    }`}
                  >
                    {t.buy}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-10 rounded-[3rem] border border-stone-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-stone-800">{t.myOrders}</h3>
            <span className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
              {userOrders.length} Completed
            </span>
          </div>
          
          {userOrders.length === 0 ? (
            <div className="text-center py-20 bg-stone-50 rounded-[2.5rem] border-2 border-dashed border-stone-100">
              <i className="fas fa-shopping-basket text-4xl text-stone-200 mb-4"></i>
              <p className="text-stone-400 font-bold uppercase text-[10px] tracking-widest">You haven't placed any orders yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userOrders.map(order => (
                <div key={order.id} className="bg-stone-50 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-emerald-100">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-600 font-black text-xs shadow-sm">
                      {order.items.length}
                    </div>
                    <div>
                      <h4 className="font-black text-stone-800 text-lg">{order.items[0]}</h4>
                      <div className="flex gap-3 text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">
                        <span>{order.id}</span>
                        <span>•</span>
                        <span>{order.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-10">
                    <div className="text-right">
                      <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Total</p>
                      <p className="text-xl font-black text-emerald-800">{order.total}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                      order.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {order.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {buyingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-md" onClick={() => !isProcessing && setBuyingProduct(null)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="bg-emerald-900 p-8 text-white">
              <h3 className="text-2xl font-black">Confirm Purchase</h3>
              <p className="text-emerald-300 text-[10px] font-bold uppercase mt-1 tracking-widest">Quick Buy Flow</p>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex gap-4">
                <img src={buyingProduct.image} className="w-20 h-20 rounded-2xl object-cover" alt="" />
                <div>
                  <h4 className="font-black text-stone-800">{buyingProduct.name}</h4>
                  <p className="text-emerald-700 font-black text-xl mt-1">₹{buyingProduct.price}</p>
                </div>
              </div>
              
              <div className="bg-stone-50 p-4 rounded-2xl space-y-2 border border-stone-100">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-stone-400 uppercase">Unit Price</span>
                  <span className="text-stone-800">₹{buyingProduct.price}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-stone-400 uppercase">Quantity</span>
                  <span className="text-stone-800">1</span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex justify-between font-black">
                  <span className="text-stone-600 uppercase text-[10px]">Total</span>
                  <span className="text-emerald-800 text-lg">₹{buyingProduct.price}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  disabled={isProcessing}
                  onClick={() => setBuyingProduct(null)}
                  className="flex-1 py-4 rounded-2xl font-black text-stone-400 uppercase text-[10px] tracking-widest hover:bg-stone-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  disabled={isProcessing}
                  onClick={() => handleBuy(buyingProduct)}
                  className="flex-1 bg-emerald-700 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-emerald-800 transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-check"></i>}
                  Place Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {orderSuccess && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[110] animate-in slide-in-from-bottom-8 duration-500">
          <div className="bg-emerald-900 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 border border-emerald-500/30">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
              <i className="fas fa-check text-xs"></i>
            </div>
            <div>
              <p className="font-black text-xs uppercase tracking-widest">Order Successful!</p>
              <p className="text-[10px] font-bold text-emerald-300">Tracking Ref Generated</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
