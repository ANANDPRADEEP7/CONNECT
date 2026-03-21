import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const UserProtectedRoute: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  return user ? <Outlet /> : <Navigate to="/user/login" />;
};

export const AdminProtectedRoute: React.FC = () => {
  const { admin, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  return admin ? <Outlet /> : <Navigate to="/Admin/login" />;
};

export const PublicRoute: React.FC = () => {
  const { user } = useAuth();

  // If already logged in as a regular user, redirect to home
  if (user) return <Navigate to="/home" />;

  // Admin sessions do NOT block public pages —
  // visiting "/" always shows the Signup page.
  return <Outlet />;
};
