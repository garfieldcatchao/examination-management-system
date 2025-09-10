import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Row,
  Col,
  Select,
  DatePicker,
  Radio,
  Checkbox,
  Pagination,
} from "antd";
import dayjs from "dayjs";
import SearchResult from "../../dialog/searchResult";
import { SearchModalProps } from "../../../interface/testBaseManagement";
import { setSelectedTab } from "../../../store/testbaseManagementStore";
import "./SearchModal.css";

const { Option } = Select;
const { MonthPicker, RangePicker } = DatePicker;

const dateFormat = "YYYY/MM/DD";
const monthFormat = "YYYY/MM";

const plainOptions = ["Apple", "Pear", "Orange"];
const defaultCheckedList = ["Apple", "Orange"];

function SearchModal(props: SearchModalProps) {
  const { activeTab, searchList } = useSelector(
    (state: any) => state.testbaseManagement
  );
  const [basicSearch, setBasicSearch] = useState(true);
  const [advancedSearch, setAdvancedSearch] = useState(false);
  const [savedSearch, setSavedSearch] = useState(false);
  const [radioValue, setRadioValue] = useState("all");
  const [fold, setFold] = useState(true);
  const [size, setSize] = useState("default");
  const [visible, setVisible] = useState(false);
  const [searchResultVisible, setSearchResultVisible] = useState(false);
  const searchContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchContentRef.current) {
      const element = searchContentRef.current;
      if (!fold) {
        element.style.maxHeight = "none";
        const naturalHeight = element.scrollHeight;
        element.style.maxHeight = "0px";

        requestAnimationFrame(() => {
          element.style.maxHeight = naturalHeight + "px";
        });
      } else {
        element.style.maxHeight = "0px";
      }
    }
  }, [fold]);

  console.log(activeTab, searchList);
  const dispatch = useDispatch();
  const switchTab = (tab: string) => {
    console.log(tab);
    dispatch(setSelectedTab(tab));
  };

  const handleChange = (value: string) => {
    console.log(value);
  };

  useEffect(() => {
    // dispatch(initSearchList(searchList));
  }, [searchList]);

  const renderQuestionTypeSelect = () => {
    return (
      <Select
        defaultValue="lucy"
        style={{ width: "100%" }}
        onChange={handleChange}
      >
        <Option value="jack">Jack</Option>
        <Option value="lucy">Lucy</Option>
        <Option value="disabled" disabled>
          Disabled
        </Option>
        <Option value="Yiminghe">yiminghe</Option>
      </Select>
    );
  };

  const renderDifficultySelect = () => {
    return (
      <Select
        defaultValue="lucy"
        style={{ width: "100%" }}
        onChange={handleChange}
      >
        <Option value="jack">Jack</Option>
        <Option value="lucy">Lucy</Option>
      </Select>
    );
  };

  const onRadioChange = (e: any) => {
    console.log(e);
    setRadioValue(e.target.value);
  };

  const renderObjectSelect = () => {
    return (
      <Select
        defaultValue="lucy"
        style={{ width: "100%", height: "38px" }}
        onChange={handleChange}
      >
        <Option value="jack">Jack</Option>
        <Option value="lucy">Lucy</Option>
      </Select>
    );
  };

  const renderTimeangeStatusSelect = () => {
    return (
      <div className="form-group m-t-20 form-row w-100 flex-row-between">
        <div className="w-100">
          <label className="form-label">创建时间</label>
          <div className="date-range">
            <RangePicker
              defaultValue={[
                dayjs("2015/01/01", dateFormat),
                dayjs("2015/01/01", dateFormat),
              ]}
              style={{ width: "100%", height: "38px" }}
              format={dateFormat}
            />
          </div>
        </div>

        <div className="w-100">
          <label className="form-label">答案状态</label>
          <div className="radio-group h-38 p-lr-16">
            <Radio.Group
              onChange={onRadioChange}
              value={radioValue}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Radio value={"all"}>全部</Radio>
              <Radio value={"answer-yes"}>有答案</Radio>
              <Radio value={"answer-no"}>无答案</Radio>
            </Radio.Group>
          </div>
        </div>
      </div>
    );
  };

  const onShowSizeChange = (current: number, pageSize: number) => {
    console.log(current, pageSize);
  };

  const renderSelectTag = () => {
    return (
      <Select
        mode="multiple"
        size={size as any}
        placeholder="Please select"
        defaultValue={["基础概念", "编程实践"] as any}
        onChange={handleChange}
        style={{
          width: "100%",
          height: "38px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <option value="basic">基础概念</option>
        <option value="programmingPractice">编程实践</option>
      </Select>
    );
  };

  const onCheckboxChange = (value: string[]) => {
    console.log(`checked = ${value}`);
  };

  const renderSearchActions = () => {
    return (
      <div className="search-actions">
        <div className="action-right">
          <button type="button" className="btn btn-secondary">
            <i className="fas fa-save"></i>
            保存搜索
          </button>
          <button
            type="button"
            className="btn btn-primary btn-large"
            onClick={() => setSearchResultVisible(true)}
          >
            <i className="fas fa-search"></i>
            开始搜索
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="search-container">
      <div className="search-panel">
        <div className="search-toolbar">
          <div className="toolbar-left" onClick={() => setFold(!fold)}>
            <div className="advanced-toggle">
              <i
                className={`iconfont ${
                  fold ? "icon-zhankai1-copy" : "icon-shouqi-copy"
                }`}
                onClick={() => setFold(!fold)}
              ></i>
              <span>{fold ? "展开" : "收起"}筛选条件</span>
            </div>
          </div>
          <div className="toolbar-right">
            <div className="saved-search-dropdown">
              <div className="dropdown-trigger">
                <i className="fas fa-bookmark"></i>
                <span>保存的搜索</span>
                <i className="fas fa-chevron-down"></i>
              </div>
              <div className="dropdown-menu" id="saved-dropdown">
                <div className="dropdown-item">
                  <div className="dropdown-item-title">高频使用题目</div>
                  <div className="dropdown-item-desc">
                    使用次数大于200次的题目
                  </div>
                </div>
                <div className="dropdown-item">
                  <div className="dropdown-item-title">困难题目筛选</div>
                  <div className="dropdown-item-desc">
                    难度为困难且正确率低于60%
                  </div>
                </div>
                <div className="dropdown-item">
                  <div className="dropdown-item-title">最新题目</div>
                  <div className="dropdown-item-desc">最近7天内创建的题目</div>
                </div>
                <div className="dropdown-item">
                  <div className="dropdown-item-title">
                    <i className="fas fa-plus"></i> 保存当前搜索
                  </div>
                </div>
              </div>
            </div>
            <button className="btn btn-secondary">
              <i className="fas fa-redo"></i>
              重置
            </button>
          </div>
        </div>

        {/* <!-- 搜索内容区域 --> */}
        <div
          className={`search-content ${fold ? "fold" : "unFold"}`}
          ref={searchContentRef}
        >
          <form className="search-form">
            {/* <!-- 主搜索区域 -->  */}
            <div className="main-search-area">
              {/* <!-- 关键词搜索 -->  */}
              <div className="form-section">
                <div className="section-title">
                  <i className="fas fa-search"></i>
                  搜索内容
                </div>
                <div className="form-row single m-t-20">
                  <div className="form-group" style={{ width: "100%" }}>
                    <label className="form-label">关键词</label>
                    <input
                      type="text"
                      className="form-input large"
                      placeholder="请输入题目内容、选项或答案关键词..."
                      style={{ width: "initial" }}
                    />
                  </div>
                </div>
              </div>

              {/* <!-- 基本筛选 --> */}
              <div className="form-section m-t-20">
                <div className="section-title">
                  <i className="fas fa-filter"></i>
                  基本筛选
                </div>
                <div className="form-row m-t-20">
                  <div className="form-group" style={{ width: "100%" }}>
                    <label className="form-label">题目类型</label>
                    {renderQuestionTypeSelect()}
                  </div>
                  <div className="form-group" style={{ width: "100%" }}>
                    <label className="form-label">难度等级</label>
                    {renderDifficultySelect()}
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group" style={{ width: "100%" }}>
                    <label className="form-label">学科分类</label>
                    <div className="form-select">{renderObjectSelect()}</div>
                  </div>
                  <div className="form-group" style={{ width: "100%" }}>
                    <label className="form-label">创建者</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="输入创建者姓名..."
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* <!-- 高级筛选区域 --> */}
            <div className="advanced-filters" id="advanced-filters">
              {/* <!-- 时间和状态筛选 --> */}
              <div className="form-section">
                <div className="section-title">
                  <i className="fas fa-calendar"></i>
                  时间范围与状态
                </div>
                <div className="form-row">
                  {renderTimeangeStatusSelect()}
                  {/* <div className="form-group">
                    <label className="form-label">答案状态</label>
                    <div className="radio-group">
                      <div className="radio-item">
                        <input
                          type="radio"
                          id="answer-all"
                          name="answer-status"
                          value="all"
                          checked
                        />
                        <label className="answer-all">全部</label>
                      </div>
                      <div className="radio-item">
                        <input
                          type="radio"
                          id="answer-yes"
                          name="answer-status"
                          value="yes"
                        />
                        <label className="answer-yes">有答案</label>
                      </div>
                      <div className="radio-item">
                        <input
                          type="radio"
                          id="answer-no"
                          name="answer-status"
                          value="no"
                        />
                        <label className="answer-no">无答案</label>
                      </div>
                    </div>
                  </div> */}
                </div>
              </div>

              {/* <!-- 统计数据筛选 --> */}
              {/* <div className="form-section">
                <div className="section-title">
                  <i className="fas fa-chart-bar"></i>
                  统计数据筛选
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">使用次数范围</label>
                    <div className="range-input">
                      <div className="range-values">
                        <span>0</span>
                        <span>1000+</span>
                      </div>
                      <input
                        type="range"
                        className="range-slider"
                        min="0"
                        max="1000"
                        value="0"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">正确率范围</label>
                    <div className="range-input">
                      <div className="range-values">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                      <input
                        type="range"
                        className="range-slider"
                        min="0"
                        max="100"
                        value="0"
                      />
                    </div>
                  </div>
                </div>
              </div> */}

              {/* <!-- 标签和评级 --> */}
              <div className="form-section">
                <div className="section-title">
                  <i className="fas fa-tags"></i>
                  标签与评级
                </div>

                <div className="form-row m-t-20">
                  <div className="form-group">
                    <label className="form-label">包含标签</label>
                    {renderSelectTag()}
                  </div>
                  <div className="form-group">
                    <label className="form-label">质量评级</label>
                    <div className="form-select">
                      <Select
                        defaultValue="lucy"
                        style={{ width: "100%", height: "38px" }}
                        onChange={handleChange}
                      >
                        <Option value="all">所有评级</Option>
                        <Option value="excellent">优秀 (90+)</Option>
                        <Option value="good">良好 (80-89)</Option>
                        <Option value="average">一般 (70-79)</Option>
                        <Option value="poor">较差 (60-69)</Option>
                        <Option value="unrated">未评级</Option>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* <!-- 题目状态筛选 --> */}
              <div className="form-section">
                <div className="section-title">
                  <i className="fas fa-toggle-on"></i>
                  题目状态
                </div>
                <div className="form-row m-t-20">
                  <div className="form-group">
                    <label className="form-label">状态筛选</label>
                    <div className="checkbox-group">
                      <Checkbox.Group
                        style={{ width: "100%" }}
                        onChange={onCheckboxChange}
                      >
                        <Row>
                          <Col span={8}>
                            <Checkbox value="Enabled">启用中</Checkbox>
                          </Col>
                          <Col span={8}>
                            <Checkbox value="Disabled">已禁用</Checkbox>
                          </Col>
                          <Col span={8}>
                            <Checkbox value="audit">审核中</Checkbox>
                          </Col>
                        </Row>
                      </Checkbox.Group>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* <!-- 搜索操作区域 --> */}
            {renderSearchActions()}
          </form>
        </div>
      </div>

      {/* 搜索结果区域 */}
      <div
        className="search-results"
        id="search-results"
        // style={{ display: "none" }}
      >
        <div className="results-header">
          <div className="results-info">
            <div className="results-count">找到 156 条结果</div>
            <div className="results-filter">筛选条件：单选题、中等难度</div>
          </div>
          <div className="results-actions">
            <button className="btn btn-secondary">
              <i className="fas fa-download"></i>
              导出结果
            </button>
            <button className="btn btn-primary">
              <i className="fas fa-tasks"></i>
              批量操作
            </button>
          </div>
        </div>

        <div className="results-list">
          {/* <!-- 示例结果项 --> */}
          <div className="result-item">
            <div className="result-header">
              <div className="result-meta">
                <span className="meta-badge type-single">单选题</span>
                <span className="meta-badge difficulty-medium">中等</span>
                <span style={{ color: "#8c8c8c", fontSize: "14px" }}>
                  计算机网络
                </span>
              </div>
              <div className="result-tags">
                <span className="result-tag">网络协议</span>
                <span className="result-tag">基础概念</span>
              </div>
            </div>
            <div className="result-content">
              TCP协议和UDP协议的主要区别是什么？
            </div>
            <div className="result-footer">
              <div className="result-stats">
                <span>
                  <i className="fas fa-user"></i> 张老师
                </span>
                <span>
                  <i className="fas fa-calendar"></i> 2024-03-15
                </span>
                <span>
                  <i className="fas fa-fire"></i> 使用234次
                </span>
                <span>
                  <i className="fas fa-chart-line"></i> 正确率78.5%
                </span>
              </div>
            </div>
          </div>

          <div className="result-item">
            <div className="result-header">
              <div className="result-meta">
                <span className="meta-badge type-multiple">多选题</span>
                <span className="meta-badge difficulty-hard">困难</span>
                <span style={{ color: "#8c8c8c", fontSize: "14px" }}>
                  数据结构
                </span>
              </div>
              <div className="result-tags">
                <span className="result-tag">算法</span>
                <span className="result-tag">重点题目</span>
              </div>
            </div>
            <div className="result-content">
              以下哪些是常见的排序算法？（多选）
            </div>
            <div className="result-footer">
              <div className="result-stats">
                <span>
                  <i className="fas fa-user"></i> 李老师
                </span>
                <span>
                  <i className="fas fa-calendar"></i> 2024-03-14
                </span>
                <span>
                  <i className="fas fa-fire"></i> 使用156次
                </span>
                <span>
                  <i className="fas fa-chart-line"></i> 正确率65.2%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="pagination-container">
        <Pagination
          showSizeChanger
          onShowSizeChange={onShowSizeChange}
          defaultCurrent={3}
          total={500}
          style={{ marginTop: "20px" }}
        />
      </div>
      <SearchResult
        open={searchResultVisible}
        onClose={() => setSearchResultVisible(false)}
      />
    </div>
  );
}

export default SearchModal;
