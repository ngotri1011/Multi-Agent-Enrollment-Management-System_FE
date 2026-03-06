import { Card, Typography, Form, Input, Button, Switch, Space } from "antd";
import { AdminLayout } from "../../components/layouts/AdminLayout";

const { Title, Text } = Typography;

export function AdminSettings() {
  const [form] = Form.useForm();

  const handleSave = (values: any) => {
    console.log("General settings:", values);
  };

  const handleNotificationSave = (values: any) => {
    console.log("Notification settings:", values);
  };

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="mb-6">
        <Title level={3} className="!mb-1">
          System Settings
        </Title>
        <Text type="secondary">
          Configure system preferences and settings.
        </Text>
      </div>

      {/* General Settings */}
      <Card
        className="rounded-2xl border border-gray-100 mb-6"
        styles={{ body: { padding: 24 } }}
      >
        <Title level={4} className="!mb-6">
          General Settings
        </Title>

        <Form
          layout="vertical"
          form={form}
          onFinish={handleSave}
          initialValues={{
            academicYear: "2026-2027",
            enrollmentCap: 1500,
          }}
        >
          <Form.Item label="Academic Year" name="academicYear">
            <Input />
          </Form.Item>

          <Form.Item label="Application Deadline" name="deadline">
            <Input placeholder="dd/mm/yyyy" />
          </Form.Item>

          <Form.Item label="Enrollment Cap" name="enrollmentCap">
            <Input type="number" />
          </Form.Item>

          <Button type="primary" htmlType="submit">
            Save Settings
          </Button>
        </Form>
      </Card>

      {/* Notification Settings */}
      <Card
        className="rounded-2xl border border-gray-100"
        styles={{ body: { padding: 24 } }}
      >
        <Title level={4} className="!mb-6">
          Notification Settings
        </Title>

        <Form
          layout="vertical"
          onFinish={handleNotificationSave}
          initialValues={{
            emailNotifications: true,
            smsAlerts: true,
            weeklyReports: false,
          }}
        >
          <Space direction="vertical" size="large" className="w-full">
            <Form.Item
              label="Email notifications for new applications"
              name="emailNotifications"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              label="SMS alerts for overdue payments"
              name="smsAlerts"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              label="Weekly system reports"
              name="weeklyReports"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Space>

          <Button type="primary" htmlType="submit" className="mt-4">
            Update Notifications
          </Button>
        </Form>
      </Card>
    </AdminLayout>
  );
}