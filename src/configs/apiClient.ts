import axios from "axios";

export const apiClient = axios.create({
  baseURL: "http://localhost:5500/api",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");

      try {
        const { data } = await axios.post(
          "http://localhost:5500/api/auth/refresh",
          { refreshToken }
        );
        const newToken = data.token;
        localStorage.setItem("token", newToken);
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("Gagal memperbarui token:", refreshError);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userData");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Fungsi untuk mengambil data umum
export const fetchStudents = async () => {
  const response = await apiClient.get("/students");
  return response.data.students;
};

export const fetchStudentByNIM = async (nim: string) => {
  const response = await apiClient.get(`/students/${nim}`);
  return response.data.student;
};

export const fetchLecturers = async () => {
  const response = await apiClient.get("/lecturers");
  return response.data.lecturers;
};

export const fetchLecturerByNIP = async (nip: string) => {
  const response = await apiClient.get(`/lecturers/${nip}`);
  return response.data.lecturer;
};

// Fungsi untuk seminar umum
export const fetchSeminars = async () => {
  const response = await apiClient.get("/seminars");
  return response.data.seminars;
};

export const fetchSeminarById = async (id: number) => {
  const response = await apiClient.get(`/seminars/${id}`);
  return response.data.seminar;
};

// Fungsi untuk seminar proposal
export const fetchProposalSeminarByStudentNIM = async (nim: string) => {
  const response = await apiClient.get(`/seminars/proposal/${nim}`);
  return response.data.seminar;
};

export const registerProposalSeminar = async (data: {
  title: string;
  advisorNIPs: string[];
  studentNIM: string;
}) => {
  const response = await apiClient.post("/seminars/proposal-register", data);
  return response.data.seminar;
};

export const updateProposalSeminar = async (
  id: number,
  data: { title: string; advisorNIPs: string[] }
) => {
  const response = await apiClient.put(
    `/seminars/proposal-register/${id}`,
    data
  );
  return response.data.seminar;
};

export const uploadProposalSeminarDocument = async (
  seminarId: number,
  documentType: string,
  file: File
) => {
  const formData = new FormData();
  formData.append("seminarId", String(seminarId));
  formData.append("documentType", documentType);
  formData.append("file", file);

  const response = await apiClient.post(
    "/seminars/proposal-documents",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data.seminarDocument;
};

export const updateProposalSeminarDocument = async (
  seminarId: number,
  documentType: string,
  file: File
) => {
  const formData = new FormData();
  formData.append("seminarId", String(seminarId));
  formData.append("documentType", documentType);
  formData.append("file", file);

  const response = await apiClient.put(
    "/seminars/proposal-documents",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data.seminarDocument;
};

// Fungsi untuk seminar hasil
export const fetchResultSeminarByStudentNIM = async (nim: string) => {
  const response = await apiClient.get(`/seminars/result/${nim}`);
  return response.data.seminar;
};

export const registerResultSeminar = async (data: {
  title: string;
  advisorNIPs: string[];
  studentNIM: string;
}) => {
  const response = await apiClient.post("/seminars/result-register", data);
  return response.data.seminar;
};

export const updateResultSeminar = async (
  id: number,
  data: { title: string; advisorNIPs: string[] }
) => {
  const response = await apiClient.put(`/seminars/result-register/${id}`, data);
  return response.data.seminar;
};

export const uploadResultSeminarDocument = async (
  seminarId: number,
  documentType: string,
  file: File
) => {
  const formData = new FormData();
  formData.append("seminarId", String(seminarId));
  formData.append("documentType", documentType);
  formData.append("file", file);

  const response = await apiClient.post(
    "/seminars/result-documents",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data.seminarDocument;
};

export const updateResultSeminarDocument = async (
  seminarId: number,
  documentType: string,
  file: File
) => {
  const formData = new FormData();
  formData.append("seminarId", String(seminarId));
  formData.append("documentType", documentType);
  formData.append("file", file);

  const response = await apiClient.put("/seminars/result-documents", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.seminarDocument;
};

export const fetchSeminarsWithExternalAdvisors = async () => {
  const response = await apiClient.get("/seminars/external-advisors");
  return response.data;
};

export default apiClient;
