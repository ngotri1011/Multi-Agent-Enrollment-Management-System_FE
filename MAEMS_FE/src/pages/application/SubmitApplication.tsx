import { useEffect, useState } from "react";
import { Button, Modal, Skeleton, Typography } from "antd";
import {
  Award,
  BookOpen,
  CheckCircle,
  FileCheck2,
  FileText,
  GraduationCap,
} from "lucide-react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { getActiveAdmissionTypes } from "../../api/admission-types";
import { ApplicantLayout } from "../../layouts/ApplicantLayout";
import type { AdmissionType } from "../../types/admission.type";
import { ApplicantMenu } from "../applicant/ApplicantMenu";

const { Title, Text } = Typography;

type Palette = {
  icon: ReactNode;
  color: string;
  bg: string;
  border: string;
};

const PALETTES: Palette[] = [
  { icon: <BookOpen size={20} />,     color: "#f97316", bg: "#fff7ed", border: "#fed7aa" },
  { icon: <FileCheck2 size={20} />,   color: "#8b5cf6", bg: "#f5f3ff", border: "#ddd6fe" },
  { icon: <GraduationCap size={20} />,color: "#0ea5e9", bg: "#f0f9ff", border: "#bae6fd" },
  { icon: <Award size={20} />,        color: "#10b981", bg: "#f0fdf4", border: "#a7f3d0" },
];

function parseDocumentList(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    // not JSON
  }
  return raw
    .split(/[\n;,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function MethodCard({
  m,
  palette,
  onViewDocs,
}: {
  m: AdmissionType;
  palette: Palette;
  onViewDocs: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        border: `1px solid ${hovered ? palette.border : "#f3f4f6"}`,
        borderRadius: 16,
        padding: "20px 24px",
        display: "flex",
        gap: 20,
        alignItems: "flex-start",
        boxShadow: hovered
          ? `0 4px 16px rgba(0,0,0,0.08)`
          : "0 1px 4px rgba(0,0,0,0.05)",
        transition: "all 0.2s ease",
      }}
    >
      {/* Icon badge */}
      <div
        style={{
          flexShrink: 0,
          width: 48,
          height: 48,
          borderRadius: 12,
          background: palette.bg,
          color: palette.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {palette.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 4,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: palette.color,
              background: palette.bg,
              borderRadius: 99,
              padding: "2px 10px",
            }}
          >
            {m.type}
          </span>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#1f2937" }}>
            {m.admissionTypeName}
          </span>
        </div>

        {/* Docs button */}
        <button
          onClick={onViewDocs}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginTop: 8,
            padding: "5px 14px",
            fontSize: 12,
            fontWeight: 600,
            color: palette.color,
            background: hovered ? palette.bg : "#fafafa",
            border: `1px solid ${hovered ? palette.border : "#e5e7eb"}`,
            borderRadius: 99,
            cursor: "pointer",
            transition: "all 0.18s",
          }}
        >
          <FileText size={13} />
          Xem danh sách tài liệu
        </button>
      </div>
    </div>
  );
}

export function SubmitApplication() {
  const navigate = useNavigate();
  const [methods, setMethods] = useState<AdmissionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AdmissionType | null>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    getActiveAdmissionTypes()
      .then(setMethods)
      .finally(() => setLoading(false));
  }, []);

  const closeModal = () => setSelected(null);
  const selectedDocs = selected
    ? parseDocumentList(selected.requiredDocumentList)
    : [];
  const selectedPalette = PALETTES[selectedIdx % PALETTES.length];

  const openDocs = (m: AdmissionType, idx: number) => {
    setSelected(m);
    setSelectedIdx(idx);
  };

  return (
    <ApplicantLayout menuItems={ApplicantMenu}>
      <div style={{ maxWidth: 780, margin: "0 auto", paddingBottom: 48 }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "#fff7ed",
              border: "1px solid #fed7aa",
              borderRadius: 99,
              padding: "6px 18px",
              marginBottom: 16,
            }}
          >
            <span
              style={{
                color: "#f97316",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Trường Đại học FPT — Tuyển sinh 2026
            </span>
          </div>
          <Title
            level={2}
            style={{ marginBottom: 8, fontWeight: 800, color: "#1f2937" }}
          >
            Các phương thức xét tuyển
          </Title>
          <Text
            style={{
              color: "#6b7280",
              fontSize: 15,
              display: "block",
              maxWidth: 520,
              margin: "0 auto",
            }}
          >
            FPT University áp dụng nhiều phương thức xét tuyển. Tìm hiểu từng
            phương thức và bấm{" "}
            <strong>Đăng ký xét tuyển</strong> để bắt đầu nộp hồ sơ.
          </Text>
        </div>

        {/* Danh sách phương thức xét tuyển */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            marginBottom: 40,
          }}
        >
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    background: "#fff",
                    border: "1px solid #f3f4f6",
                    borderRadius: 16,
                    padding: "20px 24px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                  }}
                >
                  <Skeleton active avatar paragraph={{ rows: 1 }} />
                </div>
              ))
            : methods.map((m, idx) => {
                const palette = PALETTES[idx % PALETTES.length];
                return (
                  <MethodCard
                    key={m.admissionTypeId}
                    m={m}
                    palette={palette}
                    onViewDocs={() => openDocs(m, idx)}
                  />
                );
              })}
        </div>

        {/* Nút đăng ký xét tuyển */}
        <div
          style={{
            background: "linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)",
            border: "1px solid #fed7aa",
            borderRadius: 20,
            padding: "32px 28px",
            textAlign: "center",
          }}
        >
          <Title
            level={4}
            style={{ marginBottom: 8, fontWeight: 700, color: "#1f2937" }}
          >
            Sẵn sàng nộp hồ sơ?
          </Title>
          <Text
            style={{
              color: "#6b7280",
              fontSize: 14,
              display: "block",
              marginBottom: 20,
            }}
          >
            Hệ thống sẽ hướng dẫn bạn hoàn thiện đơn đăng ký và chọn phương
            thức xét tuyển phù hợp.
          </Text>
          <Button
            type="primary"
            size="large"
            onClick={() => navigate("/applicant/submit-application/form")}
            style={{
              background: "#f97316",
              borderColor: "#f97316",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 15,
              height: 48,
              paddingInline: 40,
              boxShadow: "0 4px 14px rgba(249,115,22,0.35)",
            }}
          >
            Đăng ký xét tuyển ngay
          </Button>
        </div>
      </div>

      {/* Required Documents Modal */}
      <Modal
        open={!!selected}
        onCancel={closeModal}
        width={480}
        centered
        destroyOnClose
        title={
          selected ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: selectedPalette.bg,
                  color: selectedPalette.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {selectedPalette.icon}
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: selectedPalette.color,
                  }}
                >
                  {selected.type}
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: "#1f2937",
                    marginTop: 2,
                    lineHeight: 1.3,
                  }}
                >
                  {selected.admissionTypeName}
                </div>
              </div>
            </div>
          ) : null
        }
        // Dùng footer mặc định của Ant Design để tận dụng animation/tương tác tối ưu sẵn, giảm cảm giác giật khi mở modal.
        footer={[
          <Button
            key="ok"
            type="primary"
            onClick={closeModal}
            style={{
              background: selectedPalette.color,
              borderColor: selectedPalette.color,
              borderRadius: 10,
              fontWeight: 700,
            }}
          >
            Đã hiểu
          </Button>,
        ]}
        // Bỏ blur nền vì filter trên mask dễ gây lag khi animate modal trên một số máy.
        styles={{ body: { padding: "18px 22px 10px" }, mask: {} }}
        style={{ borderRadius: 16, overflow: "hidden" }}
      >
        {selected && (
          <div>
            {/* Giữ body gọn nhẹ, chỉ render danh sách tài liệu để hạn chế repaint/reflow khi modal animate. */}
            <div style={{ background: "#fff" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <FileText size={14} style={{ color: selectedPalette.color }} />
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 12,
                    color: "#374151",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  }}
                >
                  Danh sách tài liệu bắt buộc
                </span>
                {selectedDocs.length > 0 && (
                  <Text
                    style={{
                      marginLeft: "auto",
                      fontSize: 11,
                      fontWeight: 700,
                      color: selectedPalette.color,
                      background: selectedPalette.bg,
                      border: `1px solid ${selectedPalette.border}`,
                      borderRadius: 99,
                      padding: "2px 10px",
                    }}
                  >
                    {selectedDocs.length} mục
                  </Text>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {selectedDocs.length > 0 ? (
                  selectedDocs.map((doc, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        padding: "10px 14px",
                        background: selectedPalette.bg,
                        borderRadius: 10,
                        border: `1px solid ${selectedPalette.border}`,
                      }}
                    >
                      <CheckCircle
                        size={14}
                        style={{
                          color: selectedPalette.color,
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 13,
                          color: "#374151",
                          lineHeight: 1.6,
                        }}
                      >
                        {doc}
                      </span>
                    </div>
                  ))
                ) : (
                  <Text style={{ color: "#9ca3af", fontSize: 13 }}>
                    Chưa có thông tin tài liệu.
                  </Text>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </ApplicantLayout>
  );
}
