import React from "react";
import "./index.css";

function ExaminationPaperAnalysis() {
  return (
    <div id="paper-analysis" className="tab-content" style={{ marginTop: "24px" }}>
      <div className="analysis-cards">
        <div className="analysis-card">
          <div className="analysis-value">156</div>
          <div className="analysis-label">总试卷数</div>
          <div className="analysis-trend trend-up">
            <i className="fas fa-arrow-up"></i> +12%
          </div>
        </div>
        <div className="analysis-card">
          <div className="analysis-value">89</div>
          <div className="analysis-label">已发布试卷</div>
          <div className="analysis-trend trend-up">
            <i className="fas fa-arrow-up"></i> +8%
          </div>
        </div>
        <div className="analysis-card">
          <div className="analysis-value">82.5</div>
          <div className="analysis-label">平均得分</div>
          <div className="analysis-trend trend-down">
            <i className="fas fa-arrow-down"></i> -2.1%
          </div>
        </div>
        <div className="analysis-card">
          <div className="analysis-value">85.2%</div>
          <div className="analysis-label">平均及格率</div>
          <div className="analysis-trend trend-up">
            <i className="fas fa-arrow-up"></i> +5.3%
          </div>
        </div>
      </div>

      {/* // 这里可以添加更多的分析图表 */}
      <div className="smart-form">
        <div className="section-title">
          <i className="fas fa-chart-bar"></i>
          详细分析报告
        </div>
        <p style={{ color: "#8c8c8c", padding: "40px", textAlign: "center" }}>
          <i
            className="fas fa-chart-line"
            style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.5 }}
          ></i>
          <br />
          选择具体试卷查看详细的分析报告
        </p>
      </div>
    </div>
  );
}

export default ExaminationPaperAnalysis;
