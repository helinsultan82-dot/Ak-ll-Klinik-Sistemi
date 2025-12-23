import { Doctor, Department, Appointment, TimeSlot, Patient } from '../types';
import { supabase } from './supabaseClient';

// --- SEED DATA (DB boşsa kullanılacak veriler) ---
const SEED_DOCTORS: Partial<Doctor>[] = [
  { name: 'Prof. Dr. Ahmet Yılmaz', department: Department.CARDIOLOGY, image: 'https://picsum.photos/200/200?random=1', experience: 15, rating: 4.9 },
  { name: 'Uzm. Dr. Ayşe Demir', department: Department.INTERNAL_MEDICINE, image: 'https://picsum.photos/200/200?random=2', experience: 8, rating: 4.7 },
  { name: 'Op. Dr. Mehmet Öz', department: Department.ORTHOPEDICS, image: 'https://picsum.photos/200/200?random=3', experience: 12, rating: 4.8 },
  { name: 'Dr. Zeynep Kaya', department: Department.PEDIATRICS, image: 'https://picsum.photos/200/200?random=4', experience: 5, rating: 4.9 },
  { name: 'Uzm. Dr. Caner Erkin', department: Department.DERMATOLOGY, image: 'https://picsum.photos/200/200?random=5', experience: 10, rating: 4.6 },
  { name: 'Prof. Dr. Selin Şahin', department: Department.NEUROLOGY, image: 'https://picsum.photos/200/200?random=6', experience: 20, rating: 5.0 },
  { name: 'Op. Dr. Burak Yılmaz', department: Department.ENT, image: 'https://picsum.photos/200/200?random=7', experience: 7, rating: 4.5 },
];

export const TIME_SLOTS: TimeSlot[] = [
  { time: '09:00', available: true },
  { time: '09:30', available: true },
  { time: '10:00', available: false },
  { time: '10:30', available: true },
  { time: '11:00', available: true },
  { time: '11:30', available: false },
  { time: '13:00', available: true },
  { time: '13:30', available: true },
  { time: '14:00', available: true },
  { time: '14:30', available: true },
  { time: '15:00', available: true },
  { time: '15:30', available: false },
  { time: '16:00', available: true },
];

// --- API METHODS ---

// Doktorları getir (Eğer DB boşsa seed verilerini yükler)
export const getDoctors = async (): Promise<Doctor[]> => {
  const { data, error } = await supabase.from('doctors').select('*');
  
  if (error) {
    console.error('Error fetching doctors:', error);
    return [];
  }

  // Eğer veritabanı boşsa seed et
  if (!data || data.length === 0) {
    const { data: newData, error: seedError } = await supabase.from('doctors').insert(SEED_DOCTORS).select();
    if (seedError) console.error('Error seeding doctors:', seedError);
    return (newData as Doctor[]) || [];
  }

  return data as Doctor[];
};

export const getDoctorsByDepartment = async (dept: Department): Promise<Doctor[]> => {
  const allDoctors = await getDoctors();
  return allDoctors.filter(doc => doc.department === dept);
};

export const getAppointments = async (): Promise<Appointment[]> => {
  const { data, error } = await supabase.from('appointments').select('*');
  if (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
  return data as Appointment[];
};

// --- WRITE OPERATIONS ---

export const registerPatient = async (newPatient: Patient): Promise<{ success: boolean; message: string }> => {
  try {
    // 1. TC kontrolü
    const { data: existingUser, error: checkError } = await supabase
      .from('patients')
      .select('id')
      .eq('tc', newPatient.tc)
      .maybeSingle();

    if (checkError) {
      console.error('Check User Error:', checkError);
      if (checkError.message.includes('Could not find the table') || checkError.message.includes('relation "public.patients" does not exist')) {
          return { success: false, message: 'Veritabanı tabloları oluşturulmamış. Lütfen Supabase SQL Editöründen tabloları kurunuz.' };
      }
      return { success: false, message: `Bağlantı hatası: ${checkError.message}` };
    }

    if (existingUser) {
      return { success: false, message: 'Bu TC Kimlik numarası ile zaten bir kayıt mevcut.' };
    }

    // 2. Insert işlemi
    const { error: insertError } = await supabase.from('patients').insert([
      {
        name: newPatient.name,
        tc: newPatient.tc,
        email: newPatient.email, // Eklendi
        password: newPatient.password,
        age: newPatient.age,
        image: newPatient.image,
        blood_type: newPatient.bloodType,
        weight: newPatient.weight,
        height: newPatient.height,
        conditions: newPatient.conditions
      }
    ]);

    if (insertError) {
      console.error('Register Insert Error:', insertError);
      return { success: false, message: `Kayıt oluşturulamadı: ${insertError.message}` };
    }

    return { success: true, message: 'Kayıt başarılı!' };

  } catch (err: any) {
    console.error('Unexpected Register Error:', err);
    return { success: false, message: 'Beklenmedik bir hata oluştu.' };
  }
};

export const loginPatient = async (tc: string, password: string): Promise<{ success: boolean; user?: Patient; message?: string }> => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('tc', tc)
      .eq('password', password)
      .maybeSingle();
    
    if (error) {
      console.error('Login Error:', error);
      if (error.message.includes('Could not find the table') || error.message.includes('relation "public.patients" does not exist')) {
        return { success: false, message: 'Veritabanı tabloları eksik.' };
      }
      return { success: false, message: 'Giriş işlemi sırasında hata oluştu.' };
    }

    if (!data) {
      return { success: false, message: 'TC Kimlik No veya şifre hatalı.' };
    }

    // DB verisini Patient tipine dönüştürme
    const user: Patient = {
      id: data.id,
      name: data.name,
      tc: data.tc,
      email: data.email || '', // Eklendi
      password: data.password,
      age: data.age,
      image: data.image,
      bloodType: data.blood_type,
      weight: data.weight,
      height: data.height,
      conditions: data.conditions || []
    };

    return { success: true, user };

  } catch (err) {
    console.error('Unexpected Login Error:', err);
    return { success: false, message: 'Beklenmedik bir hata oluştu.' };
  }
};

export const addAppointment = async (appointment: Appointment): Promise<boolean> => {
  const { error } = await supabase.from('appointments').insert([{
    doctor_id: appointment.doctorId,
    doctor_name: appointment.doctorName,
    department: appointment.department,
    patient_name: appointment.patientName,
    patient_tc: appointment.patientTc,
    patient_age: appointment.patientAge,
    date: appointment.date,
    time: appointment.time,
    status: appointment.status,
    symptoms: appointment.symptoms
  }]);

  if (error) {
    console.error('Add appointment error:', error);
    return false;
  }
  return true;
};

export const updateAppointmentStatus = async (id: string, status: 'confirmed' | 'cancelled') => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: status })
      .eq('id', id);
      
    if (error) console.error('Update status error:', error);
};