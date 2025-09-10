import React from "react";
import { useSelector, useDispatch } from "react-redux";
import "./index.css";
import { setActiveTab } from "../../../store/examinationStore";

function ExaminationMenu(props: any) {
  const { examinationMenu, activeTab } = useSelector((state: any) => state.examination);
  const dispatch = useDispatch();

  const switchTab = (tab: string): void => {
    dispatch(setActiveTab(tab));
  }

  return (
      <div className="tabs-header">
        {
            examinationMenu.map((item: any) => (
                <div
                    className={`examination-i-tab-item ${activeTab === item.value ? "active" : ""}`}
                    onClick={() => switchTab(item.value)}
                >
                    <i className="fas fa-list"></i>
                    <span>{item.label}</span>
                </div>
            ))
        }
      </div>
  );
}

export default ExaminationMenu;
