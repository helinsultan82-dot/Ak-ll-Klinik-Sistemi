import React, { useState, useEffect } from 'react';
import { Department, Doctor, TimeSlot, Appointment, Patient } from '../types';
import { getDoctorsByDepartment, TIME_SLOTS, addAppointment } from '../services/dataService';
import AIAssistant from '../components/AIAssistant';
import { Calendar, User, Clock, CheckCircle2, ChevronRight, Stethoscope, Loader2 } from 'lucide-react';

interface BookingProps {
  currentUser?: Patient | null;
}

const Booking: React.FC<BookingProps> = ({ currentUser }) => {
  const [step, setStep] = useState(1);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [patientInfo, setPatientInfo] = useState({ name: '', tc: '', age: '', symptoms: '' });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Data State
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  useEffect(() => {
    if (currentUser) {
      setPatientInfo(prev => ({
        ...prev,
        name: currentUser.name,
        tc: currentUser.tc,
        age: currentUser.age
      }));
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchDoctors = async () => {
      if (selectedDept) {
        setLoadingDoctors(true);
        const docs = await getDoctorsByDepartment(selectedDept);
        setDoctors(docs);
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, [selectedDept]);

  const handleDepartmentSelect = (dept: Department) => {
    setSelectedDept(dept);
    setSelectedDoctor(null);
    setStep(2);
  };

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setStep(3);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleConfirm = async () => {
    if (!selectedDoctor || !selectedDept || !selectedTime) return;
    
    setLoading(true);

    const newAppointment: Appointment = {
      id: '', // Supabase generated
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      department: selectedDept,
      patientName: patientInfo.name,
      patientTc: patientInfo.tc,
      patientAge: patientInfo.age,
      date: selectedDate,
      time: selectedTime,
      status: 'pending',
      symptoms: patientInfo.symptoms
    };
    
    const isSaved = await addAppointment(newAppointment);

    if (isSaved) {
      setSuccess(true);
    } else {
      alert('Randevu oluşturulurken bir hata oluştu.');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in py-12">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-green-200 shadow-lg">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-4xl font-extrabold text-gray-800 mb-2 tracking-tight">Randevu Başarılı!</h2>
        <p className="text-gray-600 mb-8 max-w-md text-lg">
          Sayın <strong>{patientInfo.name}</strong>, randevunuz başarıyla oluşturulmuştur.
        </p>
        
        <div className="bg-white/70 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/50 w-full max-w-lg mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-500"></div>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Doktor</span>
              <span className="font-bold text-gray-800">{selectedDoctor?.name}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Bölüm</span>
              <span className="font-bold text-gray-800">{selectedDept}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Tarih & Saat</span>
              <div className="text-right">
                <span className="block font-bold text-gray-800">{selectedDate}</span>
                <span className="text-blue-600 font-bold">{selectedTime}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Hasta Yaşı</span>
              <span className="font-bold text-gray-800">{patientInfo.age}</span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => window.location.reload()}
          className="bg-gray-900 text-white px-10 py-4 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
        >
          Yeni Randevu Al
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
          Randevu Oluştur
        </h1>
        <p className="text-gray-500 text-lg">Yapay zeka destekli akıllı klinik sistemi.</p>
      </header>

      {/* Modern Progress Bar */}
      <div className="relative mb-12 px-4">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded-full -z-10"></div>
        <div className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 -translate-y-1/2 rounded-full transition-all duration-500 -z-10"
             style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
        
        <div className="flex justify-between w-full">
          {[
            { id: 1, label: 'Bölüm' },
            { id: 2, label: 'Doktor' },
            { id: 3, label: 'Zaman & Kişi' },
            { id: 4, label: 'Onay' }
          ].map((s) => (
            <div key={s.id} className="flex flex-col items-center group cursor-default">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-4 ${
                s.id <= step 
                  ? 'bg-white border-blue-600 text-blue-600 shadow-lg shadow-blue-200 scale-110' 
                  : 'bg-white border-gray-200 text-gray-300'
              }`}>
                {s.id < step ? <CheckCircle2 className="w-6 h-6" /> : s.id}
              </div>
              <span className={`text-xs mt-3 font-semibold uppercase tracking-wider transition-colors ${
                s.id <= step ? 'text-blue-700' : 'text-gray-400'
              }`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="animate-slide-up">
          <AIAssistant onSuggest={handleDepartmentSelect} />
          
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                <Stethoscope className="w-5 h-5" />
            </span>
            Bir Poliklinik Seçin
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {Object.values(Department).map((dept) => (
              <button
                key={dept}
                onClick={() => handleDepartmentSelect(dept)}
                className={`p-6 rounded-2xl border transition-all duration-200 text-left group relative overflow-hidden ${
                  selectedDept === dept
                    ? 'border-blue-500 bg-blue-50 shadow-blue-100 shadow-xl'
                    : 'border-transparent bg-white shadow-sm hover:shadow-md hover:scale-[1.02]'
                }`}
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-transparent to-blue-50/50 pointer-events-none`} />
                <div className="flex justify-between items-center relative z-10">
                  <span className={`font-semibold text-lg ${selectedDept === dept ? 'text-blue-700' : 'text-gray-700'}`}>
                    {dept}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${selectedDept === dept ? 'bg-blue-200 text-blue-700' : 'bg-gray-100 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600'}`}>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && selectedDept && (
        <div className="animate-slide-up">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                <User className="w-5 h-5" />
              </span>
              Doktor Seçimi <span className="text-gray-400 text-lg font-normal ml-2">/ {selectedDept}</span>
            </h3>
            <button onClick={() => setStep(1)} className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">← Geri Dön</button>
          </div>

          {loadingDoctors ? (
            <div className="flex justify-center p-10">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  onClick={() => handleDoctorSelect(doctor)}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 cursor-pointer transition-all duration-300 group flex flex-col items-center text-center relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-blue-50 to-transparent -z-0" />
                  
                  <div className="relative mb-4">
                      <img src={doctor.image} alt={doctor.name} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute -bottom-2 -right-2 bg-white px-2 py-1 rounded-full shadow-md text-xs font-bold text-amber-500 flex items-center gap-1">
                          ★ {doctor.rating}
                      </div>
                  </div>
                  
                  <h4 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-blue-700 transition-colors">{doctor.name}</h4>
                  <p className="text-sm text-gray-500 mb-4">{doctor.experience} Yıl Deneyim</p>
                  
                  <button className="w-full py-3 bg-gray-50 text-gray-700 rounded-xl font-semibold text-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                    Randevu Seç
                  </button>
                </div>
              ))}
              {doctors.length === 0 && <p className="col-span-3 text-center text-gray-400 py-10">Bu bölümde henüz doktor bulunmamaktadır.</p>}
            </div>
          )}
        </div>
      )}

      {step === 3 && selectedDoctor && (
        <div className="animate-slide-up grid lg:grid-cols-12 gap-8">
          {/* Left Column: Date & Time */}
          <div className="lg:col-span-7 space-y-6">
             <div className="flex items-center justify-between mb-2">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                    <Calendar className="w-5 h-5" />
                </span>
                Tarih ve Saat
              </h3>
              <button onClick={() => setStep(2)} className="text-sm font-medium text-gray-500 hover:text-blue-600">← Geri Dön</button>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <label className="block text-sm font-bold text-gray-700 mb-3 ml-1">Randevu Tarihi</label>
              <input 
                type="date" 
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium"
              />
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
               <h4 className="text-sm font-bold text-gray-700 mb-4 ml-1 flex items-center gap-2">
                   <Clock className="w-4 h-4 text-gray-400" />
                   Müsait Saatler
               </h4>
               <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                 {TIME_SLOTS.map((slot, idx) => (
                   <button
                    key={idx}
                    disabled={!slot.available}
                    onClick={() => handleTimeSelect(slot.time)}
                    className={`py-3 rounded-xl text-sm font-bold transition-all duration-200 border-2 ${
                      !slot.available 
                        ? 'bg-gray-50 text-gray-300 border-transparent cursor-not-allowed decoration-slice' 
                        : selectedTime === slot.time
                          ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 scale-105'
                          : 'bg-white text-gray-600 border-gray-100 hover:border-blue-400 hover:text-blue-600'
                    }`}
                   >
                     {slot.time}
                   </button>
                 ))}
               </div>
            </div>
          </div>

          {/* Right Column: Patient Form */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-blue-900/5 border border-gray-100 h-fit sticky top-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-500" />
                    Hasta Bilgileri
                </h3>
                
                <div className="space-y-5">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Ad Soyad</label>
                    <input 
                    type="text" 
                    value={patientInfo.name}
                    readOnly={!!currentUser} // Read-only if logged in
                    onChange={(e) => setPatientInfo({...patientInfo, name: e.target.value})}
                    className={`w-full p-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all ${currentUser ? 'bg-gray-50 cursor-not-allowed text-gray-500' : ''}`}
                    placeholder="Adınız Soyadınız"
                    />
                </div>
                
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">TC Kimlik No</label>
                        <input 
                        type="text" 
                        maxLength={11}
                        value={patientInfo.tc}
                        readOnly={!!currentUser}
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            setPatientInfo({...patientInfo, tc: val});
                        }}
                        className={`w-full p-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all ${currentUser ? 'bg-gray-50 cursor-not-allowed text-gray-500' : ''}`}
                        placeholder="12345678901"
                        />
                    </div>
                    <div className="w-1/3">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Yaş</label>
                        <input 
                        type="number" 
                        min="0"
                        max="120"
                        value={patientInfo.age}
                        readOnly={!!currentUser}
                        onChange={(e) => setPatientInfo({...patientInfo, age: e.target.value})}
                        className={`w-full p-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all ${currentUser ? 'bg-gray-50 cursor-not-allowed text-gray-500' : ''}`}
                        placeholder="25"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Şikayet (Opsiyonel)</label>
                    <textarea 
                    rows={3}
                    value={patientInfo.symptoms}
                    onChange={(e) => setPatientInfo({...patientInfo, symptoms: e.target.value})}
                    className="w-full p-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none resize-none"
                    placeholder="Rahatsızlığınızı kısaca açıklayın..."
                    />
                </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100">
                <button
                    disabled={!selectedTime || !patientInfo.name || patientInfo.tc.length !== 11 || !patientInfo.age}
                    onClick={() => setStep(4)} 
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 transition-all transform active:scale-[0.98]"
                >
                    Randevuyu Tamamla
                </button>
                </div>
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="animate-fade-in flex flex-col items-center justify-center py-20">
            {loading ? (
                 <>
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                    <h3 className="text-2xl font-bold text-gray-800">İşleminiz Yapılıyor...</h3>
                    <p className="text-gray-500 mt-2">Lütfen bekleyiniz, randevunuz onaylanıyor.</p>
                 </>
            ) : (
                (() => {
                    setTimeout(handleConfirm, 100); 
                    return null;
                })()
            )}
        </div>
      )}
    </div>
  );
};

export default Booking;