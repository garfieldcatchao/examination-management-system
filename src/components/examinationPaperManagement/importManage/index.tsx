import React from "react";
import "./index.css";
import { Select } from "antd";

function ImportManage() {
  function startImport(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void {
    throw new Error("Function not implemented.");
  }

  function selectImportFile(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void {
    throw new Error("Function not implemented.");
  }

  function handleChange(value: string, option?: { value: string; label: string; } | { value: string; label: string; }[] | undefined): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div id="import-paper" className="tab-content">
      <div className="smart-form">
        <div className="form-section">
          <div className="section-title">
            <i className="fas fa-upload"></i>
            试卷导入
          </div>
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              border: "2px dashed #d9d9d9",
              borderRadius: "8px",
              marginBottom: "24px",
            }}
          >
            <i
              className="fas fa-cloud-upload-alt"
              style={{
                fontSize: "48px",
                color: "#d9d9d9",
                marginBottom: "16px",
              }}
            ></i>
            <p style={{ color: "#8c8c8c", marginBottom: "16px" }}>
              点击选择文件或拖拽文件到此区域
            </p>
            <input
              type="file"
              id="file-input"
              style={{ display: "none" }}
              accept=".docx,.pdf,.txt"
            />
            <button className="btn btn-primary" onClick={selectImportFile}>
              <i className="fas fa-folder-open"></i>
              选择文件
            </button>
            <div
              id="file-info"
              className="file-info"
              style={{ display: "none", marginTop: "16px" }}
            ></div>
            <p
              style={{ color: "#8c8c8c", fontSize: "12px", marginTop: "12px" }}
            >
              支持格式：Word文档(.docx)、PDF文件(.pdf)、文本文件(.txt)
            </p>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">导入模式</label>
              {/* <select className="form-select">
                <option>智能解析</option>
                <option>标准格式</option>
                <option>自定义格式</option>
              </select> */}
              <Select
                defaultValue="smart"
                style={{ width: "100%", height: "38px" }}
                onChange={handleChange}
                options={[
                  { value: "smart", label: "智能解析" },
                  { value: "standard", label: "标准格式" },
                  { value: "custom", label: "自定义格式" },
                ]}
              />
            </div>
            <div className="form-group">
              <label className="form-label">编码格式</label>
              {/* <select className="form-select">
                <option>UTF-8</option>
                <option>GBK</option>
                <option>ASCII</option>
              </select> */}
              <Select
                defaultValue="UTF-8"
                style={{ width: "100%", height: "38px" }}
                onChange={handleChange}
                options={[
                  { value: "UTF-8", label: "UTF-8" },
                  { value: "GBK", label: "GBK" },
                  { value: "ASCII", label: "ASCII" },
                ]}
              />
            </div>
            <div className="form-group">
              <label className="form-label">学科分类</label>
              {/* <select className="form-select">
                <option>请选择学科</option>
                <option>计算机网络</option>
                <option>数据结构</option>
                <option>操作系统</option>
              </select> */}
              <Select
                defaultValue="choose"
                style={{ width: "100%", height: "38px" }}
                onChange={handleChange}
                options={[
                  { value: "choose", label: "请选择学科" },
                  { value: "computerNetwork", label: "计算机网络" },
                  { value: "dataStructure", label: "数据结构" },
                  { value: "operatingSystem", label: "操作系统" },
                ]}
              />
            </div>
            <div className="form-group">
              <label className="form-label">默认难度</label>
              {/* <select className="form-select">
                <option>中等</option>
                <option>简单</option>
                <option>困难</option>
              </select> */}
              <Select
                defaultValue="medium"
                style={{ width: "100%", height: "38px" }}
                onChange={handleChange}
                options={[
                  { value: "medium", label: "中等" },
                  { value: "easy", label: "简单" },
                  { value: "hard", label: "困难" },
                ]}
              />
            </div>
          </div>
        </div>

        <div className="smart-toolbar">
          <div className="smart-toolbar-left">
            <button className="btn btn-secondary">
              <i className="fas fa-download"></i>
              <span>下载模板</span>
            </button>
            <button className="btn btn-secondary">
              <i className="fas fa-question-circle"></i>
              <span>导入帮助</span>
            </button>
          </div>
          <div className="smart-toolbar-right">
            <button className="btn btn-primary btn-large" onClick={startImport}>
              <i className="fas fa-upload"></i>
              <span>开始导入</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImportManage;
