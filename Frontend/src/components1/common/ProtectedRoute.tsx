import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";

export const UserProtectedRoute: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const isLoading = useAppSelector((state) => state.auth.isLoading);

  if (isLoading) return <div>Loading...</div>;

  return user ? <Outlet /> : <Navigate to="/user/login" />;
};

export const AdminProtectedRoute: React.FC = () => {
  const admin = useAppSelector((state) => state.auth.admin);
  const isLoading = useAppSelector((state) => state.auth.isLoading);

  if (isLoading) return <div>Loading...</div>;

  return admin ? <Outlet /> : <Navigate to="/Admin/login" />;
};

export const PublicRoute: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);

  // If already logged in as a regular user, redirect to home
  if (user) return <Navigate to="/home" />;

  // Admin sessions do NOT block public pages —
  // visiting "/" always shows the Signup page.
  return <Outlet />;
};
