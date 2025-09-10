import React, { useState } from "react";
import ExaminationMenu from "./examinationMenu";
import ExaminationList from "./examinationList";
import CreateExamination from "./createExamination";
import "./index.css";
import { useSelector } from "react-redux";

function ExaminationManagement(props: any) {
  const { activeTab } = useSelector((state: any) => state.examination);

  const renderExaminationHeader = () => {
    return (
      <div className="examination-i-page-header">
        <div className="examination-i-page-title">
          <div className="examination-i-title-left">
            <i className="fas fa-clipboard-check"></i>
            <h1>考试管理</h1>
          </div>
          <div className="examination-i-title-right">
            <button
              className="btn btn-success btn-large"
              onClick={() => {
                console.log("createExam");
              }}
            >
              <i className="fas fa-plus"></i>
              <span>创建考试</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // const

  return (
    <div className="examination-management-container">
      {renderExaminationHeader()}
      <div className="examination-tabs-container">
        <ExaminationMenu />
        {activeTab === "examination-list" && <ExaminationList />}
        {activeTab === "create-exam" && <CreateExamination />}
      </div>
    </div>
  );
}

export default ExaminationManagement;
