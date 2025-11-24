import { Await } from "react-router";
import { api } from "../server/index";
import { isTrue } from "../utils";

export const getUserByClass = async (params: any) => {
  const result = await api.user.searchByClass(params);
  if (result && isTrue(result.success)) {
    return result;
  }
  return null;
};

export const searchUsers = async (params: any) => {
  const result = await api.user.search(params);
  if (result && isTrue(result.success)) {
    return result;
  }
  return null;
};

// 添加获取班级列表的函数
export const fetchClasses = async (params?: any) => {
  const result = await api.user.searchClasses(params || {});
  if (result && isTrue(result.success)) {
    return result;
  }
  return null;
};

// 添加搜索班级的函数
export const searchClasses = async (params: any) => {
  const result = await api.user.searchClasses(params);
  if (result && isTrue(result.success)) {
    return result;
  }
  return null;
};

// 添加获取用户列表的函数
export const fetchUsers = async (params?: any) => {
  const result = await api.user.search(params || {});
  if (result && isTrue(result.success)) {
    return result;
  }
  return null;
};

export const onLogin = async (params: any) => {
  const result = await api.login.login(params);
  if (result && isTrue(result.success)) {
    return result;
  }
  return null;
};



// export const onAuth = async() => {
//   const result = await api.login.auth();
//   if (result && isTrue(result.success)) {
//     return result;
//   }
//   return null;
// };