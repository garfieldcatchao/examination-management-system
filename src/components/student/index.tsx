import React from "react";
import Header from "../header";
import Siderbar from "../siderbar";
import { Outlet } from "react-router";
import "./index.css";

function Student() {
  return (
    <div className="teacher-container">
      <Header />
      <div className="teacher-container-content">
        <Siderbar />
        <Outlet />
      </div>
    </div>
  );
}

export default Student;
