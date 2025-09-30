import { createBrowserRouter, Navigate } from "react-router";
import Login from "../components/Login";
import NoFound from "../components/NoFound";
import Main from "../components/Main";
import Dashboard from "../components/Dashboard";
import Workbench from "../components/teacher/workbench";
import TestBaseManagement from "../components/teacher/testBaseManagement";
import ExaminationPaperManagement from "../components/teacher/examinationPaperManagement";
import ExaminationManagement from "../components/teacher/examinationManagement";
import ScoreManagement from "../components/teacher/scoreManagement";
import StatisticsAnalysis from "../components/teacher/statisticsAnalysis";
import SystemSettings from "../components/teacher/systemSettings";
import QuickOperation from "../components/teacher/quickOperation";
import OnlineExamination from "../components/OnlineExamination";

import Student from "../components/student";
import Teacher from "../components/teacher";
import { useSelector } from "react-redux";
import { StudentWorkBench } from "../components/student/workBench";

export function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: "teacher" | "student" | "admin" | null;
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

  // 如果指定了特定角色，检查用户角色是否匹配
  if (requiredRole && userInfo?.identity !== requiredRole) {
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

  // 所有登录用户都跳转到统一的dashboard，根据身份自动显示对应界面
  return <Navigate to="/dashboard" replace />;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <RoleRedirect />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute requiredRole={null}>
        <Dashboard />
      </ProtectedRoute>
    ),
    children: [
      // 教师功能子路由
      { path: "workbench", Component: Workbench },
      { path: "testBaseManagement", Component: TestBaseManagement },
      { path: "examinationPaperManagement", Component: ExaminationPaperManagement },
      { path: "examinationManagement", Component: ExaminationManagement },
      { path: "scoreManagement", Component: ScoreManagement },
      { path: "statisticsAnalysis", Component: StatisticsAnalysis },
      { path: "systemSettings", Component: SystemSettings },
      { path: "quickOperation", Component: QuickOperation },
      // 学生功能子路由
      { path: "workspace", Component: StudentWorkBench },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/exam/:examId",
    element: (
      <ProtectedRoute requiredRole={null}>
        <OnlineExamination />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <NoFound />,
  },
]);

export default router;
