import {
  Alert,
  Button,
  Card,
  DatePicker,
  Segmented,
  Space,
  Spin,
  Tooltip,
  Typography,
} from "antd";
import { BarChart2, Download, HelpCircle, RefreshCw } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import {
  fetchAllApplications,
  type FetchAllApplicationsParams,
} from "../../api/applications";
import { OfficerLayout } from "../../layouts/OfficerLayout";
import { useAuth } from "../../hooks/useAuth";
import { useAuthStore } from "../../stores/authStore";
import type { Application } from "../../types/application";
import { getNumericUserIdFromToken } from "../../utils/jwtUserId";
import {
  downloadOfficerApplicationsWorkbook,
  filterApplicationsForReport,
} from "../../utils/officerReportExcel";
import type { Dayjs } from "dayjs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

type Scope = "all" | "mine";

/** Lấy đủ toàn bộ danh sách (nhiều lần tải phân trang). */
async function fetchEveryApplicationPage(
  base?: Omit<FetchAllApplicationsParams, "pageNumber" | "pageSize">,
): Promise<Application[]> {
  const pageSize = 200;
  const maxPages = 500;
  let pageNumber = 1;
  const items: Application[] = [];

  while (pageNumber <= maxPages) {
    const res = await fetchAllApplications({
      ...base,
      pageNumber,
      pageSize,
    });
    if (res.items.length === 0) break;
    items.push(...res.items);
    if (res.items.length < pageSize) break;
    if (res.totalCount > 0 && items.length >= res.totalCount) break;
    pageNumber += 1;
  }

  return items;
}

export function OfficerReports() {
  const { user } = useAuth();
  const token = useAuthStore((s) => s.token);
  const officerId = useMemo(() => getNumericUserIdFromToken(token), [token]);

  const [scope, setScope] = useState<Scope>("all");
  const [range, setRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [loading, setLoading] = useState(false);
  const [cached, setCached] = useState<Application[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const mineHint =
    officerId == null
      ? "Các đơn được lọc theo tên đăng nhập của bạn và tên cán bộ phụ trách trên hồ sơ. Nếu thiếu đơn, có thể tên hiển thị trên hồ sơ khác với tên đăng nhập — hãy thử chọn \"Mọi đơn trong hệ thống\" rồi kiểm tra."
      : "Chỉ gồm các đơn đã được giao cho bạn xử lý.";

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const base =
        scope === "mine" && officerId != null
          ? { assignedOfficerId: officerId }
          : undefined;
      let items = await fetchEveryApplicationPage(base);
      if (scope === "mine" && officerId == null && user?.username) {
        const u = user.username.trim().toLowerCase();
        items = items.filter(
          (a) =>
            (a.assignedOfficerName ?? "").trim().toLowerCase() === u,
        );
      }
      setCached(items);
    } catch (e) {
      setCached(null);
      setLoadError(
        e instanceof Error
          ? e.message
          : "Không tải được danh sách. Vui lòng thử lại sau.",
      );
    } finally {
      setLoading(false);
    }
  }, [scope, officerId, user?.username]);

  const filtered = useMemo(() => {
    if (!cached) return [];
    return filterApplicationsForReport(cached, {
      dateFrom: range?.[0] ?? null,
      dateTo: range?.[1] ?? null,
    });
  }, [cached, range]);

  const exportExcel = useCallback(() => {
    if (!filtered.length) return;
    const scopeLabel =
      scope === "all"
        ? "Tất cả hồ sơ trong hệ thống"
        : "Hồ sơ do tôi phụ trách";
    downloadOfficerApplicationsWorkbook(filtered, {
      scopeLabel,
      fileStem:
        scope === "all" ? "bao-cao-don-tat-ca" : "bao-cao-don-toi-phu-trach",
    });
  }, [filtered, scope]);

  return (
    <OfficerLayout>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
          <BarChart2 size={20} />
        </div>
        <div>
          <Title level={4} className="!mb-0 !text-gray-800">
            Báo cáo và tải file Excel
          </Title>
          <Text type="secondary" className="text-sm">
            Tải danh sách rồi xuất Excel — gồm chi tiết và các bảng thống kê.
          </Text>
        </div>
      </div>

      <Card
        className="rounded-2xl border border-gray-100 shadow-sm"
        styles={{ body: { padding: 24 } }}
      >
        <Space orientation="vertical" size="middle" className="w-full">
          <div className="flex flex-wrap items-center gap-3">
            <Text strong>Bạn muốn xuất</Text>
            <Segmented<Scope>
              options={[
                { label: "Mọi đơn trong hệ thống", value: "all" },
                { label: "Đơn tôi đang phụ trách", value: "mine" },
              ]}
              value={scope}
              onChange={(v) => {
                setScope(v);
                setCached(null);
              }}
            />
          </div>

          {scope === "mine" && (
            <Alert
              type="info"
              showIcon
              message="Gợi ý"
              description={mineHint}
              className="text-sm"
            />
          )}

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              <Text strong className="whitespace-nowrap">
                Thời gian
              </Text>
              <Tooltip
                title={
                  <>
                    Lọc theo ngày nộp đơn — hệ thống gán ngay khi tạo đơn, kể cả
                    bản nháp. Trong file Excel, thời điểm cập nhật hồ sơ là cột
                    riêng, không dùng để lọc ở đây. Để trống khoảng ngày =
                    không giới hạn; áp dụng trên danh sách đã tải.
                  </>
                }
              >
                <button
                  type="button"
                  className="inline-flex rounded text-gray-400 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-200"
                  aria-label="Giải thích lọc theo thời gian"
                >
                  <HelpCircle className="size-4" strokeWidth={2} />
                </button>
              </Tooltip>
            </div>
            <RangePicker
              value={range}
              onChange={(v) => setRange(v)}
              allowEmpty={[true, true]}
              format="DD/MM/YYYY"
              placeholder={["Từ ngày", "Đến ngày"]}
            />
            <Text type="secondary" className="text-xs max-w-md">
              Lọc theo ngày nộp. Để trống = không
              lọc.
            </Text>
          </div>

          <Space wrap>
            <Button
              type="primary"
              icon={<RefreshCw size={16} />}
              loading={loading}
              onClick={() => void loadData()}
            >
              Tải danh sách
            </Button>
            <Button
              icon={<Download size={16} />}
              disabled={!filtered.length}
              onClick={exportExcel}
            >
              Tải file Excel ({filtered.length} đơn)
            </Button>
          </Space>

          {loadError && (
            <Alert type="error" message={loadError} showIcon />
          )}

          {loading && (
            <div className="flex justify-center py-12">
              <Spin tip="Đang tải danh sách, vui lòng đợi…" />
            </div>
          )}

          {!loading && cached && (
            <div className="rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3 text-sm text-gray-600">
              Hiện có <strong>{cached.length}</strong> đơn trong danh sách đã tải.
              {range?.[0] || range?.[1] ? (
                <>
                  {" "}
                  Sau khi áp dụng khoảng ngày bạn chọn còn{" "}
                  <strong>{filtered.length}</strong> đơn.
                </>
              ) : null}
            </div>
          )}
        </Space>
      </Card>
    </OfficerLayout>
  );
}
