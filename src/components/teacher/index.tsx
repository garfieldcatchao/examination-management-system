import React from "react";
import Siderbar from "../siderbar";
import { Outlet } from "react-router";
import Header from "../header";
import "./index.css";

function Teacher() {
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

export default Teacher;
