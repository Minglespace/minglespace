import { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

const Loading = <div>Loading....</div>;
const Main = lazy(() => import("../page/MainPage"));
const Chat = lazy(() => import("../page/ChatPage"));
// const Calendar = lazy(() => import("../page/Calendar"));
// const Milestone = lazy(() => import("../page/Milestone"));
const Workspace = lazy(() => import("../page/WorkspacePage"));
const MileStone = lazy(() => import("../page/MileStonePage"));

const root = createBrowserRouter([
  {
    path: "",
    element: (
      <Suspense fallback={Loading}>
        <Main />
      </Suspense>
    ),
  },
  {
    path: "/workspace",
    element: (
      <Suspense fallback={Loading}>
        <Workspace />
      </Suspense>
    ),
  },
  {
    path: "/workspace/:workspaceId",
    element: (
      <Suspense fallback={Loading}>
        <MileStone />
      </Suspense>
    ),
  },
  {
    path: "/workspace/chat",
    element: (
      <Suspense fallback={Loading}>
        <Chat />
      </Suspense>
    ),
  },
]);
export default root;
