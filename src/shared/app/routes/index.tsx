import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../../layout/MainLayout";
import HospitalLayout from "../../layout/HospitalLayout";
import Home from "../../../features/home/container/Home";
import NotFound from "../../../features/not-found/NotFound";
import FindDonorPage from "../../../features/findDoner/container/Finddonorpage";
import LoginPage from "../../../features/login/ui/LoginPage";
import HospitalLoginPage from "../../../features/hospital/ui/HospitalLoginPage";
import HospitalDashboard from "../../../features/hospital/ui/HospitalDashboard";
import HospitalDonorSelection from "../../../features/hospital/ui/HospitalDonorSelection";
import DonateBlood from "../../../features/donateBlood/ui/DonateBlood";
import RequestBloodPage from "../../../features/requestBlood/ui/RequestBloodPage";
import BloodBankPage from "../../../features/bloodBank/ui/BloodBankPage";
import AboutPage from "../../../features/about/ui/About";
import GuestRoute from "./GuestRoute";
import ProtectedRoute from "./ProtectedRoute";
import HospitalRoute from "./HospitalRoute";
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
