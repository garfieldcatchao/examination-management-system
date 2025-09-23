import React, { useState, useEffect } from "react";
import SimpleChart from "../../../common/SimpleChart";
import {
  StatisticsData,
  StatisticsModalProps,
} from "../../../../interface/testBaseManagement";
import { useSelector } from "react-redux";
import "./StatisticsModal.css";

const data = [
  { item: "事例一", count: 40, percent: 0.4 },
  { item: "事例二", count: 21, percent: 0.21 },
  { item: "事例三", count: 17, percent: 0.17 },
  { item: "事例四", count: 13, percent: 0.13 },
  { item: "事例五", count: 9, percent: 0.09 },
];

const barGraph = [
  { letter: "A", frequency: 0.08167 },
  { letter: "B", frequency: 0.01492 },
  { letter: "C", frequency: 0.02782 },
  { letter: "D", frequency: 0.04253 },
  { letter: "E", frequency: 0.12702 },
  { letter: "F", frequency: 0.02288 },
  { letter: "G", frequency: 0.02015 },
  { letter: "H", frequency: 0.06094 },
  { letter: "I", frequency: 0.06966 },
  { letter: "J", frequency: 0.00153 },
  { letter: "K", frequency: 0.00772 },
  { letter: "L", frequency: 0.04025 },
  { letter: "M", frequency: 0.02406 },
  { letter: "N", frequency: 0.06749 },
  { letter: "O", frequency: 0.07507 },
  { letter: "P", frequency: 0.01929 },
  { letter: "Q", frequency: 0.00095 },
  { letter: "R", frequency: 0.05987 },
  { letter: "S", frequency: 0.06327 },
  { letter: "T", frequency: 0.09056 },
  { letter: "U", frequency: 0.02758 },
  { letter: "V", frequency: 0.00978 },
  { letter: "W", frequency: 0.0236 },
  { letter: "X", frequency: 0.0015 },
  { letter: "Y", frequency: 0.01974 },
  { letter: "Z", frequency: 0.00074 },
];

function StatisticsModal(props: StatisticsModalProps) {
  const { statisticsHeader } = useSelector(
    (state: any) => state.testbaseManagement
  );
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("month");
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<StatisticsData>({
    totalQuestions: 1567,
    questionsByType: {
      single_choice: 856,
      multiple_choice: 324,
      true_false: 189,
      fill_blank: 142,
      essay: 56,
    },
    questionsByDifficulty: {
      easy: 485,
      medium: 732,
      hard: 350,
    },
    questionsBySubject: {
      数学: 456,
      语文: 378,
      英语: 287,
      物理: 234,
      化学: 212,
    },
    usageStats: {
      totalExams: 456,
      totalUsage: 12543,
      averageScore: 84.6,
      passRate: 87.5,
    },
    trendData: [
      { date: "2024-01", newQuestions: 123, usage: 2341 },
      { date: "2024-02", newQuestions: 156, usage: 2567 },
      { date: "2024-03", newQuestions: 189, usage: 2890 },
    ],
    topQuestions: [
      {
        id: "1",
        content: "TCP协议和UDP协议的主要区别是什么？",
        usageCount: 234,
        correctRate: 78.5,
      },
      {
        id: "2",
        content: "数据结构中栈和队列的特点",
        usageCount: 198,
        correctRate: 82.3,
      },
      {
        id: "3",
        content: "面向对象编程的三大特性",
        usageCount: 187,
        correctRate: 76.8,
      },
    ],
  });

  useEffect(() => {
    // 模拟数据加载
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [timeRange]);

  const getTypePercentage = (count: number) => {
    return ((count / statsData.totalQuestions) * 100).toFixed(1);
  };

  const getDifficultyPercentage = (count: number) => {
    return ((count / statsData.totalQuestions) * 100).toFixed(1);
  };

  const renderOverviewTab = () => (
    <div className="statistics-overview">
      {/* 核心指标卡片 */}
      <div className="stats-cards">
        <div className="stats-card primary">
          <div className="stats-icon">📚</div>
          <div className="stats-content">
            <div className="stats-value">
              {statsData.totalQuestions.toLocaleString()}
            </div>
            <div className="stats-label">题目总数</div>
            <div className="stats-change">+124 本月新增</div>
          </div>
        </div>
        <div className="stats-card success">
          <div className="stats-icon">📊</div>
          <div className="stats-content">
            <div className="stats-value">
              {statsData.usageStats.totalUsage.toLocaleString()}
            </div>
            <div className="stats-label">总使用次数</div>
            <div className="stats-change">+15.2% 环比上月</div>
          </div>
        </div>
        <div className="stats-card warning">
          <div className="stats-icon">🎯</div>
          <div className="stats-content">
            <div className="stats-value">
              {statsData.usageStats.averageScore}%
            </div>
            <div className="stats-label">平均正确率</div>
            <div className="stats-change">+2.3% 环比上月</div>
          </div>
        </div>
        <div className="stats-card info">
          <div className="stats-icon">✅</div>
          <div className="stats-content">
            <div className="stats-value">{statsData.usageStats.passRate}%</div>
            <div className="stats-label">题目通过率</div>
            <div className="stats-change">+1.8% 环比上月</div>
          </div>
        </div>
      </div>

      {/* 题型分布和难度分布 */}
      <div className="distribution-charts">
        <div className="chart-container">
          <h3 className="chart-title">📊 题型分布</h3>
          <div className="pie-chart-data">
            <div className="chart-item">
              <div className="chart-legend single-choice"></div>
              <span>
                单选题: {statsData.questionsByType.single_choice} (
                {getTypePercentage(statsData.questionsByType.single_choice)}%)
              </span>
            </div>
            <div className="chart-item">
              <div className="chart-legend multiple-choice"></div>
              <span>
                多选题: {statsData.questionsByType.multiple_choice} (
                {getTypePercentage(statsData.questionsByType.multiple_choice)}%)
              </span>
            </div>
            <div className="chart-item">
              <div className="chart-legend true-false"></div>
              <span>
                判断题: {statsData.questionsByType.true_false} (
                {getTypePercentage(statsData.questionsByType.true_false)}%)
              </span>
            </div>
            <div className="chart-item">
              <div className="chart-legend fill-blank"></div>
              <span>
                填空题: {statsData.questionsByType.fill_blank} (
                {getTypePercentage(statsData.questionsByType.fill_blank)}%)
              </span>
            </div>
            <div className="chart-item">
              <div className="chart-legend essay"></div>
              <span>
                简答题: {statsData.questionsByType.essay} (
                {getTypePercentage(statsData.questionsByType.essay)}%)
              </span>
            </div>
          </div>
        </div>

        <div className="chart-container">
          <h3 className="chart-title">📈 难度分布</h3>
          <div className="bar-chart">
            <div className="bar-item">
              <div className="bar-label">简单</div>
              <div className="bar-wrapper">
                <div
                  className="bar easy"
                  style={{
                    width: `${getDifficultyPercentage(
                      statsData.questionsByDifficulty.easy
                    )}%`,
                  }}
                ></div>
              </div>
              <div className="bar-value">
                {statsData.questionsByDifficulty.easy}
              </div>
            </div>
            <div className="bar-item">
              <div className="bar-label">中等</div>
              <div className="bar-wrapper">
                <div
                  className="bar medium"
                  style={{
                    width: `${getDifficultyPercentage(
                      statsData.questionsByDifficulty.medium
                    )}%`,
                  }}
                ></div>
              </div>
              <div className="bar-value">
                {statsData.questionsByDifficulty.medium}
              </div>
            </div>
            <div className="bar-item">
              <div className="bar-label">困难</div>
              <div className="bar-wrapper">
                <div
                  className="bar hard"
                  style={{
                    width: `${getDifficultyPercentage(
                      statsData.questionsByDifficulty.hard
                    )}%`,
                  }}
                ></div>
              </div>
              <div className="bar-value">
                {statsData.questionsByDifficulty.hard}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // const renderSubjectTab = () => (
  //   <div className="statistics-subject">
  //     <h3 className="section-title">📚 学科分布统计</h3>
  //     <div className="subject-stats">
  //       {Object.entries(statsData.questionsBySubject).map(
  //         ([subject, count]) => (
  //           <div key={subject} className="subject-item">
  //             <div className="subject-header">
  //               <span className="subject-name">{subject}</span>
  //               <span className="subject-count">{count} 题</span>
  //             </div>
  //             <div className="subject-bar">
  //               <div
  //                 className="subject-progress"
  //                 style={{
  //                   width: `${
  //                     (count /
  //                       Math.max(
  //                         ...Object.values(statsData.questionsBySubject)
  //                       )) *
  //                     100
  //                   }%`,
  //                 }}
  //               ></div>
  //             </div>
  //             <div className="subject-percentage">
  //               {((count / statsData.totalQuestions) * 100).toFixed(1)}%
  //             </div>
  //           </div>
  //         )
  //       )}
  //     </div>
  //   </div>
  // );

  const renderUsageTab = () => (
    <div className="statistics-usage">
      <div className="usage-summary">
        <div className="usage-card">
          <h4>📋 考试使用</h4>
          <div className="usage-value">
            {statsData.usageStats.totalExams} 场
          </div>
          <div className="usage-desc">累计考试场次</div>
        </div>
        <div className="usage-card">
          <h4>📊 使用频次</h4>
          <div className="usage-value">
            {statsData.usageStats.totalUsage.toLocaleString()} 次
          </div>
          <div className="usage-desc">题目使用总次数</div>
        </div>
        <div className="usage-card">
          <h4>📈 正确率</h4>
          <div className="usage-value">
            {statsData.usageStats.averageScore}%
          </div>
          <div className="usage-desc">平均答题正确率</div>
        </div>
      </div>

      <div className="top-questions">
        <h3 className="section-title">🔥 热门题目 TOP 10</h3>
        <div className="questions-list">
          {statsData.topQuestions.map((question: any, index: number) => (
            <div key={question.id} className="question-item">
              <div className="question-rank">#{index + 1}</div>
              <div className="question-content">
                <div className="question-text">{question.content}</div>
                <div className="question-stats">
                  <span className="usage-count">
                    使用 {question.usageCount} 次
                  </span>
                  <span className="correct-rate">
                    正确率 {question.correctRate}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTrendTab = () => (
    <div className="statistics-trend">
      <h3 className="section-title">📈 趋势分析</h3>
      <div className="trend-chart">
        <div className="trend-header">
          <h4>题目新增趋势</h4>
          <div className="time-range-selector">
            {["week", "month", "quarter", "year"].map((range) => (
              <button
                key={range}
                className={`time-btn ${timeRange === range ? "active" : ""}`}
                onClick={() => setTimeRange(range)}
              >
                {range === "week"
                  ? "近一周"
                  : range === "month"
                  ? "近一月"
                  : range === "quarter"
                  ? "近三月"
                  : "近一年"}
              </button>
            ))}
          </div>
        </div>
        <div className="trend-data">
          {statsData.trendData.map((item: any, index: number) => (
            <div key={index} className="trend-item">
              <div className="trend-date">{item.date}</div>
              <div className="trend-bars">
                <div className="trend-bar-wrapper">
                  <div
                    className="trend-bar new-questions"
                    style={{ height: `${(item.newQuestions / 200) * 100}%` }}
                  ></div>
                  <span className="trend-value">{item.newQuestions}</span>
                </div>
                <div className="trend-bar-wrapper">
                  <div
                    className="trend-bar usage"
                    style={{ height: `${(item.usage / 3000) * 100}%` }}
                  ></div>
                  <span className="trend-value">{item.usage}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="trend-legend">
          <div className="legend-item">
            <div className="legend-color new-questions"></div>
            <span>新增题目</span>
          </div>
          <div className="legend-item">
            <div className="legend-color usage"></div>
            <span>使用次数</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOverVeiw = () => {
    return (
      <div className="overview-section">
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-header">
              <span className="stat-title">题目总数</span>
              <div className="stat-icon primary">
                <span className="iconfont icon-fenlei-copy"></span>
              </div>
            </div>
            <div className="stat-value">12,847</div>
            <div className="stat-trend trend-up">
              <span className="iconfont icon-shangjiantou-copy"></span>
              <span>较上月增长 12.5%</span>
            </div>
          </div>
          <div className="stat-card success">
            <div className="stat-header">
              <span className="stat-title">活跃题目</span>
              <div className="stat-icon success">
                <span className="iconfont icon-duigou1-copy"></span>
              </div>
            </div>
            <div className="stat-value">8,924</div>
            <div className="stat-trend trend-up">
              <span className="iconfont icon-shangjiantou-copy"></span>
              <span>使用率 69.5%</span>
            </div>
          </div>
          <div className="stat-card warning">
            <div className="stat-header">
              <span className="stat-title">平均正确率</span>
              <div className="stat-icon warning">
                <span className="iconfont icon-tongjitu-copy"></span>
              </div>
            </div>
            <div className="stat-value">76.8%</div>
            <div className="stat-trend trend-down">
              <span className="iconfont icon-xiajiantou-copy"></span>
              <span>较上月下降 2.1%</span>
            </div>
          </div>
          <div className="stat-card danger">
            <div className="stat-header">
              <span className="stat-title">待完善题目</span>
              <div className="stat-icon danger">
                <span className="iconfont icon-gantanhao_icon-copy"></span>
              </div>
            </div>
            <div className="stat-value">342</div>
            <div className="stat-trend trend-neutral">
              {/* <span className="iconfont icon-xiajiantou-copy"></span> */}
              <span>需要补充答案或解析</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="statistics-modal">
        <div className="modal-overlay" onClick={props.onClose}>
          <div
            className="modal-content large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <div className="loading-text">正在加载统计数据...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderChart = () => {
    return (
      <div style={{ display: "flex", gap: "16px", marginTop: "20px" }}>
        <SimpleChart
          type="pie"
          data={data}
          loading={loading}
          width="50%"
          height="400px"
          xField="item"
          yField="percent"
          colorField="item"
          showPercent={true}
          showLegend={true}
          onChartReady={(chart: any) => console.log("饼图已准备就绪:", chart)}
        />

        <SimpleChart
          type="bar"
          data={barGraph}
          loading={loading}
          width="50%"
          height="400px"
          xField="letter"
          yField="frequency"
          colorField="letter"
          showTooltip={true}
          onChartReady={(chart: any) => console.log("柱状图已准备就绪:", chart)}
        />
      </div>
    );
  };

  const viewDetails = (arg0: string): void => {
    throw new Error("Function not implemented.");
  };

  const editCategory = (arg0: string): void => {
    throw new Error("Function not implemented.");
  };
  const renderStatisticsDetail = () => {
    return (
      <div className="data-section">
        <div className="data-header">
          <div className="data-title">
            <i className="fas fa-table"></i>
            详细统计数据
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>学科</th>
              <th>题目类型</th>
              <th>题目数量</th>
              <th>使用次数</th>
              <th>平均正确率</th>
              <th>质量评分</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>数学</td>
              <td>单选题</td>
              <td>2,456</td>
              <td>12,456</td>
              <td>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: "82%" }}
                    ></div>
                    <span
                      className="progress-full"
                      style={{ width: "82%" }}
                    ></span>
                  </div>
                  <span>82%</span>
                </div>
              </td>
              <td>4.2</td>
              <td>
                <span className="status-badge active">正常</span>
              </td>
              <td>
                <button
                  className="chart-btn"
                  onClick={() => viewDetails("数学-单选题")}
                  title="查看详情"
                >
                  <i className="fas fa-eye"></i>
                </button>
                <button
                  className="chart-btn"
                  onClick={() => editCategory("数学-单选题")}
                  title="编辑"
                >
                  <i className="fas fa-edit"></i>
                </button>
              </td>
            </tr>
            <tr>
              <td>语文</td>
              <td>多选题</td>
              <td>1,847</td>
              <td>9,234</td>
              <td>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: "68%;" }}
                    ></div>
                  </div>
                  <span>68%</span>
                </div>
              </td>
              <td>3.8</td>
              <td>
                <span className="status-badge active">正常</span>
              </td>
              <td>
                <button
                  className="chart-btn"
                  onClick={() => viewDetails("语文-多选题")}
                  title="查看详情"
                >
                  <i className="fas fa-eye"></i>
                </button>
                <button
                  className="chart-btn"
                  onClick={() => editCategory("语文-多选题")}
                  title="编辑"
                >
                  <i className="fas fa-edit"></i>
                </button>
              </td>
            </tr>
            <tr>
              <td>英语</td>
              <td>填空题</td>
              <td>1,623</td>
              <td>7,891</td>
              <td>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: "75%;" }}
                    ></div>
                  </div>
                  <span>75%</span>
                </div>
              </td>
              <td>4.1</td>
              <td>
                <span className="status-badge pending">待审核</span>
              </td>
              <td>
                <button
                  className="chart-btn"
                  onClick={() => viewDetails("英语-填空题")}
                  title="查看详情"
                >
                  <i className="fas fa-eye"></i>
                </button>
                <button
                  className="chart-btn"
                  onClick={() => editCategory("英语-填空题")}
                  title="编辑"
                >
                  <i className="fas fa-edit"></i>
                </button>
              </td>
            </tr>
            <tr>
              <td>物理</td>
              <td>判断题</td>
              <td>1,234</td>
              <td>5,432</td>
              <td>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: "91%;" }}
                    ></div>
                  </div>
                  <span>91%</span>
                </div>
              </td>
              <td>4.6</td>
              <td>
                <span className="status-badge active">正常</span>
              </td>
              <td>
                <button
                  className="chart-btn"
                  onClick={() => viewDetails("物理-判断题")}
                  title="查看详情"
                >
                  <i className="fas fa-eye"></i>
                </button>
                <button
                  className="chart-btn"
                  onClick={() => editCategory("物理-判断题")}
                  title="编辑"
                >
                  <i className="fas fa-edit"></i>
                </button>
              </td>
            </tr>
            <tr>
              <td>化学</td>
              <td>简答题</td>
              <td>987</td>
              <td>3,156</td>
              <td>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: "54%;" }}
                    ></div>
                  </div>
                  <span>54%</span>
                </div>
              </td>
              <td>3.2</td>
              <td>
                <span className="status-badge inactive">需优化</span>
              </td>
              <td>
                <button
                  className="chart-btn"
                  onClick={() => viewDetails("化学-简答题")}
                  title="查看详情"
                >
                  <i className="fas fa-eye"></i>
                </button>
                <button
                  className="chart-btn"
                  onClick={() => editCategory("化学-简答题")}
                  title="编辑"
                >
                  <i className="fas fa-edit"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="statistics-container">
      <div className="statistics-header">
        <div className="statistics-header-left">
          {statisticsHeader.map((item: any) => (
            <span
              className={`statustics-item ${
                activeTab === item.value ? "active" : ""
              }`}
              key={item.value}
              onClick={() => setActiveTab(item.value)}
            >
              {item.label}
            </span>
          ))}
        </div>
        <div className="statistics-header-right">
          <span className="statustics-all-screen">全屏模式</span>
        </div>
      </div>
      {renderOverVeiw()}
      {renderChart()}
      {renderStatisticsDetail()}
    </div>
  );
}

export default StatisticsModal;
