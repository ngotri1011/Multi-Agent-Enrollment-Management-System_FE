import {
  Button,
  Card,
  Form,
  Input,
  message,
  Modal,
  Pagination,
  Popconfirm,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
  Tooltip,
  Upload,
} from "antd";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { ArrowDownUp, ArrowDownWideNarrow, ArrowUpWideNarrow, Newspaper, RefreshCw, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { OfficerLayout } from "../../layouts/OfficerLayout";
import type {
  ArticleBasic,
  CreateArticleRequest,
  GetArticlesBasicQuery,
  UrlImageArticle,
} from "../../types/article";
import type { ArticleStatus } from "../../types/enums";

// Map từng giá trị ArticleStatus sang nhãn hiển thị tương ứng
const ARTICLE_STATUS_MAP: Record<
  ArticleStatus,
  { label: string; color: string }
> = {
  draft: { label: "Bản nháp", color: "orange" },
  publish: { label: "Đã xuất bản", color: "green" },
  archived: { label: "Đã lưu trữ", color: "red" },
};
import {
  createArticle,
  getArticleById,
  getArticlesBasic,
  patchArticle,
  uploadImageArticle,
} from "../../api/articles";
import { getRegisterEvents } from "../../api/register-events";
import type { RegisterEventData } from "../../types/register-event";
import type { UploadFile } from "antd";
import {
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { Typography } from "antd";
import { ensureUtc } from "../../utils/date";
import { extractApiError } from "../../utils/apiError";

const { Title, Text } = Typography;

type EditorMode = "create" | "edit";

function statusTag(status: string) {
  // Tra cứu qua ARTICLE_STATUS_MAP để đồng bộ với ArticleStatus trong enums.ts
  const entry = ARTICLE_STATUS_MAP[status as ArticleStatus];
  // Nếu status không nằm trong ArticleStatus đã khai báo → hiển thị thẳng giá trị gốc để dễ debug
  if (!entry) return <Tag>{status}</Tag>;
  return <Tag color={entry.color}>{entry.label}</Tag>;
}
/** Khung trang Bài viết (officer) — bổ sung nội dung sau. */
export function OfficerArticles() {
  const [api, contextHolder] = message.useMessage();

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [articles, setArticles] = useState<ArticleBasic[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  /* pageSize có thể thay đổi bởi người dùng qua Pagination */
  const [pageSize, setPageSize] = useState(10);
  /* Tổng số bài viết từ API — dùng cho Pagination */
  const [totalCount, setTotalCount] = useState(0);

  const [searchTitle, setSearchTitle] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(""); // "" => all
  /* Sắp xếp — undefined nghĩa là không truyền param, để API dùng mặc định */
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortDesc, setSortDesc] = useState<boolean | undefined>(undefined);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<EditorMode>("create");
  const [editingId, setEditingId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState<string>("");
  const [contentHtml, setContentHtml] = useState<string>("");

  const [currentStatus, setCurrentStatus] = useState<string>("");
  /* Cờ cho phép đăng ký tham dự sự kiện của bài viết đang soạn */
  const [isRegisterable, setIsRegisterable] = useState(false);

  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [thumbnailFileList, setThumbnailFileList] = useState<UploadFile[]>([]);

  /* State modal xem danh sách đăng ký sự kiện */
  const [regModalOpen, setRegModalOpen] = useState(false);
  const [regModalTitle, setRegModalTitle] = useState("");
  const [regModalLoading, setRegModalLoading] = useState(false);
  const [regModalData, setRegModalData] = useState<RegisterEventData[]>([]);

  const editorKeySeed = useMemo(
    () =>
      `${editorMode}-${editingId ?? "new"}-${editorOpen ? "open" : "closed"}`,
    [editorMode, editingId, editorOpen],
  );

  const loadArticles = useCallback(async () => {
    setLoading(true);
    try {
      // Chỉ truyền sortBy/sortDesc khi người dùng đã chọn; undefined sẽ bị lọc bỏ trong API helper
      const params: GetArticlesBasicQuery = {
        searchTitle: searchTitle || undefined,
        status: statusFilter || undefined,
        pageNumber,
        pageSize,
        sortBy,
        sortDesc,
      };
      const { items, totalCount: total } = await getArticlesBasic(params);
      setArticles(items);
      setTotalCount(total);
    } catch (err) {
      setArticles([]);
      api.error(extractApiError(err, "Không thể tải danh sách bài viết."));
    } finally {
      setLoading(false);
    }
  }, [api, pageNumber, pageSize, searchTitle, statusFilter, sortBy, sortDesc]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  async function openCreate() {
    // Mở modal tạo bài viết mới (reset toàn bộ state liên quan nội dung)
    setEditorMode("create");
    setEditingId(null);
    setTitle("");
    setThumbnail("");
    setContentHtml("");
    setCurrentStatus("");
    setIsRegisterable(false);
    setThumbnailFileList([]);
    setEditorOpen(true);
  }

  async function openEdit(articleId: number) {
    // Mở modal chỉnh sửa: lấy dữ liệu theo `articleId` rồi đổ lên form
    setActionLoading(true);
    try {
      const article = await getArticleById(articleId);
      setEditorMode("edit");
      setEditingId(article.articleId);
      setTitle(article.title);
      setThumbnail(article.thumbnail);
      setContentHtml(article.content);
      setCurrentStatus(article.status);
      setIsRegisterable(article.isRegisterable);
      setThumbnailFileList(
        article.thumbnail
          ? [
              {
                uid: String(articleId),
                name: "thumbnail",
                status: "done",
                url: article.thumbnail,
              },
            ]
          : [],
      );
      setEditorOpen(true);
    } catch (err) {
      api.error(extractApiError(err, "Không thể tải chi tiết bài viết."));
    } finally {
      setActionLoading(false);
    }
  }

  function resetEditorStateForClose() {
    // Đóng modal và reset cờ loading để lần mở sau hoạt động đúng
    setEditorOpen(false);
    setActionLoading(false);
    setThumbnailUploading(false);
  }

  /**
   * Mở modal danh sách đăng ký của một bài viết.
   * Trước tiên lấy chi tiết bài viết để kiểm tra isRegisterable;
   * nếu bài viết không hỗ trợ đăng ký thì thông báo và không mở modal.
   */
  async function openRegistersModal(articleId: number, articleTitle: string) {
    setRegModalTitle(articleTitle);
    setRegModalData([]);
    setRegModalOpen(true);
    setRegModalLoading(true);
    try {
      const article = await getArticleById(articleId);
      if (!article.isRegisterable) {
        setRegModalOpen(false);
        api.warning("Bài viết này không hỗ trợ đăng ký tham dự sự kiện.");
        return;
      }
      const res = await getRegisterEvents(articleId);
      setRegModalData(res.data ?? []);
    } catch (err) {
      api.error(extractApiError(err, "Không thể tải danh sách đăng ký."));
    } finally {
      setRegModalLoading(false);
    }
  }

  function ensureDraftPayload(status: ArticleStatus): CreateArticleRequest {
    return {
      title: title.trim(),
      content: contentHtml,
      thumbnail: thumbnail || "",
      status,
      isRegisterable,
    };
  }

  async function handleSave() {
    // Nút “Lưu”: tạo bản nháp (create) hoặc cập nhật nội dung (edit)
    if (!title.trim()) {
      api.warning("Vui lòng nhập tiêu đề.");
      return;
    }
    if (!contentHtml || contentHtml === "<p></p>") {
      api.warning("Vui lòng nhập nội dung bài viết.");
      return;
    }
    setActionLoading(true);
    try {
      if (editorMode === "create" || editingId == null) {
        const payload = ensureDraftPayload("draft");
        const created = await createArticle(payload);
        setEditingId(created.articleId);
        setCurrentStatus(created.status);
        setEditorMode("edit");
      } else {
        const statusToKeep = (currentStatus || "draft") as ArticleStatus;
        const payload = ensureDraftPayload(statusToKeep);
        await patchArticle(editingId, payload);
        setCurrentStatus(statusToKeep);
      }
      api.success(
        editorMode === "create" ? "Đã tạo bản nháp." : "Đã lưu thay đổi.",
      );
      await loadArticles();
      setEditorOpen(false);
    } catch (err) {
      api.error(extractApiError(err, "Lưu thất bại."));
    } finally {
      setActionLoading(false);
    }
  }

  async function handlePublish() {
    // Nút “Xuất bản”: chuyển bài viết sang trạng thái `publish`
    if (!title.trim() || !contentHtml || contentHtml === "<p></p>") {
      api.warning("Dữ liệu chưa hợp lệ.");
      return;
    }
    setActionLoading(true);
    try {
      // Tạo mới: POST thẳng với status = publish (không cần tạo draft rồi patch).
      if (editorMode === "create" || editingId == null) {
        await createArticle(ensureDraftPayload("publish"));
      } else {
        await patchArticle(editingId, ensureDraftPayload("publish"));
      }
      api.success("Đã xuất bản bài viết.");
      await loadArticles();
      setEditorOpen(false);
    } catch (err) {
      api.error(extractApiError(err, "Xuất bản thất bại."));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete(articleId: number) {
    // Nút “Xóa” (trong list): đổi trạng thái bài viết sang `deleted`
    setActionLoading(true);
    try {
      const article = await getArticleById(articleId);
      const payload: CreateArticleRequest = {
        title: article.title,
        content: article.content,
        thumbnail: article.thumbnail,
        status: "archived",
        isRegisterable: article.isRegisterable,
      };
      await patchArticle(articleId, payload);
      api.success("Đã xóa bài viết.");
      await loadArticles();
    } catch (err) {
      api.error(extractApiError(err, "Xóa thất bại."));
    } finally {
      setActionLoading(false);
    }
  }

  function thumbnailPreview() {
    // Preview thumbnail trong form upload (chỉ hiển thị khi đã có `thumbnail`)
    if (!thumbnail) return null;
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-2">
        <img
          src={thumbnail}
          alt="thumbnail"
          className="h-24 w-full object-cover rounded-lg"
        />
      </div>
    );
  }

  return (
    <OfficerLayout>
      {contextHolder}
      {/* Header trang: tiêu đề + mô tả + nút thao tác nhanh */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
            <Newspaper size={20} />
          </div>
          <div>
            <Title level={4} className="!mb-0 !text-gray-800">
              Bài viết
            </Title>
            <Text type="secondary" className="text-sm">
              Quản lý bài viết.
            </Text>
          </div>
        </div>

        {/* Nút: làm mới danh sách và mở modal tạo bài viết */}
        <div className="flex items-center gap-2">
          <Button
            icon={<RefreshCw size={16} />}
            onClick={loadArticles}
            disabled={loading}
          >
            Làm mới
          </Button>
          <Button type="primary" onClick={openCreate} disabled={loading}>
            Tạo bài viết
          </Button>
        </div>
      </div>

      {/* Card: bộ lọc, trạng thái tải, danh sách các bài viết */}
      <Card
        className="rounded-2xl border border-gray-100 shadow-sm"
        styles={{ body: { padding: 24 } }}
      >
        <div className="flex flex-wrap items-center gap-3 justify-between mb-5">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Ô tìm kiếm theo tiêu đề */}
            <Input.Search
              allowClear
              placeholder="Tìm theo tiêu đề..."
              onSearch={(v) => {
                setSearchTitle(v);
                setPageNumber(1);
              }}
              style={{ width: 320 }}
            />
            {/* Bộ lọc trạng thái bài viết */}
            <Select
              value={statusFilter}
              onChange={(v) => {
                setStatusFilter(v);
                setPageNumber(1);
              }}
              style={{ width: 190 }}
              options={[
                { label: "Tất cả trạng thái", value: "" },
                { label: "Bản nháp", value: "draft" },
                { label: "Đã xuất bản", value: "publish" },
                { label: "Đã lưu trữ", value: "archived" },
              ]}
            />
            {/* Chọn trường sắp xếp */}
            <Select
              value={sortBy ?? ""}
              onChange={(v) => {
                setSortBy(v || undefined);
                setPageNumber(1);
              }}
              style={{ width: 180 }}
              options={[
                { label: "Mặc định (không sort)", value: "" },
                { label: "ID bài viết", value: "articleId" },
                { label: "Ngày cập nhật", value: "updatedAt" },
              ]}
            />
            {/* Chọn chiều sắp xếp — trạng thái chưa chọn dùng icon trung tính ArrowDownUp */}
            {sortBy && (
              <Tooltip title={sortDesc === true ? "Giảm dần (đang chọn)" : sortDesc === false ? "Tăng dần (đang chọn)" : "Chọn chiều sắp xếp"}>
                <Button
                  type={sortDesc !== undefined ? "primary" : "default"}
                  icon={
                    sortDesc === undefined ? (
                      <ArrowDownUp size={16} />
                    ) : sortDesc === false ? (
                      <ArrowUpWideNarrow size={16} />
                    ) : (
                      <ArrowDownWideNarrow size={16} />
                    )
                  }
                  onClick={() => {
                    // Luân chuyển: undefined → giảm dần → tăng dần → undefined
                    if (sortDesc === undefined) {
                      setSortDesc(true);
                    } else if (sortDesc === true) {
                      setSortDesc(false);
                    } else {
                      setSortDesc(undefined);
                    }
                    setPageNumber(1);
                  }}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  {/* Label theo 3 trạng thái: chưa chọn / tăng / giảm */}
                  {sortDesc === undefined ? "Sắp xếp" : sortDesc === false ? "Tăng dần" : "Giảm dần"}
                </Button>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Render theo trạng thái dữ liệu */}
        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <Spin />
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {articles.length === 0 ? (
                // Empty state: không có bài viết phù hợp
                <div className="min-h-[240px] flex items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/80">
                  <Text type="secondary">Chưa có bài viết nào phù hợp.</Text>
                </div>
              ) : (
                // Danh sách bài viết theo trang hiện tại
                articles.map((a) => (
                  <div
                    key={a.articleId}
                    className="rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col gap-3"
                  >
                    {/* Phần mô tả nhanh: tiêu đề + trạng thái + ID + thời gian cập nhật */}
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Text
                            strong
                            className="text-gray-900 text-base truncate max-w-[680px]"
                          >
                            {a.title}
                          </Text>
                          {statusTag(String(a.status))}
                          {/* ID bài viết — giúp nhận diện nhanh khi thao tác hoặc debug */}
                          <Tag className="!rounded-full !text-[11px] !px-2 !py-0 !leading-5 !border-gray-200 !text-gray-400 !bg-gray-50">
                            #{a.articleId}
                          </Tag>
                        </div>
                        <Text type="secondary" className="text-xs">
                          Cập nhật:{" "}
                          {new Date(ensureUtc(a.updatedAt)).toLocaleString(
                            "vi-VN",
                          )}
                        </Text>
                      </div>

                      {/* Nhóm nút hành động cho từng bài viết */}
                      <div className="flex items-center gap-2">
                        {/* Nút xem danh sách đăng ký — hiện với mọi bài viết,
                          logic kiểm tra isRegisterable thực hiện bên trong hàm openRegistersModal */}
                        <Tooltip title="Danh sách đăng ký">
                          <Button
                            onClick={() =>
                              openRegistersModal(a.articleId, a.title)
                            }
                            icon={<Users size={15} />}
                            aria-label="Danh sách đăng ký"
                            className="!rounded-xl !border-blue-500 !text-blue-500 !bg-white hover:!border-blue-400 hover:!text-blue-400"
                          />
                        </Tooltip>

                        {/* Sửa: mở modal và nạp dữ liệu chi tiết */}
                        <Tooltip title="Sửa">
                          <Button
                            onClick={() => openEdit(a.articleId)}
                            icon={<EditOutlined />}
                            aria-label="Sửa"
                            className="!rounded-xl !border-yellow-500 !text-yellow-500 !bg-white hover:!border-yellow-400 hover:!text-yellow-400"
                          />
                        </Tooltip>

                        {/* Xuất bản: xác nhận trước khi patch trạng thái */}
                        <Tooltip title="Xuất bản">
                          <Button
                            type="primary"
                            icon={<CheckOutlined />}
                            aria-label="Xuất bản"
                            disabled={
                              actionLoading || String(a.status) === "publish"
                            }
                            onClick={() => {
                              Modal.confirm({
                                title: "Xuất bản bài viết",
                                icon: <ExclamationCircleFilled />,
                                content:
                                  "Nội dung hiện tại sẽ được chuyển sang trạng thái 'publish'.",
                                okText: "Xuất bản",
                                cancelText: "Hủy",
                                okButtonProps: { className: "!rounded-xl" },
                                async onOk() {
                                  // Khi bấm “Xuất bản” trong confirm: patch trạng thái bài viết sang `publish`
                                  // Publish uses full article payload; we do it from current row.
                                  try {
                                    setActionLoading(true);
                                    const article = await getArticleById(
                                      a.articleId,
                                    );
                                    const payload: CreateArticleRequest = {
                                      title: article.title,
                                      content: article.content,
                                      thumbnail: article.thumbnail,
                                      status: "publish",
                                      isRegisterable: article.isRegisterable,
                                    };
                                    await patchArticle(a.articleId, payload);
                                    api.success("Đã xuất bản.");
                                    await loadArticles();
                                  } catch (err) {
                                    api.error(
                                      extractApiError(
                                        err,
                                        "Xuất bản thất bại.",
                                      ),
                                    );
                                  } finally {
                                    setActionLoading(false);
                                  }
                                },
                              });
                            }}
                            className="!rounded-xl !bg-green-600 !border-green-600"
                          />
                        </Tooltip>

                        {/* Xóa: hỏi xác nhận qua Popconfirm trước khi gọi handleDelete */}
                        <Popconfirm
                          title="Xóa bài viết?"
                          okText="Xóa"
                          cancelText="Hủy"
                          onConfirm={() => handleDelete(a.articleId)}
                        >
                          <Tooltip title="Xóa">
                            <Button
                              danger
                              icon={<DeleteOutlined />}
                              aria-label="Xóa"
                              className="!rounded-xl"
                              loading={actionLoading}
                              disabled={
                                actionLoading || String(a.status) === "archived"
                              }
                            />
                          </Tooltip>
                        </Popconfirm>
                      </div>
                    </div>

                    {/* Hiển thị thumbnail nếu bài viết có ảnh */}
                    {a.thumbnail ? (
                      <div className="flex items-center gap-3">
                        <img
                          src={a.thumbnail}
                          alt="thumbnail"
                          className="w-32 h-16 object-cover rounded-xl border border-gray-100 bg-gray-50"
                        />
                        <div className="flex-1">
                          <div className="text-xs text-gray-500">
                            Thumbnail đã được tải. Mở “Sửa” để chỉnh nội dung
                            chi tiết.
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>

            {/* Pagination — chỉ hiển thị khi có ít nhất 1 bài viết */}
            {totalCount > 0 && (
              <div className="mt-5 flex justify-end">
                <Pagination
                  current={pageNumber}
                  pageSize={pageSize}
                  total={totalCount}
                  showSizeChanger
                  pageSizeOptions={[5, 10, 20, 50]}
                  showTotal={(total, range) =>
                    `${range[0]}–${range[1]} / ${total} bài viết`
                  }
                  onChange={(page, size) => {
                    // Khi đổi trang hoặc đổi số item/trang: reset về trang 1 nếu pageSize thay đổi
                    if (size !== pageSize) {
                      setPageSize(size);
                      setPageNumber(1);
                    } else {
                      setPageNumber(page);
                    }
                  }}
                  className="select-none"
                />
              </div>
            )}
          </>
        )}
      </Card>

      {/* Modal soạn thảo bài viết (create/edit) */}
      <Modal
        title={
          // Tiêu đề modal: đổi theo editorMode và hiển thị trạng thái hiện tại (khi edit)
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
              <Newspaper size={18} />
            </div>
            <div className="flex flex-col">
              <Text className="text-gray-800 font-semibold">
                {editorMode === "create"
                  ? "Tạo bài viết"
                  : "Chỉnh sửa bài viết"}
              </Text>
              {editorMode === "edit" && currentStatus ? (
                <Text type="secondary" className="text-xs">
                  Trạng thái hiện tại: {currentStatus}
                </Text>
              ) : null}
            </div>
          </div>
        }
        centered
        width="70vw"
        style={{ top: 0, padding: 0 }}
        open={editorOpen}
        // onCancel: đóng modal và reset state
        onCancel={resetEditorStateForClose}
        destroyOnClose
        maskClosable={false}
        bodyStyle={{ maxHeight: "calc(100vh - 180px)", overflow: "auto" }}
        footer={
          // Nút hành động ở footer modal: Đóng + Lưu + Xuất bản
          <div className="flex items-center justify-between gap-3">
            <Space>
              <Button
                onClick={resetEditorStateForClose}
                className="!rounded-xl"
              >
                Đóng
              </Button>
              {editorMode === "edit" ? (
                <Tag color="processing" className="!rounded-xl">
                  Lưu sẽ giữ nguyên trạng thái hiện tại
                </Tag>
              ) : (
                <Tag color="orange" className="!rounded-xl">
                  Tạo bài viết mới ở trạng thái <b>draft</b>
                </Tag>
              )}
            </Space>
            <Space>
              <Button
                onClick={handleSave}
                type="primary"
                loading={actionLoading}
                className="!rounded-xl"
              >
                {editorMode === "create" ? "Tạo bản nháp" : "Lưu"}
              </Button>
              {/* Nút Xuất bản chỉ hiển thị khi tạo mới, không hiện ở chế độ chỉnh sửa */}
              {editorMode === "create" && (
                <Button
                  onClick={handlePublish}
                  type="primary"
                  disabled={
                    actionLoading ||
                    !title.trim() ||
                    !contentHtml ||
                    contentHtml === "<p></p>"
                  }
                  loading={actionLoading}
                  className="!rounded-xl !bg-green-600 !border-green-600"
                >
                  Xuất bản
                </Button>
              )}
            </Space>
          </div>
        }
      >
        {/* Nội dung modal gồm form nhập Thumbnail, Tiêu đề và Nội dung (Tiptap) */}
        <Form layout="vertical">
          <div className="space-y-3">
            {/* Form item: Upload thumbnail */}
            <Form.Item label="Thumbnail">
              <div className="space-y-2">
                <Upload
                  accept="image/*"
                  listType="picture-card"
                  maxCount={1}
                  fileList={thumbnailFileList}
                  disabled={thumbnailUploading}
                  beforeUpload={async (file) => {
                    // Hook trước khi upload: gửi file lên server, lấy `url` trả về và render preview
                    const f = file as unknown as File;
                    if (!f) return false;
                    setThumbnailUploading(true);
                    try {
                      const formData = new FormData();
                      formData.append("file", f);
                      const res: UrlImageArticle =
                        await uploadImageArticle(formData);
                      if (!res.url) {
                        throw new Error("API upload trả về url rỗng.");
                      }
                      setThumbnail(res.url);
                      setThumbnailFileList([
                        {
                          uid: f.name,
                          name: f.name,
                          status: "done",
                          url: res.url,
                        },
                      ]);
                      message.success("Upload thumbnail thành công.");
                    } catch (err) {
                      message.error(
                        extractApiError(err, "Upload thumbnail thất bại."),
                      );
                    } finally {
                      setThumbnailUploading(false);
                    }
                    return false;
                  }}
                  onRemove={() => {
                    // Xóa thumbnail khỏi state (kèm reset fileList)
                    setThumbnail("");
                    setThumbnailFileList([]);
                  }}
                  className="!rounded-xl"
                >
                  {thumbnail ? null : (
                    <Button
                      icon={<UploadOutlined />}
                      disabled={thumbnailUploading}
                      loading={thumbnailUploading}
                    >
                      Chọn ảnh
                    </Button>
                  )}
                </Upload>
                {/* Preview thumbnail đã upload */}
                {thumbnailPreview()}
              </div>
            </Form.Item>

            {/* Form item: Nhập tiêu đề bài viết */}
            <Form.Item label="Tiêu đề" required>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề bài viết..."
                className="!rounded-xl"
              />
            </Form.Item>

            {/* Form item: Bật/tắt cho phép đăng ký tham dự sự kiện */}
            <Form.Item label="Cho phép đăng ký tham dự sự kiện">
              <div className="flex items-center gap-3">
                <Switch
                  checked={isRegisterable}
                  onChange={setIsRegisterable}
                  checkedChildren="Có"
                  unCheckedChildren="Không"
                />
                <span className="text-sm text-gray-500">
                  {isRegisterable
                    ? "Người dùng có thể đăng ký tham dự qua trang bài viết."
                    : "Bài viết không nhận đăng ký."}
                </span>
              </div>
            </Form.Item>

            {/* Form item: Editor nội dung bài viết */}
            <Form.Item label="Nội dung" required>
              <div className="h-[420px]">
                <SimpleEditor
                  key={editorKeySeed}
                  value={contentHtml}
                  onChange={setContentHtml}
                  editable={!actionLoading}
                  embedded
                />
              </div>
            </Form.Item>
          </div>
        </Form>
      </Modal>
      {/* Modal danh sách người đăng ký tham dự sự kiện */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-500 shrink-0">
              <Users size={18} />
            </div>
            <div className="flex flex-col min-w-0">
              <Text className="text-gray-800 font-semibold">
                Danh sách đăng ký
              </Text>
              <Text type="secondary" className="text-xs truncate max-w-[420px]">
                {regModalTitle}
              </Text>
            </div>
          </div>
        }
        open={regModalOpen}
        onCancel={() => setRegModalOpen(false)}
        footer={
          <div className="flex justify-end">
            <Button
              className="!rounded-xl"
              onClick={() => setRegModalOpen(false)}
            >
              Đóng
            </Button>
          </div>
        }
        width={760}
        centered
        destroyOnClose
      >
        {regModalLoading ? (
          /* Trạng thái đang tải dữ liệu đăng ký */
          <div className="py-12 flex items-center justify-center">
            <Spin />
          </div>
        ) : (
          <Table<RegisterEventData>
            dataSource={regModalData}
            rowKey="registerId"
            pagination={{ pageSize: 10, size: "small" }}
            locale={{ emptyText: "Chưa có ai đăng ký." }}
            size="middle"
            columns={[
              {
                title: "STT",
                width: 56,
                render: (_v, _r, i) => i + 1,
              },
              {
                title: "Họ và tên",
                dataIndex: "fullName",
                ellipsis: true,
              },
              {
                title: "Email",
                dataIndex: "email",
                ellipsis: true,
              },
              {
                title: "Điện thoại",
                dataIndex: "phone",
                width: 130,
              },
              {
                title: "Thời gian đăng ký",
                dataIndex: "createdAt",
                width: 180,
                render: (v: string) =>
                  v ? new Date(v).toLocaleString("vi-VN") : "—",
              },
            ]}
          />
        )}
      </Modal>
    </OfficerLayout>
  );
}
