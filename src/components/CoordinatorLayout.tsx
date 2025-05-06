"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  HomeIcon,
  PanelLeft,
  LogOutIcon,
  BookOpenText,
  BookText,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router";
import Breadcrumb from "../Breadcrumb";
import logo from "../../assets/img/logo-tl.png";
import { Button } from "../ui/button";

interface NavItemProps {
  icon: React.ElementType;
  path: string;
  label: string;
  isExpanded: boolean;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({
  icon: Icon,
  path,
  label,
  isExpanded,
  isActive,
}) => {
  const navigate = useNavigate();

  return (
    <li>
      <button
        onClick={() => navigate(path)}
        className={`w-full relative flex items-center rounded-md overflow-hidden transition-all duration-200 px-3 py-2 mb-1
          ${
            isActive
              ? "bg-primary-50 text-primary font-medium"
              : "hover:bg-gray-100"
          }
        `}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />

        {isExpanded && (
          <>
            <span className="ml-3 transition-opacity text-xs duration-200">
              {label}
            </span>

            {isActive && (
              <div className="right-0 absolute w-1 h-full bg-primary"></div>
            )}
          </>
        )}

        {!isExpanded && <span className="sr-only">{label}</span>}
        {isActive && (
          <div className="right-0 absolute w-1 h-full bg-primary"></div>
        )}
      </button>
    </li>
  );
};

interface CoordinatorLayoutProps {
  children: React.ReactNode;
}

const CoordinatorLayout: React.FC<CoordinatorLayoutProps> = ({ children }) => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile and handle resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarExpanded(false);
      }
    };

    // Initial check
    checkIfMobile();

    // Add event listener
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const toggleSidebar = () => setIsSidebarExpanded(!isSidebarExpanded);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user || !token) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  const navItems = [
    {
      icon: HomeIcon,
      path: "/dashboard",
      label: "Dashboard",
    },
    {
      icon: BookOpenText,
      path: "/seminar-proposal",
      label: "Seminar Proposal",
    },
    {
      icon: BookText,
      path: "/seminar-hasil",
      label: "Seminar Hasil",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-body">
      {/* Overlay for mobile when sidebar is open */}
      {isMobile && isSidebarExpanded && (
        <div
          className="fixed inset-0 bg-black/20 z-10 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static z-20 bg-white text-body-regular transition-all duration-300 
          ease-in-out border-r border-primary-800 h-screen flex flex-col
          ${isSidebarExpanded ? "w-64" : "w-16"}
          ${
            isMobile && !isSidebarExpanded
              ? "-translate-x-full"
              : "translate-x-0"
          }
        `}
      >
        {/* Logo Section */}
        <div
          className={`
          flex items-center h-16 border-b border-primary-800
          ${isSidebarExpanded ? "px-4" : "justify-center px-2"}
        `}
        >
          <img
            src={logo || "/placeholder.svg"}
            alt="logo"
            className="size-6 object-cover flex-shrink-0"
          />

          {isSidebarExpanded && (
            <div className="flex flex-col ml-2 overflow-hidden">
              <span className="text-sm font-display font-semibold whitespace-nowrap">
                LATEST
              </span>
              <span className="text-xs whitespace-nowrap">
                Teknik Lingkungan
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul
            className={`
            flex flex-col
            ${isSidebarExpanded ? "px-3" : "px-2"}
          `}
          >
            {navItems.map((item) => (
              <NavItem
                key={item.path}
                icon={item.icon}
                path={item.path}
                label={item.label}
                isExpanded={isSidebarExpanded}
                isActive={location.pathname === item.path}
              />
            ))}
          </ul>
        </nav>

        <div className="border-t border-primary-800 p-3">
          {isSidebarExpanded ? (
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="w-full"
            >
              Keluar
              <LogOutIcon className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex justify-center items-center p-2 rounded-md text-red-600 hover:bg-red-50 transition-colors"
              title="Logout"
            >
              <LogOutIcon className="h-4 w-4" />
              <span className="sr-only">Logout</span>
            </button>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col w-full">
        {/* Header */}
        <header className="bg-white shadow-xs border-b border-primary-800 sticky top-0 z-10 flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
              aria-label={
                isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"
              }
            >
              <PanelLeft className="w-4 h-4 text-body-regular" />
            </button>
            <div className="h-4 w-px bg-gray-300 mx-1"></div>
            <Breadcrumb />
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-body-bold text-sm font-semibold truncate max-w-[150px]">
                {user?.profile?.name}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            <img
              src={
                user.profile.profilePicture
                  ? user.profile.profilePicture
                  : `https://robohash.org/${user.profile.name}`
              }
              alt="profile"
              className="rounded-full size-12 object-cover border border-primary-800"
            />
          </div>
        </header>

        <main className="flex-1 p-4 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default CoordinatorLayout;
