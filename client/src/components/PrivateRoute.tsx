import { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

interface PrivateRouteProps {
  element: ReactElement;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element }) => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) return element;
  return <Navigate to="/login" />;
};

export default PrivateRoute;
