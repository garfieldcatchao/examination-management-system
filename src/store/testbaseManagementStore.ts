import { createSlice } from "@reduxjs/toolkit";
import {
  setActiveTabReducer,
  initSearchListReducer,
} from "../reducers/testBaseManagementReducer";

const testbaseManagementSlice = createSlice({
  name: "testbaseManagement",
  initialState: {
    activeTab: "basic",
    searchList: [
      {
        label: "基础搜索",
        value: "basic",
      },
      {
        label: "高级搜索",
        value: "advanced",
      },
      {
        label: "保存的搜索",
        value: "saved",
      },
    ],
    questionType: [
      {
        label: "单选题",
        value: "single",
      },
      {
        label: "多选题",
        value: "multiple",
      },
      {
        label: "判断题",
        value: "judgment",
      },
    ],
    difficulty: [
      {
        label: "简单",
        value: "easy",
      },
      {
        label: "中等",
        value: "medium",
      },
      {
        label: "困难",
        value: "hard",
      },
    ],
    object: [
      {
        label: "数学",
        value: "math",
      },
      {
        label: "语文",
        value: "chinese",
      },
      {
        label: "英语",
        value: "english",
      },
    ],
    menuList: [
      {
        label: "批量导入",
        value: "import",
      },
      {
        label: "题库统计",
        value: "statistics",
      },
      {
        label: "批量操作",
        value: "batch",
      },
    ],
    statisticsHeader: [
      {
        label: "今日",
        value: "today",
      },
      {
        label: "本周",
        value: "week",
      },
      {
        label: "本月",
        value: "month",
      },
      {
        label: "季度",
        value: "quarter",
      },
      {
        label: "年度",
        value: "year",
      },
    ],
  },
  reducers: {
    setSelectedTab: setActiveTabReducer,
    initSearchList: initSearchListReducer,
  },
});

export const { setSelectedTab, initSearchList } =
  testbaseManagementSlice.actions;
export default testbaseManagementSlice.reducer;
