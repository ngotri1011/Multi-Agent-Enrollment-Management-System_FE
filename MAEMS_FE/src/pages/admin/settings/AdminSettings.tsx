import { Tabs, Typography } from "antd";

import { CampusManagement } from "./CampusManagement";
import { AdmissionTypeManagement } from "./AdmissionTypeManagement";
import { MajorManagement } from "./MajorManagement";
import { AdminLayout } from "../../../layouts/AdminLayout";
import EnrollmentYears from "./EnrollmentYears";

const { Title, Text } = Typography;

export function AdminSettings() {
  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6">
        <Title level={3} className="!mb-1">
          System Configuration
        </Title>
        <Text type="secondary">
          Manage campus, admission types, and majors.
        </Text>
      </div>

      {/* Tabs */}
      <Tabs
        defaultActiveKey="campus"
        items={[
          {
            key: "campus",
            label: "Campus",
            children: <CampusManagement />,
          },
          {
            key: "admission",
            label: "Phương thức xét tuyển",
            children: <AdmissionTypeManagement />,
          },
          {
            key: "major",
            label: "Ngành học",
            children: <MajorManagement />,
          },
          {
            key: "enrollment-years",
            label: "Năm tuyển sinh",
            children: <EnrollmentYears />,
          },
        ]}
      />
    </AdminLayout>
  );
}