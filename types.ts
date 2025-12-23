export enum Department {
  CARDIOLOGY = 'Kardiyoloji',
  INTERNAL_MEDICINE = 'Dahiliye',
  ORTHOPEDICS = 'Ortopedi',
  PEDIATRICS = 'Çocuk Sağlığı',
  DERMATOLOGY = 'Cildiye',
  NEUROLOGY = 'Nöroloji',
  ENT = 'Kulak Burun Boğaz',
  GENERAL_SURGERY = 'Genel Cerrahi'
}

export interface Doctor {
  id: number;
  name: string;
  department: Department;
  image: string;
  experience: number;
  rating: number;
}

export interface Appointment {
  id: string;
  doctorId: number;
  doctorName: string;
  department: Department;
  patientName: string;
  patientTc: string;
  patientAge: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  symptoms?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface LabFinding {
  parameterName: string;
  value: string;
  status: 'Normal' | 'Yüksek' | 'Düşük' | 'Kritik';
  interpretation: string;
}

export interface LabAnalysisResult {
  summary: string;
  findings: LabFinding[];
  dietaryAdvice: string;
}

export type BodyPart = 'head' | 'neck' | 'chest' | 'heart' | 'stomach' | 'left_arm' | 'right_arm' | 'left_leg' | 'right_leg' | 'general';

export interface MedicalHistory {
  condition: string;
  diagnosedDate: string;
  status: 'Chronic' | 'Active' | 'Healed';
  notes: string;
  bodyPart?: BodyPart;
}

export interface Patient {
  id: string;
  name: string;
  tc: string;
  email: string; // Eklendi
  password?: string;
  age: string;
  image: string;
  bloodType: string;
  weight: string;
  height: string;
  conditions: MedicalHistory[];
}