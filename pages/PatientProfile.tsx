import React, { useEffect, useState } from 'react';
import { Patient, Appointment } from '../types';
import { getAppointments } from '../services/dataService';
import { User, Activity, Calendar, Clock, Weight, Ruler, Droplets, AlertCircle, FileText, ChevronRight, Plus, ScanFace, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BodyMap from '../components/BodyMap';

interface PatientProfileProps {
  user: Patient | null;
}

const PatientProfile: React.FC<PatientProfileProps> = ({ user }) => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const allApps = await getAppointments();
        const userApps = allApps.filter(app => app.patientTc === user.tc);
        userApps.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setAppointments(userApps);
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  if (!user) return <div className="p-10 text-center text-gray-500">Kullanıcı bilgisi bulunamadı.</div>;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Profile Card */}
      <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        <div className="px-8 pb-8 flex flex-col md:flex-row items-center md:items-end -mt-16 gap-6">
          <img 
            src={user.image} 
            alt={user.name} 
            className="w-32 h-32 rounded-3xl border-4 border-white shadow-lg object-cover bg-white"
          />
          <div className="flex-1 text-center md:text-left mb-2">
            <h1 className="text-3xl font-extrabold text-gray-900">{user.name}</h1>
            <p className="text-gray-500 font-medium">TC: {user.tc} • {user.age} Yaş</p>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="mb-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Yeni Randevu
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Sol Kolon: Vücut Haritası ve Vücut Endeksi */}
        <div className="space-y-8">
            {/* Vücut Haritası */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <ScanFace className="w-5 h-5 text-indigo-500" />
                  Vücut Sağlık Haritası
                </h3>
                <BodyMap conditions={user.conditions || []} />
            </div>

          {/* Vücut Bilgileri */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Vücut Endeksi
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-2xl text-center">
                <Droplets className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <span className="block text-xs text-blue-400 font-bold uppercase">Kan Grubu</span>
                <span className="font-extrabold text-gray-800">{user.bloodType}</span>
              </div>
              <div className="bg-green-50 p-4 rounded-2xl text-center">
                <Weight className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <span className="block text-xs text-green-400 font-bold uppercase">Kilo</span>
                <span className="font-extrabold text-gray-800">{user.weight}</span>
              </div>
              <div className="bg-purple-50 p-4 rounded-2xl text-center">
                <Ruler className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                <span className="block text-xs text-purple-400 font-bold uppercase">Boy</span>
                <span className="font-extrabold text-gray-800">{user.height}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sağ Kolon: Detaylar ve Geçmiş */}
        <div className="lg:col-span-2 space-y-8">
            {/* Kronik Rahatsızlıklar Listesi */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Hastalık Detayları
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                {user.conditions && user.conditions.length > 0 ? user.conditions.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-gray-800">{item.condition}</span>
                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider border ${
                            item.status === 'Active' ? 'bg-red-50 text-red-600 border-red-100' : 
                            item.status === 'Healed' ? 'bg-green-50 text-green-600 border-green-100' :
                            'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                            {item.status}
                        </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">Bölge: {item.bodyPart ? item.bodyPart.replace('_', ' ').toUpperCase() : 'GENEL'}</p>
                    <p className="text-sm text-gray-600">{item.notes}</p>
                    </div>
                )) : (
                    <p className="text-gray-400 text-sm py-4 col-span-2">Kayıtlı rahatsızlık bulunmamaktadır.</p>
                )}
                </div>
            </div>

           {/* Randevu Geçmişi */}
           <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-indigo-500" />
                    Randevu Geçmişi
                </h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{loading ? '...' : appointments.length} Kayıt</span>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 flex justify-center">
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                    </div>
                ) : appointments.length > 0 ? (
                <div className="divide-y divide-gray-100">
                    {appointments.map((app) => (
                    <div key={app.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col md:flex-row gap-4 justify-between items-start md:items-center group">
                        <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                            app.status === 'confirmed' ? 'bg-green-100 text-green-600' :
                            app.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                            app.status === 'completed' ? 'bg-gray-100 text-gray-500' :
                            'bg-red-100 text-red-600'
                            }`}>
                            <FileText className="w-6 h-6" />
                            </div>
                            <div>
                            <h4 className="font-bold text-gray-800 text-lg group-hover:text-indigo-600 transition-colors">{app.department}</h4>
                            <p className="text-gray-500">{app.doctorName}</p>
                            {app.symptoms && <p className="text-xs text-gray-400 mt-1 max-w-md truncate">Şikayet: {app.symptoms}</p>}
                            </div>
                        </div>

                        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                            <div className="text-right">
                            <div className="font-bold text-gray-800 flex items-center gap-1 justify-end">
                                <Calendar className="w-3 h-3 text-gray-400" /> {app.date}
                            </div>
                            <div className="text-sm text-indigo-600 font-bold flex items-center gap-1 justify-end">
                                <Clock className="w-3 h-3" /> {app.time}
                            </div>
                            </div>
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                            app.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            app.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            app.status === 'completed' ? 'bg-gray-100 text-gray-600' :
                            'bg-red-100 text-red-700'
                            }`}>
                            {app.status === 'confirmed' ? 'Onaylı' : 
                            app.status === 'pending' ? 'Bekliyor' :
                            app.status === 'completed' ? 'Bitti' : 'İptal'}
                            </span>
                        </div>
                    </div>
                    ))}
                </div>
                ) : (
                    <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-gray-800 font-bold mb-1">Henüz Randevunuz Yok</h3>
                    <p className="text-gray-500 text-sm mb-6">İlk randevunuzu oluşturarak sağlığınızı takip etmeye başlayın.</p>
                    <button onClick={() => navigate('/')} className="text-indigo-600 font-bold hover:underline">Randevu Al →</button>
                    </div>
                )}
            </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;