export interface UserMonitoringState {
  isConnected: boolean;
  isCameraActive: boolean;
  connectionStatus: "connecting" | "connected" | "disconnected" | "error";
  error: string | null;
  lastActivity: Date | null;
  faceDetected: boolean;
  userPresent: boolean;
  behaviorAlerts: { warningType: string; message: string }[];
}

export interface UserMonitoringConfig {
  websocketUrl: string;
  captureInterval: number; // 拍照间隔（毫秒）
  compressionQuality: number; // 图片压缩质量 0-1
  maxWidth: number;
  maxHeight: number;
  enableFaceDetection: boolean; // 是否启用面部检测
  enableBehaviorAnalysis: boolean; // 是否启用行为分析
  faceDetectionSensitivity: "low" | "medium" | "high"; // 面部检测灵敏度
}





/**
 * 监控相关接口定义
 */

// 保存快照请求
export interface SaveSnapshotRequest {
  examId: number;
  userId: number;
  snapshotUrl?: string; // 图片URL（如果已上传OSS）
  snapshotData?: string; // base64数据（可选）
  snapshotSize?: number; // 图片大小（字节）
  faceDetected: boolean; // 是否检测到人脸
  faceConfidence?: number; // 人脸置信度 0-1
  userPresent: boolean; // 用户是否在座
  imageWidth: number; // 图片宽度
  imageHeight: number; // 图片高度
  imageQuality: number; // 图片质量 0-1
  capturedAt: string; // 拍摄时间 ISO格式
}

// 快照响应
export interface SnapshotResponse {
  id: number;
  examId: number;
  userId: number;
  snapshotUrl?: string;
  faceDetected: boolean;
  userPresent: boolean;
  imageWidth: number;
  imageHeight: number;
  capturedAt: string;
  createdAt: string;
}

// 快照列表响应
export interface SnapshotListResponse {
  total: number;
  snapshots: SnapshotResponse[];
}

// 监控统计
export interface MonitoringStats {
  totalSnapshots: number;
  faceDetectedCount: number;
  userPresentCount: number;
  abnormalCount: number;
}

