import { api } from "../server/index";
import { isTrue } from "../utils";

export const initExaminationListAction = async (): Promise<any> => {
  const result = await api.examination.getList({ page: 1, pageSize: 9 });
  if (result && isTrue(result.success)) {
    return result;
  }

  return null;
};

export const fetchExaminationListAction = async (page: number, pageSize: number = 5): Promise<any> => {
  const result = await api.examination.getList({ page, pageSize });
  if (result && isTrue(result.success)) {
    return result;
  }
  return null;
};


export const deleteExaminationAction = async (id: string): Promise<any> => {
  const result = await api.examination.delete(id);
  if (result && isTrue(result.success)) {
    return result;
  }
  return null;
};

