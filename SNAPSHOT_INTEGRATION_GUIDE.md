# 快照接口集成指南

## 📋 快速开始

### 1. 前端已完成的工作 ✅

- ✅ 接口定义：`src/server/index.ts`
- ✅ TypeScript类型：`src/interface/monitoringFace.ts`
- ✅ Action函数：`src/actions/monitoring.ts`
- ✅ WebSocket处理模块：`websocket-snapshot-handler.js`

### 2. 需要集成的位置

**推荐方案：在 WebSocket 服务器处理**

---

## 🔧 集成步骤

### 步骤1：修改 websocket-server.js

在现有的 `websocket-server.js` 文件中集成快照处理：

```javascript
// 在文件顶部引入快照处理模块
const { handleUserPhoto, handleUserPhotoWithOSS } = require('./websocket-snapshot-handler');

// 在 WebSocket 消息处理中调用
wss.on('connection', (ws, req) => {
  // ... 现有代码 ...
  
  ws.on('message', async (message) => {
    try {
      const parsedMessage = JSON.parse(message);
      
      switch (parsedMessage.type) {
        case 'user_photo':
          // 处理用户照片数据
          if (clientInfo) {
            // 方案A：直接保存base64到数据库
            await handleUserPhoto(clientInfo, parsedMessage.data);
            
            // 方案B：上传到OSS后保存URL（推荐）
            // await handleUserPhotoWithOSS(clientInfo, parsedMessage.data);
          }
          break;
          
        // ... 其他case ...
      }
    } catch (error) {
      console.error('处理消息失败:', error);
    }
  });
});
```

### 步骤2：配置环境变量

创建或修改 `.env` 文件：

```bash
# 后端API地址
BACKEND_API_URL=http://localhost:8080/api

# OSS配置（可选，如果使用OSS存储）
OSS_REGION=oss-cn-hangzhou
OSS_ACCESS_KEY_ID=your_access_key_id
OSS_ACCESS_KEY_SECRET=your_access_key_secret
OSS_BUCKET=exam-system-snapshots
```

### 步骤3：安装依赖

```bash
# 如果使用OSS
npm install ali-oss

# 确保已安装axios
npm install axios
```

---

## 🎯 调用位置详解

### 位置1：WebSocket服务器（推荐）⭐⭐⭐⭐⭐

**文件**：`websocket-server.js`

**时机**：收到学生端发送的 `user_photo` 消息时

**优点**：
- ✅ 集中处理，统一管理
- ✅ 减少前端负担
- ✅ 便于实现存储策略
- ✅ 统一错误处理和重试

**实现**：
```javascript
case 'user_photo':
  await handleUserPhoto(clientInfo, parsedMessage.data);
  break;
```

---

### 位置2：前端Hook（备选方案）⭐⭐⭐

**文件**：`src/hooks/useScreenMonitoring.ts`

**时机**：`captureAndSendPhoto` 函数中

**优点**：
- ✅ 实时性好
- ✅ 灵活控制

**缺点**：
- ❌ 前端负担重
- ❌ 网络断开时难处理

**实现示例**：
```typescript
const captureAndSendPhoto = useCallback(async () => {
  try {
    // ... 拍照逻辑 ...
    
    const photoData = canvas.toDataURL('image/jpeg', finalConfig.compressionQuality);
    
    // 方案1：通过WebSocket发送（推荐）
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'user_photo',
        data: { examId, userId, image: photoData, metadata: {...} }
      }));
    } else {
      // 方案2：直接调用HTTP API（备选）
      const snapshotData: SaveSnapshotRequest = {
        examId: parseInt(examId),
        userId: parseInt(userId),
        snapshotData: photoData,
        snapshotSize: photoData.length,
        faceDetected,
        userPresent: faceDetected,
        imageWidth: canvas.width,
        imageHeight: canvas.height,
        imageQuality: finalConfig.compressionQuality,
        capturedAt: new Date().toISOString(),
      };
      
      await saveSnapshotAction(snapshotData);
    }
  } catch (error) {
    console.error('拍照失败:', error);
  }
}, [examId, userId, finalConfig]);
```

---

## 📊 存储策略

### 当前实现的策略

在 `websocket-snapshot-handler.js` 中的 `decideSaveSnapshot` 函数：

```javascript
function decideSaveSnapshot(clientInfo, data) {
  // 策略1：异常时必存
  if (!data.metadata.faceDetected || !data.metadata.userPresent) {
    return true; // 保存
  }
  
  // 策略2：定期保存（每10次，即20秒）
  if (clientInfo.snapshotCount % 10 === 0) {
    return true; // 保存
  }
  
  // 其他情况不保存
  return false;
}
```

### 自定义策略

你可以根据需求修改策略：

```javascript
// 策略A：全量存储（所有快照都存）
function decideSaveSnapshot() {
  return true; // 始终保存
}

// 策略B：仅异常存储
function decideSaveSnapshot(clientInfo, data) {
  return !data.metadata.faceDetected || !data.metadata.userPresent;
}

// 策略C：智能存储（根据考试重要性）
function decideSaveSnapshot(clientInfo, data) {
  const examLevel = getExamLevel(data.examId); // 获取考试级别
  
  if (examLevel === 'critical') {
    return true; // 重要考试全量存储
  } else if (examLevel === 'important') {
    return clientInfo.snapshotCount % 5 === 0; // 每10秒存一次
  } else {
    return clientInfo.snapshotCount % 15 === 0; // 每30秒存一次
  }
}
```

---

## 🔄 数据流示意图

```
┌────────────────────────────────────────────────────────────┐
│ 学生端浏览器                                                │
│                                                             │
│ useScreenMonitoring Hook                                   │
│ ├─ setInterval(captureAndSendPhoto, 2000)                 │
│ ├─ 拍摄快照 → base64                                       │
│ └─ WebSocket.send({type: 'user_photo', data: {...}})      │
└────────────────────────────────────────────────────────────┘
                         ↓ WebSocket
┌────────────────────────────────────────────────────────────┐
│ WebSocket服务器 (websocket-server.js)                      │
│                                                             │
│ ws.on('message', async (message) => {                      │
│   if (message.type === 'user_photo') {                     │
│     // 调用处理函数                                         │
│     await handleUserPhoto(clientInfo, message.data);       │
│   }                                                         │
│ })                                                          │
└────────────────────────────────────────────────────────────┘
                         ↓
┌────────────────────────────────────────────────────────────┐
│ websocket-snapshot-handler.js                              │
│                                                             │
│ handleUserPhoto(clientInfo, data) {                        │
│   // 1. 更新状态                                            │
│   clientInfo.faceDetected = data.metadata.faceDetected;   │
│                                                             │
│   // 2. 检查是否需要保存                                    │
│   if (decideSaveSnapshot(clientInfo, data)) {             │
│     // 3. 调用后端API                                       │
│     await saveSnapshotToBackend(data);                    │
│   }                                                         │
│ }                                                           │
└────────────────────────────────────────────────────────────┘
                         ↓ HTTP POST
┌────────────────────────────────────────────────────────────┐
│ 后端服务器 (Java Spring Boot)                              │
│                                                             │
│ POST /api/monitoring/snapshots                             │
│ {                                                           │
│   examId: 1001,                                            │
│   userId: 2022001,                                         │
│   snapshotData: "data:image/jpeg;base64,...",             │
│   faceDetected: true,                                      │
│   ...                                                       │
│ }                                                           │
│                                                             │
│ ↓                                                           │
│ MonitoringController                                       │
│ ↓                                                           │
│ MonitoringService                                          │
│ ↓                                                           │
│ ExamMonitoringSnapshotsRepository                          │
│ ↓                                                           │
│ INSERT INTO exam_monitoring_snapshots (...)                │
└────────────────────────────────────────────────────────────┘
```

---

## 🧪 测试

### 1. 测试WebSocket处理

```bash
# 启动WebSocket服务器
node websocket-server.js

# 查看日志输出
# 应该看到：
# ✅ 快照保存成功: ID=123
# 或
# ❌ 保存快照到后端失败: ...
```

### 2. 测试失败重试

```bash
# 查看失败的快照
ls -la failed-snapshots/

# 手动重试
node websocket-snapshot-handler.js
```

### 3. 测试前端调用

在浏览器控制台：

```javascript
// 测试保存快照
import { saveSnapshotAction } from './actions/monitoring';

const testSnapshot = {
  examId: 1001,
  userId: 2022001,
  snapshotData: "data:image/jpeg;base64,/9j/4AAQ...",
  snapshotSize: 85000,
  faceDetected: true,
  userPresent: true,
  imageWidth: 640,
  imageHeight: 480,
  imageQuality: 0.7,
  capturedAt: new Date().toISOString(),
};

saveSnapshotAction(testSnapshot).then(result => {
  console.log('保存结果:', result);
});
```

---

## 📝 后端API要求

### 接口1：保存单个快照

**URL**: `POST /api/monitoring/snapshots`

**请求体**:
```json
{
  "examId": 1001,
  "userId": 2022001,
  "snapshotUrl": "https://oss.example.com/...",
  "snapshotData": "data:image/jpeg;base64,...",
  "snapshotSize": 85000,
  "faceDetected": true,
  "faceConfidence": 0.85,
  "userPresent": true,
  "imageWidth": 640,
  "imageHeight": 480,
  "imageQuality": 0.7,
  "capturedAt": "2024-01-10T10:30:15.000Z"
}
```

**响应**:
```json
{
  "success": true,
  "code": 200,
  "message": "快照保存成功",
  "data": {
    "id": 12345,
    "examId": 1001,
    "userId": 2022001,
    "createdAt": "2024-01-10T10:30:16.000Z"
  }
}
```

### 接口2：批量保存快照

**URL**: `POST /api/monitoring/snapshots/batch`

**请求体**:
```json
{
  "snapshots": [
    { /* 快照1 */ },
    { /* 快照2 */ },
    // ...
  ]
}
```

### 接口3：获取快照列表

**URL**: `GET /api/monitoring/snapshots?examId=1001&userId=2022001`

**响应**:
```json
{
  "success": true,
  "data": {
    "total": 720,
    "snapshots": [
      {
        "id": 12345,
        "examId": 1001,
        "userId": 2022001,
        "snapshotUrl": "https://...",
        "faceDetected": true,
        "capturedAt": "2024-01-10T10:30:15.000Z"
      }
    ]
  }
}
```

---

## ⚠️ 注意事项

### 1. 数据量控制

- ✅ 使用存储策略，不要全量存储
- ✅ 定期清理过期快照
- ✅ 考虑使用OSS存储图片

### 2. 性能优化

- ✅ 异步处理，不阻塞WebSocket
- ✅ 失败时保存到本地，避免丢失
- ✅ 批量上传离线缓存

### 3. 安全性

- ✅ 验证examId和userId
- ✅ 限制图片大小（< 5MB）
- ✅ 防止恶意上传

### 4. 错误处理

- ✅ 网络错误时重试
- ✅ 后端错误时记录日志
- ✅ 超时处理（15秒）

---

## 🎯 总结

### 推荐方案

**在 WebSocket 服务器处理**：

1. ✅ 修改 `websocket-server.js`
2. ✅ 引入 `websocket-snapshot-handler.js`
3. ✅ 在 `user_photo` 消息处理中调用 `handleUserPhoto`
4. ✅ 配置环境变量
5. ✅ 实现后端API

### 关键代码

```javascript
// websocket-server.js
const { handleUserPhoto } = require('./websocket-snapshot-handler');

case 'user_photo':
  await handleUserPhoto(clientInfo, parsedMessage.data);
  break;
```

### 数据流

```
学生端 → WebSocket → 快照处理模块 → 后端API → 数据库
```

所有代码已准备就绪，只需集成到 `websocket-server.js` 即可！

