import React from "react";
import ExaminationPaper from "./examinationPaper";
import ExaminationHeader from "./examinationHeader";
import ImportManage from "./importManage";
import ExaminationPaperAnalysis from "./examinationPaperAnalysis";
import IntelligentVolumeGroup from "./intelligentVolumeGroup";
import TemplateManagement from "./templateManagement";
import { useDispatch, useSelector } from "react-redux";
import { setActiveTab } from "../../store/examinationPaperStore";
import "./index.css";

function ExaminationPaperManagement() {
  const { activeTab, examPaperTabList } = useSelector(
    (state: any) => state.examinationPaper
  );
  const dispatch = useDispatch();
  
  // 添加调试信息
  console.log("ExaminationPaperManagement - activeTab:", activeTab);
  console.log("ExaminationPaperManagement - examPaperTabList:", examPaperTabList);
  console.log("Should render ExaminationPaper:", activeTab === "paper-list");

  const switchTab = (tab: string) => {
    console.log(tab);
    dispatch(setActiveTab(tab));
  };
  const renderTabContent = () => {
    return (
      <div className="tabs-header">
        {examPaperTabList.map((item: any) => (
          <div
            key={item.value}
            className={`tab-item ${
              item.value === activeTab ? "examination-tab-item-active" : ""
            }`}
            onClick={() => switchTab(item.value)}
          >
            <i className="fas fa-list"></i>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="examination-paper-container">
      <ExaminationHeader />
      {renderTabContent()}
      {activeTab === "paper-list" && <ExaminationPaper />}
      {activeTab === "smart-compose" && <IntelligentVolumeGroup />}
      {activeTab === "import-paper" && <ImportManage />}
      {activeTab === "paper-analysis" && <ExaminationPaperAnalysis />}
      {activeTab === "template-manage" && <TemplateManagement />}
      </div>
    );
  };

export default ExaminationPaperManagement;
