import { Navigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import StudentDashboard from "../student/Dashboard";
import CoordinatorDashboard from "../coordinator/Dashboard";
import LecturerDashboard from "../lecturer/Dashboard";

enum UserRole {
  STUDENT = "STUDENT",
  LECTURER = "LECTURER",
  COORDINATOR = "COORDINATOR",
}

const Dashboard: React.FC = () => {
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
      return <StudentDashboard />;
    case UserRole.LECTURER:
      return <LecturerDashboard />;
    case UserRole.COORDINATOR:
      return <CoordinatorDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default Dashboard;
