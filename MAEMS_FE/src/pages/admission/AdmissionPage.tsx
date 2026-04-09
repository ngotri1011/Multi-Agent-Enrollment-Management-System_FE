import {
  Button,
  Col,
  Form,
  Input,
  Result,
  Row,
  Select,
  Space,
  Tag,
  Tabs,
  Typography,
  message,
} from "antd";
import { CheckCircle } from "lucide-react";
import { ExternalLink, SquareArrowOutUpRight } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GuestLayout } from "../../components/layouts/GuestLayout";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const NoteSection = () => (
  <div className="mt-6 flex items-start gap-3 rounded-xl border border-orange-100/70 bg-orange-50/50 px-4 sm:px-5 py-4">
    <span className="text-orange-500 text-2xl leading-none mt-0.5 shrink-0">✳︎</span>
    <div className="text-sm text-gray-700 leading-relaxed">
      <span className="font-bold text-gray-900">LƯU Ý</span>
      <span className="ml-3">
        Các thí sinh đăng ký học ngành Luật phải đảm bảo điều kiện theo quy định tại Quyết định số 678/QĐ-BGDĐT ngày 14 tháng 03 năm 2025 của Bộ trưởng Bộ Giáo dục và Đào tạo Ban hành Chuẩn chương trình đào tạo lĩnh vực pháp luật trình độ đại học.
      </span>
    </div>
  </div>
);

type AdmissionFormValues = {
  fullName: string;
  province: string;
  phone: string;
  email?: string;
};

export function AdmissionPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm<AdmissionFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (values: AdmissionFormValues) => {
    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Admission form submitted:", values);
      setSubmitted(true);
      message.success("Đăng ký tuyển sinh thành công!");
    } catch {
      message.error("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    setSubmitted(false);
  };

  return (
    <GuestLayout>
      <div className="bg-gradient-to-br from-orange-200 via-amber-50 to-gray-50">
      {/* Banner đầu trang: responsive theo tỉ lệ, tránh ép full 100vh trên mobile */}
      <section className="relative w-full">
        <img
          src="https://res.cloudinary.com/ddtkccfxp/image/upload/v1773932965/Bannerweb-kythisotuyenArtboard-2-copy100_mnyvhw.png"
          alt="Admission Hero Banner"
          className="block w-full h-auto object-cover max-h-[78vh] sm:max-h-[70vh] md:max-h-[62vh] lg:max-h-[56vh]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />
      </section>

      <div className="w-full py-8 px-6 md:px-10 pb-16 box-border text-gray-900 max-md:px-4">
        <section className="mb-12 min-h-[calc(100vh-160px)] flex items-center">
          <Row gutter={[24, 24]} align="stretch">
            <Col xs={24} md={12}>
              <div className="[&>div]:mb-4 [&>div:last-child]:mb-0">
                <Tag color="orange" className="!mb-4 text-xs font-semibold tracking-widest uppercase px-3 py-1">
                  Tuyển sinh 2026
                </Tag>
                <Title level={1} className="!text-slate-900 !mb-8 !mt-0 !leading-tight ">
                  Tuyển sinh
                </Title>
              
                <div className="p-4 py-5 mb-3 rounded-xl bg-white border border-orange-200/20 shadow-sm">
                  <Paragraph className="text-base text-gray-600">
                    Trường Đại học FPT chào đón thế hệ sinh viên đại học chính
                    quy năm 2026 – những người không chỉ theo đuổi tri thức, mà
                    còn khát khao tạo ra giá trị mới trong kỷ nguyên số đang
                    không ngừng chuyển động.
                  </Paragraph>
                  <Paragraph className="!mb-0">
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
                    <Link to="/auth">
                    <Button type="primary" size="large">
                      Đăng ký ngay
                      <ExternalLink />
                    </Button>
                    </Link>
                  </Space>
                </div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="flex items-center justify-center h-full">
                <img
                  src="https://res.cloudinary.com/ddtkccfxp/image/upload/v1773934919/491019351_1072133974944865_282059016334971388_n_npcbok.jpg"
                  alt="Admission Hero Image"
                  className="w-full max-w-full h-auto object-cover rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12),0_0_0_1px_rgba(249,115,22,0.1)]"
                />
              </div>
            </Col>
          </Row>
        </section>

        <section className="mt-12 max-w-[980px] mx-auto">
          <Title level={2} className="!text-center !mb-3 !text-2xl md:!text-4xl !leading-tight">
            Dự kiến phương thức tuyển sinh 2026
          </Title>
          <Paragraph className="!text-center text-gray-500 !mb-8 max-w-2xl mx-auto">
            Chọn từng phương thức để xem điều kiện áp dụng và lưu ý quan trọng.
          </Paragraph>

          <div className="rounded-3xl border border-orange-100/70 bg-white/95 shadow-[0_12px_40px_rgba(0,0,0,0.06)] p-2 sm:p-4">
            <Tabs
              type="card"
              defaultActiveKey="1"
              className="[&_.ant-tabs-nav]:!mb-4 [&_.ant-tabs-tab]:!rounded-xl [&_.ant-tabs-tab]:!border [&_.ant-tabs-tab]:!border-gray-200 [&_.ant-tabs-tab]:!bg-gray-50 [&_.ant-tabs-tab]:hover:!text-orange-500 [&_.ant-tabs-tab-active]:!border-orange-400 [&_.ant-tabs-tab-active]:!bg-orange-50 [&_.ant-tabs-tab-btn]:!px-1 [&_.ant-tabs-tab]:!py-3 [&_.ant-tabs-content-holder]:rounded-2xl [&_.ant-tabs-content-holder]:bg-white [&_.ant-tabs-content-holder]:border [&_.ant-tabs-content-holder]:border-orange-100/60 [&_.ant-tabs-content-holder]:p-4 sm:[&_.ant-tabs-content-holder]:p-6"
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
                      <p className="text-sm md:text-[15px] text-gray-700 leading-relaxed">
                        Áp dụng cho thí sinh thuộc diện xét tuyển thẳng theo quy
                        định hiện hành của Bộ Giáo dục và Đào tạo.
                      </p>
                      <NoteSection />
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
                    <div className="min-h-[120px] text-sm md:text-[15px] text-gray-700 leading-relaxed space-y-2">
                      <p>
                        Xét tuyển dựa trên kết quả kỳ thi tốt nghiệp THPT kết hợp với kết quả học tập THPT, cùng với điểm ưu tiên theo quy định, nhằm đánh giá toàn diện quá trình học tập của thí sinh thay vì chỉ dựa trên một tiêu chí đơn lẻ.
                      </p>
                      <p>Điểm xét tuyển dự kiến được xác định như sau:</p>
                      <p>Điểm xét tuyển = (Điểm thi THPT + ĐTB các năm học)/2 + Điểm ưu tiên</p>
                      <p>Điểm xét tuyển làm tròn đến 2 số lẻ.</p>
                      <p>Trong đó:</p>
                      <p><strong>Điểm thi THPT quy định như sau:</strong></p>
                      <ul className="list-disc pl-6 space-y-1.5">
                        <li>Tổ hợp Axx = (Điểm Toán*2 + Điểm 2 môn)/4*3, làm tròn đến 2 số lẻ; áp dụng đối với thí sinh đăng ký vào tất cả các ngành.</li>
                        <li>Tổ hợp Cxx = (Điểm Văn*2 + Điểm 2 môn)/4*3, làm tròn đến 2 số lẻ; áp dụng đối với thí sinh đăng ký vào các ngành ngoài các ngành Công nghệ thông tin và Khoa học máy tính</li>
                      </ul>
                      <p><strong>ĐTB các năm học được tính như sau:</strong></p>
                      <ul className="list-disc pl-6 space-y-1.5">
                        <li>ĐTB các năm học = [(ĐTB lớp 10) + (ĐTB lớp 11)*2 + (ĐTB lớp 12)*3]/2</li>
                        <li>ĐTB các năm học được làm tròn đến 2 số lẻ.</li>
                      </ul>
                      <p>
                        Điểm ưu tiên theo quy định tại Điều 7 Quy chế Tuyển sinh đại học, tuyển sinh cao đẳng ngành Giáo dục Mầm non <em>(Ban hành kèm theo Thông tư ban hành Quy chế tuyển sinh đại học, tuyển sinh cao đẳng ngành Giáo dục Mầm non)</em>
                      </p>
                      <NoteSection />
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
                    <div className="min-h-[120px] text-sm md:text-[15px] text-gray-700 leading-relaxed space-y-2">
                      <p>
                        Áp dụng đối với các nhóm thí sinh có nền tảng học tập hoặc quá trình đào tạo phù hợp, bao gồm:
                      </p>
                      <ul className="list-disc pl-6 space-y-1.5">
                        <li>Thí sinh tốt nghiệp THPT nước ngoài, tốt nghiệp THPT các trường thuộc Tổ chức giáo dục FPT;</li>
                        <li>Thí sinh có các chứng chỉ hoặc văn bằng: Chứng chỉ APTECH HDSE/ADSE, ARENA ADIM, SKILLKING, JETKING; Tốt nghiệp chương trình BTEC HND, Melbourne Polytechnic, FUNiX Software Engineering, Cao đẳng FPT Polytechnic.</li>
                      </ul>
                      <NoteSection />
                    </div>
                  ),
                },
              ]}
            />

           
          </div>

          <div className="flex justify-center pt-8">
            <Button
              type="primary"
              className="!bg-orange-500 !border-orange-500 hover:!bg-orange-600 hover:!border-orange-600 !rounded-lg !py-5 !px-8 !text-base !font-medium"
              onClick={() => navigate("/tuyen-sinh/phuong-thuc")}
            >
              Xem thêm
              <span className="ml-2"><SquareArrowOutUpRight size={18} /></span>
            </Button>
          </div>
        </section>

        <section className="mt-12">
          <Title level={2} className="!mb-8 !text-right !font-black !text-3xl md:!text-4xl">
            Học bổng <span className="text-orange-500">FPTU 2026</span>
          </Title>
          <Row gutter={[48, 24]} align="middle">
            <Col xs={24} md={14}>
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-bold text-gray-900 leading-snug">
                  Chương trình tìm kiếm nhân tài kỷ nguyên số Việt Nam
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Chương trình Tìm kiếm Nhân tài Kỷ nguyên số Việt Nam – Học bổng Nguyễn Văn Đạo được Trường Đại học FPT xây dựng nhằm phát hiện, lựa chọn và hỗ trợ học sinh phổ thông trên toàn quốc có thành tích, năng lực và phẩm chất nổi bật, thể hiện qua các lĩnh vực học thuật, công nghệ, đổi mới sáng tạo, năng lực lãnh đạo và bản lĩnh vượt khó, qua đó tạo điều kiện để người học phát triển trong môi trường giáo dục hiện đại, phù hợp với bối cảnh tương lai và hội nhập quốc tế.
                </p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Thông qua chương trình, Trường Đại học FPT ghi nhận và khuyến khích những nỗ lực học tập xuất sắc, đồng thời góp phần bồi dưỡng thế hệ nhân lực trẻ có khả năng thích ứng cao và sẵn sàng tham gia môi trường học tập, làm việc mang tính toàn cầu, tạo ra giá trị tích cực cho xã hội.
                </p>
                <div className="pt-2">
                  <Button
                    type="primary"
                    className="!bg-orange-500 !border-orange-500 hover:!bg-orange-600 hover:!border-orange-600 !rounded-lg !font-semibold"
                  >
                    Xem thêm
                    <SquareArrowOutUpRight size={15} className="ml-1" />
                  </Button>
                </div>
              </div>
            </Col>
            <Col xs={24} md={10}>
              <img
                src="https://res.cloudinary.com/ddtkccfxp/image/upload/v1773934999/Anh-chup-Man-hinh-2025-12-29-luc-12.37.13-SA_usn9hq.png"
                alt="Học bổng FPTU 2026"
                className="w-full h-auto rounded-2xl object-cover shadow-md"
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
                  onClick={() => {
                    const routes: Record<string, string> = {
                      "Campus Hà Nội": "/tuyen-sinh/hoc-phi-ha-noi",
                      "Campus TP.HCM": "/tuyen-sinh/hoc-phi-hcm",
                      "Campus Đà Nẵng": "/tuyen-sinh/hoc-phi-da-nang",
                      "Campus Cần Thơ": "/tuyen-sinh/hoc-phi-can-tho",
                      "Campus Quy Nhơn": "/tuyen-sinh/hoc-phi-quy-nhon",
                    };
                    if (routes[label]) navigate(routes[label]);
                  }}
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
            {submitted ? (
              <Result
                icon={<CheckCircle size={64} className="text-green-500 mx-auto" />}
                title={
                  <span className="text-xl font-bold text-gray-900">
                    Đăng ký thành công!
                  </span>
                }
                subTitle={
                  <span className="text-gray-500">
                    Cảm ơn bạn đã đăng ký tuyển sinh tại FPTU 2026.
                    Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.
                  </span>
                }
                extra={
                  <Button
                    type="primary"
                    size="large"
                    className="!bg-orange-500 !border-orange-500 hover:!bg-orange-600"
                    onClick={handleReset}
                  >
                    Đăng ký mới
                  </Button>
                }
              />
            ) : (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                disabled={submitting}
              >
                <Row gutter={[16, 0]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Họ và tên"
                      name="fullName"
                      rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
                    >
                      <Input placeholder="Nguyễn Văn A" size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Tỉnh thành"
                      name="province"
                      rules={[{ required: true, message: "Vui lòng chọn tỉnh thành" }]}
                    >
                      <Select placeholder="Chọn tỉnh thành" size="large">
                        <Option value="ha-noi">Hà Nội</Option>
                        <Option value="tp-hcm">TP. Hồ Chí Minh</Option>
                        <Option value="da-nang">Đà Nẵng</Option>
                        <Option value="can-tho">Cần Thơ</Option>
                        <Option value="quy-nhon">Quy Nhơn</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Số điện thoại"
                      name="phone"
                      rules={[
                        { required: true, message: "Vui lòng nhập số điện thoại" },
                        { pattern: /^[0-9]{9,11}$/, message: "Số điện thoại không hợp lệ" },
                      ]}
                    >
                      <Input placeholder="Số điện thoại liên hệ" size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[{ type: "email", message: "Email không hợp lệ" }]}
                    >
                      <Input placeholder="example@domain.com" size="large" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item className="!mb-0">
                  <Button
                    type="primary"
                    size="large"
                    htmlType="submit"
                    block
                    loading={submitting}
                    className="!bg-orange-500 !border-orange-500 hover:!bg-orange-600"
                  >
                    {submitting ? "Đang gửi..." : "Đăng ký ngay"}
                  </Button>
                </Form.Item>
              </Form>
            )}
          </div>
        </section>
      </div>
      </div>
    </GuestLayout>
  );
}
