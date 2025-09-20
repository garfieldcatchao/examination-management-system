import { createSlice } from "@reduxjs/toolkit";
import { setSelectedTabReducer, getExaminationPaperListReducer, getClassesReducer, getUserListReducer, initConfigReducer, selectedListReducer } from "../reducers/examinationPaperReducer";

const examinationPaperSlice = createSlice({
  name: "examinationPaper",
  initialState: {
    activeTab: "paper-list",
    examPaperTabList: [{
      label: "试卷列表",
      value: "paper-list",
    }, {
      label: "智能组卷",
      value: "smart-compose",
    }, {
      label: "导入试卷",
      value: "import-paper",
    }, {
      label: "试卷分析",
      value: "paper-analysis",
    }, {
      label: "模板管理",
      value: "template-manage",
    }],
    page: 1,
    pageSize: 10,
    totalCount: 1,
    classMenu: [],
    classes: [],
    students: [],
    selectedList: [],
    examPaperList: []
  } as any,
  reducers: {
    setActiveTab: setSelectedTabReducer,
    initConfig: initConfigReducer,
    getExaminationPaperList: getExaminationPaperListReducer,
    getClasses: getClassesReducer,
    getStudents: getUserListReducer,
    setSelectedList: selectedListReducer,
  },
});

export const { setActiveTab, getExaminationPaperList, getClasses, getStudents, initConfig, setSelectedList } = examinationPaperSlice.actions;
export default examinationPaperSlice.reducer;
