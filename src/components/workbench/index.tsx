import React from "react";
import "./index.css";

function Workbench() {
  return (
    <div className="workbench-container">
      <div className="workbench-header">
        <div>
          <div className="workbench-title">
            <span className="workbench-icons">dashboard</span>
            <span>我的工作台 - Teacher Dashboard</span>
          </div>
          <div className="workbench-text">👋 早上好，张老师!</div>
        </div>
        <div className="workbench-date-info">
          <div className="workbench-date">🗓️ 2024年3月15日</div>
          <div>星期五</div>
        </div>
      </div>
      <div className="workbench-cards">
        {/* 今日概览 */}
        <div className="workbench-card">
          <div className="card-header">
            <span className="iconfont icon-rili" style={{ color: "#3498db" }}>
            </span>
            <span className="card-title">今日概览</span>
          </div>
          <div className="card-content">
            <div className="stat-item">
              <span>📅 今日考试:</span>
              <span className="stat-value">2场</span>
            </div>
            <div className="stat-item">
              <span>⏰ 进行中:</span>
              <span className="stat-value">1场</span>
            </div>
            <div className="stat-item">
              <span>📝 待阅卷:</span>
              <span className="stat-value">45份</span>
            </div>
            <div className="stat-item">
              <span>✅ 已完成:</span>
              <span className="stat-value">12份</span>
            </div>
          </div>
          <div className="card-action">
            <button className="action-btn">📊 详细统计</button>
          </div>
        </div>
        {/* 快速统计 */}
        <div className="workbench-card">
          <div className="card-header">
            <span
              className="iconfont icon-tongji"
              style={{ color: "#2ecc71" }}
            ></span>
            <span className="card-title">快速统计</span>
          </div>
          <div className="card-content">
            <div className="stat-item">
              <span>📝 我的题目:</span>
              <span className="stat-value">156题</span>
            </div>
            <div className="stat-item">
              <span>📋 试卷总数:</span>
              <span className="stat-value">23份</span>
            </div>
            <div className="stat-item">
              <span>👥 学生总数:</span>
              <span className="stat-value">128人</span>
            </div>
            <div className="stat-item">
              <span>📈 及格率:</span>
              <span className="stat-value">87.5%</span>
            </div>
          </div>
          <div className="card-action">
            <button className="action-btn">📋 查看详情</button>
          </div>
        </div>
        {/* 待办事项 */}
        <div className="workbench-card">
          <div className="card-header">
            <span
              className="iconfont icon-shijian"
              style={{ color: "#e74c3c" }}
            ></span>
            <span className="card-title">待办事项</span>
          </div>
          <div className="card-content">
            <div
              style={{
                color: "#e74c3c",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              ⏰ 急需处理
            </div>
            <div style={{ margin: "8px 0", fontSize: "14px" }}>
              • 期末考试阅卷
              <br />
              <span style={{ color: "#e74c3c" }}>还剩67份</span>
            </div>
            <div style={{ margin: "8px 0", fontSize: "14px" }}>
              • 下周考试安排
              <br />
              <span style={{ color: "#f39c12" }}>需要确认</span>
            </div>
          </div>
          <div className="card-action">
            <button className="action-btn">📝 查看全部</button>
          </div>
        </div>
      </div>
      <div className="exam-monitor">
        <div className="monitor-header">
          <span
            className="iconfont icon-fuwujiankong-zhuangtai"
            style={{ color: "#e74c3c" }}
          ></span>
          <span className="monitor-title">考试状态监控</span>
        </div>

        {/* <!-- 进行中的考试 --> */}
        <div className="exam-item">
          <div className="exam-header">
            <div className="exam-title">
              <span className="exam-status">进行中</span>
              <span>📚 计算机网络期末考试</span>
            </div>
          </div>
          <div className="exam-info">
            <span>👥 45人参加</span>
            <span>⏰ 剩余时间: 01:23:45</span>
            <span>💯 总分: 100分</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: "88%" }}></div>
          </div>
          <div style={{ fontSize: "14px", color: "#7f8c8d", margin: "5px 0" }}>
            状态: 88%已提交 | 异常: 🚨2人切屏异常 ⚠️3人答题时间过短
          </div>
          <div className="exam-actions">
            <button className="exam-btn primary">👁️ 实时监控</button>
            <button className="exam-btn">📊 查看详情</button>
            <button className="exam-btn danger">⚠️ 处理异常</button>
          </div>
        </div>

        {/* <!-- 即将开始的考试 --> */}
        <div className="exam-item">
          <div className="exam-header">
            <div className="exam-title">
              <span className="exam-status upcoming">即将开始</span>
              <span>📘 数据库原理测验</span>
            </div>
          </div>
          <div className="exam-info">
            <span>👥 32人报名</span>
            <span>⏰ 19:00-20:30</span>
            <span>💯 总分: 80分</span>
          </div>
          <div style={{ fontSize: "14px", color: "#7f8c8d", margin: "10px 0" }}>
            距离开始: 3小时45分钟 | 试卷已就绪
          </div>
          <div className="exam-actions">
            <button className="exam-btn primary">⚙️ 考试设置</button>
            <button className="exam-btn">👥 学生管理</button>
            <button className="exam-btn">🔄 同步数据</button>
          </div>
        </div>

        {/* <!-- 已完成的考试 --> */}
        <div className="exam-item">
          <div className="exam-header">
            <div className="exam-title">
              <span className="exam-status completed">已完成</span>
              <span>📗 操作系统期中考试</span>
            </div>
          </div>
          <div className="exam-info">
            <span>👥 42人参加</span>
            <span>📊 平均分: 76.8分</span>
            <span>📈 及格率: 85.7%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: "100%", backgroundColor: "#2ecc71" }}
            ></div>
          </div>
          <div style={{ fontSize: "14px", color: "#7f8c8d", margin: "5px 0" }}>
            阅卷进度: 100%完成 | 最高分: 98分 | 最低分: 32分
          </div>
          <div className="exam-actions">
            <button className="exam-btn">📊 成绩详情</button>
            <button className="exam-btn">📋 成绩单</button>
            <button className="exam-btn primary">📧 发布成绩</button>
          </div>
        </div>
      </div>

      <div className="bottom-section">
        {/* <!-- 最近活动 --> */}
        <div className="activity-log">
          <div className="activity-header">
            <span
              className="iconfont icon-zuijinjilu"
              style={{ color: "#3498db" }}
            ></span>
            <span className="activity-title">最近活动记录</span>
          </div>
          <div className="activity-item">
            <div className="activity-time">3小时前</div>
            <div className="activity-content">
              完成了"数据结构测验"的阅卷 (30份)
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-time">昨天16:30</div>
            <div className="activity-content">发布了"操作系统期末考试"</div>
          </div>
          <div className="activity-item">
            <div className="activity-time">前天14:20</div>
            <div className="activity-content">导入了50道新题目到题库</div>
          </div>
          <div className="activity-item">
            <div className="activity-time">3天前</div>
            <div className="activity-content">创建了"网络协议专项练习"试卷</div>
          </div>
          <div className="activity-item">
            <div className="activity-time">4天前</div>
            <div className="activity-content">
              修改了考试"计算机组成原理"的时间安排
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: "15px" }}>
            <button className="action-btn">📋 查看全部记录</button>
          </div>
        </div>

        {/* <!-- 快速操作 --> */}
        <div className="quick-operations">
          <div className="operations-header">
            <span
              className="iconfont icon-shandian"
              style={{ color: "#2ecc71" }}
            ></span>
            <span className="operations-title">快速操作</span>
          </div>
          <div className="operation-grid">
            <div className="operation-btn">
              <span
                className="iconfont icon-xinzengmian"
                style={{ color: "#3498db" }}
              ></span>
              <div className="operation-text">新增题目</div>
            </div>
            <div className="operation-btn">
              <span
                className="iconfont icon-chuangjianshijuan"
                style={{ color: "#3498db" }}
              ></span>
              <div className="operation-text">创建试卷</div>
            </div>
            <div className="operation-btn">
              <span
                className="iconfont icon-icon_byxxtb operation-icon"
                style={{ color: "#3498db" }}
              ></span>
              <div className="operation-text">发布考试</div>
            </div>
            <div className="operation-btn">
              <span
                className="iconfont icon-el-icon-underlying-loan-information"
                style={{ color: "#3498db" }}
              ></span>
              <div className="operation-text">查看成绩</div>
            </div>
            <div className="operation-btn">
              <span
                className="iconfont icon-auto_awesome"
                style={{ color: "#3498db" }}
              ></span>
              <div className="operation-text">智能组卷</div>
            </div>
            <div className="operation-btn">
              <span
                className="iconfont icon-xitong"
                style={{ color: "#3498db" }}
              ></span>
              <div className="operation-text">系统设置</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Workbench;
