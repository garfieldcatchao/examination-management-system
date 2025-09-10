import { PayloadAction } from "@reduxjs/toolkit";

export const setActiveTabReducer = (state: any, action: PayloadAction<string>) => {
  return {
    ...state,
    activeTab: action.payload,
  }
};

export const  initExaminationListReducer = (state: any, action: PayloadAction<any>) => {
  console.log("action.payload ======> ", action.payload);
  
  // 确保正确处理数据结构
  const payload = action.payload;
  console.log("payload ======> ", payload);
  
  return {
    ...state,
    totalCount: payload?.totalCount || 0,
    examinationList: payload?.data || [],
  };
};


export const updateExaminationListReducer = (state: any, action: PayloadAction<any>) => {
  const payload = action.payload;
  return {
    ...state,
    examinationList: payload?.data || [],
  };
};