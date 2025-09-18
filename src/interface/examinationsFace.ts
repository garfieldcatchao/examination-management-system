export interface ExaminationBtns {
  [key: string]: {
    label: string;
    icon: string;
    color?: string;
    active?: { backgroundColor?: string; color?: string; border?: string };
    normal?: { backgroundColor?: string; color?: string; border?: string };
    actionType?: string;
  }[];
}


export interface CreateExaminationRequest {
  // ===== 考试基本信息 =====
  examName: string;              // 考试名称 *必填
  subject: string;               // 考试科目 *必填  
  examType: string;              // 考试类型 *必填
  paperId: string;               // 关联试卷ID *必填
  description?: string;          // 考试说明 (可选)
  
  // ===== 时间安排 =====
  examDate: string;              // 考试日期 *必填 (YYYY-MM-DD)
  startTime: string;             // 开始时间 *必填 (HH:mm)
  endTime: string;               // 结束时间 *必填 (HH:mm)
  duration: string;              // 考试时长(分钟) *必填
  
  // ===== 时间限制 =====
  lateLimit: string;             // 迟到限制(分钟) 默认"30"
  earlySubmit: string;           // 提前交卷限制(分钟) 默认"30"
  
  // ===== 参与人员 =====
  supervisor?: string;           // 监考老师ID (可选)
  studentIds?: string[];         // 参与考生ID列表 (可选)
  classIds?: string[];           // 参与班级ID列表 (可选)
  
  // ===== 监考设置 =====
  cameraEnabled: boolean;        // 启用摄像头 默认true
  screenRecord: boolean;         // 启用屏幕录制 默认true
  preventSwitch: boolean;        // 禁止切换窗口 默认true
  preventCopy: boolean;          // 禁止复制粘贴 默认true
  randomQuestion: boolean;       // 随机题目顺序 默认false
  randomOption: boolean;         // 随机选项顺序 默认false
}


export interface DataType {
  key: React.Key;
  username: string;
  studentId: string | number;
  department: string;
  phone: string;
  email: string;
  address: string;
}