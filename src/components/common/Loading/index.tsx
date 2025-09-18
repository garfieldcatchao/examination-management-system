import React from "react";
import  "./index.less";
import { Spin } from "antd";

export default function Loading(props: { spinning: boolean }) {
  const { spinning } = props;
  return (
    <div className="loading">
      <Spin spinning={spinning} />
    </div>
  );
}
