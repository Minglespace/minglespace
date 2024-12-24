import React, { Suspense } from "react";
import PrivateRoute from "./PrivateRoute";

const Loading = <div>Loading....</div>;

const SuspenseWithPrivateRoute = ({ page: Page }) => {
  return (
    <Suspense fallback={Loading}>
      <PrivateRoute>
        <Page />
      </PrivateRoute>
    </Suspense>
  );
};

export default SuspenseWithPrivateRoute;
