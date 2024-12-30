import { useEffect } from "react";
import Repo from "../auth/Repo";
import { useLocation, useNavigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const isAuthenticated = Repo.isAuthenticated();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      const currentPath = location.pathname;
      navigate("/auth/login", { state: { from: currentPath } });
    }
  }, [isAuthenticated, navigate, location]);

  if (isAuthenticated) {
    return children;
  } else {
    return <>Loading...</>;
  }
};

export default PrivateRoute;
