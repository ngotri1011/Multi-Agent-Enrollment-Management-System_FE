import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Empty,
  Input,
  Modal,
  Pagination,
  Select,
  Spin,
  Tag,
} from "antd";
import {
  CheckCircleFilled,
  ClockCircleFilled,
  CodeOutlined,
  EyeOutlined,
  FilterOutlined,
  FileTextOutlined,
  SearchOutlined,
  ThunderboltFilled,
  WarningFilled,
  CloseCircleFilled,
} from "@ant-design/icons";
import { getAgentLogs } from "../../api/agent-logs";
import {
  getApplicantById,
  getApplicantDocumentsById,
} from "../../api/applicants";
import type { AgentLog } from "../../types/agent-log";
import { QALayout } from "../../components/layouts/QALayout";

type SearchType = "applicationId" | "documentId";

type ParsedOutput = {
  result?: string;
  details?: string;
  thinking?: string;
  model?: string;
} | null;

type ApplicantProfile = {
  applicantId?: number;
  userId?: number;
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  highSchoolName?: string;
  highSchoolDistrict?: string;
  highSchoolProvince?: string;
  graduationYear?: number;
  idIssueNumber?: string;
  idIssueDate?: string;
  idIssuePlace?: string;
  contactName?: string;
  contactAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
  allowShare?: boolean;
  createdAt?: string;
};

type ApplicantDocument = {
  documentId?: number;
  applicantId?: number;
  documentType?: string;
  filePath?: string;
  uploadedAt?: string;
  fileName?: string;
  fileFormat?: string;
  verificationResult?: string;
  verificationDetails?: string | null;
};

type ComparisonData = {
  log: AgentLog;
  applicant: ApplicantProfile | null;
  documents: ApplicantDocument[];
  matchedDocument: ApplicantDocument | null;
  parsed: ParsedOutput;
};

function safeParseOutput(outputData: string): ParsedOutput {
  try {
    const level1 = JSON.parse(outputData);
    const message = level1?.message;

    if (message?.content) {
      const content = JSON.parse(message.content);
      return {
        result: content?.result,
        details: content?.details,
        thinking: message?.thinking,
        model: level1?.model,
      };
    }

    return {
      result: level1?.result,
      details: level1?.details,
      thinking: message?.thinking ?? level1?.thinking,
      model: level1?.model,
    };
  } catch {
    return null;
  }
}

function getResultMeta(result?: string) {
  const value = (result || "").toLowerCase();

  if (value === "accepted" || value === "passed" || value === "approved") {
    return {
      label: result || "Passed",
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-100",
      accent: "from-emerald-500 to-emerald-400",
      icon: <CheckCircleFilled className="text-emerald-500" />,
      glow: "shadow-emerald-100/60",
    };
  }

  if (value === "rejected" || value === "reject") {
    return {
      label: result || "rejected",
      className: "bg-rose-50 text-rose-700 border-rose-200 ring-rose-100",
      accent: "from-rose-500 to-rose-400",
      icon: <CloseCircleFilled className="text-rose-500" />,
      glow: "shadow-rose-100/60",
    };
  }

  if (value === "waitlisted" || value === "pending") {
    return {
      label: result || "pending",
      className:
        "bg-amber-50 text-amber-700 border-amber-200 ring-amber-100",
      accent: "from-amber-500 to-orange-400",
      icon: <ClockCircleFilled className="text-amber-500" />,
      glow: "shadow-amber-100/60",
    };
  }

  return {
    label: result || "unknown",
    className: "bg-slate-50 text-slate-700 border-slate-200 ring-slate-100",
    accent: "from-slate-500 to-slate-400",
    icon: <WarningFilled className="text-slate-500" />,
    glow: "shadow-slate-100/60",
  };
}

function getStatusMeta(status?: string) {
  const value = (status || "").toLowerCase();

  if (value.includes("response")) {
    return {
      label: status || "llm_response",
      className: "bg-sky-50 text-sky-700 border-sky-200",
    };
  }

  if (value.includes("success") || value.includes("done")) {
    return {
      label: status || "success",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }

  if (value.includes("error") || value.includes("fail")) {
    return {
      label: status || "error",
      className: "bg-rose-50 text-rose-700 border-rose-200",
    };
  }

  return {
    label: status || "unknown",
    className: "bg-violet-50 text-violet-700 border-violet-200",
  };
}

function getValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function StatBox({
  label,
  value,
  tone = "slate",
}: {
  label: string;
  value: string;
  tone?: "slate" | "violet" | "emerald" | "amber" | "rose" | "sky";
}) {
  const tones: Record<
    string,
    { bg: string; text: string; border: string }
  > = {
    slate: {
      bg: "bg-slate-50",
      text: "text-slate-700",
      border: "border-slate-200",
    },
    violet: {
      bg: "bg-violet-50",
      text: "text-violet-700",
      border: "border-violet-200",
    },
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
    },
    rose: {
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200",
    },
    sky: {
      bg: "bg-sky-50",
      text: "text-sky-700",
      border: "border-sky-200",
    },
  };

  const t = tones[tone];

  return (
    <div className={`rounded-2xl border ${t.border} ${t.bg} p-4`}>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className={`mt-2 text-sm font-semibold ${t.text} break-words`}>
        {value}
      </div>
    </div>
  );
}

function renderDocumentPreview(doc: ApplicantDocument) {
  const filePath = doc.filePath || "";
  const format = (doc.fileFormat || "").toLowerCase();

  const isImage =
    format.includes("png") ||
    format.includes("jpg") ||
    format.includes("jpeg") ||
    format.includes("webp") ||
    filePath.match(/\.(png|jpg|jpeg|webp)(\?|$)/i);

  const isPdf =
    format.includes("pdf") || filePath.match(/\.pdf(\?|$)/i);

  if (isImage) {
    return (
      <div className="flex justify-center">
        <img
          src={filePath}
          alt={doc.fileName || "document"}
          className="max-h-[460px] w-full rounded-2xl border border-slate-200 object-contain shadow-sm"
        />
      </div>
    );
  }

  if (isPdf) {
    return (
      <iframe
        src={filePath}
        title={doc.fileName || "PDF preview"}
        className="h-[460px] w-full rounded-2xl border border-slate-200 shadow-sm"
      />
    );
  }

  return (
    <a
      href={filePath}
      target="_blank"
      rel="noreferrer"
      className="block rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-indigo-600 hover:underline"
    >
      Open document
    </a>
  );
}

export function AgentLogsPage() {
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState({
    pageNumber: 1,
    pageSize: 10,
    search: "",
    searchType: "applicationId" as SearchType,
    agentType: "",
    status: "",
    sortBy: "createdAt",
    sortDesc: true,
  });

  // draft values: changing these does NOT fetch
  const [searchTypeDraft, setSearchTypeDraft] = useState<SearchType>("applicationId");
  const [searchValueDraft, setSearchValueDraft] = useState("");

  const [total, setTotal] = useState(0);

  const [compareOpen, setCompareOpen] = useState(false);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareData, setCompareData] = useState<ComparisonData | null>(null);

  const [selectedThinking, setSelectedThinking] = useState<string | null>(null);

  const [applicantsMap, setApplicantsMap] = useState<
    Record<number, ApplicantProfile>
  >({});
  const [documentsMap, setDocumentsMap] = useState<
    Record<number, ApplicantDocument[]>
  >({});

  const applySearch = () => {
    setQuery((prev) => ({
      ...prev,
      pageNumber: 1,
      search: searchValueDraft.trim(),
      searchType: searchTypeDraft,
    }));
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params: any = {
        pageNumber: query.pageNumber,
        pageSize: query.pageSize,
        agentType: query.agentType || undefined,
        status: query.status || undefined,
        sortBy: query.sortBy,
        sortDesc: query.sortDesc,
      };

      const trimmed = query.search.trim();
      if (trimmed) {
        const numericValue = Number(trimmed);
        if (!Number.isNaN(numericValue)) {
          if (query.searchType === "applicationId") {
            params.applicationId = numericValue;
          } else if (query.searchType === "documentId") {
            params.documentId = numericValue;
          }
        }
      }

      const res = await getAgentLogs(params);
      setLogs(res.items);
      setTotal(res.totalCount);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const stats = useMemo(() => {
    const parsed = logs.map((log) => ({
      ...log,
      parsed: safeParseOutput(log.outputData),
    }));

    return {
      total: logs.length,
      rejected: parsed.filter(
        (x) => x.parsed?.result?.toLowerCase() === "rejected"
      ).length,
      passed: parsed.filter(
        (x) => x.parsed?.result?.toLowerCase() === "passed"
      ).length,
      pending: parsed.filter((x) => {
        const r = (x.parsed?.result || "").toLowerCase();
        return r === "pending" || r === "waitlisted" || !r;
      }).length,
    };
  }, [logs]);

  const openCompareModal = async (log: AgentLog) => {
    setCompareOpen(true);
    setCompareLoading(true);

    try {
      const parsed = safeParseOutput(log.outputData);

      let applicant = applicantsMap[log.applicantId];
      if (!applicant) {
        applicant = await getApplicantById(log.applicantId);
        setApplicantsMap((prev) => ({
          ...prev,
          [log.applicantId]: applicant,
        }));
      }

      let documents = documentsMap[log.applicantId];
      if (!documents) {
        documents = await getApplicantDocumentsById(log.applicantId);
        setDocumentsMap((prev) => ({
          ...prev,
          [log.applicantId]: documents,
        }));
      }

      const matchedDocument =
        documents?.find(
          (doc) => Number(doc.documentId) === Number(log.documentId)
        ) || null;

      setCompareData({
        log,
        applicant,
        documents,
        matchedDocument,
        parsed,
      });
    } finally {
      setCompareLoading(false);
    }
  };

  return (
    <QALayout>
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="mb-6 rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-violet-950 p-6 text-white shadow-xl shadow-slate-900/10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
                  <ThunderboltFilled />
                  QA review workspace
                </div>
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                  Agent Logs
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-white/70 md:text-base">
                  Xem và phân tích các agent log được tạo ra trong quá trình xử lý hồ sơ tuyển sinh. Sử dụng các bộ lọc và công cụ so sánh để đánh giá hiệu quả của các agent và cải thiện hệ thống.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                  <div className="text-xs text-white/65">On page</div>
                  <div className="mt-1 text-2xl font-semibold">
                    {stats.total}
                  </div>
                </div>
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 backdrop-blur">
                  <div className="text-xs text-emerald-100">Passed</div>
                  <div className="mt-1 text-2xl font-semibold text-emerald-50">
                    {stats.passed}
                  </div>
                </div>
                <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 backdrop-blur">
                  <div className="text-xs text-rose-100">Rejected</div>
                  <div className="mt-1 text-2xl font-semibold text-rose-50">
                    {stats.rejected}
                  </div>
                </div>
                <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 backdrop-blur">
                  <div className="text-xs text-amber-100">Pending</div>
                  <div className="mt-1 text-2xl font-semibold text-amber-50">
                    {stats.pending}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Card
            className="mb-6 rounded-3xl border-0 shadow-sm"
            styles={{ body: { padding: 20 } }}
          >
            <div className="grid gap-3 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7">
                <div className="flex gap-3">
                  <Select
                    size="large"
                    value={searchTypeDraft}
                    onChange={(value) => setSearchTypeDraft(value)}
                    options={[
                      { value: "applicationId", label: "ID Hồ sơ" },
                      { value: "documentId", label: "ID Tài liệu" },
                    ]}
                    className="w-44"
                  />

                  <Input
                    size="large"
                    placeholder={
                      searchTypeDraft === "documentId"
                        ? "Nhập Document ID..."
                        : "Nhập Application ID..."
                    }
                    value={searchValueDraft}
                    onChange={(e) => setSearchValueDraft(e.target.value)}
                    onPressEnter={applySearch}
                  />

                  <Button
                    size="large"
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={applySearch}
                  >
                    Tìm
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:col-span-5 lg:grid-cols-3">
                <Select
                  size="large"
                  value={query.agentType || undefined}
                  placeholder="Loại agent"
                  allowClear
                  onChange={(value) =>
                    setQuery((prev) => ({
                      ...prev,
                      agentType: value || "",
                      pageNumber: 1,
                    }))
                  }
                  options={[
                    {
                      value: "DocumentVerificationAgent",
                      label: "Document Verification",
                    },
                    { value: "EligibilityEvaluationAgent", label: "Eligibility" },
                  ]}
                />

                {/* <Select
                  size="large"
                  value={query.status || undefined}
                  placeholder="Status"
                  allowClear
                  onChange={(value) =>
                    setQuery((prev) => ({
                      ...prev,
                      status: value || "",
                      pageNumber: 1,
                    }))
                  }
                  options={[
                    { value: "llm_response", label: "LLM Response" },
                    { value: "success", label: "Success" },
                    { value: "error", label: "Error" },
                    { value: "done", label: "Done" },
                  ]}
                /> */}

                <Button
                  size="large"
                  icon={<FilterOutlined />}
                  className="lg:w-full"
                  onClick={() => {
                    setSearchTypeDraft("applicationId");
                    setSearchValueDraft("");
                    setQuery({
                      pageNumber: 1,
                      pageSize: 10,
                      search: "",
                      searchType: "applicationId",
                      agentType: "",
                      status: "",
                      sortBy: "createdAt",
                      sortDesc: true,
                    });
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </Card>

          <Spin spinning={loading}>
            <div className="space-y-5">
              {logs.length === 0 && !loading ? (
                <Card className="rounded-3xl border-0 shadow-sm">
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Không tìm thấy agent log nào. Thử điều chỉnh bộ lọc hoặc tìm kiếm khác."
                  />
                </Card>
              ) : (
                logs.map((log) => {
                  const parsed = safeParseOutput(log.outputData);
                  const resultMeta = getResultMeta(parsed?.result);
                  const statusMeta = getStatusMeta(log.status);

                  return (
                    <Card
                      key={log.logId}
                      className={[
                        "overflow-hidden rounded-3xl border-0 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg",
                        `shadow-${resultMeta.glow}`,
                      ].join(" ")}
                      styles={{ body: { padding: 0 } }}
                    >
                      <div className={`h-1 bg-gradient-to-r ${resultMeta.accent}`} />

                      <div className="p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-2xl font-semibold text-slate-900">
                                {log.agentType}
                              </h3>

                              <Tag
                                className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.className}`}
                              >
                                {statusMeta.label}
                              </Tag>

                              {parsed?.result && (
                                <Tag
                                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${resultMeta.className}`}
                                >
                                  {resultMeta.label}
                                </Tag>
                              )}
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                              <span className="inline-flex items-center gap-1.5">
                                <FileTextOutlined />
                                Đơn #{log.applicationId}
                              </span>
                              <span>•</span>
                              <span>Doc #{log.documentId}</span>
                              <span>•</span>
                              <span>Ứng viên #{log.applicantId}</span>
                              <span>•</span>
                              <span>{new Date(log.createdAt).toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Tag className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sky-700">
                              {log.action}
                            </Tag>
                          </div>
                        </div>

                        <div className="mt-6 grid gap-4 lg:grid-cols-12">
                          <div className="lg:col-span-9">
                            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                              <div className="mb-2 text-sm font-semibold text-slate-700">
                                Kết quả khuyến nghị của AI 
                              </div>
                              <p className="text-[15px] leading-7 text-slate-600">
                                {parsed?.details ||
                                  "No structured recommendation details available."}
                              </p>
                            </div>

                            <div className="mt-4 grid gap-3 md:grid-cols-3">
                              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                                <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                  Status
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                  {resultMeta.icon}
                                  <span className="font-semibold text-slate-800">
                                    {parsed?.result || "unknown"}
                                  </span>
                                </div>
                              </div>

                              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                                <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                  Model
                                </div>
                                <div className="mt-2 font-semibold text-slate-800">
                                  {parsed?.model || "—"}
                                </div>
                              </div>

                              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                                <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                  Đầu ra
                                </div>
                                <div className="mt-2 font-semibold text-slate-800">
                                  {log.status}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="lg:col-span-3">
                            <div
                              className={`rounded-2xl bg-gradient-to-br ${resultMeta.accent} p-4 text-white shadow-lg`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-white/90">
                                  Kết quả
                                </span>
                                <Badge status="processing" />
                              </div>

                              <div className="mt-2 text-2xl font-bold capitalize">
                                {parsed?.result || "unknown"}
                              </div>

                              <div className="mt-2 text-sm text-white/85">
                                Mở rộng để xem chi tiết khuyến nghị của AI và so sánh với tài liệu gốc.
                              </div>
                            </div>

                            <div className="mt-4 flex flex-col gap-2">
                              <Button
                                icon={<EyeOutlined />}
                                className="h-11 rounded-xl"
                                onClick={() => openCompareModal(log)}
                              >
                                So sánh Kết quả
                              </Button>

                              <Button
                                icon={<CodeOutlined />}
                                className="h-11 rounded-xl"
                                onClick={() =>
                                  setSelectedThinking(
                                    parsed?.thinking ||
                                      "No LLM thinking available."
                                  )
                                }
                              >
                                Xem LLM reasoning
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </Spin>

          {total > 0 && (
            <div className="mt-6 flex justify-end">
              <Pagination
                current={query.pageNumber}
                pageSize={query.pageSize}
                total={total}
                showSizeChanger
                onChange={(page, pageSize) =>
                  setQuery((prev) => ({
                    ...prev,
                    pageNumber: page,
                    pageSize,
                  }))
                }
              />
            </div>
          )}
        </div>

        <Modal
          open={compareOpen}
          onCancel={() => {
            setCompareOpen(false);
            setCompareData(null);
          }}
          footer={null}
          width={1180}
          title="So sánh Kết quả"
          destroyOnClose
        >
          <Spin spinning={compareLoading}>
            {compareData && (
              <div className="space-y-5">
                <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-violet-950 p-5 text-white">
                  <div className="flex flex-wrap items-center gap-3">
                    <Tag
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                        getResultMeta(compareData.parsed?.result).className
                      }`}
                    >
                      {compareData.parsed?.result || "unknown"}
                    </Tag>
                    <Tag className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-white">
                      {compareData.log.agentType}
                    </Tag>
                    <Tag className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-white">
                      {compareData.log.status}
                    </Tag>
                  </div>

                  <div className="mt-3 text-sm text-white/75">
                    Đơn #{compareData.log.applicationId} • Ứng viên #{compareData.log.applicantId} • Tài liệu #{compareData.log.documentId}
                  </div>

                  <p className="mt-4 whitespace-pre-wrap text-[15px] leading-7 text-white/90">
                    {compareData.parsed?.details ||
                      "No recommendation details available."}
                  </p>

                  {compareData.parsed?.thinking ? (
                    <div className="mt-5 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                      <div className="text-xs font-medium uppercase tracking-wide text-white/60">
                        LLM reasoning
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-white/85">
                        {compareData.parsed.thinking}
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <Card
                    className="rounded-3xl border-0 shadow-sm"
                    styles={{ body: { padding: 20 } }}
                  >
                    <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                      <FileTextOutlined />
                      Hồ sơ Ứng viên
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <StatBox
                        label="Họ và tên"
                        value={getValue(compareData.applicant?.fullName)}
                        tone="violet"
                      />
                      <StatBox
                        label="Ngày sinh"
                        value={getValue(compareData.applicant?.dateOfBirth)}
                        tone="sky"
                      />
                      <StatBox
                        label="Giới tính"
                        value={getValue(compareData.applicant?.gender)}
                        tone="emerald"
                      />
                      <StatBox
                        label="Số CMND/CCCD"
                        value={getValue(compareData.applicant?.idIssueNumber)}
                        tone="amber"
                      />
                      <StatBox
                        label="Số điện thoại"
                        value={getValue(compareData.applicant?.contactPhone)}
                        tone="rose"
                      />
                      <StatBox
                        label="Email liên hệ"
                        value={getValue(compareData.applicant?.contactEmail)}
                        tone="sky"
                      />
                      <StatBox
                        label="Tên trường THPT"
                        value={getValue(compareData.applicant?.highSchoolName)}
                        tone="slate"
                      />
                      <StatBox
                        label="Năm tốt nghiệp"
                        value={getValue(compareData.applicant?.graduationYear)}
                        tone="violet"
                      />
                      <StatBox
                        label="Khu vực trường THPT"
                        value={getValue(compareData.applicant?.highSchoolDistrict)}
                      />
                      <StatBox
                        label="Tỉnh/Thành phố trường THPT"
                        value={getValue(compareData.applicant?.highSchoolProvince)}
                      />
                      <StatBox
                        label="Ngày cấp CMND/CCCD"
                        value={getValue(compareData.applicant?.idIssueDate)}
                      />
                      <StatBox
                        label="Nơi cấp CMND/CCCD"
                        value={getValue(compareData.applicant?.idIssuePlace)}
                      />
                      <StatBox
                        label="Tên người liên hệ"
                        value={getValue(compareData.applicant?.contactName)}
                      />
                      <StatBox
                        label="Cho phép chia sẻ"
                        value={getValue(compareData.applicant?.allowShare)}
                      />
                    </div>
                  </Card>

                  <Card
                    className="rounded-3xl border-0 shadow-sm"
                    styles={{ body: { padding: 20 } }}
                  >
                    <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                      <EyeOutlined />
                      So sánh với Tài liệu Gốc
                    </div>

                    {compareData.matchedDocument ? (
                      <div className="space-y-4">
                        <div className="grid gap-3 md:grid-cols-2">
                          <StatBox
                            label="Tên file"
                            value={getValue(compareData.matchedDocument.fileName)}
                            tone="violet"
                          />
                          <StatBox
                            label="Loại tài liệu"
                            value={getValue(compareData.matchedDocument.documentType)}
                            tone="sky"
                          />
                          <StatBox
                            label="File format"
                            value={getValue(compareData.matchedDocument.fileFormat)}
                            tone="emerald"
                          />
                          <StatBox
                            label="Kết quả xác minh"
                            value={getValue(
                              compareData.matchedDocument.verificationResult
                            )}
                            tone="amber"
                          />
                        </div>

                        <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                          <div className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-3">
                            Xem tài liệu
                          </div>
                          {renderDocumentPreview(compareData.matchedDocument)}
                        </div>

                        {compareData.matchedDocument.verificationDetails ? (
                          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                            <div className="text-xs font-medium uppercase tracking-wide text-amber-500">
                              Chi tiết xác minh
                            </div>
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-amber-900">
                              {compareData.matchedDocument.verificationDetails}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                        Không tìm thấy tài liệu nào khớp với log này. Có thể do tài liệu gốc đã bị xóa hoặc log này không liên quan đến tài liệu cụ thể nào.
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            )}
          </Spin>
        </Modal>

        <Modal
          open={!!selectedThinking}
          onCancel={() => setSelectedThinking(null)}
          footer={null}
          width={900}
          title="LLM Reasoning"
          destroyOnClose
        >
          <div className="rounded-2xl bg-slate-50 p-4 max-h-[70vh] overflow-auto">
            <pre className="whitespace-pre-wrap text-sm leading-7 text-slate-700 font-mono">
              {selectedThinking}
            </pre>
          </div>
        </Modal>
      </div>
    </QALayout>
  );
}