/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { userApi } from "../Endpoints/Api/user/userApi";
import { adminApi } from "../Endpoints/Api/Admin/adminApi";
import { UserRole } from "../enums/UserRole.enum";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  admin: User | null;
  login: (userData: User) => void;
  adminLogin: (adminData: User) => void;
  logout: () => Promise<void>;
  adminLogout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        console.error("Failed to parse stored user data:", error);
        localStorage.removeItem("user");
      }
    }
    return null;
  });

  const [admin, setAdmin] = useState<User | null>(() => {
    const storedAdmin = localStorage.getItem("admin");
    if (storedAdmin && storedAdmin !== "undefined") {
      try {
        return JSON.parse(storedAdmin);
      } catch (error) {
        console.error("Failed to parse stored admin data:", error);
        localStorage.removeItem("admin");
      }
    }
    return null;
  });

  const [isLoading] = useState(false);

  const login = (userData: User) => {
    if (!userData) return;
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const adminLogin = (adminData: User) => {
    if (!adminData) return;
    setAdmin(adminData);
    localStorage.setItem("admin", JSON.stringify(adminData));
  };

  const logout = async () => {
    try {
      await userApi.logout();
    } catch (error) {
      console.error("Logout failed on server:", error);
    }
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const adminLogout = async () => {
    try {
      await adminApi.logout();
    } catch (error) {
      console.error("Admin logout failed on server:", error);
    }
    setAdmin(null);
    localStorage.removeItem("admin");
    localStorage.removeItem("adminToken");
  };

  return (
    <AuthContext.Provider
      value={{ user, admin, login, adminLogin, logout, adminLogout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
