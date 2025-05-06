import { useEffect, useState } from "react";
import { Navigate } from "react-router";

import StudentDashboard from "../student/Dashboard";
// import CoordinatorDashboard from "../coordinator/Dashboard";
// import LecturerDashboard from "../lecturer/Dashboard";

enum UserRole {
  STUDENT = "STUDENT",
  LECTURER = "LECTURER",
  COORDINATOR = "COORDINATOR",
}

const Dashboard: React.FC = () => {
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
    return <Navigate to="/sign-in" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Bentar...</p>
      </div>
    );
  }

  switch (userData.role) {
    case UserRole.STUDENT:
      return <StudentDashboard />;

    // case UserRole.LECTURER:
    //   return <LecturerDashboard />;

    // case UserRole.COORDINATOR:
    //   return <CoordinatorDashboard />;

    default:
      return <Navigate to="/login" replace />;
  }
};

export default Dashboard;
