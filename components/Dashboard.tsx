
import React, { useState, useEffect } from 'react';
import { getWeatherByLocation } from '../services/geminiService';
import { Language } from '../types';
import { translations } from '../translations';

interface DashboardProps {
  language: Language;
}

interface WeatherData {
  location: string;
  temp: string;
  condition: string;
  humidity: string;
  wind: string;
  rain: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ language }) => {
  const t = translations[language];
  const [weather, setWeather] = useState<WeatherData>({
    location: 'Pune, Maharashtra',
    temp: '31',
    condition: 'Clear Skies',
    humidity: '45',
    wind: '12',
    rain: '0'
  });
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [selectedNews, setSelectedNews] = useState<any>(null);

  useEffect(() => {
    const fetchWeather = async (lat: number, lng: number) => {
      setLoadingWeather(true);
      try {
        const data = await getWeatherByLocation(lat, lng);
        if (data) {
          setWeather({
            location: data.location || 'Your Location',
            temp: data.temp?.replace(/[^0-9.-]/g, '') || '31',
            condition: data.condition || 'Clear',
            humidity: data.humidity?.replace(/[^0-9]/g, '') || '45',
            wind: data.wind?.replace(/[^0-9]/g, '') || '12',
            rain: data.rain?.replace(/[^0-9]/g, '') || '0'
          });
        }
      } catch (e) {
        console.error("Weather fetch failed:", e);
      }
      setLoadingWeather(false);
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        () => {
          setLoadingWeather(false);
        }
      );
    } else {
      setLoadingWeather(false);
    }
  }, []);

  const stats = [
    { label: t.soilHealth, value: 'Optimized', icon: 'fa-flask', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: t.irrigation, value: 'Scheduled', icon: 'fa-droplet', color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { label: t.nextHarvest, value: '45 Days', icon: 'fa-wheat-awn', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: t.marketMood, value: 'Bullish', icon: 'fa-arrow-trend-up', color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="space-y-10">
      <section className="relative h-56 md:h-80 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <img 
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200" 
          alt="Field"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-900/60 to-transparent flex flex-col justify-center p-8 md:p-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-amber-400 text-emerald-950 text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1 rounded-full shadow-lg">
              Leading Agri Excellence
            </span>
          </div>
          <h2 className="text-4xl md:text-7xl font-black text-white max-w-2xl leading-[0.9]">
            {t.appName.split(' ')[0]} <span className="text-amber-400">{t.appName.split(' ').slice(1).join(' ')}</span>
          </h2>
          <p className="text-emerald-50 mt-6 max-w-lg text-sm md:text-lg font-medium leading-relaxed">
            {t.loginSubtitle}
          </p>
        </div>
      </section>

      <section className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 border-4 border-emerald-50 shadow-inner">
          <i className="fas fa-user-tie text-4xl"></i>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-stone-800">Founder's Vision</h3>
          <p className="text-stone-600 italic leading-relaxed text-sm md:text-base">
            "Our mission is to ensure every farmer has access to the best technology and fair market prices."
          </p>
          <p className="text-emerald-700 font-black text-xs uppercase tracking-widest">— {t.founder}</p>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className={`${stat.bg} p-6 rounded-3xl border border-white/50 shadow-sm flex flex-col items-center text-center`}>
            <div className={`${stat.color} text-2xl mb-3`}><i className={`fas ${stat.icon}`}></i></div>
            <p className="text-stone-500 text-xs font-black uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-xl font-black text-stone-800">{stat.value}</p>
          </div>
        ))}
      </section>

      <div className="grid md:grid-cols-3 gap-8 pb-10">
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-stone-800 flex items-center gap-2">
              <i className="fas fa-newspaper text-emerald-600"></i>
              {t.agriNews}
            </h3>
          </div>
          <div className="grid gap-4">
            {t.news.map((item: any, i: number) => (
              <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 group hover:shadow-xl transition-all hover:border-emerald-200">
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                    item.cat === 'Alert' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {item.cat}
                  </span>
                  <span className="text-[10px] text-stone-400 font-bold">{item.date}</span>
                </div>
                <h4 className="text-lg font-black text-stone-800 mb-1 group-hover:text-emerald-700 transition-colors">{item.title}</h4>
                <p className="text-stone-500 text-sm leading-relaxed">{item.desc}</p>
                <div className="mt-4 pt-4 border-t border-stone-50 flex justify-end">
                  <button 
                    onClick={() => setSelectedNews(item)}
                    className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2"
                  >
                    Read More <i className="fas fa-arrow-right text-[8px]"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-6">
          <h3 className="text-xl font-black text-stone-800 flex items-center gap-2">
            <i className="fas fa-cloud-sun text-amber-500"></i>
            {t.weatherForecast}
          </h3>
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
             <i className="fas fa-sun absolute -right-4 -top-4 text-9xl text-white/10 rotate-12"></i>
             <div className="relative z-10">
               {loadingWeather ? (
                 <p className="text-emerald-100 text-xs font-black uppercase">{t.detectingLocation}</p>
               ) : (
                 <>
                   <div className="flex justify-between items-start">
                     <div>
                        <p className="text-emerald-200 text-xs font-bold">{weather.location}</p>
                        <h4 className="text-5xl font-black mt-2">{weather.temp}&deg;C</h4>
                        <p className="text-emerald-100 mt-1 font-bold">{weather.condition}</p>
                     </div>
                   </div>
                   <div className="mt-8 flex justify-between border-t border-emerald-500/30 pt-4 text-sm font-bold">
                     <div><p className="text-[9px] text-emerald-300 uppercase">Humidity</p><p>{weather.humidity}%</p></div>
                     <div><p className="text-[9px] text-emerald-300 uppercase">Wind</p><p>{weather.wind}k</p></div>
                   </div>
                 </>
               )}
             </div>
          </div>
        </div>
      </div>

      {/* News Detail Modal */}
      {selectedNews && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-md" onClick={() => setSelectedNews(null)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
            <div className={`p-10 text-white sticky top-0 z-20 ${selectedNews.cat === 'Alert' ? 'bg-red-600' : 'bg-emerald-900'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-3 inline-block">
                    {selectedNews.cat}
                  </span>
                  <h3 className="text-3xl font-black leading-tight">{selectedNews.title}</h3>
                </div>
                <button 
                  onClick={() => setSelectedNews(null)}
                  className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>
            <div className="p-10 overflow-y-auto space-y-6">
              <p className="text-xl font-bold text-stone-800 italic border-l-4 border-emerald-500 pl-6 py-2">
                "{selectedNews.desc}"
              </p>
              <div className="prose prose-emerald max-w-none">
                <p className="text-stone-600 text-lg leading-relaxed whitespace-pre-wrap">
                  {selectedNews.full}
                </p>
              </div>
              <div className="pt-8 border-t border-stone-100 flex items-center justify-between">
                <span className="text-stone-400 font-bold text-sm">Published: {selectedNews.date}</span>
                <button 
                  onClick={() => setSelectedNews(null)}
                  className="bg-stone-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-800 transition-all"
                >
                  {t.close}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
