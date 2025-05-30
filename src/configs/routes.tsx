import { RouteObject } from "react-router";
// import Dashboard from "../pages/redirect/Dashboard";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import SeminarProposal from "@/pages/redirect/SeminarProposal";
import Dashboard from "@/pages/redirect/Dashboard";
import SeminarHasil from "@/pages/redirect/SeminarHasil";
import Landing from "@/pages/landing/Landing";
import SecurityLog from "@/pages/coordinator/SecurityLog";
import ResetPassword from "@/pages/auth/ResetPassword";
import Announcement from "@/pages/coordinator/Announcement";
import UpdateProfile from "@/pages/student/UpdateProfile";
import AssessSeminar from "@/components/AssessSeminar";
import AssessSeminarDetail from "@/pages/coordinator/AssessSeminarDetail";

export const publicRoutes: RouteObject[] = [
  { path: "/", element: <Landing /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/reset-password", element: <ResetPassword /> },
];

export const privateRoutes: RouteObject[] = [
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/seminar-proposal",
    element: <SeminarProposal />,
  },
  {
    path: "/seminar-hasil",
    element: <SeminarHasil />,
  },
  {
    path: "/log-keamanan",
    element: <SecurityLog />,
  },
  {
    path: "/seminar-proposal/penilaian/:seminarId",
    element: <AssessSeminar />,
  },
  {
    path: "/seminar-hasil/penilaian/:seminarId",
    element: <AssessSeminar />,
  },
  {
    path: "/pengumuman",
    element: <Announcement />,
  },
  {
    path: "/edit-profil",
    element: <UpdateProfile />,
  },

  {
    path: "/seminar-proposal/detail/:seminarId",
    element: <AssessSeminarDetail />,
  },
  {
    path: "/seminar-hasil/detail/:seminarId",
    element: <AssessSeminarDetail />,
  },
];
