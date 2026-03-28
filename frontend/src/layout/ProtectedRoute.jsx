import { Navigate, useLocation } from "react-router-dom";

import useAuth from "../hooks/useAuth";
import Loading from "./Loading";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const location = useLocation();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
