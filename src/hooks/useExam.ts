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
import { scrollTo } from '../utils';
import { getExaminationQuestionAction } from '../actions/examinations';

// 考试Hook - 管理考试状态和逻辑
export default function useExam (examId: string) {
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
      earlySubmitLimit: 0,
      limitTime: 0,
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

  // 初始化考试
  const initExam = useCallback(async () => {
    try {
      setExamState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // 模拟API调用
      const examData = await getExaminationQuestionAction(examId);
      
      if (examData && examData.success) {
        const { examInfo, questions, session, config } = examData.data;
        
        setExamState(prev => ({
          ...prev,
          examInfo,
          questions,
          currentSession: session,
          config,
          isLoading: false,
        }));
        
        // // 恢复会话状态
        if (session) {
          setCurrentQuestionNumber(1);
          setAnswers(session.answers || {});
          setMarkedQuestions(session.markedQuestions  || new Set());
          setVisitedQuestions(session.visitedQuestions || new Set());
          setRemainingTime(session.remainingTime);
        }
        
        
      } else {
        setExamState(prev => ({ 
          ...prev, 
          error: examData?.message || '加载考试失败',
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

  // 停止计时器
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // 获取当前题目
  const getCurrentQuestion = useCallback((): Question | null => {
    return examState.questions.find((q: any) => q.questionNumber === currentQuestionNumber) || null;
  }, [examState.questions, currentQuestionNumber]);

  // 获取题目状态
  const getQuestionStatus = useCallback((questionNumber: number): QuestionStatus => {
    const question = examState.questions.find(q => (q as any).questionNumber === questionNumber);
    const questionId = question?.id;
    
    if (questionNumber === currentQuestionNumber) return QuestionStatus.CURRENT;
    if (questionId && markedQuestions.has(questionId)) return QuestionStatus.MARKED;
    
    // 检查是否已答题（支持多选题）
    if (questionId && answers[questionId]) {
      const answer = answers[questionId].answer;
      // 对于多选题，检查是否有选择答案
      if (Array.isArray(answer)) {
        return answer.length > 0 ? QuestionStatus.ANSWERED : QuestionStatus.UNANSWERED;
      }
      // 对于单选题，检查答案是否不为空
      return answer ? QuestionStatus.ANSWERED : QuestionStatus.UNANSWERED;
    }
    
    return QuestionStatus.UNANSWERED;
  }, [currentQuestionNumber, markedQuestions, answers, examState.questions]);

  // 跳转到指定题目
  const jumpToQuestion = useCallback((questionNumber: number) => {
    const totalSize = examState?.examInfo?.totalQuestions || 0;
    if (questionNumber >= 1 && questionNumber <= totalSize) {

      const question = (examState.questions || []).find((q: any) => q?.questionNumber === questionNumber);
      if (question) {
        setCurrentQuestionNumber(questionNumber);
        setVisitedQuestions(prev => new Set(prev).add(question.id));
        scrollTo();
        // 记录题目访问时间
        const currentTime = Date.now();
        // 这里可以记录用户在每题上的停留时间
      }
    }
  }, [examState.questions, examState.statistics.totalQuestions]);

  // 更新统计信息 - 使用传入的最新状态
  const updateStatisticsWithStates = useCallback((
    latestAnswers: Record<string, UserAnswer>, 
    latestVisitedQuestions: Set<string>
  ) => {
    const totalQuestions = examState.questions.length;
    
    // 计算已答题数量（支持多选题）
    const answeredCount = Object.values(latestAnswers).filter(userAnswer => {
      const answer = userAnswer.answer;
      if (Array.isArray(answer)) {
        return answer.length > 0; // 多选题至少选择一个
      }
      return answer && answer.trim() !== ''; // 单选题或其他题型答案不为空
    }).length;
    console.log("latestVisitedQuestions =====> ", latestVisitedQuestions)
    
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
  }, [examState.questions.length, markedQuestions.size, elapsedTime, remainingTime]);

  // 更新统计信息
  const updateStatistics = useCallback(() => {
    updateStatisticsWithStates(answers, visitedQuestions);
  }, [updateStatisticsWithStates, answers, visitedQuestions]);

  // 选择答案
  const selectAnswer = useCallback(async (answer: string | string[]) => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;

    const userAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      questionNumber: (currentQuestion as any).questionNumber || 0,
      answer,
      answerTime: 0, // 这里应该计算实际用时
      isMarked: markedQuestions.has(currentQuestion.id),
      submitTime: new Date(),
    };

    
    // 更新本地状态
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: userAnswer
    };
    setAnswers(newAnswers);
    
    // 更新访问记录
    const newVisitedQuestions = new Set(visitedQuestions).add(currentQuestion.id);
    setVisitedQuestions(newVisitedQuestions);
    
    // 自动保存到服务器
    try {
    //   await saveAnswer(userAnswer);
    } catch (error) {
      console.error('保存答案失败:', error);
    }

    updateStatisticsWithStates(newAnswers, newVisitedQuestions);
  }, [getCurrentQuestion, markedQuestions, answers, visitedQuestions, updateStatisticsWithStates]);

  // 标记题目
  const markQuestion = useCallback((questionNumber?: number) => {
    console.log("标记题目 questionNumber =====> ", questionNumber)
    const targetNumber = questionNumber || currentQuestionNumber;
    const question = examState.questions.find(q => (q as any).questionNumber === targetNumber);
    
    if (question) {
      let newMarkedQuestions: Set<string>;
      setMarkedQuestions(prev => {
        newMarkedQuestions = new Set(prev);
        if (newMarkedQuestions.has(question.id)) {
          newMarkedQuestions.delete(question.id);
        } else {
          newMarkedQuestions.add(question.id);
        }
        return newMarkedQuestions;
      });
      
      // 延迟更新统计，确保状态已更新
      setTimeout(() => updateStatistics(), 0);
    }
  }, [currentQuestionNumber, examState.questions, updateStatistics]);

  // 清除答案
  const clearAnswer = useCallback(() => {
    const currentQuestion = getCurrentQuestion();
    if (currentQuestion) {
      const newAnswers = { ...answers };
      delete newAnswers[currentQuestion.id];
      setAnswers(newAnswers);
      
      // 使用最新状态立即更新统计
      updateStatisticsWithStates(newAnswers, visitedQuestions);
    }
  }, [getCurrentQuestion, answers, visitedQuestions, updateStatisticsWithStates]);

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
    // 导航方法
    nextQuestion: useCallback(() => {
      const totalSize = examState?.questions?.length || 0;
      const nextNum = Math.min(currentQuestionNumber + 1, totalSize);
      jumpToQuestion(nextNum);
    }, [currentQuestionNumber, examState, jumpToQuestion]),
    
    previousQuestion: useCallback(() => {
      const prevNum = Math.max(currentQuestionNumber - 1, 1);
      jumpToQuestion(prevNum);
    }, [currentQuestionNumber, jumpToQuestion]),
    
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
