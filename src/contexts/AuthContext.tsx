import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router";
import axios from "axios";

interface User {
  id: number;
  email: string;
  profile: {
    id: number;
    nim?: string;
    nip?: string;
    name: string;
    phoneNumber: string;
    profilePicture?: string;
    semester?: number;
  };
}

enum UserRole {
  STUDENT = "STUDENT",
  LECTURER = "LECTURER",
  COORDINATOR = "COORDINATOR",
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  userRole: UserRole | null;
  login: (token: string, user: User) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      try {
        const storedUser = localStorage.getItem("userData");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        verifyRole(storedToken);
      } catch (error) {
        console.error("Terjadi kesalahan saat nge-parsing data", error);
        logout();
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyRole = async (token: string) => {
    setIsLoading(true); // Pastikan isLoading true saat memulai verifikasi
    try {
      console.log("Verifying role with token:", token); // Debugging
      const response = await axios.get(
        "http://localhost:5500/api/auth/verify-role",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUserRole(response.data.role as UserRole);
    } catch (error) {
      console.error("Terjadi kesalahan saat memverifikasi role", error);
      logout();
    } finally {
      setIsLoading(false); // Set isLoading ke false setelah verifikasi selesai
    }
  };

  const login = async (newToken: string, newUser: User): Promise<void> => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("userData", JSON.stringify(newUser));
    await verifyRole(newToken); // Tunggu verifikasi selesai
    console.log("Login and role verification completed"); // Debugging
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setUserRole(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    localStorage.removeItem("expTime");
    setIsLoading(false);
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, userRole, login, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }
  return context;
};
