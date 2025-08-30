import { createSlice } from "@reduxjs/toolkit";
import { setMenuListReducer } from "../reducers/menuReducer";

const menuSlice = createSlice({
  name: "menu",
  initialState: {
    selectMenu: "workbench",
    menuList: []
  },
  reducers: {
    setMenuList: setMenuListReducer,
  }
});

export const { setMenuList } = menuSlice.actions;
export default menuSlice.reducer;