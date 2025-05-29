// NavItem.tsx
import type React from "react";
import { Link } from "react-router";

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
  return (
    <li>
      <Link
        to={path}
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
      </Link>
    </li>
  );
};

export default NavItem;
