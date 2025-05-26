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
  updateUser: (updatedUser: Partial<User>) => void; // Tambahkan fungsi ini
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
    setIsLoading(true);
    try {
      console.log("Verifying role with token:", token);
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
      setIsLoading(false);
    }
  };

  const login = async (newToken: string, newUser: User): Promise<void> => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("userData", JSON.stringify(newUser));
    await verifyRole(newToken);
    console.log("Login and role verification completed");
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

  const updateUser = (updatedUser: Partial<User>) => {
    setUser((prevUser) => {
      const newUser = prevUser ? { ...prevUser, ...updatedUser } : null;
      if (newUser) {
        localStorage.setItem("userData", JSON.stringify(newUser)); // Sinkronisasi dengan localStorage
      }
      return newUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, token, userRole, login, logout, isLoading, updateUser }}
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
