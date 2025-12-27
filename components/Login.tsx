
import React, { useState } from 'react';
import { Role, Language } from '../types';
import { translations } from '../translations';

interface LoginProps {
  onLogin: (role: Role) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, language, setLanguage }) => {
  const t = translations[language];
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>(Role.USER);
  const [error, setError] = useState<string | null>(null);
  const [showAuthForm, setShowAuthForm] = useState(false);

  const validatePassword = (pass: string) => {
    const hasLetter = /[a-zA-Z]/.test(pass);
    const hasDigit = /[0-9]/.test(pass);
    return pass.length >= 6 && hasLetter && hasDigit;
  };

  const handleWorkspaceSelect = (selectedRole: Role) => {
    setRole(selectedRole);
    setShowAuthForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const storedUsers = JSON.parse(localStorage.getItem('omkar_users') || '[]');

    if (mode === 'register') {
      if (!validatePassword(password)) {
        setError(t.passwordReq);
        return;
      }

      if (storedUsers.some((u: any) => u.mobile === mobile)) {
        setError(t.userExists);
        return;
      }

      const newUser = { mobile, password, name, role };
      localStorage.setItem('omkar_users', JSON.stringify([...storedUsers, newUser]));
      
      onLogin(role);
      const profileKey = role === Role.ADMIN ? 'omkar_admin_profile' : 'omkar_user_profile';
      localStorage.setItem(profileKey, JSON.stringify({
        name,
        mobileNumber: mobile,
        state: 'Maharashtra'
      }));
    } else {
      const user = storedUsers.find((u: any) => u.mobile === mobile && u.password === password && u.role === role);
      if (user) {
        onLogin(user.role);
      } else {
        setError(t.invalidCreds);
      }
    }
  };

  const inputClasses = "w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-bold text-stone-800 placeholder:text-stone-300";
  const labelClasses = "text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-1 block";

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-stone-900 overflow-hidden font-sans">
      <img 
        src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=2000" 
        className="absolute inset-0 w-full h-full object-cover opacity-30 scale-105"
        alt="Agri background"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-900/60 to-transparent"></div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        {!showAuthForm ? (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 w-full">
            <div className="text-center text-white space-y-4">
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="w-20 h-20 bg-amber-500 rounded-3xl flex items-center justify-center shadow-2xl rotate-6">
                  <i className="fas fa-tractor text-4xl text-emerald-950"></i>
                </div>
                <div className="text-left">
                  <h1 className="text-5xl font-black tracking-tight">{t.appName}</h1>
                  <p className="text-amber-400 font-black uppercase tracking-[0.4em] text-xs">{t.founder}</p>
                </div>
              </div>
              <p className="text-emerald-100 text-xl max-w-2xl mx-auto">{t.loginSubtitle}</p>
              
              <div className="flex bg-white/10 p-1 rounded-2xl gap-2 w-max mx-auto backdrop-blur-md border border-white/10">
                {[Language.EN, Language.HI, Language.MR].map(lang => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      language === lang ? 'bg-amber-400 text-emerald-950 shadow-lg' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {lang === Language.EN ? 'English' : lang === Language.HI ? 'हिन्दी' : 'मराठी'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 px-4">
              <button 
                onClick={() => handleWorkspaceSelect(Role.USER)}
                className="group relative bg-white hover:scale-105 transition-all duration-500 p-10 rounded-[3rem] text-left shadow-2xl"
              >
                <div className="w-20 h-20 bg-emerald-100 rounded-[2rem] flex items-center justify-center text-emerald-700 mb-8 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <i className="fas fa-seedling text-3xl"></i>
                </div>
                <h3 className="text-3xl font-black text-stone-800 mb-4">{t.userPanel}</h3>
                <p className="text-stone-500 text-lg leading-relaxed">{t.userPanelDesc}</p>
                <div className="mt-8 flex items-center gap-2 text-emerald-600 font-black uppercase tracking-widest text-xs">
                  Enter Workspace <i className="fas fa-arrow-right transition-transform group-hover:translate-x-2"></i>
                </div>
              </button>

              <button 
                onClick={() => handleWorkspaceSelect(Role.ADMIN)}
                className="group relative bg-stone-900 border border-white/10 hover:scale-105 transition-all duration-500 p-10 rounded-[3rem] text-left shadow-2xl"
              >
                <div className="w-20 h-20 bg-amber-500/20 rounded-[2rem] flex items-center justify-center text-amber-500 mb-8 group-hover:bg-amber-500 group-hover:text-stone-900 transition-colors">
                  <i className="fas fa-user-shield text-3xl"></i>
                </div>
                <h3 className="text-3xl font-black text-white mb-4">{t.adminPanel}</h3>
                <p className="text-stone-400 text-lg leading-relaxed">{t.adminPanelDesc}</p>
                <div className="mt-8 flex items-center gap-2 text-amber-500 font-black uppercase tracking-widest text-xs">
                  Enter Workspace <i className="fas fa-arrow-right transition-transform group-hover:translate-x-2"></i>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 max-w-lg mx-auto w-full">
            <div className={`p-10 text-white relative flex items-center gap-6 ${role === Role.ADMIN ? 'bg-stone-900' : 'bg-emerald-900'}`}>
              <button onClick={() => setShowAuthForm(false)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <i className="fas fa-arrow-left"></i>
              </button>
              <div>
                <h2 className="text-2xl font-black">{role === Role.ADMIN ? t.adminPanel : t.userPanel}</h2>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Authentication Portal</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-100">
                  <i className="fas fa-exclamation-circle mr-2"></i> {error}
                </div>
              )}

              {mode === 'register' && (
                <div>
                  <label className={labelClasses}>{t.fullName}</label>
                  <input required type="text" value={name} onChange={e => setName(e.target.value)} className={inputClasses} placeholder="Your Full Name" />
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className={labelClasses}>{t.mobileNumber}</label>
                  <input required type="tel" pattern="[0-9]{10}" value={mobile} onChange={e => setMobile(e.target.value)} className={inputClasses} placeholder="10 Digit Number" />
                </div>
                <div>
                  <label className={labelClasses}>{t.password}</label>
                  <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputClasses} placeholder="Letters & Digits" />
                  {mode === 'register' && <p className="text-[8px] font-bold text-stone-400 mt-2 px-1 uppercase tracking-widest">{t.passwordReq}</p>}
                </div>
              </div>

              <button type="submit" className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-3 ${
                role === Role.ADMIN ? 'bg-amber-500 text-stone-900 hover:bg-amber-600' : 'bg-stone-900 text-white hover:bg-emerald-800'
              }`}>
                {mode === 'login' ? t.login : t.register}
                <i className="fas fa-arrow-right"></i>
              </button>

              <div className="text-center pt-2">
                <button 
                  type="button" 
                  onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
                  className="text-stone-400 hover:text-emerald-700 text-[10px] font-black uppercase tracking-widest transition-colors"
                >
                  {mode === 'login' ? t.noAccount : t.hasAccount} 
                  <span className="text-amber-600 ml-1 underline">{mode === 'login' ? t.register : t.login}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Branding Footer */}
        <div className="mt-12 mb-4 animate-in fade-in duration-1000">
          <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em] text-center select-none">
            Powered by <span className="text-amber-400/50">PRATIK</span>
          </p>
        </div>
      </div>
    </div>
  );
};
