export interface StatItem {
  label: string;
  value: string | number;
  icon: string;
  trend?: string;
}

export interface TodoItem {
  id: string;
  title: string;
  deadline: string;
  priority: "high" | "medium" | "low";
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  time: string;
  read: boolean;
}

export interface ChartData {
  label: string;
  value: number;
  color: string;
}

export interface UserInfo {
  id: string;
  name: string;
  role: "admin" | "teacher" | "assistant";
  department: string;
  classes: string[];
  permissions: string[];
}

export interface ExamData {
  id: string;
  title: string;
  creator: string;
  creatorId: string;
  type: string;
  students: number;
  status: "active" | "upcoming" | "scheduled" | "completed";
  isOwner: boolean;
  isShared: boolean;
  date: string;
  time: string;
  subject: string;
}
