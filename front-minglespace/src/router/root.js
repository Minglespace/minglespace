﻿import { Suspense, lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import SuspenseWithPrivateRoute from "./SuspenseWithPrivateRoute";

const Loading = <div>Loading....</div>;
const Login = lazy(() => import("../auth/LoginPage"));
const Signup = lazy(() => import("../auth/SignupPage"));
const Main = lazy(() => import("../page/MainPage"));
const Chat = lazy(() => import("../page/ChatPage"));
const Todo = lazy(() => import("../page/TodoPage"));
// const Calendar = lazy(() => import("../page/Calendar"));
// const Milestone = lazy(() => import("../page/Milestone"));
const Workspace = lazy(() => import("../page/WorkspacePage"));
const MyFriends = lazy(() => import("../page/MyFriendsPage"));
const MileStone = lazy(() => import("../page/MileStonePage"));
const Member = lazy(() => import("../page/MemberPage"));

const root = createBrowserRouter([
  // SuspenseWithPrivateRoute
  // 로그인 유무 체크 하는 페이지들
  {
    path: "",
    element: <SuspenseWithPrivateRoute page={Main} />,
  },
  {
    path: "/main",
    element: <SuspenseWithPrivateRoute page={Main} />,
  },
  {
    path: "/MyFriends",
    element: <SuspenseWithPrivateRoute page={MyFriends} />,
  },
  {
    path: "/workspace",
    element: <SuspenseWithPrivateRoute page={Workspace} />,
  },
  {
    path: "/workspace/:workspaceId",
    element: <SuspenseWithPrivateRoute page={MileStone} />,
  },
  {
    path: "/workspace/:workspaceId/milestone",
    element: <SuspenseWithPrivateRoute page={MileStone} />,
  },
  {
    path: "/workspace/:workspaceId/chat",
    element: <SuspenseWithPrivateRoute page={Chat} />,
  },
  {
    path: "/workspace/:workspaceId/todo",
    element: <SuspenseWithPrivateRoute page={Todo} />,
  },
  {
    path: "/workspace/:workspaceId/member",
    element: <SuspenseWithPrivateRoute page={Member} />,
  },

  // Suspense
  // 로그인 유무 체크하지 않는 대상 페이지들
  {
    path: "/auth/login",
    element: (
      <Suspense fallback={Loading}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "/auth/login/:code/:encodedEmail",
    element: (
      <Suspense fallback={Loading}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "/auth/signup",
    element: (
      <Suspense fallback={Loading}>
        <Signup />
      </Suspense>
    ),
  },

  //잘못된 경로
  {
    path: "*",
    element: <Navigate to="/main" />,
  },
]);
export default root;
