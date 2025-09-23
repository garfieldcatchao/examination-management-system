import React, { useEffect } from "react";
import { RouterProvider } from "react-router";
import { Provider, useDispatch, useSelector } from "react-redux";
import router from "./router";
import store from "./store";
import "./App.css";
import { restoreLogin } from "./store/loginStore";

function AppWithProvider() {
  const { userInfo, isLogin } = useSelector((state: any) => state.login);
  console.log(userInfo, isLogin);
  const dispatch = useDispatch();

  useEffect(() => {
    // 应用启动时恢复登录状态
    dispatch(restoreLogin());
  }, [dispatch]);

  return <RouterProvider router={router} />;
}

function App() {
  return (
    <Provider store={store}>
      <AppWithProvider />
    </Provider>
  );
}

export default App;
