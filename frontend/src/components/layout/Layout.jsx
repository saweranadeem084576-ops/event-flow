import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Spinner from "../ui/Spinner";

export default function Layout({ requiredRole }) {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="loading-page">
        <Spinner size="lg" />
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole) {
    const allowed = user.role === "admin" || user.role === requiredRole;
    if (!allowed) return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="app">
      <Sidebar />
      <Topbar />
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
