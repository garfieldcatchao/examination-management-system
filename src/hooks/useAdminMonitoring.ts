import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * 管理员监控Hook - 用于接收和管理学生端的监控数据
 */

export interface StudentMonitoringData {
  studentId: string;
  userId: string;
  examId: string;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  isCameraActive: boolean;
  faceDetected: boolean;
  userPresent: boolean;
  lastActivity: Date | null;
  behaviorAlerts: Array<{
    warningType: string;
    message: string;
    timestamp: Date;
  }>;
  // 视频流相关
  latestSnapshot?: string; // base64图片数据
  videoStream?: MediaStream; // 实时视频流（WebRTC）
}

export interface AdminMonitoringConfig {
  websocketUrl: string;
  examId: string;
  enableAutoRefresh?: boolean;
  snapshotInterval?: number; // 快照更新间隔（毫秒）
}

const DEFAULT_CONFIG = {
  websocketUrl: 'ws://localhost:8080/admin-monitoring',
  enableAutoRefresh: true,
  snapshotInterval: 2000, // 默认2秒更新一次快照
};

export default function useAdminMonitoring(examId: string, config: Partial<AdminMonitoringConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, examId, ...config };
  
  const [students, setStudents] = useState<Map<string, StudentMonitoringData>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());

  // 连接WebSocket
  const connectWebSocket = useCallback(() => {
    try {
      setConnectionStatus('connecting');
      setError(null);
      
      const ws = new WebSocket(`${finalConfig.websocketUrl}?examId=${examId}&role=admin`);
      wsRef.current = ws;
      
      ws.onopen = () => {
        console.log('管理员监控WebSocket连接已建立');
        setIsConnected(true);
        setConnectionStatus('connected');
        
        // 发送认证信息
        ws.send(JSON.stringify({
          type: 'admin_auth',
          data: {
            examId,
            timestamp: Date.now(),
          }
        }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('解析WebSocket消息失败:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket连接已关闭:', event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        
        // 自动重连（如果不是主动关闭）
        if (event.code !== 1000) {
          setTimeout(() => {
            connectWebSocket();
          }, 3000);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket连接错误:', error);
        setConnectionStatus('error');
        setError('WebSocket连接失败');
      };

    } catch (error) {
      console.error('创建WebSocket连接失败:', error);
      setConnectionStatus('error');
      setError('创建WebSocket连接失败');
    }
  }, [finalConfig.websocketUrl, examId]);

  // 处理WebSocket消息
  const handleWebSocketMessage = useCallback((message: any) => {
    switch (message.type) {
      case 'auth_success':
        console.log('管理员认证成功');
        break;
        
      case 'student_list':
        // 初始学生列表
        handleStudentList(message.data);
        break;
        
      case 'student_connected':
        // 新学生连接
        handleStudentConnected(message.data);
        break;
        
      case 'student_disconnected':
        // 学生断开连接
        handleStudentDisconnected(message.data);
        break;
        
      case 'user_photo':
        // 接收学生摄像头快照
        handleUserPhoto(message.data);
        break;
        
      case 'user_activity':
        // 接收学生活动状态
        handleUserActivity(message.data);
        break;
        
      case 'behavior_alert':
        // 接收异常行为警报
        handleBehaviorAlert(message.data);
        break;
        
      case 'webrtc_offer':
        // WebRTC offer（用于实时视频流）
        handleWebRTCOffer(message.data);
        break;
        
      default:
        console.log('未知消息类型:', message.type);
    }
  }, []);

  // 处理学生列表
  const handleStudentList = (data: any) => {
    const newStudents = new Map<string, StudentMonitoringData>();
    data.students.forEach((student: any) => {
      newStudents.set(student.userId, {
        studentId: student.studentId,
        userId: student.userId,
        examId: student.examId,
        connectionStatus: 'connected',
        isCameraActive: student.isCameraActive || false,
        faceDetected: student.faceDetected || false,
        userPresent: student.userPresent || true,
        lastActivity: student.lastActivity ? new Date(student.lastActivity) : null,
        behaviorAlerts: [],
      });
    });
    setStudents(newStudents);
  };

  // 处理学生连接
  const handleStudentConnected = (data: any) => {
    setStudents(prev => {
      const newStudents = new Map(prev);
      newStudents.set(data.userId, {
        studentId: data.studentId,
        userId: data.userId,
        examId: data.examId,
        connectionStatus: 'connected',
        isCameraActive: false,
        faceDetected: false,
        userPresent: true,
        lastActivity: new Date(),
        behaviorAlerts: [],
      });
      return newStudents;
    });
  };

  // 处理学生断开连接
  const handleStudentDisconnected = (data: any) => {
    setStudents(prev => {
      const newStudents = new Map(prev);
      const student = newStudents.get(data.userId);
      if (student) {
        student.connectionStatus = 'disconnected';
        student.isCameraActive = false;
        newStudents.set(data.userId, student);
      }
      return newStudents;
    });
  };

  // 处理用户照片快照
  const handleUserPhoto = (data: any) => {
    setStudents(prev => {
      const newStudents = new Map(prev);
      const student = newStudents.get(data.userId);
      if (student) {
        student.latestSnapshot = data.image;
        student.isCameraActive = true;
        student.faceDetected = data.metadata?.faceDetected || false;
        student.userPresent = data.metadata?.userPresent || false;
        student.lastActivity = new Date();
        newStudents.set(data.userId, student);
      }
      return newStudents;
    });
  };

  // 处理用户活动
  const handleUserActivity = (data: any) => {
    setStudents(prev => {
      const newStudents = new Map(prev);
      const student = newStudents.get(data.userId);
      if (student) {
        student.lastActivity = new Date();
        newStudents.set(data.userId, student);
      }
      return newStudents;
    });
  };

  // 处理行为警报
  const handleBehaviorAlert = (data: any) => {
    setStudents(prev => {
      const newStudents = new Map(prev);
      const student = newStudents.get(data.userId);
      if (student) {
        student.behaviorAlerts = [
          ...student.behaviorAlerts.slice(-4), // 只保留最近5条
          {
            warningType: data.warningType || 'unknown',
            message: data.message,
            timestamp: new Date(data.timestamp || Date.now()),
          }
        ];
        newStudents.set(data.userId, student);
      }
      return newStudents;
    });
  };

  // 处理WebRTC Offer（用于实时视频流）
  const handleWebRTCOffer = async (data: any) => {
    try {
      const { userId, offer } = data;
      
      // 创建RTCPeerConnection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
        ],
      });
      
      // 处理接收到的视频流
      pc.ontrack = (event) => {
        console.log('接收到视频流:', userId, event.streams[0]);
        setStudents(prev => {
          const newStudents = new Map(prev);
          const student = newStudents.get(userId);
          if (student) {
            student.videoStream = event.streams[0];
            newStudents.set(userId, student);
          }
          return newStudents;
        });
      };
      
      // 处理ICE候选
      pc.onicecandidate = (event) => {
        if (event.candidate && wsRef.current) {
          wsRef.current.send(JSON.stringify({
            type: 'webrtc_ice_candidate',
            data: {
              userId,
              candidate: event.candidate,
            }
          }));
        }
      };
      
      // 设置远程描述
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      
      // 创建答复
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      // 发送答复
      if (wsRef.current) {
        wsRef.current.send(JSON.stringify({
          type: 'webrtc_answer',
          data: {
            userId,
            answer: pc.localDescription,
          }
        }));
      }
      
      // 保存连接
      peerConnectionsRef.current.set(userId, pc);
      
    } catch (error) {
      console.error('处理WebRTC Offer失败:', error);
    }
  };

  // 请求学生视频流
  const requestVideoStream = useCallback((userId: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'request_video_stream',
        data: { userId }
      }));
    }
  }, []);

  // 停止学生视频流
  const stopVideoStream = useCallback((userId: string) => {
    const pc = peerConnectionsRef.current.get(userId);
    if (pc) {
      pc.close();
      peerConnectionsRef.current.delete(userId);
    }
    
    setStudents(prev => {
      const newStudents = new Map(prev);
      const student = newStudents.get(userId);
      if (student) {
        student.videoStream = undefined;
        newStudents.set(userId, student);
      }
      return newStudents;
    });
  }, []);

  // 发送控制命令
  const sendCommand = useCallback((userId: string, command: string, data?: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'admin_command',
        data: {
          userId,
          command,
          data,
        }
      }));
    }
  }, []);

  // 发送提醒
  const sendNotification = useCallback((userIds: string[], message: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'send_notification',
        data: {
          userIds,
          message,
          timestamp: Date.now(),
        }
      }));
    }
  }, []);

  // 断开连接
  const disconnect = useCallback(() => {
    console.log('断开管理员监控连接...');
    
    // 关闭所有WebRTC连接
    peerConnectionsRef.current.forEach(pc => pc.close());
    peerConnectionsRef.current.clear();
    
    if (wsRef.current) {
      wsRef.current.close(1000, '正常关闭');
      wsRef.current = null;
    }

    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  // 组件挂载时连接
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      disconnect();
    };
  }, [connectWebSocket, disconnect]);

  return {
    students: Array.from(students.values()),
    isConnected,
    connectionStatus,
    error,
    actions: {
      requestVideoStream,
      stopVideoStream,
      sendCommand,
      sendNotification,
      disconnect,
      reconnect: connectWebSocket,
    },
    getStudentById: (userId: string) => students.get(userId),
  };
}

