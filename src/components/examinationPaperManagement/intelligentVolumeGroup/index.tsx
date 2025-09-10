import React from "react";
import { Input, Select } from "antd";
import "./index.css";

const { TextArea } = Input;

function IntelligentVolumeGroup() {
  function handleChange(
    value: string,
    option?:
      | { value: string; label: string; disabled?: undefined }
      | { value: string; label: string; disabled: true }
      | (
          | { value: string; label: string; disabled?: undefined }
          | { value: string; label: string; disabled: true }
        )[]
      | undefined
  ): void {
    throw new Error("Function not implemented.");
  }

    function previewSmartPaper(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        throw new Error("Function not implemented.");
    }

    function saveDraft(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        throw new Error("Function not implemented.");
    }

    function generatePaper(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        throw new Error("Function not implemented.");
    }

  return (
    <div className="intelligent-volume-group-container">
      <div className="smart-smart-form-section">
        <div className="smart-section-title">
          <i className="fas fa-cog"></i>
          基本设置
        </div>
        <div className="smart-form-grid">
          <div className="smart-form-group">
            <label className="smart-form-label">试卷名称 *</label>
            {/* <input type="text" className="smart-form-input" /> */}
            <Input
              type="text"
              placeholder="请输入试卷名称"
              style={{ width: "100%", height: "38px" }}
            />
          </div>
          <div className="smart-form-group">
            <label className="smart-form-label">学科分类 *</label>
            {/* <select className="smart-form-select">
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
                { value: "lucy", label: "计算机网络" },
                { value: "Yiminghe", label: "数据结构" },
                { value: "disabled", label: "操作系统" },
              ]}
            />
          </div>
          <div className="smart-form-group">
            <label className="smart-form-label">考试时长</label>
            {/* <input
              type="number"
              className="smart-form-input"
              placeholder="分钟"
              value="120"
            /> */}
            <Input
              type="text"
              placeholder="分钟"
              value="120"
              style={{ width: "100%", height: "38px" }}
            />
          </div>
          <div className="smart-form-group">
            <label className="smart-form-label">总分</label>
            {/* <input
              type="number"
              className="smart-form-input"
              placeholder="分数"
              value="100"
            /> */}
            <Input
              type="text"
              placeholder="分数"
              value="100"
              style={{ width: "100%", height: "38px" }}
            />
          </div>
          <div className="smart-form-group">
            <label className="smart-form-label">难度分布</label>
            <Select
              defaultValue="intelligentRecommend"
              style={{ width: "100%", height: "38px" }}
              onChange={handleChange}
              options={[
                { value: "intelligentRecommend", label: "智能推荐" },
                { value: "easyFirst", label: "简单为主" },
                { value: "mediumFirst", label: "中等为主" },
                { value: "difficultiesFirst", label: "困难为主" },
                { value: "custom", label: "自定义" },
              ]}
            />
          </div>
          <div className="smart-form-group">
            <label className="smart-form-label">题目来源</label>
            {/* <select className="smart-form-select">
              <option>全部题库</option>
              <option>本人创建</option>
              <option>共享题库</option>
              <option>指定题库</option>
            </select> */}
            <Select
              defaultValue="all"
              style={{ width: "100%", height: "38px" }}
              onChange={handleChange}
              options={[
                { value: "all", label: "全部题库" },
                { value: "create", label: "本人创建" },
                { value: "share", label: "共享题库" },
                { value: "specified", label: "指定题库" },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="smart-form-section">
        <div className="smart-section-title">
          <i className="fas fa-list-alt"></i>
          题型配置
        </div>
        <div className="smart-form-grid">
          <div className="smart-form-group">
            <label className="smart-form-label">单选题数量</label>
            {/* <input
              type="number"
              className="smart-form-input"
              placeholder="道"
              value="20"
            /> */}
            <Input
              type="text"
              placeholder="道"
              value="20"
              style={{ width: "100%", height: "38px" }}
            />
          </div>
          <div className="smart-smart-form-group">
            <label className="smart-form-label">单选题分值</label>
            {/* <input
              type="number"
              className="smart-form-input"
              placeholder="分/题"
              value="2"
            /> */}
            <Input
              type="text"
              placeholder="分/题"
              value="2"
              style={{ width: "100%", height: "38px" }}
            />
          </div>
          <div className="smart-form-group">
            <label className="smart-form-label">多选题数量</label>
            {/* <input
              type="number"
              className="smart-form-input"
              placeholder="道"
              value="10"
            /> */}
            <Input
              type="text"
              placeholder="道"
              value="10"
              style={{ width: "100%", height: "38px" }}
            />
          </div>
          <div className="smart-form-group">
            <label className="smart-form-label">多选题分值</label>
            {/* <input
              type="number"
              className="smart-form-input"
              placeholder="分/题"
              value="3"
            /> */}
            <Input
              type="text"
              placeholder="道"
              value="3"
              style={{ width: "100%", height: "38px" }}
            />
          </div>
          <div className="smart-form-group">
            <label className="smart-form-label">判断题数量</label>
            {/* <input
              type="number"
              className="smart-form-input"
              placeholder="道"
              value="10"
            /> */}
            <Input
              type="text"
              placeholder="道"
              value="10"
              style={{ width: "100%", height: "38px" }}
            />
          </div>
          <div className="smart-form-group">
            <label className="smart-form-label">判断题分值</label>
            {/* <input
              type="number"
              className="smart-form-input"
              placeholder="分/题"
              value="1"
            /> */}
            <Input
              type="text"
              placeholder="分/题"
              value="1"
              style={{ width: "100%", height: "38px" }}
            />
          </div>
          <div className="smart-form-group">
            <label className="smart-form-label">填空题数量</label>
            {/* <input
              type="number"
              className="smart-form-input"
              placeholder="道"
              value="5"
            /> */}
            <Input
              type="text"
              placeholder="道"
              value="5"
              style={{ width: "100%", height: "38px" }}
            />
          </div>
          <div className="smart-form-group">
            <label className="smart-form-label">填空题分值</label>
            {/* <input
              type="number"
              className="smart-form-input"
              placeholder="分/题"
              value="4"
            /> */}
            <Input
              type="text"
              placeholder="分/题"
              value="4"
              style={{ width: "100%", height: "38px" }}
            />
          </div>
          <div className="smart-form-group">
            <label className="smart-form-label">简答题数量</label>
            {/* <input
              type="number"
              className="smart-form-input"
              placeholder="道"
              value="3"
            /> */}
            <Input
              type="text"
              placeholder="道"
              value="3"
              style={{ width: "100%", height: "38px" }}
            />
          </div>
          <div className="smart-form-group">
            <label className="smart-form-label">简答题分值</label>
            {/* <input
              type="number"
              className="smart-form-input"
              placeholder="分/题"
              value="10"
            /> */}
            <Input
              type="text"
              placeholder="分/题"
              value="10"
              style={{ width: "100%", height: "38px" }}
            />
          </div>
        </div>
      </div>

      <div className="smart-form-section">
        <div className="smart-section-title">
          <i className="fas fa-brain"></i>
          智能选项
        </div>
        <div className="smart-form-grid">
          <div className="smart-form-group">
            <label className="smart-form-label">知识点覆盖</label>
            {/*<select className="smart-form-select">
              <option>自动均衡</option>
              <option>重点突出</option>
              <option>全面覆盖</option>
              <option>自定义权重</option>
            </select> */}
            <Select
              defaultValue="autobalance"
              style={{ width: "100%", height: "38px" }}
              onChange={handleChange}
              options={[
                { value: "autobalance", label: "自动均衡" },
                { value: "focus", label: "重点突出" },
                { value: "cover", label: "全面覆盖" },
                { value: "customWeight", label: "自定义权重" },
              ]}
            />
          </div>
          <div className="smart-form-group">
            <label className="smart-form-label">题目去重</label>
            {/* <select className="smart-form-select">
              <option>智能去重</option>
              <option>严格去重</option>
              <option>允许相似</option>
            </select> */}
            <Select
              defaultValue="intelligentDuplication"
              style={{ width: "100%", height: "38px" }}
              onChange={handleChange}
              options={[
                { value: "intelligentDuplication", label: "智能去重" },
                { value: "strictDuplication", label: "严格去重" },
                { value: "similarDuplication", label: "允许相似" },
              ]}
            />
          </div>
          <div className="smart-form-group">
            <label className="smart-form-label">质量筛选</label>
            {/* <select className="smart-form-select">
              <option>高质量优先</option>
              <option>常用题优先</option>
              <option>新题优先</option>
              <option>随机选择</option>
            </select> */}
            <Select
              defaultValue="highQuality"
              style={{ width: "100%", height: "38px" }}
              onChange={handleChange}
              options={[
                { value: "highQuality", label: "高质量优先" },
                { value: "common", label: "常用题优先" },
                { value: "new", label: "新题优先" },
                { value: "random", label: "随机选择" },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="smart-form-section">
        <div className="smart-section-title">
          <i className="fas fa-comment"></i>
          试卷说明
        </div>
        <div className="smart-form-group">
          <label className="smart-form-label">考试说明</label>
          {/* <textarea
                className="smart-form-input smart-form-textarea"
                placeholder="请输入考试说明和注意事项..."
            ></textarea> */}
          <TextArea
            style={{ minHeight: "80px", marginTop: "10px" }}
            placeholder="请输入考试说明和注意事项..."
            maxLength={6}
          />
        </div>
      </div>

      <div className="smart-toolbar">
        <div className="smart-toolbar-left">
          <button className="btn btn-secondary" onClick={previewSmartPaper}>
            <i className="fas fa-eye"></i>
            <span>预览配置</span>
          </button>
        </div>
        <div className="smart-toolbar-right">
          <button className="btn btn-secondary" onClick={saveDraft}>
            <i className="fas fa-save"></i>
            <span>保存草稿</span>
          </button>
          <button className="btn btn-primary btn-large" onClick={generatePaper}>
            <i className="fas fa-magic"></i>
            <span>智能组卷</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default IntelligentVolumeGroup;
