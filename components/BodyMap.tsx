import React from 'react';
import { MedicalHistory, BodyPart } from '../types';

interface BodyMapProps {
  conditions: MedicalHistory[];
}

const BodyMap: React.FC<BodyMapProps> = ({ conditions }) => {
  
  // Koordinat haritası (% left, % top)
  const coordinates: Record<string, { left: string; top: string }> = {
    head: { left: '50%', top: '7%' },
    neck: { left: '50%', top: '18%' },
    chest: { left: '50%', top: '25%' },
    heart: { left: '54%', top: '26%' }, // Kalp solda (ekrana göre sağa yakın)
    left_arm: { left: '25%', top: '35%' },
    right_arm: { left: '75%', top: '35%' },
    stomach: { left: '50%', top: '40%' },
    left_leg: { left: '42%', top: '70%' },
    right_leg: { left: '58%', top: '70%' },
    general: { left: '10%', top: '10%' }
  };

  return (
    <div className="relative h-[400px] w-full bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-center overflow-hidden">
      {/* Basitleştirilmiş Vücut Silueti SVG */}
      <svg
        viewBox="0 0 200 400"
        className="h-full w-auto text-slate-300 drop-shadow-sm"
        fill="currentColor"
      >
         {/* Kafa */}
        <circle cx="100" cy="40" r="25" />
        {/* Gövde */}
        <path d="M70,70 Q100,65 130,70 L140,160 Q100,170 60,160 Z" />
        {/* Kollar */}
        <path d="M70,70 L40,150 L55,160 L80,80 Z" />
        <path d="M130,70 L160,150 L145,160 L120,80 Z" />
        {/* Bacaklar */}
        <path d="M70,160 L65,300 L85,300 L95,165 Z" />
        <path d="M130,160 L135,300 L115,300 L105,165 Z" />
      </svg>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

      {/* Hastalık Noktaları */}
      {conditions.map((item, idx) => {
        const coords = item.bodyPart && coordinates[item.bodyPart] ? coordinates[item.bodyPart] : null;
        if (!coords) return null;

        return (
          <div
            key={idx}
            className="absolute group"
            style={{ left: coords.left, top: coords.top, transform: 'translate(-50%, -50%)' }}
          >
            {/* Pulsing Dot */}
            <span className="relative flex h-5 w-5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${item.status === 'Healed' ? 'bg-green-400' : 'bg-red-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-5 w-5 border-2 border-white shadow-sm ${item.status === 'Healed' ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </span>

            {/* Tooltip */}
            <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-max max-w-[150px] opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
              <div className="bg-slate-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl">
                <p className="font-bold">{item.condition}</p>
                <p className="text-slate-400 text-[10px]">{item.status}</p>
                <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
              </div>
            </div>
          </div>
        );
      })}
      
      <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-slate-200 text-xs shadow-sm">
         <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-slate-600">Aktif Sorun</span>
         </div>
         <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-slate-600">İyileşmiş</span>
         </div>
      </div>
    </div>
  );
};

export default BodyMap;