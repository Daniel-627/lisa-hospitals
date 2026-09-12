// ── USER & AUTH ───────────────────────────────────────────────────────────────

export type UserRole =
  | "patient" | "doctor" | "nurse" | "receptionist"
  | "lab_technician" | "radiographer" | "pharmacist"
  | "billing_officer" | "admin";

export interface User {
  id: string;
  email: string;
  phone: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
}

// ── PATIENT ───────────────────────────────────────────────────────────────────

export type Gender = "male" | "female" | "other";
export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
export type InsuranceScheme = "sha" | "maki" | "aon" | "mtiba";

export interface Patient {
  id: string;
  userId: string;
  patientNumber: string;
  dateOfBirth: string;
  gender: Gender;
  bloodGroup?: BloodGroup;
  nationalId?: string;
  address?: string;
  nextOfKinName?: string;
  nextOfKinPhone?: string;
  nextOfKinRelation?: string;
  insuranceScheme?: InsuranceScheme;
  insuranceNumber?: string;
  allergies?: string;
  createdAt: string;
}

export interface PatientWithUser extends Patient {
  user: User;
}

// ── DEPARTMENT ────────────────────────────────────────────────────────────────

export type DepartmentSlug =
  | "outpatient_inpatient" | "accident_emergency"
  | "specialist_clinics" | "laboratory" | "pharmacy"
  | "radiology" | "physiotherapy" | "dental"
  | "maternity" | "eye_care" | "mother_child_health"
  | "critical_care_icu";

export interface Department {
  id: string;
  name: string;
  slug: DepartmentSlug;
  description?: string;
  isOpen24hrs: boolean;
  floor?: string;
  phone?: string;
  isActive: boolean;
}

// ── DOCTOR ────────────────────────────────────────────────────────────────────

export interface Doctor {
  id: string;
  staffId: string;
  departmentId: string;
  speciality: string;
  bio?: string;
  photoUrl?: string;
  consultationFee?: string;
  isAvailable: boolean;
}

export interface DoctorWithUser extends Doctor {
  user: User;
  department: Department;
}

export interface DoctorAvailability {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  maxSlots: number;
  isActive: boolean;
}

// ── APPOINTMENT ───────────────────────────────────────────────────────────────

export type AppointmentStatus =
  | "pending" | "confirmed" | "completed"
  | "cancelled" | "no_show";

export interface Appointment {
  id: string;
  patientId: string;
  doctorId?: string;
  departmentId: string;
  appointmentDate: string;
  appointmentTime: string;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
  bookedOnline: boolean;
  createdAt: string;
}

export interface AppointmentWithDetails extends Appointment {
  patient: PatientWithUser;
  doctor?: DoctorWithUser;
  department: Department;
}

export interface CreateAppointmentPayload {
  departmentId: string;
  doctorId?: string;
  appointmentDate: string;
  appointmentTime: string;
  reason?: string;
}

// ── VISIT & TRIAGE ────────────────────────────────────────────────────────────

export type UrgencyLevel =
  | "1_critical" | "2_emergent" | "3_urgent"
  | "4_semi_urgent" | "5_non_urgent";

export interface Visit {
  id: string;
  patientId: string;
  appointmentId?: string;
  departmentId: string;
  arrivedAt: string;
  departedAt?: string;
  visitNumber: string;
}

export interface TriageRecord {
  id: string;
  visitId: string;
  nurseId?: string;
  temperature?: string;
  bloodPressure?: string;
  pulseRate?: number;
  weight?: string;
  height?: string;
  oxygenSaturation?: string;
  urgencyLevel: UrgencyLevel;
  chiefComplaint?: string;
  createdAt: string;
}

// ── CONSULTATION ──────────────────────────────────────────────────────────────

export interface Consultation {
  id: string;
  visitId: string;
  doctorId: string;
  patientId: string;
  diagnosis?: string;
  icdCode?: string;
  clinicalNotes?: string;
  treatmentPlan?: string;
  followUpDate?: string;
  referredTo?: string;
  createdAt: string;
}

// ── BILLING ───────────────────────────────────────────────────────────────────

export type PaymentMethod = "cash" | "mpesa" | "sha" | "maki" | "aon" | "mtiba" | "pesapal";
export type PaymentStatus = "pending" | "paid" | "partial" | "waived";

export interface Invoice {
  id: string;
  patientId: string;
  visitId?: string;
  invoiceNumber: string;
  totalAmount: string;
  paidAmount: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  patientId: string;
  amount: string;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  paidAt: string;
}

// ── DOCUMENTS ─────────────────────────────────────────────────────────────────

export type DocumentType =
  | "lab_result" | "radiology_report" | "prescription"
  | "discharge_summary" | "referral_letter" | "medical_certificate"
  | "vaccination_record" | "antenatal_card" | "invoice"
  | "insurance_claim" | "admission_letter";

export interface Document {
  id: string;
  patientId: string;
  uploadedBy?: string;
  documentType: DocumentType;
  title: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  isVisible: boolean;
  createdAt: string;
}

// ── API RESPONSE WRAPPER ──────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}