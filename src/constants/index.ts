import { MenuProps, MenuListProps } from "../interface/menuFace";

export const LOGIN = "LOGIN";
export const CHOICE_IDENTITY = "CHOICE_IDENTITY";

export const teacherMenuList: MenuProps[] = [
  {
    key: "workbench",
    icon: "iconfont icon-gongzuotai",
    label: "工作台",
    path: "/teacher/workbench",
  },
  {
    key: "testBaseManagement",
    icon: "iconfont icon-tikuguanli",
    label: "题库管理",
    path: "/teacher/testBaseManagement",
  },
  {
    key: "examinationPaperManagement",
    label: "试卷管理",
    icon: "iconfont icon-mianshishijuan",
    path: "/teacher/examinationPaperManagement",
  },
  {
    key: "examinationManagement",
    label: "考试管理",
    icon: "iconfont icon-xueyuan-kaoshi",
    path: "/teacher/examinationManagement",
  },
  {
    key: "scoreManagement",
    icon: "iconfont icon-chengji",
    label: "成绩管理",
    path: "/teacher/scoreManagement",
  },
  {
    key: "statisticsAnalysis",
    icon: "iconfont icon-tongjifenxi2",
    label: "统计分析",
    path: "/teacher/statisticsAnalysis",
  },
  {
    key: "systemSettings",
    icon: "iconfont icon-xitongshezhi",
    label: "系统设置",
    path: "/teacher/systemSettings",
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
        path: "/teacher/NewTitleAddition",
      },
      {
        key: "NewExamCreation",
        label: "创建考试",
        path: "/teacher/NewExamCreation",
      },
      {
        key: "ViewPendingTasks",
        label: "查看待办",
        path: "/teacher/ViewPendingTasks",
      },
    ],
  },
];

const studentMenuList: MenuProps[] = [
  {
    key: "workbench",
    icon: "iconfont icon-gongzuotai",
    label: "工作台",
  },
];

const adminMenuList: MenuProps[] = [
  {
    key: "workbench",
    icon: "iconfont icon-gongzuotai",
    label: "工作台",
  },
];

export const menuListMap: MenuListProps = {
  teacher: teacherMenuList,
  student: studentMenuList,
  manager: adminMenuList,
};
