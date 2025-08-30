import { createBrowserRouter } from "react-router";
import Login from "../components/Login";
import NoFound from "../components/NoFound";
import Main from "../components/Main";
import Workbench from "../components/workbench";
import Teacher from "../components/teacher";
import TestBaseManagement from "../components/testBaseManagement";
import ExaminationPaperManagement from "../components/examinationPaperManagement";
import ExaminationManagement from "../components/examinationManagement";
import ScoreManagement from "../components/scoreManagement";
import StatisticsAnalysis from "../components/statisticsAnalysis";
import SystemSettings from "../components/systemSettings";
import QuickOperation from "../components/quickOperation";

const router = createBrowserRouter([
  {
    path: "/teacher",
    element: <Teacher />,
    children: [
      { index: true, Component: Workbench, path: "workbench" },
      { path: "testBaseManagement", Component: TestBaseManagement },
      { path: "examinationPaperManagement", Component: ExaminationPaperManagement },
      { path: "examinationManagement", Component: ExaminationManagement },
      { path: "scoreManagement", Component: ScoreManagement },
      { path: "statisticsAnalysis", Component: StatisticsAnalysis },
      { path: "systemSettings", Component: SystemSettings },
      { path: "quickOperation", Component: QuickOperation },
    ],
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
