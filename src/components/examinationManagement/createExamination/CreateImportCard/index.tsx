import React, { act, useState } from "react";

import { isTrue } from "../../../../utils";
import styles from "./index.module.css";
import UploadFile from "./UploadFile";
import UploadList from "./UploadList";
import UploadResult from "./UploadResult";

const SET_PROGRESS = [
  {
    label: "1",
    value: "step1",
    progress: false,
    normal: "set-progress",
    active: "set-progress-active",
    complate: true,
  },
  {
    label: "line",
    value: "step1",
    progress: false,
    normal: "set-progress-line",
    active: "set-progress-line-active",
    complate: true,
  },
  {
    label: "2",
    value: "step2",
    progress: true,
    normal: "set-progress",
    active: "set-progress-active",
    complate: false,
  },
  {
    label: "line",
    value: "step2",
    progress: false,
    normal: "set-progress-line",
    active: "set-progress-line-active",
    complate: false,
  },
  {
    label: "3",
    value: "step3",
    progress: false,
    normal: "set-progress",
    active: "set-progress-active",
    complate: false,
  },
];

export function CreateImportCard() {
  const [active, setActive] = useState<string>("step3");
  const [progress, setProgress] = useState<any[]>(SET_PROGRESS);

  const renderSetProgress1 = () => {};

  const isComplateStatus = (item: any) => {
    if (isTrue(item.complate)) {
      return true;
    }
    return false;
  };

  return (
    <div
      className={styles["import-card-container"]}
      style={{ marginBottom: "30px" }}
    >
      <div
        className={`${styles["time-line-container"]} ${styles["d-l"]} ${styles["d-l-c"]}`}
      >
        {progress.map((item) => {
          if (item.label === "line") {
            return (
              <div
                className={`${styles[item.normal]} ${
                  isComplateStatus(item) ? styles["tips-line-active"] : ""
                }`}
                key={item.value}
              ></div>
            );
          }

          return (
            <div
              className={`
                ${styles[isTrue(item.progress) ? item.active : {}]} 
                ${styles[item.normal]}
                ${isComplateStatus(item) ? styles["set-progress-complate"] : ""}
              `}
              key={item.value}
            >
              {isComplateStatus(item) ? (
                <span
                  className={`${styles["iconfont-tips"]} ${styles["icon-gou1-copy"]}`}
                ></span>
              ) : (
                <span>{item.label}</span>
              )}
            </div>
          );
        })}
      </div>
      {active === "step1" && <UploadFile />}
      {active === "step2" && <UploadList />}
      {active === "step3" && <UploadResult />}
    </div>
  );
}
