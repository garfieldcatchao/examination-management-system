import React from "react";
import "./index.css";

function ExaminationHeader() {
  const showCreatePaper = () => {
    console.log("showCreatePaper");
  };
  return (
    <div className="page-header">
      <div className="page-title">
        <div className="title-left">
          <i className="fas fa-file-alt"></i>
          <h1>试卷管理</h1>
        </div>
      </div>
      <div className="title-right">
        <button
          className="btn btn-success btn-large"
          onClick={() => showCreatePaper()}
        >
          <i className="fas fa-plus"></i>
          <span>新建试卷</span>
        </button>
      </div>
    </div>
  );
}

export default ExaminationHeader;
