import { createSlice } from "@reduxjs/toolkit";
import { setSelectedTabReducer } from "../reducers/examinationPaperReducer";

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
  },
  reducers: {
    setActiveTab: setSelectedTabReducer,
  },
});

export const { setActiveTab } = examinationPaperSlice.actions;
export default examinationPaperSlice.reducer;
