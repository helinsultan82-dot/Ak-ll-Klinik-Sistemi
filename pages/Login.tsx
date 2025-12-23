import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ArrowRight, ShieldCheck, HeartPulse, UserPlus, CreditCard, Loader2, Mail } from 'lucide-react';
import { loginPatient, registerPatient } from '../services/dataService';
import { Patient } from '../types';

interface LoginProps {
  onLogin: (role: 'admin' | 'patient', patientData?: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'admin' | 'patient'>('patient');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Register State
  const [regData, setRegData] = useState({
    name: '',
    tc: '',
    email: '',
    password: '',
    age: '',
    gender: 'Erkek'
  });

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (activeTab === 'admin') {
        // Admin hardcoded for now
        if (username === 'admin' && password === '1234') {
          onLogin('admin');
          navigate('/admin');
        } else {
          setError('Yönetici bilgileri hatalı! (Demo: admin / 1234)');
        }
      } else {
        const result = await loginPatient(username, password);
        if (result.success && result.user) {
          onLogin('patient', result.user);
          navigate('/profile');
        } else {
          setError(result.message || 'Giriş başarısız.');
        }
      }
    } catch (err) {
      setError('Bir bağlantı hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!regData.name || !regData.tc || !regData.password || !regData.age || !regData.email) {
      setError('Lütfen tüm alanları doldurunuz.');
      return;
    }

    if (regData.tc.length !== 11) {
      setError('TC Kimlik No 11 haneli olmalıdır.');
      return;
    }

    setLoading(true);

    const newPatient: Patient = {
      id: '', // Supabase will generate
      name: regData.name,
      tc: regData.tc,
      email: regData.email,
      password: regData.password,
      age: regData.age,
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${regData.name}`,
      bloodType: 'Bilinmiyor',
      weight: '-',
      height: '-',
      conditions: []
    };

    try {
      const result = await registerPatient(newPatient);
      
      if (result.success) {
        setSuccessMsg('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
        setTimeout(() => {
          setIsRegistering(false);
          setUsername(regData.tc);
          setSuccessMsg('');
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Kayıt sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md relative overflow-hidden transition-all duration-500">
        
        {/* Decorative Background Element */}
        <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r transition-colors duration-500 ${activeTab === 'admin' ? 'from-slate-700 to-slate-900' : 'from-blue-500 to-teal-500'}`}></div>
        
        {/* Tab Header */}
        {!isRegistering && (
          <div className="flex border-b border-gray-100">
            <button 
              onClick={() => setActiveTab('patient')}
              className={`flex-1 py-4 text-sm font-bold transition-all ${activeTab === 'patient' ? 'text-teal-600 bg-teal-50' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Hasta Girişi
            </button>
            <button 
              onClick={() => setActiveTab('admin')}
              className={`flex-1 py-4 text-sm font-bold transition-all ${activeTab === 'admin' ? 'text-slate-800 bg-slate-50' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Yönetici Girişi
            </button>
          </div>
        )}

        <div className="p-10">
          
          <div className="flex justify-center mb-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-inner transition-colors duration-500 ${activeTab === 'admin' ? 'bg-slate-100 text-slate-700' : 'bg-teal-50 text-teal-600'}`}>
              {activeTab === 'admin' ? <ShieldCheck className="w-10 h-10" /> : <HeartPulse className="w-10 h-10" />}
            </div>
          </div>

          <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-2">
            {isRegistering ? 'Yeni Hesap Oluştur' : (activeTab === 'admin' ? 'Yönetici Paneli' : 'Hasta Portalı')}
          </h2>
          <p className="text-center text-gray-500 mb-8">
            {isRegistering ? 'Randevu almak için bilgilerinizi giriniz.' : (activeTab === 'admin' ? 'Klinik yönetimi için giriş yapınız.' : 'Randevu ve tahlilleriniz için giriş yapınız.')}
          </p>

          {/* LOGIN FORM */}
          {!isRegistering ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {activeTab === 'admin' ? 'Kullanıcı Adı' : 'TC Kimlik No'}
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-4 outline-none transition-all ${activeTab === 'admin' ? 'focus:ring-slate-200 focus:border-slate-500' : 'focus:ring-teal-100 focus:border-teal-500'}`}
                    placeholder={activeTab === 'admin' ? 'admin' : '12345678901'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Şifre</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-4 outline-none transition-all ${activeTab === 'admin' ? 'focus:ring-slate-200 focus:border-slate-500' : 'focus:ring-teal-100 focus:border-teal-500'}`}
                    placeholder="••••"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium text-center animate-pulse">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 group transform active:scale-[0.98] ${activeTab === 'admin' ? 'bg-slate-800 hover:bg-slate-700 shadow-slate-200' : 'bg-teal-600 hover:bg-teal-700 shadow-teal-200'} ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Giriş Yap'}
                {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </button>

              {activeTab === 'patient' && (
                <div className="text-center pt-2">
                  <button 
                    type="button"
                    onClick={() => { setIsRegistering(true); setError(''); }}
                    className="text-teal-600 font-bold text-sm hover:underline"
                  >
                    Hesabınız yok mu? Kayıt Olun
                  </button>
                </div>
              )}
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegister} className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ad Soyad</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={regData.name}
                    onChange={(e) => setRegData({...regData, name: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-teal-100 focus:border-teal-500 outline-none transition-all text-sm"
                    placeholder="Adınız Soyadınız"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">E-Posta Adresi</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={regData.email}
                    onChange={(e) => setRegData({...regData, email: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-teal-100 focus:border-teal-500 outline-none transition-all text-sm"
                    placeholder="ornek@email.com"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                 <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">TC Kimlik</label>
                    <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        maxLength={11}
                        value={regData.tc}
                        onChange={(e) => setRegData({...regData, tc: e.target.value.replace(/\D/g, '')})}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-teal-100 focus:border-teal-500 outline-none transition-all text-sm"
                        placeholder="11 Hane"
                    />
                    </div>
                 </div>
                 <div className="w-1/3">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Yaş</label>
                    <input
                        type="number"
                        value={regData.age}
                        onChange={(e) => setRegData({...regData, age: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-teal-100 focus:border-teal-500 outline-none transition-all text-sm text-center"
                        placeholder="Yaş"
                    />
                 </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Şifre Belirle</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={regData.password}
                    onChange={(e) => setRegData({...regData, password: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-teal-100 focus:border-teal-500 outline-none transition-all text-sm"
                    placeholder="••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs font-bold text-center">
                  {error}
                </div>
              )}
               {successMsg && (
                <div className="p-3 rounded-lg bg-green-50 text-green-600 text-xs font-bold text-center">
                  {successMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-lg shadow-teal-200 transition-all flex items-center justify-center gap-2"
              >
                 {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><UserPlus className="w-5 h-5" /> Kayıt Ol</>}
              </button>

              <div className="text-center pt-2">
                <button 
                    type="button"
                    onClick={() => { setIsRegistering(false); setError(''); }}
                    className="text-gray-500 font-medium text-xs hover:text-gray-800"
                  >
                    Giriş ekranına dön
                  </button>
              </div>
            </form>
          )}

          {!isRegistering && (
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400">
                {activeTab === 'admin' ? 'Demo: admin / 1234' : 'Demo: 12345678901 / 1234'}
                </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;