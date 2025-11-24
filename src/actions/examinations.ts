import { api } from "../server/index";
import { CreateExaminationRequest } from "../interface/examinationsFace";
import { isTrue } from "../utils";

let errorMsg = {
  success: false,
  data: null,
  message: "加载失败",
};

export const initExaminationListAction = async (): Promise<any> => {
  const result = await api.examination.getList({ page: 1, pageSize: 9 });
  if (result && isTrue(result.success)) {
    return result;
  }
  return errorMsg;
};

export const fetchExaminationListAction = async (
  page: number,
  pageSize: number = 5
): Promise<any> => {
  const result = await api.examination.getList({ page, pageSize });
  if (result && isTrue(result.success)) {
    return result;
  }
  return errorMsg;
};

export const deleteExaminationAction = async (id: string): Promise<any> => {
  const result = await api.examination.delete(id);
  if (result && isTrue(result.success)) {
    return result;
  }
  return errorMsg;
};

export const getExaminationResourcesAction = async (): Promise<any> => {
  const result = await api.examination.resources();

  if (result && isTrue(result.success)) {
    return result;
  }
  return errorMsg;
};

export const createExamination = async (examData: CreateExaminationRequest) => {
  return await api.examination.create({
    examName: examData.examName,
    subjectId: examData.subjectId,
    subjectCode: examData.subjectCode,
    createdBy: 1,
    examType: examData.examType,
    paperId: examData.paperId,
    description: examData.description || "",

    startTime: `${examData.examDate} ${examData.startTime}:00`,
    endTime: `${examData.examDate} ${examData.endTime}:00`,
    duration: parseInt(examData.duration),

    lateLimit: parseInt(examData.lateLimit),
    earlySubmitLimit: parseInt(examData.earlySubmit),

    supervisorId: examData.supervisor,
    studentIds: examData.studentIds || [],

    cameraEnabled: examData.cameraEnabled,
    screenRecord: examData.screenRecord,
    preventSwitch: examData.preventSwitch,
    preventCopy: examData.preventCopy,
    randomQuestion: examData.randomQuestion,
    randomOption: examData.randomOption,
  });
};

export const getExaminationQuestionAction = async (id: string) => {
  const result = await api.examination.getExamQuestion(id);
  if (result && isTrue(result.success)) {
    return result;
  }
  return errorMsg;
};

export const checkParticipationAction = async (data: any) => {
  const result = await api.examination.checkParticipation(data);
  if (result && isTrue(result.success)) {
    return result;
  }
  return errorMsg;
};
