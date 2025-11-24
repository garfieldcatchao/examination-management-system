import { PayloadAction } from "@reduxjs/toolkit";

export const setActiveTabReducer = (state: any, action: PayloadAction<string>) => {
  return {
    ...state,
    activeTab: action.payload,
  }
};

export const  initExaminationListReducer = (state: any, action: PayloadAction<any>) => {
  const payload = action.payload;
  
  return {
    ...state,
    totalCount: payload?.pagination?.totalItems || 0,
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

export const setExamResourcesReducer = (state: any, action: PayloadAction<any>) => {
  const payload = action.payload;
  
  return {
    ...state,
    resources: payload?.data || {},
  };
};



export const setExamQuestionReducer = (state: any, action: PayloadAction<any>) => {
  const payload = action.payload;
  return {
    ...state,
    examQuestion: payload?.data || null,
  };
};