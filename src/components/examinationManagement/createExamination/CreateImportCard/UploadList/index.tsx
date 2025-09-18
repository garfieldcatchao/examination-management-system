import React from "react";

import "./index.css";
// import { DataType } from "../../../../../interface/examinationsFace";
import { Table, TableColumnsType } from "antd";

interface DataType {
  key: React.Key;
  status?: string;
  studentId?: number;
  username?: string;
  department?: string;
  phone?: string;
  email?: string;
  errorInfo?: string;
}

const columns: TableColumnsType<DataType> = [
  {
    title: "状态",
    dataIndex: "status",
    render: (text: string) => {
      console.log("text -----> ", text);
      return text;
    },
  },
  {
    title: "学号",
    dataIndex: "studentId",
  },
  {
    title: "姓名",
    dataIndex: "username",
  },
  {
    title: "班级",
    dataIndex: "department",
  },
  {
    title: "手机号",
    dataIndex: "phone",
  },
  {
    title: "邮箱",
    dataIndex: "email",
  },
  {
    title: "错误信息",
    dataIndex: "errorInfo",
  },
];

const data: DataType[] = [
  {
    key: "1",
    studentId: 32,
    username: "New York No. 1 Lake Park",
    email: "xxxx@163.com",
    department: "计算机1班",
  },
  {
    key: "2",
    studentId: 42,
    username: "London No. 1 Lake Park",
    department: "计算机1班",
    email: "xxxx@163.com",
  },
  {
    key: "3",
    studentId: 32,
    username: "Sydney No. 1 Lake Park",
    department: "计算机1班",
    email: "xxxx@163.com",
  },
  {
    key: "4",
    studentId: 99,
    username: "Sydney No. 1 Lake Park",
    department: "计算机1班",
    email: "xxxx@163.com",
  },
];

export default function UploadList(props: any) {
  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <h3 style={{ margin: "0 0 8px 0; color: #262626;" }}>
          步骤2: 数据预览
        </h3>
        <p style={{ margin: "0; color: #8c8c8c;" }}>
          检查导入数据，确认无误后继续
        </p>

        <div className="result-container m-t-20">
          <div className="result-item">
            <div className="result-item-total-value">6</div>
            <div style={{ fontSize: "12px", color: "#8c8c8c" }}>总记录数</div>
          </div>
          <div className="result-item">
            <div className="result-item-value result-item-success-value">4</div>
            <div style={{ fontSize: "12px", color: "#8c8c8c" }}>验证成功</div>
          </div>
          <div className="result-item">
            <div className="result-item-wraning-value">1</div>
            <div style={{ fontSize: "12px", color: "#8c8c8c" }}>警告</div>
          </div>
          <div className="result-item">
            <div className="result-item-error-value">1</div>
            <div style={{ fontSize: "12px", color: "#8c8c8c" }}>错误</div>
          </div>
        </div>
      </div>

      <div className="result-error-info">
        <div className="result-error-info-content">
          <i
            className="fas fa-exclamation-circle"
            style={{ marginRight: "8px" }}
          ></i>
          <strong className="result-error-info-content-title">
            发现 1 条错误数据，请修正后重新上传
          </strong>
        </div>
      </div>

      <Table<DataType>
        // rowSelection={{ type: "checkbox" }}
        columns={columns}
        dataSource={data}
        pagination={false}
      />

      <div className="btn-wrap m-t-20">
        <div className="btn btn-reload">
          <span></span>
          <span>重新上传</span>
        </div>
        <div className="btn btn-ok">
          <span></span>
          <span>确认导入</span>
        </div>
      </div>
    </div>
  );
}
