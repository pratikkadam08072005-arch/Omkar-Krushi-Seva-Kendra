
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Marketplace } from './components/Marketplace';
import { CropDiagnosis } from './components/CropDiagnosis';
import { MarketPrices } from './components/MarketPrices';
import { UserProfile } from './components/UserProfile';
import { AdminPanel } from './components/AdminPanel';
import { Login } from './components/Login';
import { View, Role, Language } from './types';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<Role>(Role.USER);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [language, setLanguage] = useState<Language>(Language.EN);

  useEffect(() => {
    // Load Auth
    const savedAuth = localStorage.getItem('omkar_auth');
    if (savedAuth) {
      const { role } = JSON.parse(savedAuth);
      setUserRole(role);
      setIsLoggedIn(true);
      setCurrentView(role === Role.ADMIN ? View.ADMIN_PANEL : View.DASHBOARD);
    }

    // Load Language
    const savedLang = localStorage.getItem('omkar_language');
    if (savedLang) {
      setLanguage(savedLang as Language);
    }
  }, []);

  const handleLogin = (role: Role) => {
    setIsLoggedIn(true);
    setUserRole(role);
    localStorage.setItem('omkar_auth', JSON.stringify({ role }));
    setCurrentView(role === Role.ADMIN ? View.ADMIN_PANEL : View.DASHBOARD);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('omkar_auth');
  };

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('omkar_language', lang);
  };

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard language={language} />;
      case View.MARKET:
        // For Admin, View.MARKET should show the inventory management part of the Admin Panel
        return userRole === Role.ADMIN ? <AdminPanel language={language} initialTab="inventory" /> : <Marketplace language={language} />;
      case View.CROP_DIAGNOSIS:
        return <CropDiagnosis language={language} />;
      case View.COMMODITY_PRICES:
        return <MarketPrices language={language} />;
      case View.PROFILE:
        return <UserProfile language={language} />;
      case View.ADMIN_PANEL:
        return <AdminPanel language={language} />;
      default:
        return userRole === Role.ADMIN ? <AdminPanel language={language} /> : <Dashboard language={language} />;
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} language={language} setLanguage={changeLanguage} />;
  }

  return (
    <Layout 
      currentView={currentView} 
      setView={setCurrentView} 
      userRole={userRole} 
      onLogout={handleLogout}
      language={language}
      setLanguage={changeLanguage}
    >
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
        {renderView()}
      </div>
    </Layout>
  );
};

export default App;
