import React from "react";
import "./index.css";

function Header(props: any) {
  const { style, theme = {} } = props || {};

  const {
    versionStyle = {},
    logoStyle = {},
    navPathStyle = {},
    containerStyle = {}
  } = theme || {}
  return (
    <div className="header-container" style={containerStyle}>
      <div className="system-info">
        <span className="system-title" style={logoStyle}>智能考试管理系统</span>
        <span className="system-version" style={versionStyle}>v1.0</span>
        <span className="nav-path" style={navPathStyle}>首页 &gt; 教师后台 &gt; 考试管理</span>
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
