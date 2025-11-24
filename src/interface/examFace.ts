// 考试相关的类型定义

// 题目选项
export interface QuestionOption {
  key: string; // A, B, C, D
  content: string; // 选项内容
  isCorrect?: boolean; // 是否为正确答案（仅在查看答案时使用）
}

// 题目类型枚举
export enum QuestionType {
  SINGLE_CHOICE = 'single_choice', // 单选题
  MULTIPLE_CHOICE = 'multiple_choice', // 多选题
  TRUE_FALSE = 'true_false', // 判断题
  FILL_BLANK = 'fill_blank', // 填空题
  SHORT_ANSWER = 'short_answer', // 简答题
  ESSAY = 'essay', // 论述题
}

// 题目状态枚举
export enum QuestionStatus {
  UNANSWERED = 'unanswered', // 未答
  ANSWERED = 'answered', // 已答
  MARKED = 'marked', // 已标记
  CURRENT = 'current', // 当前题目
}

// 单个题目数据结构
export interface Question {
  id: string; // 题目唯一ID
  number: number; // 题目序号
  type: QuestionType; // 题目类型
  content: string; // 题目内容
  options?: QuestionOption[]; // 选择题选项
  score: number; // 题目分值
  difficulty: 'easy' | 'medium' | 'hard'; // 难度等级
  subject: string; // 所属科目
  chapter?: string; // 所属章节
  tags?: string[]; // 题目标签
  explanation?: string; // 题目解析
}

// 用户答案数据结构
export interface UserAnswer {
  questionId: string; // 题目ID
  questionNumber: number; // 题目序号
  answer: string | string[]; // 用户答案（单选为string，多选为string[]）
  answerTime: number; // 答题用时(秒)
  isMarked: boolean; // 是否标记
  submitTime: Date; // 提交时间
}

// 考试基本信息
export interface ExamInfo {
  id: string; // 考试ID
  title: string; // 考试标题
  subject: string; // 考试科目
  type: 'final' | 'midterm' | 'quiz' | 'practice'; // 考试类型
  description?: string; // 考试描述
  duration: number; // 考试时长(分钟)
  totalQuestions: number; // 总题数
  totalScore: number; // 总分
  startTime: Date; // 开始时间
  endTime: Date; // 结束时间
  allowedAttempts: number; // 允许答题次数
  isShuffled: boolean; // 题目是否乱序
  showScore: boolean; // 是否显示分数
  showCorrectAnswer: boolean; // 是否显示正确答案
  instructions?: string[]; // 考试说明
}

// 考试状态枚举
export enum ExamStatus {
  NOT_STARTED = 'not_started', // 未开始
  IN_PROGRESS = 'in_progress', // 进行中
  PAUSED = 'paused', // 暂停（仅练习模式）
  COMPLETED = 'completed', // 已完成
  SUBMITTED = 'submitted', // 已提交
  EXPIRED = 'expired', // 已过期
}

// 考试会话数据（当前考试状态）
export interface ExamSession {
  examId: string; // 考试ID
  userId: string; // 用户ID
  status: ExamStatus; // 考试状态
  currentQuestionNumber: number; // 当前题目序号
  startTime: Date; // 开始时间
  remainingTime: number; // 剩余时间(秒)
  answers: Record<string, UserAnswer>; // 用户答案集合 {questionId: UserAnswer}
  markedQuestions: Set<string>; // 标记的题目ID集合
  visitedQuestions: Set<string>; // 已访问的题目ID集合
  timeSpentPerQuestion: Record<string, number>; // 每题用时统计
  lastSaveTime: Date; // 最后保存时间
  submitTime?: Date; // 提交时间
}

// 考试统计数据
export interface ExamStatistics {
  totalQuestions: number; // 总题数
  answeredCount: number; // 已答题数
  unansweredCount: number; // 未答题数
  markedCount: number; // 标记题数
  completionRate: number; // 完成率(%)
  elapsedTime: number; // 已用时间(秒)
  remainingTime: number; // 剩余时间(秒)
  averageTimePerQuestion: number; // 平均每题用时(秒)
}

// 考试结果数据
export interface ExamResult {
  examId: string; // 考试ID
  userId: string; // 用户ID
  score: number; // 总分
  totalScore: number; // 满分
  correctCount: number; // 正确题数
  wrongCount: number; // 错误题数
  completionTime: number; // 完成用时(分钟)
  submitTime: Date; // 提交时间
  rank?: number; // 班级排名
  totalParticipants?: number; // 总参与人数
  accuracy: number; // 正确率(%)
  questionResults: QuestionResult[]; // 每题结果详情
}

// 单题结果
export interface QuestionResult {
  questionId: string; // 题目ID
  questionNumber: number; // 题目序号
  userAnswer: string | string[]; // 用户答案
  correctAnswer: string | string[]; // 正确答案
  isCorrect: boolean; // 是否正确
  score: number; // 得分
  maxScore: number; // 满分
  timeSpent: number; // 用时(秒)
}

// 考试配置（用于不同模式）
export interface ExamConfig {
  mode: 'exam' | 'practice' | 'review' | 'mistakes'; // 考试模式
  earlySubmitLimit: number; // 提前提交时间限制(分钟)
  limitTime: number; // 时间限制(分钟)
  allowPause: boolean; // 是否允许暂停
  allowReview: boolean; // 是否允许回顾
  showAnswerImmediately: boolean; // 是否立即显示答案
  shuffleQuestions: boolean; // 是否打乱题目顺序
  shuffleOptions: boolean; // 是否打乱选项顺序
  timeLimit?: number; // 时间限制(分钟)，空表示无限制
  autoSubmit: boolean; // 是否自动提交
  preventCheating: boolean; // 是否启用防作弊机制
}

// React组件的State类型
export interface ExamState {
  examInfo: ExamInfo | null; // 考试基本信息
  questions: Question[]; // 题目列表
  currentSession: ExamSession | null; // 当前考试会话
  statistics: ExamStatistics; // 考试统计
  config: ExamConfig; // 考试配置
  isLoading: boolean; // 是否加载中
  error: string | null; // 错误信息
}

// API请求和响应类型
export interface StartExamRequest {
  examId: string;
  userId: string;
  mode?: 'exam' | 'practice' | 'review';
}

export interface StartExamResponse {
  success: boolean;
  message: string;
  data?: {
    examInfo: ExamInfo;
    questions: Question[];
    session: ExamSession;
    config: ExamConfig;
  };
}

export interface SaveAnswerRequest {
  examId: string;
  userId: string;
  questionId: string;
  answer: string | string[];
  isMarked: boolean;
  timeSpent: number;
}

export interface SaveAnswerResponse {
  success: boolean;
  message: string;
  autoSaved: boolean;
}

export interface SubmitExamRequest {
  examId: string;
  userId: string;
  answers: Record<string, UserAnswer>;
  totalTime: number;
}

export interface SubmitExamResponse {
  success: boolean;
  message: string;
  result?: ExamResult;
}

// Redux Action类型
export interface ExamAction {
  type: string;
  payload?: any;
}

// 错题相关数据结构
export interface MistakeQuestion extends Question {
  userAnswer: string | string[];
  correctAnswer: string | string[];
  explanation: string;
  mistakeType: 'concept' | 'calculation' | 'careless' | 'unknown';
  reviewCount: number; // 复习次数
  masteryLevel: 'weak' | 'medium' | 'strong'; // 掌握程度
}

// 练习统计
export interface PracticeStatistics {
  subjectId: string;
  subjectName: string;
  totalQuestions: number;
  practisedQuestions: number;
  correctCount: number;
  wrongCount: number;
  accuracy: number; // 正确率
  averageTime: number; // 平均用时
  weakTopics: string[]; // 薄弱知识点
  strongTopics: string[]; // 强势知识点
  lastPracticeTime: Date;
}
