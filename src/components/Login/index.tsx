import React, { useState, useMemo, useCallback } from "react";
import type { FormProps } from "antd";
import { useRoot } from "../../hooks/useRoot";
import { Button, Checkbox, Flex, Form, Input } from "antd";
import { FieldType, Identity } from "../../interface/loginFace";
import "./index.css";
// import { login } from "../../store/loginStore";
import { chooiceIdentity } from "../../store/loginStore";
import { useDispatch, useSelector } from "react-redux";

const STATUS_TYPE = {
  teacher: "工号",
  student: "学号",
  manager: "管理员ID",
};

function Login(props: any) {
  const { identity, loginInfo } = useSelector((state: any) => state.login);
  const [active, setActive] = useState<string>(loginInfo.identity);
  const dispatch = useDispatch();

  const onFinish: FormProps<FieldType>["onFinish"] = (values: any) => {
    console.log("Success:", values);
  };

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo
  ) => {
    console.log("Failed:", errorInfo);
  };

  const chooseIdentity = useCallback((value: string) => {
    setActive(value);
    dispatch(chooiceIdentity({ identity: value }));
  }, []);

  const resetPassword = useCallback(() => {
    console.log("忘记密码");
  }, []);

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-box-label">
          <h1>系统登录</h1>
          <p>欢迎回来！请登录账户</p>
        </div>
        <div className="role-selector">
          {identity.map((item: Identity) => (
            <div
              className={`role-btn ${active === item.value ? "active" : ""}`}
              key={item.value}
              onClick={() => chooseIdentity(item.value)}
            >
              {item.label}
            </div>
          ))}
        </div>

        <Form
          name="loginForm"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            marginTop: "20px",
          }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item<FieldType>
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input
              placeholder={`请输入${STATUS_TYPE[active as keyof typeof STATUS_TYPE]}`}
              style={{ width: "260px", height: "37px" }}
            />
          </Form.Item>

          <Form.Item<FieldType>
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password
              placeholder="请输入密码"
              style={{ width: "260px", height: "37px" }}
            />
          </Form.Item>

          <div className="remember-forgot-container" id="remember">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>记住密码</Checkbox>
            </Form.Item>
            <div
              className="forgot-password"
              onClick={() => resetPassword()}
            >
              忘记密码 ?
            </div>
          </div>

          <Form.Item>
            <Button
              style={{ width: "260px", padding: "15px 0", marginTop: "25px" }}
              type="primary"
              htmlType="submit"
              size="middle"
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default Login;
