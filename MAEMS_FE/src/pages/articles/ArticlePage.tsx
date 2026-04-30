import { Breadcrumb, Card, Pagination, Spin, Typography } from "antd";
import { CalendarDays } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GuestLayout } from "../../layouts/GuestLayout";
import { getPublishedArticlesBasic } from "../../api/articles";
import type { ArticleBasic } from "../../types/article";

const { Title, Paragraph } = Typography;

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

export function ArticlePage() {
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState<ArticleBasic[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  /* pageSize do người dùng chọn qua Pagination */
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      try {
        const { items, totalCount: total } = await getPublishedArticlesBasic({
          pageNumber,
          pageSize,
          sortBy: "updatedAt",
          sortDesc: true,
        });
        if (!cancelled) {
          setArticles(items);
          setTotalCount(total);
        }
      } catch {
        if (!cancelled) {
          setArticles([]);
          setTotalCount(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [pageNumber, pageSize]);

  return (
    <GuestLayout>
      {/* mt-[84px]: bù đúng bằng chiều cao spacer của AppHeader (84px),
          vì GuestLayout đang dùng -mt-[84px] trên main để hero full-bleed */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 mt-[84px]">
        <Breadcrumb
          className="mb-6 text-sm"
          items={[
            { title: <Link to="/">Trang chủ</Link> },
            { title: "Tin tức" },
          ]}
        />

        <Title level={2} className="!font-extrabold !text-gray-900 !mb-8">
          Tin tức
        </Title>

        <div className="flex flex-col gap-6">
          {/* Danh sách bài viết + trạng thái loading/empty */}
          {loading ? (
            <div className="py-20 flex items-center justify-center">
              <Spin />
            </div>
          ) : articles.length === 0 ? (
            <div className="min-h-[240px] flex items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/80">
              <Typography.Text type="secondary">
                Chưa có bài viết nào.
              </Typography.Text>
            </div>
          ) : (
            articles.map((article) => (
              <Link
                key={article.articleId}
                to={`/tin-tuc/${article.articleId}`}
                className="group block"
              >
                <Card
                  hoverable
                  className="!rounded-xl !border-gray-100 !shadow-sm overflow-hidden"
                  bodyStyle={{ padding: 0 }}
                >
                  <div className="flex flex-col sm:flex-row gap-0">
                    {/* Container ảnh: cố định 192px (h-48) trên mọi breakpoint để thumbnail không bị kéo dài */}
                    <div className="sm:w-64 sm:shrink-0 h-48 sm:h-48 sm:max-h-48 overflow-hidden">
                      <img
                        src={article.thumbnail}
                        alt={article.title}
                        className="w-full h-full max-w-full max-h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-5 flex flex-col justify-center gap-2">
                      <div className="flex items-center gap-2 text-gray-400 text-xs">
                        <CalendarDays size={13} className="text-orange-500" />
                        <span>{formatVnDate(article.updatedAt)}</span>
                      </div>
                      <Title
                        level={4}
                        className="!font-bold !text-gray-900 !mb-0 group-hover:!text-orange-500 !transition-colors"
                      >
                        {article.title}
                      </Title>
                      <Paragraph className="!text-gray-500 !text-sm !mb-0 !line-clamp-2">
                        Xem thêm nội dung chi tiết trong bài viết.
                      </Paragraph>
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          )}

          {/* Pagination — chỉ hiển thị khi có dữ liệu */}
          {!loading && totalCount > 0 && (
            <div className="flex justify-center pt-2">
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
                  // Reset về trang 1 khi người dùng đổi số item mỗi trang
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
        </div>
      </div>
    </GuestLayout>
  );
}
