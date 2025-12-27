
import React, { useState, useRef } from 'react';
import { diagnoseCrop } from '../services/geminiService';
import { Language } from '../types';
import { translations } from '../translations';

interface CropDiagnosisProps {
  language: Language;
}

export const CropDiagnosis: React.FC<CropDiagnosisProps> = ({ language }) => {
  const t = translations[language];
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDiagnose = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const base64Data = image.split(',')[1];
      const diagnosis = await diagnoseCrop(base64Data, language);
      setResult(diagnosis || "Unable to analyze.");
    } catch (err) {
      setResult("Error analyzing image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black text-emerald-900 tracking-tight flex items-center justify-center gap-3">
          <i className="fas fa-microscope text-amber-500"></i>
          {t.diagnoseTitle}
        </h2>
        <p className="text-stone-500 max-w-xl mx-auto font-medium">{t.diagnoseDesc}</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-stone-100 flex flex-col items-center">
            {!image ? (
              <div onClick={() => fileInputRef.current?.click()} className="w-full h-80 border-4 border-dashed border-stone-100 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-stone-50 hover:border-emerald-200 transition-all group overflow-hidden relative">
                <i className="fas fa-camera text-5xl text-stone-200 group-hover:text-emerald-500 mb-6 transition-all group-hover:scale-110"></i>
                <p className="text-stone-400 font-black uppercase text-[10px] tracking-widest text-center px-8">Upload Photo</p>
                <input type="file" ref={fileInputRef} onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setImage(reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }} className="hidden" accept="image/*" />
              </div>
            ) : (
              <div className="w-full space-y-6">
                <div className="relative rounded-[2rem] overflow-hidden h-96 shadow-2xl border-4 border-white group">
                  <img src={image} className="w-full h-full object-cover" alt="Uploaded" />
                  <button onClick={() => {setImage(null); setResult(null);}} className="absolute top-4 right-4 bg-red-500 text-white w-10 h-10 rounded-xl shadow-lg flex items-center justify-center"><i className="fas fa-times"></i></button>
                </div>
                <button
                  onClick={handleDiagnose}
                  disabled={loading}
                  className="w-full py-5 rounded-2xl font-black text-white shadow-xl transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-3 bg-emerald-700 hover:bg-emerald-800"
                >
                  {loading ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-bolt"></i>}
                  {loading ? t.molecularProcessing : t.beginScan}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          {result ? (
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-stone-100 prose prose-emerald max-w-none">
              <h3 className="text-2xl font-black text-stone-800 mb-6 flex items-center gap-3">
                <i className="fas fa-file-medical text-emerald-600"></i>
                {t.reportGenerated}
              </h3>
              <div className="whitespace-pre-wrap font-medium text-stone-700">{result}</div>
            </div>
          ) : (
            <div className="bg-stone-50 h-full border-2 border-dashed border-stone-200 rounded-[3rem] flex flex-col items-center justify-center p-12 text-center text-stone-300">
               <i className="fas fa-file-medical text-6xl mb-6"></i>
               <h3 className="text-xl font-bold text-stone-400">Scan Pending</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
