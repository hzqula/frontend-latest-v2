import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import LecturerSeminarHasil from "../lecturer/SeminarHasil";
// import StudentSeminarHasil from "../student/seminar-proposal/SeminarHasil";
// import CoordinatorSeminarHasil from "../coordinator/seminar-proposal/SeminarHasil";

enum UserRole {
  STUDENT = "STUDENT",
  LECTURER = "LECTURER",
  COORDINATOR = "COORDINATOR",
}

const SeminarHasil: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");

    if (storedUserData) {
      try {
        setUserData(JSON.parse(storedUserData));
      } catch (error) {
        console.error("Terjadi kesalahan saat nge-parsing data", error);
      }
    }
    setIsLoading(false);
  }, []);

  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Bentar...</p>
      </div>
    );
  }

  switch (userData.role) {
    // case UserRole.STUDENT:
    // return <StudentSeminarHasil />;
    // case UserRole.COORDINATOR:
    //   return <CoordinatorSeminarHasil />;
    case UserRole.LECTURER:
      return <LecturerSeminarHasil />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default SeminarHasil;
