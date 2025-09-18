import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import styles from "./index.module.css";
import { Table, TableColumnsType, TableProps, Spin } from "antd";
import { DataType } from "../../../../interface/examinationsFace";
import EmptyComponent from "../../../common/EmptyComponent";
import { searchUsers } from "../../../../actions/users";
import Loading from "../../../common/Loading";
import { isTrue } from "../../../../utils";
// import { TableRowSelection } from "antd/es/table/interface";

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
    dataIndex: "className",
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

type TableRowSelection<T extends object = object> =
  TableProps<T>["rowSelection"];

interface CreateStudentPanelProps {
  loading?: boolean;
  onStudentSelect?: (selectedStudents: DataType[]) => void;
}

function CreateStudentPanel(props: CreateStudentPanelProps) {
  const { students = [] } = useSelector((state: any) => state.examinationPaper);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const { loading } = props;
  // const [loading, setLoading] = useState(false);
  // useEffect(() => {
  //   searchUsers({
  //     role: "student",
  //   }).then((res) => {
  //     console.log(" all students ======> ", students);
  //   });
  // }, [students]);

  // 处理数据源，保持表格结构稳定
  const tableDataSource = useMemo(() => {
    if (!students || !students.length) {
      return []; // 返回空数组而不是null
    }

    return students.map(
      (item: {
        id: string;
        studentId: string;
        username: string;
        className: string;
        phone: string;
        email: string;
      }) => ({
        key: item.id,
        studentId: item.studentId,
        username: item.username,
        className: item.className,
        phone: item.phone,
        email: item.email,
      })
    );
  }, [students]);

  const handleSelect = (newSelectedRowKeys: React.Key[], selectedRows: DataType[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
    console.log(" newSelectedRowKeys ======> ", newSelectedRowKeys);
    console.log(" selectedRows (完整数据) ======> ", selectedRows);
    
    // 这里可以将完整的学生数据传递给父组件
    if (props.onStudentSelect) {
      props.onStudentSelect(selectedRows);
    }
  };

  const rowSelection: TableRowSelection<DataType> = {
    selectedRowKeys,
    onChange: handleSelect,
    type: "checkbox",
  };

  const customEmptyText = () => {
    if (isTrue(loading)) {
      return (
        <div style={{ padding: "20px" }}>
          <Spin size="large" />
          <div style={{ marginTop: "12px", color: "#666" }}>搜索中...</div>
        </div>
      );
    }

    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#8c8c8c" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.5 }}>
          👥
        </div>
        <p>暂无学生数据</p>
      </div>
    );
  };

  return (
    <div
      className={styles["individual-container"]}
      style={{ minHeight: "400px" }}
    >
      <Table<DataType>
        loading={isTrue(loading)}
        rowSelection={rowSelection}
        columns={columns}
        dataSource={tableDataSource}
        scroll={{ y: 55 * 5 }}
        sticky={{ offsetHeader: 100 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          showQuickJumper: false,
        }}
        locale={{
          emptyText: customEmptyText(),
        }}
        style={{
          height: 300,
        }}
      />

      <div className={styles["selected-student-panel"]}>
        共 {tableDataSource.length} 名学生，已选择 {selectedRowKeys.length} 人
      </div>
    </div>
  );
}

export default CreateStudentPanel;
