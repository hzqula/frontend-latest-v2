import { Navigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import StudentSeminarProposal from "../student/SeminarProposal";
import CoordinatorSeminarProposal from "../coordinator/SeminarProposal";
import LecturerSeminarProposal from "../lecturer/SeminarProposal";
import AssessSeminarProposal from "../../components/AssessSeminar";

enum UserRole {
  STUDENT = "STUDENT",
  LECTURER = "LECTURER",
  COORDINATOR = "COORDINATOR",
}

const SeminarProposal: React.FC = () => {
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
    case UserRole.STUDENT:
      return <StudentSeminarProposal />;
    case UserRole.COORDINATOR:
      return <CoordinatorSeminarProposal />;
    case UserRole.LECTURER:
      return <LecturerSeminarProposal />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default SeminarProposal;
