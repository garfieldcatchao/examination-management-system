# 实时监控数据库表分析

## 前端需要的监控数据 vs 现有数据库表

### 1. 前端StudentState接口需要的数据

```typescript
interface StudentState {
  id: string;                    // 学生ID
  name: string;                  // 学生姓名
  studentId: string;             // 学号
  className: string;             // 班级名称
  status: string;                // 在线状态 (online/offline/warning)
  isCameraActive: boolean;       // 摄像头是否开启
  faceDetected: boolean;         // 是否检测到人脸
  userPresent: boolean;          // 用户是否在座
  lastActivity: Date;            // 最后活动时间
  progress: {                    // 答题进度
    percentage: number;          // 完成百分比
    answered: number;            // 已答题数
    unanswered: number;          // 未答题数
    marked: number;              // 已标记题数
    status: string;              // 答题状态
  };
  behaviorLogs: [{               // 行为日志
    id: string;
    type: string;                // 日志类型
    message: string;             // 日志内容
    timestamp: Date;             // 时间戳
  }];
  avatar?: string;               // 头像
}
```

## 2. 现有数据库表分析

### ✅ 已有的表和字段

#### Users 表（用户基本信息）
```java
- id                    ✅ → StudentState.id
- real_name             ✅ → StudentState.name
- student_id            ✅ → StudentState.studentId
- avatar                ✅ → StudentState.avatar
- department            ✅ 院系信息
- grade                 ✅ 年级信息
- major                 ✅ 专业信息
- role                  ✅ 角色（student/teacher）
```

#### UserClasses 表（用户班级关系）
```java
- user_id               ✅ 关联用户
- class_id              ✅ 关联班级
```
**问题**：缺少 classes 表来获取班级名称

#### ExamParticipants 表（考试参与者）
```java
- exam_id               ✅ 考试ID
- user_id               ✅ 用户ID
- start_time            ✅ 开始时间
- submit_time           ✅ 提交时间
- last_active_time      ✅ → StudentState.lastActivity
- switch_count          ✅ 切换次数（监控数据）
- violation_logs        ✅ 违规日志（JSON格式）
- participation_status  ✅ 参与状态（进行中/已完成）
```

#### ExamAnswers 表（考试答案）
```java
- exam_id               ✅ 考试ID
- participant_id        ✅ 参与者ID
- question_id           ✅ 题目ID
- student_answer        ✅ 学生答案
```
**可以统计**：已答题数、未答题数

### ❌ 缺失的数据（需要新建表）

#### 1. 实时监控状态数据
以下数据**不在现有表中**，需要新建：

```
- isCameraActive        ❌ 摄像头是否开启（实时状态）
- faceDetected          ❌ 是否检测到人脸（实时状态）
- userPresent           ❌ 用户是否在座（实时状态）
- status                ❌ 在线状态（online/offline/warning）
- 摄像头快照            ❌ 图片数据
- 实时行为日志          ❌ 详细的行为记录
```

#### 2. 班级信息表
```
- class_id              ❌ 班级ID
- class_name            ❌ 班级名称
- grade                 ❌ 年级
- major                 ❌ 专业
```

## 3. 需要创建的新表

### 表1: exam_monitoring_records（考试监控记录表）

```sql
CREATE TABLE exam_monitoring_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    exam_id BIGINT NOT NULL COMMENT '考试ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    
    -- WebSocket连接状态
    connection_status VARCHAR(20) DEFAULT 'disconnected' COMMENT '连接状态: connected, disconnected, reconnecting',
    is_online BOOLEAN DEFAULT FALSE COMMENT '是否在线',
    
    -- 摄像头监控状态
    is_camera_active BOOLEAN DEFAULT FALSE COMMENT '摄像头是否开启',
    face_detected BOOLEAN DEFAULT FALSE COMMENT '是否检测到人脸',
    user_present BOOLEAN DEFAULT FALSE COMMENT '用户是否在座',
    last_face_detection_time DATETIME COMMENT '最后一次检测到人脸的时间',
    
    -- 活动时间
    last_activity_time DATETIME COMMENT '最后活动时间',
    last_snapshot_time DATETIME COMMENT '最后快照时间',
    
    -- 异常统计
    warning_count INT DEFAULT 0 COMMENT '警告次数',
    absence_count INT DEFAULT 0 COMMENT '离座次数',
    face_lost_count INT DEFAULT 0 COMMENT '人脸丢失次数',
    
    -- 时间戳
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_exam_user (exam_id, user_id),
    INDEX idx_exam_status (exam_id, connection_status),
    FOREIGN KEY (exam_id) REFERENCES examinations(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
) COMMENT='考试实时监控记录表';
```

### 表2: exam_monitoring_snapshots（监控快照表）

```sql
CREATE TABLE exam_monitoring_snapshots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    exam_id BIGINT NOT NULL COMMENT '考试ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    
    -- 快照数据
    snapshot_url VARCHAR(500) COMMENT '快照图片URL（存储到OSS/本地）',
    snapshot_data LONGTEXT COMMENT 'base64图片数据（可选，较大）',
    snapshot_size INT COMMENT '图片大小（字节）',
    
    -- 检测结果
    face_detected BOOLEAN DEFAULT FALSE COMMENT '是否检测到人脸',
    face_confidence DECIMAL(5,2) COMMENT '人脸检测置信度',
    user_present BOOLEAN DEFAULT FALSE COMMENT '用户是否在座',
    
    -- 元数据
    image_width INT COMMENT '图片宽度',
    image_height INT COMMENT '图片高度',
    image_quality DECIMAL(3,2) COMMENT '图片质量',
    
    -- 时间戳
    captured_at DATETIME NOT NULL COMMENT '拍摄时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_exam_user_time (exam_id, user_id, captured_at),
    INDEX idx_captured_at (captured_at),
    FOREIGN KEY (exam_id) REFERENCES examinations(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
) COMMENT='考试监控快照表';
```

### 表3: exam_behavior_logs（考试行为日志表）

```sql
CREATE TABLE exam_behavior_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    exam_id BIGINT NOT NULL COMMENT '考试ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    
    -- 行为类型
    behavior_type VARCHAR(50) NOT NULL COMMENT '行为类型: normal, warning, violation',
    behavior_code VARCHAR(50) NOT NULL COMMENT '行为代码: tab_switch, face_lost, user_absent, etc.',
    
    -- 行为详情
    behavior_message TEXT NOT NULL COMMENT '行为描述',
    behavior_data JSON COMMENT '行为数据（JSON格式）',
    
    -- 严重程度
    severity VARCHAR(20) DEFAULT 'low' COMMENT '严重程度: low, medium, high',
    
    -- 是否需要人工审核
    requires_review BOOLEAN DEFAULT FALSE COMMENT '是否需要审核',
    reviewed BOOLEAN DEFAULT FALSE COMMENT '是否已审核',
    reviewed_by BIGINT COMMENT '审核人ID',
    reviewed_at DATETIME COMMENT '审核时间',
    review_result VARCHAR(500) COMMENT '审核结果',
    
    -- 时间戳
    occurred_at DATETIME NOT NULL COMMENT '发生时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_exam_user_time (exam_id, user_id, occurred_at),
    INDEX idx_behavior_type (behavior_type),
    INDEX idx_severity (severity),
    INDEX idx_requires_review (requires_review, reviewed),
    FOREIGN KEY (exam_id) REFERENCES examinations(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
) COMMENT='考试行为日志表';
```

### 表4: classes（班级信息表）

```sql
CREATE TABLE classes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    class_name VARCHAR(100) NOT NULL COMMENT '班级名称',
    class_code VARCHAR(50) UNIQUE COMMENT '班级代码',
    
    -- 班级信息
    grade VARCHAR(20) COMMENT '年级',
    major VARCHAR(100) COMMENT '专业',
    department VARCHAR(100) COMMENT '院系',
    
    -- 班级人数
    total_students INT DEFAULT 0 COMMENT '学生总数',
    
    -- 负责教师
    advisor_id BIGINT COMMENT '班主任ID',
    
    -- 状态
    status VARCHAR(20) DEFAULT 'active' COMMENT '状态: active, archived',
    
    -- 时间戳
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_class_code (class_code),
    INDEX idx_grade_major (grade, major),
    FOREIGN KEY (advisor_id) REFERENCES users(id)
) COMMENT='班级信息表';
```

### 表5: exam_monitoring_settings（监控设置表）

```sql
CREATE TABLE exam_monitoring_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    exam_id BIGINT NOT NULL COMMENT '考试ID',
    
    -- 监控开关
    enable_camera_monitoring BOOLEAN DEFAULT TRUE COMMENT '启用摄像头监控',
    enable_face_detection BOOLEAN DEFAULT TRUE COMMENT '启用人脸检测',
    enable_behavior_analysis BOOLEAN DEFAULT TRUE COMMENT '启用行为分析',
    
    -- 监控参数
    snapshot_interval INT DEFAULT 2000 COMMENT '快照间隔（毫秒）',
    snapshot_quality DECIMAL(3,2) DEFAULT 0.7 COMMENT '快照质量',
    max_snapshot_width INT DEFAULT 640 COMMENT '快照最大宽度',
    max_snapshot_height INT DEFAULT 480 COMMENT '快照最大高度',
    
    -- 检测灵敏度
    face_detection_sensitivity VARCHAR(20) DEFAULT 'medium' COMMENT '人脸检测灵敏度: low, medium, high',
    
    -- 警报阈值
    face_lost_threshold INT DEFAULT 10 COMMENT '人脸丢失警报阈值（秒）',
    user_absent_threshold INT DEFAULT 30 COMMENT '用户离座警报阈值（秒）',
    tab_switch_threshold INT DEFAULT 3 COMMENT '切换标签页警报阈值（次数）',
    
    -- 数据保留
    snapshot_retention_days INT DEFAULT 7 COMMENT '快照保留天数',
    log_retention_days INT DEFAULT 30 COMMENT '日志保留天数',
    
    -- 时间戳
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_exam (exam_id),
    FOREIGN KEY (exam_id) REFERENCES examinations(id)
) COMMENT='考试监控设置表';
```

## 4. 数据来源映射表

| 前端字段 | 数据来源 | SQL查询 |
|---------|---------|---------|
| **基本信息** |
| id | users.id | ✅ 已有 |
| name | users.real_name | ✅ 已有 |
| studentId | users.student_id | ✅ 已有 |
| className | classes.class_name | ⚠️ 需要JOIN user_classes + classes |
| avatar | users.avatar | ✅ 已有 |
| **监控状态** |
| status | 计算字段 | 🔄 根据 exam_monitoring_records 计算 |
| isCameraActive | exam_monitoring_records.is_camera_active | ❌ 新表 |
| faceDetected | exam_monitoring_records.face_detected | ❌ 新表 |
| userPresent | exam_monitoring_records.user_present | ❌ 新表 |
| lastActivity | exam_monitoring_records.last_activity_time | ❌ 新表 |
| **答题进度** |
| percentage | 计算字段 | 🔄 COUNT exam_answers |
| answered | COUNT | 🔄 COUNT exam_answers WHERE student_answer IS NOT NULL |
| unanswered | COUNT | 🔄 总题数 - answered |
| marked | 暂无 | ⚠️ 需要在 exam_answers 添加 is_marked 字段 |
| **行为日志** |
| behaviorLogs | exam_behavior_logs | ❌ 新表 |

## 5. 完整SQL查询示例

### 查询单个学生的完整监控数据

```sql
SELECT 
    u.id,
    u.real_name as name,
    u.student_id,
    c.class_name,
    u.avatar,
    
    -- 监控状态
    emr.connection_status,
    emr.is_online,
    emr.is_camera_active,
    emr.face_detected,
    emr.user_present,
    emr.last_activity_time,
    
    -- 考试信息
    ep.start_time,
    ep.submit_time,
    ep.participation_status,
    
    -- 答题进度统计
    (SELECT COUNT(*) FROM exam_answers 
     WHERE exam_id = ? AND participant_id = ep.id 
     AND student_answer IS NOT NULL) as answered_count,
    
    (SELECT COUNT(*) FROM exam_questions WHERE exam_id = ?) as total_questions,
    
    -- 异常统计
    emr.warning_count,
    emr.absence_count

FROM users u
LEFT JOIN user_classes uc ON u.id = uc.user_id
LEFT JOIN classes c ON uc.class_id = c.id
LEFT JOIN exam_participants ep ON u.id = ep.user_id AND ep.exam_id = ?
LEFT JOIN exam_monitoring_records emr ON u.id = emr.user_id AND emr.exam_id = ?
WHERE u.id = ? AND u.role = 'student';
```

### 查询考试的所有学生监控数据

```sql
SELECT 
    u.id,
    u.real_name as name,
    u.student_id,
    c.class_name,
    u.avatar,
    emr.is_camera_active,
    emr.face_detected,
    emr.user_present,
    emr.last_activity_time,
    
    CASE 
        WHEN emr.is_online = FALSE THEN 'offline'
        WHEN emr.warning_count > 0 OR emr.face_detected = FALSE THEN 'warning'
        ELSE 'online'
    END as status

FROM exam_participants ep
INNER JOIN users u ON ep.user_id = u.id
LEFT JOIN user_classes uc ON u.id = uc.user_id
LEFT JOIN classes c ON uc.class_id = c.id
LEFT JOIN exam_monitoring_records emr ON u.id = emr.user_id AND emr.exam_id = ep.exam_id
WHERE ep.exam_id = ?
ORDER BY u.student_id;
```

## 6. 创建表的优先级

### 高优先级（必须创建）
1. ✅ **exam_monitoring_records** - 核心监控状态表
2. ✅ **exam_behavior_logs** - 行为日志表
3. ✅ **classes** - 班级信息表

### 中优先级（推荐创建）
4. ⚠️ **exam_monitoring_snapshots** - 快照存储表
5. ⚠️ **exam_monitoring_settings** - 监控设置表

### 低优先级（可选）
6. ⏸️ 可以先使用 WebSocket 内存存储，后期再持久化

## 7. 修改现有表

### ExamAnswers 表需要添加字段

```sql
ALTER TABLE exam_answers 
ADD COLUMN is_marked BOOLEAN DEFAULT FALSE COMMENT '是否标记';
```

## 总结

### 现有数据库可以提供的数据：
✅ 用户基本信息（姓名、学号、头像）
✅ 考试参与信息
✅ 答题数据（可统计已答题数）
✅ 最后活动时间（exam_participants.last_active_time）
✅ 违规日志（exam_participants.violation_logs）

### 需要新建表来支持的数据：
❌ 实时监控状态（摄像头、人脸检测、在座状态）
❌ 班级名称（需要 classes 表）
❌ 监控快照
❌ 详细的行为日志
❌ 标记题目功能

### 建议：
1. **必须创建**：exam_monitoring_records, exam_behavior_logs, classes
2. **推荐创建**：exam_monitoring_snapshots
3. **修改现有表**：在 exam_answers 添加 is_marked 字段
4. **WebSocket服务器**：实时数据暂存在内存，定期同步到数据库

