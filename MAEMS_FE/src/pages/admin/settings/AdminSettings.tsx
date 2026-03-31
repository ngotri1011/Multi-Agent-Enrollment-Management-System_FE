import { Tabs, Typography } from "antd";

import { CampusManagement } from "./CampusManagement";
import { AdmissionTypeManagement } from "./AdmissionTypeManagement";
import { MajorManagement } from "./MajorManagement";
import { AdminLayout } from "../../../components/layouts/AdminLayout";
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
            label: "Admission Types",
            children: <AdmissionTypeManagement />,
          },
          {
            key: "major",
            label: "Majors",
            children: <MajorManagement />,
          },
          {
            key: "enrollment-years",
            label: "Enrollment Years",
            children: <EnrollmentYears />,
          },
        ]}
      />
    </AdminLayout>
  );
}