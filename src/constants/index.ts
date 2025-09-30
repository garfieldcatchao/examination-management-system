import { MenuProps, MenuListProps } from "../interface/menuFace";

export const LOGIN = "LOGIN";
export const CHOICE_IDENTITY = "CHOICE_IDENTITY";

export const teacherMenuList: MenuProps[] = [
  {
    key: "workbench",
    icon: "iconfont icon-gongzuotai",
    label: "工作台",
    path: "/dashboard/workbench",
  },
  {
    key: "testBaseManagement",
    icon: "iconfont icon-tikuguanli",
    label: "题库管理",
    path: "/dashboard/testBaseManagement",
  },
  {
    key: "examinationPaperManagement",
    label: "试卷管理",
    icon: "iconfont icon-mianshishijuan",
    path: "/dashboard/examinationPaperManagement",
  },
  {
    key: "examinationManagement",
    label: "考试管理",
    icon: "iconfont icon-xueyuan-kaoshi",
    path: "/dashboard/examinationManagement",
  },
  {
    key: "scoreManagement",
    icon: "iconfont icon-chengji",
    label: "成绩管理",
    path: "/dashboard/scoreManagement",
  },
  {
    key: "statisticsAnalysis",
    icon: "iconfont icon-tongjifenxi2",
    label: "统计分析",
    path: "/dashboard/statisticsAnalysis",
  },
  {
    key: "systemSettings",
    icon: "iconfont icon-xitongshezhi",
    label: "系统设置",
    path: "/dashboard/systemSettings",
  },
  {
    key: "quickOperation",
    icon: "iconfont icon-kuaisu",
    label: "快速操作",
    foldIcon: "iconfont icon-shouqi",
    unFoldIcon: "iconfont icon-zhankai",
    hasSubMenu: true,
    children: [
      {
        key: "NewTitleAddition",
        label: "新增题目",
        path: "/dashboard/NewTitleAddition",
      },
      {
        key: "NewExamCreation",
        label: "创建考试",
        path: "/dashboard/NewExamCreation",
      },
      {
        key: "ViewPendingTasks",
        label: "查看待办",
        path: "/dashboard/ViewPendingTasks",
      },
    ],
  },
];

const studentMenuList: MenuProps[] = [
  {
    key: "workspace",
    icon: "studentMenu icon-xuexizhongxin-copy",
    label: "学习中心",
    path: "/dashboard/workspace",
  },
  {
    key: "onlineExam",
    icon: "studentMenu icon-kaoshi-copy",
    label: "在线考试",
    path: "/dashboard/onlineExam",
  },
];

const adminMenuList: MenuProps[] = [
  {
    key: "workbench",
    icon: "iconfont icon-gongzuotai",
    label: "工作台",
    path: "/dashboard/workbench",
  },
];

export const menuListMap: MenuListProps = {
  teacher: teacherMenuList,
  student: studentMenuList,
  manager: adminMenuList,
};

export const THEME = {
  teacherTheme: {
    containerStyle: {
    },
    versionStyle: {
      color: "#fff",
    },
    logoStyle: {
      color: "#1890ff",
    },
    navPathStyle: {
      color: "#666",
    },
    sideBarStyle: {
      // backgroundColor: "#fff",
      color: "#fff",
    }
  },
  studentTheme: {
    containerStyle: {
      backgroundColor: "#fff",
    },
    versionStyle: {
      color: "#fff",
    },
    logoStyle: {
      color: "#1890ff",
    },
    navPathStyle: {
      color: "#666",
    },
    sideBarStyle: {
      backgroundColor: "#fff",
      color: "#666",
    }
  },
};
