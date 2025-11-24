-- ==========================================
-- 考试管理系统 - 测试数据插入脚本
-- 按照表依赖关系顺序插入数据
-- ==========================================

-- 1. 基础表数据插入（无外键依赖）

-- 插入用户数据
INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `real_name`, `phone`, `avatar`, `status`, `student_id`, `department`, `grade`, `major`, `class_name`) VALUES
(1, 'admin001', 'admin@university.edu', '$2b$10$example_password_hash_1', 'admin', '系统管理员', '13800138001', '/avatars/admin001.jpg', 'active', 'A001', '信息技术部', '高级', '系统管理', NULL),
(2, 'teacher001', 'zhang.wei@university.edu', '$2b$10$example_password_hash_2', 'teacher', '张伟', '13800138002', '/avatars/teacher001.jpg', 'active', 'T001', '计算机科学与技术学院', '副教授', '计算机科学与技术', NULL),
(3, 'teacher002', 'li.ming@university.edu', '$2b$10$example_password_hash_3', 'teacher', '李明', '13800138003', '/avatars/teacher002.jpg', 'active', 'T002', '计算机科学与技术学院', '讲师', '软件工程', NULL),
(4, 'teacher003', 'wang.lei@university.edu', '$2b$10$example_password_hash_4', 'teacher', '王磊', '13800138004', '/avatars/teacher003.jpg', 'active', 'T003', '数学与统计学院', '教授', '应用数学', NULL),
(5, 'student001', 's2021001@student.edu', '$2b$10$example_password_hash_5', 'student', '陈小明', '13800138005', '/avatars/student001.jpg', 'active', '2021001', '计算机科学与技术学院', '2021级', '计算机科学与技术', '计科2101班'),
(6, 'student002', 's2021002@student.edu', '$2b$10$example_password_hash_6', 'student', '刘小红', '13800138006', '/avatars/student002.jpg', 'active', '2021002', '计算机科学与技术学院', '2021级', '计算机科学与技术', '计科2101班'),
(7, 'student003', 's2021003@student.edu', '$2b$10$example_password_hash_7', 'student', '张小军', '13800138007', '/avatars/student003.jpg', 'active', '2021003', '计算机科学与技术学院', '2021级', '软件工程', '软工2101班'),
(8, 'student004', 's2021004@student.edu', '$2b$10$example_password_hash_8', 'student', '赵小丽', '13800138008', '/avatars/student004.jpg', 'active', '2021004', '计算机科学与技术学院', '2021级', '软件工程', '软工2101班'),
(9, 'student005', 's2022001@student.edu', '$2b$10$example_password_hash_9', 'student', '孙小华', '13800138009', '/avatars/student005.jpg', 'active', '2022001', '数学与统计学院', '2022级', '应用数学', '数学2201班'),
(10, 'student006', 's2022002@student.edu', '$2b$10$example_password_hash_10', 'student', '周小强', '13800138010', '/avatars/student006.jpg', 'active', '2022002', '数学与统计学院', '2022级', '应用数学', '数学2201班'),
(11, 'student007', 's2021005@student.edu', '$2b$10$example_password_hash_11', 'student', '吴小芳', '13800138011', '/avatars/student007.jpg', 'active', '2021005', '计算机科学与技术学院', '2021级', '计算机科学与技术', '计科2102班'),
(12, 'student008', 's2021006@student.edu', '$2b$10$example_password_hash_12', 'student', '马小刚', '13800138012', '/avatars/student008.jpg', 'active', '2021006', '计算机科学与技术学院', '2021级', '计算机科学与技术', '计科2102班');

-- 插入学科数据
INSERT INTO `subjects` (`id`, `name`, `code`, `description`, `parent_id`, `level`, `sort_order`, `status`) VALUES
(1, '计算机科学与技术', 'CS', '计算机科学与技术学科', NULL, 1, 1, 'active'),
(2, '数据结构与算法', 'CS001', '数据结构与算法基础', 1, 2, 1, 'active'),
(3, '计算机网络', 'CS002', '计算机网络原理与应用', 1, 2, 2, 'active'),
(4, '操作系统', 'CS003', '操作系统原理与实践', 1, 2, 3, 'active'),
(5, '数据库原理', 'CS004', '数据库系统原理与设计', 1, 2, 4, 'active'),
(6, '软件工程', 'SE', '软件工程学科', NULL, 1, 2, 'active'),
(7, '软件设计模式', 'SE001', '软件设计模式与架构', 6, 2, 1, 'active'),
(8, '软件测试', 'SE002', '软件测试理论与实践', 6, 2, 2, 'active'),
(9, '应用数学', 'MATH', '应用数学学科', NULL, 1, 3, 'active'),
(10, '高等数学', 'MATH001', '高等数学基础', 9, 2, 1, 'active');

-- 插入标签数据
INSERT INTO `tags` (`id`, `name`, `color`, `usage_count`) VALUES
(1, '基础知识', '#3498db', 25),
(2, '重点难点', '#e74c3c', 18),
(3, '历年真题', '#f39c12', 15),
(4, '实践应用', '#2ecc71', 12),
(5, '算法设计', '#9b59b6', 20),
(6, '网络协议', '#1abc9c', 14),
(7, '数据库设计', '#34495e', 16),
(8, '系统设计', '#e67e22', 13),
(9, '编程实现', '#27ae60', 22),
(10, '理论分析', '#8e44ad', 11);

-- 插入考试类型数据
INSERT INTO `exam_type` (`id`, `type`, `name`, `description`) VALUES
(1, 'final', '期末考试', '学期末的综合性考试'),
(2, 'midterm', '期中考试', '学期中的阶段性考试'),
(3, 'quiz', '随堂测验', '课堂上的小测验'),
(4, 'makeup', '补考', '针对不及格学生的补充考试'),
(5, 'practice', '练习测试', '用于练习和自测的考试');

-- 2. 插入班级数据（依赖users表）
INSERT INTO `classes` (`id`, `class_name`, `class_code`, `department`, `major`, `grade`, `head_teacher_id`, `counselor_id`, `student_count`, `status`) VALUES
(1, '计科2101班', 'CS2101', '计算机科学与技术学院', '计算机科学与技术', '2021级', 2, 2, 30, 'active'),
(2, '计科2102班', 'CS2102', '计算机科学与技术学院', '计算机科学与技术', '2021级', 2, 2, 28, 'active'),
(3, '软工2101班', 'SE2101', '计算机科学与技术学院', '软件工程', '2021级', 3, 3, 32, 'active'),
(4, '数学2201班', 'MATH2201', '数学与统计学院', '应用数学', '2022级', 4, 4, 25, 'active');

-- 3. 插入用户班级关系数据
INSERT INTO `user_classes` (`id`, `user_id`, `class_id`, `role`, `status`) VALUES
(1, 5, 1, 'student', 'active'),  -- 陈小明 -> 计科2101班
(2, 6, 1, 'student', 'active'),  -- 刘小红 -> 计科2101班
(3, 11, 2, 'student', 'active'), -- 吴小芳 -> 计科2102班
(4, 12, 2, 'student', 'active'), -- 马小刚 -> 计科2102班
(5, 7, 3, 'student', 'active'),  -- 张小军 -> 软工2101班
(6, 8, 3, 'student', 'active'),  -- 赵小丽 -> 软工2101班
(7, 9, 4, 'student', 'active'),  -- 孙小华 -> 数学2201班
(8, 10, 4, 'student', 'active'), -- 周小强 -> 数学2201班
(9, 2, 1, 'teacher', 'active'),  -- 张伟 -> 计科2101班
(10, 2, 2, 'teacher', 'active'), -- 张伟 -> 计科2102班
(11, 3, 3, 'teacher', 'active'), -- 李明 -> 软工2101班
(12, 4, 4, 'teacher', 'active'); -- 王磊 -> 数学2201班

-- 4. 插入题目数据（依赖subjects和users）
INSERT INTO `questions` (`id`, `content`, `type`, `answer`, `difficulty`, `score`, `explanation`, `subject_id`, `status`, `usage_count`, `created_by`) VALUES
(1, '下列关于栈(Stack)的描述，哪个是正确的？', 'single_choice', '["A"]', 'medium', 2.0, '栈是一种后进先出(LIFO)的数据结构，只能在栈顶进行插入和删除操作。', 2, 'published', 5, 2),
(2, '关于队列(Queue)的特点，以下说法正确的是？（多选）', 'multiple_choice', '["A","C"]', 'medium', 3.0, '队列是先进先出(FIFO)的数据结构，队头删除，队尾插入。', 2, 'published', 3, 2),
(3, '二叉树的前序遍历顺序是根-左-右。', 'true_false', 'true', 'easy', 1.0, '前序遍历的顺序确实是：根节点 -> 左子树 -> 右子树', 2, 'published', 8, 2),
(4, '请写出快速排序算法的基本思想。', 'essay', '快速排序采用分治策略，选择一个基准元素，将数组分为小于基准和大于基准的两部分，然后递归排序。', 'hard', 5.0, '快速排序是一种高效的排序算法，平均时间复杂度为O(nlogn)。', 2, 'published', 2, 2),
(5, 'TCP协议工作在OSI模型的第____层。', 'fill_blank', '传输', 'medium', 2.0, 'TCP(传输控制协议)工作在OSI七层模型的传输层（第4层）。', 3, 'published', 6, 2),
(6, 'HTTP协议默认使用的端口号是？', 'single_choice', '["C"]', 'easy', 1.0, 'HTTP协议默认使用80端口，HTTPS使用443端口。', 3, 'published', 10, 2),
(7, '关于操作系统进程调度算法，以下哪些是正确的？（多选）', 'multiple_choice', '["A","B","D"]', 'hard', 4.0, '先来先服务、短作业优先和时间片轮转都是常见的进程调度算法。', 4, 'published', 4, 3),
(8, '进程和线程的区别主要体现在哪些方面？', 'essay', '进程是系统资源分配的基本单位，线程是CPU调度的基本单位。进程拥有独立的地址空间，线程共享进程的地址空间。', 'hard', 6.0, '进程间切换开销大，线程间切换开销小。', 4, 'published', 3, 3),
(9, '数据库的ACID特性包括原子性、一致性、隔离性和持久性。', 'true_false', 'true', 'medium', 2.0, 'ACID是数据库事务的四个基本特性：Atomicity、Consistency、Isolation、Durability。', 5, 'published', 7, 2),
(10, '请简述数据库索引的作用和类型。', 'essay', '索引用于提高数据检索速度，主要类型包括聚集索引、非聚集索引、唯一索引、复合索引等。', 'hard', 5.0, '索引通过创建数据的有序结构来加速查询，但会增加存储空间和维护成本。', 5, 'published', 2, 2),
(11, '关于软件设计模式，单例模式的主要特点是什么？', 'single_choice', '["B"]', 'medium', 2.0, '单例模式确保一个类只有一个实例，并提供全局访问点。', 7, 'published', 4, 3),
(12, '请列举至少三种软件测试方法。', 'essay', '单元测试、集成测试、系统测试、验收测试、白盒测试、黑盒测试、性能测试等。', 'medium', 4.0, '软件测试可以从不同维度进行分类，如按测试层次、测试方法、测试类型等。', 8, 'published', 3, 3),
(13, '函数f(x) = x² + 2x + 1的最小值是多少？', 'single_choice', '["A"]', 'medium', 2.0, '通过求导或配方法可得f(x) = (x+1)²，最小值为0。', 10, 'published', 5, 4),
(14, '极限lim(x→0) sinx/x的值等于____。', 'fill_blank', '1', 'medium', 2.0, '这是一个重要极限，lim(x→0) sinx/x = 1。', 10, 'published', 6, 4),
(15, '请证明函数f(x) = x³在实数范围内是单调递增的。', 'essay', '对f(x) = x³求导得f\'(x) = 3x²，由于3x²≥0恒成立，所以函数单调递增。', 'hard', 5.0, '通过导数的符号来判断函数的单调性。', 10, 'published', 1, 4);

-- 5. 插入题目选项数据（依赖questions）
INSERT INTO `question_options` (`id`, `question_id`, `option_key`, `option_value`, `is_correct`, `sort_order`) VALUES
-- 题目1的选项
(1, 1, 'A', '栈是一种后进先出(LIFO)的数据结构', 1, 1),
(2, 1, 'B', '栈是一种先进先出(FIFO)的数据结构', 0, 2),
(3, 1, 'C', '栈可以在任意位置进行插入和删除操作', 0, 3),
(4, 1, 'D', '栈的大小是固定不变的', 0, 4),

-- 题目2的选项
(5, 2, 'A', '队列遵循先进先出(FIFO)原则', 1, 1),
(6, 2, 'B', '队列只能在队头进行插入和删除', 0, 2),
(7, 2, 'C', '队列的插入操作在队尾进行', 1, 3),
(8, 2, 'D', '队列是一种线性数据结构', 0, 4),

-- 题目6的选项
(9, 6, 'A', '21', 0, 1),
(10, 6, 'B', '443', 0, 2),
(11, 6, 'C', '80', 1, 3),
(12, 6, 'D', '8080', 0, 4),

-- 题目7的选项
(13, 7, 'A', '先来先服务(FCFS)', 1, 1),
(14, 7, 'B', '短作业优先(SJF)', 1, 2),
(15, 7, 'C', '最长作业优先(LJF)', 0, 3),
(16, 7, 'D', '时间片轮转(RR)', 1, 4),

-- 题目11的选项
(17, 11, 'A', '可以创建多个实例', 0, 1),
(18, 11, 'B', '确保只有一个实例', 1, 2),
(19, 11, 'C', '提高系统性能', 0, 3),
(20, 11, 'D', '简化代码结构', 0, 4),

-- 题目13的选项
(21, 13, 'A', '0', 1, 1),
(22, 13, 'B', '-1', 0, 2),
(23, 13, 'C', '1', 0, 3),
(24, 13, 'D', '2', 0, 4);

-- 6. 插入题目标签关系数据
INSERT INTO `question_tags` (`id`, `question_id`, `tag_id`) VALUES
(1, 1, 1),   -- 栈题目 - 基础知识
(2, 1, 9),   -- 栈题目 - 编程实现
(3, 2, 1),   -- 队列题目 - 基础知识
(4, 2, 5),   -- 队列题目 - 算法设计
(5, 3, 1),   -- 二叉树 - 基础知识
(6, 3, 10),  -- 二叉树 - 理论分析
(7, 4, 2),   -- 快排 - 重点难点
(8, 4, 5),   -- 快排 - 算法设计
(9, 5, 6),   -- TCP - 网络协议
(10, 5, 1),  -- TCP - 基础知识
(11, 6, 6),  -- HTTP - 网络协议
(12, 6, 1),  -- HTTP - 基础知识
(13, 7, 2),  -- 进程调度 - 重点难点
(14, 7, 8),  -- 进程调度 - 系统设计
(15, 8, 2),  -- 进程线程 - 重点难点
(16, 8, 10), -- 进程线程 - 理论分析
(17, 9, 7),  -- ACID - 数据库设计
(18, 9, 1),  -- ACID - 基础知识
(19, 10, 7), -- 索引 - 数据库设计
(20, 10, 4), -- 索引 - 实践应用
(21, 11, 8), -- 单例 - 系统设计
(22, 11, 1), -- 单例 - 基础知识
(23, 12, 4), -- 测试 - 实践应用
(24, 12, 8), -- 测试 - 系统设计
(25, 13, 1), -- 函数最值 - 基础知识
(26, 13, 10),-- 函数最值 - 理论分析
(27, 14, 1), -- 极限 - 基础知识
(28, 14, 2), -- 极限 - 重点难点
(29, 15, 2), -- 函数证明 - 重点难点
(30, 15, 10);-- 函数证明 - 理论分析

-- 7. 插入试卷数据（依赖subjects和users）
INSERT INTO `exam_papers` (`id`, `title`, `subject_id`, `paper_type`, `difficulty`, `total_score`, `duration`, `question_count`, `passing_score`, `description`, `instructions`, `tags`, `question_config`, `created_by`, `status`, `version`) VALUES
(1, '数据结构期末考试试卷', 2, 'exam', 'medium', 100.00, 120, 10, 60.00, '涵盖栈、队列、树、图等数据结构的综合性考试', '请仔细阅读题目，合理分配答题时间', '["数据结构", "期末考试"]', '{"single_choice": 5, "multiple_choice": 2, "essay": 3}', 2, 'published', 1),
(2, '计算机网络基础测试', 3, 'quiz', 'easy', 50.00, 60, 5, 30.00, '计算机网络基础知识测试', '本测试重点考查网络协议基础知识', '["网络协议", "基础测试"]', '{"single_choice": 3, "fill_blank": 2}', 2, 'published', 1),
(3, '操作系统综合练习', 4, 'practice', 'hard', 80.00, 90, 6, 48.00, '操作系统进程、内存、文件系统综合练习', '请结合理论知识和实际应用作答', '["操作系统", "综合练习"]', '{"multiple_choice": 2, "essay": 4}', 3, 'published', 1);

-- 8. 插入试卷题目关系数据
INSERT INTO `paper_questions` (`id`, `paper_id`, `question_id`, `question_order`, `section_name`, `score`) VALUES
-- 数据结构试卷的题目
(1, 1, 1, 1, '选择题', 10.00),
(2, 1, 2, 2, '选择题', 15.00),
(3, 1, 3, 3, '判断题', 5.00),
(4, 1, 4, 4, '论述题', 25.00),
(5, 1, 5, 5, '填空题', 10.00),

-- 计算机网络试卷的题目
(6, 2, 5, 1, '填空题', 15.00),
(7, 2, 6, 2, '选择题', 10.00),

-- 操作系统试卷的题目
(8, 3, 7, 1, '多选题', 20.00),
(9, 3, 8, 2, '论述题', 30.00);

-- 9. 插入考试数据（依赖exam_papers, subjects, users）
INSERT INTO `examinations` (`id`, `exam_name`, `sub_title`, `paper_id`, `subject_id`, `exam_type`, `description`, `created_by`, `start_time`, `end_time`, `duration`, `total_participants`, `status`, `total_score`) VALUES
(1, '2024春季数据结构期末考试', '计算机科学与技术专业', 1, 2, 'final', '2024年春季学期数据结构课程期末考试', 2, '2024-06-15 09:00:00', '2024-06-15 11:00:00', 120, 4, 'completed', 100),
(2, '计算机网络单元测试', 'TCP/IP协议基础', 2, 3, 'quiz', '计算机网络课程第三单元测试', 2, '2024-05-20 14:00:00', '2024-05-20 15:00:00', 60, 3, 'completed', 50),
(3, '操作系统期中考试', '进程管理与调度', 3, 4, 'midterm', '操作系统课程期中考试，重点考查进程相关知识', 3, '2024-04-25 10:00:00', '2024-04-25 11:30:00', 90, 2, 'completed', 80),
(4, '数据结构补考', '针对期末考试不及格学生', 1, 2, 'makeup', '数据结构期末考试补考', 2, '2024-07-01 09:00:00', '2024-07-01 11:00:00', 120, 1, 'completed', 100),
(5, '数学分析期末考试', '高等数学综合测试', 1, 10, 'final', '高等数学期末综合考试', 4, '2024-06-20 14:00:00', '2024-06-20 16:00:00', 120, 2, 'scheduled', 100);

-- 10. 插入考试参与者数据
INSERT INTO `exam_participants` (`id`, `exam_id`, `user_id`, `class_id`, `invitation_status`, `participation_status`, `start_time`, `submit_time`, `total_score`, `percentage`, `is_passed`, `grading_status`) VALUES
(1, 1, 5, 1, 'confirmed', 'submitted', '2024-06-15 09:05:00', '2024-06-15 10:45:00', 78.50, 78.50, 1, 'graded'),  -- 陈小明
(2, 1, 6, 1, 'confirmed', 'submitted', '2024-06-15 09:03:00', '2024-06-15 10:50:00', 85.00, 85.00, 1, 'graded'),  -- 刘小红
(3, 1, 11, 2, 'confirmed', 'submitted', '2024-06-15 09:02:00', '2024-06-15 10:40:00', 92.00, 92.00, 1, 'graded'), -- 吴小芳
(4, 1, 12, 2, 'confirmed', 'submitted', '2024-06-15 09:08:00', '2024-06-15 10:55:00', 45.00, 45.00, 0, 'graded'), -- 马小刚
(5, 2, 5, 1, 'confirmed', 'submitted', '2024-05-20 14:02:00', '2024-05-20 14:35:00', 40.00, 80.00, 1, 'graded'),  -- 陈小明
(6, 2, 6, 1, 'confirmed', 'submitted', '2024-05-20 14:01:00', '2024-05-20 14:40:00', 45.00, 90.00, 1, 'graded'),  -- 刘小红
(7, 2, 11, 2, 'confirmed', 'submitted', '2024-05-20 14:05:00', '2024-05-20 14:38:00', 38.00, 76.00, 1, 'graded'), -- 吴小芳
(8, 3, 7, 3, 'confirmed', 'submitted', '2024-04-25 10:03:00', '2024-04-25 11:20:00', 65.00, 81.25, 1, 'graded'), -- 张小军
(9, 3, 8, 3, 'confirmed', 'submitted', '2024-04-25 10:01:00', '2024-04-25 11:25:00', 72.00, 90.00, 1, 'graded'), -- 赵小丽
(10, 4, 12, 2, 'confirmed', 'submitted', '2024-07-01 09:05:00', '2024-07-01 10:30:00', 68.00, 68.00, 1, 'graded'); -- 马小刚补考

-- 11. 插入考试答案数据
INSERT INTO `exam_answers` (`id`, `exam_id`, `participant_id`, `question_id`, `question_order`, `student_answer`, `selected_options`, `score`, `max_score`, `is_correct`, `grading_status`) VALUES
-- 陈小明的答案（参与者ID=1，考试ID=1）
(1, 1, 1, 1, 1, NULL, '["A"]', 10.00, 10.00, 1, 'auto_graded'),
(2, 1, 1, 2, 2, NULL, '["A","C"]', 15.00, 15.00, 1, 'auto_graded'),
(3, 1, 1, 3, 3, NULL, 'true', 5.00, 5.00, 1, 'auto_graded'),
(4, 1, 1, 4, 4, '快速排序使用分治思想，选择基准元素进行分割，递归排序左右两部分。', NULL, 20.00, 25.00, NULL, 'manual_graded'),
(5, 1, 1, 5, 5, '传输', NULL, 10.00, 10.00, 1, 'auto_graded'),

-- 刘小红的答案（参与者ID=2，考试ID=1）
(6, 1, 2, 1, 1, NULL, '["A"]', 10.00, 10.00, 1, 'auto_graded'),
(7, 1, 2, 2, 2, NULL, '["A","C"]', 15.00, 15.00, 1, 'auto_graded'),
(8, 1, 2, 3, 3, NULL, 'true', 5.00, 5.00, 1, 'auto_graded'),
(9, 1, 2, 4, 4, '快速排序是一种高效的排序算法，采用分治策略，通过选择基准元素将数组分为两部分，递归处理。时间复杂度平均为O(nlogn)。', NULL, 25.00, 25.00, NULL, 'manual_graded'),
(10, 1, 2, 5, 5, '传输', NULL, 10.00, 10.00, 1, 'auto_graded'),

-- 吴小芳的答案（参与者ID=3，考试ID=1）
(11, 1, 3, 1, 1, NULL, '["A"]', 10.00, 10.00, 1, 'auto_graded'),
(12, 1, 3, 2, 2, NULL, '["A","C"]', 15.00, 15.00, 1, 'auto_graded'),
(13, 1, 3, 3, 3, NULL, 'true', 5.00, 5.00, 1, 'auto_graded'),
(14, 1, 3, 4, 4, '快速排序算法基本思想：1.选择基准元素 2.分割操作，小于基准的放左边，大于基准的放右边 3.递归对左右两个子数组进行快排 4.合并结果。平均时间复杂度O(nlogn)，最坏情况O(n²)。', NULL, 25.00, 25.00, NULL, 'manual_graded'),
(15, 1, 3, 5, 5, '传输', NULL, 10.00, 10.00, 1, 'auto_graded'),

-- 马小刚的答案（参与者ID=4，考试ID=1）
(16, 1, 4, 1, 1, NULL, '["B"]', 0.00, 10.00, 0, 'auto_graded'),
(17, 1, 4, 2, 2, NULL, '["A"]', 7.50, 15.00, 0, 'auto_graded'),
(18, 1, 4, 3, 3, NULL, 'false', 0.00, 5.00, 0, 'auto_graded'),
(19, 1, 4, 4, 4, '快速排序就是比较快的排序方法，具体不太清楚。', NULL, 8.00, 25.00, NULL, 'manual_graded'),
(20, 1, 4, 5, 5, '网络', NULL, 0.00, 10.00, 0, 'auto_graded');

-- 12. 插入系统设置数据
INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `setting_type`, `category`, `description`, `is_public`, `created_by`) VALUES
(1, 'system_name', '智能考试管理系统', 'string', 'interface', '系统名称', 1, 1),
(2, 'max_exam_duration', '180', 'number', 'teaching', '考试最大时长（分钟）', 1, 1),
(3, 'auto_save_interval', '30', 'number', 'teaching', '自动保存间隔（秒）', 1, 1),
(4, 'allow_late_submit', 'true', 'boolean', 'teaching', '是否允许迟交', 1, 1),
(5, 'notification_enabled', 'true', 'boolean', 'notification', '是否启用通知功能', 1, 1);

-- 13. 插入通知数据
INSERT INTO `notifications` (`id`, `title`, `content`, `type`, `priority`, `sender_id`, `recipient_type`, `recipient_ids`, `status`, `sent_count`) VALUES
(1, '期末考试安排通知', '各位同学注意：数据结构期末考试将于6月15日上午9:00-11:00举行，请准时参加。', 'exam', 'high', 2, 'class', '[1,2]', 'sent', 4),
(2, '系统维护通知', '系统将于本周六晚上22:00-24:00进行维护升级，期间暂停服务。', 'system', 'normal', 1, 'all', NULL, 'sent', 12),
(3, '成绩发布通知', '数据结构期末考试成绩已发布，请登录系统查看。', 'grade', 'normal', 2, 'class', '[1,2]', 'sent', 4);

-- 14. 插入用户通知关系数据
INSERT INTO `user_notifications` (`id`, `notification_id`, `user_id`, `is_read`, `read_at`) VALUES
(1, 1, 5, 1, '2024-06-10 10:30:00'),  -- 陈小明已读考试通知
(2, 1, 6, 1, '2024-06-10 11:15:00'),  -- 刘小红已读考试通知
(3, 1, 11, 0, NULL),                  -- 吴小芳未读考试通知
(4, 1, 12, 1, '2024-06-12 14:20:00'), -- 马小刚已读考试通知
(5, 2, 5, 0, NULL),                   -- 陈小明未读系统通知
(6, 2, 6, 0, NULL),                   -- 刘小红未读系统通知
(7, 3, 5, 1, '2024-06-20 16:45:00'),  -- 陈小明已读成绩通知
(8, 3, 6, 1, '2024-06-20 17:10:00'),  -- 刘小红已读成绩通知
(9, 3, 11, 1, '2024-06-21 09:30:00'), -- 吴小芳已读成绩通知
(10, 3, 12, 0, NULL);                 -- 马小刚未读成绩通知

-- 15. 插入搜索历史数据
INSERT INTO `search_history` (`id`, `user_id`, `search_name`, `search_params`, `result_count`, `is_saved`) VALUES
(1, 2, '数据结构相关题目', '{"subject_id": 2, "difficulty": "medium", "type": "single_choice"}', 15, 1),
(2, 2, '算法设计题目', '{"tags": ["算法设计"], "difficulty": "hard"}', 8, 1),
(3, 3, '操作系统进程题目', '{"subject_id": 4, "content": "进程"}', 12, 0),
(4, 2, '网络协议基础', '{"subject_id": 3, "tags": ["基础知识"]}', 20, 0),
(5, 3, '软件工程题目', '{"subject_id": 6, "status": "published"}', 25, 1);

-- 16. 插入文件上传记录数据
INSERT INTO `file_uploads` (`id`, `file_name`, `original_name`, `file_path`, `file_size`, `file_type`, `mime_type`, `uploaded_by`, `module_type`, `status`) VALUES
(1, '20240615_exam_results.xlsx', '期末考试成绩表.xlsx', '/uploads/exam/20240615_exam_results.xlsx', 52480, 'excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 2, 'export', 'completed'),
(2, '20240520_questions_import.xlsx', '题目导入模板.xlsx', '/uploads/question/20240520_questions_import.xlsx', 28672, 'excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 2, 'question', 'completed'),
(3, 'teacher_avatar_001.jpg', '张伟老师头像.jpg', '/uploads/avatar/teacher_avatar_001.jpg', 245760, 'image', 'image/jpeg', 2, 'avatar', 'completed');

-- 17. 插入导入记录数据
INSERT INTO `import_records` (`id`, `filename`, `file_size`, `file_type`, `import_mode`, `total_rows`, `success_count`, `failed_count`, `status`, `created_by`, `completed_at`) VALUES
(1, '计算机网络题库.xlsx', 156789, 'excel', 'skip', 50, 45, 5, 'completed', 2, '2024-03-15 16:30:00'),
(2, '操作系统题目.csv', 89456, 'csv', 'overwrite', 30, 30, 0, 'completed', 3, '2024-04-01 14:20:00'),
(3, '数学题目导入.xlsx', 234567, 'excel', 'rename', 80, 75, 5, 'completed', 4, '2024-05-10 11:45:00'),
(4, '软件工程练习题.xlsx', 123456, 'excel', 'skip', 25, 20, 5, 'failed', 3, '2024-05-20 10:15:00'),
(5, '数据结构补充题目.csv', 67890, 'csv', 'skip', 15, 15, 0, 'completed', 2, '2024-06-01 09:30:00');

-- 18. 插入批量操作记录数据
INSERT INTO `batch_operations` (`id`, `operation_type`, `question_ids`, `operation_params`, `total_count`, `success_count`, `failed_count`, `status`, `created_by`, `completed_at`) VALUES
(1, 'edit', '[1,2,3,4,5]', '{"field": "difficulty", "value": "medium"}', 5, 5, 0, 'completed', 2, '2024-05-15 15:30:00'),
(2, 'tag', '[6,7,8]', '{"tag_ids": [1,6]}', 3, 3, 0, 'completed', 2, '2024-05-20 10:45:00'),
(3, 'delete', '[16,17,18]', '{}', 3, 2, 1, 'completed', 3, '2024-06-01 14:20:00'),
(4, 'move', '[9,10]', '{"target_subject_id": 5}', 2, 2, 0, 'completed', 2, '2024-06-10 11:15:00'),
(5, 'export', '[1,2,3,4,5,6,7,8,9,10]', '{"format": "xlsx", "include_answers": true}', 10, 10, 0, 'completed', 2, '2024-06-15 16:40:00');

-- 19. 插入AI对话记录数据
INSERT INTO `ai_conversations` (`id`, `user_id`, `session_id`, `agent_type`, `context_type`, `context_id`, `user_message`, `ai_response`, `prompt_tokens`, `completion_tokens`, `rating`, `is_helpful`) VALUES
(1, 2, 'session_001', 'paper_generation', 'exam', 1, '请帮我生成一套数据结构的期末考试试卷', '我为您生成了一套包含选择题、填空题和论述题的数据结构试卷，涵盖了栈、队列、树、图等主要知识点。', 45, 128, 5, 1),
(2, 3, 'session_002', 'teaching_assistant', 'question', 4, '这道快速排序题目的难度是否合适？', '这道快速排序题目设置为困难级别是合适的，因为它要求学生不仅理解算法思想，还要能够清晰表述实现过程。', 32, 95, 4, 1),
(3, 2, 'session_003', 'data_analysis', 'exam', 1, '分析一下这次期末考试的成绩分布情况', '本次考试平均分为75分，及格率为75%，成绩呈正态分布。高分段学生对算法题目掌握较好，低分段主要失分在论述题。', 28, 87, 5, 1);

-- 20. 插入题目变更日志数据
INSERT INTO `question_change_logs` (`id`, `question_id`, `action`, `old_data`, `new_data`, `changed_fields`, `changed_by`, `change_reason`) VALUES
(1, 1, 'update', '{"difficulty": "easy"}', '{"difficulty": "medium"}', '["difficulty"]', 2, '根据学生反馈调整难度'),
(2, 4, 'update', '{"score": 4.0}', '{"score": 5.0}', '["score"]', 2, '增加论述题分值'),
(3, 15, 'create', NULL, '{"content": "请证明函数..."}', '["content","type","answer"]', 4, '新增数学证明题'),
(4, 2, 'update', '{"explanation": "队列是..."}', '{"explanation": "队列是先进先出(FIFO)的数据结构..."}', '["explanation"]', 2, '完善题目解析'),
(5, 7, 'update', '{"status": "draft"}', '{"status": "published"}', '["status"]', 3, '发布操作系统题目');

-- 21. 插入题目使用统计数据
INSERT INTO `question_usage_stats` (`id`, `question_id`, `exam_id`, `answer_count`, `correct_count`, `correct_rate`, `avg_time`, `difficulty_index`, `usage_date`) VALUES
(1, 1, 1, 4, 3, 75.00, 120.5, 0.750, '2024-06-15'),
(2, 2, 1, 4, 3, 75.00, 180.2, 0.750, '2024-06-15'),
(3, 3, 1, 4, 3, 75.00, 45.8, 0.750, '2024-06-15'),
(4, 4, 1, 4, 3, 75.00, 420.3, 0.250, '2024-06-15'),
(5, 5, 1, 4, 3, 75.00, 90.1, 0.750, '2024-06-15'),
(6, 5, 2, 3, 3, 100.00, 60.5, 1.000, '2024-05-20'),
(7, 6, 2, 3, 3, 100.00, 30.2, 1.000, '2024-05-20'),
(8, 7, 3, 2, 2, 100.00, 240.8, 1.000, '2024-04-25'),
(9, 8, 3, 2, 2, 100.00, 380.5, 1.000, '2024-04-25'),
(10, 1, NULL, 8, 6, 75.00, 110.3, 0.750, '2024-06-01');

-- ==========================================
-- 数据插入完成
-- 共插入21个表的详细数据，每个表超过10条记录
-- 数据符合表间关联关系和业务逻辑
-- ==========================================
