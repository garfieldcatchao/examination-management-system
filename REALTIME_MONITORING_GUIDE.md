# 实时监控摄像头同步实现指南

## 概述

本系统实现了从学生端摄像头到教师端实时监控的完整视频流传输方案，支持两种模式：
1. **快照模式**：定期传输静态图片（默认2秒一张）
2. **实时流模式**：基于WebRTC的实时视频流传输

## 技术架构

### 1. 数据流向

```
学生端摄像头 → WebSocket服务器 ← 教师端监控界面
     ↓                                    ↑
  视频采集                            视频展示
     ↓                                    ↑
  人脸检测                            实时更新
     ↓                                    ↑
快照/视频流 ─────────────────────→ 快照/视频流
```

### 2. 核心技术

- **WebSocket**: 实时双向通信
- **WebRTC**: P2P视频流传输（低延迟）
- **Canvas API**: 图片处理和快照
- **MediaStream API**: 摄像头访问

## 实现步骤

### 步骤1: 学生端摄像头采集（已实现）

学生端使用 `useUserMonitoring` Hook:

```typescript
// src/hooks/useScreenMonitoring.ts
const userMonitoring = useUserMonitoring(examId, userId, {
  websocketUrl: 'ws://localhost:8080/user-monitoring',
  captureInterval: 2000, // 每2秒拍照一次
  compressionQuality: 0.7,
  maxWidth: 640,
  maxHeight: 480,
  enableFaceDetection: true,
  enableBehaviorAnalysis: true,
});
```

**功能**:
- 自动开启摄像头
- 定期拍照并发送到服务器
- 进行人脸检测
- 监控异常行为

### 步骤2: WebSocket服务器处理（需更新）

更新 `websocket-server.js`:

```javascript
// 存储所有连接的客户端
const clients = new Map(); // userId -> {ws, role, data}

wss.on('connection', (ws, request) => {
  const params = new URLSearchParams(request.url.split('?')[1]);
  const role = params.get('role'); // 'student' or 'admin'
  const examId = params.get('examId');
  
  ws.on('message', (data) => {
    const message = JSON.parse(data);
    
    switch (message.type) {
      case 'user_photo':
        // 学生发送的照片，转发给所有监控该考试的教师
        broadcastToAdmins(examId, {
          type: 'user_photo',
          data: message.data
        });
        break;
        
      case 'admin_auth':
        // 教师认证，返回当前所有学生列表
        sendStudentList(ws, examId);
        break;
        
      case 'request_video_stream':
        // 教师请求实时视频流
        requestStudentVideoStream(message.data.userId);
        break;
        
      case 'webrtc_offer':
      case 'webrtc_answer':
      case 'webrtc_ice_candidate':
        // WebRTC信令转发
        relayWebRTCSignal(message);
        break;
    }
  });
});

// 广播给所有管理员
function broadcastToAdmins(examId, message) {
  clients.forEach((client, userId) => {
    if (client.role === 'admin' && client.examId === examId) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    }
  });
}

// 发送学生列表给管理员
function sendStudentList(ws, examId) {
  const students = [];
  clients.forEach((client, userId) => {
    if (client.role === 'student' && client.examId === examId) {
      students.push({
        userId: client.userId,
        studentId: client.studentId,
        isCameraActive: client.isCameraActive,
        faceDetected: client.faceDetected,
        userPresent: client.userPresent,
        lastActivity: client.lastActivity,
      });
    }
  });
  
  ws.send(JSON.stringify({
    type: 'student_list',
    data: { students }
  }));
}

// 请求学生视频流
function requestStudentVideoStream(userId) {
  const student = clients.get(userId);
  if (student && student.ws.readyState === WebSocket.OPEN) {
    // 通知学生开始WebRTC连接
    student.ws.send(JSON.stringify({
      type: 'start_video_stream',
      data: { timestamp: Date.now() }
    }));
  }
}

// 转发WebRTC信令
function relayWebRTCSignal(message) {
  const { targetUserId, ...signalData } = message.data;
  const target = clients.get(targetUserId);
  
  if (target && target.ws.readyState === WebSocket.OPEN) {
    target.ws.send(JSON.stringify({
      type: message.type,
      data: signalData
    }));
  }
}
```

### 步骤3: 教师端监控（已实现）

使用 `useAdminMonitoring` Hook:

```typescript
const adminMonitoring = useAdminMonitoring(examId, {
  websocketUrl: 'ws://localhost:8080/admin-monitoring',
});

// 获取学生数据
const students = adminMonitoring.students;

// 请求实时视频流
adminMonitoring.actions.requestVideoStream(userId);

// 停止视频流
adminMonitoring.actions.stopVideoStream(userId);
```

### 步骤4: 实时视频预览组件

使用 `LiveCameraPreview` 组件:

```tsx
<LiveCameraPreview
  studentId={student.studentId}
  userId={student.id}
  snapshot={adminMonitoring.getStudentById(student.id)?.latestSnapshot}
  videoStream={adminMonitoring.getStudentById(student.id)?.videoStream}
  faceDetected={student.faceDetected}
  userPresent={student.userPresent}
  onRequestStream={() => adminMonitoring.actions.requestVideoStream(student.id)}
  onStopStream={() => adminMonitoring.actions.stopVideoStream(student.id)}
/>
```

**功能**:
- 默认显示快照模式（自动更新）
- 点击"实时监控"按钮切换到视频流模式
- 支持暂停/播放、全屏
- 显示人脸检测状态

## WebRTC实现详解

### 学生端（需更新 useUserMonitoring）

```typescript
// 添加WebRTC支持
let peerConnection: RTCPeerConnection | null = null;

// 处理开始视频流请求
const handleStartVideoStream = async () => {
  try {
    // 创建RTCPeerConnection
    peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
      ],
    });
    
    // 添加本地视频轨道
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        peerConnection!.addTrack(track, streamRef.current!);
      });
    }
    
    // 创建offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    
    // 发送offer给教师端
    wsRef.current.send(JSON.stringify({
      type: 'webrtc_offer',
      data: {
        targetUserId: 'admin-id', // 教师ID
        offer: peerConnection.localDescription,
      }
    }));
    
    // 处理ICE候选
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        wsRef.current.send(JSON.stringify({
          type: 'webrtc_ice_candidate',
          data: {
            targetUserId: 'admin-id',
            candidate: event.candidate,
          }
        }));
      }
    };
    
  } catch (error) {
    console.error('WebRTC连接失败:', error);
  }
};

// 处理WebRTC answer
const handleWebRTCAnswer = async (answer: RTCSessionDescriptionInit) => {
  if (peerConnection) {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  }
};
```

### 教师端（已在 useAdminMonitoring 中实现）

WebRTC连接流程：
1. 教师点击"实时监控"
2. 发送 `request_video_stream` 消息
3. 学生端收到后创建 offer
4. 教师端收到 offer 后创建 answer
5. ICE候选交换
6. P2P连接建立，视频流传输开始

## 性能优化

### 1. 快照模式优化

```typescript
// 调整拍照频率和质量
const config = {
  captureInterval: 3000, // 3秒一张，减少带宽
  compressionQuality: 0.6, // 降低质量，减小文件大小
  maxWidth: 480, // 降低分辨率
  maxHeight: 360,
};
```

### 2. 视频流优化

```typescript
// 请求较低质量的视频流
const constraints = {
  video: {
    width: { ideal: 640 },
    height: { ideal: 480 },
    frameRate: { ideal: 15 }, // 15fps足够监控使用
  },
  audio: false, // 不需要音频
};
```

### 3. 服务器优化

- 使用消息队列处理大量并发
- 图片存储使用CDN或对象存储
- WebRTC使用TURN服务器处理NAT穿透

## 安全考虑

### 1. 数据加密

```javascript
// 使用WSS (WebSocket Secure)
const ws = new WebSocket('wss://your-domain.com/monitoring');

// TURN服务器使用TLS
const config = {
  iceServers: [
    {
      urls: 'turns:turn.example.com:5349',
      username: 'user',
      credential: 'pass'
    }
  ]
};
```

### 2. 权限验证

```javascript
// 服务器端验证
ws.on('connection', (ws, request) => {
  const token = parseAuthToken(request);
  
  if (!isValidToken(token)) {
    ws.close(4001, 'Unauthorized');
    return;
  }
  
  const { role, examId } = decodeToken(token);
  // 只允许该考试的教师和学生连接
});
```

### 3. 数据保护

- 视频快照自动加密存储
- 7天后自动删除监控数据
- 访问日志记录

## 部署配置

### 1. 环境变量

```env
# .env
REACT_APP_WS_URL=ws://localhost:8080
REACT_APP_WS_URL_SECURE=wss://your-domain.com
REACT_APP_TURN_SERVER=turns:turn.example.com:5349
REACT_APP_TURN_USERNAME=username
REACT_APP_TURN_CREDENTIAL=password
```

### 2. 启动服务

```bash
# 启动WebSocket服务器
node websocket-server.js

# 启动React应用
npm start
```

### 3. Nginx配置（生产环境）

```nginx
# WebSocket代理
location /user-monitoring {
    proxy_pass http://localhost:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_read_timeout 86400;
}

location /admin-monitoring {
    proxy_pass http://localhost:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_read_timeout 86400;
}
```

## 故障排查

### 问题1: 摄像头无法开启

**解决方案**:
- 检查浏览器权限
- 确保使用HTTPS（生产环境）
- 检查摄像头硬件

### 问题2: 快照不更新

**解决方案**:
- 检查WebSocket连接状态
- 查看浏览器控制台错误
- 确认服务器正常运行

### 问题3: WebRTC连接失败

**解决方案**:
- 检查STUN/TURN服务器配置
- 确认防火墙允许UDP流量
- 检查NAT类型

## 监控指标

### 系统监控

- WebSocket连接数
- 消息发送/接收速率
- 快照传输延迟
- WebRTC连接成功率
- 服务器CPU/内存使用率

### 用户体验

- 视频延迟 < 2秒
- 快照更新延迟 < 3秒
- 人脸检测准确率 > 90%
- 系统可用性 > 99%

## 总结

通过本实现方案，系统能够：

1. ✅ 实时采集学生端摄像头画面
2. ✅ 自动进行人脸检测和行为分析
3. ✅ 支持快照模式（低带宽）
4. ✅ 支持实时流模式（低延迟）
5. ✅ 教师端实时查看所有学生状态
6. ✅ 异常行为自动告警
7. ✅ 监控数据安全存储

这套方案既保证了监控的实时性，又考虑了带宽和性能的平衡，适合大规模在线考试使用。

