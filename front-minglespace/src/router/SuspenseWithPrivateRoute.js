import React, { Suspense, useEffect } from "react";
import PrivateRoute from "./PrivateRoute";
import { useNavigate, useLocation } from "react-router-dom";

const Loading = <div>Loading....</div>;

const SuspenseWithPrivateRoute = ({ page: Page }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const currentPath = location.pathname;
    navigate(currentPath, { state: { from: currentPath } });
  }, []);

  return (
    <Suspense fallback={Loading}>
      <PrivateRoute>
        <Page />
      </PrivateRoute>
    </Suspense>
  );
};

export default SuspenseWithPrivateRoute;
