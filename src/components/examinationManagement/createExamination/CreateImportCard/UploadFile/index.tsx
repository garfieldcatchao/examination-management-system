import React, { useState } from "react";

import Dragger from "antd/es/upload/Dragger";
import { message, UploadProps } from "antd";
import { InboxOutlined } from "@ant-design/icons";

import styles from "./index.module.css";
import {
  ExcelColumn,
  ExcelHelper,
  ExcelParseResult,
} from "../../../../../utils/excelHelper";
import { error } from "console";

export default function UploadFile(props: any) {
  const [active, setActive] = useState<string>("setp1");
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [parseResult, setParseResult] = useState<ExcelParseResult | null>(null);

  const draggerProps: UploadProps = {
    name: "file",
    multiple: true,
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
    style: {
      height: "200px",
    },
  };

  const studentColumns: ExcelColumn[] = [
    {
      key: "studentId",
      label: "学号",
      required: true,
      transformer: ExcelHelper.transformers.trimString,
      validator: ExcelHelper.validators.stringLength(6, 20),
    },
    {
      key: "username",
      label: "姓名",
      required: true,
      transformer: ExcelHelper.transformers.trimString,
      validator: ExcelHelper.validators.stringLength(2, 50),
    },
    {
      key: "className",
      label: "班级",
      required: true,
      transformer: ExcelHelper.transformers.trimString,
    },
    {
      key: "grade",
      label: "年级",
      transformer: ExcelHelper.transformers.trimString,
    },
    {
      key: "email",
      label: "邮箱",
      validator: ExcelHelper.validators.email,
    },
    {
      key: "phone",
      label: "手机号",
      validator: ExcelHelper.validators.phone,
    },
  ];

  const onChange = async (info: any) => {
    const { fileList: newFileList } = info;
    setFileList(newFileList);

    if (newFileList.length > 0) {
      const file = newFileList[0].originFileObj;

      // 验证文件
      const validationError = ExcelHelper.validateExcelFile(file);
      if (validationError) {
        message.error(validationError);
        return;
      }

      setUploading(true);
      try {
        // 解析Excel文件
        const result = await ExcelHelper.parseExcelFile(file, studentColumns, {
          startRow: 1,
          maxRows: 1000,
        });

        setParseResult(result);
        let data = {};
        
        console.log("上传成功： ======》 ", result);
        if (result.success) {
          console.log("解析的学生数据:", result.data);
          data = getImportResult(result);
          if (result.errors.length > 0) {
            console.warn("解析错误:", result.errors);
            data = getImportResult(result);
          }
          if (result.warnings.length > 0) {
            console.warn("解析警告:", result.warnings);
            data = getImportResult(result);
          }

          props.onChange(data);
        } else {
          console.error("解析错误:", result.errors);
          props.onChange(getImportResult(result));
        }
      } catch (error) {
        console.error("文件处理失败:", error);
        message.error("文件处理失败");
      } finally {
        setUploading(false);
      }
    }
  };

  const getImportResult = (config: {
    success: boolean;
    data: any[];
    errors: any[];
    warnings: any[];
    total: number;
    validCount: number;
  }) => {
    return {
      success: config.success,
      totalCount: config.total,
      validCount: config.validCount,
      wraingCount: config.warnings.length,
      errorCount: config.errors.length,
      data: config.data,
    };
  };

  const downloadStudentTemplate = () => {
    const templateData = [
      [
        "S001",
        "张三",
        "计算机1班",
        "大二",
        "zhangsan@example.com",
        "13812345678",
      ],
      ["S002", "李四", "计算机1班", "大二", "lisi@example.com", "13987654321"],
    ];
    ExcelHelper.downloadTemplate(
      studentColumns,
      templateData,
      "学生导入模板.xlsx"
    );
  };

  const renderParseResult = () => {
    if (!parseResult) return null;

    return (
      <div className="parse-result">
        <div className="result-summary">
          <span>总行数: {parseResult.total}</span>
          <span>有效数据: {parseResult.validCount}</span>
          <span>错误数: {parseResult.errors.length}</span>
          <span>警告数: {parseResult.warnings.length}</span>
        </div>

        {parseResult.errors.length > 0 && (
          <div className="error-list">
            <h4>错误列表:</h4>
            {parseResult.errors.slice(0, 5).map((error: any, index: number) => (
              <div key={index} className="error-item">
                第{error.row}行 {error.column}: {error.error}
              </div>
            ))}
            {parseResult.errors.length > 5 && (
              <div>还有 {parseResult.errors.length - 5} 个错误...</div>
            )}
          </div>
        )}
      </div>
    );
  };

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
        accept=".xlsx,.xls,.csv"
        onChange={(info) => onChange(info)}
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
            downloadStudentTemplate();
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
