import { api } from "../server/index";
import { isTrue } from "../utils";

export const searchExaminationPaper = async (params: any) => {
  const result = await api.paper.search(params);
  if (result && isTrue(result.success)) {
    return result;
  }
  return null;
};

export const getExaminationPaperListAction = async (params: any) => {
  const result = await api.paper.getList(params);
  if (result && isTrue(result.success)) {
    return result;
  }
  return null;
};


export const searchClassesAction = async (params?: any) => {
  const result = await api.user.searchClasses(params);
  if (result && isTrue(result.success)) {
    return result;
  }
  return null;
};