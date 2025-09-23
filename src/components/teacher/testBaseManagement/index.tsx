import React, { useState } from "react";
import ImportModal from "./modals/ImportModal";
import StatisticsModal from "./modals/StatisticsModal";
import SearchModal from "./modals/SearchModal";
import BatchModal from "./modals/BatchModal";
import SearchResultModal from "./modals/TestBaseResultModal";
import { useSelector } from "react-redux";
import "./index.css";

function TestBaseManagement() {
  const { menuList } = useSelector((state: any) => state.testbaseManagement);
  const [activeModal, setActiveModal] = useState<string | null>("testBaseResult");

  return (
    <div className="main-content">
      <div className="page-header">
        <div className="page-title">
          <span>题库管理</span>
        </div>
        <button className="add-btn">+ 新增</button>
      </div>

      <div className="action-bar">
        {
          menuList.map((item: any) => (
            <button
              className={`btn btn-secondary ${activeModal === item.value ? "baseModalActive" : ""}`}
              onClick={() => setActiveModal(item.value)}
            >
              {item.label}
            </button>
          ))
        }
        {/* <button
          className="btn btn-secondary"
          onClick={() => setActiveModal("import")}
        >
          <span className="iconfont icon-icon-byxxtb"></span>
          批量导入
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => setActiveModal("statistics")}
        >
          <span className="iconfont icon-tongji"></span>
          题库统计
        </button> */}
        {/* <button
          className="btn btn-secondary"
          onClick={() => setActiveModal("search")}
        >
          <span className="iconfont icon-shandian"></span>
          高级搜索
        </button> */}
        {/* <button
          className="btn btn-secondary"
          onClick={() => setActiveModal("batch")}
        >
          <span className="iconfont icon-auto_awesome"></span>
          批量操作
        </button> */}
      </div>

      {activeModal === "import" && (
        <ImportModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === "statistics" && (
        <StatisticsModal onClose={() => setActiveModal(null)} />
      )}
      {/* {activeModal === "search" && (
        <SearchModal onClose={() => setActiveModal(null)} />
      )} */}
      {activeModal === "batch" && (
        <BatchModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === "testBaseResult" && (
        <SearchResultModal onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
}

export default TestBaseManagement;
