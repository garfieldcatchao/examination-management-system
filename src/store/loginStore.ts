import { createSlice } from "@reduxjs/toolkit";
import { loginReducer, modificationReducer, chooiceIdentityReducer } from "../reducers/loginReducer";
import { LoginState } from "../interface/loginFace";

const loginSlice = createSlice({
  name: "login",
  initialState: {
    identity: [
      { label: "👨‍🏫 教师", value: "teacher" },
      { label: "👨‍🎓 学生", value: "student" },
      { label: "👑 管理员", value: "manager" },
    ],
    loginInfo: {
      identity: "teacher",
    },
  } as LoginState,
  reducers: {
    login: loginReducer,
    modification: modificationReducer,
    chooiceIdentity: chooiceIdentityReducer,
  },
});

export const { login, modification, chooiceIdentity } = loginSlice.actions;
export default loginSlice.reducer;
