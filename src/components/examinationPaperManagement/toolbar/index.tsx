import React from "react";
import "./index.css";

function Toolbar() {
  const showCreatePaper = () => {
    console.log("showCreatePaper");
  }
  const showBatchImport = () => {
    console.log("showBatchImport");
  }
  const exportPapers = () => {
    console.log("exportPapers");
  }
  const switchView = (view: string) => {
    console.log(view);
  }
  const refreshPapers = () => {
    console.log("refreshPapers");
  }
  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <button className="btn btn-primary" onClick={() => showCreatePaper()}>
            <i className="fas fa-plus"></i>
          <span>新建试卷</span>
        </button>
        <button className="btn btn-secondary" onClick={() => showBatchImport()}>
          <i className="fas fa-upload"></i>
          <span>批量导入</span>
        </button>
        <button className="btn btn-secondary" onClick={() => exportPapers()}>
          <i className="fas fa-download"></i>
          <span>导出试卷</span>
        </button>
      </div>
      <div className="toolbar-right">
        <div className="view-switcher">
          <button className="view-btn active" onClick={() => switchView('grid')}>
            <i className="fas fa-th"></i>
            <span>卡片</span>
          </button>
          <button className="view-btn" onClick={() => switchView('list')}>
            <i className="fas fa-list"></i>
            <span>列表</span>
          </button>
        </div>
        <button className="btn btn-secondary" onClick={() => refreshPapers()}>
          <i className="fas fa-sync-alt"></i>
        </button>
      </div>
    </div>
  );
}

export default Toolbar;
