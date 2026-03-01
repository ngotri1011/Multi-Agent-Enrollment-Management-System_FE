import {
  Button,
  Col,
  Collapse,
  Form,
  Input,
  Layout,
  Row,
  Select,
  Space,
  Tag,
  Tabs,
  Typography,
} from "antd";
import { ExternalLink } from "lucide-react";
import { AppHeader } from "../../components/AppHeader";

const { Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;
const { Option } = Select;

export function AdmissionPage() {
  return (
    <Layout className="min-h-screen bg-gradient-to-br from-orange-200 via-amber-50 to-gray-50">
      <img
        src="https://daihoc.fpt.edu.vn/wp-content/uploads/2026/01/Bannerweb-kythisotuyenArtboard-2-copy100.png"
        alt="Admission Hero Image"
        style={{
          width: "100vw",
          height: "100vh",
          objectFit: "cover",
          display: "block",
        }}
      />
      <AppHeader />

      <Content className="w-full py-8 px-6 md:px-10 pb-16 box-border text-gray-900 max-md:px-4">
        <section className="mb-12 min-h-[calc(100vh-160px)] flex items-center">
          <Row gutter={[24, 24]} align="stretch">
            <Col xs={24} md={12}>
              <div className="[&>div]:mb-4 [&>div:last-child]:mb-0">
                <div className="inline-block py-2 px-4 mb-3 rounded-xl bg-white border border-orange-200/20 shadow-sm">
                  <Tag color="orange" className="mb-3 w-full">
                    Tuyển sinh 2026
                  </Tag>
                </div>
                <div className="w-fit py-3 px-5 mb-3 rounded-xl bg-white border border-orange-200/20 shadow-sm">
                  <Title level={1} className="!text-slate-900 !mb-0">
                    Tuyển sinh
                  </Title>
                </div>
                <div className="p-4 py-5 mb-3 rounded-xl bg-white border border-orange-200/20 shadow-sm">
                  <Paragraph className="text-base text-gray-600">
                    Trường Đại học FPT chào đón thế hệ sinh viên đại học chính
                    quy năm 2026 – những người không chỉ theo đuổi tri thức, mà
                    còn khát khao tạo ra giá trị mới trong kỷ nguyên số đang
                    không ngừng chuyển động.
                  </Paragraph>
                </div>
                <div className="p-4 py-5 mb-3 rounded-xl bg-white border border-orange-200/20 shadow-sm">
                  <Paragraph>
                    Chương trình đào tạo đa ngành được xây dựng trên nền tảng
                    công nghệ, tinh thần dám nghĩ dám làm và tư duy hội nhập,
                    giúp sinh viên sẵn sàng bước vào môi trường sự nghiệp toàn
                    cầu.
                  </Paragraph>
                </div>
                <div className="pt-5 border-none bg-transparent shadow-none mb-0">
                  <Space
                    size="middle"
                    className="[&_.ant-btn-primary]:!bg-orange-500 [&_.ant-btn-primary]:!border-orange-500 [&_.ant-btn-primary:hover]:!bg-orange-600 [&_.ant-btn-primary:hover]:!border-orange-600"
                  >
                    <Button type="primary" size="large">
                      Đăng ký ngay
                      <ExternalLink />
                    </Button>
                  </Space>
                </div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="flex items-center justify-center h-full">
                <img
                  src="https://daihoc.fpt.edu.vn/wp-content/uploads/2026/01/491019351_1072133974944865_282059016334971388_n.jpg"
                  alt="Admission Hero Image"
                  className="w-full max-w-full h-auto object-cover rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12),0_0_0_1px_rgba(249,115,22,0.1)]"
                />
              </div>
            </Col>
          </Row>
        </section>

        <section className="mt-12">
          <div className="block max-w-[900px] mx-auto relative p-6 rounded-2xl bg-white border border-orange-200/20 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08),0_2px_4px_-2px_rgba(0,0,0,0.05)] [&_.ant-tabs-nav]:mb-0 [&_.ant-tabs-nav-list]:flex [&_.ant-tabs-nav-list]:w-full [&_.ant-tabs-nav-list]:gap-0 [&_.ant-tabs-tab]:flex-1 [&_.ant-tabs-tab]:m-0 [&_.ant-tabs-tab]:py-3 [&_.ant-tabs-tab]:px-4 [&_.ant-tabs-tab]:border [&_.ant-tabs-tab]:border-b-0 [&_.ant-tabs-tab]:border-gray-200 [&_.ant-tabs-tab]:bg-gray-50 [&_.ant-tabs-tab]:text-gray-400 [&_.ant-tabs-tab:first-child]:rounded-t-lg [&_.ant-tabs-tab:not(:first-child)]:border-l-0 [&_.ant-tabs-tab-active]:bg-white [&_.ant-tabs-tab-active]:text-gray-900 [&_.ant-tabs-tab-active]:border-orange-500 [&_.ant-tabs-tab-active]:border-b-2 [&_.ant-tabs-tab-active]:border-b-white [&_.ant-tabs-tab-active]:-mb-0.5 [&_.ant-tabs-tab-active]:z-[1] [&_.ant-tabs-tab-active_.admission-tab-label-top]:text-gray-900 [&_.ant-tabs-tab-active_.admission-tab-label-top]:font-semibold [&_.ant-tabs-tab-active_.admission-tab-label-bottom]:text-gray-900 [&_.ant-tabs-tab-active_.admission-tab-label-bottom]:font-semibold [&_.ant-tabs-content-holder]:border [&_.ant-tabs-content-holder]:border-t-0 [&_.ant-tabs-content-holder]:border-gray-200 [&_.ant-tabs-content-holder]:rounded-b-lg [&_.ant-tabs-tabpane]:p-6 max-md:[&_.ant-tabs-nav-list]:flex-col max-md:[&_.ant-tabs-tab]:border-b-0 max-md:[&_.ant-tabs-tab:last-child]:border-b max-md:[&_.ant-tabs-tab:last-child]:border-gray-200 max-md:[&_.ant-tabs-tab-active]:border-b max-md:[&_.ant-tabs-tab-active]:border-b-white">
            <Title level={2} className="!text-center !mb-6">
              Dự kiến phương thức tuyển sinh 2026
            </Title>
            <Tabs
              defaultActiveKey="1"
              items={[
                {
                  key: "1",
                  label: (
                    <span className="flex flex-col items-center text-center">
                      <span className="text-xs admission-tab-label-top">
                        Phương thức 1
                      </span>
                      <span className="text-sm font-medium admission-tab-label-bottom">
                        Xét tuyển thẳng
                      </span>
                    </span>
                  ),
                  children: (
                    <div className="min-h-[120px]">
                      <Paragraph>
                        Áp dụng cho thí sinh thuộc diện xét tuyển thẳng theo quy
                        định hiện hành của Bộ Giáo dục và Đào tạo.
                      </Paragraph>
                    </div>
                  ),
                },
                {
                  key: "2",
                  label: (
                    <span className="flex flex-col items-center text-center">
                      <span className="text-xs admission-tab-label-top">
                        Phương thức 2
                      </span>
                      <span className="text-sm font-medium admission-tab-label-bottom">
                        Xét tuyển kết hợp
                      </span>
                    </span>
                  ),
                  children: (
                    <div className="min-h-[120px]">
                      <Paragraph>
                        Xét tuyển dựa trên kết quả kỳ thi tốt nghiệp THPT kết
                        hợp với kết quả học tập THPT.
                      </Paragraph>
                    </div>
                  ),
                },
                {
                  key: "3",
                  label: (
                    <span className="flex flex-col items-center text-center">
                      <span className="text-xs admission-tab-label-top">
                        Phương thức 3
                      </span>
                      <span className="text-sm font-medium admission-tab-label-bottom">
                        Ưu tiên xét tuyển
                      </span>
                    </span>
                  ),
                  children: (
                    <div className="min-h-[120px]">
                      <Paragraph>
                        Áp dụng đối với các nhóm thí sinh có nền tảng học tập
                        phù hợp.
                      </Paragraph>
                    </div>
                  ),
                },
              ]}
            />
            <div className="flex justify-center pt-6">
              <Button
                type="primary"
                className="!bg-orange-500 !border-orange-500 hover:!bg-orange-600 hover:!border-orange-600 rounded-full py-2 px-6"
              >
                Xem thêm
                <span className="ml-2">→</span>
              </Button>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <Title level={2} className="!mb-6">
            Học bổng & Học phí
          </Title>
          <Row gutter={[24, 24]} align="stretch">
            <Col xs={24} md={12}>
              <div className="h-full flex flex-col gap-3 relative p-6 rounded-2xl bg-white border border-orange-200/20 shadow-sm">
                <Title level={2}>Học bổng FPTU 2026</Title>
                <Paragraph>
                  Chương trình Tìm kiếm Nhân tài Kỷ nguyên số Việt Nam – Học bổng
                  Nguyễn Văn Đạo.
                </Paragraph>
                <Button type="link" className="!p-0 !text-orange-500">
                  Xem chi tiết chương trình học bổng
                </Button>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <img
                src="https://daihoc.fpt.edu.vn/wp-content/uploads/2025/12/Anh-chup-Man-hinh-2025-12-29-luc-12.37.13-SA.png"
                alt="Học bổng FPTU 2026"
              />
            </Col>
          </Row>
        </section>

        <section className="mt-12 w-full">
          <Title level={2} className="!text-orange-500 !font-bold !mb-6">
            Học phí
          </Title>
          <Paragraph className="text-gray-700 mb-6">
            Kế hoạch đóng học phí cho sinh viên nhập học năm 2026 được cố định
            trong suốt quá trình học.
          </Paragraph>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
            {[
              "Campus Hà Nội",
              "Campus TP.HCM",
              "Campus Đà Nẵng",
              "Campus Cần Thơ",
              "Campus Quy Nhơn",
            ].map((label) => (
              <div
                key={label}
                className="flex flex-col p-5 rounded-xl bg-white border border-dashed border-gray-300 shadow-sm"
              >
                <span className="text-sm text-gray-500 mb-1">Học phí</span>
                <Text strong className="text-gray-900 mb-4 text-base">
                  {label}
                </Text>
                <Button
                  type="primary"
                  className="!bg-orange-500 !border-orange-500 hover:!bg-orange-600 !rounded-lg !mt-auto"
                >
                  Xem thêm
                </Button>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <Title level={2} className="!mb-6">
            Đăng ký tuyển sinh vào FPTU 2026
          </Title>
          <div className="p-6 rounded-2xl bg-white border border-orange-200/20 shadow-sm">
            <Form layout="vertical">
              <Form.Item
                label="Họ và tên"
                name="fullName"
                rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
              >
                <Input placeholder="Nguyễn Văn A" />
              </Form.Item>
              <Form.Item
                label="Tỉnh thành"
                name="province"
                rules={[
                  { required: true, message: "Vui lòng chọn tỉnh thành" },
                ]}
              >
                <Select placeholder="Chọn tỉnh thành">
                  <Option value="ha-noi">Hà Nội</Option>
                  <Option value="tp-hcm">TP. Hồ Chí Minh</Option>
                  <Option value="da-nang">Đà Nẵng</Option>
                  <Option value="can-tho">Cần Thơ</Option>
                  <Option value="quy-nhon">Quy Nhơn</Option>
                </Select>
              </Form.Item>
              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                ]}
              >
                <Input placeholder="Số điện thoại liên hệ" />
              </Form.Item>
              <Form.Item label="Email" name="email">
                <Input placeholder="example@domain.com" />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  block
                  className="!bg-orange-500 !border-orange-500 hover:!bg-orange-600"
                >
                  Đăng ký ngay
                </Button>
              </Form.Item>
            </Form>
          </div>
        </section>
      </Content>

      <Footer className="bg-gray-50 border-t border-gray-200 py-8 px-6 text-gray-600">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Title level={4}>Giới thiệu chung</Title>
            <Space direction="vertical">
              <Text>Về FPTU</Text>
              <Text>Cơ sở vật chất & campus</Text>
            </Space>
          </Col>
          <Col xs={24} md={8}>
            <Title level={4}>Truy cập nhanh</Title>
            <Space direction="vertical">
              <Text>Thông tin tuyển sinh năm 2026</Text>
              <Text>Học phí</Text>
              <Text>Học bổng</Text>
            </Space>
          </Col>
          <Col xs={24} md={8}>
            <Title level={4}>Liên hệ</Title>
            <Space direction="vertical">
              <Text>Hà Nội: Khu GD&ĐT – Khu CNC Hòa Lạc</Text>
              <Text>TP.HCM: Lô E2a-7, Đường D1, Khu CNC</Text>
            </Space>
          </Col>
        </Row>
        <div className="mt-6 text-center text-[13px] text-gray-400">
          <Text>© 2026 Trường Đại học FPT.</Text>
        </div>
      </Footer>
    </Layout>
  );
}
