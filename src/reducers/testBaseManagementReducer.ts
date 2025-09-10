import { PayloadAction } from "@reduxjs/toolkit";

export const setActiveTabReducer = (state: any, action: PayloadAction<any>) => {
  // state.activeTab = action.payload;
  return {
    ...state,
    activeTab: action.payload,
  }
};

export const initSearchListReducer = (state: any, action: PayloadAction<any>) => {
  // state.searchList = action.payload;
  return {
    ...state,
    // searchList: action.payload,
  }
};