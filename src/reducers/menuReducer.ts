import { PayloadAction } from "@reduxjs/toolkit";

export const setMenuListReducer = (state: any, action: PayloadAction<any>) => {
  return {
    ...state,
    menuList: action.payload.menuList,
  };
};