import http from "./axios";
import { addURLParams } from "../utils";

// 便捷的API接口定义
export const api = {
  // 用户相关
  user: {
    login: (data: any) => http.post("/user/login", data),
    logout: () => http.post("/user/logout"),
    getUserInfo: () => http.get("/user/info"),
    updateUserInfo: (data: any) => http.put("/user/info", data),
  },

  // 试题管理
  question: {
    getList: (params: any) => http.get("/question/list", params),
    create: (data: any) => http.post("/question", data),
    update: (id: string, data: any) => http.put(`/question/${id}`, data),
    delete: (id: string) => http.delete(`/question/${id}`),
    batchImport: (file: File) => http.upload("/question/import", file),
  },

  // 试卷管理
  paper: {
    getList: (params: any) => http.get("/paper/list", params),
    create: (data: any) => http.post("/paper", data),
    update: (id: string, data: any) => http.put(`/paper/${id}`, data),
    delete: (id: string) => http.delete(`/paper/${id}`),
    publish: (id: string) => http.post(`/paper/${id}/publish`),
  },

  // 考试管理
  examination: {
    getList: (params: any) => http.get("/examinations", params),
    create: (data: any) => http.post("/examinations", data),
    update: (id: string, data: any) => http.put(`/examinations/${id}`, data),
    delete: (id: string) => http.delete(`/examinations/${id}`),
    start: (id: string) => http.post(`/examinations/${id}/start`),
    end: (id: string) => http.post(`/examinations/${id}/end`),
  },

  // 成绩管理
  score: {
    getList: (params: any) => http.get("/score/list", params),
    getDetail: (id: string) => http.get(`/score/${id}`),
    export: (params: any) => http.download("/score/export", params, "成绩统计.xlsx"),
  },

  // 统计分析
  statistics: {
    getDashboard: () => http.get("/statistics/dashboard"),
    getExamStats: (params: any) => http.get("/statistics/exam", params),
    getQuestionStats: (params: any) => http.get("/statistics/question", params),
  },
};
