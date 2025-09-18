import React, { useState } from "react";

import Dragger from "antd/es/upload/Dragger";
import { message, UploadProps } from "antd";
import { InboxOutlined } from "@ant-design/icons";

import styles from "./index.module.css";

const draggerProps: UploadProps = {
  name: "file",
  multiple: true,
  onChange(info) {
    const { status } = info.file;
    if (status !== "uploading") {
      console.log(info.file, info.fileList);
    }
    if (status === "done") {
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  },
  onDrop(e) {
    console.log("Dropped files", e.dataTransfer.files);
  },
  style: {
    height: "200px",
  },
};

export default function UploadFile(props: any) {
  const [active, setActive] = useState<string>("setp1");

  return (
    <div style={{ textAlign: "center", marginTop: "30px" }}>
      <h3 style={{ margin: "0 0 8px 0", color: "#262626" }}>步骤1: 上传文件</h3>
      <p style={{ margin: "0 0 32px 0", color: "#8c8c8c" }}>
        选择Excel或CSV文件进行批量导入
      </p>

      <Dragger
        {...draggerProps}
        style={{
          width: "800px",
          height: "300px",
          margin: "0 auto",
        }}
      >
        <p className={styles["ant-upload-drag-icon"]}>
          <InboxOutlined
            style={{ width: "32px", height: "32px", fontSize: "30px" }}
          />
        </p>
        <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
        <p className="ant-upload-hint">
          支持.xlsx,.xls,.csv格式，文件大小不超过10MB
        </p>
      </Dragger>

      <div
        style={{
          display: "flex",
          gap: "16px",
          justifyContent: "center",
          marginBottom: "32px",
          marginTop: "20px",
        }}
      >
        <button
          className="btn btn-secondary btn-large"
          onClick={() => {
            //   downloadTemplate();
          }}
        >
          <i className="fas fa-download"></i>
          下载模板文件
        </button>
        <button
          className="btn btn-secondary btn-large"
          onClick={() => {
            //   showImportHistory();
          }}
        >
          <i className="fas fa-history"></i>
          导入历史
        </button>
      </div>

      <div className={`${styles["d-l"]} ${styles["d-l-c"]}`}>
        <div className={styles["tips-conatiner"]}>
          <div className={styles["tips-header"]}>
            <span
              className={`${styles["iconfont-tips"]} ${styles["icon-shuoming-mian-copy"]}`}
            ></span>
            <span className={styles["tips-title"]}>导入格式说明</span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              fontSize: "14px",
              color: "#595959",
            }}
          >
            <div>
              <strong>必填字段：</strong>
              <ul style={{ margin: "8px 0 0 0", paddingLeft: "16px" }}>
                <li>学号 (唯一标识)</li>
                <li>姓名 (不能为空)</li>
                <li>班级 (所属班级)</li>
              </ul>
            </div>
            <div>
              <strong>可选字段：</strong>
              <ul style={{ margin: "8px 0 0 0", paddingLeft: "16px" }}>
                <li>手机号 (11位数字)</li>
                <li>邮箱 (标准格式)</li>
                <li>备注信息</li>
              </ul>
            </div>
          </div>

          <div className={styles["tips-line"]}></div>
          <div className={styles["d-l"]}>
            <span
              className={`${styles["iconfont-tips"]} ${styles["icon-zhuyi"]}`}
            ></span>
            <span style={{ marginLeft: "5px" }}>
              注意：学号不能重复，系统会自动检查数据格式并标记错误项
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
