import { useState } from "react";
import { Button, Divider, Form, Input, Layout, message, Tabs, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "../../components/AppHeader";
import { GoogleLoginButton } from "../../components/GoogleLoginButton";
import { useAuth } from "../../hooks/useAuth";
import * as authApi from "../../api/auth";
import type { AuthRole } from "../../types/auth";

const roleDashboard: Record<AuthRole, string> = {
  applicant: "/applicant/dashboard",
  admin: "/admin/dashboard",
  staff: "/staff/dashboard",
  qa: "/qa/dashboard",
  guest: "/",
};

const { Content } = Layout;
const { Title, Text } = Typography;

type LoginFormValues = {
  usernameOrEmail: string;
  password: string;
};

type RegisterFormValues = {
  username: string;
  email: string;
  password: string;
};

export function AuthPage() {
  const [loginForm] = Form.useForm<LoginFormValues>();
  const [registerForm] = Form.useForm<RegisterFormValues>();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const onLoginFinish = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const res = await authApi.login(values);
      setAuth(res.user, res.token, res.refreshToken);
      message.success("Đăng nhập thành công");
      navigate(roleDashboard[res.user.role] ?? "/", { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Đăng nhập thất bại";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const onRegisterFinish = async (values: RegisterFormValues) => {
    setLoading(true);
    try {
      const res = await authApi.register(values);
      message.success(res.message || "Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.");
      registerForm.resetFields();
      setActiveTab("login");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Đăng ký thất bại";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-orange-200 via-amber-50 to-gray-50">
      <AppHeader />

      <Content className="w-full py-8 px-6 md:px-10 pb-16 box-border text-gray-900 max-md:px-4">
        <div className="max-w-md mx-auto mt-8 md:mt-12">
          <div className="rounded-2xl bg-white border border-orange-200/20 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08),0_2px_4px_-2px_rgba(0,0,0,0.05)] p-6 md:p-8">
            <Title level={3} className="!text-slate-900 !mb-6 !text-center">
              Tài khoản
            </Title>

            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              className="auth-tabs [&_.ant-tabs-nav]:mb-6 [&_.ant-tabs-tab]:py-2 [&_.ant-tabs-ink-bar]:bg-orange-500"
              items={[
                {
                  key: "login",
                  label: <span className="font-medium">Đăng nhập</span>,
                  children: (
                    <Form<LoginFormValues>
                      form={loginForm}
                      layout="vertical"
                      requiredMark={false}
                      onFinish={onLoginFinish}
                      className="[&_.ant-form-item]:mb-4"
                    >
                      <Form.Item
                        name="usernameOrEmail"
                        label={<Text strong>Tên đăng nhập hay email</Text>}
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập tên đăng nhập hoặc email",
                          },
                        ]}
                      >
                        <Input
                          placeholder="Nhập tên đăng nhập"
                          size="large"
                          className="rounded-lg"
                        />
                      </Form.Item>
                      <Form.Item
                        name="password"
                        label={<Text strong>Mật khẩu</Text>}
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập mật khẩu",
                          },
                        ]}
                      >
                        <Input.Password
                          placeholder="Nhập mật khẩu"
                          size="large"
                          className="rounded-lg"
                        />
                      </Form.Item>
                      <Form.Item className="!mb-0 !pt-2">
                        <Button
                          type="primary"
                          htmlType="submit"
                          size="large"
                          block
                          loading={loading}
                          className="!bg-orange-500 !border-orange-500 hover:!bg-orange-600 hover:!border-orange-600 !rounded-lg !h-11"
                        >
                          Đăng nhập
                        </Button>
                      </Form.Item>
                      <Divider plain className="!my-4 !text-gray-400">
                        hoặc
                      </Divider>
                      <GoogleLoginButton />
                    </Form>
                  ),
                },
                {
                  key: "register",
                  label: <span className="font-medium">Đăng ký</span>,
                  children: (
                    <Form<RegisterFormValues>
                      form={registerForm}
                      layout="vertical"
                      requiredMark={false}
                      onFinish={onRegisterFinish}
                      className="[&_.ant-form-item]:mb-4"
                    >
                      <Form.Item
                        name="username"
                        label={<Text strong>Tên đăng nhập</Text>}
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập tên đăng nhập",
                          },
                        ]}
                      >
                        <Input
                          placeholder="Nhập tên đăng nhập"
                          size="large"
                          className="rounded-lg"
                        />
                      </Form.Item>
                      <Form.Item
                        name="email"
                        label={<Text strong>Email</Text>}
                        rules={[
                          { required: true, message: "Vui lòng nhập email" },
                          { type: "email", message: "Email không hợp lệ" },
                        ]}
                      >
                        <Input
                          placeholder="Nhập email"
                          size="large"
                          className="rounded-lg"
                        />
                      </Form.Item>
                      <Form.Item
                        name="password"
                        label={<Text strong>Mật khẩu</Text>}
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập mật khẩu",
                          },
                          {
                            min: 6,
                            message: "Mật khẩu tối thiểu 6 ký tự",
                          },
                        ]}
                      >
                        <Input.Password
                          placeholder="Nhập mật khẩu"
                          size="large"
                          className="rounded-lg"
                        />
                      </Form.Item>
                      <Form.Item className="!mb-0 !pt-2">
                        <Button
                          type="primary"
                          htmlType="submit"
                          size="large"
                          block
                          loading={loading}
                          className="!bg-orange-500 !border-orange-500 hover:!bg-orange-600 hover:!border-orange-600 !rounded-lg !h-11"
                        >
                          Đăng ký
                        </Button>
                      </Form.Item>
                      <Divider plain className="!my-4 !text-gray-400">
                        hoặc
                      </Divider>
                      <GoogleLoginButton />
                    </Form>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </Content>
    </Layout>
  );
}
