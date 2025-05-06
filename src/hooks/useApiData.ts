import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import {
  fetchLecturers,
  fetchSeminarById,
  fetchSeminars,
  fetchStudentByNIM,
  fetchLecturerByNIP,
  fetchStudents,
  fetchProposalSeminarByStudentNIM,
  fetchResultSeminarByStudentNIM,
} from "../configs/apiClient";

type DataType =
  | "students"
  | "studentByNIM"
  | "lecturers"
  | "lecturerByNIP"
  | "seminars"
  | "seminarById"
  | "seminarByStudentNIM";

interface UseApiDataOptions {
  type: DataType;
  param?: string;
  id?: number;
  seminarType?: "proposal" | "result";
}

export const useApiData = ({
  type,
  param,
  id,
  seminarType,
}: UseApiDataOptions) => {
  const { user, token } = useAuth();

  const queryFn = async () => {
    switch (type) {
      case "students":
        return fetchStudents();
      case "studentByNIM":
        if (!param) throw new Error("NIM harus ada");
        return fetchStudentByNIM(param);
      case "lecturers":
        return fetchLecturers();
      case "lecturerByNIP":
        if (!param) throw new Error("NIP harus ada");
        return fetchLecturerByNIP(param);
      case "seminars":
        return fetchSeminars();
      case "seminarById":
        if (!id) throw new Error("ID seminar harus ada");
        return fetchSeminarById(id);
      case "seminarByStudentNIM":
        if (!param) throw new Error("NIM mahasiswa harus ada");
        if (seminarType === "result") {
          return fetchResultSeminarByStudentNIM(param);
        } else {
          return fetchProposalSeminarByStudentNIM(param);
        }
      default:
        throw new Error("Tipe data tidak diketahui");
    }
  };

  return useQuery({
    queryKey: [type, param, seminarType],
    queryFn,
    enabled: !!token && !!user,
    staleTime: 5 * 60 * 1000,
  });
};
