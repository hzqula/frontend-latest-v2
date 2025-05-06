import { ChevronRight } from "lucide-react";
import React from "react";
import { useLocation, Link } from "react-router";

// Impor rute untuk validasi
import { publicRoutes, privateRoutes } from "@/configs/routes";

interface BreadcrumbItem {
  label: string;
  path: string;
  isLink: boolean; // Tambahkan properti untuk menentukan apakah segmen ini adalah tautan
}

const formatLabel = (pathSegment: string): string => {
  return pathSegment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const Breadcrumb: React.FC = () => {
  const location = useLocation();

  // Gabungkan semua rute untuk validasi
  const allRoutes = [...publicRoutes, ...privateRoutes];

  // Fungsi untuk memeriksa apakah path ada di rute yang didefinisikan
  const isValidRoute = (path: string): boolean => {
    return allRoutes.some((route) => {
      // Ubah path rute menjadi regex untuk menangani parameter dinamis
      const routePath = route.path?.replace(/:[^/]+/g, "[^/]+") || "";
      const regex = new RegExp(`^${routePath}$`);
      return regex.test(path);
    });
  };

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathnames = location.pathname.split("/").filter((x) => x);
    const crumbs: BreadcrumbItem[] = [{ label: "", path: "/", isLink: true }];

    let currentPath = "";
    pathnames.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Tentukan apakah segmen ini adalah parameter dinamis (misalnya :seminarId)
      const isDynamicParam =
        segment.match(/^\d+$/) && index === pathnames.length - 1; // Contoh: "112"

      // Tentukan apakah segmen ini adalah tautan yang valid
      const isLink = !isDynamicParam && isValidRoute(currentPath);

      crumbs.push({
        label: formatLabel(segment),
        path: currentPath,
        isLink,
      });
    });

    return crumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav
      aria-label="breadcrumb"
      className="flex items-center space-x-2 text-sm"
    >
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;

        return (
          <React.Fragment key={crumb.path}>
            {isLast || !crumb.isLink ? (
              <span className="text-body-bold">{crumb.label}</span>
            ) : (
              <Link to={crumb.path} className="text-primary-600 font-semibold">
                {crumb.label}
              </Link>
            )}
            {!isLast && <ChevronRight className="text-gray-500 w-4" />}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
