import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  initExaminationList,
  updateExaminationList,
} from "../../../store/examinationStore";
import EmptyComponent from "../../common/EmptyComponent";
import {
  initExaminationListAction,
  fetchExaminationListAction,
} from "../../../actions/examinations";
import {
  formatDateTime,
  checkTimePeriod,
  calculateTimeProgress,
} from "../../../utils";
import { ExaminationBtns } from "../../../interface/examinationsFace";
import "./index.css";
import { Pagination, Spin } from "antd";
import { scrollToTop } from "../../../utils";

const EXAMINATION_BTN_MAP: ExaminationBtns = {
  draft: [
    {
      label: "继续编辑",
      icon: "icon-bianji-copy1",
      active: {
        backgroundColor: "#1890ff",
        color: "#fff",
        border: "1px solid transparent",
      },
    },
    {
      label: "复制",
      icon: "icon-fuzhi-copy",
      normal: {
        backgroundColor: "#fff",
        color: "#595959",
        border: "1px solid #d9d9d9",
      },
    },
    {
      label: "预览",
      icon: "icon-yulan-copy",
      normal: {
        backgroundColor: "#fff",
        color: "#595959",
        border: "1px solid #d9d9d9",
      },
    },
    {
      label: "删除",
      icon: "icon-shanchu-copy",
      active: {
        backgroundColor: "#ff4d4f",
        color: "#fff",
        border: "1px solid transparent",
      },
    },
  ],
  scheduled: [
    {
      label: "开始考试",
      icon: "icon-kaishi1-copy",
      active: {
        backgroundColor: "#1890ff",
        color: "#fff",
        border: "1px solid transparent",
      },
    },
    {
      label: "编辑",
      icon: "icon-bianji-copy-h",
      normal: {
        backgroundColor: "#ffffff",
        color: "#595959",
        border: "1px solid #d9d9d9",
      },
    },
    {
      label: "预览",
      icon: "icon-yulan-copy",
      normal: {
        backgroundColor: "#ffffff",
        color: "#595959",
        border: "1px solid #d9d9d9",
      },
    },
    {
      label: "通知",
      icon: "icon-tongzhi-copy",
      normal: {
        backgroundColor: "#ffffff",
        color: "#595959",
        border: "1px solid #d9d9d9",
      },
    },
  ],
  ongoing: [
    {
      label: "实时监控",
      icon: "icon-shishijiankong-copy",
      active: {
        backgroundColor: "#fa8c16",
        color: "#fff",
        border: "1px solid transparent",
      },
    },
    {
      label: "设置",
      icon: "icon-bianji",
      // icon: "icon-shezhi-copy",
      normal: {
        backgroundColor: "#fff",
        color: "#595959",
        border: "1px solid #d9d9d9",
      },
    },
    {
      label: "结束考试",
      icon: "icon-jieshu-copy",
      active: {
        backgroundColor: "#ff4d4f",
        color: "#fff",
        border: "1px solid transparent",
      },
    },
  ],
  completed: [
    {
      label: "阅卷",
      icon: "icon-yuejuan-copy",
      active: {
        backgroundColor: "#1890ff",
        color: "#fff",
        border: "1px solid transparent",
      },
    },
    {
      label: "报告",
      icon: "icon-baogao-copy",
      normal: {
        backgroundColor: "#ffffff",
        color: "#595959",
        border: "1px solid #d9d9d9",
      },
    },
    {
      label: "导出",
      icon: "icon-daochu-copy",
      normal: {
        backgroundColor: "#ffffff",
        color: "#595959",
        border: "1px solid #d9d9d9",
      },
    },
  ],
  cancelled: [
    {
      label: "重新安排",
      icon: "icon-reanpai-copy",
      normal: {
        backgroundColor: "#ffffff",
        color: "#595959",
        border: "1px solid #d9d9d9",
      },
    },
    {
      label: "删除",
      icon: "icon-shanchu",
      active: {
        backgroundColor: "#ff4d4f",
        color: "#fff",
        border: "1px solid transparent",
      },
    },
  ],
};

function ExaminationList() {
  const [loading, setLoading] = useState(false);
  const { examinationList, totalCount } = useSelector(
    (state: any) => state.examination
  );
  const dispatch = useDispatch();
  console.log("============ examinationList ============", examinationList);
  useEffect(() => {
    // setLoading(true);
    initExaminationListAction().then((res: any) => {
      dispatch(initExaminationList(res));
      setLoading(false);
    });
  }, []);

  const createExam = () => {
    console.log("创建考试");
  };
  const batchOperation = () => {
    console.log("批量操作");
  };
  const exportExams = () => {
    console.log("导出数据");
  };
  const filterExams = () => {
    console.log("筛选");
  };
  const refreshExams = () => {
    console.log("刷新");
  };
  const createToolbar = () => {
    return (
      <div className="examination-toolbar">
        <div className="examination-toolbar-left">
          <button className="btn btn-primary" onClick={() => createExam()}>
            <i className="fas fa-plus"></i>
            <span>创建考试</span>
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => batchOperation()}
          >
            <i className="fas fa-check-square"></i>
            <span>批量操作</span>
          </button>
          <button className="btn btn-secondary" onClick={() => exportExams()}>
            <i className="fas fa-download"></i>
            <span>导出数据</span>
          </button>
        </div>
        <div className="examination-toolbar-right">
          <button className="btn btn-secondary" onClick={() => filterExams()}>
            <i className="fas fa-filter"></i>
            <span>筛选</span>
          </button>
          <button className="btn btn-secondary" onClick={() => refreshExams()}>
            <i className="fas fa-sync-alt"></i>
          </button>
        </div>
      </div>
    );
  };

  const monitorExam = (): void => {
    //   throw new Error("Function not implemented.");
  };
  const examSettings = (): void => {
    //   throw new Error("Function not implemented.");
  };
  const stopExam = (): void => {
    //   throw new Error("Function not implemented.");
  };

  const emptyStatus = () => {
    return <EmptyComponent />;
  };

  const getExamStatus = (item: any) => {
    const status = checkTimePeriod({
      startTime: item.startTime,
      endTime: item.endTime,
      threshold: 15,
    });

    if (status.isApproachingStart) {
      return {
        icon: "status-upcoming",
        label: "即将开始",
        progressLabel: "准备进度",
        info: [
          {
            label: "报名人数",
            value: item.total_participants,
          },
          {
            label: "确认参加",
            value: item.confirmedCount,
          },
          {
            label: "待确认",
            value: item.registeredCount,
          },
        ],
      };
    }

    if (item.status === "cancelled") {
      return {
        icon: "status-cancelled",
        label: "已取消",
        progressLabel: null,
        info: null,
      };
    }

    if (item.status === "completed") {
      return {
        icon: "status-completed",
        label: "已完成",
        progressLabel: "阅卷进度",
        info: [
          {
            label: "参考人数",
            value: item.confirmedCount,
          },
          {
            label: "已阅卷",
            value: item.gradedCount,
          },
          {
            label: "待阅卷",
            value: item.ungradedCount,
          },
        ],
      };
    }

    if (item.status === "ongoing") {
      return {
        icon: "status-ongoing",
        label: "进行中",
        progressLabel: "考试进度",
        info: [
          {
            label: "参考人数",
            value: item.confirmedCount,
          },
          {
            label: "在线人数",
            value: item.onlineCount,
          },
          {
            label: "异常状态",
            value: item.abnormalCount,
          },
        ],
      };
    }

    return {
      icon: "status-draft",
      label: "草稿",
      progressLabel: "完善进度",
      info: [
        {
          label: "预计人数",
          value: item.totalParticipants,
        },
        {
          label: "题目数量",
          value: "--",
        },
        {
          label: "总分",
          value: item.totalScore,
        },
      ],
    };
  };

  const renderExaminationInfo = (item: any) => {
    if (item.status === "cancelled") return null;
    return (
      <div className="examination-list-info">
        <div className="info-item">
          <i className="fas fa-clock"></i>
          <span>
            {formatDateTime(item.startTime, "HH:mm")} -{" "}
            {formatDateTime(item.endTime, "HH:mm")}
          </span>
        </div>
        <div className="info-item">
          <i className="fas fa-calendar"></i>
          <span>{formatDateTime(item.startTime, "YYYY-MM-DD")}</span>
        </div>
        <div className="info-item">
          <i className="fas fa-map-marker-alt"></i>
          <span>{item.location}</span>
        </div>
        <div className="info-item">
          <i className="fas fa-user"></i>
          <span>{item.teacherName}</span>
        </div>
      </div>
    );
  };

  const renderExaminationCancelled = (item: any) => {
    if (item.status !== "cancelled") return null;

    return (
      <div className="examination-list-info">
        <div className="info-item">
          <i className="fas fa-clock"></i>
          <span>
            原定 {formatDateTime(item.startTime, "HH:mm")} -{" "}
            {formatDateTime(item.endTime, "HH:mm")}
          </span>
        </div>
        <div className="info-item">
          <span className="iconfont icon-gantanhao_icon"></span>
          <span>因故取消</span>
        </div>
        <div className="info-item">
          <span className="iconfont icon-gantanhao_icon"></span>
          <span>因故取消</span>
        </div>
      </div>
    );
  };

  const renderExaminationList = () => {
    return (
      <div className="examination-list-grid">
        {examinationList.map((item: any) => {
          const timeProgress = calculateTimeProgress(
            item.startTime,
            item.endTime
          );
          const examStatus = getExamStatus(item);
          return (
            <div className="examination-list-card">
              <div className="examination-list-header">
                <div className="examination-list-title">{item.examName}</div>
                <div className="examination-list-subtitle">
                  {item.subTitle} · {item.subjectName}
                </div>

                <div className={`examination-list-status ${examStatus.icon}`}>
                  {examStatus.label}
                </div>
              </div>
              <div className="examination-list-content">
                {renderExaminationInfo(item)}
                {renderExaminationCancelled(item)}

                <div className="examination-list-progress">
                  <div className="progress-header">
                    <span>{examStatus.progressLabel}</span>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${timeProgress.progress}%` }}
                      ></div>
                    </div>
                    <span>{timeProgress.progress}%</span>
                  </div>
                </div>
                <div className="examination-list-stats">
                  {examStatus.info?.map((info: any) => {
                    return (
                      <div className="stat-item">
                        <div className="stat-value">{info.value}</div>
                        <div className="stat-label">{info.label}</div>
                      </div>
                    );
                  })}
                  {/* <div className="stat-item">
                    <div className="stat-value">{item.total_participants}</div>
                    <div className="stat-label">参考人数</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{item.activeCount}</div>
                    <div className="stat-label">在线人数</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{item.abnormalCount}</div>
                    <div className="stat-label">异常状态</div>
                  </div> */}
                </div>
                <div className="examination-list-actions">
                  {(EXAMINATION_BTN_MAP[item.status as string] || [])?.map(
                    (btn: any) => {
                      return (
                        <button
                          className="btn btn-warning btn-sm"
                          style={{
                            backgroundColor:
                              btn.active?.backgroundColor ||
                              btn.normal?.backgroundColor,
                            border:
                              btn.active?.border ||
                              btn.normal?.border ||
                              "none",
                          }}
                          onClick={() => monitorExam()}
                        >
                          <span
                            className={`examination-list-btn-iconfont ${btn.icon}`}
                          ></span>
                          <span
                            style={{
                              color: btn.active?.color || btn.normal?.color,
                            }}
                          >
                            {btn.label}
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  function onPaginationChange(current: number, size: number): void {
    setLoading(true);
    fetchExaminationListAction(current, size).then((res: any) => {
      dispatch(updateExaminationList(res));
      scrollToTop();
      setLoading(false);
    });
  }

  return (
    <div className="examination-list-tab-content">
      <Spin spinning={loading}>
        {createToolbar()}
        {examinationList.length > 0 ? renderExaminationList() : emptyStatus()}
        <Pagination
          showSizeChanger
          onChange={onPaginationChange}
          defaultCurrent={1}
          defaultPageSize={10}
          total={totalCount}
          style={{ marginTop: "20px" }}
        />
      </Spin>
    </div>
  );
}

export default ExaminationList;
