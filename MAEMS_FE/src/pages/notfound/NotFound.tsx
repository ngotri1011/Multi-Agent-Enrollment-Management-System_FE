import { Button, Typography } from "antd";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";
import { GuestLayout } from "../../components/layouts/GuestLayout";

const { Title, Paragraph } = Typography;

export function NotFound() {
  return (
    <GuestLayout>
      <div className="max-w-[1200px] mx-auto px-4 py-24 flex flex-col items-center text-center">
        <p className="text-8xl font-bold text-orange-500/90 mb-2">404</p>
        <Title level={2} className="!mb-3 !mt-0">
          Không tìm thấy trang
        </Title>
        <Paragraph className="text-gray-600 max-w-md mb-8">
          Đường dẫn bạn truy cập không tồn tại hoặc đã được đổi. Vui lòng kiểm
          tra lại URL hoặc quay về trang chủ.
        </Paragraph>
        <Link to="/">
          <Button type="primary" size="large" icon={<Home size={18} />}>
            Về trang chủ
          </Button>
        </Link>
      </div>
    </GuestLayout>
  );
}
