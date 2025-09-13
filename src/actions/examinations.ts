import { api } from "../server/index";
import { CreateExaminationRequest } from "../interface/examinationsFace";
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


// API调用函数
export const createExamination = async (examData: CreateExaminationRequest) => {
  return await api.examination.create({
    // 考试基本信息
    examName: examData.examName,
    subject: examData.subject,
    examType: examData.examType,
    paperId: examData.paperId,
    description: examData.description || '',
    
    // 时间安排 - 需要组合日期和时间
    startDateTime: `${examData.examDate} ${examData.startTime}:00`,
    endDateTime: `${examData.examDate} ${examData.endTime}:00`,
    duration: parseInt(examData.duration),
    
    // 时间限制设置
    lateLimit: parseInt(examData.lateLimit),
    earlySubmitLimit: parseInt(examData.earlySubmit),
    
    // 人员安排
    supervisorId: examData.supervisor,
    participants: {
      studentIds: examData.studentIds || [],
      classIds: examData.classIds || []
    },
    
    // 防作弊设置
    securitySettings: {
      cameraEnabled: examData.cameraEnabled,
      screenRecord: examData.screenRecord,
      preventSwitch: examData.preventSwitch,
      preventCopy: examData.preventCopy,
      randomQuestion: examData.randomQuestion,
      randomOption: examData.randomOption
    }
  });
};
