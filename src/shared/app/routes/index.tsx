import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../../layout/MainLayout";
import Home from "../../../features/home/container/Home";
import NotFound from "../../../features/not-found/NotFound";
import FindDonorPage from "../../../features/findDoner/container/Finddonorpage";
import LoginPage from "../../../features/login/ui/LoginPage";
import DonateBlood from "../../../features/donateBlood/ui/DonateBlood";

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
        element: <FindDonorPage />,
      },
      {
        path: "/donate",
        element: <DonateBlood />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);
