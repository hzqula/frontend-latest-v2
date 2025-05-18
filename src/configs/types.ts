export interface Seminar {
  id: number;
  title: string;
  student?: Student;
  status: "DRAFT" | "SUBMITTED" | "SCHEDULED" | "COMPLETED" | null;
  type: "HASIL" | "PROPOSAL";
  advisors: {
    lecturer?: Lecturer;
  }[];
  folderId: string | null;
  documents: {
    documentType: string;
    fileName: string;
    fileURL: string;
  }[];
  time: string;
  room: string;
  assessors: {
    lecturer?: Lecturer;
  }[];
  assessments?: {
    lecturerNIP: string;
    writingScore: number | null;
    presentationScore: number;
    masteryScore: number;
    characteristicScore: number | null;
    finalScore: number;
    feedback: string | null;
    createdAt: string;
    lecturer?: Lecturer;
  }[];
  studentNIM?: string;
  createdAt: string;
}

export interface RegisterSeminar {
  id: number | null;
  title: string;
  student?: {
    nim: string;
    name: string;
  } | null;
  status: "DRAFT" | "SUBMITTED" | "SCHEDULED" | "COMPLETED" | null;
  advisors: {
    lecturerNIP: string;
    lecturerName?: string;
    profilePicture?: string;
  }[];
  documents: Record<
    string,
    { uploaded: boolean; fileName?: string; fileURL?: string }
  >;
  time: string | null;
  room: string | null;
  assessors: {
    lecturerNIP: string;
    lecturerName?: string;
    profilePicture?: string;
  }[];
}

export interface Student {
  nim: string;
  name: string;
  semester?: number;
  profilePicture?: string;
}

export interface Lecturer {
  nip: string;
  name: string;
  profilePicture?: string;
}

export interface User {
  email: string;
}

export interface SecurityLogs {
  id: number;
  userId: number;
  user: User;
  action: string;
  ipAddress: string;
  device: string;
  createdAt: string;
}
// Tipe generik untuk data dalam payload tooltip
export interface TooltipPayloadData<T = any> {
  [key: string]: T;
}

// Tipe untuk payload dalam CustomTooltip (berdasarkan Recharts TooltipPayload)
export interface TooltipPayload<T = any> {
  payload: TooltipPayloadData<T>;
  name: string;
  value: T;
  color?: string; // Properti opsional untuk warna dari Recharts
  unit?: string; // Opsional, untuk satuan (jika ada)
  dataKey?: string; // Opsional, untuk kunci data
  [key: string]: any; // Fleksibel untuk properti tambahan dari Recharts
}

// Tipe untuk props CustomTooltip dengan pendekatan generik
export interface CustomTooltipProps<T = any> {
  active?: boolean;
  payload?: TooltipPayload<T>[];
  label?: string;
}
