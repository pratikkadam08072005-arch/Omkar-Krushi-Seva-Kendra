
import { GoogleGenAI } from "@google/genai";
import React, { useState, useEffect } from "react";
import { getMarketPrices } from "../services/geminiService";
import { Language } from "../types";
import { translations } from "../translations";

interface MarketPricesProps {
  language: Language;
}

export const MarketPrices: React.FC<MarketPricesProps> = ({ language }) => {
  const t = translations[language];
  const [crop, setCrop] = useState("");
  const [location, setLocation] = useState("Maharashtra");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ text: string; sources: any[] } | null>(null);

  const handleSearch = async () => {
    if (!crop) return;
    setLoading(true);
    try {
      const res = await getMarketPrices(crop, location, language);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div className="text-center">
        <h2 className="text-4xl font-black text-emerald-900 tracking-tight">{t.mandiInsights}</h2>
        <p className="text-stone-500 mt-2 max-w-xl mx-auto">Powered by live search grounding.</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-stone-100 grid md:grid-cols-7 gap-6 items-end">
        <div className="md:col-span-3 space-y-2">
          <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">Crop</label>
          <input type="text" placeholder="e.g., Cotton" value={crop} onChange={(e) => setCrop(e.target.value)} className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-5 py-4 font-bold" />
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">{t.village}/{t.city}</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-5 py-4 font-bold" />
        </div>
        <div className="md:col-span-2">
          <button type="submit" disabled={loading} className="w-full font-black rounded-2xl py-4 bg-amber-400 hover:bg-amber-500 text-emerald-950 shadow-2xl transition-all">
            {loading ? <i className="fas fa-circle-notch fa-spin"></i> : t.getLiveRates}
          </button>
        </div>
      </form>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {data ? (
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-stone-100">
               <h3 className="text-2xl font-black text-stone-800 mb-6">{crop} - {location}</h3>
               <div className="whitespace-pre-wrap font-medium text-stone-700 leading-relaxed">{data.text}</div>
            </div>
          ) : (
            <div className="bg-white p-16 rounded-[3rem] border border-stone-100 flex flex-col items-center text-center">
               <i className="fas fa-chart-area text-5xl text-stone-100 mb-6"></i>
               <h3 className="text-2xl font-black text-stone-800">{t.mandiInsights}</h3>
            </div>
          )}
        </div>
        <div className="space-y-6">
           <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100">
             <h4 className="text-lg font-black text-stone-800 mb-6">{t.watchlist}</h4>
             <p className="text-stone-400 italic text-sm">Tracking active crops...</p>
           </section>
        </div>
      </div>
    </div>
  );
};
