import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Checkbox } from "antd";
import styles from "./index.module.css";
import EmptyComponent from "../../../common/EmptyComponent";

function CreateClassCard() {
  const { classes } = useSelector((state: any) => state.examinationPaper);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);

  // 处理班级选择
  const handleClassSelect = (classId: string, checked: boolean) => {
    let newSelectedIds;
    if (checked) {
      newSelectedIds = [...selectedClassIds, classId];
    } else {
      newSelectedIds = selectedClassIds.filter((id) => id !== classId);
    }
    setSelectedClassIds(newSelectedIds);
    console.log("选中的班级:", newSelectedIds);
  };

  return (
    <div className={styles["class-card-container"]}>
      {classes && classes.length > 0 ? (
        classes.map((item: any) => {
          const classId = item.id || item.class_id || item.class_name;
          const isSelected = selectedClassIds.includes(classId);

          return (
            <div
              key={classId}
              className={styles["class-card-item"]}
              style={{
                border: isSelected ? "2px solid #1890ff" : "1px solid #d9d9d9",
                backgroundColor: isSelected ? "#f6ffed" : "#fff",
              }}
            >
              <div className={styles["class-card-item-header"]}>
                <span className={styles["class-card-item-title-text"]}>
                  班级名称
                </span>
                <Checkbox
                  checked={isSelected}
                  onChange={(e) => handleClassSelect(classId, e.target.checked)}
                />
              </div>
              <div className={styles["class-card-item-content"]}>
                <span
                  className={`${styles["examination-card"]} ${styles["icon-boshimao-F"]}`}
                ></span>
                <span className={styles["class-card-item-title-label"]}>
                  {item.class_name}
                </span>
              </div>
              <div className={styles["class-card-item-content"]}>
                <span
                  className={`${styles["examination-card"]} ${styles["icon-rili"]}`}
                ></span>
                <span className={styles["class-card-item-title-label"]}>
                  {item.grade}
                </span>
              </div>
              <div className={styles["class-card-item-footer"]}>
                <span className={styles["class-footer-label"]}>学生人数</span>
                <span className={styles["class-footer-value"]}>
                  {item.student_count} 人
                </span>
              </div>
            </div>
          );
        })
      ) : (
        <div style={{ width: "100%",justifyContent:"center", padding: "40px", textAlign: "center", color: "#8c8c8c" }}>
          <EmptyComponent />
        </div>
      )}
    </div>
  );
}

export default CreateClassCard;
