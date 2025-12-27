
import React, { useState, useEffect } from 'react';
import { View, Role, Language } from '../types';
import { translations } from '../translations';

interface LayoutProps {
  currentView: View;
  setView: (view: View) => void;
  userRole: Role;
  onLogout: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ 
  currentView, setView, userRole, onLogout, language, setLanguage, children 
}) => {
  const [userName, setUserName] = useState('');
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const t = translations[language];

  const updateUserInfo = () => {
    if (userRole === Role.ADMIN) {
      setUserName(t.proprietor);
      setProfilePic(null);
      return;
    }
    const saved = localStorage.getItem('omkar_user_profile');
    if (saved) {
      const profile = JSON.parse(saved);
      if (profile.name) setUserName(profile.name);
      else setUserName(t.verifiedFarmer);
      if (profile.profilePic) setProfilePic(profile.profilePic);
      else setProfilePic(null);
    } else {
      setUserName(t.verifiedFarmer);
    }
  };

  useEffect(() => {
    updateUserInfo();
    window.addEventListener('profileUpdated', updateUserInfo);
    return () => window.removeEventListener('profileUpdated', updateUserInfo);
  }, [userRole, language]);

  const navItems = userRole === Role.ADMIN ? [
    { id: View.ADMIN_PANEL, label: t.navAdminDashboard, icon: 'fa-columns' },
    { id: View.MARKET, label: t.navManageBazar, icon: 'fa-box-open' },
    { id: View.PROFILE, label: t.navOwnerIdentity, icon: 'fa-user-tie' },
  ] : [
    { id: View.DASHBOARD, label: t.navHome, icon: 'fa-home' },
    { id: View.MARKET, label: t.navMarket, icon: 'fa-store' },
    { id: View.CROP_DIAGNOSIS, label: t.navDiagnosis, icon: 'fa-leaf' },
    { id: View.COMMODITY_PRICES, label: t.navPrices, icon: 'fa-chart-line' },
    { id: View.PROFILE, label: t.navProfile, icon: 'fa-user-circle' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-stone-50">
      {/* Sidebar for Desktop */}
      <aside className={`hidden md:flex w-64 flex-col text-white sticky top-0 h-screen transition-colors duration-500 ${
        userRole === Role.ADMIN ? 'bg-stone-900' : 'bg-emerald-800'
      }`}>
        <div className="p-6">
          <h1 className="text-xl font-black flex items-center gap-2 leading-tight">
            <i className={`fas fa-tractor ${userRole === Role.ADMIN ? 'text-stone-400' : 'text-amber-400'}`}></i>
            {t.appName}
          </h1>
          <p className={`text-[9px] mt-1 uppercase tracking-widest font-black ${
            userRole === Role.ADMIN ? 'text-stone-500' : 'text-amber-400'
          }`}>
            {t.founder}
          </p>
        </div>

        <div className="px-6 mb-6">
           <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
             <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
               {profilePic ? (
                 <img src={profilePic} alt="User" className="w-full h-full object-cover" />
               ) : (
                 <span className="font-bold text-amber-400">{userName.charAt(0).toUpperCase() || '?'}</span>
               )}
             </div>
             <div className="overflow-hidden">
               <p className="text-sm font-bold truncate">{userName}</p>
               <p className="text-[10px] text-white/40 uppercase tracking-tighter">{userRole === Role.ADMIN ? t.proprietor : t.verifiedFarmer}</p>
             </div>
           </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                currentView === item.id 
                  ? (userRole === Role.ADMIN ? 'bg-amber-500 text-stone-900 font-bold' : 'bg-amber-500 text-emerald-900 shadow-lg font-bold') 
                  : (userRole === Role.ADMIN ? 'hover:bg-stone-800 text-stone-400' : 'hover:bg-emerald-700 text-emerald-100')
              }`}
            >
              <i className={`fas ${item.icon} w-5`}></i>
              {item.label}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors font-bold"
          >
            <i className="fas fa-sign-out-alt w-5"></i>
            {t.logout}
          </button>
        </div>

        <div className="p-6 text-[10px] text-stone-500/80 font-bold uppercase tracking-widest">
          &copy; 2024 {t.appName}<br/>
          {t.founder}
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 flex justify-around p-2 z-50">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex flex-col items-center gap-1 text-[9px] ${
              currentView === item.id ? 'text-emerald-700 font-bold' : 'text-stone-400'
            }`}
          >
            <i className={`fas ${item.icon} text-base`}></i>
            <span className="truncate w-full text-center">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0 overflow-y-auto">
        <header className="bg-white border-b border-stone-200 p-4 flex justify-between items-center sticky top-0 z-40">
          <div className="md:hidden flex flex-col">
            <div className="font-black text-emerald-800 flex items-center gap-2 text-xs uppercase tracking-tighter">
              <i className="fas fa-tractor text-amber-500"></i>
              {t.appName}
            </div>
            <span className="text-[8px] font-black uppercase text-stone-400 tracking-widest -mt-1">{t.founder}</span>
          </div>
          <div className="hidden md:block text-stone-500 font-medium">
            {t.namaste}, {userName}
          </div>
          <div className="flex items-center gap-3">
            {/* Language Picker */}
            <div className="flex bg-stone-100 p-1 rounded-xl gap-1">
              {[Language.EN, Language.HI, Language.MR].map(lang => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    language === lang ? 'bg-white text-emerald-700 shadow-sm' : 'text-stone-400 hover:text-stone-600'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
            <button className="p-2 text-stone-400 hover:text-emerald-600">
              <i className="fas fa-bell"></i>
            </button>
            <button 
              onClick={() => setView(View.PROFILE)}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-colors overflow-hidden ${
                userRole === Role.ADMIN ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'
              }`}
            >
              {profilePic ? (
                <img src={profilePic} alt="User" className="w-full h-full object-cover" />
              ) : (
                userName.charAt(0).toUpperCase() || '?'
              )}
            </button>
          </div>
        </header>
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
