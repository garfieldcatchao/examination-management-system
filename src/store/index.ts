import { configureStore } from "@reduxjs/toolkit";
import loginReducer from "./loginStore";
import menuReducer from "./menuStore";

const store = configureStore({
  reducer: {
    login: loginReducer,
    menu: menuReducer,
  },
});

export default store;
