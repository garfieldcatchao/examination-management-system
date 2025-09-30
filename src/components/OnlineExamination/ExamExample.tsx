import React from "react";
import { useParams } from "react-router-dom";
import { useExam } from "../../hooks/useExam";
import { QuestionStatus } from "../../interface/examFace";

// 使用数据结构的完整示例组件
export default function ExamWithDataStructure() {
  const { examId } = useParams<{ examId: string }>();
  
  // 使用考试Hook管理所有状态
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
  } = useExam(examId || '');

  // 渲染头部 - 使用真实数据
  const renderHeader = () => {
    const { examInfo, statistics } = examState;
    
    return (
      <div className="online-exam-header">
        <div className="exam-title-section">
          <h1 className="exam-title">{examInfo?.title}</h1>
          <div className="exam-meta">
            <span>📝 {statistics.totalQuestions}题</span>
            <span>⏱️ {examInfo?.duration}分钟</span>
            <span>📍 在线考试</span>
          </div>
        </div>

        <div className="exam-timer-section">
          <div className="timer-display">
            <span>⏰</span>
            <span className="timer-text">
              {formatTime(remainingTime)}
            </span>
          </div>
          <div className="timer-display" onClick={handleSubmit}>
            <span>📤</span>
            <span className="timer-text">提交试卷</span>
          </div>
        </div>
      </div>
    );
  };

  // 渲染题目内容 - 使用真实数据
  const renderContent = () => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return null;

    return (
      <div className="question-area">
        <div className="question-header">
          <div className="question-number">
            第 {currentQuestionNumber} 题 / 共 {examState.statistics.totalQuestions} 题
          </div>
          <div className="question-type">
            {getQuestionTypeDisplay(currentQuestion.type)}
          </div>
        </div>

        <div className="question-content">
          <div className="question-stem">
            <strong>题目：</strong>{currentQuestion.content}
          </div>
          
          <div className="question-options">
            {currentQuestion.options?.map((option) => (
              <div 
                key={option.key}
                className={`option-item ${
                  answers[currentQuestion.id]?.answer === option.key ? 'selected' : ''
                }`}
                onClick={() => handleSelectAnswer(option.key)}
              >
                <div className="option-label">{option.key}</div>
                <div className="option-text">{option.content}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="question-navigation">
          <button 
            className="nav-btn" 
            onClick={previousQuestion}
            disabled={currentQuestionNumber === 1}
          >
            ← 上一题
          </button>
          
          <div className="nav-actions">
            <button
              className={`nav-btn ${
                markedQuestions.has(currentQuestion.id) ? 'marked' : ''
              }`}
              onClick={() => markQuestion()}
            >
              📌 {markedQuestions.has(currentQuestion.id) ? '取消标记' : '标记'}
            </button>
            
            <button
              className="nav-btn primary"
              onClick={nextQuestion}
            >
              {currentQuestionNumber === examState.statistics.totalQuestions 
                ? '📝 检查答案' 
                : '下一题 →'
              }
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 渲染题目导航网格 - 使用真实数据
  const renderNavigationPanel = () => {
    const { questions, statistics } = examState;
    
    return (
      <div className="navigation-panel">
        <h3 className="panel-title">🧭 题目导航</h3>
        
        {/* 图例 */}
        <div className="exam-legend">
          <div className="exam-legend-item">
            <div className="exam-legend-dot unanswered"></div>
            <span>未答</span>
          </div>
          <div className="exam-legend-item">
            <div className="exam-legend-dot answered"></div>
            <span>已答</span>
          </div>
          <div className="exam-legend-item">
            <div className="exam-legend-dot current"></div>
            <span>当前</span>
          </div>
          <div className="exam-legend-item">
            <div className="exam-legend-dot marked"></div>
            <span>标记</span>
          </div>
        </div>

        {/* 动态生成题目网格 */}
        <div className="exam-question-grid">
          {questions.map((question) => {
            const status = getQuestionStatus(question.number);
            return (
              <div
                key={question.id}
                className={`question-dot ${status}`}
                onClick={() => jumpToQuestion(question.number)}
              >
                {question.number}
              </div>
            );
          })}
        </div>

        {/* 提交按钮 */}
        <div className="submit-exam-section">
          <button 
            className="submit-exam-btn"
            onClick={handleSubmit}
          >
            📤 提交考试
          </button>
          <div className="submit-exam-warning">
            已答 {statistics.answeredCount}/{statistics.totalQuestions} 题
          </div>
        </div>
      </div>
    );
  };

  // 处理答案选择
  const handleSelectAnswer = (answer: string) => {
    selectAnswer(answer);
  };

  // 处理考试提交
  const handleSubmit = () => {
    const { answeredCount, totalQuestions, unansweredCount } = examState.statistics;
    
    if (unansweredCount > 0) {
      const confirmed = window.confirm(
        `还有 ${unansweredCount} 道题未作答，确定提交吗？\n\n` +
        `📊 统计信息：\n` +
        `已答题：${answeredCount}/${totalQuestions}\n` +
        `完成率：${examState.statistics.completionRate.toFixed(1)}%`
      );
      
      if (confirmed) {
        submitExam();
      }
    } else {
      submitExam();
    }
  };

  // 题目类型显示转换
  const getQuestionTypeDisplay = (type: string) => {
    const typeMap = {
      'single_choice': '单选题',
      'multiple_choice': '多选题', 
      'true_false': '判断题',
      'fill_blank': '填空题',
      'short_answer': '简答题',
    };
    return typeMap[type as keyof typeof typeMap] || '选择题';
  };

  // 加载状态
  if (examState.isLoading) {
    return (
      <div className="exam-loading">
        <div>正在加载考试...</div>
      </div>
    );
  }

  return (
    <div className="online-container">
      {renderHeader()}
      <div className="exam-container">
        {renderContent()}
        <div className="exam-sidebar">
          {/* 考试信息面板 - 使用真实数据 */}
          <div className="info-panel">
            <h3 className="panel-title">📋 考试信息</h3>
            <div className="info-grid">
              <div className="exam-info-item">
                <span className="exam-info-label">考试科目:</span>
                <span className="exam-info-value">{examState.examInfo?.subject}</span>
              </div>
              <div className="exam-info-item">
                <span className="exam-info-label">已答题数:</span>
                <span className="exam-info-value highlight">
                  {examState.statistics.answeredCount}题
                </span>
              </div>
              <div className="exam-info-item">
                <span className="exam-info-label">剩余时间:</span>
                <span className="exam-info-value warning">
                  {formatTime(remainingTime)}
                </span>
              </div>
              <div className="exam-info-item">
                <span className="exam-info-label">完成率:</span>
                <span className="exam-info-value">
                  {examState.statistics.completionRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {renderNavigationPanel()}
        </div>
      </div>
    </div>
  );
}
