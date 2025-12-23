import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Appointment, Department } from '../types';
import { getAppointments, updateAppointmentStatus } from '../services/dataService';
import { Users, Calendar, TrendingUp, Search, Filter, PieChart as PieChartIcon, Check, X, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
        const data = await getAppointments();
        setAppointments(data);
    };
    fetchData();
  }, []);

  const handleStatusChange = async (id: string, newStatus: 'confirmed' | 'cancelled') => {
    await updateAppointmentStatus(id, newStatus);
    // Refresh local state
    const updatedAppointments = appointments.map(app => 
      app.id === id ? { ...app, status: newStatus } : app
    );
    setAppointments(updatedAppointments);
  };

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    today: appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length
  };

  const chartData = Object.values(Department).map(dept => ({
    name: dept.split(' ')[0], // Shorten name
    count: appointments.filter(a => a.department === dept).length
  }));

  // Age Demographics Calculation
  const ageGroups = [
    { name: '0-18', min: 0, max: 18, count: 0, color: '#60a5fa' },
    { name: '19-35', min: 19, max: 35, count: 0, color: '#34d399' },
    { name: '36-60', min: 36, max: 60, count: 0, color: '#fbbf24' },
    { name: '60+', min: 61, max: 150, count: 0, color: '#f87171' },
  ];

  appointments.forEach(app => {
    const age = parseInt(app.patientAge || '0');
    const group = ageGroups.find(g => age >= g.min && age <= g.max);
    if (group) group.count++;
  });

  const ageChartData = ageGroups.filter(g => g.count > 0);

  const filteredAppointments = appointments.filter(a => 
    a.patientName.toLowerCase().includes(filter.toLowerCase()) ||
    a.doctorName.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <header className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Yönetim Paneli</h1>
          <p className="text-gray-500">Klinik performansı ve randevu analizleri</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-4 py-2 rounded-xl flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <StatCard title="Toplam Randevu" value={stats.total} icon={<Calendar className="text-white" />} color="bg-gradient-to-br from-blue-500 to-blue-600" />
        <StatCard title="Bugünkü Kayıtlar" value={stats.today} icon={<Users className="text-white" />} color="bg-gradient-to-br from-purple-500 to-purple-600" />
        <StatCard title="Onay Bekleyen" value={stats.pending} icon={<AlertCircle className="text-white" />} color="bg-gradient-to-br from-amber-500 to-amber-600" />
        <StatCard title="Tamamlanan" value={stats.completed} icon={<TrendingUp className="text-white" />} color="bg-gradient-to-br from-green-500 to-green-600" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Department Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col">
          <h3 className="font-bold text-gray-800 mb-6 text-lg">Bölüm Yoğunluk Analizi</h3>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{top: 20, right: 30, left: 20, bottom: 5}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{fontSize: 12, fill: '#6b7280'}} interval={0} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Age Demographics Pie Chart */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col">
          <h3 className="font-bold text-gray-800 mb-2 text-lg flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-gray-400" />
            Yaş Demografisi
          </h3>
          <p className="text-xs text-gray-500 mb-6">Randevuların yaş gruplarına göre dağılımı</p>
          <div className="flex-1 w-full min-h-[300px] flex justify-center items-center">
             {ageChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={ageChartData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {ageChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
             ) : (
                 <div className="text-gray-400 text-sm">Veri bulunamadı</div>
             )}
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">Son Randevular</h3>
            <p className="text-sm text-gray-500">Tüm randevu geçmişi ve durumları</p>
          </div>
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Hasta, Doktor veya Bölüm ara..." 
              className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Hasta Bilgisi</th>
                <th className="px-6 py-4">Yaş</th>
                <th className="px-6 py-4">Doktor & Bölüm</th>
                <th className="px-6 py-4">Tarih</th>
                <th className="px-6 py-4">Durum</th>
                <th className="px-6 py-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAppointments.length > 0 ? filteredAppointments.map((app) => (
                <tr key={app.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{app.patientName}</div>
                    <div className="text-xs text-gray-400 font-mono">{app.patientTc}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold text-xs">
                        {app.patientAge || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-800 font-medium">{app.doctorName}</div>
                    <div className="text-xs text-blue-600 bg-blue-50 inline-block px-2 py-0.5 rounded mt-1">{app.department}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-800">{app.date}</div>
                    <div className="text-xs text-gray-500">{app.time}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                      app.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      app.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      app.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {app.status === 'confirmed' ? 'Onaylandı' : 
                       app.status === 'pending' ? 'Bekliyor' :
                       app.status === 'completed' ? 'Tamamlandı' : 'İptal'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {app.status === 'pending' && (
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleStatusChange(app.id, 'confirmed')}
                          className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-500 hover:text-white transition-colors"
                          title="Onayla"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleStatusChange(app.id, 'cancelled')}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                          title="Reddet"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-gray-500">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h2 className="text-3xl font-extrabold text-gray-800">{value}</h2>
    </div>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-gray-200 ${color} group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
  </div>
);

export default AdminDashboard;