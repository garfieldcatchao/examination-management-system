import React from "react";
import "./index.css";

function Header() {
  return (
    <div className="header-container">
      <div className="system-info">
        <span className="system-title">智能考试管理系统</span>
        <span className="system-version">v1.0</span>
        <span className="nav-path">首页 &gt; 教师后台 &gt; 考试管理</span>
      </div>
      <div className="user-actions">
        <span className="iconfont icon-tongzhi"></span>
        <span className="iconfont icon-zhanghutouxiang"></span>
        <span className="iconfont icon-yunyingpeizhi"></span>
      </div>
    </div>
  );
}

export default Header;
