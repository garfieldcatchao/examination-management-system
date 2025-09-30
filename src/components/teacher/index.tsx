import React from "react";
import Siderbar from "../siderbar";
import { Outlet } from "react-router";
import Header from "../header";
import { THEME } from "../../constants";
import "./index.css";

const { teacherTheme } = THEME;

function Teacher() {
  return (
    <div className="teacher-container">
      <Header />
      <div className="teacher-container-content">
        <Siderbar theme={teacherTheme}/>
        <Outlet />
      </div>
    </div>
  );
}

export default Teacher;
