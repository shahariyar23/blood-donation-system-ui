import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../../layout/MainLayout";
import Home from "../../../features/home/container/Home";
import NotFound from "../../../features/not-found/NotFound";
import FindDonorPage from "../../../features/findDoner/container/Finddonorpage";
import LoginPage from "../../../features/login/ui/LoginPage";
import DonateBlood from "../../../features/donateBlood/ui/DonateBlood";
import RequestBloodPage from "../../../features/requestBlood/ui/RequestBloodPage";
import BloodBankPage from "../../../features/bloodBank/ui/BloodBankPage";
import AboutPage from "../../../features/about/ui/About";
import GuestRoute from "./GuestRoute";
import ProtectedRoute from "./ProtectedRoute";

export const router = createBrowserRouter([
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
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);
