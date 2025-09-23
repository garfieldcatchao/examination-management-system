import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LoginState, UserInfo } from "../interface/loginFace";

const initialState: LoginState = {
  identity: [
    { label: "教师", value: "teacher" },
    { label: "学生", value: "student" },
    { label: "管理员", value: "admin" }
  ],
  isLogin: false,
  token: null,
  userInfo: null,
  isInitialized: false, // 添加初始化状态
};

const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    setLoginInfo: (state, action: PayloadAction<{identity: string}>) => {
      // state.loginInfo = action.payload;
    },
    loginSuccess: (state, action: PayloadAction<{token: string, userInfo: UserInfo}>) => {
      state.isLogin = true;
      state.token = action.payload.token;
      state.userInfo = action.payload.userInfo;
      state.isInitialized = true; // 登录成功后也标记为已初始化
      
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('userInfo', JSON.stringify(action.payload.userInfo));
    },
    logout: (state) => {
      state.isLogin = false;
      state.token = null;
      state.userInfo = null;
      // 登出时保持isInitialized为true，避免重新初始化
      
      // 清除localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
    },
    // 从localStorage恢复登录状态
    restoreLogin: (state) => {
      const token = localStorage.getItem('token');
      const userInfoStr = localStorage.getItem('userInfo');
      
      if (token && userInfoStr) {
        try {
          const userInfo = JSON.parse(userInfoStr);
          state.isLogin = true;
          state.token = token;
          state.userInfo = userInfo;
        } catch (error) {
          console.error('Failed to parse userInfo from localStorage:', error);
          // 如果解析失败，清除无效数据
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
        }
      }
      
      // 无论是否恢复成功，都标记为已初始化
      state.isInitialized = true;
    }
  }
});

export const { setLoginInfo, loginSuccess, logout, restoreLogin } = loginSlice.actions;
export default loginSlice.reducer;
