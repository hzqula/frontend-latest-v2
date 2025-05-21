import { Navigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import CoordinatorSeminarHasil from "../coordinator/SeminarHasil";
import LecturerSeminarHasil from "../lecturer/SeminarHasil";

enum UserRole {
  STUDENT = "STUDENT",
  LECTURER = "LECTURER",
  COORDINATOR = "COORDINATOR",
}

const SeminarHasil: React.FC = () => {
  const { token, userRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Bentar...</p>
      </div>
    );
  }

  if (!token || !userRole) {
    return <Navigate to="/login" replace />;
  }

  switch (userRole) {
    // case UserRole.STUDENT:
    //   return <StudentSeminarHasil />;
    case UserRole.COORDINATOR:
      return <CoordinatorSeminarHasil />;
    case UserRole.LECTURER:
      return <LecturerSeminarHasil />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default SeminarHasil;
