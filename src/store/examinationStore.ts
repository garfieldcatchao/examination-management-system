import { createSlice } from "@reduxjs/toolkit";
import { setActiveTabReducer, initExaminationListReducer, updateExaminationListReducer } from "../reducers/examinationReducer";

const examinationSlice = createSlice({
  name: "examination",
  initialState: {
    activeTab: "examination-list",
    examinationList: [],
    totalCount: 0,
    examinationMenu: [
      {
        label: "考试列表",
        value: "examination-list",
      },
      {
        label: "创建考试",
        value: "create-exam",
      },
      {
        label: "实时监控",
        value: "monitor-exam",
      },
      {
        label: "考试日历",
        value: "exam-calendar",
      },
      {
        label: "考试报告",
        value: "exam-report",
      },
    ],
  },
  reducers: {
    setActiveTab: setActiveTabReducer,
    initExaminationList: initExaminationListReducer,
    updateExaminationList: updateExaminationListReducer,
  },
});

export const { setActiveTab, initExaminationList, updateExaminationList } = examinationSlice.actions;
export default examinationSlice.reducer;
