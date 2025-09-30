import React from "react";
import "./index.css";

export function StudentWorkBench() {
  return (
    <div className="student-workbench-container">
      <div className="student-workbench-header">
        <h1 className="student-workbench-header-title">学习中心</h1>
        <span className="student-workbench-header-time">
          2024年3月15日 星期五
        </span>
      </div>

      <div className="data-cards">
        <div className="data-card">
          <div className="card-header">
            <div className="card-title">已完成考试</div>
            <span className="workspace icon-yiwancheng1"></span>
          </div>
          <div className="card-value">10</div>
          <div className="card-trend trend-up">↗ +2 本周</div>
        </div>
        <div className="data-card">
          <div className="card-header">
            <div className="card-title">平均成绩</div>
            <span className="workspace icon-yiwancheng1"></span>
          </div>
          <div className="card-value">85.6</div>
          <div className="card-trend trend-up">↗ +3.2 提升</div>
        </div>
        <div className="data-card">
          <div className="card-header">
            <div className="card-title">班级排名</div>
            <span className="workspace icon-yiwancheng1"></span>
          </div>
          <div className="card-value">8</div>
          <div className="card-trend trend-up">↗ +2 进步</div>
        </div>
        <div className="data-card">
          <div className="card-header">
            <div className="card-title">学习完成率</div>
            <span className="workspace icon-yiwancheng1"></span>
          </div>
          <div className="card-value">96%</div>
          <div className="card-trend trend-up">→ 保持</div>
        </div>
      </div>

      <div className="student-content">
        <div className="student-content-grid">
          <div className="student-content-header">
            <span>考试安排</span>
            <span>查看全部</span>
          </div>
          <div className="student-schedule">
            <div className="student-schedule-item">
              <div className="schedule-item">
                <span className="schedule-status status-processing"></span>
                <div className="schedule-left-content">
                  <div className="schedule-content-title">
                    计算机网络原理期末考试
                  </div>
                  <div className="schedule-content-info">
                    剩余时间: 45分钟 | 2024-03-15 14:00-16:00
                  </div>
                </div>
              </div>
              <div className="schedule-item">
                <div className="schedule-progress">
                  <div className="schedule-progress-bar">
                    <div
                      className="schedule-progress-value"
                      style={{ width: "50%" }}
                    ></div>
                  </div>
                  <div className="schedule-progress-text">12/20 题</div>
                </div>
                <div className="schedule-btn schedule-btn-primary">
                  继续考试
                </div>
                <div className="schedule-btn schedule-btn-pause">暂停</div>
              </div>
            </div>
          </div>
        </div>
        <div className="right-panel">
          <div className="ai-panel">
            <div className="ai-header">
              <div className="ai-title">AI学习助手</div>
              <div className="ai-subtitle">基于数据分析的个性化建议</div>
            </div>

            <div className="ai-content">
              <div className="ai-suggestion">
                <div className="suggestion-title">💡 学习建议</div>
                <div className="suggestion-content">
                  根据你的学习记录分析，建议重点复习"树与图算法"相关内容，预计可提升10-15分。
                </div>
                <div className="suggestion-actions">
                  <a href="#" className="link-btn">
                    开始学习
                  </a>
                  <a href="#" className="link-btn">
                    查看详情
                  </a>
                </div>
              </div>

              <div className="ai-suggestion">
                <div className="suggestion-title">🎯 今日目标</div>
                <div className="suggestion-content">
                  距离下次考试还有1天，建议今日完成3套模拟题，重点练习选择题准确率。
                </div>
                <div className="suggestion-actions">
                  <a href="#" className="link-btn">
                    开始练习
                  </a>
                </div>
              </div>

              <div className="ai-suggestion">
                <div className="suggestion-title">⚡ 效率提升</div>
                <div className="suggestion-content">
                  建议在14:00-16:00学习效率最高的时间段进行难点突破。
                </div>
                <div className="suggestion-actions">
                  <a href="#" className="link-btn">
                    制定计划
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
