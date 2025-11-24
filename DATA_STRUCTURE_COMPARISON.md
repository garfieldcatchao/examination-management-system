# 数据结构对比说明

## 概述

`MOCK_STUDENTSTATES` **不是**后端接口返回的数据结构，而是前端为了开发方便而创建的模拟数据。

## 1. 后端 WebSocket 返回的真实数据结构

### 学生列表消息（student_list）
```json
{
  "type": "student_list",
  "data": {
    "students": [
      {
        "clientId": "user_client_abc123_1234567890",
        "examId": "exam-001",
        "userId": "2022001",
        "studentId": "2022001",
        "monitoringType": "user",
        "connectedAt": "2024-01-10T10:00:00.000Z",
        "lastActivity": "2024-01-10T10:30:00.000Z",
        "faceDetected": true,
        "userPresent": true,
        "behaviorAlerts": [
          {
            "warningType": "page_visibility_change",
            "message": "检测到窗口切换或最小化"
          }
        ],
        "isConnected": true
      }
    ]
  }
}
```

### 用户照片消息（user_photo）
```json
{
  "type": "user_photo",
  "data": {
    "examId": "exam-001",
    "userId": "2022001",
    "timestamp": 1704880200000,
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...", // base64图片
    "metadata": {
      "width": 640,
      "height": 480,
      "quality": 0.7,
      "faceDetected": true,
      "userPresent": true,
      "videoReadyState": 4,
      "videoSize": "640x480"
    }
  }
}
```

### 用户活动消息（user_activity）
```json
{
  "type": "user_activity",
  "data": {
    "examId": "exam-001",
    "userId": "2022001",
    "timestamp": 1704880200000,
    "activity": {
      "type": "page_visibility_change",
      "data": { "hidden": false }
    }
  }
}
```

### 行为警报消息（behavior_alert）
```json
{
  "type": "behavior_alert",
  "data": {
    "message": "检测到用户离开座位",
    "timestamp": 1704880200000,
    "severity": "warning"
  }
}
```

## 2. 前端 MOCK_STUDENTSTATES 模拟数据结构

```typescript
const MOCK_STUDENTSTATES: StudentState[] = [
  {
    id: "1",                      // 前端生成的ID
    name: "张三",                 // 学生姓名（需要从用户表获取）
    studentId: "2022001",         // 学号
    className: "计算机科学2班",    // 班级（需要从用户表获取）
    status: "online",             // 前端计算的状态
    isCameraActive: true,         // 前端判断
    faceDetected: true,           // 来自后端
    userPresent: true,            // 来自后端
    lastActivity: new Date(),     // 来自后端
    progress: {                   // 前端计算或来自其他接口
      percentage: 75,
      answered: 15,
      unanswered: 5,
      marked: 2,
      status: "active"
    },
    behaviorLogs: [               // 前端格式化后端数据
      {
        id: "log1",
        type: "normal",
        message: "开始考试",
        timestamp: new Date()
      }
    ]
  }
]
```

## 3. 数据映射关系

### 后端数据 → 前端StudentState的转换

```typescript
function mapBackendDataToStudentState(backendData: any, userInfo: any): StudentState {
  return {
    // 基本信息
    id: backendData.userId,
    name: userInfo?.name || backendData.userId,  // 需要额外查询用户信息
    studentId: backendData.studentId,
    className: userInfo?.className || '未知班级', // 需要额外查询
    
    // 状态计算
    status: calculateStatus(backendData),  // 根据多个字段计算
    
    // 监控数据（直接来自后端）
    isCameraActive: backendData.isConnected && backendData.faceDetected !== null,
    faceDetected: backendData.faceDetected || false,
    userPresent: backendData.userPresent || false,
    lastActivity: new Date(backendData.lastActivity),
    
    // 进度数据（需要从考试答题接口获取）
    progress: {
      percentage: 0,  // TODO: 从答题接口获取
      answered: 0,    // TODO: 从答题接口获取
      unanswered: 0,  // TODO: 从答题接口获取
      marked: 0,      // TODO: 从答题接口获取
      status: "active"
    },
    
    // 行为日志（格式化后端数据）
    behaviorLogs: (backendData.behaviorAlerts || []).map((alert: any, index: number) => ({
      id: `alert-${backendData.userId}-${index}`,
      type: alert.warningType === 'user_absent' ? 'warning' : 'normal',
      message: alert.message,
      timestamp: new Date()
    }))
  };
}

// 状态计算逻辑
function calculateStatus(backendData: any): string {
  if (!backendData.isConnected) return 'offline';
  if (backendData.behaviorAlerts && backendData.behaviorAlerts.length > 0) return 'warning';
  if (!backendData.faceDetected || !backendData.userPresent) return 'warning';
  return 'online';
}
```

## 4. 完整的数据流

```
┌──────────────────────────────────────────────────────────────┐
│                     后端数据源                                │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  1. WebSocket监控服务器                                       │
│     - 学生连接/断开事件                                       │
│     - 摄像头快照数据                                          │
│     - 行为警报数据                                            │
│                                                                │
│  2. REST API - 用户信息接口                                   │
│     GET /api/users/:userId                                    │
│     {                                                          │
│       userId: "2022001",                                      │
│       name: "张三",                                           │
│       className: "计算机科学2班",                             │
│       avatar: "..."                                           │
│     }                                                          │
│                                                                │
│  3. REST API - 考试答题接口                                   │
│     GET /api/examinations/:examId/students/:userId/progress   │
│     {                                                          │
│       answered: 15,                                           │
│       unanswered: 5,                                          │
│       marked: 2,                                              │
│       percentage: 75                                          │
│     }                                                          │
│                                                                │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                   前端数据处理层                              │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  useAdminMonitoring Hook                                      │
│  ├─ 接收WebSocket消息                                         │
│  ├─ 存储原始监控数据                                          │
│  └─ 提供 adminMonitoring.students                            │
│                                                                │
│  数据转换函数                                                  │
│  ├─ mapBackendDataToStudentState()                           │
│  ├─ 合并用户信息                                              │
│  ├─ 合并答题进度                                              │
│  └─ 计算学生状态                                              │
│                                                                │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                   前端组件状态                                │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  const [studentstates, setStudentStates] =                   │
│    useState<StudentState[]>([...]);                           │
│                                                                │
│  StudentState[] 格式：                                         │
│  - 完整的学生信息（姓名、班级）                               │
│  - 实时监控状态（摄像头、人脸检测）                           │
│  - 答题进度数据                                                │
│  - 行为日志列表                                                │
│                                                                │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                      UI 渲染                                  │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  MonitorExam 组件                                             │
│  ├─ 学生列表展示                                              │
│  ├─ 摄像头监控显示                                            │
│  ├─ 行为记录时间轴                                            │
│  └─ 答题进度图表                                              │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

## 5. 为什么需要数据转换？

### 后端数据的局限性

1. **只有监控相关数据**
   - WebSocket服务器专注于监控功能
   - 不包含学生姓名、班级等详细信息
   - 不包含答题进度数据

2. **数据结构不适合直接展示**
   - 原始数据结构偏技术化
   - 字段名称不友好
   - 缺少前端需要的计算字段

### 前端StudentState的优势

1. **完整的展示数据**
   - 整合了多个数据源
   - 包含所有UI需要的字段
   - 便于组件使用

2. **类型安全**
   - TypeScript类型定义
   - 开发时有代码提示
   - 编译时类型检查

## 6. 实际使用建议

### 开发阶段
```typescript
// 使用模拟数据快速开发UI
const [studentstates, setStudentStates] = useState<StudentState[]>(MOCK_STUDENTSTATES);
```

### 集成阶段
```typescript
const adminMonitoring = useAdminMonitoring(examId);

useEffect(() => {
  // 获取所有学生的详细信息
  const fetchStudentDetails = async () => {
    const studentsWithDetails = await Promise.all(
      adminMonitoring.students.map(async (student) => {
        // 1. 获取用户信息
        const userInfo = await api.user.getById(student.userId);
        
        // 2. 获取答题进度
        const progress = await api.examination.getProgress(examId, student.userId);
        
        // 3. 转换为StudentState
        return mapBackendDataToStudentState(student, userInfo, progress);
      })
    );
    
    setStudentStates(studentsWithDetails);
  };
  
  if (adminMonitoring.students.length > 0) {
    fetchStudentDetails();
  }
}, [adminMonitoring.students]);
```

## 总结

| 对比项 | MOCK_STUDENTSTATES | 后端接口数据 |
|--------|-------------------|-------------|
| **来源** | 前端硬编码 | WebSocket/REST API |
| **用途** | 开发测试 | 生产环境 |
| **数据完整性** | 完整（包含所有字段） | 分散（需要多个接口） |
| **实时性** | 静态数据 | 实时更新 |
| **类型** | StudentState[] | 原始服务器数据 |

**关键点**：
- ✅ `MOCK_STUDENTSTATES` 是前端**模拟数据**，不是接口返回的
- ✅ 真实接口数据需要从**WebSocket + REST API**组合获取
- ✅ 需要写**数据转换函数**将后端数据映射为StudentState
- ✅ 生产环境要替换模拟数据为真实数据

