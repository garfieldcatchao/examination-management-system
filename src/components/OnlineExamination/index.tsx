import React, { useCallback, useMemo, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useLocalStorage, useExam, useUserMonitoring } from "../../hooks";
import { Input, Flex, Radio, Statistic, notification } from "antd";
import "./index.css";
import "./ScreenMonitoring.css";
import Modal from "../common/Modal";
import {
  getBlankCount,
  QUESTION_TYPE_MAP,
  convertToTimestamp,
  EXAM_TYPE_MAP,
  comparelimitTime,
  isTrue,
} from "../../utils";
import { log } from "console";
import { NotificationPlacement } from "antd/es/notification/interface";
import { checkParticipationAction } from "../../actions/examinations";

const { TextArea } = Input;
const { Timer } = Statistic;

const style: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  alignItems: "flex-start",
};

const STATUS_MAP = {
  unanswered: "unanswered", // 未答
  answered: "answered", // 已答
  marked: "marked", // 已标记
  current: "current", // 当前题目
};

// 摄像头预览组件
const CameraPreview: React.FC<{
  videoElement: HTMLVideoElement | null;
  faceDetected: boolean;
  userPresent: boolean;
}> = ({ videoElement, faceDetected, userPresent }) => {
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

  React.useEffect(() => {
    if (videoElement && videoRef) {
      // 同步video元素的流到预览组件
      videoRef.srcObject = videoElement.srcObject;
      videoRef.play().catch(console.error);
    }
  }, [videoElement, videoRef]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        borderRadius: "4px",
        overflow: "hidden",
        background: "#000",
      }}
    >
      {/* 视频预览 */}
      <video
        ref={setVideoRef}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: "scaleX(-1)", // 镜像显示，更自然
        }}
        autoPlay
        muted
        playsInline
      />

      {/* 状态覆盖层 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(transparent 70%, rgba(0,0,0,0.7) 100%)",
          pointerEvents: "none",
        }}
      >
        {/* 人脸检测状态指示器 */}
        <div
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: faceDetected ? "#52c41a" : "#ff4d4f",
            boxShadow: `0 0 8px ${faceDetected ? "#52c41a" : "#ff4d4f"}`,
            animation: faceDetected ? "pulse-green 2s infinite" : undefined,
          }}
        />

        {/* 底部状态文字 */}
        <div
          style={{
            position: "absolute",
            bottom: "8px",
            left: "8px",
            right: "8px",
            fontSize: "10px",
            color: "#fff",
            textAlign: "center",
            textShadow: "0 1px 2px rgba(0,0,0,0.8)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>{faceDetected ? "👤 已检测" : "❓ 未检测"}</span>
            <span
              style={{
                color: userPresent ? "#52c41a" : "#ff4d4f",
                fontWeight: "bold",
              }}
            >
              {userPresent ? "在线" : "离线"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const [api, contextHolder] = notification.useNotification();
  const { getItem, setItem, removeItem, hasItem, clearAll } = useLocalStorage();
  const userId = getItem<{id: string | number}>("userInfo")?.id;
  // 用户监控Hook
  const userMonitoring = useUserMonitoring(examId || "", String(userId), {
    websocketUrl:
      process.env.REACT_APP_WS_URL || "ws://localhost:8080/user-monitoring",
    captureInterval: 10000, // 2秒拍照一次
    compressionQuality: 0.7,
    maxWidth: 640,
    maxHeight: 480,
    enableFaceDetection: true,
    enableBehaviorAnalysis: true,
  });

  const [visible, setVisible] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<string | null | string[]>(
    null
  );
  const [multipleAnswers, setMultipleAnswers] = useState<string[]>([]);
  const [isTimeEnd, setIsTimeEnd] = useState(false);
  const [isStarting, setIsStarting] = useState(false)

  const examInfo = examState.config || {};
  const examStatistics = examState.statistics || {};
  const duration = examState.examInfo?.duration;
  const earlySubmitLimit = examInfo?.earlySubmitLimit;
  const timesTamp = convertToTimestamp({ minutes: duration });


  useEffect(() => {
    const params = getItem<{id: string | number}>("userInfo");
    console.log("checkParticipationAction localstroage res =====> ", params);
    
    if (!params) return;
    checkParticipationAction({
      examId: examId,
      userId: params?.id,
    }).then(res => {
      console.log("checkParticipationAction res =====> ", res);
      if (isTrue(res.success) && !isTrue(res.data)) {
        setIsStarting(true)
      }
    })
  }, [examId])

  
  // 同步当前题目的答案状态
  useEffect(() => {
    if (!isStarting) return;
    const currentQuestion = getCurrentQuestion();
    if (currentQuestion) {
      const currentQuestionAnswer = answers[currentQuestion.id]?.answer;
      if (currentQuestion.type === "multiple_choice" && currentQuestionAnswer) {
        const answerArray = Array.isArray(currentQuestionAnswer)
          ? currentQuestionAnswer
          : [currentQuestionAnswer];
        setMultipleAnswers(answerArray);
      } else {
        setMultipleAnswers([]);
      }
    }
    setIsStarting(true)
  }, [currentQuestionNumber, answers, getCurrentQuestion]);

  


  const confirmSubmit = () => {};

  const handleClearAnswer = () => {
    const currentQuestion = getCurrentQuestion();
    if (currentQuestion) {
      if (currentQuestion.type === "multiple_choice") {
        setMultipleAnswers([]);
        selectAnswer([]);
      } else {
        selectAnswer("");
      }
    }
  };
  // const nextQuestion = () => {};

  const openModal = () => {
    setVisible(true);
  };

  const closeModal = () => {
    setVisible(false);
  };

  const handleOk = () => {
    closeModal();
    userMonitoring.actions.stopCameraMonitoring();
    window.history.back();
    // submitExam()
  };

  const handleCancel = () => {
    closeModal();
  };

  const renderModalContent = () => {
    const { totalQuestions = 0 } = examState.examInfo || {};
    const { answeredCount, unansweredCount = 0 } = examState?.statistics || {};
    const startInfo = examState.examInfo;

    if (isTimeEnd) {
      return <div>考试时间已结束，请提交试卷！</div>;
    }

    if (answeredCount < totalQuestions) {
      return (
        <div>
          还有{unansweredCount || totalQuestions}道题未作答，确定提交吗？
        </div>
      );
    }

    const startTimesTamp = startInfo?.startTime?.toLocaleString();
    const endTimesTamp = startInfo?.endTime?.toLocaleString();

    if (
      !comparelimitTime({ limitTime: duration || 0, startTime: startTimesTamp })
    ) {
      return <div>已经迟到`${duration}`分钟，无法进行考试！</div>;
    }

    if (
      comparelimitTime({ limitTime: earlySubmitLimit, endTime: endTimesTamp })
    ) {
      return <div>考试时间未结束，请耐心等待！</div>;
    }

    return null;
  };

  const modalProps = {
    visible: visible,
    onClose: handleOk,
    title: "提交试卷",
    children: renderModalContent(),
    onOk: handleOk,
    okText: "确定",
    ...(!isTimeEnd && { cancelText: "取消", onCancel: handleCancel }),
  };

  const renderSubmitModal = () => {
    const { unansweredCount } = examState.statistics;
    return <Modal {...modalProps} />;
  };

  const onFinish = () => {
    if (!isStarting) return;
    setIsTimeEnd(true);
    openModal();
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
            {/* <span className="timer-text">{formatTime(remainingTime)}</span> */}

            <Timer
              type="countdown"
              value={timesTamp}
              format="HH:mm:ss"
              valueStyle={{
                color: "#fff",
                fontFamily: "Courier New",
                fontSize: "16px",
              }}
              onFinish={onFinish}
            />
          </div>
          <div className="timer-display">
            <span className="onlineExam icon-daitijiao-copy"></span>
            <span className="timer-text" onClick={openModal}>
              提交试卷
            </span>
          </div>
        </div>
      </div>
    );
  };


  const openNotification = (placement: NotificationPlacement) => {
    api.info({
      message: `Notification ${placement}`,
      description:
        "This is the content of the notification. This is the content of the notification. This is the content of the notification.",
      placement,
    });
  };

  const renderBehaviorAlerts = () => {

    // if (behaviorAlerts.length > 0) {

    // }
    
  };

  const handleOptionClick = (option: any, type: any) => {
    if (type === "multiple_choice") {
      setMultipleAnswers((prev) => {
        const newAnswers = prev.includes(option.key)
          ? prev.filter((key) => key !== option.key)
          : [...prev, option.key];

        selectAnswer(newAnswers);
        return newAnswers;
      });
    } else {
      selectAnswer(option.key);
      setMultipleAnswers([]);
    }
  };

  const renderQuestionOptions = (item: any) => {
    if (item?.type !== "single_choice" && item?.type !== "multiple_choice")
      return;

    const options = item?.options || [];
    if (!options) return;

    let parseOptions = [];
    try {
      parseOptions = JSON.parse(options || "[]");
    } catch (error) {
      console.log("renderQuestionOptions 解析选项失败 =====> ", error);
    }

    const currentQuestionAnswer = answers[item.id]?.answer;
    const isMultipleChoice = item.type === "multiple_choice";

    let selectedAnswers: string[] = [];
    if (currentQuestionAnswer) {
      selectedAnswers = Array.isArray(currentQuestionAnswer)
        ? currentQuestionAnswer
        : [currentQuestionAnswer];
    }

    return (
      <div className="question-options">
        {parseOptions?.map((option: any, index: number) => {
          const isSelected = selectedAnswers.includes(option.key);

          return (
            <div
              className={`option-item ${isSelected ? "selected" : ""} ${
                isMultipleChoice ? "multiple" : "single"
              }`}
              key={`${item?.questionNumber}-${index}`}
              onClick={() => handleOptionClick(option, item.type)}
            >
              <div className="option-label">
                {isMultipleChoice ? (
                  <div className={`checkbox ${isSelected ? "checked" : ""}`}>
                    {isSelected && "✓"}
                  </div>
                ) : (
                  <div className={`radio ${isSelected ? "checked" : ""}`}>
                    {isSelected && "●"}
                  </div>
                )}
                {option.key}
              </div>
              <div className="option-text">{option.content}</div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderQuestionEssay = (item: any) => {
    if (item?.type !== "essay") return;
    const currentQuestionAnswer = answers[item.id]?.answer;

    return (
      <div className="question-essay">
        <TextArea
          placeholder="请输入答案"
          autoSize={{ minRows: 4, maxRows: 6 }}
          onChange={(e: any) => {
            selectAnswer(e.target.value);
          }}
          defaultValue={currentQuestionAnswer}
        />
      </div>
    );
  };

  const renderQuestionFillBlank = (item: any) => {
    if (item?.type !== "fill_blank") return;

    const blankCount = getBlankCount(item?.content);
    const currentQuestionAnswer = answers[item.id]?.answer;
    return (
      <div className="question-fill-blank">
        {Array.from({ length: blankCount }).map((item: any, index: number) => {
          return (
            <Flex key={`fill_blank_${index}`} align="end">
              <div>{index + 1}.</div>
              <Input
                style={{
                  border: "none",
                  borderBottom: "1px solid #d9d9d9",
                  maxWidth: "400px",
                  marginLeft: "10px",
                }}
                placeholder="请输入答案"
                onChange={(e: any) => {
                  selectAnswer(e.target.value);
                }}
                defaultValue={currentQuestionAnswer}
              />
            </Flex>
          );
        })}
      </div>
    );
  };

  const renderQuestionTrueFalse = (item: any) => {
    if (item?.type !== "true_false") return;
    const currentQuestionAnswer = answers[item.id]?.answer;
    return (
      <div className="question-true-false">
        <Flex vertical={true}>
          <Radio.Group
            style={style}
            block
            size={"large"}
            options={[
              {
                label: "正确",
                value: "true",
              },
              {
                label: "错误",
                value: "false",
              },
            ]}
            onChange={(e: any) => {
              selectAnswer(e.target.value);
            }}
            defaultValue={currentQuestionAnswer}
          />
        </Flex>
      </div>
    );
  };

  const renderContent = useCallback(() => {
    const question = getCurrentQuestion();
    return (
      <div className="question-area">
        <div className="question-header">
          <div className="question-number">
            第 <span id="currentQuestionNum">{currentQuestionNumber}</span> 题 /
            共 {examState.examInfo?.totalQuestions} 题
          </div>
          <div className="question-type">
            {
              QUESTION_TYPE_MAP[
                question?.type as keyof typeof QUESTION_TYPE_MAP
              ]
            }
          </div>
        </div>

        <div className="question-content">
          <div className="question-stem">
            <strong>题目：</strong>
            {question?.content}
          </div>
          {renderQuestionOptions(question)}
          {renderQuestionEssay(question)}
          {renderQuestionFillBlank(question)}
          {renderQuestionTrueFalse(question)}
        </div>
        <div className="question-navigation">
          <div className="nav-btn" onClick={previousQuestion}>
            ← 上一题
          </div>
          <div className="nav-actions">
            <button
              className="nav-btn"
              onClick={handleClearAnswer}
              style={{
                background: "rgb(255, 255, 255)",
                borderColor: "rgb(217, 217, 217)",
                color: "rgb(38, 38, 38)",
              }}
            >
              🗑️ 清除答案
            </button>
            <button
              className="nav-btn"
              id="markBtn"
              onClick={() => markQuestion((question as any)?.questionNumber)}
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
  }, [
    getCurrentQuestion,
    nextQuestion,
    previousQuestion,
    currentQuestionNumber,
    examState.examInfo?.totalQuestions,
    handleClearAnswer,
    markQuestion,
  ]);

  const rendereRealTimeMonitoring = () => {
    const { state, actions, getVideoElement } = userMonitoring;

    console.log("异常行为 state.behaviorAlerts =====> ", state.behaviorAlerts);
    // if (state.behaviorAlerts) {

    // }

    // 获取连接状态的显示文本和样式
    const getConnectionStatusInfo = () => {
      switch (state.connectionStatus) {
        case "connected":
          return { text: "监控已连接", class: "connected" };
        case "connecting":
          return { text: "正在连接...", class: "connecting" };
        case "disconnected":
          return { text: "监控未连接", class: "disconnected" };
        case "error":
          return { text: "连接失败", class: "error" };
        default:
          return { text: "未知状态", class: "error" };
      }
    };

    const connectionInfo = getConnectionStatusInfo();

    // 格式化最后活动时间
    const formatLastActivity = (date: Date | null) => {
      if (!date) return "--";
      const now = new Date();
      const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
      if (diff < 60) return `${diff}秒前`;
      if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
      return date.toLocaleTimeString();
    };

    return (
      <div className="real-time-monitoring">
        <div className="monitoring-status">
          {/* 监控信息 */}
          {/* <div className="monitoring-info">
            <div className="info-item">
              <span className="label">摄像头:</span>
              <span className="value">
                {state.isCameraActive ? "✅ 已开启" : "❌ 未开启"}
              </span>
            </div>

            <div className="info-item">
              <span className="label">人脸检测:</span>
              <span className="value">
                {state.faceDetected ? "✅ 已检测" : "❌ 未检测"}
              </span>
            </div>

            <div className="info-item">
              <span className="label">用户状态:</span>
              <span
                className="value"
                style={{
                  color: state.userPresent ? "#52c41a" : "#ff4d4f",
                }}
              >
                {state.userPresent ? "在线" : "离线"}
              </span>
            </div>

            <div className="info-item">
              <span className="label">最后活动:</span>
              <span className="value">
                {formatLastActivity(state.lastActivity)}
              </span>
            </div>
          </div> */}

          {/* 摄像头预览区域 */}
          <div className="screen-preview">
            {state.isCameraActive ? (
              <CameraPreview
                videoElement={getVideoElement()}
                faceDetected={state.faceDetected}
                userPresent={state.userPresent}
              />
            ) : (
              <div
                className="no-preview"
                style={{
                  fontSize: "11px",
                  textAlign: "center",
                  color: "#ccc",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>📷</div>
                <div>未开启摄像头监控</div>
                {/* <small>点击"开始监控"按钮</small> */}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderExamDetailInfo = () => {
    const start = examState.examInfo;

    return (
      <div className="info-panel">
        <h3 className="panel-title">📋 考试信息</h3>
        <div className="info-grid">
          <div className="exam-info-item">
            <div className="exam-info-label">考试科目:</div>
            <div className="exam-info-value">计算机网络原理</div>
          </div>
          <div className="exam-info-item">
            <span className="exam-info-label">考试类型:</span>
            <span className="exam-info-value">
              {
                EXAM_TYPE_MAP[
                  examState.examInfo?.type as keyof typeof EXAM_TYPE_MAP
                ]
              }
            </span>
          </div>
          <div className="exam-info-item">
            <span className="exam-info-label">题目总数:</span>
            <span className="exam-info-value highlight">
              {examState.examInfo?.totalQuestions}题
            </span>
          </div>
          <div className="exam-info-item">
            <span className="exam-info-label">已答题数:</span>
            <span className="exam-info-value highlight" id="answeredCount">
              {examState.statistics.answeredCount}题
            </span>
          </div>
          <div className="exam-info-item">
            <span className="exam-info-label">剩余时间:</span>
            <span className="exam-info-value" id="remainingTime">
              {/* {convertToTimestamp({ minutes: examState.examInfo?.duration })} */}
              <Timer
                type="countdown"
                value={timesTamp}
                format="HH:mm:ss"
                valueStyle={{
                  fontSize: "16px",
                  color: "#fa541c",
                  fontWeight: 600,
                  userSelect: "none",
                }}
                onFinish={onFinish}
              />
            </span>
          </div>
          <div className="exam-info-item">
            <span className="exam-info-label">开始时间:</span>
            <span className="exam-info-value">
              {start?.startTime?.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderExamSider = () => {
    return (
      <div className="exam-sidebar">
        {rendereRealTimeMonitoring()}
        {renderExamDetailInfo()}
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
            {Array.from({
              length: examState.examInfo?.totalQuestions || 0,
            }).map((_: any, index: number) => {
              const dot = index + 1;
              const status = getQuestionStatus(dot);
              return (
                <div
                  className={`question-dot ${STATUS_MAP[status]}`}
                  key={`dot_${dot}`}
                  onClick={() => jumpToQuestion(dot)}
                >
                  {dot}
                </div>
              );
            })}

            {/* <div className="question-dot answered">1</div>
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
            <div className="question-dot unanswered">16</div> */}
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

  console.log("isStarting ======> ", isStarting);
  
  if (!isStarting) {
    return null;
  }

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
