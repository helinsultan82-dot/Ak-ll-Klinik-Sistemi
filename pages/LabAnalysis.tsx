import React, { useState, useRef } from 'react';
import { analyzeLabResults } from '../services/geminiService';
import { LabAnalysisResult } from '../types';
import { FlaskConical, Sparkles, Loader2, FileText, Activity, AlertCircle, CheckCircle2, Info, Image as ImageIcon, X, Camera } from 'lucide-react';

const LabAnalysis: React.FC = () => {
  const [labText, setLabText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LabAnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!labText.trim() && !image) return;
    setLoading(true);
    setResult(null);
    
    try {
      const data = await analyzeLabResults(labText, image || undefined);
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Yüksek': return 'bg-red-100 text-red-700 border-red-200';
      case 'Düşük': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Kritik': return 'bg-red-600 text-white border-red-700 animate-pulse';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getStatusIcon = (status: string) => {
     if (status === 'Normal') return <CheckCircle2 className="w-4 h-4" />;
     return <AlertCircle className="w-4 h-4" />;
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600 mb-2">
          Akıllı Tahlil Analizi
        </h1>
        <p className="text-gray-500 text-lg">Tahlil sonuçlarınızı yapay zekaya yorumlatın, fotoğraf çekin veya değerleri girin.</p>
      </header>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Giriş Alanı */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-lg shadow-teal-900/5 border border-gray-100 relative overflow-hidden group">
            
            <div className="relative z-10">
                <label className="block text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-teal-500" />
                    Sonuçlarınızı Girin veya Yükleyin
                </label>

                {/* Resim Yükleme Alanı */}
                <div className="mb-6">
                  {!image ? (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full aspect-video border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-teal-400 hover:bg-teal-50 transition-all group"
                    >
                      <div className="p-4 bg-gray-50 rounded-full group-hover:bg-teal-100 group-hover:text-teal-600 transition-colors">
                        <Camera className="w-8 h-8 text-gray-400" />
                      </div>
                      <span className="text-sm font-bold text-gray-500 group-hover:text-teal-700">Tahlil Fotoğrafı Ekle</span>
                      <p className="text-[10px] text-gray-400">JPG, PNG veya PDF (Görsel)</p>
                    </button>
                  ) : (
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-gray-200 group">
                      <img src={image} alt="Tahlil Önizleme" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="p-3 bg-white rounded-xl text-teal-600 hover:bg-teal-50 shadow-lg transition-transform hover:scale-110"
                        >
                          <ImageIcon className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => setImage(null)}
                          className="p-3 bg-white rounded-xl text-red-600 hover:bg-red-50 shadow-lg transition-transform hover:scale-110"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                  />
                </div>

                <div className="mb-3 p-3 bg-blue-50 rounded-xl text-xs text-blue-700 flex items-start gap-2">
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Metin olarak eklemek isterseniz aşağıya yazabilirsiniz. (Örn: HGB 12.5)</span>
                </div>
                
                <textarea 
                    value={labText}
                    onChange={(e) => setLabText(e.target.value)}
                    placeholder="Veya manuel olarak değerleri buraya yazın..."
                    className="w-full h-32 p-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-teal-100 focus:border-teal-500 outline-none resize-none transition-all text-gray-700 font-mono text-sm"
                />

                <button
                    onClick={handleAnalyze}
                    disabled={loading || (!labText && !image)}
                    className="mt-6 w-full py-4 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white rounded-xl font-bold text-lg shadow-lg shadow-teal-500/30 transition-all flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            Yapay Zeka İnceliyor...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-6 h-6" />
                            Analizi Başlat
                        </>
                    )}
                </button>
            </div>
          </div>
          
          <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 text-sm text-amber-800">
            <h4 className="font-bold mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Yasal Uyarı
            </h4>
            <p>Bu analiz yapay zeka tarafından sağlanmaktadır ve tıbbi bir tanı niteliği taşımaz. Lütfen doktorunuza başvurun.</p>
          </div>
        </div>

        {/* Sonuç Alanı */}
        <div className="lg:col-span-7 space-y-6">
           {result ? (
             <div className="animate-slide-up space-y-6">
                
                {/* Genel Özet Kartı */}
                <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-6 rounded-3xl border border-teal-100">
                    <h3 className="text-xl font-bold text-teal-800 mb-3 flex items-center gap-2">
                        <Activity className="w-6 h-6" />
                        Genel Değerlendirme
                    </h3>
                    <p className="text-teal-900 leading-relaxed text-lg">
                        {result.summary}
                    </p>
                </div>

                {/* Detaylı Tablo */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <FlaskConical className="w-5 h-5 text-gray-400" />
                            Tespit Edilen Değerler
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {result.findings.map((finding, idx) => (
                            <div key={idx} className="p-5 hover:bg-gray-50 transition-colors">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                                    <div>
                                        <span className="font-bold text-gray-800 text-lg">{finding.parameterName}</span>
                                        <span className="ml-3 text-gray-500 font-mono text-sm bg-gray-100 px-2 py-1 rounded-md">{finding.value}</span>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 w-fit ${getStatusColor(finding.status)}`}>
                                        {getStatusIcon(finding.status)}
                                        {finding.status.toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {finding.interpretation}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Öneriler Kartı */}
                <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                    <h3 className="text-lg font-bold text-blue-800 mb-3">Beslenme ve Yaşam Önerileri</h3>
                    <p className="text-blue-900/80 leading-relaxed">
                        {result.dietaryAdvice}
                    </p>
                </div>

             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50 min-h-[500px]">
                <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
                    <FlaskConical className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="font-bold text-gray-400 text-xl">Rapor Hazırlanmaya Hazır</h3>
                <p className="text-gray-400 max-w-sm mt-2">
                    Tahlil sonucunun fotoğrafını yükleyin veya değerleri girin, saniyeler içinde detaylı raporunuzu alın.
                </p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default LabAnalysis;