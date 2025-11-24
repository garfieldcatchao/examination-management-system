CREATE TABLE `ai_conversations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `session_id` varchar(100) NOT NULL COMMENT '会话ID',
  `agent_type` enum(
    'paper_generation',
    'data_analysis',
    'teaching_assistant',
    'student_coaching',
    'question_optimization'
  ) NOT NULL COMMENT 'AI代理类型',
  `context_type` enum('exam', 'paper', 'question', 'class', 'general') DEFAULT NULL COMMENT '上下文类型',
  `context_id` bigint DEFAULT NULL COMMENT '上下文ID',
  `user_message` text NOT NULL COMMENT '用户消息',
  `ai_response` text NOT NULL COMMENT 'AI回复',
  `prompt_tokens` int DEFAULT NULL COMMENT '输入token数',
  `completion_tokens` int DEFAULT NULL COMMENT '输出token数',
  `rating` tinyint DEFAULT NULL COMMENT '用户评分(1-5)',
  `feedback` text COMMENT '用户反馈',
  `is_helpful` tinyint(1) DEFAULT NULL COMMENT '是否有帮助',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `isHelpful` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_user_session` (`user_id`, `session_id`),
  KEY `idx_agent_type` (`agent_type`),
  KEY `idx_context` (`context_type`, `context_id`),
  KEY `idx_created_at` (`created_at` DESC),
  CONSTRAINT `ai_conversations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 4 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci


CREATE TABLE `answers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `exam_record_id` bigint NOT NULL,
  `question_id` bigint NOT NULL,
  `student_answer` text COMMENT '学生答案',
  `score` decimal(4,1) DEFAULT '0.0' COMMENT '得分',
  `teacher_comment` text COMMENT '教师评语',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_record_question` (`exam_record_id`,`question_id`),
  KEY `idx_exam_record_id` (`exam_record_id`),
  KEY `idx_question_id` (`question_id`),
  CONSTRAINT `answers_ibfk_1` FOREIGN KEY (`exam_record_id`) REFERENCES `exam_records` (`id`) ON DELETE CASCADE,
  CONSTRAINT `answers_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci


CREATE TABLE `batch_operations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `operation_type` enum('edit','delete','move','tag','export') NOT NULL COMMENT '操作类型',
  `question_ids` json NOT NULL COMMENT '操作的题目ID列表',
  `operation_params` json DEFAULT NULL COMMENT '操作参数',
  `total_count` int DEFAULT '0' COMMENT '操作题目总数',
  `success_count` int DEFAULT '0' COMMENT '成功数量',
  `failed_count` int DEFAULT '0' COMMENT '失败数量',
  `status` enum('processing','completed','failed') DEFAULT 'processing',
  `created_by` bigint NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_operation_type` (`operation_type`),
  KEY `idx_created_at` (`created_at` DESC),
  CONSTRAINT `batch_operations_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci


CREATE TABLE `classes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `class_name` varchar(100) NOT NULL COMMENT '班级名称',
  `class_code` varchar(50) NOT NULL COMMENT '班级代码',
  `department` varchar(100) NOT NULL COMMENT '院系',
  `major` varchar(100) NOT NULL COMMENT '专业',
  `grade` varchar(20) NOT NULL COMMENT '年级',
  `head_teacher_id` bigint DEFAULT NULL COMMENT '班主任ID',
  `counselor_id` bigint DEFAULT NULL COMMENT '辅导员ID',
  `student_count` int DEFAULT '0' COMMENT '学生人数',
  `status` enum('active','inactive') DEFAULT 'active' COMMENT '状态',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `class_code` (`class_code`),
  KEY `head_teacher_id` (`head_teacher_id`),
  KEY `counselor_id` (`counselor_id`),
  KEY `idx_department` (`department`),
  KEY `idx_grade` (`grade`),
  KEY `idx_status` (`status`),
  CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`head_teacher_id`) REFERENCES `users` (`id`),
  CONSTRAINT `classes_ibfk_2` FOREIGN KEY (`counselor_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci


CREATE TABLE `exam_answers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `exam_id` bigint NOT NULL COMMENT '考试ID',
  `participant_id` bigint NOT NULL COMMENT '参与者ID',
  `question_id` bigint NOT NULL COMMENT '题目ID',
  `question_order` int NOT NULL COMMENT '题目序号',
  `student_answer` text COMMENT '学生答案',
  `selected_options` json DEFAULT NULL COMMENT '选中的选项',
  `answer_time` int DEFAULT NULL COMMENT '答题用时(秒)',
  `is_correct` tinyint(1) DEFAULT NULL COMMENT '是否正确',
  `score` decimal(5,2) DEFAULT '0.00' COMMENT '得分',
  `max_score` decimal(5,2) NOT NULL COMMENT '满分',
  `auto_scored` tinyint(1) DEFAULT '1' COMMENT '是否自动评分',
  `manual_score` decimal(5,2) DEFAULT NULL COMMENT '人工评分',
  `teacher_comment` text COMMENT '教师评语',
  `scored_by` bigint DEFAULT NULL COMMENT '评分教师ID',
  `scored_at` timestamp NULL DEFAULT NULL COMMENT '评分时间',
  `answer_changes` json DEFAULT NULL COMMENT '答案修改记录',
  `first_answer_time` timestamp NULL DEFAULT NULL COMMENT '首次作答时间',
  `last_modified_time` timestamp NULL DEFAULT NULL COMMENT '最后修改时间',
  `answer_changges` varchar(255) DEFAULT NULL,
  `grading_status` enum('auto_graded','pending','manual_graded') DEFAULT 'pending' COMMENT '题目阅卷状态',
  `graded_by` bigint DEFAULT NULL COMMENT '阅卷教师ID',
  `graded_at` timestamp NULL DEFAULT NULL COMMENT '阅卷时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_participant_question` (`participant_id`,`question_id`),
  KEY `question_id` (`question_id`),
  KEY `scored_by` (`scored_by`),
  KEY `idx_exam_question` (`exam_id`,`question_id`),
  CONSTRAINT `exam_answers_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `examinations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `exam_answers_ibfk_2` FOREIGN KEY (`participant_id`) REFERENCES `exam_participants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `exam_answers_ibfk_3` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`),
  CONSTRAINT `exam_answers_ibfk_4` FOREIGN KEY (`scored_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci


CREATE TABLE `exam_paper` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `avg_score` decimal(19,2) DEFAULT NULL,
  `created_at` varchar(255) DEFAULT NULL,
  `created_by` decimal(19,2) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `difficulty` bigint DEFAULT NULL,
  `duration` int DEFAULT NULL,
  `instrustions` varchar(255) DEFAULT NULL,
  `paper_type` bigint DEFAULT NULL,
  `pass_rate` decimal(19,2) DEFAULT NULL,
  `passing_score` decimal(19,2) DEFAULT NULL,
  `published_at` varchar(255) DEFAULT NULL,
  `question_config` varchar(255) DEFAULT NULL,
  `question_count` int DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `subject_id` bigint DEFAULT NULL,
  `tags` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `total_score` decimal(19,2) DEFAULT NULL,
  `updated_at` varchar(255) DEFAULT NULL,
  `usage_count` int DEFAULT NULL,
  `version` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci


CREATE TABLE `exam_papers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL COMMENT '试卷标题',
  `subject_id` bigint NOT NULL COMMENT '科目ID',
  `paper_type` enum('exam','quiz','practice','homework') DEFAULT 'exam' COMMENT '试卷类型',
  `difficulty` enum('easy','medium','hard') NOT NULL COMMENT '整体难度',
  `total_score` decimal(6,2) NOT NULL COMMENT '总分',
  `duration` int NOT NULL COMMENT '考试时长(分钟)',
  `question_count` int NOT NULL COMMENT '题目总数',
  `passing_score` decimal(6,2) DEFAULT NULL COMMENT '及格分数',
  `description` text COMMENT '试卷说明',
  `instructions` text COMMENT '考试须知',
  `tags` json DEFAULT NULL COMMENT '标签',
  `question_config` json DEFAULT NULL COMMENT '题型配置(每种题型的数量和分值)',
  `created_by` bigint NOT NULL COMMENT '创建者ID',
  `status` enum('draft','published','archived') DEFAULT 'draft' COMMENT '状态',
  `version` int DEFAULT '1' COMMENT '版本号',
  `usage_count` int DEFAULT '0' COMMENT '使用次数',
  `avg_score` decimal(5,2) DEFAULT '0.00' COMMENT '平均分',
  `pass_rate` decimal(5,2) DEFAULT '0.00' COMMENT '通过率(%)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `published_at` timestamp NULL DEFAULT NULL COMMENT '发布时间',
  PRIMARY KEY (`id`),
  KEY `idx_subject_status` (`subject_id`,`status`),
  KEY `idx_creator` (`created_by`),
  KEY `idx_version` (`version`),
  CONSTRAINT `exam_papers_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`),
  CONSTRAINT `exam_papers_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci


CREATE TABLE `exam_participants` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `exam_id` bigint NOT NULL COMMENT '考试ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `class_id` bigint DEFAULT NULL COMMENT '班级ID',
  `invitation_status` enum('invited','confirmed','declined') DEFAULT 'invited' COMMENT '邀请状态',
  `participation_status` enum('not_started','in_progress','submitted','timeout','cheating') DEFAULT 'not_started' COMMENT '参与状态',
  `start_time` timestamp NULL DEFAULT NULL COMMENT '开始答题时间',
  `submit_time` timestamp NULL DEFAULT NULL COMMENT '提交时间',
  `last_active_time` timestamp NULL DEFAULT NULL COMMENT '最后活跃时间',
  `switch_count` int DEFAULT '0' COMMENT '切换窗口次数',
  `violation_logs` json DEFAULT NULL COMMENT '违规行为日志',
  `total_score` decimal(6,2) DEFAULT '0.00' COMMENT '总得分',
  `percentage` decimal(5,2) DEFAULT '0.00' COMMENT '得分率',
  `is_passed` tinyint(1) DEFAULT '0' COMMENT '是否通过',
  `rank_in_class` int DEFAULT NULL COMMENT '班级排名',
  `rank_overall` int DEFAULT NULL COMMENT '总体排名',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `grading_status` enum('not_submitted','submitted','grading','graded') DEFAULT 'not_submitted' COMMENT '阅卷状态',
  `graded_by` bigint DEFAULT NULL COMMENT '阅卷教师ID',
  `graded_at` timestamp NULL DEFAULT NULL COMMENT '阅卷时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_exam_user` (`exam_id`,`user_id`),
  KEY `user_id` (`user_id`),
  KEY `class_id` (`class_id`),
  KEY `idx_exam_status` (`exam_id`,`participation_status`),
  CONSTRAINT `exam_participants_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `examinations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `exam_participants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `exam_participants_ibfk_3` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci



CREATE TABLE `exam_questions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `exam_id` bigint NOT NULL,
  `question_id` bigint NOT NULL,
  `order_num` int NOT NULL COMMENT '题目顺序',
  `score` decimal(4,1) NOT NULL COMMENT '该题在此考试中的分值',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_exam_question` (`exam_id`,`question_id`),
  KEY `idx_exam_id` (`exam_id`),
  KEY `idx_question_id` (`question_id`),
  CONSTRAINT `exam_questions_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `exam_questions_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci


CREATE TABLE `exam_questions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `exam_id` bigint NOT NULL,
  `question_id` bigint NOT NULL,
  `order_num` int NOT NULL COMMENT '题目顺序',
  `score` decimal(4,1) NOT NULL COMMENT '该题在此考试中的分值',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_exam_question` (`exam_id`,`question_id`),
  KEY `idx_exam_id` (`exam_id`),
  KEY `idx_question_id` (`question_id`),
  CONSTRAINT `exam_questions_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `exam_questions_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci


CREATE TABLE `exam_questions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `exam_id` bigint NOT NULL,
  `question_id` bigint NOT NULL,
  `order_num` int NOT NULL COMMENT '题目顺序',
  `score` decimal(4,1) NOT NULL COMMENT '该题在此考试中的分值',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_exam_question` (`exam_id`,`question_id`),
  KEY `idx_exam_id` (`exam_id`),
  KEY `idx_question_id` (`question_id`),
  CONSTRAINT `exam_questions_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `exam_questions_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `exam_records` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `exam_id` bigint NOT NULL,
  `student_id` bigint NOT NULL,
  `start_time` timestamp NULL DEFAULT NULL COMMENT '开始答题时间',
  `submit_time` timestamp NULL DEFAULT NULL COMMENT '提交时间',
  `score` decimal(6,1) DEFAULT '0.0' COMMENT '得分',
  `answers` json DEFAULT NULL COMMENT '答案(JSON格式)',
  `status` enum('not_started','ongoing','submitted','graded') DEFAULT 'not_started',
  `exam_log` text COMMENT '考试过程日志',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_exam_student` (`exam_id`,`student_id`),
  KEY `idx_exam_id` (`exam_id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `exam_records_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`),
  CONSTRAINT `exam_records_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci


CREATE TABLE `exam_sessions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `exam_id` bigint NOT NULL COMMENT '考试ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `session_token` varchar(255) NOT NULL COMMENT '会话令牌',
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'IP地址',
  `user_agent` text COMMENT '浏览器信息',
  `device_info` json DEFAULT NULL COMMENT '设备信息',
  `screen_resolution` varchar(20) DEFAULT NULL COMMENT '屏幕分辨率',
  `status` enum('active','expired','terminated') DEFAULT 'active' COMMENT '会话状态',
  `login_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '登录时间',
  `logout_time` timestamp NULL DEFAULT NULL COMMENT '登出时间',
  `last_heartbeat` timestamp NULL DEFAULT NULL COMMENT '最后心跳时间',
  `abnormal_events` json DEFAULT NULL COMMENT '异常事件记录',
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_token` (`session_token`),
  KEY `user_id` (`user_id`),
  KEY `idx_exam_user_status` (`exam_id`,`user_id`,`status`),
  KEY `idx_session_token` (`session_token`),
  CONSTRAINT `exam_sessions_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `examinations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `exam_sessions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci


CREATE TABLE `exam_type` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `type` varchar(100) DEFAULT NULL,
  `name` varchar(100) NOT NULL COMMENT '考试类型名称',
  `description` varchar(500) DEFAULT NULL COMMENT '类型描述',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='考试类型表'


CREATE TABLE `examinations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` varchar(255) DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `created_by` bigint NOT NULL COMMENT '创建者ID',
  `end_time` varchar(255) DEFAULT NULL,
  `duration` int NOT NULL COMMENT '考试时长(分钟)',
  `late_limit` int DEFAULT '30' COMMENT '迟到限制(分钟)',
  `early_submit_limit` int DEFAULT '30' COMMENT '提前交卷限制(分钟)',
  `max_attempts` int DEFAULT '1' COMMENT '最大尝试次数',
  `supervisor_ids` json DEFAULT NULL COMMENT '监考老师ID列表',
  `location` varchar(200) DEFAULT NULL COMMENT '考试地点',
  `camera_enabled` tinyint(1) DEFAULT '0' COMMENT '启用摄像头监控',
  `screen_record_enabled` tinyint(1) DEFAULT '0' COMMENT '启用屏幕录制',
  `prevent_switch` tinyint(1) DEFAULT '1' COMMENT '禁止切换窗口',
  `prevent_copy` tinyint(1) DEFAULT '1' COMMENT '禁止复制粘贴',
  `random_questions` tinyint(1) DEFAULT '0' COMMENT '随机题目顺序',
  `random_options` tinyint(1) DEFAULT '0' COMMENT '随机选项顺序',
  `status` enum('draft','scheduled','ongoing','paused','completed','cancelled') DEFAULT 'draft' COMMENT '考试状态',
  `total_participants` int DEFAULT '0' COMMENT '总参与人数',
  `submitted_count` int DEFAULT '0' COMMENT '已提交人数',
  `avg_score` decimal(5,2) DEFAULT '0.00' COMMENT '平均分',
  `pass_rate` decimal(5,2) DEFAULT '0.00' COMMENT '通过率',
  `exam_name` varchar(200) NOT NULL COMMENT '考试名称',
  `sub_title` varchar(300) DEFAULT NULL COMMENT '考试副标题',
  `paper_id` bigint NOT NULL COMMENT '试卷ID',
  `subject_id` bigint NOT NULL COMMENT '科目ID',
  `exam_type` enum('final','midterm','quiz','makeup','practice') NOT NULL COMMENT '考试类型',
  `start_time` varchar(255) DEFAULT NULL,
  `updated_at` varchar(255) DEFAULT NULL,
  `graded_count` int DEFAULT '0' COMMENT '已阅卷人数',
  `ungraded_count` int DEFAULT '0' COMMENT '待阅卷人数',
  `grading_progress` decimal(5,2) DEFAULT '0.00' COMMENT '阅卷进度百分比',
  `total_score` int DEFAULT NULL,
  `invigilator` varchar(255) DEFAULT NULL COMMENT '监考老师',
  `subject_code` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_exam_subject` (`subject_id`),
  KEY `idx_status_time` (`status`,`start_time`),
  KEY `idx_creator` (`created_by`),
  KEY `idx_paper` (`paper_id`),
  CONSTRAINT `fk_exam_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_exam_paper` FOREIGN KEY (`paper_id`) REFERENCES `exam_papers` (`id`),
  CONSTRAINT `fk_exam_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci


CREATE TABLE `file_uploads` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `file_name` varchar(255) NOT NULL COMMENT '文件名',
  `original_name` varchar(255) NOT NULL COMMENT '原始文件名',
  `file_path` varchar(500) NOT NULL COMMENT '文件路径',
  `file_size` bigint NOT NULL COMMENT '文件大小(bytes)',
  `file_type` varchar(100) DEFAULT NULL COMMENT '文件类型',
  `mime_type` varchar(100) DEFAULT NULL COMMENT 'MIME类型',
  `file_hash` varchar(64) DEFAULT NULL COMMENT '文件哈希值',
  `uploaded_by` bigint NOT NULL COMMENT '上传者ID',
  `module_type` enum('question','exam','paper','avatar','document','export') NOT NULL COMMENT '模块类型',
  `module_id` bigint DEFAULT NULL COMMENT '关联模块ID',
  `is_public` tinyint(1) DEFAULT '0' COMMENT '是否公开',
  `access_token` varchar(100) DEFAULT NULL COMMENT '访问令牌',
  `download_count` int DEFAULT '0' COMMENT '下载次数',
  `status` enum('uploading','completed','failed','deleted') DEFAULT 'uploading' COMMENT '状态',
  `error_message` text COMMENT '错误信息',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  KEY `idx_uploader` (`uploaded_by`),
  KEY `idx_module` (`module_type`,`module_id`),
  KEY `idx_hash` (`file_hash`),
  KEY `idx_status` (`status`),
  CONSTRAINT `file_uploads_ibfk_1` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `import_records` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) NOT NULL COMMENT '导入文件名',
  `file_size` bigint DEFAULT NULL COMMENT '文件大小(bytes)',
  `file_type` enum('excel','csv','json') NOT NULL COMMENT '文件类型',
  `import_mode` enum('overwrite','skip','rename') DEFAULT 'skip' COMMENT '导入模式',
  `total_rows` int DEFAULT '0' COMMENT '总行数',
  `success_count` int DEFAULT '0' COMMENT '成功导入数量',
  `failed_count` int DEFAULT '0' COMMENT '失败数量',
  `error_details` json DEFAULT NULL COMMENT '错误详情',
  `status` enum('processing','completed','failed') DEFAULT 'processing',
  `created_by` bigint NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at` DESC),
  CONSTRAINT `import_records_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL COMMENT '通知标题',
  `content` text COMMENT '通知内容',
  `type` enum('system','exam','grade','reminder','announcement') NOT NULL COMMENT '通知类型',
  `priority` enum('low','normal','high','urgent') DEFAULT 'normal' COMMENT '优先级',
  `sender_id` bigint DEFAULT NULL COMMENT '发送者ID',
  `recipient_type` enum('user','class','all') NOT NULL COMMENT '接收者类型',
  `recipient_ids` json DEFAULT NULL COMMENT '接收者ID列表',
  `class_ids` json DEFAULT NULL COMMENT '班级ID列表',
  `send_immediately` tinyint(1) DEFAULT '1' COMMENT '是否立即发送',
  `scheduled_time` timestamp NULL DEFAULT NULL COMMENT '计划发送时间',
  `channels` json DEFAULT NULL COMMENT '发送渠道(email, sms, in_app)',
  `status` enum('draft','scheduled','sent','failed') DEFAULT 'draft' COMMENT '发送状态',
  `sent_count` int DEFAULT '0' COMMENT '已发送数量',
  `read_count` int DEFAULT '0' COMMENT '已读数量',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `sent_at` timestamp NULL DEFAULT NULL COMMENT '发送时间',
  PRIMARY KEY (`id`),
  KEY `idx_type_status` (`type`,`status`),
  KEY `idx_sender` (`sender_id`),
  KEY `idx_created_at` (`created_at` DESC),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `paper_questions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `paper_id` bigint NOT NULL COMMENT '试卷ID',
  `question_id` bigint NOT NULL COMMENT '题目ID',
  `question_order` int NOT NULL COMMENT '题目序号',
  `section_name` varchar(100) DEFAULT NULL COMMENT '题目分组(如：选择题、填空题)',
  `score` decimal(5,2) NOT NULL COMMENT '该题在此试卷中的分值',
  `is_required` tinyint(1) DEFAULT '1' COMMENT '是否必答',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_paper_question` (`paper_id`,`question_id`),
  KEY `question_id` (`question_id`),
  KEY `idx_paper_order` (`paper_id`,`question_order`),
  CONSTRAINT `paper_questions_ibfk_1` FOREIGN KEY (`paper_id`) REFERENCES `exam_papers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `paper_questions_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `question_change_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `question_id` bigint NOT NULL,
  `action` enum('create','update','delete','restore') NOT NULL,
  `old_data` json DEFAULT NULL COMMENT '修改前数据',
  `new_data` json DEFAULT NULL COMMENT '修改后数据',
  `changed_fields` json DEFAULT NULL COMMENT '变更字段列表',
  `changed_by` bigint NOT NULL,
  `change_reason` varchar(255) DEFAULT NULL COMMENT '变更原因',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_question_id` (`question_id`),
  KEY `idx_changed_by` (`changed_by`),
  KEY `idx_created_at` (`created_at` DESC),
  CONSTRAINT `question_change_logs_questions_id_fk` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`),
  CONSTRAINT `question_change_logs_users_id_fk` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `question_options` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `question_id` bigint NOT NULL,
  `option_key` char(1) NOT NULL COMMENT '选项标识(A,B,C,D)',
  `option_value` text NOT NULL COMMENT '选项内容',
  `is_correct` tinyint(1) DEFAULT '0' COMMENT '是否为正确选项',
  `sort_order` tinyint DEFAULT '0' COMMENT '排序',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_question_option` (`question_id`,`option_key`),
  KEY `idx_question_id` (`question_id`),
  CONSTRAINT `question_options_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `question_tags` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `question_id` bigint NOT NULL,
  `tag_id` bigint NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `create_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_question_tag` (`question_id`,`tag_id`),
  KEY `idx_question_id` (`question_id`),
  KEY `idx_tag_id` (`tag_id`),
  CONSTRAINT `question_tags_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `question_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `question_usage_stats` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `question_id` bigint NOT NULL,
  `exam_id` bigint DEFAULT NULL COMMENT '考试ID（如果是考试中使用）',
  `answer_count` int DEFAULT '0' COMMENT '答题人数',
  `correct_count` int DEFAULT '0' COMMENT '答对人数',
  `correct_rate` decimal(5,2) DEFAULT '0.00' COMMENT '正确率',
  `avg_time` decimal(6,2) DEFAULT NULL COMMENT '平均答题时间(秒)',
  `difficulty_index` decimal(4,3) DEFAULT NULL COMMENT '难度系数',
  `discrimination` decimal(4,3) DEFAULT NULL COMMENT '区分度',
  `usage_date` date NOT NULL COMMENT '使用日期',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_question_usage_date` (`question_id`,`usage_date`),
  KEY `idx_question_id` (`question_id`),
  KEY `idx_usage_date` (`usage_date` DESC),
  CONSTRAINT `question_usage_stats_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci


CREATE TABLE `questions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `content` text NOT NULL COMMENT '题目内容',
  `type` enum('single_choice','multiple_choice','true_false','fill_blank','essay') NOT NULL COMMENT '题型',
  `answer` text NOT NULL COMMENT '正确答案（JSON格式存储）',
  `difficulty` enum('easy','medium','hard') DEFAULT 'medium' COMMENT '难度',
  `score` decimal(4,1) DEFAULT '1.0' COMMENT '分值',
  `explanation` text COMMENT '题目解析',
  `subject_id` bigint NOT NULL COMMENT '学科ID',
  `status` enum('draft','published','archived') DEFAULT 'draft' COMMENT '状态',
  `usage_count` int DEFAULT '0' COMMENT '使用次数',
  `correct_count` int DEFAULT '0' COMMENT '答对次数',
  `total_attempts` int DEFAULT '0' COMMENT '总答题次数',
  `created_by` bigint NOT NULL COMMENT '创建人ID',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT '软删除时间',
  `correctCount` int DEFAULT NULL,
  `createdAt` datetime(6) DEFAULT NULL,
  `totalAttempts` int DEFAULT NULL,
  `usageCount` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_subject_type` (`subject_id`,`type`),
  KEY `idx_difficulty_status` (`difficulty`,`status`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_usage_count` (`usage_count` DESC),
  CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`),
  CONSTRAINT `questions_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci


CREATE TABLE `search_history` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `search_name` varchar(100) DEFAULT NULL COMMENT '搜索名称',
  `search_params` json NOT NULL COMMENT '搜索参数',
  `result_count` int DEFAULT '0' COMMENT '搜索结果数量',
  `is_saved` tinyint(1) DEFAULT '0' COMMENT '是否保存',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_is_saved` (`is_saved`),
  KEY `idx_created_at` (`created_at` DESC),
  CONSTRAINT `search_history_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci


CREATE TABLE `subjects` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '学科名称',
  `code` varchar(50) DEFAULT NULL COMMENT '学科编码',
  `description` text COMMENT '学科描述',
  `parent_id` bigint DEFAULT NULL COMMENT '父级学科ID',
  `level` tinyint DEFAULT '1' COMMENT '层级',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `update_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `system_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL COMMENT '配置键',
  `setting_value` text COMMENT '配置值',
  `setting_type` enum('string','number','boolean','json') DEFAULT 'string' COMMENT '配置类型',
  `category` varchar(50) DEFAULT NULL COMMENT '配置分类(personal, teaching, class, grading, interface, notification)',
  `description` text COMMENT '配置描述',
  `is_public` tinyint(1) DEFAULT '0' COMMENT '是否为公共配置',
  `created_by` bigint DEFAULT NULL COMMENT '创建者ID',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`),
  KEY `created_by` (`created_by`),
  KEY `idx_category` (`category`),
  KEY `idx_key` (`setting_key`),
  CONSTRAINT `system_settings_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `tags` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL COMMENT '标签名称',
  `color` varchar(7) DEFAULT '#3498db' COMMENT '标签颜色',
  `usage_count` int DEFAULT '0' COMMENT '使用次数',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `usage_cunt` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_name` (`name`),
  KEY `idx_usage_count` (`usage_count` DESC)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `user_classes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `class_id` bigint NOT NULL COMMENT '班级ID',
  `role` enum('student','teacher') NOT NULL COMMENT '在班级中的角色',
  `join_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
  `status` enum('active','inactive') DEFAULT 'active' COMMENT '状态',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_class` (`user_id`,`class_id`),
  KEY `idx_class_role` (`class_id`,`role`),
  CONSTRAINT `user_classes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_classes_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `user_notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `notification_id` bigint NOT NULL COMMENT '通知ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `is_read` tinyint(1) DEFAULT '0' COMMENT '是否已读',
  `read_at` timestamp NULL DEFAULT NULL COMMENT '阅读时间',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '是否删除',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_notification_user` (`notification_id`,`user_id`),
  KEY `idx_user_read` (`user_id`,`is_read`),
  KEY `idx_user_created` (`user_id`,`created_at` DESC),
  CONSTRAINT `user_notifications_ibfk_1` FOREIGN KEY (`notification_id`) REFERENCES `notifications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_notifications_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci


CREATE TABLE `user_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `setting_key` varchar(100) NOT NULL COMMENT '配置键',
  `setting_value` text COMMENT '配置值',
  `category` varchar(50) DEFAULT NULL COMMENT '配置分类',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_setting` (`user_id`,`setting_key`),
  KEY `idx_user_category` (`user_id`,`category`),
  CONSTRAINT `user_settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci


CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `email` varchar(100) NOT NULL COMMENT '邮箱',
  `password` varchar(255) NOT NULL COMMENT '密码',
  `role` enum('admin','teacher','student') NOT NULL DEFAULT 'student' COMMENT '角色',
  `real_name` varchar(100) DEFAULT NULL COMMENT '真实姓名',
  `phone` varchar(20) DEFAULT NULL COMMENT '电话号码',
  `avatar` varchar(255) DEFAULT NULL COMMENT '头像URL',
  `status` enum('active','inactive','banned') DEFAULT 'active' COMMENT '状态',
  `last_login_at` timestamp NULL DEFAULT NULL COMMENT '最后登录时间',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `student_id` varchar(50) DEFAULT NULL COMMENT '学号/工号',
  `department` varchar(100) DEFAULT NULL COMMENT '院系/部门',
  `grade` varchar(20) DEFAULT NULL COMMENT '年级(学生)/职称(教师)',
  `major` varchar(100) DEFAULT NULL COMMENT '专业',
  `notification_settings` json DEFAULT NULL COMMENT '通知设置',
  `class_name` varchar(255) DEFAULT NULL COMMENT '班级',
  `password_hash` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `student_id` (`student_id`),
  KEY `idx_username` (`username`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci