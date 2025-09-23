import React, { useState, useEffect } from "react";
import "./index.less";
import {
  Input,
  Select,
  DatePicker,
  Switch,
  Button,
  Modal,
  Card,
  Tag,
  TimePicker,
  message,
  Pagination,
} from "antd";
import CommonModal from "../../../common/Modal";
import { CreateExaminationRequest } from "../../../../interface/examinationsFace";
import {
  createExamination,
  getExaminationResourcesAction,
} from "../../../../actions/examinations";
import CreateClassCard from "./CreateClassCard";
import CreateStudentPanel from "./CreateStudentPanel";
import { CreateImportCard } from "./CreateImportCard";
import { useDispatch, useSelector } from "react-redux";
import {
  getExaminationPaperListAction,
  searchClassesAction,
  searchExaminationPaper,
} from "../../../../actions/examinationPaper";
import {
  getClasses,
  getExaminationPaperList,
  getStudents,
  initConfig,
  setSelectedList,
} from "../../../../store/examinationPaperStore";
import { debounce, isTrue } from "../../../../utils";
import EmptyComponent from "../../../common/EmptyComponent";
import { searchUsers } from "../../../../actions/users";
import { setExamResources } from "../../../../store/examinationStore";
const { TextArea } = Input;

function CreateExamination() {
  // 状态管理
  const [selectedPaper, setSelectedPaper] = useState<any>(null);
  const [paperModalVisible, setPaperModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState("individual");
  const [examForm, setExamForm] = useState({
    examName: "",
    subject: "",
    examType: "",
    paperId: "",
    description: "",
    examDate: "",
    startTime: "",
    endTime: "",
    duration: "",
    lateLimit: "30",
    earlySubmit: "30",
    supervisor: "",
    subjectId: null,
    subjectCode: "",
    cameraEnabled: true,
    screenRecord: true,
    preventSwitch: true,
    preventCopy: true,
    randomQuestion: false,
    randomOption: false,
  });
  const [paperLoading, setPaperLoading] = useState(false);
  const dispatch = useDispatch();
  const { examPaperList, totalCount, page, classMenu, selectedList } =
    useSelector((state: any) => state.examinationPaper);
  const { resources } = useSelector((state: any) => state.examination);
  console.log("examPaperList selectedList ======> ", resources, selectedList);

  useEffect(() => {
    setPaperLoading(true);
    if (isTrue(paperModalVisible)) {
      fetchPaperList();
    }
  }, [paperModalVisible]);

  useEffect(() => {
    setLoading(true);
    if (isTrue(visible)) {
      fetchClasses();
      fetchStudentUsers({ role: "student" });
    }
  }, [visible]);

  useEffect(() => {
    getExaminationResourcesAction().then((res: any) => {
      dispatch(setExamResources(res));
      console.log("获取考试资源", res);
    });
  }, []);

  const fetchClasses = (params?: any) => {
    searchClassesAction(params)
      .then((res: any) => {
        if (res) {
          console.log(
            "fetch class",
            res?.data?.map((item: any) => ({
              label: item.class_name,
              value: item.class_name,
            }))
          );
          dispatch(
            initConfig(
              res?.data?.map((item: any) => ({
                label: item.class_name,
                value: item.class_name,
              }))
            )
          );
          dispatch(getClasses(res));
        } else {
          dispatch(getClasses({ data: [] }));
        }
      })
      .catch((error) => {
        console.error("获取班级数据失败:", error);
        dispatch(getClasses({ data: [] }));
      });
  };

  const handleStudentSelect = (selectedStudents: any[]) => {
    dispatch(setSelectedList(selectedStudents));
  };

  const fetchStudentUsers = (params?: {
    role?: string;
    className?: string;
    keyword?: string;
  }) => {
    searchUsers(params)
      .then((res: any) => {
        if (res) {
          dispatch(getStudents(res));
        } else {
          dispatch(getStudents({ data: [] }));
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("获取学生数据失败:", error);
        dispatch(getStudents({ data: [] }));
        setLoading(false);
      });
  };

  const fetchPaperList = (params?: { page?: number; pageSize?: number }) => {
    const { page, pageSize } = params || { page: 1, pageSize: 10 };
    getExaminationPaperListAction({ page, pageSize }).then((res: any) => {
      dispatch(getExaminationPaperList(res));
      setPaperLoading(false);
    });
  };

  function importStudents(): void {
    throw new Error("Function not implemented.");
  }

  function addStudents(): void {
    setVisible(true);
  }

  function onchangeCameraSetting(
    checked: boolean,
    event:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.KeyboardEvent<HTMLButtonElement>
  ): void {
    throw new Error("Function not implemented.");
  }

  // 选择试卷
  const selectPaper = (paper: any) => {
    setSelectedPaper(paper);
    console.log("选择了试卷：", paper);
    setExamForm((prev) => ({
      ...prev,
      paperId: paper.id,
      duration: paper.duration.toString(),
    }));
    setPaperModalVisible(false);
  };

  // 打开试卷选择模态框
  const openPaperModal = () => {
    setPaperModalVisible(true);
  };

  // 在 CreateExamination 组件中的 createExam 函数
  const createExam = async () => {
    try {
      // 表单验证
      if (!examForm.examName.trim()) {
        message.error("请输入考试名称");
        return;
      }
      if (!examForm.subjectId) {
        message.error("请选择考试科目");
        return;
      }
      if (!examForm.paperId) {
        message.error("请选择考试试卷");
        return;
      }
      if (!examForm.examDate || !examForm.startTime || !examForm.endTime) {
        message.error("请完整填写考试时间");
        return;
      }

      const requestData: CreateExaminationRequest = {
        examName: examForm.examName,
        subject: examForm.subject,
        examType: examForm.examType || "期末考试",
        paperId: examForm.paperId,
        description: examForm.description,

        examDate: examForm.examDate,
        startTime: examForm.startTime,
        endTime: examForm.endTime,
        duration: examForm.duration,

        lateLimit: examForm.lateLimit,
        earlySubmit: examForm.earlySubmit,

        supervisor: examForm.supervisor,
        cameraEnabled: examForm.cameraEnabled,
        screenRecord: examForm.screenRecord,
        preventSwitch: examForm.preventSwitch,
        preventCopy: examForm.preventCopy,
        randomQuestion: examForm.randomQuestion,
        randomOption: examForm.randomOption,
        subjectId: examForm.subjectId || 0,
        subjectCode: examForm.subjectCode || "",
        studentIds: selectedList?.map((s: any) => s.studentId) || [],
        // classIds: selectedClasses?.map((c: any) => c.id) || []
      };

      // 调用API
      const result = await createExamination(requestData);

      if (result.success) {
        message.success("考试创建成功！");
        // 跳转到考试列表或详情页
        // navigate(`/examination/${result.data.examId}`);
      }
    } catch (error) {
      console.error("创建考试失败：", error);
      message.error("创建考试失败，请重试");
    }
  };

  const onSearchPaper = debounce((value: any) => {
    searchExaminationPaper({
      page: 1,
      pageSize: 10,
      name: value?.target?.value,
    }).then((res: any) => {
      dispatch(getExaminationPaperList(res));
    });
  }, 300);

  const renderSelectedPaperModal = () => {
    if (!isTrue(paperModalVisible)) {
      return null;
    }

    return (
      <Modal
        title={
          <div style={{ fontSize: "16px", fontWeight: 600 }}>
            <i
              className="fas fa-file-alt"
              style={{ marginRight: "8px", color: "#1890ff" }}
            ></i>
            选择考试试卷
          </div>
        }
        visible={paperModalVisible}
        onCancel={() => setPaperModalVisible(false)}
        footer={null}
        width={800}
        bodyStyle={{ maxHeight: "60vh", overflowY: "auto" }}
      >
        <div style={{ marginBottom: "16px" }}>
          <Input
            placeholder="搜索试卷名称、科目或创建者..."
            style={{ marginBottom: "16px" }}
            allowClear
            onChange={(value: any) => onSearchPaper(value)}
          />
          <div style={{ fontSize: "14px", color: "#666" }}>
            共找到 {totalCount} 份试卷，请选择一份作为考试试卷：
          </div>
        </div>
        <div
          className="paper-list-wrapper"
          style={{ maxHeight: "400px", overflowY: "auto" }}
        >
          {renderPaperCard(examPaperList)}
        </div>
        Loading
        {!examPaperList.length && (
          <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
            <i
              className="fas fa-inbox"
              style={{
                fontSize: "48px",
                marginBottom: "16px",
                display: "block",
              }}
            ></i>
            <p>暂无可用试卷</p>
            <Button type="primary" onClick={() => setPaperModalVisible(false)}>
              去创建试卷
            </Button>
          </div>
        )}
        <div className="d-l-c j-f-e">
          <Pagination
            total={totalCount}
            pageSize={10}
            current={page}
            onChange={(page, pageSize) => {
              fetchPaperList({ page, pageSize });
            }}
          />
        </div>
      </Modal>
    );
  };

  const handleSelectedTab = (tab: string) => {
    setSelectedTab(tab);
  };

  const handleSelectedStudent = () => {
    onStudentClose();
  };

  const handleSelectedStudentCancel = () => {
    onStudentClose();
  };

  const onStudentClose = () => {
    setVisible(false);
  };

  const onSearchByClasses = (value: string) => {
    initSeachStatus();

    if (selectedTab === "class") {
      fetchClasses({
        keyword: value,
      });
      return;
    }

    fetchStudentUsers({
      className: value,
      role: "student",
    });
  };

  const onSearch = debounce((item: any) => {
    initSeachStatus();

    if (selectedTab === "class") {
      fetchClasses({
        keyword: item.target.value,
      });
      return;
    }

    fetchStudentUsers({
      keyword: item.target.value,
      role: "student",
    });
  }, 1000);

  const initSeachStatus = () => {
    setLoading(true);
    dispatch(getStudents({ data: [] }));
  };

  const renderSelectedPaperCardModal = () => {
    return (
      <CommonModal
        visible={visible}
        onClose={onStudentClose}
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <i
              className="fas fa-user-plus"
              style={{ marginRight: "12px", color: "#1890ff" }}
            ></i>
            添加考试参与人员
          </div>
        }
        footer={
          <div className=" m-t-20">
            <div></div>
            <div>
              <span
                className="cancel-btn"
                onClick={handleSelectedStudentCancel}
              >
                取消
              </span>
              <span className="confirm-btn" onClick={handleSelectedStudent}>
                确定
              </span>
            </div>
          </div>
        }
        style={{
          width: "1200px",
          height: "600px", // 添加固定高度
          padding: 0,
          overflow: "hidden",
        }}
      >
        <div className="d-l-c pos-f">
          {[
            {
              label: "逐个添加考生",
              value: "individual",
            },
            {
              label: "按班级添加",
              value: "class",
            },
            {
              label: "批量导入",
              value: "batch",
            },
          ].map((item) => (
            <div
              className={`modal-menu-item ${
                selectedTab === item.value ? "modal-menu-item-active" : ""
              }`}
              key={item.value}
              onClick={() => handleSelectedTab(item.value)}
            >
              <span>{item.label}</span>
            </div>
          ))}
        </div>
        {selectedTab === "batch" ? null : (
          <div className="search-panel d-l-c pos-f pos-f-56 m-t-20 d-l-s-b">
            <Input
              style={{
                width: "944px",
                height: "44px",
                marginLeft: "3px",
              }}
              placeholder="搜索学号、姓名或者班级"
              onChange={(value: any) => onSearch(value)}
            />
            <Select
              // mode="tags"
              style={{ width: "200px", height: "44px" }}
              placeholder="选择班级"
              onChange={(value: string) => onSearchByClasses(value)}
              options={classMenu}
            />
          </div>
        )}

        <div className="m-t-20">
          {selectedTab === "individual" && (
            <CreateStudentPanel
              loading={loading}
              onStudentSelect={handleStudentSelect}
            />
          )}
          {selectedTab === "class" && <CreateClassCard />}
          {selectedTab === "batch" && <CreateImportCard />}
        </div>
        <div className="selected-total-panel">
          已选择: 考生 {selectedList.length} 人，班级 0 个
        </div>
      </CommonModal>
    );
  };

  const onChooicePaper = (paper: any) => {
    console.log("选择了试卷：", paper);
  };

  // 渲染试卷卡片
  const renderPaperCard = (examPaperList: any[]) => {
    if (!examPaperList || !examPaperList.length) {
      return <EmptyComponent />;
    }

    return examPaperList.map((paper: any) => (
      <Card
        key={paper.id}
        className="paper-selection-card"
        hoverable
        onClick={() => selectPaper(paper)}
        style={{ marginBottom: 16 }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div style={{ flex: 1 }}>
            <h4
              style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: 600 }}
            >
              {paper.title}
            </h4>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                marginBottom: "8px",
              }}
            >
              <span>
                <i
                  className="fas fa-book"
                  style={{ marginRight: "4px", color: "#1890ff" }}
                ></i>
                {paper.subjectName}
              </span>
              <span>
                <i
                  className="fas fa-user"
                  style={{ marginRight: "4px", color: "#52c41a" }}
                ></i>
                {paper.creatorName || ""}
              </span>
              <span>
                <i
                  className="fas fa-clock"
                  style={{ marginRight: "4px", color: "#fa8c16" }}
                ></i>
                {paper.duration}分钟
              </span>
              <span>
                <i
                  className="fas fa-star"
                  style={{ marginRight: "4px", color: "#fadb14" }}
                ></i>
                {paper.total_score}分
              </span>
              <span>
                <i
                  className="fas fa-list"
                  style={{ marginRight: "4px", color: "#722ed1" }}
                ></i>
                {paper.question_count}题
              </span>
            </div>
            <p style={{ margin: "8px 0", color: "#666", fontSize: "13px" }}>
              {paper.description}
            </p>
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
              {paper?.tags?.map((tag: string, index: number) => (
                <Tag key={index}>{tag}</Tag>
              ))}
              <Tag
                color={
                  paper.difficulty === "困难"
                    ? "red"
                    : paper.difficulty === "中等"
                    ? "orange"
                    : "green"
                }
              >
                {paper.difficulty}
              </Tag>
              <Tag color={paper.status === "published" ? "blue" : "default"}>
                {paper.status === "published" ? "已发布" : "草稿"}
              </Tag>
            </div>
          </div>
          <Button type="primary" size="small">
            选择此试卷
          </Button>
        </div>
      </Card>
    ));
  };

  const chooiceExamDate = (value: any, mode: string | string[]) => {
    const timeString = Array.isArray(mode) ? mode[0] : mode;
    console.log("选择日期：", value, mode);
    setExamForm({
      ...examForm,
      examDate: timeString,
    });
  };

  const chooiceExamStartTime = (value: any, dateString: string | string[]) => {
    const timeString = Array.isArray(dateString) ? dateString[0] : dateString;
    console.log("选择开始时间：", value, timeString);
    setExamForm({
      ...examForm,
      startTime: timeString,
    });
  };

  const chooiceExamEndTime = (value: any, dateString: string | string[]) => {
    const timeString = Array.isArray(dateString) ? dateString[0] : dateString;
    console.log("选择结束时间：", value, timeString);
    setExamForm({
      ...examForm,
      endTime: timeString,
    });
  };

  const handleDeleteStudent = (student: any) => {
    console.log(`删除id为${student.studentId}的考生信息`);
    const result = selectedList.filter((item: any) => item.studentId !== student.studentId);
    dispatch(setSelectedList(result));
  };

  const renderExamStudentList = () => {
    if (!selectedList || !selectedList.length) {
      return (
        <div style={{ padding: "40px", textAlign: "center", color: "#8c8c8c" }}>
          <span
            className="iconfont icon-user-plus-copy"
            style={{
              fontSize: "48px",
              marginBottom: "16px",
              opacity: "0.5",
            }}
          ></span>
          <p>还没有添加考生，点击上方按钮添加</p>
        </div>
      );
    }

    return selectedList.map((item: any) => {
      return (
        <div className="create-examination-student-list">
          <div className="create-examination-student-item">
            {item.avatar ? (
              <div className="create-student-avatar">{item.avatar}</div>
            ) : (
              <span className="createStudent icon-bianzubeifen3"></span>
            )}
            <div className="create-student-info">
              <div className="create-student-name">{item.username}</div>
              <div className="create-student-detail">
                {item.grade} · {item.className}
              </div>
            </div>
          </div>
          <div onClick={() => handleDeleteStudent(item)}>
            <span className="createStudent icon-guanbi close-icon"></span>
          </div>
        </div>
      );
    });
  };

  const teachers = resources?.teachers?.map(
    (supervisor: { realName: string; username: string }) => ({
      label: supervisor.realName,
      value: supervisor.username,
    })
  );

  return (
    <div className="create-examination-container">
      <div className="create-examination-form">
        <div className="create-examination-form-section">
          <div className="create-examination-form-section-title">
            <h3>考试基本信息</h3>
          </div>
          {/* <Input placeholder="请输入考试名称" style={{ width: "100%" }} /> */}
        </div>
        <div className="create-examination-grid">
          <div className="create-examination-form-item">
            <div className="create-examination-form-item-title">
              <h4>考试名称</h4>
            </div>
            <Input
              placeholder="请输入考试名称"
              value={examForm.examName}
              onChange={(e) =>
                setExamForm((prev) => ({ ...prev, examName: e.target.value }))
              }
              style={{ width: "100%", height: "34px", marginTop: "10px" }}
            />
          </div>
          <div className="create-examination-form-item">
            <div className="create-examination-form-item-title">
              <h4>考试科目</h4>
            </div>
            <Select
              placeholder="请选择考试科目"
              value={examForm.subject || undefined}
              onChange={(value, option: any) => {
                setExamForm((prev) => ({
                  ...prev,
                  subjectId: option?.value,
                  subjectCode: option?.code,
                }));
              }}
              style={{ width: "100%", height: "34px", marginTop: "10px" }}
              options={resources?.subjects?.map(
                (sub: {
                  name: string;
                  id: number;
                  code: string;
                }): { label: string; value: number; code: string } => ({
                  label: sub.name,
                  value: sub.id,
                  code: sub.code,
                })
              )}
            />
          </div>
          <div className="create-examination-form-item">
            <div className="create-examination-form-item-title">
              <h4>考试类型</h4>
            </div>
            <Select
              placeholder="请选择考试类型"
              style={{ width: "100%", height: "34px", marginTop: "10px" }}
              onChange={(value) => {
                setExamForm({
                  ...examForm,
                  examType: value,
                });
              }}
              options={resources?.examTypes?.map(
                (exam: {
                  name: string;
                  type: string;
                }): { label: string; value: string } => ({
                  label: exam.name,
                  value: exam.type,
                })
              )}
            />
          </div>
        </div>
        <div className="create-examination-grid">
          <div className="create-examination-form-textArea m-t-20">
            <div className="create-examination-form-item-title">
              <h4>考试说明</h4>
            </div>
            <TextArea
              placeholder="请输入考试说明"
              style={{ width: "100%", height: "80px", marginTop: "10px" }}
              onChange={(item) => {
                setExamForm({
                  ...examForm,
                  description: item.target.value,
                });
              }}
            />
          </div>
        </div>
        {/* <div className="create-examination-grid"> */}

        <div className="create-examination-form-item m-t-20">
          <div className="create-examination-form-item-title d-l-c">
            <h4 className="w-fit-content d-l-c">
              关联试卷{" "}
              <span style={{ color: "#ff4d4f", width: "fit-content" }}>*</span>
            </h4>
          </div>
          <div style={{ marginTop: "10px", width: "100%" }}>
            {selectedPaper ? (
              <div
                className="selected-paper-info"
                style={{
                  border: "2px solid #52c41a",
                  borderRadius: "6px",
                  padding: "12px",
                  background: "#f6ffed",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <h4 style={{ margin: "0 0 4px 0", color: "#389e0d" }}>
                      ✓ {selectedPaper.title}
                    </h4>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      <span>{selectedPaper.subjectName} | </span>
                      <span>{selectedPaper.creatorName} | </span>
                      <span>{selectedPaper.duration}分钟 | </span>
                      <span>{selectedPaper.totalScore}分 | </span>
                      <span>{selectedPaper.questionCount}题</span>
                    </div>
                  </div>
                  <Button
                    type="link"
                    size="small"
                    onClick={openPaperModal}
                    style={{ color: "#1890ff" }}
                  >
                    更换试卷
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="dashed"
                onClick={openPaperModal}
                style={{
                  width: "100%",
                  height: "80px",
                  borderStyle: "dashed",
                  borderColor: "#d9d9d9",
                }}
              >
                <div>
                  <i
                    className="fas fa-plus"
                    style={{
                      fontSize: "18px",
                      marginBottom: "8px",
                      display: "block",
                      color: "#1890ff",
                    }}
                  ></i>
                  <span>点击选择试卷</span>
                </div>
              </Button>
            )}
          </div>
        </div>
        {/* </div> */}
        <div className="create-examination-form-section m-t-20">
          <div className="create-examination-form-section-title">
            <h3>时间安排</h3>
          </div>
        </div>
        <div className="create-examination-grid">
          <div className="create-examination-form-item">
            <div className="create-examination-form-item-title">
              <h4>考试日期</h4>
            </div>
            <DatePicker
              onChange={(value, dateString) =>
                chooiceExamDate(value, dateString)
              }
              style={{ width: "100%", height: "34px", marginTop: "10px" }}
            />
          </div>
          <div className="create-examination-form-item">
            <div className="create-examination-form-item-title">
              <h4>开始时间</h4>
            </div>
            <TimePicker
              format={"HH:mm"}
              onChange={(value, dateString) =>
                chooiceExamStartTime(value, dateString)
              }
              style={{ width: "100%", height: "34px", marginTop: "10px" }}
            />
          </div>
          <div className="create-examination-form-item">
            <div className="create-examination-form-item-title">
              <h4>结束时间</h4>
            </div>
            <TimePicker
              format={"HH:mm"}
              onChange={(value, dateString) =>
                chooiceExamEndTime(value, dateString)
              }
              style={{ width: "100%", height: "34px", marginTop: "10px" }}
            />
          </div>
          <div className="create-examination-form-item">
            <div className="create-examination-form-item-title">
              <h4>考试时长（分钟）</h4>
            </div>
            <Input
              type="text"
              placeholder="请输入考试时长(分钟)"
              value={examForm.duration}
              onChange={(e) =>
                setExamForm((prev) => ({ ...prev, duration: e.target.value }))
              }
              style={{ width: "100%", height: "34px", marginTop: "10px" }}
            />
          </div>
        </div>

        <div className="create-examination-grid m-t-20">
          <div
            className="create-examination-form-item"
            style={{ width: "259px" }}
          >
            <div className="create-examination-form-item-title">
              <h4>迟到限制</h4>
            </div>
            <Select
              defaultValue={["30"]}
              placeholder="请选择迟到限制时间"
              options={[
                { label: "开考30分钟内可入场", value: "30" },
                { label: "开考15分钟内可入场", value: "15" },
                { label: "开考后不允许入场", value: "0" },
              ]}
              style={{ width: "259px", height: "34px", marginTop: "10px" }}
              onChange={(value) => {
                setExamForm({
                  ...examForm,
                  lateLimit: Array.isArray(value) ? value[0] : value,
                });
              }}
            />
          </div>
          <div
            className="create-examination-form-item"
            style={{ width: "259px" }}
          >
            <div className="create-examination-form-item-title">
              <h4>提前交卷</h4>
            </div>
            <Select
              defaultValue={["30"]}
              placeholder="请选择提前交卷时间"
              options={[
                { label: "考试结束前30分钟可交卷", value: "30" },
                { label: "考试结束前15分钟可交卷", value: "15" },
                { label: "考试结束前不允许交卷", value: "0" },
              ]}
              style={{ width: "259px", height: "34px", marginTop: "10px" }}
              onChange={(value) => {
                setExamForm({
                  ...examForm,
                  earlySubmit: Array.isArray(value) ? value[0] : value,
                });
              }}
            />
          </div>
        </div>

        <div className="create-examination-form-section m-t-20">
          <div className="create-examination-form-section-title">
            <h3>参与人员</h3>
          </div>
        </div>
        <div className="create-examination-participants">
          <div className="create-examination-participants-header">
            <span>考生名单 (已选择 0 人)</span>
            <div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => importStudents()}
              >
                <i className="fas fa-upload"></i>
                导入名单
              </button>
              <button
                className="btn btn-primary btn-sm m-l-10"
                onClick={() => addStudents()}
              >
                <i className="fas fa-plus"></i>
                添加考生
              </button>
            </div>
          </div>
          <div className="participants-list">{renderExamStudentList()}</div>
        </div>

        <div className="create-examination-grid m-t-20">
          <div
            className="create-examination-form-item"
            style={{ width: "259px" }}
          >
            <div className="create-examination-form-item-title">
              <h4>监考老师</h4>
            </div>
            <Select
              placeholder="请选择监考老师"
              options={teachers}
              style={{ width: "259px", height: "34px", marginTop: "10px" }}
              onChange={(value) => {
                setExamForm({
                  ...examForm,
                  supervisor: Array.isArray(value) ? value[0] : value,
                });
              }}
            />
          </div>
        </div>

        <div className="create-examination-form-section m-t-20">
          <div className="create-examination-form-section-title">
            <h3>监考设置</h3>
          </div>
        </div>
        <div className="create-examination-jiankao-setting">
          <div className="setting-item">
            <span className="setting-item-label">启用摄像头设置</span>
            <Switch defaultChecked onChange={onchangeCameraSetting} />
          </div>
          <div className="setting-item">
            <span className="setting-item-label">启用屏幕录制</span>
            <Switch defaultChecked onChange={onchangeCameraSetting} />
          </div>
          <div className="setting-item">
            <span className="setting-item-label">禁止切换窗口</span>
            <Switch defaultChecked onChange={onchangeCameraSetting} />
          </div>
          <div className="setting-item">
            <span className="setting-item-label">禁止复制粘贴</span>
            <Switch defaultChecked onChange={onchangeCameraSetting} />
          </div>
          <div className="setting-item">
            <span className="setting-item-label">随机题目顺序</span>
            <Switch defaultChecked onChange={onchangeCameraSetting} />
          </div>
          <div className="setting-item">
            <span className="setting-item-label">随机选项顺序</span>
            <Switch defaultChecked onChange={onchangeCameraSetting} />
          </div>
        </div>
      </div>

      {/* 试卷选择模态框 */}
      {renderSelectedPaperModal()}
      {renderSelectedPaperCardModal()}

      <div className="create-examination-buttom d-l-c m-t-20">
        <div className="preview-config p-8-20 ">预览配置</div>
        <div className="create-exam-button d-l-c">
          <div className="save-draft p-8-20 ">保存草稿</div>
          <div className="create-exam p-8-20 " onClick={() => createExam()}>
            创建考试
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateExamination;
