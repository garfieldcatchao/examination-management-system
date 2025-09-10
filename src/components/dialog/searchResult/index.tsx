import React, { useState } from "react";
import { SearchResultProps } from "../../../interface/testBaseManagement";
import { Modal } from "antd";
import "./index.css";

function SearchResult(props: SearchResultProps) {
  const { open } = props;
  const handleOk = () => {
    props.onClose();
  };
  const handleCancel = () => {
    props.onClose();
  };

  return (
    <Modal
      visible={open}
      title="题目详情"
      onOk={handleOk}
      onCancel={handleCancel}
      width={800}
      footer={
        [
          // <Button key="back" onClick={this.handleCancel}>
          //   Return
          // </Button>,
          // <Button
          //   key="submit"
          //   type="primary"
          //   loading={loading}
          //   onClick={this.handleOk}
          // >
          //   Submit
          // </Button>,
        ]
      }
    >
      {/* <div className="modal-content"> */}
        {/* <div className="modal-header">
          <h3 className="modal-title">题目详情</h3>
          <button className="modal-close" onClick={handleCancel}>
            <i className="fas fa-times"></i>
          </button>
        </div> */}
        <div className="modal-body">
          <div className="question-detail">
            <div className="question-content">
              TCP协议和UDP协议的主要区别是什么？
            </div>

            <div className="question-options">
              <div className="option-detail">
                <div className="option-letter">A</div>
                <div>TCP是面向连接的，UDP是无连接的</div>
              </div>
              <div className="option-detail">
                <div className="option-letter">B</div>
                <div>TCP是无连接的，UDP是面向连接的</div>
              </div>
              <div className="option-detail">
                <div className="option-letter">C</div>
                <div>两者都是面向连接的协议</div>
              </div>
              <div className="option-detail correct">
                <div className="option-letter">D</div>
                <div>两者都是无连接的协议</div>
              </div>
            </div>

            <div className="question-answer">
              <div className="answer-label">正确答案：A</div>
              <div className="answer-content">
                TCP（传输控制协议）是面向连接的协议，在数据传输前需要建立连接，提供可靠的数据传输服务。
                而UDP（用户数据报协议）是无连接的协议，不需要建立连接，传输速度快但不保证数据可靠性。
              </div>
            </div>
          </div>
        {/* </div> */}
      </div>
    </Modal>
  );
}

export default SearchResult;
