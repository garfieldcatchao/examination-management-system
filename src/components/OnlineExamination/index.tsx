import React, { useState } from "react";
import { useExam } from "../../hooks/useExam";
import { useParams } from "react-router-dom";
import "./index.css";
import Modal from "../common/Modal";

export default function OnlineExamination(props: any) {
  const { examId } = useParams<{ examId: string }>();
  const {
    examState,
    currentQuestionNumber,
    answers,
    markedQuestions,
    remainingTime,
    getCurrentQuestion,
    getQuestionStatus,
    jumpToQuestion,
    selectAnswer,
    markQuestion,
    nextQuestion,
    previousQuestion,
    submitExam,
    formatTime,
  } = useExam(examId || "");
  const [visible, setVisible] = useState(false);

  const confirmSubmit = () => {};
  const clearAnswer = () => {};
  // const nextQuestion = () => {};

  const handleSubmit = () => {
    const { answeredCount, totalQuestions, unansweredCount } =
      examState.statistics;

    setVisible(true);

    // if (unansweredCount > 0) {
    //   const confirmed = window.confirm(
    //     `还有 ${unansweredCount} 道题未作答，确定提交吗？\n\n` +
    //     `📊 统计信息：\n` +
    //     `已答题：${answeredCount}/${totalQuestions}\n` +
    //     `完成率：${examState.statistics.completionRate.toFixed(1)}%`
    //   );

    //   if (confirmed) {
    //     submitExam();
    //   }
    // } else {
    //   submitExam();
    // }
  };

  

  const handleOk = () => {
    setVisible(false);
    // submitExam()
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const renderSubmitModal = () => {
    return (
      <Modal
        visible={visible}
        onClose={handleOk}
        title="提交试卷"
        children="确定提交试卷吗？"
        onOk={handleOk}
        onCancel={handleCancel}
        okText="确定"
        cancelText="取消"
      />
    );
  };

  const renderHeader = () => {
    return (
      <div className="online-exam-header">
        <div className="exam-title-section">
          <h1 className="exam-title">计算机网络原理期末考试</h1>
          <div className="exam-meta">
            <span className="exam-tip-info">📝 25题</span>
            <span className="exam-tip-info">⏱️ 120分钟</span>
            <span className="exam-tip-info">👥 45人参加</span>
            <span className="exam-tip-info">📍 在线考试</span>
          </div>
        </div>

        <div className="exam-timer-section">
          <div className="timer-display">
            <span className="onlineExam icon-daojishi-copy"></span>
            <span className="timer-text">{formatTime(remainingTime)}</span>
          </div>
          <div className="timer-display">
            <span className="onlineExam icon-daitijiao-copy"></span>
            <span className="timer-text" onClick={handleSubmit}>
              提交试卷
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    return (
      <div className="question-area">
        <div className="question-header">
          <div className="question-number">
            第 <span id="currentQuestionNum">1</span> 题 / 共 25 题
          </div>
          <div className="question-type">单选题</div>
        </div>

        <div className="question-content">
          <div className="question-stem">
            <strong>题目：</strong>
            OSI七层模型中，负责数据加密和解密的是哪一层？
          </div>
          <div className="question-options">
            <div className="option-item">
              <div className="option-label">A</div>
              <div className="option-text">物理层 (Physical Layer)</div>
            </div>
            <div className="option-item">
              <div className="option-label">B</div>
              <div className="option-text">数据链路层 (Data Link Layer)</div>
            </div>
            <div className="option-item">
              <div className="option-label">C</div>
              <div className="option-text">网络层 (Network Layer)</div>
            </div>
            <div className="option-item">
              <div className="option-label">D</div>
              <div className="option-text">表示层 (Presentation Layer)</div>
            </div>
          </div>
        </div>
        <div className="question-navigation">
          <div className="nav-btn" onClick={previousQuestion}>← 上一题</div>
          <div className="nav-actions">
            <button
              className="nav-btn"
              id="markBtn"
              style={{
                background: "rgb(255, 255, 255)",
                borderColor: "rgb(217, 217, 217)",
                color: "rgb(38, 38, 38)",
              }}
            >
              📌 标记
            </button>
            <button
              className="nav-btn primary"
              onClick={nextQuestion}
              id="nextBtn"
            >
              下一题 →
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderExamSider = () => {
    return (
      <div className="exam-sidebar">
        <div className="info-panel">
          <h3 className="panel-title">📋 考试信息</h3>
          <div className="info-grid">
            <div className="exam-info-item">
              <div className="exam-info-label">考试科目:</div>
              <div className="exam-info-value">计算机网络原理</div>
            </div>
            <div className="exam-info-item">
              <span className="exam-info-label">考试类型:</span>
              <span className="exam-info-value">期末考试</span>
            </div>
            <div className="exam-info-item">
              <span className="exam-info-label">题目总数:</span>
              <span className="exam-info-value highlight">25题</span>
            </div>
            <div className="exam-info-item">
              <span className="exam-info-label">已答题数:</span>
              <span className="exam-info-value highlight" id="answeredCount">
                14题
              </span>
            </div>
            <div className="exam-info-item">
              <span className="exam-info-label">剩余时间:</span>
              <span className="exam-info-value warning" id="remainingTime">
                04:51
              </span>
            </div>
            <div className="exam-info-item">
              <span className="exam-info-label">开始时间:</span>
              <span className="exam-info-value">14:00</span>
            </div>
          </div>
        </div>

        {renderNavigationPanel()}
        {renderTipsPanel()}
      </div>
    );
  };

  const renderNavigationPanel = () => {
    return (
      <div className="navigation-panel">
        <h3 className="panel-title">题目导航</h3>
        <div className="exam-legend">
          <div className="exam-legend-item">
            <div
              className="exam-legend-dot"
              style={{ background: "#f5f5f5", border: "1px solid #d9d9d9" }}
            ></div>
            <span>未答</span>
          </div>
          <div className="exam-legend-item">
            <div
              className="exam-legend-dot"
              style={{ background: "#e6f7ff", border: "1px solid #91d5ff" }}
            ></div>
            <span>已答</span>
          </div>
          <div className="exam-legend-item">
            <div
              className="exam-legend-dot"
              style={{ background: "#e6f7ff", border: "1px solid #91d5ff" }}
            ></div>
            <span>已答</span>
          </div>
          <div className="exam-legend-item">
            <div
              className="exam-legend-dot"
              style={{ background: "#1890ff" }}
            ></div>
            <span>当前</span>
          </div>
          <div className="exam-legend-item">
            <div
              className="exam-legend-dot"
              style={{ background: "#fff2e8", border: "1px solid #ffbb96" }}
            ></div>
            <span>标记</span>
          </div>
          <div className="exam-question-grid">
            <div className="question-dot answered">1</div>
            <div className="question-dot answered">2</div>
            <div className="question-dot answered">3</div>
            <div className="question-dot answered">4</div>
            <div className="question-dot answered">5</div>
            <div className="question-dot answered">6</div>
            <div className="question-dot answered">7</div>
            <div className="question-dot answered marked">8</div>
            <div className="question-dot answered">9</div>
            <div className="question-dot answered">10</div>
            <div className="question-dot answered">11</div>
            <div className="question-dot answered">12</div>
            <div className="question-dot unanswered">16</div>
          </div>
          <div className="submit-exam-section">
            <div className="submit-exam-btn">提交考试</div>
            <div className="submit-exam-warning">
              提交后无法修改答案，请确认完成
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTipsPanel = () => {
    return (
      <div className="exam-tips-panel">
        <div className="panel-title">考试提示</div>
        <div className="exam-tip-item">
          <div className="tips-icon">📝</div>
          <span>仔细阅读题目，注意关键词</span>
        </div>
        <div className="exam-tip-item">
          <span className="tips-icon">⏰</span>
          <span>合理分配时间，避免在单题上耗时过长</span>
        </div>
        <div className="exam-tip-item">
          <span className="tips-icon">📌</span>
          <span>不确定的题目可以先标记，稍后回来</span>
        </div>
        <div className="exam-tip-item">
          <span className="tips-icon">✅</span>
          <span>提交前检查所有题目是否已作答</span>
        </div>
        <div className="exam-tip-item">
          <span className="tips-icon">🔒</span>
          <span>考试过程中请勿关闭浏览器</span>
        </div>
      </div>
    );
  };
  return (
    <div className="online-conatienr">
      {renderHeader()}
      <div className="exam-container">
        {renderContent()}
        {renderExamSider()}
      </div>
      {renderSubmitModal()}
    </div>
  );
}
