import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { SorterResult } from "antd/es/table/interface";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  FilePlus2,
  RefreshCw,
  Search,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getActiveAdmissionTypesBasic,
  getAdmissionTypeById,
} from "../../api/admission-types";
import {
  fetchAllApplications,
  patchApplication,
  requestAdditionalDocuments,
} from "../../api/applications";
import { getActiveBasicCampuses } from "../../api/campuses";
import { getActiveProgramsBasic } from "../../api/programs";
import { OfficerLayout } from "../../components/layouts/OfficerLayout";
import type { AdmissionTypeBasic } from "../../types/admission.type";
import {
  APPLICATION_NEED_ACTION_PRESET_COMBO_LABEL,
  APPLICATION_PENDING_PRESET_COMBO_LABEL,
  APPLICATION_REQUIRES_REVIEW_LABEL,
  APPLICATION_STATUS,
  type Application,
  type ApplicationStatus,
} from "../../types/application";
import type { CampusBasic } from "../../types/campus";
import type { ProgramBasic } from "../../types/program";

const { Title, Text } = Typography;
const { Option } = Select;

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_TAG_COLOR: Record<ApplicationStatus, string> = {
  draft: "default",
  submitted: "blue",
  under_review: "processing",
  approved: "success",
  rejected: "error",
  document_required: "warning",
};

const statusConfig: Record<ApplicationStatus, { label: string; color: string }> = {
  draft: {
    label: APPLICATION_STATUS.draft,
    color: STATUS_TAG_COLOR.draft,
  },
  submitted: {
    label: APPLICATION_STATUS.submitted,
    color: STATUS_TAG_COLOR.submitted,
  },
  under_review: {
    label: APPLICATION_STATUS.under_review,
    color: STATUS_TAG_COLOR.under_review,
  },
  approved: {
    label: APPLICATION_STATUS.approved,
    color: STATUS_TAG_COLOR.approved,
  },
  rejected: {
    label: APPLICATION_STATUS.rejected,
    color: STATUS_TAG_COLOR.rejected,
  },
  document_required: {
    label: APPLICATION_STATUS.document_required,
    color: STATUS_TAG_COLOR.document_required,
  },
};

function isEscalated(app: Application) {
  return app.status === "under_review" || app.requiresReview;
}

const APPLICATION_STATUSES: ApplicationStatus[] = [
  "draft",
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "document_required",
];

function isApplicationStatus(s: string): s is ApplicationStatus {
  return APPLICATION_STATUSES.includes(s as ApplicationStatus);
}

/** Preset từ dashboard (API chỉ lọc 1 status / cờ — gộp nhiều request). */
type DashboardListPreset = "pending" | "need_action";

const DASHBOARD_PRESET_HINT_SUFFIX = " (từ dashboard)";

function dashboardPresetHint(preset: DashboardListPreset | null): string | null {
  if (preset === "pending")
    return `Đang lọc: ${APPLICATION_PENDING_PRESET_COMBO_LABEL}${DASHBOARD_PRESET_HINT_SUFFIX}`;
  if (preset === "need_action")
    return `Đang lọc: ${APPLICATION_NEED_ACTION_PRESET_COMBO_LABEL}${DASHBOARD_PRESET_HINT_SUFFIX}`;
  return null;
}

function sortByLastUpdatedDesc(a: Application, b: Application) {
  return (
    new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
  );
}

function mergeApplicationsById(lists: Application[][]): Application[] {
  const map = new Map<number, Application>();
  for (const list of lists) {
    for (const app of list) {
      map.set(app.applicationId, app);
    }
  }
  return [...map.values()].sort(sortByLastUpdatedDesc);
}

/** Giới hạn số bản ghi dùng để suy ra giá trị filter còn “có trong response” (API phân trang). */
const FACET_LIST_PAGE_CAP = 1000;

type FilterDimensionAvailability = {
  statuses: Set<ApplicationStatus>;
  campusIds: Set<number>;
  programIds: Set<number>;
  admissionTypeIds: Set<number>;
  anyRequiresReview: boolean;
};

function emptyFilterAvailability(): FilterDimensionAvailability {
  return {
    statuses: new Set(),
    campusIds: new Set(),
    programIds: new Set(),
    admissionTypeIds: new Set(),
    anyRequiresReview: false,
  };
}

/** Một tập hồ sơ (vd. preset đã merge) — mọi chiều lọc lấy từ cùng response. */
function buildAvailabilityFromApps(apps: Application[]): FilterDimensionAvailability {
  const out = emptyFilterAvailability();
  for (const a of apps) {
    out.statuses.add(a.status);
    out.campusIds.add(a.campusId);
    out.programIds.add(a.programId);
    out.admissionTypeIds.add(a.admissionTypeId);
    if (a.requiresReview) out.anyRequiresReview = true;
  }
  return out;
}

/**
 * Bốn lát response API (mỗi lát bỏ một chiều lọc) để option không xuất hiện
 * trong tập ứng viên thì disabled.
 */
function mergeAvailabilityFromFacetSlices(
  statusItems: Application[],
  campusItems: Application[],
  programItems: Application[],
  admissionItems: Application[],
): FilterDimensionAvailability {
  const statuses = new Set<ApplicationStatus>();
  for (const a of statusItems) statuses.add(a.status);
  const campusIds = new Set<number>();
  for (const a of campusItems) campusIds.add(a.campusId);
  const programIds = new Set<number>();
  for (const a of programItems) programIds.add(a.programId);
  const admissionTypeIds = new Set<number>();
  for (const a of admissionItems) admissionTypeIds.add(a.admissionTypeId);
  const scan = [
    ...statusItems,
    ...campusItems,
    ...programItems,
    ...admissionItems,
  ];
  const anyRequiresReview = scan.some((a) => a.requiresReview);
  return {
    statuses,
    campusIds,
    programIds,
    admissionTypeIds,
    anyRequiresReview,
  };
}

/** Option disabled khi chưa có trong response; luôn cho phép giá trị đang chọn để đổi được. */
function dimOptionDisabled(
  facetReady: boolean,
  presentInResponse: boolean,
  isCurrentlySelected: boolean,
): boolean {
  if (!facetReady) return false;
  return !presentInResponse && !isCurrentlySelected;
}

const SELECT_DISABLED_OPTION_CURSOR =
  "[&_.ant-select-item-option-disabled]:cursor-not-allowed [&_.ant-select-item-option-disabled]:opacity-50";

/** Đọc query lần đầu — tránh race: loadServerPage chạy trước khi useEffect đồng bộ URL. */
function parseListQueryState(sp: URLSearchParams): {
  dashboardPreset: DashboardListPreset | null;
  filterStatus: ApplicationStatus | "all";
} {
  const preset = sp.get("preset");
  if (preset === "pending" || preset === "need_action") {
    return { dashboardPreset: preset, filterStatus: "all" };
  }
  const st = sp.get("status");
  if (st && isApplicationStatus(st)) {
    return { dashboardPreset: null, filterStatus: st };
  }
  return { dashboardPreset: null, filterStatus: "all" };
}

function normalizeRequiredDocumentList(raw: string | null | undefined) {
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => String(item).trim())
        .filter(Boolean)
        .join(", ");
    }
  } catch {
    // Fallback: keep plain text if it is not JSON.
  }
  return String(raw).trim();
}

// ─── Component ────────────────────────────────────────────────────────────────

const PRESET_PAGE_SIZE = 20;

export function OfficerApplicationList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [messageApi, contextHolder] = message.useMessage();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // ── Server-side filter / sort / page params ──────────────────────────────
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch]           = useState<string | undefined>();
  /** Khởi tạo từ URL ngay mount — tránh loadServerPage gọi API trước khi useEffect đồng bộ query. */
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | "all">(() =>
    parseListQueryState(searchParams).filterStatus
  );
  const [filterCampusId, setFilterCampusId] = useState<number | "all">("all");
  const [filterProgramId, setFilterProgramId] = useState<number | "all">("all");
  const [filterAdmissionTypeId, setFilterAdmissionTypeId] = useState<number | "all">("all");
  const [onlyEscalated, setOnlyEscalated] = useState(false);
  /** Gộp draft+submitted hoặc under_review+requiresReview (query ?preset=). */
  const [dashboardPreset, setDashboardPreset] = useState<DashboardListPreset | null>(() =>
    parseListQueryState(searchParams).dashboardPreset
  );
  const [mergedBuffer, setMergedBuffer] = useState<Application[]>([]);
  const [pageNumber, setPageNumber]   = useState(1);
  const [pageSize, setPageSize]       = useState(20);
  const [sortBy, setSortBy]           = useState<string | undefined>();
  /** Mặc định true: API trả đơn mới nhất trước; false thì ngược lại (khi chưa chọn sort theo cột). */
  const [sortDesc, setSortDesc]       = useState(true);
  const [campuses, setCampuses] = useState<CampusBasic[]>([]);
  const [programs, setPrograms] = useState<ProgramBasic[]>([]);
  const [admissionTypes, setAdmissionTypes] = useState<AdmissionTypeBasic[]>([]);
  const [filterAvailability, setFilterAvailability] =
    useState<FilterDimensionAvailability>(emptyFilterAvailability);
  const [facetReady, setFacetReady] = useState(false);

  // Debounce search input (500 ms)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(value || undefined);
      setPageNumber(1);
    }, 500);
  };

  // Modals
  const [rejectModal, setRejectModal] = useState<{ open: boolean; id: number | string }>({
    open: false, id: "",
  });
  const [supplementModal, setSupplementModal] = useState<{ open: boolean; id: number | string }>({
    open: false, id: "",
  });
  const [rejectForm] = Form.useForm();
  const [supplementForm] = Form.useForm();

  // ── Load data ─────────────────────────────────────────────────────────────
  const loadFilterOptions = useCallback(async () => {
    try {
      const [campusData, programData, admissionTypeData] = await Promise.all([
        getActiveBasicCampuses(),
        getActiveProgramsBasic(),
        getActiveAdmissionTypesBasic(),
      ]);
      setCampuses(campusData);
      setPrograms(programData);
      setAdmissionTypes(admissionTypeData);
    } catch {
      messageApi.error("Không thể tải dữ liệu bộ lọc.");
    }
  }, [messageApi]);

  const listQueryBase = useMemo(
    () => ({
      search,
      campusId: filterCampusId !== "all" ? filterCampusId : undefined,
      programId: filterProgramId !== "all" ? filterProgramId : undefined,
      admissionTypeId:
        filterAdmissionTypeId !== "all" ? filterAdmissionTypeId : undefined,
    }),
    [search, filterCampusId, filterProgramId, filterAdmissionTypeId]
  );

  const loadDashboardPresetData = useCallback(async () => {
    if (!dashboardPreset) return;
    setLoading(true);
    setFacetReady(false);
    try {
      if (dashboardPreset === "pending") {
        const [draftRes, subRes] = await Promise.all([
          fetchAllApplications({
            ...listQueryBase,
            status: "draft",
            pageNumber: 1,
            pageSize: PRESET_PAGE_SIZE,
            sortBy: "lastUpdated",
            sortDesc: true,
          }),
          fetchAllApplications({
            ...listQueryBase,
            status: "submitted",
            pageNumber: 1,
            pageSize: PRESET_PAGE_SIZE,
            sortBy: "lastUpdated",
            sortDesc: true,
          }),
        ]);
        const merged = mergeApplicationsById([draftRes.items, subRes.items]);
        setMergedBuffer(merged);
        setTotalCount(merged.length);
        setFilterAvailability(buildAvailabilityFromApps(merged));
        setFacetReady(true);
        return;
      }

      const [urRes, rrRes] = await Promise.all([
        fetchAllApplications({
          ...listQueryBase,
          status: "under_review",
          pageNumber: 1,
          pageSize: PRESET_PAGE_SIZE,
          sortBy: "lastUpdated",
          sortDesc: true,
        }),
        fetchAllApplications({
          ...listQueryBase,
          requiresReview: true,
          pageNumber: 1,
          pageSize: PRESET_PAGE_SIZE,
          sortBy: "lastUpdated",
          sortDesc: true,
        }),
      ]);
      const merged = mergeApplicationsById([urRes.items, rrRes.items]);
      setMergedBuffer(merged);
      setTotalCount(merged.length);
      setFilterAvailability(buildAvailabilityFromApps(merged));
      setFacetReady(true);
    } catch {
      messageApi.error("Không thể tải danh sách hồ sơ.");
      setMergedBuffer([]);
      setTotalCount(0);
      setApplications([]);
      setFilterAvailability(emptyFilterAvailability());
      setFacetReady(false);
    } finally {
      setLoading(false);
    }
  }, [dashboardPreset, listQueryBase, messageApi]);

  const loadServerPage = useCallback(async () => {
    if (dashboardPreset) return;
    setLoading(true);
    setFacetReady(false);
    try {
      setMergedBuffer([]);
      const result = await fetchAllApplications({
        ...listQueryBase,
        status: filterStatus !== "all" ? filterStatus : undefined,
        requiresReview: onlyEscalated ? true : undefined,
        pageNumber,
        pageSize,
        sortBy,
        sortDesc: sortBy ? sortDesc : true,
      });
      setApplications(result.items);
      setTotalCount(result.totalCount);

      const facetPageSize = Math.min(
        FACET_LIST_PAGE_CAP,
        Math.max(result.totalCount, 1),
      );
      const facetSort = {
        sortBy: "lastUpdated" as const,
        sortDesc: true as const,
      };
      const esc = onlyEscalated ? ({ requiresReview: true as const } as const) : {};
      const st =
        filterStatus !== "all"
          ? ({ status: filterStatus } as const)
          : ({} as const);

      if (result.totalCount === 0) {
        setFilterAvailability(emptyFilterAvailability());
      } else {
        const [forStatus, forCampus, forProgram, forAdmission] =
          await Promise.all([
            fetchAllApplications({
              search: listQueryBase.search,
              campusId: listQueryBase.campusId,
              programId: listQueryBase.programId,
              admissionTypeId: listQueryBase.admissionTypeId,
              ...esc,
              pageNumber: 1,
              pageSize: facetPageSize,
              ...facetSort,
            }),
            fetchAllApplications({
              search: listQueryBase.search,
              programId: listQueryBase.programId,
              admissionTypeId: listQueryBase.admissionTypeId,
              ...st,
              ...esc,
              pageNumber: 1,
              pageSize: facetPageSize,
              ...facetSort,
            }),
            fetchAllApplications({
              search: listQueryBase.search,
              campusId: listQueryBase.campusId,
              admissionTypeId: listQueryBase.admissionTypeId,
              ...st,
              ...esc,
              pageNumber: 1,
              pageSize: facetPageSize,
              ...facetSort,
            }),
            fetchAllApplications({
              search: listQueryBase.search,
              campusId: listQueryBase.campusId,
              programId: listQueryBase.programId,
              ...st,
              ...esc,
              pageNumber: 1,
              pageSize: facetPageSize,
              ...facetSort,
            }),
          ]);
        setFilterAvailability(
          mergeAvailabilityFromFacetSlices(
            forStatus.items,
            forCampus.items,
            forProgram.items,
            forAdmission.items,
          ),
        );
      }
      setFacetReady(true);
    } catch {
      messageApi.error("Không thể tải danh sách hồ sơ.");
      setFilterAvailability(emptyFilterAvailability());
      setFacetReady(false);
    } finally {
      setLoading(false);
    }
  }, [
    dashboardPreset,
    listQueryBase,
    filterStatus,
    filterCampusId,
    filterProgramId,
    filterAdmissionTypeId,
    onlyEscalated,
    pageNumber,
    pageSize,
    sortBy,
    sortDesc,
    messageApi,
  ]);

  const searchParamsKey = searchParams.toString();
  useEffect(() => {
    const preset = searchParams.get("preset");
    const st = searchParams.get("status");
    if (preset === "pending" || preset === "need_action") {
      setDashboardPreset(preset);
      setFilterStatus("all");
      setOnlyEscalated(false);
      setPageNumber(1);
    } else if (st && isApplicationStatus(st)) {
      setDashboardPreset(null);
      setMergedBuffer([]);
      setFilterStatus(st);
      setOnlyEscalated(false);
      setPageNumber(1);
    } else {
      setDashboardPreset(null);
      setMergedBuffer([]);
    }
  }, [searchParamsKey]);

  useEffect(() => {
    if (!dashboardPreset) return;
    void loadDashboardPresetData();
  }, [dashboardPreset, loadDashboardPresetData]);

  useEffect(() => {
    if (dashboardPreset) return;
    void loadServerPage();
  }, [dashboardPreset, loadServerPage]);

  useEffect(() => {
    if (!dashboardPreset || mergedBuffer.length === 0) return;
    const start = (pageNumber - 1) * pageSize;
    setApplications(mergedBuffer.slice(start, start + pageSize));
  }, [dashboardPreset, pageNumber, pageSize, mergedBuffer]);
  useEffect(() => { loadFilterOptions(); }, [loadFilterOptions]);

  // ── Table change handler (sort + page) ────────────────────────────────────
  const handleTableChange = (
    pagination: TablePaginationConfig,
    _filters: unknown,
    sorter: SorterResult<Application> | SorterResult<Application>[],
  ) => {
    if (pagination.current)  setPageNumber(pagination.current);
    if (pagination.pageSize) setPageSize(pagination.pageSize);

    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    if (s?.columnKey && s.order) {
      setSortBy(String(s.columnKey));
      setSortDesc(s.order === "descend");
    } else {
      setSortBy(undefined);
      setSortDesc(true);
    }
  };

  // ── Filter change helpers (reset to page 1) ───────────────────────────────
  const syncListSearchParams = useCallback(
    (mutate: (p: URLSearchParams) => void) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        mutate(next);
        return next;
      });
    },
    [setSearchParams]
  );

  const handleStatusChange = (val: ApplicationStatus | "all") => {
    syncListSearchParams((p) => {
      p.delete("preset");
      if (val === "all") p.delete("status");
      else p.set("status", val);
    });
    setDashboardPreset(null);
    setMergedBuffer([]);
    setFilterStatus(val);
    setPageNumber(1);
  };

  const handleEscalatedChange = (checked: boolean) => {
    syncListSearchParams((p) => {
      p.delete("preset");
    });
    setDashboardPreset(null);
    setMergedBuffer([]);
    setOnlyEscalated(checked);
    setPageNumber(1);
  };

  const handleCampusChange = (val: number | "all") => {
    setFilterCampusId(val);
    setPageNumber(1);
  };

  const handleProgramChange = (val: number | "all") => {
    setFilterProgramId(val);
    setPageNumber(1);
  };

  const handleAdmissionTypeChange = (val: number | "all") => {
    setFilterAdmissionTypeId(val);
    setPageNumber(1);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearchInput("");
    setSearch(undefined);
    setFilterStatus("all");
    setFilterCampusId("all");
    setFilterProgramId("all");
    setFilterAdmissionTypeId("all");
    setOnlyEscalated(false);
    setDashboardPreset(null);
    setMergedBuffer([]);
    setPageNumber(1);
    setSortBy(undefined);
    setSortDesc(true);
  };

  const refreshList = useCallback(() => {
    if (dashboardPreset) void loadDashboardPresetData();
    else void loadServerPage();
  }, [dashboardPreset, loadDashboardPresetData, loadServerPage]);

  // ─── Actions ──────────────────────────────────────────────────────────────

  const handleApprove = async (id: number | string) => {
    const strId = String(id);
    const targetApp = applications.find((a) => String(a.applicationId) === strId);
    if (!targetApp || targetApp.status !== "under_review") {
      messageApi.warning("Chỉ có thể phê duyệt khi hồ sơ ở trạng thái chờ xét duyệt.");
      return;
    }

    setActionLoading(strId + "_approve");
    try {
      await patchApplication(Number(id), { status: "approved" });
      messageApi.success("Đã phê duyệt hồ sơ.");
      setApplications((prev) =>
        prev.map((a) =>
          String(a.applicationId) === strId
            ? { ...a, status: "approved" as ApplicationStatus }
            : a
        )
      );
    } catch {
      messageApi.error("Phê duyệt thất bại, vui lòng thử lại.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSubmit = async () => {
    try {
      await rejectForm.validateFields();
      const strId = String(rejectModal.id);
      const targetApp = applications.find((a) => String(a.applicationId) === strId);
      if (!targetApp || targetApp.status !== "under_review") {
        messageApi.warning("Chỉ có thể từ chối khi hồ sơ ở trạng thái chờ xét duyệt.");
        return;
      }

      setActionLoading(strId + "_reject");
      await patchApplication(Number(rejectModal.id), { status: "rejected" });
      messageApi.success("Đã từ chối hồ sơ.");
      setApplications((prev) =>
        prev.map((a) =>
          String(a.applicationId) === strId
            ? { ...a, status: "rejected" as ApplicationStatus }
            : a
        )
      );
      setRejectModal({ open: false, id: "" });
      rejectForm.resetFields();
    } catch {
      messageApi.error("Từ chối thất bại, vui lòng thử lại.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSupplementSubmit = async () => {
    try {
      const targetApp = applications.find(
        (a) => String(a.applicationId) === String(supplementModal.id),
      );
      if (!targetApp || targetApp.status !== "under_review") {
        messageApi.warning("Chỉ có thể yêu cầu bổ sung khi hồ sơ đang chờ xét duyệt.");
        return;
      }

      const values = await supplementForm.validateFields();
      const strId = String(supplementModal.id);
      const docsNeed = String(values.note ?? "");

      setActionLoading(strId + "_supplement");
      const updated = await requestAdditionalDocuments(Number(supplementModal.id), { docsNeed });

      messageApi.success("Đã gửi yêu cầu bổ sung tài liệu.");

      setApplications((prev) =>
        prev.map((a) =>
          String(a.applicationId) === strId
            ? {
                ...a,
                status: updated.status,
                requiresReview: updated.requiresReview,
                lastUpdated: updated.lastUpdated || a.lastUpdated,
                assignedOfficerId: updated.assignedOfficerId,
                assignedOfficerName: updated.assignedOfficerName,
              }
            : a
        )
      );

      setSupplementModal({ open: false, id: "" });
      supplementForm.resetFields();
    } catch {
      messageApi.error("Gửi yêu cầu thất bại, vui lòng thử lại.");
    } finally {
      setActionLoading(null);
    }
  };

  const openSupplementModal = async (record: Application) => {
    if (record.status !== "under_review") {
      messageApi.warning("Chỉ có thể yêu cầu bổ sung khi hồ sơ đang chờ xét duyệt.");
      return;
    }

    let suggestedDocs = "";
    try {
      const admissionType = await getAdmissionTypeById(record.admissionTypeId);
      suggestedDocs = normalizeRequiredDocumentList(admissionType.requiredDocumentList);
    } catch {
      // Keep modal usable even if suggestion fetch fails.
    }

    setSupplementModal({ open: true, id: record.applicationId });
    supplementForm.setFieldsValue({ note: suggestedDocs });
  };

  // ─── Columns ──────────────────────────────────────────────────────────────

  const columns: ColumnsType<Application> = [
    {
      title: "Mã hồ sơ",
      dataIndex: "applicationId",
      key: "applicationId",
      width: 120,
      render: (id: string) => (
        <Text className="font-mono text-xs text-indigo-600 font-semibold">{id}</Text>
      ),
    },
    {
      title: "Thí sinh",
      dataIndex: "applicantName",
      key: "applicantName",
      sorter: true,
      render: (name: string, record) => (
        <div>
          <Text className="font-medium text-gray-800 block">{name}</Text>
          <Text className="text-xs text-gray-400">{record.campusName}</Text>
        </div>
      ),
    },
    {
      title: "Ngành",
      dataIndex: "programName",
      key: "programName",
      sorter: true,
      render: (prog: string, record) => (
        <div>
          <Text className="text-gray-700 text-sm block">{prog}</Text>
          <Text className="text-xs text-gray-400">{record.admissionTypeName}</Text>
        </div>
      ),
    },
    {
      title: "Ngày nộp",
      dataIndex: "submittedAt",
      key: "submittedAt",
      width: 120,
      sorter: true,
      render: (date: string) =>
        date ? (
          <Text className="text-gray-500 text-sm">
            {new Date(date).toLocaleDateString("vi-VN")}
          </Text>
        ) : (
          <Text className="text-gray-300 text-sm">—</Text>
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (_: ApplicationStatus, record: Application) => {
        const cfg = statusConfig[record.status];
        return (
          <Space size={4} wrap className="max-w-[200px]">
            <Tag color={cfg.color} className="text-xs">
              {cfg.label}
            </Tag>
            {record.requiresReview && (
              <Tag
                color="error"
                className="text-xs !inline-flex !items-center gap-1 !m-0"
              >
                <TriangleAlert className="size-3.5 shrink-0" aria-hidden />
                {APPLICATION_REQUIRES_REVIEW_LABEL}
              </Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: "Hành động",
      key: "actions",
      width: 160,
      fixed: "right" as const,
      render: (_: unknown, record: Application) => {
        const id = record.applicationId;
        const strId = String(id);
        const canReview = record.status === "under_review";
        const canRequestSupplement = record.status === "under_review";

        return (
          <Space size={4}>
            <Tooltip title="Xem chi tiết">
              <Button
                size="small"
                icon={<Eye size={13} />}
                onClick={() => navigate(`/officer/applications/${strId}`)}
                className="!rounded-lg"
              />
            </Tooltip>

            {canReview ? (
              <Popconfirm
                title="Phê duyệt hồ sơ này?"
                okText="Phê duyệt"
                cancelText="Huỷ"
                onConfirm={() => handleApprove(id)}
              >
                <Tooltip title="Phê duyệt">
                  <Button
                    size="small"
                    icon={<CheckCircle2 size={13} />}
                    type="primary"
                    loading={actionLoading === strId + "_approve"}
                    className="!rounded-lg !bg-emerald-500 !border-emerald-500 hover:!bg-emerald-600"
                  />
                </Tooltip>
              </Popconfirm>
            ) : (
              <Tooltip title="Chỉ phê duyệt được khi hồ sơ ở trạng thái chờ xét duyệt">
                <span>
                  <Button
                    size="small"
                    icon={<CheckCircle2 size={13} />}
                    type="primary"
                    disabled
                    className="!rounded-lg !bg-emerald-500 !border-emerald-500"
                  />
                </span>
              </Tooltip>
            )}

            <Tooltip
              title={
                canReview
                  ? "Từ chối"
                  : "Chỉ từ chối được khi hồ sơ ở trạng thái chờ xét duyệt"
              }
            >
              <Button
                size="small"
                icon={<XCircle size={13} />}
                danger
                disabled={!canReview}
                loading={actionLoading === strId + "_reject"}
                onClick={() => setRejectModal({ open: true, id })}
                className="!rounded-lg"
              />
            </Tooltip>

            <Tooltip
              title={
                canRequestSupplement
                  ? "Yêu cầu bổ sung"
                  : "Chỉ yêu cầu bổ sung khi hồ sơ ở trạng thái chờ xét duyệt"
              }
            >
              <Button
                size="small"
                icon={<FilePlus2 size={13} />}
                disabled={!canRequestSupplement}
                loading={actionLoading === strId + "_supplement"}
                onClick={() => openSupplementModal(record)}
                className="!rounded-lg !text-amber-600 !border-amber-300 hover:!border-amber-400"
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  // ─── Active filter badge count ────────────────────────────────────────────

  const activeFilterCount = [
    !!search,
    filterStatus !== "all",
    filterCampusId !== "all",
    filterProgramId !== "all",
    filterAdmissionTypeId !== "all",
    onlyEscalated,
    !!dashboardPreset,
  ].filter(Boolean).length;

  const presetHint = dashboardPresetHint(dashboardPreset);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <OfficerLayout>
      {contextHolder}

      <div className="flex flex-col gap-6 pb-14 md:pb-16">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Title level={4} className="!mb-1 !text-gray-800 !font-bold">
              Quản Lý Hồ Sơ Tuyển Sinh
            </Title>
            <Text className="text-gray-400 text-sm">
              Tổng cộng {totalCount} hồ sơ
              {activeFilterCount > 0 && ` (đang lọc)`}
            </Text>
          </div>
          <Button
            icon={<RefreshCw size={14} />}
            onClick={refreshList}
            loading={loading}
            className="!rounded-xl shrink-0"
          >
            Làm mới
          </Button>
        </div>

        {/* Filter Card */}
        <Card
          className="rounded-2xl border border-gray-100 shadow-sm"
          styles={{ body: { padding: "16px 20px" } }}
        >
        {presetHint && (
          <Text className="text-xs text-violet-600 block mb-3">{presetHint}</Text>
        )}
        <Row gutter={[12, 12]} align="middle">
          {/* Search */}
          <Col xs={24} md={6}>
            <Input
              placeholder="Tìm mã hồ sơ, thí sinh, ngành..."
              prefix={<Search size={14} className="text-gray-300" />}
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              allowClear
              onClear={() => handleSearchChange("")}
              className="!rounded-xl"
            />
          </Col>

          {/* Trạng thái */}
          <Col xs={12} md={4}>
            <Select
              value={filterStatus}
              onChange={handleStatusChange}
              className="w-full !rounded-xl"
              placeholder="Trạng thái"
              popupClassName={SELECT_DISABLED_OPTION_CURSOR}
            >
              <Option value="all">Tất cả trạng thái</Option>
              {(Object.keys(statusConfig) as ApplicationStatus[]).map((s) => (
                <Option
                  key={s}
                  value={s}
                  disabled={dimOptionDisabled(
                    facetReady,
                    filterAvailability.statuses.has(s),
                    filterStatus === s,
                  )}
                >
                  {statusConfig[s].label}
                </Option>
              ))}
            </Select>
          </Col>

          {/* Cơ sở */}
          <Col xs={12} md={4}>
            <Select
              value={filterCampusId}
              onChange={handleCampusChange}
              className="w-full !rounded-xl"
              placeholder="Cơ sở"
              popupClassName={SELECT_DISABLED_OPTION_CURSOR}
            >
              <Option value="all">Tất cả cơ sở</Option>
              {campuses.map((campus) => (
                <Option
                  key={campus.campusId}
                  value={campus.campusId}
                  disabled={dimOptionDisabled(
                    facetReady,
                    filterAvailability.campusIds.has(campus.campusId),
                    filterCampusId === campus.campusId,
                  )}
                >
                  {campus.name}
                </Option>
              ))}
            </Select>
          </Col>

          {/* Ngành */}
          <Col xs={12} md={4}>
            <Select
              value={filterProgramId}
              onChange={handleProgramChange}
              className="w-full !rounded-xl"
              placeholder="Ngành"
              showSearch
              optionFilterProp="children"
              popupClassName={SELECT_DISABLED_OPTION_CURSOR}
            >
              <Option value="all">Tất cả ngành</Option>
              {programs.map((program) => (
                <Option
                  key={program.programId}
                  value={program.programId}
                  disabled={dimOptionDisabled(
                    facetReady,
                    filterAvailability.programIds.has(program.programId),
                    filterProgramId === program.programId,
                  )}
                >
                  {program.programName}
                </Option>
              ))}
            </Select>
          </Col>

          {/* Phương thức tuyển sinh */}
          <Col xs={12} md={4}>
            <Select
              value={filterAdmissionTypeId}
              onChange={handleAdmissionTypeChange}
              className="w-full !rounded-xl"
              placeholder="Phương thức"
              popupClassName={SELECT_DISABLED_OPTION_CURSOR}
            >
              <Option value="all">Tất cả phương thức</Option>
              {admissionTypes.map((admissionType) => (
                <Option
                  key={admissionType.admissionTypeId}
                  value={admissionType.admissionTypeId}
                  disabled={dimOptionDisabled(
                    facetReady,
                    filterAvailability.admissionTypeIds.has(
                      admissionType.admissionTypeId,
                    ),
                    filterAdmissionTypeId === admissionType.admissionTypeId,
                  )}
                >
                  {admissionType.admissionTypeName}
                </Option>
              ))}
            </Select>
          </Col>

          {/* Hồ sơ cần xem xét */}
          <Col xs={12} md={4}>
            <Select
              value={onlyEscalated ? "escalated" : "all"}
              onChange={(v) => handleEscalatedChange(v === "escalated")}
              className="w-full !rounded-xl"
              popupClassName={SELECT_DISABLED_OPTION_CURSOR}
            >
              <Option value="all">Tất cả hồ sơ</Option>
              <Option
                value="escalated"
                disabled={dimOptionDisabled(
                  facetReady,
                  filterAvailability.anyRequiresReview,
                  onlyEscalated,
                )}
              >
                <span className="flex items-center gap-1 text-rose-600">
                  <AlertTriangle size={13} />
                  Hồ sơ cần xem xét
                </span>
              </Option>
            </Select>
          </Col>

          {/* Xoá bộ lọc */}
          {activeFilterCount > 0 && (
            <Col xs={24} md={2}>
              <Button
                size="small"
                type="link"
                className="!p-0 !text-gray-400"
                onClick={clearFilters}
              >
                Xoá bộ lọc ({activeFilterCount})
              </Button>
            </Col>
          )}
        </Row>
        </Card>

        {/* Table */}
        <Card
          className="rounded-2xl border border-gray-100 shadow-sm"
          styles={{ body: { padding: "0" } }}
        >
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={applications}
            rowKey="applicationId"
            scroll={{ x: 900 }}
            onChange={handleTableChange}
            pagination={{
              current: pageNumber,
              pageSize,
              total: totalCount,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} hồ sơ`,
              pageSizeOptions: ["10", "20", "50"],
              className:
                "!px-4 !pb-4 !pt-3 !box-border sm:!px-6 sm:!pb-5",
            }}
            rowClassName={(record) =>
              isEscalated(record)
                ? "bg-rose-50/40 hover:bg-rose-50"
                : "hover:bg-gray-50 transition-colors"
            }
            expandable={{
              expandedRowRender: (record) =>
                record.notes ? (
                  <div className="mx-4 my-2 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide block mb-2">
                      Ghi chú từ Agent
                    </span>
                    <Text className="text-sm text-gray-700 font-mono whitespace-pre-wrap">
                      {record.notes}
                    </Text>
                  </div>
                ) : (
                  <div className="px-4 py-3 text-gray-400 text-sm italic">
                    Không có ghi chú từ hệ thống.
                  </div>
                ),
              rowExpandable: (record) => !!record.notes,
            }}
            size="middle"
          />
        </Spin>
        </Card>
      </div>

      {/* Reject Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-red-600">
            <XCircle size={18} />
            Từ chối hồ sơ
          </div>
        }
        open={rejectModal.open}
        onCancel={() => {
          setRejectModal({ open: false, id: "" });
          rejectForm.resetFields();
        }}
        onOk={handleRejectSubmit}
        okText="Xác nhận từ chối"
        okButtonProps={{ danger: true }}
        cancelText="Huỷ"
        confirmLoading={actionLoading === rejectModal.id + "_reject"}
      >
        <Form form={rejectForm} layout="vertical" className="mt-4">
          <Form.Item
            name="reason"
            label="Lý do từ chối"
            rules={[{ required: true, message: "Vui lòng nhập lý do từ chối" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập lý do từ chối hồ sơ này..."
              className="!rounded-xl"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Supplement Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-amber-600">
            <FilePlus2 size={18} />
            Yêu cầu bổ sung tài liệu
          </div>
        }
        open={supplementModal.open}
        onCancel={() => {
          setSupplementModal({ open: false, id: "" });
          supplementForm.resetFields();
        }}
        onOk={handleSupplementSubmit}
        okText="Gửi yêu cầu"
        okButtonProps={{ className: "!bg-amber-500 !border-amber-500" }}
        cancelText="Huỷ"
        confirmLoading={actionLoading === supplementModal.id + "_supplement"}
      >
        <Form form={supplementForm} layout="vertical" className="mt-4">
          <Form.Item
            name="note"
            label="Nội dung yêu cầu"
            rules={[{ required: true, message: "Vui lòng nhập nội dung yêu cầu" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Mô tả các tài liệu cần bổ sung..."
              className="!rounded-xl"
            />
          </Form.Item>
        </Form>
      </Modal>
    </OfficerLayout>
  );
}
