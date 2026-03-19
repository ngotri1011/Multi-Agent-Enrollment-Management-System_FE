import { Breadcrumb, Card, Typography } from "antd";
import { CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import { GuestLayout } from "../../components/layouts/GuestLayout";

const { Title, Paragraph } = Typography;

const articles = [
  {
    slug: "ho-tro-hoc-phi-kv1",
    title:
      "Trường Đại học FPT hỗ trợ 30% học phí toàn khóa cho học sinh vùng khó khăn",
    date: "Thứ Ba, 10/03/2026",
    summary:
      "Năm 2026, Trường Đại học FPT triển khai chính sách hỗ trợ 30% học phí toàn khóa dành cho học sinh thuộc Khu vực 1 (KV1), nhằm giảm bớt rào cản tài chính và mở rộng cơ hội tiếp cận giáo dục đại học.",
    thumbnail:
      "https://res.cloudinary.com/ddtkccfxp/image/upload/v1773935365/FPT00347-1536x1024_kmsmoc.jpg",
  },
];

export function NewsPage() {
  return (
    <GuestLayout>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-10">
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
          {articles.map((article) => (
            <Link
              key={article.slug}
              to={`/tin-tuc/${article.slug}`}
              className="group block"
            >
              <Card
                hoverable
                className="!rounded-xl !border-gray-100 !shadow-sm overflow-hidden"
                bodyStyle={{ padding: 0 }}
              >
                <div className="flex flex-col sm:flex-row gap-0">
                  <div className="sm:w-64 sm:shrink-0 h-48 sm:h-auto overflow-hidden">
                    <img
                      src={article.thumbnail}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5 flex flex-col justify-center gap-2">
                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                      <CalendarDays size={13} className="text-orange-500" />
                      <span>{article.date}</span>
                    </div>
                    <Title
                      level={4}
                      className="!font-bold !text-gray-900 !mb-0 group-hover:!text-orange-500 !transition-colors"
                    >
                      {article.title}
                    </Title>
                    <Paragraph className="!text-gray-500 !text-sm !mb-0 !line-clamp-2">
                      {article.summary}
                    </Paragraph>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </GuestLayout>
  );
}
