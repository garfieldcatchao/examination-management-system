import React from "react";
import "./index.css";

function TemplateManagement() {
  const createTemplate = () => {
    console.log("createTemplate");
  };
  const importTemplate = () => {
    console.log("importTemplate");
  };
  const exportTemplates = () => {
    console.log("exportTemplates");
  };
  const useTemplate = () => {
    console.log("useTemplate");
  };
  const editTemplate = () => {
    console.log("editTemplate");
  };
  const copyTemplate = () => {
    console.log("copyTemplate");
  };
  
  return (
    <div className="tab-content template-management-tab-content" >
      <div className="toolbar">
        <div className="toolbar-left">
          <button className="btn btn-primary" onClick={createTemplate}>
            <span className="iconfont icon-tianjia"></span>
            <span>新建模板</span>
          </button>
          <button className="btn btn-secondary" onClick={importTemplate}>
            <span className="iconfont icon-daoru"></span>
            <span>导入模板</span>
          </button>
        </div>
        <div className="toolbar-right">
          <button className="btn btn-secondary" onClick={exportTemplates}>
            <span className="iconfont icon-daochu"></span>
            <span>导出模板</span>
          </button>
        </div>
      </div>

      <div className="template-grid">
        <div className="template-card">
          <div className="template-header">
            <div className="template-name">期末考试模板</div>
            <div className="template-type">综合</div>
          </div>
          <div className="template-description">
            适用于期末综合性考试，包含各种题型，难度分布合理，时长2小时。
          </div>
          <div className="template-stats">
            <span>使用 15 次</span>
            <span>更新时间: 2024-03-10</span>
          </div>
          <div className="template-actions">
            <button className="btn btn-primary btn-sm" onClick={useTemplate}>
              <span className="iconfont icon-kaishi1"></span>
              使用
            </button>
            <button className="btn btn-secondary btn-sm" onClick={editTemplate}>
              <span className="iconfont icon-bianji"></span>
              编辑
            </button>
            <button className="btn btn-secondary btn-sm" onClick={copyTemplate}>
              <span className="iconfont icon-fuzhi"></span>
              复制
            </button>
          </div>
        </div>

        <div className="template-card">
          <div className="template-header">
            <div className="template-name">章节测试模板</div>
            <div className="template-type">章节</div>
          </div>
          <div className="template-description">
            专门用于单个章节的测试，题目数量适中，主要检验章节知识点掌握情况。
          </div>
          <div className="template-stats">
            <span>使用 28 次</span>
            <span>更新时间: 2024-03-08</span>
          </div>
          <div className="template-actions">
            <button className="btn btn-primary btn-sm" onClick={useTemplate}>
              <span className="iconfont icon-kaishi1"></span>
              使用
            </button>
            <button className="btn btn-secondary btn-sm" onClick={editTemplate}>
              <span className="iconfont icon-bianji"></span>
              编辑
            </button>
            <button className="btn btn-secondary btn-sm" onClick={copyTemplate}>
              <span className="iconfont icon-fuzhi"></span>
              复制
            </button>
          </div>
        </div>

        <div className="template-card">
          <div className="template-header">
            <div className="template-name">快速测验模板</div>
            <div className="template-type">测验</div>
          </div>
          <div className="template-description">
            适用于课堂快速测验，题目少而精，主要是选择题和判断题，用时30分钟。
          </div>
          <div className="template-stats">
            <span>使用 42 次</span>
            <span>更新时间: 2024-03-05</span>
          </div>
          <div className="template-actions">
            <button className="btn btn-primary btn-sm" onClick={useTemplate}>
              <span className="iconfont icon-kaishi1"></span>
              使用
            </button>
            <button className="btn btn-secondary btn-sm" onClick={editTemplate}>
              <span className="iconfont icon-bianji"></span>
              编辑
            </button>
            <button className="btn btn-secondary btn-sm" onClick={copyTemplate}>
              <span className="iconfont icon-fuzhi"></span>
              复制
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TemplateManagement;
