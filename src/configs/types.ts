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
  type: "HASIL" | "PROPOSAL";
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
  phoneNumber?: string;
  profilePicture?: string;
}

export interface LecturerSeminarData {
  name: string;
  nip: string;
  advised: number;
  assessed: number;
  phoneNumber: number | null;
  profilePicture?: string;
}

export interface User {
  email: string;
}

export interface AnnouncementProps {
  id: number;
  title: string;
  content: string;
  visibility: string[];
  image?: string;
  createdAt: string;
  coordinator?: {
    name: string;
    profilePicture?: string;
  };
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

export interface TooltipPayloadData<T = any> {
  [key: string]: T;
}

export interface TooltipPayload<T = any> {
  payload: TooltipPayloadData<T>;
  name: string;
  value: T;
  color?: string;
  unit?: string;
  dataKey?: string;
  [key: string]: any;
}

export interface CustomTooltipProps<T = any> {
  active?: boolean;
  payload?: TooltipPayload<T>[];
  label?: string;
}
