import http from "./axios";
import { addURLParams } from "../utils";

// 便捷的API接口定义
export const api = {

  login: {
    login: (data: any) => http.post("/auth/login", data),
    logout: () => http.post("/auth/logout"),
  },

  // 用户相关
  user: {
    getUserInfo: () => http.get("/user/info"),
    updateUserInfo: (data: any) => http.put("/user/info", data),
    searchByClass: (data: any) => http.post("/users/class", data),
    searchClasses: (data: any) => http.post("/classes/query", data),
    searchByRole: (data: any) => http.get("/users", data),
    search: (data: any) => http.post("/users/search", data),
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
    getList: (params: any) => http.get("/examinations/papers", params),
    create: (data: any) => http.post("/examinations/papers", data),
    update: (id: string, data: any) =>
      http.put(`/examinations/papers/${id}`, data),
    delete: (id: string) => http.delete(`/examinations/papers/${id}`),
    publish: (id: string) => http.post(`/examinations/papers/${id}/publish`),
    search: (params: any) => http.post("/examinations/papers/search", params),
    // getDetail: (id: string) => http.get(`/examinations/papers/${id}`),
  },

  // 考试管理
  examination: {
    getList: (params: any) => http.get("/examinations", params),
    create: (data: any) => http.post("/examinations", data),
    update: (id: string, data: any) => http.put(`/examinations/${id}`, data),
    delete: (id: string) => http.delete(`/examinations/${id}`),
    start: (id: string) => http.post(`/examinations/${id}/start`),
    end: (id: string) => http.post(`/examinations/${id}/end`),
    resources: () => http.get(`/examinations/resources`),
  },

  // 成绩管理
  score: {
    getList: (params: any) => http.get("/score/list", params),
    getDetail: (id: string) => http.get(`/score/${id}`),
    export: (params: any) =>
      http.download("/score/export", params, "成绩统计.xlsx"),
  },

  // 统计分析
  statistics: {
    getDashboard: () => http.get("/statistics/dashboard"),
    getExamStats: (params: any) => http.get("/statistics/exam", params),
    getQuestionStats: (params: any) => http.get("/statistics/question", params),
  },
};
