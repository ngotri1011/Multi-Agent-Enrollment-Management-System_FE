import { Breadcrumb, Spin, Typography } from "antd";
import { CalendarDays, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { GuestLayout } from "../../components/layouts/GuestLayout";
import { getArticleById } from "../../api/articles";
import type { Article } from "../../types/article";

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

  return (
    <GuestLayout>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-10">
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
          </>
        )}
      </div>
    </GuestLayout>
  );
}
