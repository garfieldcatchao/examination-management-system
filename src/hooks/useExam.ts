import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ExamInfo, 
  Question, 
  ExamSession, 
  ExamStatistics, 
  ExamConfig, 
  ExamState,
  UserAnswer,
  QuestionStatus,
  ExamStatus
} from '../interface/examFace';

// 考试Hook - 管理考试状态和逻辑
export const useExam = (examId: string) => {
  // 考试状态
  const [examState, setExamState] = useState<ExamState>({
    examInfo: null,
    questions: [],
    currentSession: null,
    statistics: {
      totalQuestions: 0,
      answeredCount: 0,
      unansweredCount: 0,
      markedCount: 0,
      completionRate: 0,
      elapsedTime: 0,
      remainingTime: 0,
      averageTimePerQuestion: 0,
    },
    config: {
      mode: 'exam',
      allowPause: false,
      allowReview: false,
      showAnswerImmediately: false,
      shuffleQuestions: false,
      shuffleOptions: false,
      autoSubmit: true,
      preventCheating: true,
    },
    isLoading: true,
    error: null,
  });

  // 当前题目和答案状态
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({});
  const [markedQuestions, setMarkedQuestions] = useState<Set<string>>(new Set());
  const [visitedQuestions, setVisitedQuestions] = useState<Set<string>>(new Set());
  
  // 计时器相关
  const [remainingTime, setRemainingTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  // 初始化考试
  const initExam = useCallback(async () => {
    try {
      setExamState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // 模拟API调用
      const examData = await fetchExamData(examId);
      
      if (examData.success) {
        const { examInfo, questions, session, config } = examData.data;
        
        setExamState(prev => ({
          ...prev,
          examInfo,
          questions,
          currentSession: session,
          config,
          isLoading: false,
        }));
        
        // 恢复会话状态
        if (session) {
          setCurrentQuestionNumber(session.currentQuestionNumber);
          setAnswers(session.answers);
          setMarkedQuestions(session.markedQuestions);
          setVisitedQuestions(session.visitedQuestions);
          setRemainingTime(session.remainingTime);
        }
        
        // 启动计时器
        if (config.mode === 'exam' && config.timeLimit) {
          startTimer(session?.remainingTime || config.timeLimit * 60);
        }
        
      } else {
        setExamState(prev => ({ 
          ...prev, 
          error: examData.message,
          isLoading: false 
        }));
      }
    } catch (error) {
      setExamState(prev => ({ 
        ...prev, 
        error: '加载考试失败',
        isLoading: false 
      }));
    }
  }, [examId]);

  // 启动计时器
  const startTimer = useCallback((initialTime: number) => {
    startTimeRef.current = new Date();
    setRemainingTime(initialTime);
    
    timerRef.current = setInterval(() => {
      setRemainingTime(prev => {
        const newTime = prev - 1;
        setElapsedTime(initialTime - newTime);
        
        // 时间到自动提交
        if (newTime <= 0 && examState.config.autoSubmit) {
          submitExam(true);
          return 0;
        }
        
        return Math.max(0, newTime);
      });
    }, 1000);
  }, [examState.config.autoSubmit]);

  // 停止计时器
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // 获取当前题目
  const getCurrentQuestion = useCallback((): Question | null => {
    return examState.questions.find(q => q.number === currentQuestionNumber) || null;
  }, [examState.questions, currentQuestionNumber]);

  // 获取题目状态
  const getQuestionStatus = useCallback((questionNumber: number): QuestionStatus => {
    const questionId = examState.questions.find(q => q.number === questionNumber)?.id;
    
    if (questionNumber === currentQuestionNumber) return QuestionStatus.CURRENT;
    if (questionId && markedQuestions.has(questionId)) return QuestionStatus.MARKED;
    if (questionId && answers[questionId]) return QuestionStatus.ANSWERED;
    return QuestionStatus.UNANSWERED;
  }, [currentQuestionNumber, markedQuestions, answers, examState.questions]);

  // 跳转到指定题目
  const jumpToQuestion = useCallback((questionNumber: number) => {
    if (questionNumber >= 1 && questionNumber <= examState.statistics.totalQuestions) {
      const question = examState.questions.find(q => q.number === questionNumber);
      if (question) {
        setCurrentQuestionNumber(questionNumber);
        setVisitedQuestions(prev => new Set(prev).add(question.id));
        
        // 记录题目访问时间
        const currentTime = Date.now();
        // 这里可以记录用户在每题上的停留时间
      }
    }
  }, [examState.questions, examState.statistics.totalQuestions]);

  // 选择答案
  const selectAnswer = useCallback(async (answer: string | string[]) => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;

    const userAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      questionNumber: currentQuestion.number,
      answer,
      answerTime: 0, // 这里应该计算实际用时
      isMarked: markedQuestions.has(currentQuestion.id),
      submitTime: new Date(),
    };

    // 更新本地状态
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: userAnswer
    }));

    // 更新访问记录
    setVisitedQuestions(prev => new Set(prev).add(currentQuestion.id));

    // 自动保存到服务器
    try {
    //   await saveAnswer(userAnswer);
    } catch (error) {
      console.error('保存答案失败:', error);
    }

    // 更新统计
    updateStatistics();
  }, [getCurrentQuestion, markedQuestions]);

  // 标记题目
  const markQuestion = useCallback((questionNumber?: number) => {
    const targetNumber = questionNumber || currentQuestionNumber;
    const question = examState.questions.find(q => q.number === targetNumber);
    
    if (question) {
      setMarkedQuestions(prev => {
        const newSet = new Set(prev);
        if (newSet.has(question.id)) {
          newSet.delete(question.id);
        } else {
          newSet.add(question.id);
        }
        return newSet;
      });
      
      updateStatistics();
    }
  }, [currentQuestionNumber, examState.questions]);

  // 清除答案
  const clearAnswer = useCallback(() => {
    const currentQuestion = getCurrentQuestion();
    if (currentQuestion) {
      setAnswers(prev => {
        const newAnswers = { ...prev };
        delete newAnswers[currentQuestion.id];
        return newAnswers;
      });
      
      updateStatistics();
    }
  }, [getCurrentQuestion]);

  // 更新统计信息
  const updateStatistics = useCallback(() => {
    const totalQuestions = examState.questions.length;
    const answeredCount = Object.keys(answers).length;
    const unansweredCount = totalQuestions - answeredCount;
    const markedCount = markedQuestions.size;
    const completionRate = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

    setExamState(prev => ({
      ...prev,
      statistics: {
        totalQuestions,
        answeredCount,
        unansweredCount,
        markedCount,
        completionRate,
        elapsedTime,
        remainingTime,
        averageTimePerQuestion: answeredCount > 0 ? elapsedTime / answeredCount : 0,
      }
    }));
  }, [examState.questions.length, answers, markedQuestions.size, elapsedTime, remainingTime]);

  // 保存答案到服务器
  const saveAnswer = useCallback(async (userAnswer: UserAnswer) => {
    try {
      const response = await fetch('/api/exam/save-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          examId,
          questionId: userAnswer.questionId,
          answer: userAnswer.answer,
          isMarked: userAnswer.isMarked,
          timeSpent: userAnswer.answerTime,
        }),
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('保存答案失败:', error);
      throw error;
    }
  }, [examId]);

  // 提交考试
  const submitExam = useCallback(async (isAutoSubmit = false) => {
    if (!examState.currentSession) return;

    stopTimer();

    try {
      const response = await fetch('/api/exam/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          examId,
          answers,
          totalTime: elapsedTime,
          isAutoSubmit,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // 更新考试状态为已提交
        setExamState(prev => ({
          ...prev,
          currentSession: prev.currentSession ? {
            ...prev.currentSession,
            status: ExamStatus.SUBMITTED,
            submitTime: new Date(),
          } : null,
        }));
        
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('提交考试失败:', error);
      throw error;
    }
  }, [examId, answers, elapsedTime, stopTimer, examState.currentSession]);

  // 暂停考试（仅练习模式）
  const pauseExam = useCallback(() => {
    if (examState.config.allowPause) {
      stopTimer();
      setExamState(prev => ({
        ...prev,
        currentSession: prev.currentSession ? {
          ...prev.currentSession,
          status: ExamStatus.PAUSED,
        } : null,
      }));
    }
  }, [examState.config.allowPause, stopTimer]);

  // 继续考试
  const resumeExam = useCallback(() => {
    if (examState.currentSession?.status === ExamStatus.PAUSED) {
      startTimer(remainingTime);
      setExamState(prev => ({
        ...prev,
        currentSession: prev.currentSession ? {
          ...prev.currentSession,
          status: ExamStatus.IN_PROGRESS,
        } : null,
      }));
    }
  }, [examState.currentSession?.status, remainingTime, startTimer]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, [stopTimer]);

  // 初始化考试
  useEffect(() => {
    if (examId) {
      initExam();
    }
  }, [examId, initExam]);

  // 自动保存机制
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (Object.keys(answers).length > 0) {
        // 批量保存答案
        console.log('自动保存答案...');
      }
    }, 30000); // 每30秒自动保存

    return () => clearInterval(autoSaveInterval);
  }, [answers]);

  return {
    // 状态数据
    examState,
    currentQuestionNumber,
    answers,
    markedQuestions,
    visitedQuestions,
    remainingTime,
    elapsedTime,
    
    // 计算属性
    getCurrentQuestion,
    getQuestionStatus,
    
    // 操作方法
    jumpToQuestion,
    selectAnswer,
    markQuestion,
    clearAnswer,
    submitExam,
    pauseExam,
    resumeExam,
    
    // 导航方法
    nextQuestion: () => {
      const nextNum = Math.min(currentQuestionNumber + 1, examState.statistics.totalQuestions);
      console.log("nextNum", nextNum)
      jumpToQuestion(nextNum);
    },
    previousQuestion: () => {
      const prevNum = Math.max(currentQuestionNumber - 1, 1);
      jumpToQuestion(prevNum);
    },
    
    // 工具方法
    formatTime: (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
    
    // 状态检查
    canSubmit: () => {
      return examState.currentSession?.status === ExamStatus.IN_PROGRESS;
    },
    
    isLastQuestion: () => {
      return currentQuestionNumber === examState.statistics.totalQuestions;
    },
    
    isFirstQuestion: () => {
      return currentQuestionNumber === 1;
    },
  };
};

// 模拟API调用
async function fetchExamData(examId: string) {
  // 这里应该是真实的API调用
  return new Promise<any>((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: {
          examInfo: {
            id: examId,
            title: '计算机网络原理期末考试',
            subject: 'computer-network',
            type: 'final',
            duration: 120,
            totalQuestions: 25,
            totalScore: 100,
            startTime: new Date(),
            endTime: new Date(Date.now() + 120 * 60 * 1000),
            allowedAttempts: 1,
            isShuffled: false,
            showScore: true,
            showCorrectAnswer: false,
          },
          questions: generateMockQuestions(25),
          session: {
            examId,
            userId: 'user123',
            status: ExamStatus.IN_PROGRESS,
            currentQuestionNumber: 1,
            startTime: new Date(),
            remainingTime: 120 * 60,
            answers: {},
            markedQuestions: new Set(),
            visitedQuestions: new Set(),
            timeSpentPerQuestion: {},
            lastSaveTime: new Date(),
          },
          config: {
            mode: 'exam',
            allowPause: false,
            allowReview: false,
            showAnswerImmediately: false,
            shuffleQuestions: false,
            shuffleOptions: false,
            timeLimit: 120,
            autoSubmit: true,
            preventCheating: true,
          },
        }
      });
    }, 1000);
  });
}

// 生成模拟题目数据
function generateMockQuestions(count: number): Question[] {
  const questions: Question[] = [];
  
  for (let i = 1; i <= count; i++) {
    questions.push({
      id: `q_${i}`,
      number: i,
      type: 'single_choice' as any,
      content: `这是第${i}道题目的内容，请选择正确答案。`,
      options: [
        { key: 'A', content: `选项A的内容 - 题目${i}` },
        { key: 'B', content: `选项B的内容 - 题目${i}` },
        { key: 'C', content: `选项C的内容 - 题目${i}` },
        { key: 'D', content: `选项D的内容 - 题目${i}` },
      ],
      score: 4,
      difficulty: 'medium',
      subject: 'computer-network',
    });
  }
  
  return questions;
}
