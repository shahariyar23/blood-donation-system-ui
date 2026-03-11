import AOS from "aos";
import "aos/dist/aos.css";
import { Suspense, useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import BuildInLoader from "../loader/BuildInLoader";
// import WhatsAppWidget from "../button/WhatsAppWidget";
// import ScrollHome from "../button/ScrollHome";
export default function App() {
  useEffect(() => {
    AOS.init({
      duration: 2000, // animation duration in ms
      once: true, // only animate once while scrolling
    });
  }, []);

  return (
    <Suspense fallback={<BuildInLoader/>}>
      <RouterProvider router={router} />
      {/* <WhatsAppWidget />
      <ScrollHome /> */}
    </Suspense>
  );
}
