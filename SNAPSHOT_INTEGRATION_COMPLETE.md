# 快照保存功能 - 完整集成文档

## ✅ 已完成的工作

### 1. 前端代码 ✅

#### 接口定义
- ✅ `src/server/index.ts` - 添加快照相关API
- ✅ `src/interface/monitoringFace.ts` - TypeScript类型定义
- ✅ `src/actions/monitoring.ts` - Action函数

#### 监控Hook
- ✅ `src/hooks/useScreenMonitoring.ts` - 已实现拍照和发送功能

### 2. WebSocket服务器 ✅

- ✅ `websocket-server.js` - 已集成快照处理逻辑
  - ✅ 接收快照消息
  - ✅ 智能存储策略（每10次保存1次）
  - ✅ 异常检测（人脸消失时立即保存）
  - ✅ HTTP API调用
  - ✅ 失败重试机制

### 3. 辅助文件 ✅

- ✅ `websocket-snapshot-handler.js` - 独立的快照处理模块（可选）
- ✅ `test-snapshot-api.js` - API测试脚本
- ✅ `env.example` - 环境配置示例

### 4. 文档 ✅

- ✅ `SNAPSHOT_API_IMPLEMENTATION.md` - 实现方案
- ✅ `SNAPSHOT_INTEGRATION_GUIDE.md` - 集成指南
- ✅ `SNAPSHOT_FREQUENCY_GUIDE.md` - 频率配置指南
- ✅ `SNAPSHOT_COMPLETE_FLOW.md` - 完整调用链路
- ✅ `SNAPSHOT_INTEGRATION_COMPLETE.md` - 本文档

---

## 🚀 快速开始

### 步骤1：配置环境变量

创建 `.env` 文件（或使用环境变量）：

```bash
# 后端API地址
BACKEND_API_URL=http://localhost:8080/api
```

### 步骤2：启动服务

```bash
# 1. 启动WebSocket服务器
node websocket-server.js

# 2. 启动前端（另一个终端）
npm start

# 3. 启动后端服务器（Java Spring Boot）
# cd backend && mvn spring-boot:run
```

### 步骤3：测试API

```bash
# 测试快照API是否正常
node test-snapshot-api.js

# 运行压力测试
node test-snapshot-api.js --stress
```

---

## 📊 完整调用链路

```
┌─────────────────────────────────────────────────────────────┐
│ 1. 学生端浏览器                                              │
│    useScreenMonitoring Hook                                 │
│    ├─ 每2秒执行 captureAndSendPhoto()                       │
│    ├─ 拍摄快照，转换为base64                                │
│    └─ WebSocket.send({type: 'user_photo', ...})            │
└─────────────────────────────────────────────────────────────┘
                         ↓ WebSocket
┌─────────────────────────────────────────────────────────────┐
│ 2. WebSocket服务器 (websocket-server.js)                    │
│    ├─ 接收消息: case 'user_photo'                           │
│    ├─ 调用: handleUserPhoto(clientInfo, data)              │
│    ├─ 策略判断: decideSaveSnapshot()                        │
│    │   ├─ 异常时: 立即保存 ✅                               │
│    │   ├─ 第10次: 定期保存 ✅                               │
│    │   └─ 其他: 跳过 ⏭️                                     │
│    └─ HTTP调用: saveSnapshotToBackend()                    │
└─────────────────────────────────────────────────────────────┘
                         ↓ HTTP POST
┌─────────────────────────────────────────────────────────────┐
│ 3. 后端服务器 (Java Spring Boot)                            │
│    POST /api/monitoring/saveSnapshots                       │
│    ├─ MonitoringController.saveSnapshot()                  │
│    ├─ MonitoringService.saveSnapshot()                     │
│    ├─ ExamMonitoringSnapshotsRepository.save()             │
│    └─ 返回: {success: true, data: {id: 12345}}             │
└─────────────────────────────────────────────────────────────┘
                         ↓ SQL INSERT
┌─────────────────────────────────────────────────────────────┐
│ 4. 数据库 (MySQL)                                            │
│    INSERT INTO exam_monitoring_snapshots (...)              │
│    VALUES (...)                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 存储策略

### 当前策略（智能存储）

```javascript
function decideSaveSnapshot(clientInfo, data) {
  // 策略1：异常时必存
  if (!data.metadata?.faceDetected || !data.metadata?.userPresent) {
    return true; // 立即保存
  }
  
  // 策略2：定期保存（每10次，即20秒）
  if (clientInfo.snapshotCount % 10 === 0) {
    return true; // 定期保存
  }
  
  return false; // 其他情况跳过
}
```

### 效果对比

| 策略 | 快照数/小时 | 数据量/人/小时 | 节省比例 |
|------|------------|---------------|---------|
| 全量存储 | 1,800张 | 180MB | 0% |
| 智能存储 | ~200张 | ~20MB | **89%** ✅ |

---

## 📝 后端需要实现的接口

### 1. 保存快照 ⭐ 必须

```java
@PostMapping("/api/monitoring/saveSnapshots")
public ApiResponse<Long> saveSnapshot(@RequestBody SaveSnapshotRequest request)
```

**请求体**：
```json
{
  "examId": 1001,
  "userId": 2022001,
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

**响应**：
```json
{
  "success": true,
  "code": 200,
  "message": "快照保存成功",
  "data": 12345
}
```

### 2. 批量保存快照（可选）

```java
@PostMapping("/api/monitoring/snapshots/batch")
public ApiResponse<Integer> batchSaveSnapshots(@RequestBody List<SaveSnapshotRequest> requests)
```

### 3. 获取快照列表（可选）

```java
@GetMapping("/api/monitoring/snapshots")
public ApiResponse<List<SnapshotResponse>> getSnapshots(
    @RequestParam Long examId,
    @RequestParam Long userId
)
```

---

## 🧪 测试

### 1. 单元测试

```bash
# 测试快照API
node test-snapshot-api.js
```

**预期输出**：
```
============================================================
快照API测试脚本
============================================================
后端API地址: http://localhost:8080/api

📝 测试1: 保存单个快照
------------------------------------------------------------
发送请求...
POST http://localhost:8080/api/monitoring/saveSnapshots
✅ 测试通过!
响应状态: 200
响应数据: {
  "success": true,
  "code": 200,
  "message": "快照保存成功",
  "data": 12345
}
```

### 2. 集成测试

```bash
# 1. 启动所有服务
node websocket-server.js &
npm start &

# 2. 打开浏览器，进入考试页面

# 3. 查看WebSocket日志
# 应该看到：
# 📸 收到用户 2022001 的快照数据
# ✅ 保存原因: 定期保存 (第10次)
# 💾 准备保存快照到数据库
# ✅ 快照保存成功
```

### 3. 数据库验证

```sql
-- 查询最近保存的快照
SELECT 
    id,
    exam_id,
    user_id,
    face_detected,
    user_present,
    image_width,
    image_height,
    SUBSTRING(snapshot_data, 1, 50) as snapshot_preview,
    captured_at,
    created_at
FROM exam_monitoring_snapshots
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🔍 故障排查

### 问题1：WebSocket日志显示"无响应"

**原因**：后端服务器未启动或API地址错误

**解决**：
```bash
# 1. 检查后端是否运行
curl http://localhost:8080/api/monitoring/saveSnapshots

# 2. 检查环境变量
echo $BACKEND_API_URL

# 3. 修改配置
export BACKEND_API_URL=http://localhost:8080/api
```

### 问题2：快照未保存到数据库

**原因**：表结构未创建

**解决**：
```sql
-- 执行建表SQL
source entry/sqlDDL/monitoring_tables.sql;

-- 验证表是否存在
SHOW TABLES LIKE 'exam_monitoring_snapshots';
```

### 问题3：图片数据过大

**原因**：base64数据超过数据库字段限制

**解决**：
```sql
-- 修改字段类型
ALTER TABLE exam_monitoring_snapshots 
MODIFY COLUMN snapshot_data LONGTEXT;
```

---

## 📈 性能优化建议

### 1. 使用OSS存储图片

**优点**：
- ✅ 减少数据库压力
- ✅ 降低存储成本
- ✅ 加快加载速度

**实现**：
```javascript
// 在 websocket-server.js 中
const snapshotUrl = await uploadToOSS(data.image, examId, userId, timestamp);
snapshotData.snapshotUrl = snapshotUrl;
snapshotData.snapshotData = null; // 不存base64
```

### 2. 定期清理过期快照

```sql
-- 删除7天前的快照
DELETE FROM exam_monitoring_snapshots 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 7 DAY);
```

### 3. 添加索引

```sql
-- 优化查询性能
CREATE INDEX idx_exam_user_time ON exam_monitoring_snapshots(exam_id, user_id, captured_at);
CREATE INDEX idx_face_detected ON exam_monitoring_snapshots(face_detected);
```

---

## 📋 检查清单

### 前端
- [x] `src/server/index.ts` - API定义
- [x] `src/interface/monitoringFace.ts` - 类型定义
- [x] `src/actions/monitoring.ts` - Action函数
- [x] `src/hooks/useScreenMonitoring.ts` - 拍照发送

### WebSocket服务器
- [x] `websocket-server.js` - 集成快照处理
- [x] 引入axios依赖
- [x] 配置BACKEND_API_URL
- [x] 实现handleUserPhoto函数
- [x] 实现decideSaveSnapshot策略
- [x] 实现saveSnapshotToBackend函数
- [x] 实现失败重试机制

### 后端（需要实现）
- [ ] Controller - MonitoringController
- [ ] Service - MonitoringService
- [ ] Repository - ExamMonitoringSnapshotsRepository
- [ ] DTO - SaveSnapshotRequest
- [ ] DTO - SnapshotResponse
- [ ] DTO - ApiResponse

### 数据库
- [ ] 创建表 exam_monitoring_snapshots
- [ ] 创建索引
- [ ] 配置定期清理任务

---

## 🎉 总结

### 已完成 ✅

1. ✅ 前端完整实现（拍照、发送、类型定义）
2. ✅ WebSocket服务器集成（接收、处理、转发）
3. ✅ 智能存储策略（节省89%空间）
4. ✅ 失败重试机制
5. ✅ 完整文档和测试脚本

### 待完成 ⏳

1. ⏳ 后端Java代码实现
2. ⏳ 数据库表创建
3. ⏳ 生产环境部署

### 关键特性

- 🎯 **智能存储**：只保存必要的快照，节省89%空间
- 🔄 **自动重试**：失败时保存到本地，可后续重试
- 📊 **完整日志**：每步都有详细日志，便于调试
- 🚀 **高性能**：异步处理，不阻塞考试流程
- 🛡️ **容错性强**：网络失败不影响考试进行

---

## 📞 联系支持

如有问题，请查看：
- `SNAPSHOT_COMPLETE_FLOW.md` - 完整调用链路
- `SNAPSHOT_INTEGRATION_GUIDE.md` - 集成指南
- `test-snapshot-api.js` - 测试脚本

**所有代码已准备就绪，可以直接使用！** 🎉

