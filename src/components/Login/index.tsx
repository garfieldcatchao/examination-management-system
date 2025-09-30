import React, { useState, useMemo, useCallback } from "react";
import type { FormProps } from "antd";
import { useRoot } from "../../hooks/useRoot";
import { Button, Checkbox, Flex, Form, Input, message } from "antd";
import { FieldType, Identity, LoginResponse } from "../../interface/loginFace";
import "./index.css";
import { onLogin } from "../../actions/users";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { loginSuccess } from "../../store/loginStore";
import { isTrue } from "../../utils";
import { ApiResponse } from "../../server/axios";

const STATUS_TYPE = {
  teacher: "工号",
  student: "学号",
  manager: "管理员ID",
};

function Login(props: any) {
  const { identity, userInfo } = useSelector((state: any) => state.login);
  const [active, setActive] = useState<string>(userInfo?.identity || "teacher");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onFinish: FormProps<FieldType>["onFinish"] = async (values: any) => {
    console.log("Success:", values);
    setLoading(true);
    
    try {
      // 调用登录API
      const response: any = await onLogin({
        ...values,
        role: active
      });
      console.log("response", response);
      if (response && isTrue(response.success)) {
        // 登录成功，更新Redux状态
        dispatch(loginSuccess({
          token: response?.token,
          userInfo: {
            id: response?.userInfo.id,
            username: response?.userInfo.username,     
            identity: response.userInfo.role,
          }
        }));

        message.success('登录成功!');

        // 登录成功后跳转到统一的dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);

      } else {
        message.error(response?.message || '登录失败，请检查账号密码');
      }
    } catch (error) {
      console.error('登录失败:', error);
      message.error('登录失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo
  ) => {
    console.log("Failed:", errorInfo);
    message.error('请填写完整的登录信息');
  };

  const chooseIdentity = useCallback((value: string) => {
    setActive(value);
  }, []);

  const resetPassword = useCallback(() => {
    message.info("密码重置功能开发中...");
  }, []);

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-box-label">
          <h1>系统登录</h1>
          <p>欢迎回来！请登录账户</p>
        </div>
        {/* <div className="role-selector">
          {identity.map((item: Identity) => (
            <div
              className={`role-btn ${active === item.value ? "active" : ""}`}
              key={item.value}
              onClick={() => chooseIdentity(item.value)}
            >
              {item.label}
            </div>
          ))}
        </div> */}

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
            name="studentId"
            rules={[{ required: true, message: "请输入用户名!" }]}
          >
            <Input
              placeholder={`请输入${
                STATUS_TYPE[active as keyof typeof STATUS_TYPE]
              }`}
              style={{ width: "260px", height: "37px" }}
            />
          </Form.Item>

          <Form.Item<FieldType>
            name="password"
            rules={[{ required: true, message: "请输入密码!" }]}
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
            <div className="forgot-password" onClick={() => resetPassword()}>
              忘记密码 ?
            </div>
          </div>

          <Form.Item>
            <Button
              style={{ width: "260px", padding: "15px 0", marginTop: "25px" }}
              type="primary"
              htmlType="submit"
              size="middle"
              loading={loading}
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default Login;
