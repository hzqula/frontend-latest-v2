import { RouteObject } from "react-router";
// import Landing from "../pages/landing/Landing";
// import Galeri from "../pages/landing/Galeri";
// import FormatPenulisanTA from "../pages/landing/FormatPenulisanTa";
// import SOP from "../pages/landing/SOP";
// import KalenderAkademik from "../pages/landing/KalenderAkademik";

// import Dashboard from "../pages/redirect/Dashboard";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import SeminarProposal from "@/pages/redirect/SeminarProposal";
import Dashboard from "@/pages/redirect/Dashboard";
import SeminarHasil from "@/pages/redirect/SeminarHasil";
import AssessSeminarProposal from "@/components/AssessSeminar";
import Landing from "@/pages/landing/Landing";
import SecurityLog from "@/pages/coordinator/SecurityLog";
import ResetPassword from "@/pages/auth/ResetPassword";
import Announcement from "@/pages/coordinator/Announcement";
import UpdateProfile from "@/pages/student/UpdateProfile";
// import SeminarProposal from "../pages/redirect/SeminarProposal";
// import AssessSeminarProposal from "../pages/lecturer/seminar-proposal/AssessSeminar";

export const publicRoutes: RouteObject[] = [
  { path: "/", element: <Landing /> },
  // { path: "/galeri", element: <Galeri /> },
  // { path: "/panduan/format-penulisan-ta", element: <FormatPenulisanTA /> },pu
  // { path: "/panduan/sop", element: <SOP /> },
  // { path: "/kalender-akademik", element: <KalenderAkademik /> },
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
    path: "/seminar-proposal/assess/:seminarId",
    element: <AssessSeminarProposal />,
  },
  {
    path: "/pengumuman",
    element: <Announcement />,
  },
  {
    path: "/edit-profil",
    element: <UpdateProfile />,
  },
];
