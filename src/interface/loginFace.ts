import { LOGIN, CHOICE_IDENTITY } from "../constants";

export type FieldType = {
  username?: string;
  password?: string;
  remember?: string;
  studentId?: string;
};

export interface Identity {
  label: string;
  value: "teacher" | "student" | "admin"; // 限定具体值
}

export type ChooiceIdentityType = {
  identity: string;
};

export type LoginAction = {
  type: typeof LOGIN;
  payload: FieldType;
};

export type ChooiceIdentityAction = {
  type: typeof CHOICE_IDENTITY;
  payload: ChooiceIdentityType;
};

export interface LoginInfo {
  username?: string;
  token?: string;
  identity?: string;
}

export interface UserInfo {
  id: string;
  username: string;
  name?: string;
  role?: "teacher" | "student" | "admin";
  avatar?: string;
  permissions?: string[]; // 用户具体权限
  departmentId?: string; // 教师所属部门
  classId?: string; // 学生所属班级
  gradeId?: string; // 年级信息
  identity?: string;
}

export interface LoginState {
  identity?: Identity[];
  isLogin: boolean;
  token: string | null;
  userInfo: UserInfo | null;
  isInitialized: boolean; // 标记是否已完成初始化
}

export interface LoginResponse {
  message: string;
  studentId: string | number | null;
  success: true;
  token: string;
  userInfo: UserInfo;
}
