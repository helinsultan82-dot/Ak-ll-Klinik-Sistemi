import React, { useState } from 'react';
import { analyzeSymptoms } from '../services/geminiService';
import { Department } from '../types';
import { Bot, Loader2, ArrowRight } from 'lucide-react';

interface AIAssistantProps {
  onSuggest: (dept: Department) => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ onSuggest }) => {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<{ department: Department; reasoning: string } | null>(null);

  const handleAnalyze = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    setSuggestion(null);
    try {
      const result = await analyzeSymptoms(symptoms);
      if (result) {
        setSuggestion(result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl border border-blue-100 shadow-sm mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-blue-600 rounded-lg">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-800">Yapay Zeka Asistanı</h3>
      </div>
      
      <p className="text-gray-600 mb-4 text-sm">
        Rahatsızlığınızı kısaca anlatın, yapay zeka sizin için en uygun polikliniği önersin.
      </p>

      <div className="flex gap-2">
        <input
          type="text"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="Örn: Başım çok ağrıyor ve midem bulanıyor..."
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
          onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
        />
        <button
          onClick={handleAnalyze}
          disabled={loading || !symptoms}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Analiz Et'}
        </button>
      </div>

      {suggestion && (
        <div className="mt-4 p-4 bg-white rounded-xl border border-green-100 shadow-sm animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-blue-600 mb-1">Önerilen Poliklinik:</p>
              <h4 className="text-xl font-bold text-gray-800">{suggestion.department}</h4>
              <p className="text-gray-500 text-sm mt-1">{suggestion.reasoning}</p>
            </div>
            <button
              onClick={() => onSuggest(suggestion.department)}
              className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg hover:bg-green-100 font-medium transition-colors whitespace-nowrap"
            >
              Randevu Al <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;