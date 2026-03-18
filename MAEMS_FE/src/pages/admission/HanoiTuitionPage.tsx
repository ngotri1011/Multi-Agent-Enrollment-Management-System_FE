import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Home, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { GuestLayout } from "../../components/layouts/GuestLayout";

type TuitionRow = {
  key: string;
  major: string;
  kv1?: string;
  other?: string;
  isGroup?: boolean;
};

const tuitionData: TuitionRow[] = [
  { key: "g1", major: "Ngành Công nghệ thông tin", isGroup: true },
  { key: "r1", major: "Công nghệ thông tin", kv1: "22.120.000", other: "31.600.000" },
  { key: "r2", major: "Kỹ thuật phần mềm", kv1: "22.120.000", other: "31.600.000" },
  { key: "r3", major: "Trí tuệ nhân tạo", kv1: "22.120.000", other: "31.600.000" },
  { key: "r4", major: "Khoa học dữ liệu và ứng dụng", kv1: "22.120.000", other: "31.600.000" },
  { key: "r5", major: "An toàn thông tin", kv1: "22.120.000", other: "31.600.000" },
  { key: "r6", major: "Vi mạch bán dẫn", kv1: "22.120.000", other: "31.600.000" },
  { key: "r7", major: "Công nghệ ô tô số (Automotive)", kv1: "22.120.000", other: "31.600.000" },
  { key: "r8", major: "Hệ thống thông tin", kv1: "22.120.000", other: "31.600.000" },
  { key: "r9", major: "Thiết kế đồ họa và mỹ thuật số", kv1: "22.120.000", other: "31.600.000" },

  { key: "g2", major: "Ngành Công nghệ truyền thông", isGroup: true },
  { key: "r10", major: "Truyền thông đa phương tiện", kv1: "22.120.000", other: "31.600.000" },
  { key: "r11", major: "Quan hệ công chúng", kv1: "22.120.000", other: "31.600.000" },
  { key: "r12", major: "Truyền thông Marketing tích hợp", kv1: "22.120.000", other: "31.600.000" },
  { key: "r13", major: "Truyền thông thương hiệu", kv1: "22.120.000", other: "31.600.000" },

  { key: "g3", major: "Nhóm Ngành Ngôn ngữ", isGroup: true },
  { key: "r14", major: "Ngôn ngữ Anh", kv1: "15.480.000", other: "22.120.000" },
  { key: "r15", major: "Tiếng Anh thương mại", kv1: "15.480.000", other: "22.120.000" },
  { key: "r16", major: "Ngôn ngữ Hàn Quốc", kv1: "15.480.000", other: "22.120.000" },
  { key: "r17", major: "Tiếng Hàn thương mại", kv1: "15.480.000", other: "22.120.000" },
  { key: "r18", major: "Ngôn ngữ Trung Quốc", kv1: "15.480.000", other: "22.120.000" },
  { key: "r19", major: "Tiếng Trung thương mại", kv1: "15.480.000", other: "22.120.000" },

  { key: "g4", major: "Ngành Luật", isGroup: true },
  { key: "r20", major: "Luật", kv1: "15.480.000", other: "22.120.000" },
  { key: "r21", major: "Luật kinh tế", kv1: "15.480.000", other: "22.120.000" },

  { key: "g5", major: "Ngành Quản trị kinh doanh", isGroup: true },
  { key: "r22", major: "Marketing", kv1: "22.120.000", other: "31.600.000" },
  { key: "r23", major: "Kinh doanh quốc tế", kv1: "22.120.000", other: "31.600.000" },
  { key: "r24", major: "Thương mại điện tử", kv1: "22.120.000", other: "31.600.000" },
  { key: "r25", major: "Quản trị kinh doanh", kv1: "22.120.000", other: "31.600.000" },
  { key: "r26", major: "Quản trị giải trí và sự kiện", kv1: "22.120.000", other: "31.600.000" },
  { key: "r27", major: "Quản trị trải nghiệm khách hàng", kv1: "22.120.000", other: "31.600.000" },
  { key: "r28", major: "Quản trị thu mua", kv1: "22.120.000", other: "31.600.000" },
  { key: "r29", major: "Quản trị khách sạn", kv1: "15.480.000", other: "22.120.000" },
  { key: "r30", major: "Quản trị dịch vụ Du lịch và Lữ hành", kv1: "15.480.000", other: "22.120.000" },
  { key: "r31", major: "Phân tích kinh doanh (Business Analytics)", kv1: "22.120.000", other: "31.600.000" },
  { key: "r32", major: "Logistics và quản lý chuỗi cung ứng toàn cầu", kv1: "22.120.000", other: "31.600.000" },
  { key: "r33", major: "Công nghệ tài chính", kv1: "22.120.000", other: "31.600.000" },
  { key: "r34", major: "Tài chính doanh nghiệp", kv1: "22.120.000", other: "31.600.000" },
  { key: "r35", major: "Tài chính thông minh", kv1: "22.120.000", other: "31.600.000" },
  { key: "r36", major: "Tài chính Ngân hàng", kv1: "22.120.000", other: "31.600.000" },

  { key: "g6", major: "Cử nhân tài năng Ngành Khoa học máy tính", isGroup: true },
  { key: "r37", major: "Trí tuệ nhân tạo và Khoa học dữ liệu", kv1: "22.120.000", other: "31.600.000" },
  { key: "r38", major: "An ninh mạng và An toàn số", kv1: "22.120.000", other: "31.600.000" },
];

const columns: ColumnsType<TuitionRow> = [
  {
    title: "NGÀNH/CHUYÊN NGÀNH",
    dataIndex: "major",
    key: "major",
    onCell: (record) =>
      record.isGroup ? { colSpan: 3 } : {},
    render: (text, record) =>
      record.isGroup ? (
        <span className="font-bold text-gray-900">{text}</span>
      ) : (
        <span className="text-gray-700">{text}</span>
      ),
  },
  {
    title: (
      <div className="text-center">
        <div className="font-bold">KV1</div>
        <div className="font-normal text-xs">(VNĐ)</div>
      </div>
    ),
    dataIndex: "kv1",
    key: "kv1",
    align: "center" as const,
    onCell: (record) => (record.isGroup ? { colSpan: 0 } : {}),
    render: (val) => <span className="text-gray-700">{val}</span>,
  },
  {
    title: (
      <div className="text-center">
        <div className="font-bold">CÁC KV KHÁC</div>
        <div className="font-normal text-xs">(VNĐ)</div>
      </div>
    ),
    dataIndex: "other",
    key: "other",
    align: "center" as const,
    onCell: (record) => (record.isGroup ? { colSpan: 0 } : {}),
    render: (val) => <span className="text-gray-700">{val}</span>,
  },
];

export function HanoiTuitionPage() {
  return (
    <GuestLayout>
      <img
        src="https://daihoc.fpt.edu.vn/wp-content/uploads/2025/12/Bannerweb-Hocphi-Artboard-2-copy-4100.png"
        alt="Học phí Hà Nội"
        style={{ width: "100%", display: "block" }}
      />

      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex items-center gap-2 py-4 text-sm">
          <Link to="/">
            <Home size={18} className="text-orange-500" fill="currentColor" />
          </Link>
          <ChevronRight size={14} className="text-gray-400" />
          <Link to="/tuyen-sinh" className="text-orange-500 hover:underline">
            Tuyển sinh
          </Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-gray-600">Học phí Hà Nội</span>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-10">
        <h1
          className="text-3xl font-bold text-center mb-2"
          style={{ color: "#f97316" }}
        >
          HỌC PHÍ TẠI CAMPUS HÀ NỘI
        </h1>

        <p className="text-center text-base text-gray-600 mb-1">(Học phí chuẩn)</p>
        <p className="text-center text-base text-gray-600 mb-8">
          Học phí áp dụng cho tân sinh viên khóa K22 (nhập học năm 2026)
        </p>

        <p className="text-sm text-gray-500 mb-4">Học phí mỗi học kỳ <sup>(+)</sup></p>

        <style>{`
          .tuition-table .ant-table {
            border: 2px solid #f97316 !important;
            border-radius: 0 !important;
          }
          .tuition-table .ant-table-thead > tr > th {
            background-color: #f97316 !important;
            color: #ffffff !important;
            font-weight: 700 !important;
            border-bottom: 2px solid #f97316 !important;
            border-right: 1px solid #fff3 !important;
          }
          .tuition-table .ant-table-thead > tr > th:last-child {
            border-right: none !important;
          }
          .tuition-table .ant-table-tbody > tr > td {
            border-bottom: 1px solid #fed7aa !important;
            border-right: 1px solid #fed7aa !important;
          }
          .tuition-table .ant-table-tbody > tr > td:last-child {
            border-right: none !important;
          }
          .tuition-table .ant-table-tbody > tr:hover > td {
            background-color: #fff7ed !important;
          }
        `}</style>

        <div className="tuition-table">

          <Table
            columns={columns}
            dataSource={tuitionData}
            pagination={false}
            size="middle"
            bordered
          />
        </div>

        <div className="mt-6 text-sm text-gray-600 space-y-2 text-left">
          <p className="font-semibold text-gray-800">Ghi chú:</p>
          <p>
            <span className="font-medium">(*)</span> Sinh viên mới nhập học sẽ nộp học phí kỳ định hướng: KV1:{" "}
            <span className="font-medium">9.170.000đ</span>, các khu vực khác:{" "}
            <span className="font-medium">13.100.000đ</span>
          </p>
          <p>
            <span className="font-medium">(**)</span> Sinh viên có chứng chỉ tiếng Anh IELTS 6.0 trở lên (hoặc tương
            đương) sẽ vào thẳng học kỳ chuyên ngành. Các sinh viên khác sẽ được xếp lớp theo trình độ tiếng Anh tại
            thời điểm nhập học. Có tối đa 6 mức tiếng Anh, học phí KV1:{" "}
            <span className="font-medium">9.170.000đ/mức</span>, các KV khác:{" "}
            <span className="font-medium">13.100.000đ/mức</span>
          </p>
          <p>
            <span className="font-medium">(+)</span> Từ HK4 sẽ tăng 6,3% so với HK1, HK7 sẽ tăng 6,5% so với HK4
          </p>
        </div>
      </div>
    </GuestLayout>
  );
}
