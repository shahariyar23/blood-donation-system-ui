import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../../layout/MainLayout";
import HospitalLayout from "../../layout/HospitalLayout";
import AdminLayout from "../../../features/admin/layout/AdminLayout";
import Home from "../../../features/home/container/Home";
import NotFound from "../../../features/not-found/NotFound";
import FindDonorPage from "../../../features/findDoner/container/Finddonorpage";
import LoginPage from "../../../features/login/ui/LoginPage";
import HospitalLoginPage from "../../../features/hospital/ui/HospitalLoginPage";
import HospitalDashboard from "../../../features/hospital/ui/HospitalDashboard";
import HospitalDonorSelection from "../../../features/hospital/ui/HospitalDonorSelection";
import AdminDashboard from "../../../features/admin/ui/AdminDashboard";
import AdminLoginPage from "../../../features/admin/ui/AdminLoginPage";
import AdminUsersPage from "../../../features/admin/ui/AdminUsersPage";
import AdminReportsPage from "../../../features/admin/ui/AdminReportsPage";
import AdminBloodRequestsPage from "../../../features/admin/ui/AdminBloodRequestsPage";
import AdminDonationsPage from "../../../features/admin/ui/AdminDonationsPage";
import AdminVerificationsPage from "../../../features/admin/ui/AdminVerificationsPage";
import AdminSettingsPage from "../../../features/admin/ui/AdminSettingsPage";
import DonateBlood from "../../../features/donateBlood/ui/DonateBlood";
import RequestBloodPage from "../../../features/requestBlood/ui/RequestBloodPage";
import BloodBankPage from "../../../features/bloodBank/ui/BloodBankPage";
import AboutPage from "../../../features/about/ui/About";
import GuestRoute from "./GuestRoute";
import ProtectedRoute from "./ProtectedRoute";
import HospitalRoute from "./HospitalRoute";
import AdminRoute from "./AdminRoute";
import RegisterPage from "../../../features/register/ui/RegisterPage";
import ForgotPasswordPage from "../../../features/forgotPassword/ui/ForgotPassword";
import ResetPasswordPage from "../../../features/restPassword/ui/ResetPasswordPage";
import ProfilePage from "../../../features/profile/component/ProfilePage";
import MyDonationsPage from "../../../features/myDonation/ui/MyDonation";
import SettingsPage from "../../../features/mySetting/ui/MySettingPage";
import VerifyOtpPage from "../../../features/register/ui/VerifyOtpPage";

export const router = createBrowserRouter([
  {
    path: "/hospital/login",
    element: (
      <GuestRoute>
        <HospitalLoginPage />
      </GuestRoute>
    ),
  },
  {
    path: "/admin/login",
    element: (
      <GuestRoute>
        <AdminLoginPage />
      </GuestRoute>
    ),
  },
  {
    path: "/hospital",
    element: <HospitalLayout />,
    children: [
      {
        index: true,
        element: (
          <HospitalRoute>
            <HospitalDashboard />
          </HospitalRoute>
        ),
      },
      {
        path: "donors",
        element: (
          <HospitalRoute>
            <HospitalDonorSelection />
          </HospitalRoute>
        ),
      },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: (
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        ),
      },
      {
        path: "users",
        element: (
          <AdminRoute>
            <AdminUsersPage />
          </AdminRoute>
        ),
      },
      {
        path: "reports",
        element: (
          <AdminRoute>
            <AdminReportsPage />
          </AdminRoute>
        ),
      },
      {
        path: "blood-requests",
        element: (
          <AdminRoute>
            <AdminBloodRequestsPage />
          </AdminRoute>
        ),
      },
      {
        path: "donations",
        element: (
          <AdminRoute>
            <AdminDonationsPage />
          </AdminRoute>
        ),
      },
      {
        path: "verifications",
        element: (
          <AdminRoute>
            <AdminVerificationsPage />
          </AdminRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <AdminRoute>
            <AdminSettingsPage />
          </AdminRoute>
        ),
      },
    ],
  },
  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/find-donor",
        element: (
          <ProtectedRoute>
            <FindDonorPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/donate",
        element: (
          <ProtectedRoute>
            <DonateBlood />
          </ProtectedRoute>
        ),
      },
      {
        path: "/request",
        element: (
          <ProtectedRoute>
            <RequestBloodPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/blood-banks",
        element: (
          <ProtectedRoute>
            <BloodBankPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/profile",
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/my-donations",
        element: (
          <ProtectedRoute>
            <MyDonationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/settings",
        element: (
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/about",
        element: <AboutPage />,
      },
      {
        path: "/login",
        element: (
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        ),
      },
      {
        path: "/forgot-password",
        element: (
          <GuestRoute>
            <ForgotPasswordPage />
          </GuestRoute>
        ),
      },
      {
        path: "/reset-password",
        element: (
          <GuestRoute>
            <ResetPasswordPage />
          </GuestRoute>
        ),
      },
      {
        path: "/register",
        element: (
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        ),
      },
      {
        path: "/verify-otp",
        element: (
          <GuestRoute>
            <VerifyOtpPage />
          </GuestRoute>
        ),
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);
