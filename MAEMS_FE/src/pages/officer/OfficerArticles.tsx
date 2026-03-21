import { Card, Typography } from "antd";
import { Newspaper } from "lucide-react";
import { OfficerLayout } from "../../components/layouts/OfficerLayout";

const { Title, Text } = Typography;

/** Khung trang Bài viết (officer) — bổ sung nội dung sau. */
export function OfficerArticles() {
  return (
    <OfficerLayout>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
          <Newspaper size={20} />
        </div>
        <div>
          <Title level={4} className="!mb-0 !text-gray-800">
            Bài viết
          </Title>
          <Text type="secondary" className="text-sm">
            Trang đang được xây dựng.
          </Text>
        </div>
      </div>

      <Card
        className="rounded-2xl border border-gray-100 shadow-sm min-h-[320px]"
        styles={{ body: { padding: 24 } }}
      >
        <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/80">
          <Text type="secondary">Khu vực danh sách / quản lý bài viết</Text>
        </div>
      </Card>
    </OfficerLayout>
  );
}
