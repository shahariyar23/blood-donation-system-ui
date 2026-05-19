import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Footer from "./footer/Footer";
import Header from "./header/Header";
import ScrollToTop from "../components/ScrollToTop";
import BuildInLoader from "../loader/BuildInLoader";

export default function MainLayout() {
  return (
    <div>
      <ScrollToTop />
      <Header />

      <main className="flex-1">
        <Suspense fallback={<BuildInLoader />}>
          <Outlet />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

