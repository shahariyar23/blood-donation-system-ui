import AOS from "aos";
import "aos/dist/aos.css";
import { Suspense, useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import BuildInLoader from "../loader/BuildInLoader";
import { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { clearUser, setAuthUser, setLoading, setToken } from "../../redux/slices/userSlice";
import {
  clearHospital,
  setAuthHospital,
  setHospitalLoading,
  setHospitalToken,
} from "../../redux/slices/hospitalSlice";
import Api from "../../utilities/api";
import { getAuthUserApi } from "../../features/login/service/loginService";
export default function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    AOS.init({
      duration: 2000, // animation duration in ms
      once: true, // only animate once while scrolling
    });
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const isHospitalRoute = window.location.pathname.startsWith("/hospital");

      if (isHospitalRoute) {
        try {
          dispatch(setLoading(false));
          dispatch(setHospitalLoading(true));

          const res = await Api.post("/hospital/auth/refresh-token");
          const accessToken = res?.data?.data?.accessToken;
          if (!accessToken) throw new Error();

          dispatch(setHospitalToken(accessToken));

          const hospital = res?.data?.data?.hospital;
          if (hospital) {
            dispatch(setAuthHospital(hospital));
          }
        } catch {
          dispatch(clearHospital());
        } finally {
          dispatch(setHospitalLoading(false));
        }

        return;
      }

      try {
        dispatch(setHospitalLoading(false));
        dispatch(setLoading(true));

        const res = await Api.post("/auth/refresh-token");
        if (!res?.data?.data?.accessToken) throw new Error();

        dispatch(setToken(res.data.data.accessToken));

        const user = await getAuthUserApi();
        dispatch(setAuthUser(user));
      } catch {
        dispatch(clearUser());
      } finally {
        dispatch(setLoading(false));
      }
    };

    initAuth();
  }, [dispatch]);

  return (
    <Suspense fallback={<BuildInLoader/>}>
      <Toaster position="top-right" />
      <RouterProvider router={router} />
    </Suspense>
  );
}
