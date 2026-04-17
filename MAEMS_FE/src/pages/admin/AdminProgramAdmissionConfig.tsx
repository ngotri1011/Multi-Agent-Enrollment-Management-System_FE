import { Table, Input, Select, Tag, Space, Card, Form, Button, Modal } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useEffect, useState } from "react";
import type { ProgramAdmissionConfig } from "../../types/program.admission.config";
import {
  createProgramAdmissionConfig,
  getProgramAdmissionConfigById,
  getProgramAdmissionConfigs,
  updateProgramAdmissionConfig,
} from "../../api/program-admission-configs";
import { AdminLayout } from "../../layouts/AdminLayout";
import type { CampusBasic } from "src/types/campus";
import type { AdmissionTypeBasic } from "src/types/admission.type";
import {
  getActiveBasicCampuses,
} from "../../api/campuses";
import {
  getActiveAdmissionTypesBasic,
} from "../../api/admission-types";
import { getActiveProgramsBasic } from "../../api/programs";
import type { ProgramBasic } from "../../types/program";

const { Search } = Input;

export function AdminProgramAdmissionConfig() {
  const [data, setData] = useState<ProgramAdmissionConfig[]>([]);
  const [loading, setLoading] = useState(false);

  const [campuses, setCampuses] = useState<CampusBasic[]>([]);
  const [admissionTypes, setAdmissionTypes] = useState<AdmissionTypeBasic[]>([]);
  const [programs, setPrograms] = useState<ProgramBasic[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();

  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const handleCreate = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = async (id: number) => {
    const data = await getProgramAdmissionConfigById(id);

    form.setFieldsValue({
      programId: data.programId,
      campusId: data.campusId,
      admissionTypeId: data.admissionTypeId,
      quota: data.quota,
      isActive: data.isActive,
    });

    setEditingId(id);
    setIsModalOpen(true);
  };
  const handleSubmit = async () => {
    const values = await form.validateFields();

    if (editingId) {
      await updateProgramAdmissionConfig(editingId, values);
    } else {
      await createProgramAdmissionConfig(values);
    }

    setIsModalOpen(false);
    fetchData(); // refresh table
  };

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

  const updateFilter = (patch: Partial<typeof filters>) => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    setFilters((prev) => ({ ...prev, ...patch }));
  };

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
    const fetchFilters = async () => {
      const [campusRes, admissionRes, programRes] = await Promise.all([
        getActiveBasicCampuses(),
        getActiveAdmissionTypesBasic(),
        getActiveProgramsBasic(),
      ]);

      setCampuses(campusRes);
      setAdmissionTypes(admissionRes);
      setPrograms(programRes);
    };

    fetchFilters();
  }, []);

  useEffect(() => {
    fetchData();
  }, [filters, sorter, pagination.current, pagination.pageSize]);

  const columns: ColumnsType<ProgramAdmissionConfig> = [
    {
      title: "Chương trình đào tạo",
      dataIndex: "programName",
      sorter: true,
    },
    {
      title: "Campus",
      dataIndex: "campusName",
    },
    {
      title: "Phương thức",
      dataIndex: "admissionTypeName",
    },
    {
      title: "Quota",
      dataIndex: "quota",
      sorter: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      render: (active: boolean) => (
        <Tag color={active ? "green" : "red"}>
          {active ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      sorter: true,
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => handleEdit(record.configId)}
          >
            Edit
          </Button>
        </Space>
      ),
    }
  ];

  return (
    <AdminLayout>
      <Card title="Quản lý kế hoach tuyển sinh">
        <Space style={{ marginBottom: 16 }} wrap>
          {/* SEARCH */}
          <Search
            placeholder="Tìm kiếm..."
            allowClear
            onSearch={(value) =>
              setFilters((prev) => ({ ...prev, search: value }))
            }
            style={{ width: 250 }}
          />

          {/* FILTERS */}
          <Select
            placeholder="Chương trình đào tạo"
            allowClear
            style={{ width: 180 }}
            options={programs.map(p => ({
              label: p.programName,
              value: p.programId,
            }))}
            onChange={(value) =>
              setFilters(prev => ({ ...prev, programId: value }))
            }
          />

          <Select
            placeholder="Campus"
            allowClear
            style={{ width: 180 }}
            options={campuses.map((c) => ({
              label: c.name,
              value: c.campusId,
            }))}
            value={filters.campusId}
            onChange={(value) => updateFilter({ campusId: value })}
          />

          <Select
            placeholder="Phương thức"
            allowClear
            style={{ width: 220 }}
            options={admissionTypes.map((a) => ({
              label: a.admissionTypeName,
              value: a.admissionTypeId,
            }))}
            value={filters.admissionTypeId}
            onChange={(value) => updateFilter({ admissionTypeId: value })}
          />
          <Button type="primary" onClick={handleCreate}>
            + Create Config
          </Button>
        </Space>

        <Table
          rowKey="configId"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={pagination}
          onChange={(pager, _, sorter: any) => {
            setPagination(pager);

            if (sorter?.field) {
              setSorter({
                sortBy: sorter.field,
                sortDesc: sorter.order === "descend",
              });
            }
          }}
        />
      </Card>

      <Modal
        title={editingId ? "Edit Config" : "Create Config"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="programId" label="Chương trình đào tạo" rules={[{ required: true }]}>
            <Select
              options={programs.map(p => ({
                label: p.programName,
                value: p.programId,
              }))}
            />
          </Form.Item>

          <Form.Item name="campusId" label="Campus" rules={[{ required: true }]}>
            <Select
              options={campuses.map(c => ({
                label: c.name,
                value: c.campusId,
              }))}
            />
          </Form.Item>

          <Form.Item name="admissionTypeId" label="Phương thức" rules={[{ required: true }]}>
            <Select
              options={admissionTypes.map(a => ({
                label: a.admissionTypeName,
                value: a.admissionTypeId,
              }))}
            />
          </Form.Item>

          <Form.Item name="quota" label="Quota" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>

          <Form.Item name="isActive" label="Trạng thái" initialValue={true}>
            <Select
              options={[
                { label: "Active", value: true },
                { label: "Inactive", value: false },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
}