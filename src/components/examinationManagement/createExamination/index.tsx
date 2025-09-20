import React, { useState, useEffect } from "react";
import "./index.less";
import {
  Input,
  Select,
  DatePicker,
  InputNumber,
  Switch,
  Button,
  Modal,
  Card,
  Tag,
  TimePicker,
  message,
  Table,
  Pagination,
} from "antd";
import { DataType } from "../../../interface/examinationsFace";
import CommonModal from "../../common/Modal";
import { CreateExaminationRequest } from "../../../interface/examinationsFace";
import { createExamination } from "../../../actions/examinations";
import CreateClassCard from "./CreateClassCard";
import type { TableColumnsType } from "antd";
import CreateStudentPanel from "./CreateStudentPanel";
import { CreateImportCard } from "./CreateImportCard";
import { useDispatch, useSelector } from "react-redux";
import Loading from "../../common/Loading";
import {
  getExaminationPaperListAction,
  searchClassesAction,
  searchExaminationPaper,
} from "../../../actions/examinationPaper";
import {
  getClasses,
  getExaminationPaperList,
  getStudents,
  initConfig,
  setSelectedList,
} from "../../../store/examinationPaperStore";
import { debounce, isTrue } from "../../../utils";
import EmptyComponent from "../../common/EmptyComponent";
import { getUserByClass, searchUsers } from "../../../actions/users";
const { TextArea } = Input;

// 模拟试卷数据
const mockPapers = [
  {
    id: "1",
    title: "计算机网络期末考试",
    subject: "计算机网络",
    creator: "张老师",
    duration: 120,
    totalScore: 100,
    questionCount: 50,
    difficulty: "中等",
    status: "published",
    createTime: "2024-03-15",
    tags: ["期末考试", "综合测试", "重点考试"],
    description: "涵盖TCP/IP协议、网络分层、路由算法等核心知识点",
  },
  {
    id: "2",
    title: "数据结构章节测试",
    subject: "数据结构",
    creator: "李老师",
    duration: 90,
    totalScore: 80,
    questionCount: 30,
    difficulty: "简单",
    status: "draft",
    createTime: "2024-03-12",
    tags: ["章节测试", "基础题目"],
    description: "测试线性表、栈、队列等基础数据结构",
  },
  {
    id: "3",
    title: "操作系统综合测试",
    subject: "操作系统",
    creator: "王老师",
    duration: 150,
    totalScore: 120,
    questionCount: 60,
    difficulty: "困难",
    status: "published",
    createTime: "2024-03-10",
    tags: ["综合测试", "难度较大"],
    description: "进程管理、内存管理、文件系统全面测试",
  },
  {
    id: "4",
    title: "软件工程项目实践",
    subject: "软件工程",
    creator: "赵老师",
    duration: 180,
    totalScore: 150,
    questionCount: 40,
    difficulty: "中等",
    status: "published",
    createTime: "2024-03-08",
    tags: ["项目实践", "应用题"],
    description: "软件开发流程、需求分析、系统设计实践题目",
  },
];

const columns: TableColumnsType<DataType> = [
  {
    title: "学号",
    dataIndex: "studentId",
    // render: (text: string) => <a>{text}</a>,
  },
  {
    title: "姓名",
    dataIndex: "username",
  },
  {
    title: "班级",
    dataIndex: "department",
  },
  {
    title: "手机号",
    dataIndex: "phone",
  },
  {
    title: "邮箱",
    dataIndex: "email",
  },
];

const data: DataType[] = [
  {
    key: "1",
    studentId: "20240001",
    username: "张三",
    department: "计算机科学1班",
    phone: "13800138001",
    email: "zhangsan@example.com",
    address: "北京市海淀区",
  },
  {
    key: "2",
    studentId: "20240002",
    username: "李四",
    department: "计算机科学2班",
    phone: "13800138002",
    email: "lisi@example.com",
    address: "北京市朝阳区",
  },
  {
    key: "3",
    studentId: "20240003",
    username: "王五",
    department: "软件工程1班",
    phone: "13800138003",
    email: "wangwu@example.com",
    address: "北京市西城区",
  },
  {
    key: "4",
    studentId: "20240004",
    username: "赵六",
    department: "软件工程2班",
    phone: "13800138004",
    email: "zhaoliu@example.com",
    address: "北京市东城区",
  },
  {
    key: "5",
    studentId: "20240005",
    username: "钱七",
    department: "网络工程1班",
    phone: "13800138005",
    email: "qianqi@example.com",
    address: "北京市丰台区",
  },
  {
    key: "6",
    studentId: "20240005",
    username: "钱七",
    department: "网络工程1班",
    phone: "13800138005",
    email: "qianqi@example.com",
    address: "北京市丰台区",
  },
  {
    key: "7",
    studentId: "20240005",
    username: "钱七",
    department: "网络工程1班",
    phone: "13800138005",
    email: "qianqi@example.com",
    address: "北京市丰台区",
  },
];

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
    examDate: null,
    startTime: null,
    endTime: null,
    duration: "",
    lateLimit: "30",
    earlySubmit: "30",
    supervisor: "",
    cameraEnabled: true,
    screenRecord: true,
    preventSwitch: true,
    preventCopy: true,
    randomQuestion: false,
    randomOption: false,
  });
  const dispatch = useDispatch();
  const { examPaperList, totalCount, classes, students, page, classMenu, selectedList } =
    useSelector((state: any) => state.examinationPaper);
  console.log("examPaperList selectedList ======> ", selectedList);

  useEffect(() => {
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
      subject: paper.subject,
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
      if (!examForm.subject) {
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

      // 构建请求参数
      const requestData: CreateExaminationRequest = {
        // 基本信息
        examName: examForm.examName,
        subject: examForm.subject,
        examType: examForm.examType || "期末考试",
        paperId: examForm.paperId,
        description: examForm.description,

        // 时间信息
        examDate: examForm.examDate, // moment对象需要转换为字符串
        startTime: examForm.startTime, // moment对象需要转换为字符串
        endTime: examForm.endTime, // moment对象需要转换为字符串
        duration: examForm.duration,

        // 限制设置
        lateLimit: examForm.lateLimit,
        earlySubmit: examForm.earlySubmit,

        // 监考设置
        supervisor: examForm.supervisor,
        cameraEnabled: examForm.cameraEnabled,
        screenRecord: examForm.screenRecord,
        preventSwitch: examForm.preventSwitch,
        preventCopy: examForm.preventCopy,
        randomQuestion: examForm.randomQuestion,
        randomOption: examForm.randomOption,

        // 参与人员 (如果已选择)
        // studentIds: selectedStudents?.map((s: any) => s.id) || [],
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
        {examPaperList.length === 0 && (
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
        <div className="selected-total-panel">已选择: 考生 0 人，班级 0 个</div>
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
    console.log("选择日期：", value, mode);
  };

  const chooiceExamStartTime = (value: any, dateString: string | string[]) => {
    console.log("选择开始时间：", value, dateString);
  };

  const chooiceExamEndTime = (value: any, dateString: string | string[]) => {
    console.log("选择结束时间：", value, dateString);
  };

  const renderExamStudentList = () => {
    return (
      <div className="create-examination-student-list">
        <div className="create-examination-student-item">
          <div className="create-student-avatar">头像</div>
          <div className="create-student-info">
            <div className="create-student-name">姓名</div>
            <div className="create-student-detail">20021 · 计算机科学1班</div>
          </div>
        </div>
        <div>
          <div>操作</div>
        </div>
      </div>
    );
  };

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
              onChange={(value) =>
                setExamForm((prev) => ({ ...prev, subject: value }))
              }
              style={{ width: "100%", height: "34px", marginTop: "10px" }}
              options={[
                { label: "计算机网络", value: "计算机网络" },
                { label: "数据结构", value: "数据结构" },
                { label: "操作系统", value: "操作系统" },
                { label: "软件工程", value: "软件工程" },
                { label: "数据库", value: "数据库" },
                { label: "算法设计", value: "算法设计" },
              ]}
            />
          </div>
          <div className="create-examination-form-item">
            <div className="create-examination-form-item-title">
              <h4>考试类型</h4>
            </div>
            <Select
              placeholder="请选择考试类型"
              style={{ width: "100%", height: "34px", marginTop: "10px" }}
              options={[
                {
                  label: "期末考试",
                  value: "Final",
                },
                {
                  label: "期中考试",
                  value: "Midterm",
                },
                {
                  label: "章节测试",
                  value: "Quiz",
                },
                {
                  label: "补考",
                  value: "Makeup",
                },
                {
                  label: "模拟考试",
                  value: "Practice",
                },
              ]}
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
          <div className="participants-list">
            {/* <div
              style={{ padding: "40px", textAlign: "center", color: "#8c8c8c" }}
            >
              <span
                className="iconfont icon-user-plus-copy"
                style={{
                  fontSize: "48px",
                  marginBottom: "16px",
                  opacity: "0.5",
                }}
              ></span>
              <p>还没有添加考生，点击上方按钮添加</p>
            </div> */}
            {renderExamStudentList()}
          </div>
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
              defaultValue={["30"]}
              placeholder="请选择监考老师"
              options={[
                { label: "张三", value: "1" },
                { label: "李四", value: "2" },
                { label: "王五", value: "3" },
              ]}
              style={{ width: "259px", height: "34px", marginTop: "10px" }}
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
