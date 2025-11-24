# 实时监控系统实施总结

## 📋 问题回答

### **后端实际返回的数据是否都有？还是需要新建表？**

**答案**：需要新建表。现有数据库表**不足以支持**实时监控功能。

---

## 🔍 详细分析

### 1. 现有表可以提供的数据

#### ✅ 已有且可用的数据

| 数据项 | 来源表 | 字段 | 状态 |
|--------|--------|------|------|
| 学生基本信息 | `users` | `id`, `real_name`, `student_id`, `avatar` | ✅ 完全可用 |
| 考试参与信息 | `exam_participants` | `exam_id`, `user_id`, `start_time` | ✅ 完全可用 |
| 最后活动时间 | `exam_participants` | `last_active_time` | ✅ 可用，但需实时更新 |
| 切换次数 | `exam_participants` | `switch_count` | ✅ 可用 |
| 违规日志 | `exam_participants` | `violation_logs` (JSON) | ✅ 可用，但字段通用 |
| 答题数据 | `exam_answers` | `student_answer`, `question_id` | ✅ 可用于统计进度 |

#### ⚠️ 部分可用但需要补充的数据

| 数据项 | 问题 | 解决方案 |
|--------|------|---------|
| 班级名称 | `user_classes` 表只有 `class_id`，缺少班级详情 | 新建 `classes` 表 |
| 标记题目 | `exam_answers` 表没有标记字段 | 添加 `is_marked` 字段 |

### 2. 缺失的监控专用数据

#### ❌ 必须新建表存储的数据

以下数据**完全不存在**于现有数据库中：

| 数据类别 | 缺失的数据 | 重要性 |
|---------|-----------|--------|
| **实时连接状态** | • 是否在线<br>• WebSocket连接状态<br>• 最后在线时间 | 🔴 高 |
| **摄像头监控** | • 摄像头是否开启<br>• 是否检测到人脸<br>• 用户是否在座<br>• 最后检测到人脸的时间 | 🔴 高 |
| **监控快照** | • 快照图片数据<br>• 快照URL<br>• 拍摄时间<br>• 检测元数据 | 🟡 中 |
| **详细行为日志** | • 行为类型（normal/warning/violation）<br>• 行为代码（tab_switch/face_lost等）<br>• 严重程度<br>• 是否需要审核 | 🔴 高 |
| **监控配置** | • 快照间隔<br>• 检测灵敏度<br>• 警报阈值<br>• 数据保留策略 | 🟡 中 |

---

## 📦 需要创建的新表

### 必须创建（高优先级）

#### 1. **exam_monitoring_records** - 考试监控记录表
**用途**：存储每个学生的实时监控状态

**核心字段**：
```sql
- is_online              -- 是否在线
- is_camera_active       -- 摄像头是否开启
- face_detected          -- 是否检测到人脸
- user_present           -- 用户是否在座
- last_activity_time     -- 最后活动时间
- warning_count          -- 警告次数
- absence_count          -- 离座次数
```

**为什么需要**：
- ❌ `exam_participants` 表没有这些实时状态字段
- ✅ 监控状态需要频繁更新（每2秒），不适合与考试记录混在一起
- ✅ 考试结束后监控数据可以归档，不影响考试主表

#### 2. **exam_behavior_logs** - 考试行为日志表
**用途**：详细记录每个行为事件

**核心字段**：
```sql
- behavior_type          -- normal/warning/violation
- behavior_code          -- tab_switch, face_lost, etc.
- behavior_message       -- 行为描述
- severity               -- low/medium/high
- occurred_at            -- 发生时间
```

**为什么需要**：
- ❌ `exam_participants.violation_logs` 只是一个JSON字段，不便于查询统计
- ✅ 需要按时间、类型、严重程度等多维度查询
- ✅ 需要支持人工审核流程

#### 3. **classes** - 班级信息表
**用途**：存储班级详细信息

**核心字段**：
```sql
- class_name             -- 班级名称
- class_code             -- 班级代码
- grade                  -- 年级
- major                  -- 专业
```

**为什么需要**：
- ❌ `user_classes` 只有关系，没有班级详情
- ✅ 前端需要显示班级名称

### 推荐创建（中优先级）

#### 4. **exam_monitoring_snapshots** - 监控快照表
**用途**：存储摄像头快照

**为什么需要**：
- 法律合规：保留考试过程证据
- 事后审核：可以回溯学生的考试状态
- 人脸识别：存储检测结果

#### 5. **exam_monitoring_settings** - 监控设置表
**用途**：每场考试的监控配置

**为什么需要**：
- 不同考试可能有不同的监控要求
- 可以灵活调整监控参数

---

## 📁 已创建的文件

### Java 实体类（Entity）
```
entry/
├── ExamMonitoringRecords.java      ✅ 监控记录表
├── ExamBehaviorLogs.java           ✅ 行为日志表
├── Classes.java                    ✅ 班级信息表
└── ExamMonitoringSnapshots.java    ✅ 监控快照表
```

### SQL DDL 文件
```
entry/sqlDDL/
└── monitoring_tables.sql           ✅ 完整建表语句
```

### 文档
```
/
├── MONITORING_DATABASE_ANALYSIS.md      ✅ 详细数据分析
├── DATA_STRUCTURE_COMPARISON.md        ✅ 数据结构对比
└── MONITORING_IMPLEMENTATION_SUMMARY.md ✅ 实施总结（本文件）
```

---

## 🔄 数据流完整示例

### 学生端 → WebSocket → 教师端

```
┌─────────────────────────────────────────────────────────────┐
│ 学生考试过程                                                 │
├─────────────────────────────────────────────────────────────┤
│ 1. 进入考试 → WebSocket连接                                 │
│    └─ 插入/更新 exam_monitoring_records                     │
│       • is_online = true                                     │
│       • connection_status = 'connected'                      │
│                                                               │
│ 2. 开启摄像头                                                │
│    └─ 更新 exam_monitoring_records                          │
│       • is_camera_active = true                              │
│                                                               │
│ 3. 每2秒发送快照                                             │
│    ├─ 插入 exam_monitoring_snapshots                        │
│    │   • snapshot_data = base64图片                          │
│    │   • face_detected = true/false                          │
│    └─ 更新 exam_monitoring_records                          │
│       • face_detected = true/false                           │
│       • last_snapshot_time = NOW()                           │
│                                                               │
│ 4. 检测到异常行为（切换标签）                                │
│    ├─ 插入 exam_behavior_logs                               │
│    │   • behavior_type = 'warning'                           │
│    │   • behavior_code = 'tab_switch'                        │
│    │   • severity = 'medium'                                 │
│    └─ 更新 exam_monitoring_records                          │
│       • warning_count = warning_count + 1                    │
│                                                               │
│ 5. 答题                                                       │
│    └─ 插入/更新 exam_answers                                │
│       • student_answer = '...'                               │
│                                                               │
│ 6. 断开连接                                                   │
│    └─ 更新 exam_monitoring_records                          │
│       • is_online = false                                    │
│       • connection_status = 'disconnected'                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 教师端查询                                                    │
├─────────────────────────────────────────────────────────────┤
│ 获取所有学生的监控状态：                                      │
│                                                               │
│ SELECT                                                        │
│     u.id,                                                     │
│     u.real_name as name,                                     │
│     u.student_id,                                            │
│     c.class_name,                        -- 来自 classes     │
│     emr.is_online,                       -- 来自 监控记录    │
│     emr.is_camera_active,                                    │
│     emr.face_detected,                                       │
│     emr.user_present,                                        │
│     emr.last_activity_time,                                  │
│     (SELECT COUNT(*) FROM exam_answers   -- 已答题数         │
│      WHERE exam_id = ? AND participant_id = ep.id            │
│      AND student_answer IS NOT NULL) as answered             │
│ FROM exam_participants ep                                    │
│ JOIN users u ON ep.user_id = u.id                           │
│ LEFT JOIN user_classes uc ON u.id = uc.user_id              │
│ LEFT JOIN classes c ON uc.class_id = c.id                   │
│ LEFT JOIN exam_monitoring_records emr                        │
│     ON emr.exam_id = ep.exam_id AND emr.user_id = u.id      │
│ WHERE ep.exam_id = ?;                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚙️ 实施步骤

### 步骤1: 创建数据库表
```bash
# 执行 SQL 建表语句
mysql -u root -p exam_system < entry/sqlDDL/monitoring_tables.sql
```

### 步骤2: 配置 JPA 实体
将以下实体类添加到项目中：
- `ExamMonitoringRecords.java`
- `ExamBehaviorLogs.java`
- `Classes.java`
- `ExamMonitoringSnapshots.java`

### 步骤3: 创建 Repository 接口
```java
// ExamMonitoringRecordsRepository.java
public interface ExamMonitoringRecordsRepository extends JpaRepository<ExamMonitoringRecords, Long> {
    Optional<ExamMonitoringRecords> findByExamIdAndUserId(Long examId, Long userId);
    List<ExamMonitoringRecords> findByExamId(Long examId);
}

// ExamBehaviorLogsRepository.java
public interface ExamBehaviorLogsRepository extends JpaRepository<ExamBehaviorLogs, Long> {
    List<ExamBehaviorLogs> findByExamIdAndUserId(Long examId, Long userId);
    List<ExamBehaviorLogs> findByExamIdAndSeverity(Long examId, String severity);
}

// ClassesRepository.java
public interface ClassesRepository extends JpaRepository<Classes, Long> {
    Optional<Classes> findByClassCode(String classCode);
}
```

### 步骤4: 实现 Service 层
```java
@Service
public class MonitoringService {
    
    // 更新学生监控状态
    public void updateMonitoringStatus(Long examId, Long userId, MonitoringStatusDTO dto) {
        ExamMonitoringRecords record = repository.findByExamIdAndUserId(examId, userId)
            .orElse(new ExamMonitoringRecords());
        
        record.setExamId(examId);
        record.setUserId(userId);
        record.setIsOnline(dto.getIsOnline());
        record.setIsCameraActive(dto.getIsCameraActive());
        record.setFaceDetected(dto.getFaceDetected());
        record.setUserPresent(dto.getUserPresent());
        record.setLastActivityTime(LocalDateTime.now());
        
        repository.save(record);
    }
    
    // 记录行为日志
    public void logBehavior(Long examId, Long userId, String behaviorCode, String message, String severity) {
        ExamBehaviorLogs log = new ExamBehaviorLogs();
        log.setExamId(examId);
        log.setUserId(userId);
        log.setBehaviorCode(behaviorCode);
        log.setBehaviorMessage(message);
        log.setSeverity(severity);
        log.setOccurredAt(LocalDateTime.now());
        
        behaviorLogsRepository.save(log);
    }
    
    // 获取考试的所有监控数据
    public List<StudentMonitoringDTO> getExamMonitoringData(Long examId) {
        // 复杂查询，整合多个表的数据
    }
}
```

### 步骤5: WebSocket 集成
在现有的 `websocket-server.js` 中添加数据库写入：

```javascript
// 当收到学生快照时
ws.on('message', async (message) => {
    const data = JSON.parse(message);
    
    if (data.type === 'user_photo') {
        // 1. 更新监控状态
        await updateMonitoringRecord({
            examId: data.examId,
            userId: data.userId,
            faceDetected: data.metadata.faceDetected,
            userPresent: data.metadata.userPresent,
            lastActivityTime: new Date()
        });
        
        // 2. 可选：存储快照
        if (shouldSaveSnapshot(data)) {
            await saveSnapshot({
                examId: data.examId,
                userId: data.userId,
                snapshotData: data.image,
                faceDetected: data.metadata.faceDetected
            });
        }
    }
    
    if (data.type === 'behavior_alert') {
        // 记录行为日志
        await logBehavior({
            examId: data.examId,
            userId: data.userId,
            behaviorCode: data.behaviorCode,
            behaviorMessage: data.message,
            severity: data.severity
        });
    }
});
```

---

## 📊 数据量估算

### 单场考试（100人，60分钟）

| 表 | 记录数 | 数据量估算 |
|----|--------|-----------|
| `exam_monitoring_records` | 100条 | ~50KB（仅状态） |
| `exam_behavior_logs` | 300-500条 | ~200KB（平均每人3-5条） |
| `exam_monitoring_snapshots` | 180,000条 | ~18GB（每2秒1张，每张100KB） |

**建议**：
- ✅ 监控记录和行为日志：永久保存
- ⚠️ 快照：保留7天后删除或压缩存档

---

## ✅ 总结

### 问题答案
**后端实际返回的数据是否都有？**
- ❌ **不完整** - 现有表缺少大量监控专用数据

**还是需要新建表？**
- ✅ **必须新建** - 至少需要3个核心表：
  1. `exam_monitoring_records` - 监控状态
  2. `exam_behavior_logs` - 行为日志
  3. `classes` - 班级信息

### 核心原因
1. **现有表设计**：面向考试管理，不是监控系统
2. **数据特性**：监控数据高频更新（每2秒），需要独立存储
3. **功能需求**：实时监控需要摄像头、人脸检测等专用字段
4. **查询性能**：监控查询频繁，独立表可以优化索引

### 实施优先级
🔴 **立即实施**：
- 创建 `exam_monitoring_records` 表
- 创建 `exam_behavior_logs` 表
- 创建 `classes` 表

🟡 **后续实施**：
- 创建 `exam_monitoring_snapshots` 表（如需保存快照）
- 创建 `exam_monitoring_settings` 表（如需灵活配置）

---

所有必要的实体类和SQL文件已创建完成，可以直接使用！

