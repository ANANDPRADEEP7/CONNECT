import React, {
  createContext,
  useContext,
  useState,
  useEffect,
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
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for persisted user info on load
    const storedUser = localStorage.getItem("user");
    const storedAdmin = localStorage.getItem("admin");

    try {
      if (storedUser && storedUser !== "undefined") {
        setUser(JSON.parse(storedUser));
      }
      if (storedAdmin && storedAdmin !== "undefined") {
        setAdmin(JSON.parse(storedAdmin));
      }
    } catch (error) {
      console.error("Failed to parse stored auth data:", error);
      // Clear corrupt data
      localStorage.removeItem("user");
      localStorage.removeItem("admin");
    }
    setIsLoading(false);
  }, []);

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
      await userApi.Logout();
    } catch (error) {
      console.error("Logout failed on server:", error);
    }
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const adminLogout = async () => {
    try {
      await adminApi.Logout();
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
