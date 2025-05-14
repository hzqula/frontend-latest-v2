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
import AssessSeminarProposal from "@/pages/lecturer/seminar-proposal/AssessSeminar";
import Landing from "@/pages/landing/Landing";
// import SeminarProposal from "../pages/redirect/SeminarProposal";
// import AssessSeminarProposal from "../pages/lecturer/seminar-proposal/AssessSeminar";

export const publicRoutes: RouteObject[] = [
  { path: "/", element: <Landing /> },
  // { path: "/galeri", element: <Galeri /> },
  // { path: "/panduan/format-penulisan-ta", element: <FormatPenulisanTA /> },
  // { path: "/panduan/sop", element: <SOP /> },
  // { path: "/kalender-akademik", element: <KalenderAkademik /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
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
    path: "/seminar-proposal/assess/:seminarId",
    element: <AssessSeminarProposal />,
  },
];
