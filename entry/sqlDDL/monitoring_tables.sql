-- ====================================
-- 考试监控系统数据库表
-- ====================================

-- 1. 班级信息表
CREATE TABLE IF NOT EXISTS classes (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='班级信息表';


-- 2. 考试监控记录表
CREATE TABLE IF NOT EXISTS exam_monitoring_records (
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
    
    UNIQUE KEY unique_exam_user (exam_id, user_id),
    INDEX idx_exam_user (exam_id, user_id),
    INDEX idx_exam_status (exam_id, connection_status),
    INDEX idx_is_online (is_online),
    FOREIGN KEY (exam_id) REFERENCES examinations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='考试实时监控记录表';


-- 3. 考试行为日志表
CREATE TABLE IF NOT EXISTS exam_behavior_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    exam_id BIGINT NOT NULL COMMENT '考试ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    
    -- 行为类型
    behavior_type VARCHAR(50) NOT NULL COMMENT '行为类型: normal, warning, violation',
    behavior_code VARCHAR(50) NOT NULL COMMENT '行为代码: tab_switch, face_lost, user_absent, camera_off, etc.',
    
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
    INDEX idx_behavior_code (behavior_code),
    INDEX idx_severity (severity),
    INDEX idx_requires_review (requires_review, reviewed),
    INDEX idx_occurred_at (occurred_at),
    FOREIGN KEY (exam_id) REFERENCES examinations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='考试行为日志表';


-- 4. 监控快照表
CREATE TABLE IF NOT EXISTS exam_monitoring_snapshots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    exam_id BIGINT NOT NULL COMMENT '考试ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    
    -- 快照数据
    snapshot_url VARCHAR(500) COMMENT '快照图片URL（存储到OSS/本地）',
    snapshot_data LONGTEXT COMMENT 'base64图片数据（可选，较大）',
    snapshot_size INT COMMENT '图片大小（字节）',
    
    -- 检测结果
    face_detected BOOLEAN DEFAULT FALSE COMMENT '是否检测到人脸',
    face_confidence DECIMAL(5,2) COMMENT '人脸检测置信度 0.00-1.00',
    user_present BOOLEAN DEFAULT FALSE COMMENT '用户是否在座',
    
    -- 元数据
    image_width INT COMMENT '图片宽度',
    image_height INT COMMENT '图片高度',
    image_quality DECIMAL(3,2) COMMENT '图片质量 0.00-1.00',
    
    -- 时间戳
    captured_at DATETIME NOT NULL COMMENT '拍摄时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_exam_user_time (exam_id, user_id, captured_at),
    INDEX idx_captured_at (captured_at),
    INDEX idx_face_detected (face_detected),
    FOREIGN KEY (exam_id) REFERENCES examinations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='考试监控快照表';


-- 5. 考试监控设置表
CREATE TABLE IF NOT EXISTS exam_monitoring_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    exam_id BIGINT NOT NULL COMMENT '考试ID',
    
    -- 监控开关
    enable_camera_monitoring BOOLEAN DEFAULT TRUE COMMENT '启用摄像头监控',
    enable_face_detection BOOLEAN DEFAULT TRUE COMMENT '启用人脸检测',
    enable_behavior_analysis BOOLEAN DEFAULT TRUE COMMENT '启用行为分析',
    enable_snapshot_storage BOOLEAN DEFAULT TRUE COMMENT '启用快照存储',
    
    -- 监控参数
    snapshot_interval INT DEFAULT 2000 COMMENT '快照间隔（毫秒）',
    snapshot_quality DECIMAL(3,2) DEFAULT 0.7 COMMENT '快照质量 0.00-1.00',
    max_snapshot_width INT DEFAULT 640 COMMENT '快照最大宽度',
    max_snapshot_height INT DEFAULT 480 COMMENT '快照最大高度',
    
    -- 检测灵敏度
    face_detection_sensitivity VARCHAR(20) DEFAULT 'medium' COMMENT '人脸检测灵敏度: low, medium, high',
    
    -- 警报阈值
    face_lost_threshold INT DEFAULT 10 COMMENT '人脸丢失警报阈值（秒）',
    user_absent_threshold INT DEFAULT 30 COMMENT '用户离座警报阈值（秒）',
    tab_switch_threshold INT DEFAULT 3 COMMENT '切换标签页警报阈值（次数）',
    inactivity_threshold INT DEFAULT 300 COMMENT '无活动警报阈值（秒）',
    
    -- 数据保留
    snapshot_retention_days INT DEFAULT 7 COMMENT '快照保留天数',
    log_retention_days INT DEFAULT 30 COMMENT '日志保留天数',
    
    -- 通知设置
    enable_realtime_alerts BOOLEAN DEFAULT TRUE COMMENT '启用实时警报',
    alert_sound_enabled BOOLEAN DEFAULT TRUE COMMENT '启用警报声音',
    
    -- 时间戳
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_exam (exam_id),
    FOREIGN KEY (exam_id) REFERENCES examinations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='考试监控设置表';


-- ====================================
-- 修改现有表
-- ====================================

-- 在 exam_answers 表中添加标记字段
ALTER TABLE exam_answers 
ADD COLUMN IF NOT EXISTS is_marked BOOLEAN DEFAULT FALSE COMMENT '是否标记此题';

-- 为 exam_answers 添加索引
ALTER TABLE exam_answers 
ADD INDEX IF NOT EXISTS idx_is_marked (is_marked);


-- ====================================
-- 初始化监控设置（可选）
-- ====================================

-- 为已有考试创建默认监控设置
-- INSERT INTO exam_monitoring_settings (exam_id)
-- SELECT id FROM examinations 
-- WHERE id NOT IN (SELECT exam_id FROM exam_monitoring_settings);

