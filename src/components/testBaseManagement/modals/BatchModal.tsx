import React, { useState, useEffect } from "react";
 import { BatchModalProps } from "../../../interface/testBaseManagement";
 import "./BatchModal.css";

interface QuestionItem {
  id: string;
  content: string;
  type: string;
  difficulty: string;
  subject: string;
  tags: string[];
  createdAt: string;
  createdBy: string;
  usageCount: number;
  correctRate: number;
  status: string;
  selected: boolean;
}

interface BatchOperation {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  affectedCount: number;
}

 function BatchModal(props: BatchModalProps) {
  const [activeTab, setActiveTab] = useState('select');
  const [questions, setQuestions] = useState<QuestionItem[]>([
    {
      id: '1',
      content: 'TCP协议和UDP协议的主要区别是什么？',
      type: 'single_choice',
      difficulty: 'medium',
      subject: 'computer',
      tags: ['网络协议', '基础概念'],
      createdAt: '2024-03-15',
      createdBy: '张老师',
      usageCount: 234,
      correctRate: 78.5,
      status: 'active',
      selected: false
    },
    {
      id: '2',
      content: '数据结构中栈和队列的特点',
      type: 'essay',
      difficulty: 'hard',
      subject: 'computer',
      tags: ['数据结构', '算法'],
      createdAt: '2024-03-14',
      createdBy: '李老师',
      usageCount: 156,
      correctRate: 65.2,
      status: 'active',
      selected: false
    },
    {
      id: '3',
      content: '面向对象编程的三大特性',
      type: 'multiple_choice',
      difficulty: 'easy',
      subject: 'computer',
      tags: ['OOP', '编程基础'],
      createdAt: '2024-03-13',
      createdBy: '王老师',
      usageCount: 298,
      correctRate: 85.3,
      status: 'active',
      selected: false
    }
  ]);

  const [selectedOperation, setSelectedOperation] = useState('edit');
  const [batchEditForm, setBatchEditForm] = useState({
    type: '',
    difficulty: '',
    subject: '',
    tags: '',
    status: ''
  });
  const [operations, setOperations] = useState<BatchOperation[]>([
    {
      id: '1',
      type: 'edit',
      description: '批量修改难度为"中等"',
      timestamp: '2024-03-15 10:30:00',
      status: 'completed',
      progress: 100,
      affectedCount: 25
    },
    {
      id: '2',
      type: 'delete',
      description: '批量删除过期题目',
      timestamp: '2024-03-14 15:20:00',
      status: 'completed',
      progress: 100,
      affectedCount: 8
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);

  const questionTypeOptions = [
    { value: 'single_choice', label: '单选题', icon: '📋' },
    { value: 'multiple_choice', label: '多选题', icon: '📝' },
    { value: 'true_false', label: '判断题', icon: '✅' },
    { value: 'fill_blank', label: '填空题', icon: '✏️' },
    { value: 'essay', label: '简答题', icon: '📄' }
  ];

  const difficultyOptions = [
    { value: 'easy', label: '简单', color: '#2ecc71' },
    { value: 'medium', label: '中等', color: '#f39c12' },
    { value: 'hard', label: '困难', color: '#e74c3c' }
  ];

  const subjectOptions = [
    { value: 'math', label: '数学', icon: '🔢' },
    { value: 'chinese', label: '语文', icon: '📚' },
    { value: 'english', label: '英语', icon: '🔤' },
    { value: 'physics', label: '物理', icon: '⚛️' },
    { value: 'chemistry', label: '化学', icon: '🧪' },
    { value: 'biology', label: '生物', icon: '🧬' }
  ];

  const statusOptions = [
    { value: 'active', label: '启用', color: '#2ecc71' },
    { value: 'inactive', label: '禁用', color: '#95a5a6' },
    { value: 'pending', label: '待审核', color: '#f39c12' }
  ];

  const getSelectedQuestions = () => questions.filter(q => q.selected);

  const selectAll = () => {
    setQuestions(prev => prev.map(q => ({ ...q, selected: true })));
  };

  const selectNone = () => {
    setQuestions(prev => prev.map(q => ({ ...q, selected: false })));
  };

  const selectInverse = () => {
    setQuestions(prev => prev.map(q => ({ ...q, selected: !q.selected })));
  };

  const selectByCondition = (condition: string) => {
    setQuestions(prev => prev.map(q => {
      let shouldSelect = false;
      switch (condition) {
        case 'high-usage':
          shouldSelect = q.usageCount > 200;
          break;
        case 'low-rate':
          shouldSelect = q.correctRate < 70;
          break;
        case 'recent':
          shouldSelect = new Date(q.createdAt) > new Date('2024-03-14');
          break;
        case 'easy':
          shouldSelect = q.difficulty === 'easy';
          break;
        case 'hard':
          shouldSelect = q.difficulty === 'hard';
          break;
        default:
          shouldSelect = q.selected;
      }
      return { ...q, selected: shouldSelect };
    }));
  };

  const toggleQuestionSelection = (id: string) => {
    setQuestions(prev => prev.map(q => 
      q.id === id ? { ...q, selected: !q.selected } : q
    ));
  };

  const executeBatchOperation = async () => {
    const selected = getSelectedQuestions();
    if (selected.length === 0) {
      alert('请先选择要操作的题目');
      return;
    }

    setIsProcessing(true);
    setCurrentProgress(0);

    const newOperation: BatchOperation = {
      id: Date.now().toString(),
      type: selectedOperation,
      description: generateOperationDescription(),
      timestamp: new Date().toLocaleString(),
      status: 'running',
      progress: 0,
      affectedCount: selected.length
    };

    setOperations(prev => [newOperation, ...prev]);

    // 模拟批量操作进度
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setCurrentProgress(i);
    }

    // 执行具体操作
    switch (selectedOperation) {
      case 'edit':
        executeEditOperation(selected);
        break;
      case 'delete':
        executeDeleteOperation(selected);
        break;
      case 'export':
        executeExportOperation(selected);
        break;
      case 'move':
        executeMoveOperation(selected);
        break;
      case 'tag':
        executeTagOperation(selected);
        break;
    }

    // 更新操作状态
    setOperations(prev => prev.map(op => 
      op.id === newOperation.id 
        ? { ...op, status: 'completed', progress: 100 }
        : op
    ));

    setIsProcessing(false);
    setCurrentProgress(0);
  };

  const generateOperationDescription = () => {
    const count = getSelectedQuestions().length;
    switch (selectedOperation) {
      case 'edit':
        return `批量编辑 ${count} 道题目`;
      case 'delete':
        return `批量删除 ${count} 道题目`;
      case 'export':
        return `批量导出 ${count} 道题目`;
      case 'move':
        return `批量移动 ${count} 道题目`;
      case 'tag':
        return `批量标记 ${count} 道题目`;
      default:
        return `批量操作 ${count} 道题目`;
    }
  };

  const executeEditOperation = (selected: QuestionItem[]) => {
    setQuestions(prev => prev.map(q => {
      if (selected.find(s => s.id === q.id)) {
        return {
          ...q,
          type: batchEditForm.type || q.type,
          difficulty: batchEditForm.difficulty || q.difficulty,
          subject: batchEditForm.subject || q.subject,
          status: batchEditForm.status || q.status,
          tags: batchEditForm.tags ? [...q.tags, ...batchEditForm.tags.split(',')] : q.tags
        };
      }
      return q;
    }));
  };

  const executeDeleteOperation = (selected: QuestionItem[]) => {
    const selectedIds = selected.map(s => s.id);
    setQuestions(prev => prev.filter(q => !selectedIds.includes(q.id)));
  };

  const executeExportOperation = (selected: QuestionItem[]) => {
    // 模拟导出操作
    console.log('导出题目:', selected);
    // 实际实现中这里会调用导出API
  };

  const executeMoveOperation = (selected: QuestionItem[]) => {
    // 模拟移动操作
    console.log('移动题目:', selected);
  };

  const executeTagOperation = (selected: QuestionItem[]) => {
    // 模拟标记操作
    console.log('标记题目:', selected);
  };

  const renderSelectionTab = () => (
    <div className="batch-section">
      <div className="selection-controls">
        <h3 className="section-title">📋 题目选择</h3>
        <div className="selection-actions">
          <button className="btn btn-secondary btn-sm" onClick={selectAll}>
            全选 ({questions.length})
          </button>
          <button className="btn btn-secondary btn-sm" onClick={selectNone}>
            清空
          </button>
          <button className="btn btn-secondary btn-sm" onClick={selectInverse}>
            反选
          </button>
        </div>
      </div>

      <div className="condition-selection">
        <h4 className="subsection-title">🎯 按条件选择</h4>
        <div className="condition-buttons">
          <button 
            className="condition-btn"
            onClick={() => selectByCondition('high-usage')}
          >
            高频使用 (大于200次)
          </button>
          <button 
            className="condition-btn"
            onClick={() => selectByCondition('low-rate')}
          >
            低正确率 (小于70%)
          </button>
          <button 
            className="condition-btn"
            onClick={() => selectByCondition('recent')}
          >
            最近创建
          </button>
          <button 
            className="condition-btn"
            onClick={() => selectByCondition('easy')}
          >
            简单题目
          </button>
          <button 
            className="condition-btn"
            onClick={() => selectByCondition('hard')}
          >
            困难题目
          </button>
        </div>
      </div>

      <div className="questions-list">
        <div className="list-header">
          <span className="selected-count">
            已选择 {getSelectedQuestions().length} / {questions.length} 道题目
          </span>
        </div>
        <div className="questions-container">
          {questions.map(question => (
            <div key={question.id} className={`question-item ${question.selected ? 'selected' : ''}`}>
              <div className="question-checkbox">
                <input
                  type="checkbox"
                  checked={question.selected}
                  onChange={() => toggleQuestionSelection(question.id)}
                />
              </div>
              <div className="question-info">
                <div className="question-header">
                  <div className="question-type">
                    {questionTypeOptions.find(opt => opt.value === question.type)?.icon}
                    {questionTypeOptions.find(opt => opt.value === question.type)?.label}
                  </div>
                  <div 
                    className="question-difficulty"
                    style={{ 
                      color: difficultyOptions.find(opt => opt.value === question.difficulty)?.color 
                    }}
                  >
                    {difficultyOptions.find(opt => opt.value === question.difficulty)?.label}
                  </div>
                </div>
                <div className="question-content">{question.content}</div>
                <div className="question-meta">
                  <span>👤 {question.createdBy}</span>
                  <span>📅 {question.createdAt}</span>
                  <span>🔥 {question.usageCount}次</span>
                  <span>📊 {question.correctRate}%</span>
                </div>
                <div className="question-tags">
                  {question.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderOperationsTab = () => (
    <div className="batch-section">
      <h3 className="section-title">🛠️ 批量操作</h3>
      
      <div className="operation-selector">
        <h4 className="subsection-title">选择操作类型</h4>
        <div className="operation-options">
          <label className="operation-option">
            <input
              type="radio"
              name="operation"
              value="edit"
              checked={selectedOperation === 'edit'}
              onChange={(e) => setSelectedOperation(e.target.value)}
            />
            <div className="option-content">
              <div className="option-icon">✏️</div>
              <div className="option-text">
                <div className="option-title">批量编辑</div>
                <div className="option-desc">修改题目属性</div>
              </div>
            </div>
          </label>

          <label className="operation-option">
            <input
              type="radio"
              name="operation"
              value="delete"
              checked={selectedOperation === 'delete'}
              onChange={(e) => setSelectedOperation(e.target.value)}
            />
            <div className="option-content">
              <div className="option-icon">🗑️</div>
              <div className="option-text">
                <div className="option-title">批量删除</div>
                <div className="option-desc">永久删除题目</div>
              </div>
            </div>
          </label>

          <label className="operation-option">
            <input
              type="radio"
              name="operation"
              value="export"
              checked={selectedOperation === 'export'}
              onChange={(e) => setSelectedOperation(e.target.value)}
            />
            <div className="option-content">
              <div className="option-icon">📤</div>
              <div className="option-text">
                <div className="option-title">批量导出</div>
                <div className="option-desc">导出为文件</div>
              </div>
            </div>
          </label>

          <label className="operation-option">
            <input
              type="radio"
              name="operation"
              value="move"
              checked={selectedOperation === 'move'}
              onChange={(e) => setSelectedOperation(e.target.value)}
            />
            <div className="option-content">
              <div className="option-icon">📁</div>
              <div className="option-text">
                <div className="option-title">批量移动</div>
                <div className="option-desc">移动到分类</div>
              </div>
            </div>
          </label>

          <label className="operation-option">
            <input
              type="radio"
              name="operation"
              value="tag"
              checked={selectedOperation === 'tag'}
              onChange={(e) => setSelectedOperation(e.target.value)}
            />
            <div className="option-content">
              <div className="option-icon">🏷️</div>
              <div className="option-text">
                <div className="option-title">批量标记</div>
                <div className="option-desc">添加标签</div>
              </div>
            </div>
          </label>
        </div>
      </div>

      {selectedOperation === 'edit' && (
        <div className="edit-form">
          <h4 className="subsection-title">批量编辑设置</h4>
          <div className="form-row">
            <div className="form-field">
              <label>题型</label>
              <select 
                value={batchEditForm.type}
                onChange={(e) => setBatchEditForm(prev => ({...prev, type: e.target.value}))}
              >
                <option value="">不修改</option>
                {questionTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>难度</label>
              <select 
                value={batchEditForm.difficulty}
                onChange={(e) => setBatchEditForm(prev => ({...prev, difficulty: e.target.value}))}
              >
                <option value="">不修改</option>
                {difficultyOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>学科</label>
              <select 
                value={batchEditForm.subject}
                onChange={(e) => setBatchEditForm(prev => ({...prev, subject: e.target.value}))}
              >
                <option value="">不修改</option>
                {subjectOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>状态</label>
              <select 
                value={batchEditForm.status}
                onChange={(e) => setBatchEditForm(prev => ({...prev, status: e.target.value}))}
              >
                <option value="">不修改</option>
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-field full-width">
              <label>添加标签</label>
              <input
                type="text"
                placeholder="输入标签，用逗号分隔"
                value={batchEditForm.tags}
                onChange={(e) => setBatchEditForm(prev => ({...prev, tags: e.target.value}))}
              />
            </div>
          </div>
        </div>
      )}

      {selectedOperation === 'delete' && (
        <div className="delete-warning">
          <div className="warning-box">
            <div className="warning-icon">⚠️</div>
            <div className="warning-text">
              <div className="warning-title">删除确认</div>
              <div className="warning-desc">
                此操作将永久删除选中的 {getSelectedQuestions().length} 道题目，且无法恢复。
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedOperation === 'export' && (
        <div className="export-options">
          <h4 className="subsection-title">导出设置</h4>
          <div className="export-formats">
            <label className="format-option">
              <input type="radio" name="format" value="excel" defaultChecked />
              <span>📊 Excel格式 (.xlsx)</span>
            </label>
            <label className="format-option">
              <input type="radio" name="format" value="word" />
              <span>📄 Word格式 (.docx)</span>
            </label>
            <label className="format-option">
              <input type="radio" name="format" value="pdf" />
              <span>📑 PDF格式 (.pdf)</span>
            </label>
          </div>
        </div>
      )}

      <div className="operation-summary">
        <div className="summary-info">
          <span>将对 <strong>{getSelectedQuestions().length}</strong> 道题目执行 <strong>{selectedOperation}</strong> 操作</span>
        </div>
        <button 
          className="btn btn-primary btn-large"
          onClick={executeBatchOperation}
          disabled={getSelectedQuestions().length === 0 || isProcessing}
        >
          {isProcessing ? '执行中...' : '执行批量操作'}
        </button>
      </div>

      {isProcessing && (
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${currentProgress}%` }}
            ></div>
          </div>
          <div className="progress-text">{currentProgress}%</div>
        </div>
      )}
    </div>
  );

  const renderHistoryTab = () => (
    <div className="batch-section">
      <h3 className="section-title">📜 操作历史</h3>
      <div className="history-list">
        {operations.map(operation => (
          <div key={operation.id} className="history-item">
            <div className="history-header">
              <div className="history-type">
                {operation.type === 'edit' && '✏️'}
                {operation.type === 'delete' && '🗑️'}
                {operation.type === 'export' && '📤'}
                {operation.type === 'move' && '📁'}
                {operation.type === 'tag' && '🏷️'}
                <span>{operation.description}</span>
              </div>
              <div className={`history-status status-${operation.status}`}>
                {operation.status === 'completed' && '✅ 已完成'}
                {operation.status === 'running' && '🔄 执行中'}
                {operation.status === 'failed' && '❌ 失败'}
                {operation.status === 'pending' && '⏳ 等待中'}
              </div>
            </div>
            <div className="history-details">
              <span>📅 {operation.timestamp}</span>
              <span>📊 影响 {operation.affectedCount} 道题目</span>
              <span>📈 进度 {operation.progress}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="batch-modal">
      <div className="modal-overlay" onClick={props.onClose}>
        <div className="modal-content extra-large" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">
              <span className="title-icon">🛠️</span>
              批量操作
            </h2>
            <button className="close-btn" onClick={props.onClose}>✕</button>
          </div>

          <div className="modal-body">
            <div className="tabs-container">
              <div className="tabs-nav">
                <button 
                  className={`tab-btn ${activeTab === 'select' ? 'active' : ''}`}
                  onClick={() => setActiveTab('select')}
                >
                  📋 选择题目
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'operations' ? 'active' : ''}`}
                  onClick={() => setActiveTab('operations')}
                >
                  🛠️ 执行操作
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                  onClick={() => setActiveTab('history')}
                >
                  📜 操作历史
                </button>
              </div>

              <div className="tabs-content">
                {activeTab === 'select' && renderSelectionTab()}
                {activeTab === 'operations' && renderOperationsTab()}
                {activeTab === 'history' && renderHistoryTab()}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={props.onClose}>关闭</button>
            {activeTab === 'select' && (
              <button 
                className="btn btn-primary"
                onClick={() => setActiveTab('operations')}
                disabled={getSelectedQuestions().length === 0}
              >
                下一步：选择操作 ({getSelectedQuestions().length})
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
 }

 export default BatchModal;
