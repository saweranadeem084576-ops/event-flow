import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/public/Home";
import Events from "./pages/public/Events";
import EventDetail from "./pages/public/EventDetail";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import TwoFactorVerify from "./pages/auth/TwoFactorVerify";
import Dashboard from "./pages/shared/Dashboard";
import MyBookings from "./pages/shared/MyBookings";
import MyTickets from "./pages/shared/MyTickets";
import Notifications from "./pages/shared/Notifications";
import Profile from "./pages/shared/Profile";
import Settings from "./pages/shared/Settings";
import MyEvents from "./pages/organizer/MyEvents";
import CreateEvent from "./pages/organizer/CreateEvent";
import EditEvent from "./pages/organizer/EditEvent";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminBookings from "./pages/admin/AdminBookings";
import BookingSuccess from "./pages/shared/BookingSuccess";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/events" element={<Events />} />
      <Route path="/events/:id" element={<EventDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      {/* Both paths work — /verify-otp is the new canonical path */}
      <Route path="/verify-otp" element={<TwoFactorVerify />} />
      <Route path="/verify-2fa" element={<TwoFactorVerify />} />
      <Route path="/booking-success" element={<BookingSuccess />} />

      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/bookings" element={<MyBookings />} />
        <Route path="/tickets" element={<MyTickets />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Organizer-only routes */}
      <Route element={<Layout requiredRole="organizer" />}>
        <Route path="/my-events" element={<MyEvents />} />
        <Route path="/events/create" element={<CreateEvent />} />
        <Route path="/events/edit/:id" element={<EditEvent />} />
      </Route>

      {/* Admin-only routes */}
      <Route element={<Layout requiredRole="admin" />}>
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/events" element={<AdminEvents />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
