import { Breadcrumb, Button, Form, Input, Spin, Typography, message } from "antd";
import { CalendarDays, ClipboardCheck, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { GuestLayout } from "../../layouts/GuestLayout";
import { getArticleById } from "../../api/articles";
import { registerEvent } from "../../api/register-events";
import type { Article } from "../../types/article";
import type { RegisterEventBody } from "../../types/register-event";
import { extractApiError } from "../../utils/apiError";

const { Title } = Typography;

function formatVnDate(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function ArticleDetail() {
  const { id } = useParams();
  const articleId = useMemo(() => {
    if (!id) return null;
    const n = Number(id);
    return Number.isFinite(n) ? n : null;
  }, [id]);

  const [loading, setLoading] = useState(false);
  const [article, setArticle] = useState<Article | null>(null);

  /* State form đăng ký sự kiện */
  const [regForm] = Form.useForm<RegisterEventBody>();
  const [regLoading, setRegLoading] = useState(false);
  const [regDone, setRegDone] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (articleId == null) return;
    const idNum = articleId;
    let cancelled = false;

    async function run() {
      setLoading(true);
      try {
        const data = await getArticleById(idNum);
        if (!cancelled) setArticle(data);
      } catch {
        if (!cancelled) setArticle(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [articleId]);

  /** Gửi form đăng ký tham dự sự kiện */
  async function handleRegister(values: RegisterEventBody) {
    if (!articleId) return;
    setRegLoading(true);
    try {
      await registerEvent({ ...values, articleId });
      setRegDone(true);
      regForm.resetFields();
      messageApi.success("Đăng ký thành công! Chúng tôi sẽ liên hệ bạn sớm.");
    } catch (err) {
      messageApi.error(extractApiError(err, "Đăng ký thất bại, vui lòng thử lại."));
    } finally {
      setRegLoading(false);
    }
  }

  return (
    <GuestLayout>
      {contextHolder}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 mt-[84px]">
        <Breadcrumb
          className="mb-6 text-sm"
          items={[
            { title: <Link to="/">Trang chủ</Link> },
            { title: <Link to="/tin-tuc">Tin tức</Link> },
            { title: article?.title ?? "Chi tiết bài viết" },
          ]}
        />

        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <Spin />
          </div>
        ) : !article ? (
          <div className="min-h-[240px] flex items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/80">
            <Typography.Text type="secondary">Không tìm thấy bài viết.</Typography.Text>
          </div>
        ) : (
          <>
            <Title level={1} className="!font-extrabold !text-gray-900 !leading-snug !mb-4">
              {article.title}
            </Title>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-gray-500 text-sm mb-6">
              <div className="flex items-center gap-2">
                <CalendarDays size={15} className="text-orange-500 shrink-0" />
                <span>{formatVnDate(article.updatedAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <UserRound size={15} className="text-blue-500 shrink-0" />
                <span>{article.authorName || "Officer"}</span>
              </div>
            </div>

            {article.thumbnail ? (
              <div className="rounded-xl overflow-hidden mb-6 shadow-sm">
                <img
                  src={article.thumbnail}
                  alt={article.title}
                  className="w-full object-cover"
                />
              </div>
            ) : null}

            <div
              className="text-gray-700 leading-relaxed [&_p]:mb-4 [&_img]:max-w-full"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Phần đăng ký sự kiện — chỉ hiển thị khi bài viết có isRegisterable = true */}
            {article.isRegisterable && (
              <div className="mt-10">
                {/* Đường kẻ ngăn cách */}
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-8" />

                {/* Khung form với hiệu ứng liquid glass nhẹ */}
                <div className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur-sm shadow-md p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500 shrink-0">
                      <ClipboardCheck size={20} />
                    </div>
                    <div>
                      <Typography.Title level={4} className="!mb-0 !text-gray-800">
                        Đăng ký tham dự sự kiện
                      </Typography.Title>
                      <Typography.Text type="secondary" className="text-sm">
                        Điền thông tin bên dưới để đăng ký tham dự.
                      </Typography.Text>
                    </div>
                  </div>

                  {regDone ? (
                    /* Trạng thái sau khi đăng ký thành công */
                    <div className="py-8 flex flex-col items-center gap-3 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-500">
                        <ClipboardCheck size={28} />
                      </div>
                      <Typography.Title level={5} className="!mb-0 !text-green-600">
                        Đăng ký thành công!
                      </Typography.Title>
                      <Typography.Text type="secondary">
                        Chúng tôi đã ghi nhận thông tin của bạn và sẽ liên hệ sớm.
                      </Typography.Text>
                    </div>
                  ) : (
                    <Form
                      form={regForm}
                      layout="vertical"
                      onFinish={handleRegister}
                      requiredMark={false}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
                        {/* Họ và tên */}
                        <Form.Item
                          label={<span className="font-medium text-gray-700">Họ và tên</span>}
                          name="fullName"
                          rules={[{ required: true, message: "Vui lòng nhập họ tên." }]}
                        >
                          <Input
                            placeholder="Nguyễn Văn A"
                            size="large"
                            className="!rounded-xl"
                          />
                        </Form.Item>

                        {/* Số điện thoại */}
                        <Form.Item
                          label={<span className="font-medium text-gray-700">Số điện thoại</span>}
                          name="phone"
                          rules={[
                            { required: true, message: "Vui lòng nhập số điện thoại." },
                            { pattern: /^[0-9+\-\s]{8,15}$/, message: "Số điện thoại không hợp lệ." },
                          ]}
                        >
                          <Input
                            placeholder="0901234567"
                            size="large"
                            className="!rounded-xl"
                          />
                        </Form.Item>
                      </div>

                      {/* Email — chiếm full width */}
                      <Form.Item
                        label={<span className="font-medium text-gray-700">Email</span>}
                        name="email"
                        rules={[
                          { required: true, message: "Vui lòng nhập email." },
                          { type: "email", message: "Email không đúng định dạng." },
                        ]}
                      >
                        <Input
                          placeholder="example@fpt.edu.vn"
                          size="large"
                          className="!rounded-xl"
                        />
                      </Form.Item>

                      <div className="flex justify-end mt-2">
                        <Button
                          type="primary"
                          htmlType="submit"
                          size="large"
                          loading={regLoading}
                          className="!rounded-xl !px-8 !bg-orange-500 !border-orange-500 hover:!bg-orange-400 hover:!border-orange-400"
                        >
                          Đăng ký ngay
                        </Button>
                      </div>
                    </Form>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </GuestLayout>
  );
}
