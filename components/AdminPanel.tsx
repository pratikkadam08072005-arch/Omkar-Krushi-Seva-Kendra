
import React, { useState, useRef, useEffect } from 'react';
import { Product, Order } from '../types';

type AdminTab = 'analytics' | 'inventory' | 'orders' | 'profile';

interface AdminPanelProps {
  language: any;
  initialTab?: AdminTab;
}

const DEFAULT_PRODUCTS: Product[] = [
  // Seeds
  { id: 's1', name: 'Premium Bt Cotton Seeds (High Yield)', category: 'Seeds', price: '850', image: 'https://images.unsplash.com/photo-1594752494917-a781f727829a?auto=format&fit=crop&q=80&w=400', description: 'Advanced Bt technology for pest resistance and superior fiber quality.', stock: 240 },
  { id: 's2', name: 'Soyabean Hybrid Seeds (JS-335)', category: 'Seeds', price: '3200', image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=400', description: 'High protein content and drought resistant variety.', stock: 150 },
  { id: 's3', name: 'Hybrid Maize Gold-66', category: 'Seeds', price: '1200', image: 'https://images.unsplash.com/photo-1551733979-9cb61c0eaa48?auto=format&fit=crop&q=80&w=400', description: 'Large grain size, perfect for cattle feed and industrial use.', stock: 80 },
  { id: 's4', name: 'Hybrid Onion Seeds (Pusa Red)', category: 'Seeds', price: '1450', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&q=80&w=400', description: 'Long shelf life, uniform bulbs, ideal for Kharif/Rabi.', stock: 120 },
  { id: 's5', name: 'Hybrid Chili Seeds (Teja-4)', category: 'Seeds', price: '620', image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&q=80&w=400', description: 'Hot spicy variety with deep red color, ideal for exports.', stock: 110 },
  
  // Fertilizers
  { id: 'f1', name: 'NPK Fertilizer (19:19:19)', category: 'Fertilizers', price: '450', image: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=400', description: 'Water-soluble balanced fertilizer for all-round growth.', stock: 500 },
  { id: 'f2', name: 'DAP (Diammonium Phosphate)', category: 'Fertilizers', price: '1350', image: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&q=80&w=400', description: 'Excellent source of Phosphorus and Nitrogen for early growth.', stock: 200 },
  { id: 'f3', name: 'Nano Urea (Liquid) - 500ml', category: 'Fertilizers', price: '240', image: 'https://images.unsplash.com/photo-1592890678914-71018579a952?auto=format&fit=crop&q=80&w=400', description: 'Revolutionary high-efficiency urea for foliar spray.', stock: 450 },
  { id: 'f4', name: 'Bio-Potash Organic Booster', category: 'Fertilizers', price: '580', image: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=400', description: 'Increases fruit size and sweetness naturally.', stock: 180 },
  
  // Irrigation
  { id: 'i1', name: 'Drip Irrigation Kit (1 Acre)', category: 'Irrigation', price: '12500', image: 'https://images.unsplash.com/photo-1590682680375-393475d83637?auto=format&fit=crop&q=80&w=400', description: 'Complete drip system with filters, pipes, and emitters.', stock: 45 },
  { id: 'i2', name: 'Submersible Water Pump (5HP)', category: 'Irrigation', price: '18900', image: 'https://images.unsplash.com/photo-1622322062602-0c30f40f0c00?auto=format&fit=crop&q=80&w=400', description: 'Heavy-duty copper winding motor for deep wells.', stock: 15 },
  { id: 'i3', name: 'Automated Fogger System', category: 'Irrigation', price: '3400', image: 'https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&q=80&w=400', description: 'Ideal for greenhouses and high-value nurseries.', stock: 30 },
  
  // Equipment
  { id: 'e1', name: 'Battery Operated Sprayer (16L)', category: 'Equipment', price: '2800', image: 'https://images.unsplash.com/photo-1530507629858-e4977d30e9e0?auto=format&fit=crop&q=80&w=400', description: 'Rechargeable, long-lasting battery with 4-nozzle set.', stock: 65 },
  { id: 'e2', name: 'Power Tiller (Petrol 7HP)', category: 'Equipment', price: '42500', image: 'https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?auto=format&fit=crop&q=80&w=400', description: 'Compact and powerful tiller for inter-cultivation and weeding.', stock: 8 },
  { id: 'e3', name: 'Handheld Soil pH Meter', category: 'Equipment', price: '850', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400', description: 'Instant reading of soil pH and moisture levels.', stock: 40 },
  
  // Organic
  { id: 'o1', name: 'Cold-Pressed Neem Oil (1L)', category: 'Organic', price: '480', image: 'https://images.unsplash.com/photo-1615485240314-10037ca06180?auto=format&fit=crop&q=80&w=400', description: 'Natural pest deterrent and antifungal agent.', stock: 85 },
  { id: 'o2', name: 'Premium Vermicompost (40kg)', category: 'Organic', price: '450', image: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=400', description: 'Pure earthworm compost for soil rejuvenation.', stock: 100 },
  { id: 'o3', name: 'Pheromone Trap (Set of 5)', category: 'Organic', price: '550', image: 'https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?auto=format&fit=crop&q=80&w=400', description: 'Eco-friendly monitoring for Pink Bollworm and Fruit Fly.', stock: 200 },
];

export const AdminPanel: React.FC<AdminPanelProps> = ({ language, initialTab = 'analytics' }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const [orders, setOrders] = useState<Order[]>([]);
  
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({ name: '', category: 'Seeds', price: '', stock: 0, image: '', description: '' });

  const [adminProfile, setAdminProfile] = useState({
    name: 'Bhagwan Kadam',
    role: 'Managing Director & Founder',
    email: 'admin@omkarkrushi.com',
    mobile: '+91 94220-XXXXX',
    address: 'Omkar Krushi Udhyog HQ, Market Yard, Pune, Maharashtra',
    joinedDate: '2018'
  });

  useEffect(() => {
    const savedAdmin = localStorage.getItem('omkar_admin_profile');
    if (savedAdmin) setAdminProfile(JSON.parse(savedAdmin));

    const savedProducts = localStorage.getItem('omkar_inventory');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      setProducts(DEFAULT_PRODUCTS);
      localStorage.setItem('omkar_inventory', JSON.stringify(DEFAULT_PRODUCTS));
    }
    loadOrders();
  }, []);

  // Update active tab if initialTab changes (e.g. from sidebar click)
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const loadOrders = () => {
    const savedOrders = localStorage.getItem('omkar_orders');
    if (savedOrders) setOrders(JSON.parse(savedOrders));
  };

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 3000);
  };

  const saveInventory = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    localStorage.setItem('omkar_inventory', JSON.stringify(updatedProducts));
    window.dispatchEvent(new Event('storage'));
  };

  const handleAddOrEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      const updated = products.map(p => 
        p.id === editingProduct.id 
          ? { 
              ...p, 
              name: productForm.name, 
              category: productForm.category,
              price: productForm.price, 
              stock: productForm.stock,
              image: productForm.image,
              description: productForm.description
            } 
          : p
      );
      saveInventory(updated);
      showToast('Product updated successfully!');
    } else {
      const product: Product = {
        id: Date.now().toString(),
        name: productForm.name,
        category: productForm.category,
        price: productForm.price,
        stock: productForm.stock,
        image: productForm.image || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=400',
        description: productForm.description || 'Product added via Admin Panel'
      };
      saveInventory([...products, product]);
      showToast('New product added to Bazar!');
    }
    setIsAddingProduct(false);
    setEditingProduct(null);
    setProductForm({ name: '', category: 'Seeds', price: '', stock: 0, image: '', description: '' });
  };

  // Analytics Helpers
  const monthlyOrders = orders.filter(o => o.date.startsWith(selectedMonth));
  const monthlyRevenue = monthlyOrders.reduce((acc, curr) => {
    const val = parseInt(curr.total.replace(/[^0-9]/g, '')) || 0;
    return acc + (curr.status !== 'Cancelled' ? val : 0);
  }, 0);

  return (
    <div className="space-y-6 pb-20 relative">
      <div className="bg-stone-900 text-white p-8 rounded-[2.5rem] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
           <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center text-stone-900 shadow-lg rotate-3">
             <i className="fas fa-user-shield text-2xl"></i>
           </div>
           <div>
            <h2 className="text-3xl font-black">Admin Dashboard</h2>
            <p className="text-stone-400 mt-1 italic">Prop: {adminProfile.name}</p>
          </div>
        </div>
        <div className="flex bg-white/10 p-1 rounded-2xl backdrop-blur-sm overflow-x-auto">
          {(['analytics', 'inventory', 'orders', 'profile'] as AdminTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab ? 'bg-amber-500 text-stone-900 shadow-lg' : 'text-stone-400 hover:text-white'
              }`}
            >
              {tab === 'inventory' ? 'Manage Bazar' : tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'analytics' && (
        <div className="grid md:grid-cols-4 gap-6 animate-in fade-in duration-500">
           <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100 flex flex-col justify-between min-h-[160px]">
              <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest">Monthly Sales</p>
              <p className="text-3xl font-black text-stone-800">₹{monthlyRevenue.toLocaleString()}</p>
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase">
                <i className="fas fa-arrow-trend-up"></i> +12.4% Target
              </div>
           </div>
           <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100 flex flex-col justify-between min-h-[160px]">
              <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest">Active Orders</p>
              <p className="text-3xl font-black text-stone-800">{orders.filter(o => o.status === 'Pending').length}</p>
              <div className="flex items-center gap-2 text-amber-500 font-bold text-[10px] uppercase">
                Action Required
              </div>
           </div>
           <div className="bg-emerald-800 text-white p-8 rounded-[2.5rem] shadow-xl flex flex-col justify-between md:col-span-2">
              <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Growth Performance</p>
              <div className="flex items-end justify-between">
                <h4 className="text-3xl font-black">Bullish Market</h4>
                <div className="flex items-end gap-1 h-12">
                   {[40, 70, 50, 90, 60, 100].map((h, i) => (
                     <div key={i} className="w-1.5 bg-amber-400 rounded-full" style={{height: `${h}%`}}></div>
                   ))}
                </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black text-stone-800">Krushi Bazar Inventory</h3>
            <button 
              onClick={() => setIsAddingProduct(true)}
              className="bg-emerald-700 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-emerald-800 transition-all"
            >
              <i className="fas fa-plus mr-2"></i> Add Product
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(p => (
              <div key={p.id} className="bg-white rounded-[2.5rem] border border-stone-100 overflow-hidden shadow-sm flex flex-col group h-full">
                <div className="h-44 relative overflow-hidden">
                  <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={p.name} />
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => saveInventory(products.filter(item => item.id !== p.id))} className="w-8 h-8 bg-white/90 text-red-500 rounded-lg shadow-lg flex items-center justify-center hover:bg-red-50 backdrop-blur-sm"><i className="fas fa-trash text-xs"></i></button>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">{p.category}</span>
                    <span className={`text-[9px] font-black uppercase ${p.stock < 10 ? 'text-red-500' : 'text-stone-400'}`}>Stock: {p.stock}</span>
                  </div>
                  <h4 className="font-black text-stone-800 text-sm line-clamp-2 leading-tight min-h-[2.5rem]">{p.name}</h4>
                  <p className="text-stone-400 text-[10px] line-clamp-2 mt-2 leading-relaxed">{p.description}</p>
                  
                  <div className="mt-auto pt-6 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-black text-stone-900">₹{p.price}</span>
                    </div>
                    
                    {/* Replaced 'Buy' with 'Edit' as requested for the Admin Panel Manage Bazar view */}
                    <button 
                      onClick={() => { setEditingProduct(p); setProductForm({ ...p, price: p.price.toString() }); setIsAddingProduct(true); }}
                      className="w-full h-12 bg-amber-50 text-amber-700 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-500 hover:text-stone-900 transition-all shadow-sm border border-amber-100"
                    >
                      <i className="fas fa-edit mr-2"></i> Edit Product
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders Management Tab */}
      {activeTab === 'orders' && (
        <div className="bg-white p-10 rounded-[3rem] border border-stone-100 shadow-sm animate-in slide-in-from-right-4">
           <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-stone-800">Customer Orders</h3>
            <span className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
              {orders.length} Total
            </span>
          </div>
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-20 bg-stone-50 rounded-[2.5rem] border-2 border-dashed border-stone-100">
                <p className="text-stone-400 font-bold uppercase text-[10px] tracking-widest">No orders yet</p>
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} className="p-6 bg-stone-50 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-stone-100 hover:bg-white hover:shadow-xl transition-all">
                  <div>
                    <h4 className="font-black text-stone-800">{order.customerName}</h4>
                    <p className="text-[10px] font-bold text-stone-400 uppercase">{order.id} • {order.date}</p>
                  </div>
                  <div className="flex items-center gap-8">
                     <div className="text-right">
                        <p className="text-[9px] font-black text-stone-400 uppercase mb-1">Total</p>
                        <p className="text-lg font-black text-emerald-800">{order.total}</p>
                     </div>
                     <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                        order.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                     }`}>
                        {order.status}
                     </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Profile Management Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white p-10 rounded-[3rem] border border-stone-100 shadow-sm animate-in slide-in-from-right-4">
           <h3 className="text-2xl font-black text-stone-800 mb-8">Owner Identity Details</h3>
           <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                 <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest">Proprietor</p>
                 <p className="text-xl font-bold text-stone-800 border-b pb-2">{adminProfile.name}</p>
                 <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest pt-4">Business Mobile</p>
                 <p className="text-xl font-bold text-stone-800 border-b pb-2">{adminProfile.mobile}</p>
              </div>
              <div className="bg-amber-50 p-8 rounded-3xl border border-amber-100">
                 <h4 className="font-black text-amber-800 text-sm mb-4">Official HQ Address</h4>
                 <p className="text-stone-600 font-medium leading-relaxed">{adminProfile.address}</p>
              </div>
           </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isAddingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm" onClick={() => setIsAddingProduct(false)}></div>
          <form onSubmit={handleAddOrEditProduct} className="relative bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl space-y-6">
            <h3 className="text-2xl font-black text-stone-800">{editingProduct ? 'Update Product' : 'New Bazar Item'}</h3>
            <div className="space-y-4">
              <input required placeholder="Product Name" className="w-full bg-stone-50 border border-stone-100 px-5 py-4 rounded-2xl font-bold" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} />
              <select className="w-full bg-stone-50 border border-stone-100 px-5 py-4 rounded-2xl font-bold" value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })}>
                {['Seeds', 'Fertilizers', 'Irrigation', 'Equipment', 'Organic'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input required type="number" placeholder="Price (₹)" className="w-full bg-stone-50 border border-stone-100 px-5 py-4 rounded-2xl font-bold" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} />
                <input required type="number" placeholder="Stock" className="w-full bg-stone-50 border border-stone-100 px-5 py-4 rounded-2xl font-bold" value={productForm.stock} onChange={e => setProductForm({ ...productForm, stock: parseInt(e.target.value) })} />
              </div>
              <textarea placeholder="Description" rows={3} className="w-full bg-stone-50 border border-stone-100 px-5 py-4 rounded-2xl font-bold" value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} />
            </div>
            <button type="submit" className="w-full bg-stone-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">{editingProduct ? 'Save Changes' : 'Publish to Bazar'}</button>
          </form>
        </div>
      )}

      {toast.visible && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-emerald-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl z-[110] animate-in slide-in-from-bottom-4">
          <i className="fas fa-check-circle mr-3 text-amber-400"></i> {toast.message}
        </div>
      )}
    </div>
  );
};
