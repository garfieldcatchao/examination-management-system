import { Modal } from "antd";

export interface ModalProps {
  onClose: () => void;
}

export enum ImportMode {
  OVERWRITE = "overwrite", // 覆盖重复题目
  SKIP = "skip", // 跳过重复题目
  RENAME = "rename", // 自动重命名
}

export interface TestBaseManagementProps extends ModalProps {}

export interface StatisticsModalProps extends ModalProps {}

export interface ImportModalProps extends ModalProps {}

export interface SearchModalProps extends ModalProps {}

export interface BatchModalProps extends ModalProps {}

export interface SearchResultProps extends ModalProps {
  open: boolean;
}

export interface TestBaseResultModalProps extends ModalProps {}

export interface StatisticsData {
  totalQuestions: number;
  questionsByType: {
    single_choice: number;
    multiple_choice: number;
    true_false: number;
    fill_blank: number;
    essay: number;
  };
  questionsByDifficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
  questionsBySubject: {
    [key: string]: number;
  };
  usageStats: {
    totalExams: number;
    totalUsage: number;
    averageScore: number;
    passRate: number;
  };
  trendData: {
    date: string;
    newQuestions: number;
    usage: number;
  }[];
  topQuestions: {
    id: string;
    content: string;
    usageCount: number;
    correctRate: number;
  }[];
}