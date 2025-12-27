
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile as UserProfileType, Order, Role, Language } from '../types';
import { translations } from '../translations';

interface UserProfileProps {
  language: Language;
}

export const UserProfile: React.FC<UserProfileProps> = ({ language }) => {
  const t = translations[language];
  const [userRole, setUserRole] = useState<Role>(Role.USER);
  const [profile, setProfile] = useState<UserProfileType>({
    name: '',
    email: '',
    mobileNumber: '',
    location: '',
    village: '',
    city: '',
    district: '',
    state: 'Maharashtra',
    permanentAddress: '',
    otherAddress: '',
    preferredCrops: '',
    profilePic: ''
  });
  const [isSaved, setIsSaved] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = () => {
    // Determine Role
    const savedAuth = localStorage.getItem('omkar_auth');
    const role = savedAuth ? JSON.parse(savedAuth).role : Role.USER;
    setUserRole(role);

    // Load Profile based on Role
    const storageKey = role === Role.ADMIN ? 'omkar_admin_profile' : 'omkar_user_profile';
    const savedProfileStr = localStorage.getItem(storageKey);
    
    let currentProfile = { ...profile };
    if (savedProfileStr) {
      const rawData = JSON.parse(savedProfileStr);
      currentProfile = {
        ...currentProfile,
        ...rawData,
        mobileNumber: rawData.mobileNumber || rawData.mobile || ''
      };
      setProfile(currentProfile);
    }

    // Load and filter orders specifically for this identity's mobile number
    const savedOrdersStr = localStorage.getItem('omkar_orders');
    if (savedOrdersStr && currentProfile.mobileNumber) {
      const allOrders: Order[] = JSON.parse(savedOrdersStr);
      const filtered = allOrders.filter(o => o.customerMobile === currentProfile.mobileNumber);
      setUserOrders(filtered);
    }
  };

  useEffect(() => {
    loadData();
    const handleStorage = () => loadData();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [profile.mobileNumber]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, profilePic: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Remove profile photo?")) {
      setProfile({ ...profile, profilePic: '' });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const storageKey = userRole === Role.ADMIN ? 'omkar_admin_profile' : 'omkar_user_profile';
    
    const updatedProfile = {
      ...profile,
      location: `${profile.village ? profile.village + ', ' : ''}${profile.city ? profile.city + ', ' : ''}${profile.district ? profile.district + ', ' : ''}${profile.state || ''}`.trim().replace(/,$/, '')
    };

    localStorage.setItem(storageKey, JSON.stringify(updatedProfile));
    setProfile(updatedProfile);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
    window.dispatchEvent(new Event('profileUpdated'));
    loadData();
  };

  const handleDownloadReceipt = () => {
    window.print();
  };

  const totalSpent = userOrders.reduce((acc, curr) => {
    const val = parseInt(curr.total.replace(/[^0-9]/g, '')) || 0;
    return acc + val;
  }, 0);

  const isOwner = userRole === Role.ADMIN;
  const inputClass = "w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-stone-800";
  const labelClass = "text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 block ml-1";

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 print:p-0">
      <div className="text-center print:hidden">
        <h2 className="text-3xl font-black text-emerald-900 tracking-tight">
          {isOwner ? t.ownerIdentity : t.farmerIdentity}
        </h2>
        <p className="text-stone-500 mt-2 max-w-lg mx-auto">
          {isOwner 
            ? 'Manage professional leadership credentials and business identity for Omkar Krushi Udhyog.' 
            : 'Manage your information and track your transactions with Omkar Krushi Udhyog.'}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 print:block">
        {/* Left Column: Identity Card */}
        <div className="lg:col-span-1 space-y-6 print:hidden">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100 flex flex-col items-center">
            <div className="relative group">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-50 bg-stone-100 flex items-center justify-center shadow-inner relative z-10 cursor-pointer"
              >
                {profile.profilePic ? (
                  <img src={profile.profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-stone-300">
                    <i className={`fas ${isOwner ? 'fa-user-tie' : 'fa-user-circle'} text-5xl`}></i>
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-emerald-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white z-20 backdrop-blur-[2px]">
                  <i className="fas fa-camera text-xl"></i>
                </div>
              </div>
              
              {profile.profilePic && (
                <button 
                  onClick={handleRemoveImage}
                  className="absolute -top-1 -right-1 w-8 h-8 bg-white text-red-500 rounded-full shadow-lg border border-red-50 flex items-center justify-center z-30 hover:bg-red-50 transition-colors"
                  title={t.removePhoto}
                >
                  <i className="fas fa-trash-alt text-xs"></i>
                </button>
              )}
              
              <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
            </div>
            
            <div className="text-center mt-6">
              <h3 className="text-xl font-black text-stone-800 truncate max-w-[150px] mx-auto">{profile.name || (isOwner ? 'Owner' : 'Farmer')}</h3>
              <p className="text-emerald-600 font-black text-[9px] uppercase tracking-[0.2em] mt-1">
                {isOwner ? 'Proprietor ID' : 'Verified Farmer ID'}: {profile.mobileNumber || 'NEW'}
              </p>
            </div>
          </div>

          {!isOwner && (
            <div className="bg-stone-900 text-white p-8 rounded-[2.5rem] shadow-xl space-y-6">
              <div>
                <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest mb-1">{t.orders}</p>
                <p className="text-3xl font-black">{userOrders.length}</p>
              </div>
              <div>
                <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest mb-1">{t.spent}</p>
                <p className="text-3xl font-black text-amber-400">₹{totalSpent.toLocaleString()}</p>
              </div>
            </div>
          )}
          
          {isOwner && (
            <div className="bg-amber-400 text-stone-900 p-8 rounded-[2.5rem] shadow-xl space-y-4">
              <i className="fas fa-shield-halved text-2xl text-amber-600"></i>
              <h4 className="font-black uppercase text-xs tracking-widest">Authorized Access</h4>
              <p className="text-[10px] font-bold leading-relaxed opacity-70">
                This identity profile grants full administrative control over bazar inventory and customer data.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Forms & Records */}
        <div className="lg:col-span-2 space-y-8 print:w-full">
          <form onSubmit={handleSave} className="space-y-8 print:hidden">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100 space-y-6">
              <div className="flex items-center gap-3 border-b border-stone-50 pb-4">
                <div className={`w-10 h-10 ${isOwner ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'} rounded-xl flex items-center justify-center`}>
                  <i className={`fas ${isOwner ? 'fa-user-shield' : 'fa-user'}`}></i>
                </div>
                <h4 className="text-lg font-black text-stone-800">{isOwner ? 'Owner Credentials' : 'Contact Details'}</h4>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className={labelClass}>{isOwner ? 'Proprietor Name' : t.fullName}</label>
                  <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className={inputClass} placeholder="Full Name" required />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>{t.mobileNumber}</label>
                  <input type="tel" value={profile.mobileNumber} onChange={(e) => setProfile({ ...profile, mobileNumber: e.target.value })} className={inputClass} placeholder="+91..." required />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className={labelClass}>{isOwner ? 'Official Business Email' : 'Email Address'}</label>
                  <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className={inputClass} placeholder="Email" />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100 space-y-6">
              <div className="flex items-center gap-3 border-b border-stone-50 pb-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <h4 className="text-lg font-black text-stone-800">{isOwner ? 'Headquarters' : 'Farm Location'}</h4>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className={labelClass}>{t.village}</label>
                  <input type="text" value={profile.village} onChange={(e) => setProfile({ ...profile, village: e.target.value })} className={inputClass} placeholder="Village" required />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>{t.city}</label>
                  <input type="text" value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} className={inputClass} placeholder="City" required />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>{t.district}</label>
                  <input type="text" value={profile.district} onChange={(e) => setProfile({ ...profile, district: e.target.value })} className={inputClass} placeholder="District" required />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>{isOwner ? 'Business Interest' : 'Preferred Crops'}</label>
                  <input type="text" value={profile.preferredCrops} onChange={(e) => setProfile({ ...profile, preferredCrops: e.target.value })} className={inputClass} placeholder="e.g. Cotton" />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className={`w-full py-5 rounded-2xl font-black text-white shadow-xl transition-all ${
                isSaved ? 'bg-emerald-500' : 'bg-stone-900 hover:bg-emerald-800'
              }`}
            >
              {isSaved ? (isOwner ? 'Identity Secure!' : 'Identity Saved!') : (isOwner ? 'Update OWNER Identity' : t.saveIdentity)}
            </button>
          </form>

          {!isOwner && (
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100 space-y-6 print:shadow-none print:border-none">
              <div className="flex items-center justify-between border-b border-stone-50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                    <i className="fas fa-receipt"></i>
                  </div>
                  <h4 className="text-lg font-black text-stone-800">{t.myOrders}</h4>
                </div>
              </div>
              
              {userOrders.length === 0 ? (
                <div className="text-center py-12 bg-stone-50 rounded-[2rem] border-2 border-dashed border-stone-100">
                  <i className="fas fa-shopping-basket text-3xl text-stone-200 mb-3"></i>
                  <p className="text-stone-400 font-bold uppercase text-[9px] tracking-widest">No order history found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userOrders.map((order) => (
                    <div 
                      key={order.id} 
                      onClick={() => setSelectedOrder(order)}
                      className="p-4 bg-stone-50 rounded-2xl flex items-center justify-between hover:bg-emerald-50 hover:shadow-md transition-all cursor-pointer group border border-transparent hover:border-emerald-100"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 font-black text-xs shadow-sm">
                          {order.items.length}
                        </div>
                        <div>
                          <p className="text-sm font-black text-stone-800">{order.items[0]} {order.items.length > 1 ? `+${order.items.length - 1} more` : ''}</p>
                          <p className="text-[10px] text-stone-400 font-bold uppercase">{order.date} • {order.id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-emerald-800">{order.total}</p>
                        <span className={`text-[8px] font-black uppercase tracking-widest ${
                          order.status === 'Delivered' ? 'text-green-600' : 'text-amber-600'
                        }`}>{order.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Order Review */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-md print:hidden" onClick={() => setSelectedOrder(null)}></div>
          <div className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col print:shadow-none print:max-h-none print:p-0 print:rounded-none">
            <div className="bg-emerald-900 p-8 text-white flex justify-between items-start sticky top-0 z-10 print:bg-stone-50 print:text-stone-900 print:border-b">
              <div>
                <span className="bg-white/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-2 inline-block print:hidden">Order Receipt</span>
                <h3 className="text-2xl font-black">Ref: {selectedOrder.id}</h3>
                <p className="text-emerald-300 text-[10px] font-bold uppercase print:text-stone-400">Date: {selectedOrder.date}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-colors print:hidden">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest mb-1.5">Billed To</p>
                  <p className="text-lg font-black text-stone-900">{selectedOrder.customerName}</p>
                  <p className="text-sm font-medium text-stone-500">{selectedOrder.village}, {selectedOrder.city}</p>
                </div>
                <div className="text-right">
                  <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest mb-1.5">Order Status</p>
                  <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-stone-50 ${
                    selectedOrder.status === 'Delivered' ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              <div className="bg-stone-50 rounded-3xl p-6 border border-stone-100 print:bg-white">
                <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest mb-4">Item Details</p>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-stone-100 last:border-0">
                      <span className="text-stone-700 font-bold text-sm">{item}</span>
                      <span className="text-stone-400 text-xs">Qty: 1</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t border-stone-200 flex justify-between items-end">
                   <div>
                     <p className="text-stone-400 text-[9px] font-black uppercase tracking-widest">Grand Total</p>
                     <p className="text-3xl font-black text-emerald-800">{selectedOrder.total}</p>
                   </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-4 print:hidden">
                <button 
                  onClick={handleDownloadReceipt}
                  className="flex-1 bg-stone-900 text-white py-5 rounded-2xl font-black text-sm hover:bg-stone-800 transition-all flex items-center justify-center gap-2"
                >
                  <i className="fas fa-print"></i>
                  Download Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
