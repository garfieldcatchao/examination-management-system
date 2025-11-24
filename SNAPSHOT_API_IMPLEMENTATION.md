# 快照接口调用实现方案

## 📋 需求分析

### 数据库字段
```sql
- exam_id: 考试ID
- user_id: 用户ID
- snapshot_url: 图片URL（OSS存储）
- snapshot_data: base64数据（可选）
- snapshot_size: 图片大小
- face_detected: 是否检测到人脸
- face_confidence: 人脸置信度
- user_present: 用户是否在座
- image_width: 图片宽度
- image_height: 图片高度
- image_quality: 图片质量
- captured_at: 拍摄时间
```

---

## 🎯 接口调用位置

### 方案对比

| 位置 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **WebSocket服务器** | 集中处理，减少前端负担 | 服务器压力大 | ⭐⭐⭐⭐⭐ |
| **前端Hook** | 实时性好，灵活 | 前端负担重 | ⭐⭐⭐ |
| **混合方案** | 平衡性能和灵活性 | 实现复杂 | ⭐⭐⭐⭐ |

---

## 🏆 推荐方案：WebSocket服务器处理

### 架构流程

```
┌─────────────────────────────────────────────────────────────┐
│ 学生端（前端）                                               │
├─────────────────────────────────────────────────────────────┤
│ 1. useScreenMonitoring Hook                                 │
│    ├─ captureAndSendPhoto() 每2秒执行                       │
│    ├─ 拍摄快照，转换为base64                                │
│    └─ 通过WebSocket发送                                     │
│        {                                                     │
│          type: "user_photo",                                │
│          data: {                                             │
│            examId, userId, timestamp,                       │
│            image: "data:image/jpeg;base64,...",             │
│            metadata: { width, height, quality, ... }        │
│          }                                                   │
│        }                                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓ WebSocket
┌─────────────────────────────────────────────────────────────┐
│ WebSocket服务器（websocket-server.js）                      │
├─────────────────────────────────────────────────────────────┤
│ 2. 接收快照消息                                              │
│    ├─ 解析base64数据                                         │
│    ├─ 可选：上传到OSS获取URL                                │
│    └─ 调用后端API保存到数据库                               │
│        POST /api/monitoring/snapshots                       │
│        {                                                     │
│          examId, userId,                                     │
│          snapshotUrl, snapshotData,                         │
│          faceDetected, userPresent,                         │
│          imageWidth, imageHeight, ...                       │
│        }                                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP API
┌─────────────────────────────────────────────────────────────┐
│ 后端服务器（Java Spring Boot）                              │
├─────────────────────────────────────────────────────────────┤
│ 3. 保存快照到数据库                                          │
│    ├─ Controller: MonitoringController                      │
│    ├─ Service: MonitoringService                            │
│    └─ Repository: ExamMonitoringSnapshotsRepository         │
│        INSERT INTO exam_monitoring_snapshots (...)          │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 具体实现

### 1. 前端接口定义

#### 文件：`src/server/index.ts`

```typescript
// 在 api 对象中添加 monitoring 部分
export const api = {
  // ... 其他接口

  monitoring: {
    // 获取监控信息
    getMonitoringInfo: () => http.get(`/monitoring/students`),
    
    // 保存快照（新增）
    saveSnapshot: (data: SaveSnapshotRequest) => 
      http.post(`/monitoring/snapshots`, data),
    
    // 批量保存快照（可选，用于离线重传）
    batchSaveSnapshots: (data: SaveSnapshotRequest[]) => 
      http.post(`/monitoring/snapshots/batch`, data),
    
    // 获取学生快照列表
    getSnapshots: (params: { examId: string; userId: string }) => 
      http.get(`/monitoring/snapshots`, params),
    
    // 删除过期快照
    deleteExpiredSnapshots: (days: number) => 
      http.delete(`/monitoring/snapshots/expired/${days}`),
  },
};
```

#### 文件：`src/interface/monitoringFace.ts`（新建）

```typescript
/**
 * 监控相关接口定义
 */

// 保存快照请求
export interface SaveSnapshotRequest {
  examId: number;
  userId: number;
  snapshotUrl?: string;          // 图片URL（如果已上传OSS）
  snapshotData?: string;         // base64数据（可选）
  snapshotSize?: number;         // 图片大小（字节）
  faceDetected: boolean;         // 是否检测到人脸
  faceConfidence?: number;       // 人脸置信度 0-1
  userPresent: boolean;          // 用户是否在座
  imageWidth: number;            // 图片宽度
  imageHeight: number;           // 图片高度
  imageQuality: number;          // 图片质量 0-1
  capturedAt: string;            // 拍摄时间 ISO格式
}

// 快照响应
export interface SnapshotResponse {
  id: number;
  examId: number;
  userId: number;
  snapshotUrl: string;
  faceDetected: boolean;
  userPresent: boolean;
  capturedAt: string;
  createdAt: string;
}

// 快照列表响应
export interface SnapshotListResponse {
  total: number;
  snapshots: SnapshotResponse[];
}
```

---

### 2. WebSocket服务器处理

#### 文件：`websocket-server.js`

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// 后端API地址
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8080/api';

// 处理用户照片数据（修改现有函数）
async function handleUserPhoto(clientInfo, data) {
  try {
    const timestamp = new Date().getTime();
    
    // 1. 保存照片元数据到本地（可选，用于调试）
    const filename = `user_photo_${clientInfo.examId}_${clientInfo.userId}_${timestamp}.json`;
    const filepath = path.join(monitoringDir, filename);
    
    const photoData = {
      examId: data.examId,
      userId: data.userId,
      timestamp: data.timestamp,
      metadata: data.metadata,
      imageSize: data.image ? data.image.length : 0,
      receivedAt: Date.now(),
    };
    
    fs.writeFileSync(filepath, JSON.stringify(photoData, null, 2));
    console.log(`照片元数据已保存: ${filename}`);
    
    // 2. 更新客户端信息
    clientInfo.faceDetected = data.metadata.faceDetected;
    clientInfo.userPresent = data.metadata.userPresent;
    clientInfo.lastActivity = new Date();
    
    // 3. 检查异常行为
    if (!data.metadata.faceDetected) {
      const alertMessage = '检测到人脸消失';
      clientInfo.behaviorAlerts.push({
        warningType: 'face_lost',
        message: alertMessage,
      });
      sendBehaviorAlert(clientInfo, alertMessage);
    }
    
    // 4. 决定是否保存到数据库
    const shouldSave = decideSaveSnapshot(clientInfo, data);
    
    if (shouldSave) {
      // 5. 调用后端API保存快照
      await saveSnapshotToBackend(data);
    }
    
  } catch (error) {
    console.error('处理用户照片数据失败:', error);
  }
}

// 决定是否保存快照
function decideSaveSnapshot(clientInfo, data) {
  // 策略1：每10次保存一次（降低存储压力）
  if (!clientInfo.snapshotCount) {
    clientInfo.snapshotCount = 0;
  }
  clientInfo.snapshotCount++;
  
  // 策略2：检测到异常时必须保存
  if (!data.metadata.faceDetected || !data.metadata.userPresent) {
    return true;
  }
  
  // 策略3：定期保存（每10次，即每20秒保存一次，如果间隔是2秒）
  if (clientInfo.snapshotCount % 10 === 0) {
    return true;
  }
  
  return false;
}

// 保存快照到后端
async function saveSnapshotToBackend(data) {
  try {
    // 方案A：直接保存base64数据
    const snapshotData = {
      examId: parseInt(data.examId),
      userId: parseInt(data.userId),
      snapshotData: data.image,  // base64数据
      snapshotSize: data.image ? data.image.length : 0,
      faceDetected: data.metadata.faceDetected,
      faceConfidence: data.metadata.faceDetected ? 0.85 : 0, // 简化处理
      userPresent: data.metadata.userPresent,
      imageWidth: data.metadata.width,
      imageHeight: data.metadata.height,
      imageQuality: data.metadata.quality,
      capturedAt: new Date(data.timestamp).toISOString(),
    };
    
    // 调用后端API
    const response = await axios.post(
      `${BACKEND_API_URL}/monitoring/snapshots`,
      snapshotData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10秒超时
      }
    );
    
    console.log(`快照已保存到数据库: 用户${data.userId}, 响应:`, response.data);
    return response.data;
    
  } catch (error) {
    console.error('保存快照到后端失败:', error.message);
    
    // 失败时保存到本地文件，后续可以重试
    saveFailedSnapshot(data);
  }
}

// 保存失败的快照到本地（用于重试）
function saveFailedSnapshot(data) {
  const failedDir = path.join(__dirname, 'failed-snapshots');
  if (!fs.existsSync(failedDir)) {
    fs.mkdirSync(failedDir, { recursive: true });
  }
  
  const filename = `failed_${data.userId}_${Date.now()}.json`;
  const filepath = path.join(failedDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log(`失败的快照已保存到本地: ${filename}`);
}

// 可选：上传图片到OSS
async function uploadToOSS(base64Data, examId, userId, timestamp) {
  // 这里需要根据你使用的OSS服务实现
  // 示例：阿里云OSS
  
  try {
    const OSS = require('ali-oss');
    const client = new OSS({
      region: process.env.OSS_REGION,
      accessKeyId: process.env.OSS_ACCESS_KEY_ID,
      accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
      bucket: process.env.OSS_BUCKET,
    });
    
    // 将base64转换为Buffer
    const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Image, 'base64');
    
    // 生成文件路径
    const filename = `exam-snapshots/${examId}/${userId}/${timestamp}.jpg`;
    
    // 上传到OSS
    const result = await client.put(filename, buffer);
    
    console.log(`图片已上传到OSS: ${result.url}`);
    return result.url;
    
  } catch (error) {
    console.error('上传到OSS失败:', error);
    return null;
  }
}

// 修改后的完整处理流程
async function handleUserPhotoWithOSS(clientInfo, data) {
  try {
    // 1. 上传到OSS（可选）
    const snapshotUrl = await uploadToOSS(
      data.image, 
      data.examId, 
      data.userId, 
      data.timestamp
    );
    
    // 2. 准备保存数据
    const snapshotData = {
      examId: parseInt(data.examId),
      userId: parseInt(data.userId),
      snapshotUrl: snapshotUrl,  // OSS URL
      snapshotData: snapshotUrl ? null : data.image, // 如果有URL就不存base64
      snapshotSize: data.image ? data.image.length : 0,
      faceDetected: data.metadata.faceDetected,
      faceConfidence: data.metadata.faceDetected ? 0.85 : 0,
      userPresent: data.metadata.userPresent,
      imageWidth: data.metadata.width,
      imageHeight: data.metadata.height,
      imageQuality: data.metadata.quality,
      capturedAt: new Date(data.timestamp).toISOString(),
    };
    
    // 3. 保存到数据库
    await saveSnapshotToBackend(snapshotData);
    
  } catch (error) {
    console.error('处理快照失败:', error);
  }
}

module.exports = {
  handleUserPhoto,
  handleUserPhotoWithOSS,
  saveSnapshotToBackend,
};
```

---

### 3. 前端Action（可选，用于主动调用）

#### 文件：`src/actions/monitoring.ts`

```typescript
import { api } from "../server/index";
import { SaveSnapshotRequest, SnapshotListResponse } from "../interface/monitoringFace";
import { isTrue } from "../utils";

let errorMsg = {
  success: false,
  data: null,
  message: "操作失败",
};

// 获取监控信息
export const getMonitoringInfoAction = async () => {
  const result = await api.monitoring.getMonitoringInfo();
  if (result && isTrue(result.success)) {
    return result;
  }
  return errorMsg;
};

// 保存快照（新增）
export const saveSnapshotAction = async (data: SaveSnapshotRequest) => {
  try {
    const result = await api.monitoring.saveSnapshot(data);
    if (result && isTrue(result.success)) {
      return result;
    }
    return errorMsg;
  } catch (error) {
    console.error('保存快照失败:', error);
    return errorMsg;
  }
};

// 批量保存快照（新增）
export const batchSaveSnapshotsAction = async (snapshots: SaveSnapshotRequest[]) => {
  try {
    const result = await api.monitoring.batchSaveSnapshots(snapshots);
    if (result && isTrue(result.success)) {
      return result;
    }
    return errorMsg;
  } catch (error) {
    console.error('批量保存快照失败:', error);
    return errorMsg;
  }
};

// 获取快照列表（新增）
export const getSnapshotsAction = async (examId: string, userId: string) => {
  try {
    const result = await api.monitoring.getSnapshots({ examId, userId });
    if (result && isTrue(result.success)) {
      return result;
    }
    return errorMsg;
  } catch (error) {
    console.error('获取快照列表失败:', error);
    return errorMsg;
  }
};
```

---

### 4. 前端Hook修改（可选，用于离线缓存）

#### 文件：`src/hooks/useScreenMonitoring.ts`

```typescript
// 在 captureAndSendPhoto 函数中添加离线缓存逻辑

const captureAndSendPhoto = useCallback(async () => {
  try {
    // ... 现有的拍照逻辑 ...
    
    const photoData = canvas.toDataURL('image/jpeg', finalConfig.compressionQuality);
    
    // 准备快照数据
    const snapshotData: SaveSnapshotRequest = {
      examId: parseInt(examId),
      userId: parseInt(userId),
      snapshotData: photoData,
      snapshotSize: photoData.length,
      faceDetected,
      faceConfidence: faceDetected ? 0.85 : 0,
      userPresent: faceDetected,
      imageWidth: canvas.width,
      imageHeight: canvas.height,
      imageQuality: finalConfig.compressionQuality,
      capturedAt: new Date().toISOString(),
    };
    
    // 方案1：通过WebSocket发送（推荐）
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'user_photo',
        data: {
          examId,
          userId,
          timestamp: Date.now(),
          image: photoData,
          metadata: {
            width: canvas.width,
            height: canvas.height,
            quality: finalConfig.compressionQuality,
            faceDetected,
            userPresent: faceDetected,
            videoReadyState: video.readyState,
            videoSize: `${video.videoWidth}x${video.videoHeight}`,
          }
        }
      }));
    } else {
      // 方案2：WebSocket断开时，缓存到本地
      cacheSnapshotLocally(snapshotData);
    }
    
  } catch (error) {
    console.error('拍照失败:', error);
  }
}, [examId, userId, finalConfig]);

// 缓存快照到本地（离线时使用）
const cacheSnapshotLocally = (snapshot: SaveSnapshotRequest) => {
  try {
    const cacheKey = `snapshot_cache_${examId}_${userId}`;
    const cached = localStorage.getItem(cacheKey);
    const snapshots = cached ? JSON.parse(cached) : [];
    
    // 只保留最近50张（避免localStorage溢出）
    if (snapshots.length >= 50) {
      snapshots.shift();
    }
    
    snapshots.push(snapshot);
    localStorage.setItem(cacheKey, JSON.stringify(snapshots));
    
    console.log('快照已缓存到本地，待网络恢复后上传');
  } catch (error) {
    console.error('缓存快照失败:', error);
  }
};

// 上传缓存的快照
const uploadCachedSnapshots = useCallback(async () => {
  try {
    const cacheKey = `snapshot_cache_${examId}_${userId}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) return;
    
    const snapshots = JSON.parse(cached);
    if (snapshots.length === 0) return;
    
    console.log(`准备上传${snapshots.length}张缓存的快照`);
    
    // 批量上传
    const result = await batchSaveSnapshotsAction(snapshots);
    
    if (result.success) {
      // 上传成功，清除缓存
      localStorage.removeItem(cacheKey);
      console.log('缓存的快照已上传成功');
    }
  } catch (error) {
    console.error('上传缓存快照失败:', error);
  }
}, [examId, userId]);

// 在WebSocket连接成功时上传缓存
useEffect(() => {
  if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
    uploadCachedSnapshots();
  }
}, [wsRef.current?.readyState]);
```

---

## 📊 存储策略建议

### 策略对比

| 策略 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| **全量存储** | 所有快照都存 | 完整记录 | 成本高，18GB/100人/小时 |
| **定期存储** | 每N次存一次 | 平衡成本 | 可能漏掉异常 |
| **异常存储** | 仅存异常时刻 | 成本低 | 正常时刻无记录 |
| **混合存储** | 定期+异常 | 推荐 ⭐ | 实现稍复杂 |

### 推荐：混合存储策略

```javascript
function decideSaveSnapshot(clientInfo, data) {
  // 1. 异常时必存
  if (!data.metadata.faceDetected || !data.metadata.userPresent) {
    return true;
  }
  
  // 2. 定期存储（每10次，即20秒存一次）
  if (!clientInfo.snapshotCount) clientInfo.snapshotCount = 0;
  clientInfo.snapshotCount++;
  
  if (clientInfo.snapshotCount % 10 === 0) {
    return true;
  }
  
  // 3. 答题时刻存储（需要前端发送标记）
  if (data.metadata.isAnswering) {
    return true;
  }
  
  return false;
}
```

---

## 🎯 最终推荐方案

### 实施步骤

1. **在WebSocket服务器处理**（推荐）✅
   - 修改 `websocket-server.js` 的 `handleUserPhoto` 函数
   - 添加 `saveSnapshotToBackend` 函数
   - 实现存储策略（混合存储）

2. **添加前端接口定义**
   - 修改 `src/server/index.ts`
   - 创建 `src/interface/monitoringFace.ts`

3. **可选：添加离线缓存**
   - 修改 `src/hooks/useScreenMonitoring.ts`
   - 实现本地缓存和重传机制

4. **后端实现**（需要Java开发）
   - Controller: `MonitoringController`
   - Service: `MonitoringService`
   - Repository: `ExamMonitoringSnapshotsRepository`

---

## 📝 总结

### 最佳实践

✅ **推荐在WebSocket服务器处理**
- 集中管理，减少前端负担
- 便于实现存储策略
- 统一错误处理和重试

✅ **使用混合存储策略**
- 异常时刻必存
- 定期存储（每20秒）
- 节省60-80%存储成本

✅ **考虑OSS存储**
- 数据库只存URL和元数据
- 图片存储在OSS
- 降低数据库压力

✅ **实现离线缓存**
- 网络断开时缓存到本地
- 恢复后自动上传
- 提高可靠性

