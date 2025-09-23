import React, { useState, useEffect } from "react";
import "./index.css";
import {
  StatItem,
  TodoItem,
  NotificationItem,
  UserInfo,
  ChartData,
  ExamData,
} from "../../../interface/workBenchFac";

function Workbench() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showSettings, setShowSettings] = useState(false);

  // 模拟当前登录用户信息
  const [currentUser] = useState<UserInfo>({
    id: "teacher_001",
    name: "张老师",
    role: "teacher",
    department: "计算机科学系",
    classes: ["计科2021-1班", "计科2021-2班", "软工2021-1班"],
    permissions: [
      "create_exam",
      "manage_own_papers",
      "view_own_students",
      "grade_papers",
    ],
  });

  // 根据用户权限过滤的统计数据
  const [stats] = useState<StatItem[]>([
    { label: "我的试卷", value: 8, icon: "fas fa-file-alt", trend: "+2" },
    { label: "我的学生", value: 89, icon: "fas fa-users", trend: "+5" },
    { label: "进行中考试", value: 1, icon: "fas fa-play-circle" },
    {
      label: "待我阅卷",
      value: 12,
      icon: "fas fa-clipboard-check",
      trend: "-3",
    },
  ]);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "1",
      title: "考试提醒",
      message: '您创建的"计算机网络期末考试"将在30分钟后开始',
      type: "warning",
      time: "2分钟前",
      read: false,
    },
    {
      id: "2",
      title: "阅卷提醒",
      message: '计科2021-1班的"数据结构测验"有12份试卷待阅卷',
      type: "warning",
      time: "1小时前",
      read: false,
    },
    {
      id: "3",
      title: "学生提交",
      message: "软工2021-1班已有25名学生完成在线测试",
      type: "info",
      time: "3小时前",
      read: true,
    },
    {
      id: "4",
      title: "成绩统计",
      message: '您的"操作系统期中考试"成绩统计已生成',
      type: "success",
      time: "5小时前",
      read: false,
    },
    {
      id: "5",
      title: "班级通知",
      message: "计科2021-2班有新学生申请加入",
      type: "info",
      time: "昨天",
      read: true,
    },
  ]);

  const chartData: ChartData[] = [
    { label: "已完成", value: 65, color: "#10b981" },
    { label: "进行中", value: 20, color: "#3b82f6" },
    { label: "待开始", value: 15, color: "#f59e0b" },
  ];

  const [todoList, setTodoList] = useState<TodoItem[]>([
    {
      id: "1",
      title: "期末考试阅卷 - 计算机网络",
      deadline: "今天 18:00",
      priority: "high",
    },
    {
      id: "2",
      title: "下周考试安排确认",
      deadline: "明天 12:00",
      priority: "medium",
    },
    {
      id: "3",
      title: "题库整理 - 操作系统章节",
      deadline: "本周内",
      priority: "low",
    },
    {
      id: "4",
      title: "学生成绩统计分析",
      deadline: "周五前",
      priority: "medium",
    },
    { id: "5", title: "试卷模板更新", deadline: "下周一", priority: "low" },
    { id: "6", title: "监考安排审核", deadline: "周三前", priority: "high" },
    { id: "7", title: "学生申请处理", deadline: "本周内", priority: "medium" },
    { id: "8", title: "考试系统维护", deadline: "下周末", priority: "low" },
  ]);

  const recentActivities = [
    { time: "3小时前", text: '完成"数据结构测验"阅卷', type: "success" },
    { time: "昨天 16:30", text: '发布"操作系统期末考试"', type: "info" },
    { time: "昨天 14:20", text: "导入50道新题目到题库", type: "success" },
    { time: "前天 10:15", text: '创建"网络协议专项练习"试卷', type: "info" },
    { time: "3天前", text: "批准学生张三的考试申请", type: "warning" },
    { time: "3天前", text: "更新考试监考安排", type: "info" },
    { time: "4天前", text: '导出"计算机组成原理"成绩单', type: "success" },
    { time: "5天前", text: "设置新的考试时间规则", type: "warning" },
  ];

  // 只显示当前教师相关的考试
  const examSchedule: ExamData[] = [
    {
      id: "exam_001",
      title: "计算机网络期末考试",
      creator: "张老师",
      creatorId: "teacher_001",
      date: "今天",
      time: "14:00-16:00",
      subject: "计算机网络",
      type: "期末考试",
      students: 45,
      status: "active",
      isOwner: true,
      isShared: false,
    },
    {
      id: "exam_002",
      title: "数据结构章节测验",
      creator: "张老师",
      creatorId: "teacher_001",
      date: "今天",
      time: "19:00-20:30",
      subject: "数据结构",
      type: "章节测验",
      students: 32,
      status: "upcoming",
      isOwner: true,
      isShared: false,
    },
    {
      id: "exam_003",
      title: "操作系统期中考试",
      creator: "张老师",
      creatorId: "teacher_001",
      date: "明天",
      time: "09:00-11:00",
      subject: "操作系统",
      type: "期中考试",
      students: 38,
      status: "scheduled",
      isOwner: true,
      isShared: false,
    },
  ];

  // 只显示该教师创建的题目
  const popularQuestions = [
    {
      id: 1,
      title: "TCP和UDP协议的区别",
      subject: "计算机网络",
      difficulty: "中等",
      usage: 23,
      creator: "张老师",
      isOwner: true,
    },
    {
      id: 2,
      title: "进程和线程的区别",
      subject: "操作系统",
      difficulty: "中等",
      usage: 18,
      creator: "张老师",
      isOwner: true,
    },
    {
      id: 3,
      title: "数据结构基本概念",
      subject: "数据结构",
      difficulty: "简单",
      usage: 15,
      creator: "张老师",
      isOwner: true,
    },
    {
      id: 4,
      title: "计算机网络分层模型",
      subject: "计算机网络",
      difficulty: "困难",
      usage: 12,
      creator: "张老师",
      isOwner: true,
    },
    {
      id: 5,
      title: "操作系统调度算法",
      subject: "操作系统",
      difficulty: "困难",
      usage: 10,
      creator: "张老师",
      isOwner: true,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 交互逻辑函数
  const handleQuickAction = (action: string) => {
    console.log(`执行快速操作: ${action}`);
    // 这里可以添加具体的跳转逻辑
    switch (action) {
      case "创建考试":
        // 跳转到创建考试页面
        alert("跳转到创建考试页面");
        break;
      case "管理试卷":
        // 跳转到试卷管理页面
        alert("跳转到试卷管理页面");
        break;
      case "题库管理":
        // 跳转到题库管理页面
        alert("跳转到题库管理页面");
        break;
      case "成绩管理":
        // 跳转到成绩管理页面
        alert("跳转到成绩管理页面");
        break;
      case "学生管理":
        // 跳转到学生管理页面
        alert("跳转到学生管理页面");
        break;
      case "系统设置":
        // 跳转到系统设置页面
        alert("跳转到系统设置页面");
        break;
      default:
        break;
    }
  };

  const handleExamAction = (action: string, examTitle: string) => {
    console.log(`考试操作: ${action} - ${examTitle}`);
    switch (action) {
      case "实时监控":
        alert(`开始监控考试: ${examTitle}`);
        break;
      case "查看详情":
        alert(`查看考试详情: ${examTitle}`);
        break;
      case "开始准备":
        alert(`准备考试: ${examTitle}`);
        break;
      case "编辑设置":
        alert(`编辑考试设置: ${examTitle}`);
        break;
      default:
        break;
    }
  };

  const handleTodoComplete = (todoId: string) => {
    setTodoList((prev) => prev.filter((todo) => todo.id !== todoId));
    console.log(`完成待办事项: ${todoId}`);
  };

  const handleQuestionAction = (action: string, questionTitle: string) => {
    console.log(`题目操作: ${action} - ${questionTitle}`);
    switch (action) {
      case "查看":
        alert(`查看题目: ${questionTitle}`);
        break;
      case "编辑":
        alert(`编辑题目: ${questionTitle}`);
        break;
      default:
        break;
    }
  };

  const handleScheduleDetail = (exam: any) => {
    alert(
      `查看考试详情:\n科目: ${exam.subject}\n时间: ${exam.date} ${exam.time}\n类型: ${exam.type}\n参与人数: ${exam.students}人`
    );
  };

  // 新增的交互函数
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log(`搜索: ${query}`);
    // 这里可以添加实际的搜索逻辑
  };

  const handleNotificationRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const handleNotificationClear = (notificationId: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId)
    );
  };

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    console.log(`切换主题: ${newTheme}`);
    // 这里可以添加实际的主题切换逻辑
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const getUnreadCount = () => {
    return notifications.filter((n) => !n.read).length;
  };

  // 权限检查函数
  const hasPermission = (permission: string) => {
    return currentUser.permissions.includes(permission);
  };

  const canAccessExam = (exam: ExamData) => {
    // 可以访问自己创建的考试或被分享的考试
    return exam.isOwner || exam.isShared || currentUser.role === "admin";
  };

  const canAccessStudentData = (classId: string) => {
    // 只能访问自己班级的学生数据
    return (
      currentUser.classes.includes(classId) || currentUser.role === "admin"
    );
  };

  // 根据用户角色显示不同的欢迎信息
  const getRoleDisplayName = () => {
    switch (currentUser.role) {
      case "admin":
        return "系统管理员";
      case "teacher":
        return "教师";
      case "assistant":
        return "助教";
      default:
        return "用户";
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("zh-CN", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "早上好";
    if (hour < 18) return "下午好";
    return "晚上好";
  };

  return (
    <div className="workbench">
      {/* 页面标题栏 */}
      <header className="page-header">
        <div className="header-left">
          <h1>工作台</h1>
          <p>
            {getGreeting()}，{currentUser.name}！
          </p>
          <p className="user-role-info">
            {getRoleDisplayName()} | {currentUser.department}
          </p>
        </div>

        {/* 搜索栏 */}
        <div className="header-center">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="搜索考试、试卷、学生..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="header-right">
          {/* 通知中心 */}
          <div className="notification-wrapper">
            <button
              className="notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <i className="fas fa-bell"></i>
              {getUnreadCount() > 0 && (
                <span className="notification-badge">{getUnreadCount()}</span>
              )}
            </button>

            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <h4>通知中心</h4>
                  <button onClick={handleClearAllNotifications}>
                    清空全部
                  </button>
                </div>
                <div className="notification-list">
                  {notifications.length === 0 ? (
                    <div className="no-notifications">暂无通知</div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`notification-item ${notification.type} ${
                          notification.read ? "read" : "unread"
                        }`}
                        onClick={() => handleNotificationRead(notification.id)}
                      >
                        <div className="notification-content">
                          <div className="notification-title">
                            {notification.title}
                          </div>
                          <div className="notification-message">
                            {notification.message}
                          </div>
                          <div className="notification-time">
                            {notification.time}
                          </div>
                        </div>
                        <button
                          className="notification-close"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationClear(notification.id);
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 设置按钮 */}
          <div className="settings-wrapper">
            <button
              className="settings-btn"
              onClick={() => setShowSettings(!showSettings)}
            >
              <i className="fas fa-cog"></i>
            </button>

            {showSettings && (
              <div className="settings-dropdown">
                <div className="settings-header">
                  <h4>个性化设置</h4>
                </div>
                <div className="settings-content">
                  <div className="setting-item">
                    <label>主题模式</label>
                    <div className="theme-selector">
                      <button
                        className={theme === "light" ? "active" : ""}
                        onClick={() => handleThemeChange("light")}
                      >
                        <i className="fas fa-sun"></i> 浅色
                      </button>
                      <button
                        className={theme === "dark" ? "active" : ""}
                        onClick={() => handleThemeChange("dark")}
                      >
                        <i className="fas fa-moon"></i> 深色
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 用户信息 */}
          <div className="user-info">
            <div className="avatar">{currentUser.name.charAt(0)}</div>
            <div className="user-details">
              <span className="user-name">{currentUser.name}</span>
              <span className="user-role">{getRoleDisplayName()}</span>
            </div>
          </div>
        </div>
      </header>

      {/* 统计数据卡片 */}
      <section className="stats-section">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon">
                <i className={stat.icon}></i>
              </div>
              <div className="stat-info">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
                {stat.trend && (
                  <div
                    className={`stat-trend ${
                      stat.trend.startsWith("+")
                        ? "positive"
                        : stat.trend.startsWith("-")
                        ? "negative"
                        : ""
                    }`}
                  >
                    {stat.trend}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 数据图表 */}
      <section className="charts-section">
        <h2>考试进度统计</h2>
        <div className="charts-container">
          <div className="pie-chart">
            <div className="chart-title">考试完成情况</div>
            <div className="pie-chart-container">
              <svg width="200" height="200" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#f3f4f6"
                  strokeWidth="20"
                />
                {/* 根据chartData绘制扇形 */}
                {(() => {
                  let cumulativePercentage = 0;
                  return chartData.map((data, index) => {
                    const percentage = data.value;
                    const startAngle = cumulativePercentage * 3.6; // 转换为度数
                    const endAngle = (cumulativePercentage + percentage) * 3.6;
                    cumulativePercentage += percentage;

                    const startAngleRad = ((startAngle - 90) * Math.PI) / 180;
                    const endAngleRad = ((endAngle - 90) * Math.PI) / 180;

                    const largeArcFlag = percentage > 50 ? 1 : 0;

                    const x1 = 100 + 80 * Math.cos(startAngleRad);
                    const y1 = 100 + 80 * Math.sin(startAngleRad);
                    const x2 = 100 + 80 * Math.cos(endAngleRad);
                    const y2 = 100 + 80 * Math.sin(endAngleRad);

                    const pathData = [
                      `M 100 100`,
                      `L ${x1} ${y1}`,
                      `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                      "Z",
                    ].join(" ");

                    return (
                      <path
                        key={index}
                        d={pathData}
                        fill={data.color}
                        stroke="white"
                        strokeWidth="2"
                      />
                    );
                  });
                })()}
              </svg>
              <div className="chart-center">
                <div className="total-percentage">100%</div>
                <div className="chart-label">总进度</div>
              </div>
            </div>
          </div>

          <div className="chart-legend">
            {chartData.map((data, index) => (
              <div key={index} className="legend-item">
                <div
                  className="legend-color"
                  style={{ backgroundColor: data.color }}
                ></div>
                <span className="legend-label">{data.label}</span>
                <span className="legend-value">{data.value}%</span>
              </div>
            ))}
          </div>

          <div className="quick-stats">
            <div className="quick-stat-item">
              <div className="stat-number">23</div>
              <div className="stat-label">本月考试</div>
            </div>
            <div className="quick-stat-item">
              <div className="stat-number">156</div>
              <div className="stat-label">参与学生</div>
            </div>
            <div className="quick-stat-item">
              <div className="stat-number">87%</div>
              <div className="stat-label">完成率</div>
            </div>
          </div>
        </div>
      </section>

      {/* 快速操作 */}
      <section className="quick-actions">
        <h2>快速操作</h2>
        <div className="actions-list">
          <button
            className="action-item"
            onClick={() => handleQuickAction("创建考试")}
          >
            <i className="fas fa-plus"></i>
            <span>创建考试</span>
          </button>
          <button
            className="action-item"
            onClick={() => handleQuickAction("管理试卷")}
          >
            <i className="fas fa-file-alt"></i>
            <span>管理试卷</span>
          </button>
          <button
            className="action-item"
            onClick={() => handleQuickAction("题库管理")}
          >
            <i className="fas fa-database"></i>
            <span>题库管理</span>
          </button>
          <button
            className="action-item"
            onClick={() => handleQuickAction("成绩管理")}
          >
            <i className="fas fa-chart-bar"></i>
            <span>成绩管理</span>
          </button>
          <button
            className="action-item"
            onClick={() => handleQuickAction("学生管理")}
          >
            <i className="fas fa-users"></i>
            <span>学生管理</span>
          </button>
          <button
            className="action-item"
            onClick={() => handleQuickAction("系统设置")}
          >
            <i className="fas fa-cog"></i>
            <span>系统设置</span>
          </button>
        </div>
        12
      </section>
    </div>
  );
}

export default Workbench;
