import {
  Table,
  Input,
  Select,
  Tag,
  Space,
  Card,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useEffect, useState } from "react";
import type { ProgramAdmissionConfig } from "../../types/program.admission.config";
import { getProgramAdmissionConfigs } from "../../api/program-admission-configs";
import { AdminLayout } from "../../components/layouts/AdminLayout";


const { Search } = Input;

export function AdminProgramAdmissionConfig() {
  const [data, setData] = useState<ProgramAdmissionConfig[]>([]);
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const [filters, setFilters] = useState({
    programId: undefined as number | undefined,
    campusId: undefined as number | undefined,
    admissionTypeId: undefined as number | undefined,
    search: "",
  });

  const [sorter, setSorter] = useState({
    sortBy: "createdAt",
    sortDesc: true,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getProgramAdmissionConfigs({
        ...filters,
        ...sorter,
        pageNumber: pagination.current,
        pageSize: pagination.pageSize,
      });

      setData(res.items);
      setPagination((prev) => ({
        ...prev,
        total: res.totalCount,
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters, sorter, pagination.current, pagination.pageSize]);

  const columns: ColumnsType<ProgramAdmissionConfig> = [
    {
      title: "Program",
      dataIndex: "programName",
      sorter: true,
    },
    {
      title: "Campus",
      dataIndex: "campusName",
    },
    {
      title: "Admission Type",
      dataIndex: "admissionTypeName",
    },
    {
      title: "Quota",
      dataIndex: "quota",
      sorter: true,
    },
    {
      title: "Status",
      dataIndex: "isActive",
      render: (active: boolean) => (
        <Tag color={active ? "green" : "red"}>
          {active ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      sorter: true,
    },
  ];

  return (
    <AdminLayout>
    <Card title="Program Admission Config Management">
      <Space style={{ marginBottom: 16 }}>
        {/* SEARCH */}
        <Search
          placeholder="Search program..."
          allowClear
          onSearch={(value) =>
            setFilters((prev) => ({ ...prev, search: value }))
          }
          style={{ width: 250 }}
        />

        {/* FILTERS */}
        <Select
          placeholder="Program"
          allowClear
          style={{ width: 180 }}
          onChange={(value) =>
            setFilters((prev) => ({ ...prev, programId: value }))
          }
        />

        <Select
          placeholder="Campus"
          allowClear
          style={{ width: 150 }}
          onChange={(value) =>
            setFilters((prev) => ({ ...prev, campusId: value }))
          }
        />

        <Select
          placeholder="Admission Type"
          allowClear
          style={{ width: 220 }}
          onChange={(value) =>
            setFilters((prev) => ({
              ...prev,
              admissionTypeId: value,
            }))
          }
        />
      </Space>

      <Table
        rowKey="configId"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={pagination}
        onChange={(pagination, _, sorter: any) => {
          setPagination(pagination);

          if (sorter.field) {
            setSorter({
              sortBy: sorter.field,
              sortDesc: sorter.order === "descend",
            });
          }
        }}
      />
    </Card>
    </AdminLayout>
  );
}