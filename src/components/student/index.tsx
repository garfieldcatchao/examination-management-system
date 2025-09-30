import React from "react";
import Header from "../header";
import Siderbar from "../siderbar";
import { Outlet } from "react-router";
import { THEME } from "../../constants";
import "./index.css";

const { studentTheme } = THEME;

function Student() {
  return (
    <div className="teacher-container">
      <Header theme={studentTheme} />
      <div className="teacher-container-content">
        <Siderbar theme={studentTheme} menuStyle={{ color: "#666" }} />
        <Outlet />
      </div>
    </div>
  );
}

export default Student;
