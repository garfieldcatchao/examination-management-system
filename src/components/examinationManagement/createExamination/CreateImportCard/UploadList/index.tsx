import React from "react";

import "./index.css";
// import { DataType } from "../../../../../interface/examinationsFace";
import { message, Table, TableColumnsType } from "antd";
import { useDispatch } from "react-redux";

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
    render: (text: string, option: any) => {
      if (option.status == "1") {
        return <span className="import-icon icon-tongguo-copy"></span>;
      }

      return <span className="import-icon icon-weitongguo-copy"></span>;
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



export default function UploadList(props: any) {
  const { importData } = props || {};
  const dispatch = useDispatch();
  

  if (!importData) return null;

  const { totalCount, validCount, wraingCount, errorCount, data } =
    importData || {};

  const processDataWithValidation = (rawData: any[]): any[] => {
    return rawData.map((row, index) => {
      const validation = validateRowData(row);
      return {
        key: `${index}`,
        studentId: row.studentId,
        username: row.username,
        department: row.department || row.className, // 支持两种字段名
        phone: row.phone,
        email: row.email,
        status: validation.status,
        errorInfo: validation.errorInfo || "-",
      };
    });
  };

  const validateRowData = (row: any): { status: number; errorInfo: string } => {
    const errors: string[] = [];

    if (!row.studentId || row.studentId.toString().trim() === "") {
      errors.push("学号不能为空");
    }

    if (!row.username || row.username.toString().trim() === "") {
      errors.push("姓名不能为空");
    }

    if (row.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(row.email)) {
        errors.push("邮箱格式错误");
      }
    }

    if (row.phone) {
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(row.phone.toString())) {
        errors.push("手机号格式错误");
      }
    }

    
    return {
      status: errors.length > 0 ? 2 : 1, // 有错误为2，无错误为1
      errorInfo: errors.join("；"),
    };
  };

  const handleImport = () => {
    console.log("handleImport -----> ");
    if (errorCount) {
      message.error("有错误数据，请修正后重新上传");
      return;
    }

    const { onImport } = props || {};
    if (typeof onImport == "function") {
      onImport(data);
    }
    // dispatch(importData);
  };

  const resetBtn = () => {
    const { onReset } = props || {};
    if (typeof onReset == "function") {
      onReset("step1");
    }
  }

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
            <div className="result-item-total-value">{totalCount}</div>
            <div style={{ fontSize: "12px", color: "#8c8c8c" }}>总记录数</div>
          </div>
          <div className="result-item">
            <div className="result-item-value result-item-success-value">
              {validCount}
            </div>
            <div style={{ fontSize: "12px", color: "#8c8c8c" }}>验证成功</div>
          </div>
          <div className="result-item">
            <div className="result-item-wraning-value">{wraingCount}</div>
            <div style={{ fontSize: "12px", color: "#8c8c8c" }}>警告</div>
          </div>
          <div className="result-item">
            <div className="result-item-error-value">{errorCount}</div>
            <div style={{ fontSize: "12px", color: "#8c8c8c" }}>错误</div>
          </div>
        </div>
      </div>

      {errorCount ? (
        <div className="result-error-info">
          <div className="result-error-info-content">
            <i
              className="fas fa-exclamation-circle"
              style={{ marginRight: "8px" }}
            ></i>
            <strong className="result-error-info-content-title">
              发现 {errorCount} 条错误数据，请修正后重新上传
            </strong>
          </div>
        </div>
      ) : null}

      <Table<DataType>
        // rowSelection={{ type: "checkbox" }}
        columns={columns}
        dataSource={processDataWithValidation(data)}
        pagination={false}
      />

      <div className="btn-wrap m-t-20">
        <div className="btn btn-reload" onClick={resetBtn}>
          <span></span>
          <span>重新上传</span>
        </div>
        <div className="btn btn-ok" onClick={handleImport}>
          <span></span>
          <span>确认导入</span>
        </div>
      </div>
    </div>
  );
}
