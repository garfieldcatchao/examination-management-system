import { LOGIN, CHOICE_IDENTITY } from "../constants";

export type FieldType = {
  username?: string;
  password?: string;
  remember?: string;
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

export interface LoginState {
  name: string;
  identity: Identity[];
  loginInfo: LoginInfo;
}