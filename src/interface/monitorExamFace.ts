export interface StudentProgressState {
  percentage: number;
  answered: number;
  unanswered: number;
  marked: number;
  status: string;
}

export interface BehaviorLogState {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
}

export interface StudentState {
  id: string;
  name: string;
  studentId: string;
  className: string;
  status: string;
  isCameraActive: boolean;
  faceDetected: boolean;
  userPresent: boolean;
  lastActivity: Date;
  progress: StudentProgressState;
  behaviorLogs: BehaviorLogState[];
  avatar?: string;
}

export interface StatisticsState {
  total: number;
  online: number;
  offline: number;
  warning: number;
}

export interface AlertItemState {
  studentName: string;
  message: string;
  severity: string;
  timestamp: Date;
  studentId: string;
}
