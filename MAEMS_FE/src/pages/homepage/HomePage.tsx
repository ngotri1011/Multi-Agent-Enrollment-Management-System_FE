import { Button, Col, Row, Typography } from "antd";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  CircleCheck,
  FileSearch,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { AppHeader } from "../../components/AppHeader";

const { Title, Paragraph, Text } = Typography;

const features = [
  {
    icon: <Bot size={28} className="text-orange-500" />,
    title: "Đa tác tử AI",
    desc: "Các tác tử AI chuyên biệt phối hợp để tiếp nhận, xác minh tài liệu và đánh giá hồ sơ tuyển sinh một cách tự động.",
  },
  {
    icon: <Sparkles size={28} className="text-orange-500" />,
    title: "Hỗ trợ LLM",
    desc: "Mô hình ngôn ngữ lớn hỗ trợ giải thích chính sách, trả lời thắc mắc và cung cấp lý do chi tiết cho từng quyết định.",
  },
  {
    icon: <FileSearch size={28} className="text-orange-500" />,
    title: "Xét duyệt tự động",
    desc: "Hệ thống tự động kiểm tra tính đầy đủ, định dạng tài liệu và đánh giá tiêu chí đầu vào theo quy tắc định sẵn.",
  },
  {
    icon: <MessagesSquare size={28} className="text-orange-500" />,
    title: "Thông báo tức thì",
    desc: "Thí sinh nhận thông báo real-time về trạng thái hồ sơ, tài liệu còn thiếu và kết quả xét duyệt.",
  },
];

const pipeline = [
  "Thí sinh nộp hồ sơ và tài liệu qua cổng thông tin thông minh",
  "Tác tử Tiếp nhận tự động xác nhận và chuẩn hóa dữ liệu đầu vào",
  "Tác tử Xác minh kiểm tra tính đầy đủ và hợp lệ của tài liệu với AI",
  "Tác tử Đánh giá xem xét tiêu chí tuyển sinh với giải thích từ LLM",
  "Trả kết quả xét duyệt minh bạch kèm lý do chi tiết từ hệ thống",
];

const actors = [
  {
    role: "Quản trị viên hệ thống",
    icon: <ShieldCheck size={20} className="text-orange-500" />,
    items: [
      "Quản lý cấu hình tuyển sinh và quy tắc xét duyệt",
      "Giám sát hoạt động các tác tử và hiệu suất hệ thống",
      "Cấu hình chính sách phối hợp và luồng xử lý",
    ],
  },
  {
    role: "Cán bộ tuyển sinh",
    icon: <FileSearch size={20} className="text-orange-500" />,
    items: [
      "Xem xét và quản lý hồ sơ thí sinh",
      "Xử lý các trường hợp ngoại lệ được chuyển tiếp",
      "Xuất báo cáo tuyển sinh và nhật ký quyết định",
    ],
  },
  {
    role: "Cán bộ đảm bảo chất lượng",
    icon: <CheckCircle2 size={20} className="text-orange-500" />,
    items: [
      "Rà soát kết quả đánh giá từ tác tử AI",
      "Kiểm tra tính nhất quán và chính xác của quyết định",
      "Hỗ trợ tinh chỉnh quy tắc và hành vi tác tử",
    ],
  },
  {
    role: "Thí sinh",
    icon: <Zap size={20} className="text-orange-500" />,
    items: [
      "Nộp hồ sơ và tài liệu trực tuyến",
      "Theo dõi trạng thái hồ sơ theo thời gian thực",
      "Đặt câu hỏi và nhận giải thích từ hệ thống",
    ],
  },
];

export function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <AppHeader />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('')",
            backgroundColor: "#1a1a2e",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/80 via-orange-800/60 to-gray-900/80" />

        {/* Dot pattern overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
            <Sparkles size={14} className="text-orange-300" />
            <Text className="!text-orange-200 text-sm font-medium">
              Được hỗ trợ bởi LLM & Multi-Agent AI
            </Text>
          </div>

          <Title
            level={1}
            className="!text-white !text-4xl md:!text-6xl !font-extrabold !leading-tight !mb-6"
          >
            Multi-Agent Enrollment
            <br />
            <span className="text-orange-400">Management System</span>
          </Title>

          <Paragraph className="!text-gray-200 text-lg md:text-xl max-w-2xl mx-auto !mb-10 leading-relaxed">
            Hệ thống đa tác tử hỗ trợ quản lý tuyển sinh với sự hỗ trợ của
            LLM — tự động, minh bạch và thông minh 24/7 cho Trường Đại học FPT.
          </Paragraph>

          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/auth">
              <Button
                type="primary"
                size="large"
                icon={<ArrowRight size={16} />}
                className="!bg-orange-500 !border-orange-500 hover:!bg-orange-600 !h-12 !px-8 !rounded-full !font-semibold !text-base"
              >
                Bắt đầu đăng ký
              </Button>
            </Link>
            <Link to="/tuyen-sinh">
              <Button
                size="large"
                className="!bg-white/10 !border-white/30 !text-white hover:!bg-white/20 !h-12 !px-8 !rounded-full !font-semibold !text-base backdrop-blur-sm"
              >
                Thông tin tuyển sinh
              </Button>
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/40 flex items-start justify-center pt-2">
            <div className="w-1 h-2 bg-white/60 rounded-full" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Title level={2} className="!font-extrabold !text-gray-900 !mb-3">
              Tại sao chọn hệ thống của chúng tôi?
            </Title>
            <Paragraph className="!text-gray-500 text-base max-w-2xl mx-auto">
              Các tác tử AI và mô hình ngôn ngữ lớn phối hợp để cung cấp hỗ
              trợ tuyển sinh thông minh, minh bạch và hiệu quả.
            </Paragraph>
          </div>
          <Row gutter={[24, 24]}>
            {features.map((f) => (
              <Col xs={24} sm={12} md={6} key={f.title}>
                <div className="h-full p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
                    {f.icon}
                  </div>
                  <Text strong className="text-gray-800 text-base block mb-2">
                    {f.title}
                  </Text>
                  <Text className="text-gray-500 text-sm leading-relaxed">
                    {f.desc}
                  </Text>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Pipeline */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <Title level={2} className="!font-extrabold !text-gray-900 !mb-3">
              Quy trình xử lý đa tác tử
            </Title>
            <Paragraph className="!text-gray-500 text-base max-w-2xl mx-auto">
              Theo dõi từng bước khi các tác tử AI chuyên biệt phối hợp xử lý
              hồ sơ với tính minh bạch và thông minh.
            </Paragraph>
          </div>
          <div className="space-y-4">
            {pipeline.map((step, i) => (
              <div
                key={i}
                className="flex items-center gap-5 p-5 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-orange-50/40 hover:border-orange-200 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-orange-500 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </div>
                <Text className="text-gray-700 text-sm flex-1">{step}</Text>
                <CircleCheck size={20} className="text-green-500 flex-shrink-0" />
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-10">
            <Link to="/auth">
              <Button
                type="primary"
                size="large"
                icon={<ArrowRight size={16} />}
                className="!bg-orange-500 !border-orange-500 hover:!bg-orange-600 !h-12 !px-8 !rounded-full !font-semibold"
              >
                Trải nghiệm hệ thống
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Actors */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Title level={2} className="!font-extrabold !text-gray-900 !mb-3">
              Dành cho mọi đối tượng
            </Title>
            <Paragraph className="!text-gray-500 text-base max-w-2xl mx-auto">
              Hệ thống phục vụ đầy đủ các vai trò trong quy trình tuyển sinh,
              từ thí sinh đến quản trị viên hệ thống.
            </Paragraph>
          </div>
          <Row gutter={[24, 24]}>
            {actors.map((a) => (
              <Col xs={24} sm={12} key={a.role}>
                <div className="h-full p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                      {a.icon}
                    </div>
                    <Text strong className="text-gray-800 text-base">
                      {a.role}
                    </Text>
                  </div>
                  <ul className="space-y-2">
                    {a.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle2
                          size={15}
                          className="text-orange-400 flex-shrink-0 mt-0.5"
                        />
                        <Text className="text-gray-600 text-sm">{item}</Text>
                      </li>
                    ))}
                  </ul>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-6 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="max-w-3xl mx-auto text-center">
          <Title level={2} className="!text-white !font-extrabold !mb-4">
            Sẵn sàng trải nghiệm tuyển sinh thông minh?
          </Title>
          <Paragraph className="!text-orange-100 text-base mb-8 max-w-xl mx-auto">
            Để hệ thống đa tác tử với LLM hướng dẫn bạn qua quy trình tuyển
            sinh liền mạch, minh bạch và có hỗ trợ AI tức thì.
          </Paragraph>
          <Link to="/auth">
            <Button
              size="large"
              icon={<ArrowRight size={16} />}
              className="!bg-white !border-white !text-orange-500 hover:!bg-orange-50 !h-12 !px-8 !rounded-full !font-semibold !text-base"
            >
              Bắt đầu đăng ký
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-14 px-6">
        <div className="max-w-6xl mx-auto">
          <Row gutter={[48, 32]}>
            <Col xs={24} md={8}>
              <Text className="!text-white font-extrabold text-lg tracking-widest uppercase block mb-3">
                MAEMS
              </Text>
              <Paragraph className="!text-gray-400 text-sm leading-relaxed !mb-0">
                Multi-Agent Enrollment Management System — hệ thống đa tác tử
                hỗ trợ quản lý tuyển sinh với LLM, minh bạch, thông minh và
                hiệu quả cho Trường Đại học FPT.
              </Paragraph>
            </Col>
            <Col xs={24} md={8}>
              <Text strong className="!text-white block mb-4">
                Truy cập nhanh
              </Text>
              <div className="space-y-2">
                {[
                  { label: "Trang chủ", to: "/" },
                  { label: "Thông tin tuyển sinh", to: "/tuyen-sinh" },
                  { label: "Đăng nhập / Đăng ký", to: "/auth" },
                ].map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className="block !text-gray-400 hover:!text-orange-400 text-sm transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </Col>
            <Col xs={24} md={8}>
              <Text strong className="!text-white block mb-4">
                Liên hệ
              </Text>
              <div className="space-y-1 text-sm">
                <Text className="!text-gray-400 block">
                  Trường Đại học FPT
                </Text>
                <Text className="!text-gray-400 block">
                  Khu GD&ĐT – Khu CNC Hòa Lạc, Hà Nội
                </Text>
                <Text className="!text-gray-400 block">
                  tuyensinh@fpt.edu.vn
                </Text>
              </div>
            </Col>
          </Row>
          <div className="border-t border-gray-800 mt-10 pt-6 text-center">
            <Text className="!text-gray-600 text-xs">
              © 2026 Multi-Agent Enrollment Management System – Trường Đại học
              FPT. All rights reserved.
            </Text>
          </div>
        </div>
      </footer>
    </div>
  );
}
