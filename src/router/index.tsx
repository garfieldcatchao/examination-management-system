import { createBrowserRouter, Navigate } from "react-router";
import Login from "../components/Login";
import NoFound from "../components/NoFound";
import Main from "../components/Main";
import Workbench from "../components/teacher/workbench";
import TestBaseManagement from "../components/teacher/testBaseManagement";
import ExaminationPaperManagement from "../components/teacher/examinationPaperManagement";
import ExaminationManagement from "../components/teacher/examinationManagement";
import ScoreManagement from "../components/teacher/scoreManagement";
import StatisticsAnalysis from "../components/teacher/statisticsAnalysis";
import SystemSettings from "../components/teacher/systemSettings";
import QuickOperation from "../components/teacher/quickOperation";

import Student from "../components/student";
import Teacher from "../components/teacher";
import { useSelector } from "react-redux";

export function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole: "teacher" | "student" | "admin";
}) {
  const { isLogin, userInfo, isInitialized } = useSelector((state: any) => state.login);

  if (!isInitialized) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        fontSize: '16px' 
      }}>
        正在加载...
      </div>
    );
  }

  if (!isLogin) {
    return <Navigate to="/login" replace />;
  }

  if (userInfo?.identity !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

export function RoleRedirect() {
  const { isLogin, userInfo, isInitialized } = useSelector((state: any) => state.login);

  if (!isInitialized) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        fontSize: '16px' 
      }}>
        正在加载...
      </div>
    );
  }

  if (!isLogin) {
    return <Navigate to="/login" replace />;
  }

  switch (userInfo?.identity) {
    case "teacher":
      return <Navigate to="/teacher/workbench" replace />;
    case "student":
      return <Navigate to="/student" replace />;
    case "admin":
      return <Navigate to="/admin" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <RoleRedirect />,
  },
  {
    path: "/teacher",
    element: (
      <ProtectedRoute requiredRole="teacher">
        <Teacher />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: Workbench, path: "workbench" },
      { path: "testBaseManagement", Component: TestBaseManagement },
      {
        path: "examinationPaperManagement",
        Component: ExaminationPaperManagement,
      },
      { path: "examinationManagement", Component: ExaminationManagement },
      { path: "scoreManagement", Component: ScoreManagement },
      { path: "statisticsAnalysis", Component: StatisticsAnalysis },
      { path: "systemSettings", Component: SystemSettings },
      { path: "quickOperation", Component: QuickOperation },
    ],
  },
  {
    path: "/student",
    element: (
      <ProtectedRoute requiredRole="student">
        <Student />
      </ProtectedRoute>
    ),
    children: [],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "*",
    element: <NoFound />,
  },
]);

export default router;
