import React, { act, useState } from "react";
import { useDispatch } from "react-redux";
import { isTrue } from "../../../../../utils";
import styles from "./index.module.css";
import UploadFile from "./UploadFile";
import UploadList from "./UploadList";
import UploadResult from "./UploadResult";
import { message } from "antd";
import { setSelectedList } from "../../../../../store/examinationPaperStore";

const SET_PROGRESS = [
  {
    label: "1",
    value: "step1",
    progress: true,
    normal: "set-progress",
    active: "set-progress-active",
    complate: false,
  },
  {
    label: "line",
    value: "step1",
    progress: false,
    normal: "set-progress-line",
    active: "set-progress-line-active",
    complate: false,
  },
  {
    label: "2",
    value: "step2",
    progress: false,
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
  const [active, setActive] = useState<string>("step1");
  const [progress, setProgress] = useState<any[]>(SET_PROGRESS);
  const [importData, setImportData] = useState<{
    success: boolean;
    totalCount: number;
    validCount: number;
    wraingCount: number;
    errorCount: number;
    data: any[];
  } | null>(null);
  const dispatch = useDispatch();

  const renderSetProgress1 = () => {};

  const isComplateStatus = (item: any) => {
    if (isTrue(item.complate)) {
      return true;
    }
    return false;
  };

  const onChange = (res: any) => {
    console.log("=======", res);
    setActive("step2");
    // setImportList(data);

    const progressList = SET_PROGRESS.map((item) => {
      if (item.value === "step1") {
        item.complate = true;
      }

      if (item.value === "step2") {
        item.progress = true;
      }
      return item;
    });

    setProgress(progressList);
    setImportData(res);

    message.success("解析成功");
  };

  const onReset = (progressName: string) => {
    setActive(progressName);
    setImportData(null);

    const progressList = SET_PROGRESS.map((item) => {
      if (item.value === progressName) {
        item.complate = false;
        item.progress = true;
      }
      return item;
    });

    setProgress(progressList);
  };

  const onImport = () => {
    setActive("step3");

    const progressList = SET_PROGRESS.map((item) => {
      item.progress = true;
      item.complate = true;
      return item;
    });

    dispatch(setSelectedList(importData?.data || []));
    setProgress(progressList);
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
      {active === "step1" && <UploadFile onChange={onChange} />}
      {active === "step2" && (
        <UploadList
          importData={importData}
          onReset={onReset}
          onImport={onImport}
        />
      )}
      {active === "step3" && <UploadResult importData={importData} />}
    </div>
  );
}
