// import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../../layout/MainLayout";
import Home from "../../../features/home/container/Home";
import NotFound from "../../../features/not-found/NotFound";
// import Rooms from "../../../features/rooms/ui";
import Contact from "../../../features/contact/ui";
import About from "../../../features/about/ui";
import FindDonorPage from "../../../features/findDoner/ui/FindDoner";
// import RoomDetail from "../../../features/roomDetails/ui";

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/find-donor",
        element: <FindDonorPage />,
      },
      {
        path: "/contact",
        element: <Contact />,
      },
      {
        path: "/blogs",
        element: <Home />,
      },
      {
        path: "/notice",
        element: <Home />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);
