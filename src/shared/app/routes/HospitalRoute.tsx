import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { JSX } from "react";
import type { RootState } from "../../../redux/store";
import CustomLoader from "../../../shared/loader/BuildInLoader";

const HospitalRoute = ({ children }: { children: JSX.Element }) => {
  const { hospital, isLoading } = useSelector((state: RootState) => state.hospital);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <CustomLoader />
      </div>
    );
  }

  if (!hospital) {
    return <Navigate to="/hospital/login" state={{ from: location }} replace />;
  }

  return children;
};

export default HospitalRoute;
