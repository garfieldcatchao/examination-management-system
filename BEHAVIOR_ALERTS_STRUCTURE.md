# behaviorAlerts 数据内容详解

## 📋 概述

`behaviorAlerts` 是考试监控系统中记录学生异常行为的数据结构，用于追踪和警告可能的作弊或违规行为。

---

## 🔍 数据来源

### 1. WebSocket 消息中的 behaviorAlerts

在 WebSocket 返回的学生列表中：

```json
{
  "type": "student_list",
  "data": {
    "students": [
      {
        "userId": "2022001",
        "examId": "exam-001",
        "faceDetected": true,
        "userPresent": true,
        "lastActivity": "2024-01-10T10:30:00.000Z",
        "behaviorAlerts": [
          {
            "warningType": "page_visibility_change",
            "message": "检测到窗口切换或最小化"
          },
          {
            "warningType": "face_lost",
            "message": "检测到人脸消失超过10秒"
          }
        ]
      }
    ]
  }
}
```

### 2. 数据库中的 exam_behavior_logs 表

完整的行为日志存储在数据库中，包含更详细的信息。

---

## 📊 behaviorAlerts 数据结构

### 基础结构（WebSocket简化版）

```typescript
interface BehaviorAlert {
  warningType: string;      // 警告类型代码
  message: string;          // 警告消息（中文描述）
}
```

### 完整结构（数据库版）

```typescript
interface ExamBehaviorLog {
  id: number;                      // 日志ID
  examId: number;                  // 考试ID
  userId: number;                  // 用户ID
  
  // 行为分类
  behaviorType: string;            // 行为类型: "normal" | "warning" | "violation"
  behaviorCode: string;            // 行为代码（见下方详细列表）
  
  // 行为描述
  behaviorMessage: string;         // 行为消息（中文）
  behaviorData: object;            // 行为详细数据（JSON）
  
  // 严重程度
  severity: string;                // 严重程度: "low" | "medium" | "high"
  
  // 审核相关
  requiresReview: boolean;         // 是否需要人工审核
  reviewed: boolean;               // 是否已审核
  reviewedBy: number;              // 审核人ID
  reviewedAt: Date;                // 审核时间
  reviewResult: string;            // 审核结果
  
  // 时间
  occurredAt: Date;                // 发生时间
  createdAt: Date;                 // 记录创建时间
}
```

---

## 🚨 behaviorCode（行为代码）完整列表

### 1. 窗口/标签页相关

#### `tab_switch` - 切换标签页
```json
{
  "behaviorCode": "tab_switch",
  "behaviorType": "warning",
  "behaviorMessage": "检测到切换到其他标签页",
  "severity": "medium",
  "behaviorData": {
    "switchCount": 3,
    "duration": 5000,
    "timestamp": "2024-01-10T10:30:15.000Z"
  }
}
```

#### `page_visibility_change` - 窗口可见性变化
```json
{
  "behaviorCode": "page_visibility_change",
  "behaviorType": "warning",
  "behaviorMessage": "检测到窗口切换或最小化",
  "severity": "medium",
  "behaviorData": {
    "hidden": true,
    "duration": 3000
  }
}
```

#### `window_blur` - 窗口失去焦点
```json
{
  "behaviorCode": "window_blur",
  "behaviorType": "warning",
  "behaviorMessage": "考试窗口失去焦点",
  "severity": "low",
  "behaviorData": {
    "blurCount": 2,
    "timestamp": "2024-01-10T10:30:15.000Z"
  }
}
```

#### `fullscreen_exit` - 退出全屏
```json
{
  "behaviorCode": "fullscreen_exit",
  "behaviorType": "warning",
  "behaviorMessage": "退出全屏模式",
  "severity": "high",
  "behaviorData": {
    "exitCount": 1,
    "timestamp": "2024-01-10T10:30:15.000Z"
  }
}
```

---

### 2. 摄像头/人脸相关

#### `face_lost` - 人脸丢失
```json
{
  "behaviorCode": "face_lost",
  "behaviorType": "warning",
  "behaviorMessage": "检测到人脸消失超过10秒",
  "severity": "high",
  "behaviorData": {
    "duration": 12000,
    "lastDetectedAt": "2024-01-10T10:29:45.000Z",
    "detectedAt": "2024-01-10T10:30:00.000Z"
  }
}
```

#### `user_absent` - 用户离座
```json
{
  "behaviorCode": "user_absent",
  "behaviorType": "violation",
  "behaviorMessage": "用户离开座位超过30秒",
  "severity": "high",
  "behaviorData": {
    "duration": 35000,
    "startTime": "2024-01-10T10:29:30.000Z",
    "endTime": "2024-01-10T10:30:05.000Z"
  }
}
```

#### `camera_off` - 摄像头关闭
```json
{
  "behaviorCode": "camera_off",
  "behaviorType": "violation",
  "behaviorMessage": "摄像头被关闭",
  "severity": "high",
  "behaviorData": {
    "offDuration": 5000,
    "timestamp": "2024-01-10T10:30:15.000Z"
  }
}
```

#### `multiple_faces` - 检测到多个人脸
```json
{
  "behaviorCode": "multiple_faces",
  "behaviorType": "violation",
  "behaviorMessage": "检测到多个人脸，可能有他人协助",
  "severity": "high",
  "behaviorData": {
    "faceCount": 2,
    "confidence": 0.92,
    "timestamp": "2024-01-10T10:30:15.000Z"
  }
}
```

#### `face_mismatch` - 人脸不匹配
```json
{
  "behaviorCode": "face_mismatch",
  "behaviorType": "violation",
  "behaviorMessage": "检测到的人脸与注册照片不匹配",
  "severity": "high",
  "behaviorData": {
    "similarity": 0.45,
    "threshold": 0.70,
    "timestamp": "2024-01-10T10:30:15.000Z"
  }
}
```

---

### 3. 行为异常相关

#### `inactivity` - 长时间无活动
```json
{
  "behaviorCode": "inactivity",
  "behaviorType": "warning",
  "behaviorMessage": "超过5分钟无任何操作",
  "severity": "low",
  "behaviorData": {
    "inactiveDuration": 300000,
    "lastActivityType": "answer_question",
    "lastActivityTime": "2024-01-10T10:25:00.000Z"
  }
}
```

#### `rapid_answering` - 快速答题
```json
{
  "behaviorCode": "rapid_answering",
  "behaviorType": "warning",
  "behaviorMessage": "答题速度异常快，可能存在作弊",
  "severity": "medium",
  "behaviorData": {
    "questionsAnswered": 10,
    "timeSpent": 30000,
    "averageTimePerQuestion": 3000
  }
}
```

#### `copy_paste_detected` - 检测到复制粘贴
```json
{
  "behaviorCode": "copy_paste_detected",
  "behaviorType": "warning",
  "behaviorMessage": "检测到复制粘贴操作",
  "severity": "medium",
  "behaviorData": {
    "pasteCount": 3,
    "questionId": 15,
    "timestamp": "2024-01-10T10:30:15.000Z"
  }
}
```

---

### 4. 网络/设备相关

#### `network_disconnected` - 网络断开
```json
{
  "behaviorCode": "network_disconnected",
  "behaviorType": "warning",
  "behaviorMessage": "网络连接中断",
  "severity": "medium",
  "behaviorData": {
    "disconnectDuration": 15000,
    "reconnectedAt": "2024-01-10T10:30:30.000Z"
  }
}
```

#### `screen_recording_detected` - 检测到屏幕录制
```json
{
  "behaviorCode": "screen_recording_detected",
  "behaviorType": "violation",
  "behaviorMessage": "检测到屏幕录制软件",
  "severity": "high",
  "behaviorData": {
    "softwareName": "OBS Studio",
    "timestamp": "2024-01-10T10:30:15.000Z"
  }
}
```

#### `devtools_opened` - 打开开发者工具
```json
{
  "behaviorCode": "devtools_opened",
  "behaviorType": "violation",
  "behaviorMessage": "检测到打开浏览器开发者工具",
  "severity": "high",
  "behaviorData": {
    "timestamp": "2024-01-10T10:30:15.000Z"
  }
}
```

---

### 5. 正常行为

#### `exam_started` - 开始考试
```json
{
  "behaviorCode": "exam_started",
  "behaviorType": "normal",
  "behaviorMessage": "学生开始考试",
  "severity": "low",
  "behaviorData": {
    "startTime": "2024-01-10T10:00:00.000Z"
  }
}
```

#### `answer_submitted` - 提交答案
```json
{
  "behaviorCode": "answer_submitted",
  "behaviorType": "normal",
  "behaviorMessage": "提交题目答案",
  "severity": "low",
  "behaviorData": {
    "questionId": 5,
    "timeSpent": 120000
  }
}
```

#### `exam_completed` - 完成考试
```json
{
  "behaviorCode": "exam_completed",
  "behaviorType": "normal",
  "behaviorMessage": "学生完成考试并提交",
  "severity": "low",
  "behaviorData": {
    "submitTime": "2024-01-10T11:30:00.000Z",
    "totalTime": 5400000
  }
}
```

---

## 📈 严重程度分级

### `severity` 字段说明

| 级别 | 值 | 颜色 | 说明 | 示例 |
|------|-----|------|------|------|
| 低 | `low` | 🟢 绿色 | 正常行为或轻微异常 | 窗口失焦、短时间无活动 |
| 中 | `medium` | 🟡 黄色 | 可疑行为，需要关注 | 切换标签、窗口最小化 |
| 高 | `high` | 🔴 红色 | 严重违规，需要立即处理 | 人脸丢失、摄像头关闭、多人协助 |

---

## 🔄 数据流示例

### 学生端触发 → WebSocket → 教师端显示

```
┌─────────────────────────────────────────────────────────────┐
│ 学生端                                                        │
├─────────────────────────────────────────────────────────────┤
│ 1. 学生切换标签页查看资料                                     │
│    ↓                                                          │
│ 2. 前端检测到 visibilitychange 事件                          │
│    ↓                                                          │
│ 3. 发送 WebSocket 消息：                                      │
│    {                                                          │
│      type: "user_activity",                                   │
│      data: {                                                  │
│        examId: "exam-001",                                    │
│        userId: "2022001",                                     │
│        activity: {                                            │
│          type: "page_visibility_change",                      │
│          data: { hidden: true }                               │
│        }                                                       │
│      }                                                         │
│    }                                                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ WebSocket 服务器                                              │
├─────────────────────────────────────────────────────────────┤
│ 1. 接收消息并分析                                             │
│    ↓                                                          │
│ 2. 判断为异常行为                                             │
│    ↓                                                          │
│ 3. 添加到 behaviorAlerts 数组：                              │
│    clientInfo.behaviorAlerts.push({                          │
│      warningType: "page_visibility_change",                  │
│      message: "检测到窗口切换或最小化"                        │
│    })                                                         │
│    ↓                                                          │
│ 4. 存储到数据库 exam_behavior_logs                           │
│    INSERT INTO exam_behavior_logs (...)                      │
│    ↓                                                          │
│ 5. 发送警报给学生端（可选）                                   │
│    {                                                          │
│      type: "behavior_alert",                                 │
│      data: {                                                  │
│        message: "检测到窗口切换或最小化",                     │
│        severity: "warning"                                    │
│      }                                                         │
│    }                                                           │
│    ↓                                                          │
│ 6. 广播给教师端                                               │
│    {                                                          │
│      type: "student_update",                                 │
│      data: {                                                  │
│        userId: "2022001",                                     │
│        behaviorAlerts: [...]                                  │
│      }                                                         │
│    }                                                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 教师端监控界面                                                │
├─────────────────────────────────────────────────────────────┤
│ 1. 接收 WebSocket 更新                                        │
│    ↓                                                          │
│ 2. 更新学生状态：                                             │
│    - 状态变为 "warning" (黄色)                                │
│    - 警告次数 +1                                              │
│    - 显示最新警告消息                                         │
│    ↓                                                          │
│ 3. UI 展示：                                                  │
│    ┌──────────────────────────────────────┐                 │
│    │ 👤 张三 (2022001)          ⚠️ 警告   │                 │
│    ├──────────────────────────────────────┤                 │
│    │ 📹 摄像头: ✅  人脸: ✅  在座: ✅    │                 │
│    │ ⚠️ 检测到窗口切换或最小化 (10:30:15) │                 │
│    │ ⚠️ 人脸消失超过10秒 (10:25:30)       │                 │
│    └──────────────────────────────────────┘                 │
│    ↓                                                          │
│ 4. 教师可以：                                                 │
│    - 查看详细日志                                             │
│    - 发送警告消息                                             │
│    - 标记为需要审核                                           │
│    - 查看历史快照                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 💾 数据库存储示例

### exam_behavior_logs 表数据

```sql
INSERT INTO exam_behavior_logs (
  exam_id, user_id, behavior_type, behavior_code, 
  behavior_message, behavior_data, severity, 
  requires_review, occurred_at
) VALUES (
  1001, 2022001, 'warning', 'page_visibility_change',
  '检测到窗口切换或最小化',
  '{"hidden":true,"duration":3000}',
  'medium',
  false,
  '2024-01-10 10:30:15'
);
```

### 查询某学生的所有警告

```sql
SELECT 
  behavior_code,
  behavior_message,
  severity,
  occurred_at
FROM exam_behavior_logs
WHERE exam_id = 1001 
  AND user_id = 2022001
  AND behavior_type IN ('warning', 'violation')
ORDER BY occurred_at DESC;
```

结果：
```
behavior_code            | behavior_message                | severity | occurred_at
-------------------------|---------------------------------|----------|-------------------
page_visibility_change   | 检测到窗口切换或最小化           | medium   | 2024-01-10 10:30:15
face_lost                | 检测到人脸消失超过10秒           | high     | 2024-01-10 10:25:30
tab_switch               | 检测到切换到其他标签页           | medium   | 2024-01-10 10:20:45
```

---

## 🎯 前端使用示例

### 显示行为警告列表

```tsx
// 在 MonitorExam 组件中
const renderBehaviorAlerts = (student: StudentState) => {
  return (
    <Timeline>
      {student.behaviorLogs.map((log) => (
        <Timeline.Item
          key={log.id}
          color={
            log.type === 'violation' ? 'red' :
            log.type === 'warning' ? 'orange' : 'green'
          }
          dot={
            log.type === 'violation' ? <ExclamationCircleOutlined /> :
            log.type === 'warning' ? <WarningOutlined /> : <CheckCircleOutlined />
          }
        >
          <p>{log.message}</p>
          <p className="monitor-log-time">
            {new Date(log.timestamp).toLocaleString()}
          </p>
        </Timeline.Item>
      ))}
    </Timeline>
  );
};
```

---

## 📋 总结

### behaviorAlerts 的核心内容

1. **warningType / behaviorCode**：行为类型代码（如 `tab_switch`, `face_lost`）
2. **message / behaviorMessage**：中文描述（如 "检测到窗口切换"）
3. **behaviorData**：详细数据（JSON格式，包含时长、次数等）
4. **severity**：严重程度（low/medium/high）
5. **timestamp / occurredAt**：发生时间

### 主要用途

- ✅ 实时监控学生考试行为
- ✅ 自动检测异常和作弊行为
- ✅ 为教师提供警报和审核依据
- ✅ 记录完整的考试过程日志
- ✅ 支持事后审核和申诉

所有行为代码和数据结构都已标准化，可以直接在项目中使用！

