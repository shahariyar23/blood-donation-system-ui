import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import type { JSX } from "react";

const GuestRoute = ({ children }: { children: JSX.Element }) => {
  const {
    user,
    isLoading: userLoading,
  } = useSelector((state: RootState) => state.user);
  const {
    hospital,
    isLoading: hospitalLoading,
  } = useSelector((state: RootState) => state.hospital);
  const location = useLocation();
  const isHospitalGuestRoute = location.pathname.startsWith("/hospital");

  if (isHospitalGuestRoute ? hospitalLoading : userLoading) return null;

  if (user || hospital) {
    // Redirect authenticated users to role-appropriate destination.
    const roleDefaultPath = hospital ? "/hospital" : "/";
    const from = location.state?.from?.pathname || roleDefaultPath;
    return <Navigate to={from} replace />;
  }

  return children;
};

export default GuestRoute;