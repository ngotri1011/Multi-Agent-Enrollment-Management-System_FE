import {
  Button,
  Card,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Spin,
  Tag,
  Tooltip,
  Upload,
} from "antd";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { Newspaper, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { OfficerLayout } from "../../components/layouts/OfficerLayout";
import type { ArticleBasic, CreateArticleRequest, GetArticlesBasicQuery, UrlImageArticle } from "../../types/article";
import type { ArticleStatus } from "../../types/enums";
import {
  createArticle,
  getArticleById,
  getArticlesBasic,
  patchArticle,
  uploadImageArticle,
} from "../../api/articles";
import type { UploadFile } from "antd";
import { CheckOutlined, DeleteOutlined, EditOutlined, UploadOutlined } from "@ant-design/icons";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { Typography } from "antd";

const { Title, Text } = Typography;

type EditorMode = "create" | "edit";

function statusTag(status: string) {
  // Map trạng thái bài viết -> hiển thị nhãn (Tag) màu sắc tương ứng
  switch (status) {
    case "draft":
      return <Tag color="orange">Bản nháp</Tag>;
    case "publish":
      return <Tag color="green">Đã xuất bản</Tag>;
    case "deleted":
      return <Tag color="red">Đã xóa</Tag>;
    default:
      return <Tag>—</Tag>;
  }
}
/** Khung trang Bài viết (officer) — bổ sung nội dung sau. */
export function OfficerArticles() {
  const [api, contextHolder] = message.useMessage();

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [articles, setArticles] = useState<ArticleBasic[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

  const [searchTitle, setSearchTitle] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(""); // "" => all

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<EditorMode>("create");
  const [editingId, setEditingId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState<string>("");
  const [contentHtml, setContentHtml] = useState<string>("");

  const [currentStatus, setCurrentStatus] = useState<string>("");

  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [thumbnailFileList, setThumbnailFileList] = useState<UploadFile[]>([]);

  const editorKeySeed = useMemo(
    () => `${editorMode}-${editingId ?? "new"}-${editorOpen ? "open" : "closed"}`,
    [editorMode, editingId, editorOpen],
  );

  const loadArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params: GetArticlesBasicQuery = {
        searchTitle: searchTitle || undefined,
        status: statusFilter || undefined,
        pageNumber,
        pageSize,
        sortBy: "updatedAt",
        sortDesc: true,
      };
      const items = await getArticlesBasic(params);
      setArticles(items);
    } catch {
      setArticles([]);
      api.error("Không thể tải danh sách bài viết.");
    } finally {
      setLoading(false);
    }
  }, [api, pageNumber, pageSize, searchTitle, statusFilter]);

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
    } catch {
      api.error("Không thể tải chi tiết bài viết.");
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

  function ensureDraftPayload(status: ArticleStatus): CreateArticleRequest {
    return {
      title: title.trim(),
      content: contentHtml,
      thumbnail: thumbnail || "",
      status,
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
      api.success(editorMode === "create" ? "Đã tạo bản nháp." : "Đã lưu thay đổi.");
      await loadArticles();
      setEditorOpen(false);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        "Lưu thất bại.";
      api.error(msg);
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
      // Flow theo yêu cầu: tạo POST ở trạng thái draft -> bấm xuất bản -> chuyển sang publish.
      if (editorMode === "create" || editingId == null) {
        const created = await createArticle(ensureDraftPayload("draft"));
        await patchArticle(created.articleId, ensureDraftPayload("publish"));
      } else {
        await patchArticle(editingId, ensureDraftPayload("publish"));
      }
      api.success("Đã xuất bản bài viết.");
      await loadArticles();
      setEditorOpen(false);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        "Xuất bản thất bại.";
      api.error(msg);
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
        status: "deleted",
      };
      await patchArticle(articleId, payload);
      api.success("Đã xóa bài viết.");
      await loadArticles();
    } catch {
      api.error("Xóa thất bại.");
    } finally {
      setActionLoading(false);
    }
  }

  function thumbnailPreview() {
    // Preview thumbnail trong form upload (chỉ hiển thị khi đã có `thumbnail`)
    if (!thumbnail) return null;
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-2">
        <img src={thumbnail} alt="thumbnail" className="h-24 w-full object-cover rounded-lg" />
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
          <Button icon={<RefreshCw size={16} />} onClick={loadArticles} disabled={loading}>
            Làm mới
          </Button>
          <Button type="primary" onClick={openCreate} disabled={loading}>
            Tạo bài viết
          </Button>
        </div>
      </div>

      {/* Card: bộ lọc, trạng thái tải, danh sách các bài viết */}
      <Card className="rounded-2xl border border-gray-100 shadow-sm" styles={{ body: { padding: 24 } }}>
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
                { label: "Tất cả", value: "" },
                { label: "Bản nháp", value: "draft" },
                { label: "Đã xuất bản", value: "publish" },
                { label: "Đã xóa", value: "deleted" },
              ]}
            />
          </div>
        </div>

        {/* Render theo trạng thái dữ liệu */}
        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <Spin />
          </div>
        ) : (
          <div className="space-y-3">
            {articles.length === 0 ? (
              // Empty state: không có bài viết phù hợp
              <div className="min-h-[240px] flex items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/80">
                <Text type="secondary">Chưa có bài viết nào phù hợp.</Text>
              </div>
            ) : (
              // Danh sách bài viết
              articles.map((a) => (
                <div
                  key={a.articleId}
                  className="rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col gap-3"
                >
                  {/* Phần mô tả nhanh: tiêu đề + trạng thái + thời gian cập nhật */}
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Text strong className="text-gray-900 text-base truncate max-w-[680px]">
                          {a.title}
                        </Text>
                        {statusTag(String(a.status))}
                      </div>
                      <Text type="secondary" className="text-xs">
                        Cập nhật: {new Date(a.updatedAt).toLocaleString("vi-VN")}
                      </Text>
                    </div>

                    {/* Nhóm nút hành động cho từng bài viết */}
                    <div className="flex items-center gap-2">
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
                          disabled={actionLoading || String(a.status) === "publish"}
                          onClick={() => {
                            Modal.confirm({
                              title: "Xuất bản bài viết",
                              icon: <ExclamationCircleFilled />,
                              content: "Nội dung hiện tại sẽ được chuyển sang trạng thái 'publish'.",
                              okText: "Xuất bản",
                              cancelText: "Hủy",
                              okButtonProps: { className: "!rounded-xl" },
                              async onOk() {
                                // Khi bấm “Xuất bản” trong confirm: patch trạng thái bài viết sang `publish`
                                // Publish uses full article payload; we do it from current row.
                                try {
                                  setActionLoading(true);
                                  const article = await getArticleById(a.articleId);
                                  const payload: CreateArticleRequest = {
                                    title: article.title,
                                    content: article.content,
                                    thumbnail: article.thumbnail,
                                    status: "publish",
                                  };
                                  await patchArticle(a.articleId, payload);
                                  api.success("Đã xuất bản.");
                                  await loadArticles();
                                } catch {
                                  api.error("Xuất bản thất bại.");
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
                            disabled={actionLoading || String(a.status) === "deleted"}
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
                          Thumbnail đã được tải. Mở “Sửa” để chỉnh nội dung chi tiết.
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
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
                {editorMode === "create" ? "Tạo bài viết" : "Chỉnh sửa bài viết"}
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
              <Button onClick={resetEditorStateForClose} className="!rounded-xl">
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
              <Button
                onClick={handlePublish}
                type="primary"
                disabled={
                  actionLoading ||
                  !title.trim() ||
                  !contentHtml ||
                  contentHtml === "<p></p>" ||
                  false
                }
                loading={actionLoading}
                className="!rounded-xl !bg-green-600 !border-green-600"
              >
                {editorMode === "edit" && String(currentStatus) === "publish" ? "Cập nhật & xuất bản" : "Xuất bản"}
              </Button>
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
                      const res: UrlImageArticle = await uploadImageArticle(formData);
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
                    } catch (err: unknown) {
                      const errData = (err as { response?: { data?: { message?: string } } })
                        .response?.data;
                      message.error(errData?.message ?? (err as { message?: string }).message ?? "Upload thumbnail thất bại.");
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
    </OfficerLayout>
  );
}
