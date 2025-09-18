import { PayloadAction } from "@reduxjs/toolkit";
import { ExaminationPaperState } from "../interface/examinationPaperFace";

export const setSelectedTabReducer = (
  state: ExaminationPaperState,
  action: PayloadAction<any>
) => {
  return {
    ...state,
    activeTab: action.payload,
  };
};


export const initConfigReducer = (state: ExaminationPaperState, action: PayloadAction<any>) => {
  console.log("action =======", action)
  return {
    ...state,
    classMenu: action.payload
  };
};

export const getExaminationPaperListReducer = (state: ExaminationPaperState, action: PayloadAction<any>) => {
  console.log("action.payload ======> ", action.payload);
  
  const pagination = action.payload.pagination;
  return {
    ...state,
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalCount: pagination.totalItems,
    examPaperList: action.payload.data || [],
  };
};

export const getClassesReducer = (state: ExaminationPaperState, action: PayloadAction<any>) => {
  return {
    ...state,
    classes: action.payload.data || [],
  };
};


export const getUserListReducer = (state: any, action: PayloadAction<any>) => {
  return {
    ...state,
    students: action?.payload?.data || [],
  };
};


export const selectedListReducer = (state: any, action: PayloadAction<any>) => {
  return {
    ...state,
    selectedList: action.payload,
  };
};