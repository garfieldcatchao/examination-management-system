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
    loginSuccess: (state, action: PayloadAction<{token: string, userInfo: UserInfo, remember?: boolean}>) => {
      state.isLogin = true;
      state.token = action.payload.token;
      state.userInfo = action.payload.userInfo;
      state.isInitialized = true; 
      
      // 使用localStorage存储，并根据remember字段添加不同的过期时间
      const expiryTime = action.payload.remember 
        ? 7 * 24 * 60 * 60 * 1000  // 记住我: 7天过期
        : 1 * 24 * 60 * 60 * 1000; // 不记住: 1天过期
      
      const tokenItem = {
        value: action.payload.token,
        expiry: Date.now() + expiryTime
      };
      const userInfoItem = {
        value: action.payload.userInfo,
        expiry: Date.now() + expiryTime
      };
      localStorage.setItem('token', JSON.stringify(tokenItem));
      localStorage.setItem('userInfo', JSON.stringify(userInfoItem));
    },
    logout: (state) => {
      state.isLogin = false;
      state.token = null;
      state.userInfo = null;
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
    },
    restoreLogin: (state) => {
      try {
        const tokenStr = localStorage.getItem('token');
        const userInfoStr = localStorage.getItem('userInfo');
        
        if (tokenStr && userInfoStr) {
          const tokenItem = JSON.parse(tokenStr);
          const userInfoItem = JSON.parse(userInfoStr);
          
          // 检查是否过期
          if (tokenItem.expiry && Date.now() > tokenItem.expiry) {
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            return;
          }
          
          state.isLogin = true;
          state.token = tokenItem.value;
          state.userInfo = userInfoItem.value;
        }
      } catch (error) {
        console.error('恢复登录状态失败:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
      }
      
      state.isInitialized = true;
    }
  }
});

export const { setLoginInfo, loginSuccess, logout, restoreLogin } = loginSlice.actions;
export default loginSlice.reducer;
