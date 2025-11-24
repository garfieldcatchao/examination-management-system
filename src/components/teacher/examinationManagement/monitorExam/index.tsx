import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { BehaviorLogState, StudentState, StatisticsState, AlertItemState } from "../../../../interface/monitorExamFace";
import {
  Card,
  Badge,
  Tabs,
  Button,
  Input,
  Statistic,
  Timeline,
  Empty,
  Progress,
  Tag,
  Alert,
  Modal,
  Form,
  Select,
  Radio,
  Avatar,
  Tooltip,
  message,
  List,
  Divider,
  Space,
} from "antd";
import {
  UserOutlined,
  ExclamationCircleOutlined,
  BellOutlined,
  DownloadOutlined,
  SettingOutlined,
  ReloadOutlined,
  SearchOutlined,
  CameraOutlined,
  MessageOutlined,
  EyeOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TeamOutlined,
  SafetyOutlined,
  DashboardOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import "./monitorExam.css";
import LiveCameraPreview from './LiveCameraPreview';
import useAdminMonitoring from '../../../../hooks/useAdminMonitoring';

// 模拟数据
const MOCK_STUDENTSTATES: StudentState[] = [
  {
    id: "1",
    name: "张三",
    studentId: "2022001",
    className: "计算机科学2班",
    status: "online",
    isCameraActive: true,
    faceDetected: true,
    userPresent: true,
    lastActivity: new Date(),
    progress: {
      percentage: 75,
      answered: 15,
      unanswered: 5,
      marked: 2,
      status: "active",
    },
    behaviorLogs: [
      {
        id: "log1",
        type: "normal",
        message: "开始考试",
        timestamp: new Date(Date.now() - 3600000),
      },
      {
        id: "log2",
        type: "warning",
        message: "切换窗口",
        timestamp: new Date(Date.now() - 1800000),
      },
      {
        id: "log3",
        type: "normal",
        message: "返回考试",
        timestamp: new Date(Date.now() - 1790000),
      },
    ],
  },
  {
    id: "2",
    name: "李四",
    studentId: "2022002",
    className: "计算机科学2班",
    status: "warning",
    isCameraActive: true,
    faceDetected: false,
    userPresent: false,
    lastActivity: new Date(Date.now() - 300000),
    progress: {
      percentage: 45,
      answered: 9,
      unanswered: 11,
      marked: 1,
      status: "active",
    },
    behaviorLogs: [
      {
        id: "log1",
        type: "normal",
        message: "开始考试",
        timestamp: new Date(Date.now() - 3600000),
      },
      {
        id: "log2",
        type: "warning",
        message: "未检测到人脸",
        timestamp: new Date(Date.now() - 300000),
      },
    ],
  },
  {
    id: "3",
    name: "王五",
    studentId: "2022003",
    className: "计算机科学2班",
    status: "offline",
    isCameraActive: false,
    faceDetected: false,
    userPresent: false,
    lastActivity: new Date(Date.now() - 1200000),
    progress: {
      percentage: 30,
      answered: 6,
      unanswered: 14,
      marked: 0,
      status: "paused",
    },
    behaviorLogs: [
      {
        id: "log1",
        type: "normal",
        message: "开始考试",
        timestamp: new Date(Date.now() - 3600000),
      },
      {
        id: "log2",
        type: "warning",
        message: "连接断开",
        timestamp: new Date(Date.now() - 1200000),
      },
    ],
  },
];

// 摄像头预览组件
interface CameraPreviewProps {
  studentId: string;
  faceDetected: boolean;
  userPresent: boolean;
}

const CameraPreview: React.FC<CameraPreviewProps> = ({ studentId, faceDetected, userPresent }) => {
  return (
    <div className="monitor-camera-preview">
      <div className="monitor-camera-placeholder">
        <VideoCameraOutlined className="monitor-camera-icon" />
        <div className="monitor-camera-status-text">
          {faceDetected ? "人脸已检测" : "未检测到人脸"}
        </div>
        <div className="monitor-camera-badge">
          <Badge
            status={faceDetected ? "success" : "error"}
            text={userPresent ? "在座" : "离座"}
          />
        </div>
      </div>
      <div className="monitor-camera-overlay">
        <div className="monitor-camera-info">
          <span className="monitor-camera-label">学号: {studentId}</span>
          <span className={`monitor-camera-indicator ${faceDetected ? 'active' : 'inactive'}`}></span>
        </div>
      </div>
    </div>
  );
};

// 工具函数
const formatTime = (date: Date): string => {
  if (!date) return "--";
  return date.toLocaleTimeString();
};

const formatLastActivity = (date: Date): string => {
  if (!date) return "--";
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}秒前`;
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  return date.toLocaleTimeString();
};

const getStatusBadge = (status: string): "success" | "default" | "error" | "processing" | "warning" => {
  switch (status) {
    case "online":
      return "success";
    case "offline":
      return "default";
    case "warning":
      return "error";
    default:
      return "default";
  }
};

const getBehaviorColor = (type: string): string => {
  switch (type) {
    case "warning":
      return "red";
    case "normal":
      return "green";
    default:
      return "blue";
  }
};

const getAlertType = (severity: string): "success" | "info" | "warning" | "error" => {
  switch (severity) {
    case "high":
      return "error";
    case "medium":
      return "warning";
    case "low":
      return "info";
    default:
      return "info";
  }
};

// 顶部统计卡片组件
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  percentage?: number;
  trend?: 'up' | 'down';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, percentage, trend }) => {
  return (
    <Card className="monitor-stat-card" bordered={false}>
      <div className="monitor-stat-card-content">
        <div className="monitor-stat-card-left">
          <div className="monitor-stat-card-title">{title}</div>
          <div className="monitor-stat-card-value">{value}</div>
          {percentage !== undefined && (
            <div className={`monitor-stat-card-trend ${trend}`}>
              {trend === 'up' ? '↑' : '↓'} {percentage}%
            </div>
          )}
        </div>
        <div className="monitor-stat-card-right" style={{ backgroundColor: color }}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

// 主监控组件
function MonitorExam() {
  const { examId } = useParams<{ examId: string }>();
  const [studentstates, setStudentStates] = useState<StudentState[]>(MOCK_STUDENTSTATES);
  const [filteredStudent, setFilteredStudent] = useState<StudentState[]>(MOCK_STUDENTSTATES);
  const [selectedStudent, setSelectedStudent] = useState<StudentState | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchText, setSearchText] = useState<string>("");
  const [statistics, setStatistics] = useState<StatisticsState>({
    total: MOCK_STUDENTSTATES.length,
    online: MOCK_STUDENTSTATES.filter(s => s.status === 'online').length,
    offline: MOCK_STUDENTSTATES.filter(s => s.status === 'offline').length,
    warning: MOCK_STUDENTSTATES.filter(s => s.status === 'warning').length,
  });
  const [alerts, setAlerts] = useState<AlertItemState[]>([
    {
      studentName: '李四',
      studentId: '2022002',
      message: '未检测到人脸超过5分钟',
      severity: 'high',
      timestamp: new Date(),
    },
    {
      studentName: '王五',
      studentId: '2022003',
      message: '连接断开',
      severity: 'medium',
      timestamp: new Date(Date.now() - 300000),
    }
  ]);
  const [batchModalVisible, setBatchModalVisible] = useState(false);

  // 使用管理员监控Hook（可选，用于实时数据）
  const adminMonitoring = useAdminMonitoring(examId || '', {
    websocketUrl: process.env.REACT_APP_WS_URL || 'ws://localhost:8080/admin-monitoring',
  });

  // 处理筛选
  const handleFilterChange = (filter: string) => {
    setFilterStatus(filter);
    let filtered = studentstates;
    
    if (filter !== 'all') {
      filtered = studentstates.filter(s => s.status === filter);
    }
    
    if (searchText) {
      filtered = filtered.filter(s => 
        s.name.includes(searchText) || 
        s.studentId.includes(searchText)
      );
    }
    
    setFilteredStudent(filtered);
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchText(value);
    let filtered = studentstates;
    
    if (filterStatus !== 'all') {
      filtered = studentstates.filter(s => s.status === filterStatus);
    }
    
    if (value) {
      filtered = filtered.filter(s => 
        s.name.includes(value) || 
        s.studentId.includes(value)
      );
    }
    
    setFilteredStudent(filtered);
  };

  // 处理学生选择
  const handleStudentStateSelect = (studentstate: StudentState) => {
    setSelectedStudent(studentstate);
  };

  // 导出监控数据
  const handleExport = () => {
    message.success('监控数据正在导出...');
  };

  // 发送提醒
  const handleSendNotification = () => {
    message.success('提醒已发送');
    setBatchModalVisible(false);
  };

  return (
    <div className="monitor-container">
      {/* 顶部统计区域 */}
      <div className="monitor-header">
        <div className="monitor-header-title">
          <DashboardOutlined className="monitor-header-icon" />
          <h2>考试实时监控</h2>
          <span className="monitor-header-subtitle">实时监控考生状态和行为</span>
        </div>
        <div className="monitor-header-actions">
          <Button icon={<ReloadOutlined />}>刷新</Button>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>导出数据</Button>
          <Button icon={<SettingOutlined />}>设置</Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="monitor-stats-grid">
        <StatCard
          title="总参考人数"
          value={statistics.total}
          icon={<TeamOutlined />}
          color="#1890ff"
          percentage={100}
          trend="up"
        />
        <StatCard
          title="在线人数"
          value={statistics.online}
          icon={<CheckCircleOutlined />}
          color="#52c41a"
          percentage={Math.round((statistics.online / statistics.total) * 100)}
          trend="up"
        />
        <StatCard
          title="离线人数"
          value={statistics.offline}
          icon={<CloseCircleOutlined />}
          color="#faad14"
          percentage={Math.round((statistics.offline / statistics.total) * 100)}
          trend="down"
        />
        <StatCard
          title="异常人数"
          value={statistics.warning}
          icon={<WarningOutlined />}
          color="#ff4d4f"
          percentage={Math.round((statistics.warning / statistics.total) * 100)}
          trend="down"
        />
      </div>

      {/* 主要内容区域 */}
      <div className="monitor-content">
        {/* 左侧学生列表 */}
        <div className="monitor-sidebar">
          <Card 
            className="monitor-sidebar-card" 
            bordered={false}
            title={
              <div className="monitor-sidebar-header">
                <span>考生列表</span>
                <Tag color="blue">{filteredStudent.length}人</Tag>
              </div>
            }
          >
            {/* 筛选和搜索 */}
            <div className="monitor-sidebar-filter">
              <Radio.Group 
                value={filterStatus} 
                onChange={e => handleFilterChange(e.target.value)}
                buttonStyle="solid"
                size="small"
              >
                <Radio.Button value="all">全部</Radio.Button>
                <Radio.Button value="online">在线</Radio.Button>
                <Radio.Button value="offline">离线</Radio.Button>
                <Radio.Button value="warning">异常</Radio.Button>
              </Radio.Group>
              <Input.Search
                placeholder="搜索学生姓名或学号"
                allowClear
                size="small"
                onSearch={handleSearch}
                onChange={e => handleSearch(e.target.value)}
                className="monitor-sidebar-search"
              />
            </div>

            {/* 学生列表 */}
            <div className="monitor-student-list">
              <List
                dataSource={filteredStudent}
                renderItem={studentstate => (
                  <div
                    className={`monitor-student-item ${selectedStudent?.id === studentstate.id ? 'active' : ''}`}
                    onClick={() => handleStudentStateSelect(studentstate)}
                  >
                    <div className="monitor-student-avatar">
                      <Badge status={getStatusBadge(studentstate.status)} offset={[-5, 35]}>
                        <Avatar size={40} icon={<UserOutlined />} />
                      </Badge>
                    </div>
                    <div className="monitor-student-info">
                      <div className="monitor-student-name">{studentstate.name}</div>
                      <div className="monitor-student-id">{studentstate.studentId}</div>
                      <div className="monitor-student-time">
                        <ClockCircleOutlined /> {formatLastActivity(studentstate.lastActivity)}
                      </div>
                    </div>
                    <div className="monitor-student-status">
                      {studentstate.status === 'online' && <Tag color="success">在线</Tag>}
                      {studentstate.status === 'offline' && <Tag color="default">离线</Tag>}
                      {studentstate.status === 'warning' && <Tag color="error">异常</Tag>}
                    </div>
                  </div>
                )}
              />
            </div>
          </Card>
        </div>

        {/* 中间详情区域 */}
        <div className="monitor-main">
          {selectedStudent ? (
            <>
              {/* 学生基本信息 */}
              <Card className="monitor-detail-card" bordered={false}>
                <div className="monitor-detail-header">
                  <div className="monitor-detail-user">
                    <Avatar size={64} icon={<UserOutlined />} />
                    <div className="monitor-detail-user-info">
                      <h3>{selectedStudent.name}</h3>
                      <p>学号: {selectedStudent.studentId} | 班级: {selectedStudent.className}</p>
                    </div>
                  </div>
                  <div className="monitor-detail-actions">
                    <Button icon={<MessageOutlined />} type="primary">发送提醒</Button>
                    <Button icon={<ExclamationCircleOutlined />} danger>强制交卷</Button>
                  </div>
                </div>

                <Divider />

                <Tabs defaultActiveKey="camera">
                  <Tabs.TabPane 
                    tab={<span><VideoCameraOutlined />摄像头监控</span>} 
                    key="camera"
                  >
                    <div className="monitor-camera-section">
                      <div className="monitor-camera-main">
                        {selectedStudent.isCameraActive ? (
                          <LiveCameraPreview
                            studentId={selectedStudent.studentId}
                            userId={selectedStudent.id}
                            snapshot={adminMonitoring.getStudentById(selectedStudent.id)?.latestSnapshot}
                            videoStream={adminMonitoring.getStudentById(selectedStudent.id)?.videoStream}
                            faceDetected={selectedStudent.faceDetected}
                            userPresent={selectedStudent.userPresent}
                            onRequestStream={() => adminMonitoring.actions.requestVideoStream(selectedStudent.id)}
                            onStopStream={() => adminMonitoring.actions.stopVideoStream(selectedStudent.id)}
                          />
                        ) : (
                          <div className="monitor-camera-disabled">
                            <CameraOutlined />
                            <p>摄像头未开启</p>
                          </div>
                        )}
                      </div>
                      <div className="monitor-camera-stats">
                        <div className="monitor-info-item">
                          <span className="monitor-info-label">摄像头状态</span>
                          <span className="monitor-info-value">
                            {selectedStudent.isCameraActive ? 
                              <Tag color="success">已开启</Tag> : 
                              <Tag color="default">未开启</Tag>
                            }
                          </span>
                        </div>
                        <div className="monitor-info-item">
                          <span className="monitor-info-label">人脸检测</span>
                          <span className="monitor-info-value">
                            {selectedStudent.faceDetected ? 
                              <Tag color="success">已检测</Tag> : 
                              <Tag color="error">未检测</Tag>
                            }
                          </span>
                        </div>
                        <div className="monitor-info-item">
                          <span className="monitor-info-label">在座状态</span>
                          <span className="monitor-info-value">
                            {selectedStudent.userPresent ? 
                              <Tag color="success">在座</Tag> : 
                              <Tag color="error">离座</Tag>
                            }
                          </span>
                        </div>
                        <div className="monitor-info-item">
                          <span className="monitor-info-label">最后活动</span>
                          <span className="monitor-info-value">
                            {formatLastActivity(selectedStudent.lastActivity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Tabs.TabPane>

                  <Tabs.TabPane 
                    tab={<span><ClockCircleOutlined />行为记录</span>} 
                    key="behavior"
                  >
                    <div className="monitor-behavior-timeline">
                      <Timeline>
                        {selectedStudent.behaviorLogs.map((log: BehaviorLogState) => (
                          <Timeline.Item
                            key={log.id}
                            color={getBehaviorColor(log.type)}
                          >
                            <div className="monitor-timeline-item">
                              <div className="monitor-timeline-time">
                                {formatTime(log.timestamp)}
                              </div>
                              <div className="monitor-timeline-content">
                                {log.message}
                              </div>
                            </div>
                          </Timeline.Item>
                        ))}
                      </Timeline>
                    </div>
                  </Tabs.TabPane>

                  <Tabs.TabPane 
                    tab={<span><CheckCircleOutlined />答题进度</span>} 
                    key="progress"
                  >
                    <div className="monitor-progress-section">
                      <Progress
                        type="circle"
                        percent={selectedStudent.progress.percentage}
                        status={selectedStudent.progress.status === 'active' ? 'active' : 'normal'}
                        width={120}
                      />
                      <div className="monitor-progress-stats">
                        <Statistic 
                          title="已答题数" 
                          value={selectedStudent.progress.answered} 
                          suffix="题"
                        />
                        <Statistic 
                          title="未答题数" 
                          value={selectedStudent.progress.unanswered} 
                          suffix="题"
                        />
                        <Statistic 
                          title="已标记题" 
                          value={selectedStudent.progress.marked} 
                          suffix="题"
                        />
                      </div>
                    </div>
                  </Tabs.TabPane>
                </Tabs>
              </Card>
            </>
          ) : (
            <Card className="monitor-detail-empty" bordered={false}>
              <Empty 
                description="请从左侧列表选择一名考生查看详细信息"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </Card>
          )}
        </div>

        {/* 右侧警报区域 */}
        <div className="monitor-alerts">
          <Card 
            className="monitor-alerts-card" 
            bordered={false}
            title={
              <div className="monitor-alerts-header">
                <span><WarningOutlined /> 异常警报</span>
                <Button type="text" size="small" icon={<ReloadOutlined />}>刷新</Button>
              </div>
            }
          >
            <div className="monitor-alerts-list">
              {alerts.length > 0 ? (
                alerts.map((alert, index) => (
                  <Alert
                    key={index}
                    message={
                      <div className="monitor-alert-message">
                        <strong>{alert.studentName}</strong>
                        <span className="monitor-alert-time">
                          {formatLastActivity(alert.timestamp)}
                        </span>
                      </div>
                    }
                    description={alert.message}
                    type={getAlertType(alert.severity)}
                    showIcon
                    action={
                      <Button size="small" type="link">
                        查看
                      </Button>
                    }
                    className="monitor-alert-item"
                  />
                ))
              ) : (
                <Empty 
                  description="暂无异常警报" 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </div>
          </Card>

          {/* 快捷操作 */}
          <Card 
            className="monitor-quick-actions" 
            bordered={false}
            title="快捷操作"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                block 
                icon={<BellOutlined />}
                onClick={() => setBatchModalVisible(true)}
              >
                批量发送提醒
              </Button>
              <Button 
                block 
                icon={<DownloadOutlined />}
                onClick={handleExport}
              >
                导出监控记录
              </Button>
              <Button 
                block 
                icon={<SafetyOutlined />}
              >
                查看监控报告
              </Button>
            </Space>
          </Card>
        </div>
      </div>

      {/* 批量操作Modal */}
      <Modal
        title="批量发送提醒"
        visible={batchModalVisible}
        onCancel={() => setBatchModalVisible(false)}
        onOk={handleSendNotification}
        width={500}
      >
        <Form layout="vertical">
          <Form.Item label="接收对象">
            <Select mode="multiple" placeholder="选择学生" defaultValue={["all"]}>
              <Select.Option value="all">全部学生</Select.Option>
              <Select.Option value="online">在线学生</Select.Option>
              <Select.Option value="offline">离线学生</Select.Option>
              <Select.Option value="warning">异常行为学生</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="提醒内容">
            <Input.TextArea 
              rows={4} 
              placeholder="请输入提醒内容..."
              maxLength={200}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default MonitorExam;