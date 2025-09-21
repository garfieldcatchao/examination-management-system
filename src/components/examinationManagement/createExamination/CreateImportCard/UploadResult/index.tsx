import React from "react";

import "./index.css";

export default function UploadResult(props: any) {

  const { importData } = props || {};
  
  return (
    <div className="upload-result-container">
      <span
        className="success-iconfont icon-chenggong"
        style={{ fontSize: "64px", color: "#52c41a", marginBottom: "24px" }}
      ></span>
      <h3 className="import-success-title">导入完成！</h3>
      <p className="import-success-label">成功导入 {importData?.validCount} 名学生到考试名单</p>

      <div className="result-success-container">
        <div className="result-import">
          <span className="import-success">成功导入：</span>
          <span className="import-success-value">{importData?.validCount} 人</span>
        </div>

        <div className="result-tongji">
          <div className="result-tongji-item ">
            <span style={{ fontWeight: "600" }}>总计：</span>
            <span style={{ fontWeight: "600", color: "#1890ff" }}>{importData?.totalCount} 人</span>
          </div>
        </div>
      </div>
    </div>
  );
}
