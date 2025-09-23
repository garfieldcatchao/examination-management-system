import React from "react";
import Toolbar from "../toolbar";
import { useSelector, useDispatch } from "react-redux";
import { setActiveTab } from "../../../../store/examinationPaperStore";
import "./index.css";

function ExaminationPaper(props: any) {
    const { activeTab, examPaperTabList } = useSelector((state: any) => state.examinationPaper);
    const dispatch = useDispatch();
    
    // 添加调试信息
    console.log("ExaminationPaper component rendered");
    console.log("activeTab:", activeTab);
    console.log("examPaperTabList:", examPaperTabList);
  const editPaper = () => {
    console.log("editPaper");
  };

  const previewPaper = () => {
    console.log("previewPaper");
  };

  const analyzePaper = () => {
    console.log("analyzePaper");
  };

  const deletePaper = () => {
    console.log("deletePaper");
  };
  const continuePaper = () => {
    console.log("continuePaper");
  };
  const publishPaper = () => {
    console.log("publishPaper");
  };

  const viewPaper = () => {
    console.log("viewPaper");
  };
  const approvePaper = () => {
    console.log("approvePaper");
  };
  const commentPaper = () => {
    console.log("commentPaper");
  };
  const renderPaperCard = () => {
    console.log("renderPaperCard function called");
    return (
      <div className="paper-grid" id="paper-grid">
        {/* <!-- 试卷卡片1 --> */}
        <div className="paper-card">
          <div className="paper-header">
            <h3 className="paper-title">计算机网络期末考试</h3>
            <span className="paper-status status-published">已发布</span>
          </div>
          <div className="paper-content">
            <div className="paper-meta">
              <div className="meta-item">
                <i className="fas fa-book"></i>
                <span>计算机网络</span>
              </div>
              <div className="meta-item">
                <i className="fas fa-user"></i>
                <span>张老师</span>
              </div>
              <div className="meta-item">
                <i className="fas fa-clock"></i>
                <span>120分钟</span>
              </div>
              <div className="meta-item">
                <i className="fas fa-star"></i>
                <span>100分</span>
              </div>
              <div className="meta-item">
                <i className="fas fa-calendar"></i>
                <span>2024-03-15</span>
              </div>
              <div className="meta-item">
                <i className="fas fa-users"></i>
                <span>已考156人</span>
              </div>
            </div>
            <div className="paper-stats">
              <div className="stats-row">
                <span className="stats-label">题目数量：</span>
                <span className="stats-value">50题</span>
              </div>
              <div className="stats-row">
                <span className="stats-label">平均得分：</span>
                <span className="stats-value">82.5分</span>
              </div>
              <div className="stats-row">
                <span className="stats-label">及格率：</span>
                <span className="stats-value">85.2%</span>
              </div>
            </div>
            <div className="paper-tags">
              <span className="tag">期末考试</span>
              <span className="tag">综合测试</span>
              <span className="tag">重点考试</span>
            </div>
            <div className="paper-actions">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => editPaper()}
              >
                <i className="fas fa-edit"></i>
                <span>编辑</span>
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => previewPaper()}
              >
                <i className="fas fa-eye"></i>
                <span>预览</span>
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => analyzePaper()}
              >
                <i className="fas fa-chart-line"></i>
                <span>分析</span>
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => deletePaper()}
              >
                <i className="fas fa-trash"></i>
                <span>删除</span>
              </button>
            </div>
          </div>
        </div>

        {/* <!-- 试卷卡片2 --> */}
        <div className="paper-card">
          <div className="paper-header">
            <h3 className="paper-title">数据结构章节测试</h3>
            <span className="paper-status status-draft">草稿</span>
          </div>
          <div className="paper-content">
            <div className="paper-meta">
              <div className="meta-item">
                <i className="fas fa-book"></i>
                <span>数据结构</span>
              </div>
              <div className="meta-item">
                <i className="fas fa-user"></i>
                <span>李老师</span>
              </div>
              <div className="meta-item">
                <i className="fas fa-clock"></i>
                <span>90分钟</span>
              </div>
              <div className="meta-item">
                <i className="fas fa-star"></i>
                <span>80分</span>
              </div>
              <div className="meta-item">
                <i className="fas fa-calendar"></i>
                <span>2024-03-14</span>
              </div>
              <div className="meta-item">
                <i className="fas fa-users"></i>
                <span>待发布</span>
              </div>
            </div>
            <div className="paper-stats">
              <div className="stats-row">
                <span className="stats-label">题目数量：</span>
                <span className="stats-value">35题</span>
              </div>
              <div className="stats-row">
                <span className="stats-label">完成度：</span>
                <span className="stats-value">80%</span>
              </div>
              <div className="stats-row">
                <span className="stats-label">预计时间：</span>
                <span className="stats-value">90分钟</span>
              </div>
            </div>
            <div className="paper-tags">
              <span className="tag">章节测试</span>
              <span className="tag">排序算法</span>
            </div>
            <div className="paper-actions">
              <button
                className="btn btn-primary btn-sm paper-btn"
                onClick={() => continuePaper()}
              >
                <i className="fas fa-play"></i>
                <span>继续编辑</span>
              </button>
              <button
                className="btn btn-secondary btn-sm paper-btn"
                onClick={() => previewPaper()}
              >
                <i className="fas fa-eye"></i>
                <span>预览</span>
              </button>
              <button
                className="btn btn-success btn-sm paper-btn"
                onClick={() => publishPaper()}
              >
                <i className="fas fa-paper-plane"></i>
                <span>发布</span>
              </button>
              <button
                className="btn btn-danger btn-sm paper-btn"
                onClick={() => deletePaper()}
              >
                <i className="fas fa-trash"></i>
                <span>删除</span>
              </button>
            </div>
          </div>
        </div>

        {/* <!-- 试卷卡片3 --> */}
        <div className="paper-card">
          <div className="paper-header">
            <h3 className="paper-title">操作系统模拟考试</h3>
            <span className="paper-status status-reviewing">审核中</span>
          </div>
          <div className="paper-content">
            <div className="paper-meta">
              <div className="meta-item">
                <i className="fas fa-book"></i>
                <span>操作系统</span>
              </div>
              <div className="meta-item">
                <i className="fas fa-user"></i>
                <span>王老师</span>
              </div>
              <div className="meta-item">
                <i className="fas fa-clock"></i>
                <span>150分钟</span>
              </div>
              <div className="meta-item">
                <i className="fas fa-star"></i>
                <span>120分</span>
              </div>
              <div className="meta-item">
                <i className="fas fa-calendar"></i>
                <span>2024-03-13</span>
              </div>
              <div className="meta-item">
                <i className="fas fa-users"></i>
                <span>待审核</span>
              </div>
            </div>
            <div className="paper-stats">
              <div className="stats-row">
                <span className="stats-label">题目数量：</span>
                <span className="stats-value">60题</span>
              </div>
              <div className="stats-row">
                <span className="stats-label">审核进度：</span>
                <span className="stats-value">待审核</span>
              </div>
              <div className="stats-row">
                <span className="stats-label">预计难度：</span>
                <span className="stats-value">中等</span>
              </div>
            </div>
            <div className="paper-tags">
              <span className="tag">模拟考试</span>
              <span className="tag">综合评估</span>
            </div>
            <div className="paper-actions">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => viewPaper()}
              >
                <i className="fas fa-eye"></i>
                <span>查看</span>
              </button>
              <button
                className="btn btn-warning btn-sm"
                onClick={() => approvePaper()}
              >
                <i className="fas fa-check"></i>
                <span>审核</span>
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => commentPaper()}
              >
                <i className="fas fa-comment"></i>
                <span>评论</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPaperList = () => {
    return (
      <div className="paper-list" id="paper-list-view">
        <div className="list-header">
          <div>试卷名称</div>
          <div>学科</div>
          <div>状态</div>
          <div>题目数量</div>
          <div>创建时间</div>
          <div>创建者</div>
          <div>操作</div>
        </div>
        <div className="list-item">
          <div>计算机网络期末考试</div>
          <div>计算机网络</div>
          <div>
            <span className="paper-status status-published">已发布</span>
          </div>
          <div>50题</div>
          <div>2024-03-15</div>
          <div>张老师</div>
          <div>
            <button className="btn btn-secondary btn-sm">编辑</button>
            <button className="btn btn-secondary btn-sm">预览</button>
          </div>
        </div>
      </div>
    );
  };



  
  return (
    <div className="management-container">
      <Toolbar />
      <div id="paper-list" className="tab-content">
        {/* <!-- 试卷卡片网格 --> */}
        {renderPaperCard()}
        {/* <!-- 列表视图（默认隐藏） --> */}
        {renderPaperList()}
      </div>
    </div>
  );
}

export default ExaminationPaper;
