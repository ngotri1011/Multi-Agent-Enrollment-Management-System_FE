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

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;
const { Option } = Select;

export function AdmissionPage() {
  return (
    <Layout className="min-h-screen bg-gradient-to-br from-orange-200 via-amber-50 to-gray-50">

      <img
        src="https://daihoc.fpt.edu.vn/wp-content/uploads/2026/01/Bannerweb-kythisotuyenArtboard-2-copy100.png"
        alt="Admission Hero Image"
        style={{ width: "100vw", height: "100vh", objectFit: "cover", display: "block" }}
      />
      <div className="pt-4 px-4 md:pt-6 md:px-6 pb-4">
        <div className="h-16" aria-hidden />
        <Header
          className="!h-auto !leading-none !px-0 !bg-white/75 backdrop-blur-sm rounded-full border border-orange-200/30 shadow-sm fixed top-4 left-4 right-4 md:left-6 md:right-6 z-50"
          style={{ borderBottom: "none" }}
        >
          <div className="flex items-center justify-between gap-6 w-full mx-0 py-3 px-4 md:px-6">
            <div className="font-extrabold text-xl tracking-[0.12em] uppercase text-orange-500">FPTU</div>
            <Space size="large" className="flex-1 justify-center text-gray-700 max-md:hidden">
              <Text strong>Về FPTU</Text>
              <Text strong>Đào tạo</Text>
              <Text strong>Tuyển sinh</Text>
              <Text strong>Đời sống sinh viên</Text>
            </Space>
            <Button type="primary" className="!bg-orange-500 !border-orange-500 hover:!bg-orange-600 hover:!border-orange-600">
              Đăng ký tuyển sinh
            </Button>
          </div>
        </Header>
      </div>

      <Content className="w-full py-8 px-6 md:px-10 pb-16 box-border text-gray-900 max-md:px-4">
        <section className="mb-12 min-h-[calc(100vh-160px)] flex items-center">
          <Row gutter={[24, 24]} align="stretch">
            <Col xs={24} md={12}>
              <div className="[&>div]:mb-4 [&>div:last-child]:mb-0">
                <div className="inline-block py-2 px-4 mb-3 rounded-xl bg-white border border-orange-200/20 shadow-sm">
                  <Tag color="orange" className="mb-3">
                    Tuyển sinh 2026
                  </Tag>
                </div>
                <div className="inline-block py-3 px-5 mb-3 rounded-xl bg-white border border-orange-200/20 shadow-sm">
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
                  <Space size="middle" className="[&_.ant-btn-primary]:!bg-orange-500 [&_.ant-btn-primary]:!border-orange-500 [&_.ant-btn-primary:hover]:!bg-orange-600 [&_.ant-btn-primary:hover]:!border-orange-600">
                    <Button type="primary" size="large">
                      Đăng ký ngay
                    </Button>
                    <Button size="large">Tìm hiểu học bổng</Button>
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
                      <span className="text-xs admission-tab-label-top">Phương thức 1</span>
                      <span className="text-sm font-medium admission-tab-label-bottom">Xét tuyển thẳng</span>
                    </span>
                  ),
                  children: (
                    <div className="min-h-[120px]">
                      <Paragraph>
                        Áp dụng cho thí sinh thuộc diện xét tuyển thẳng theo quy định hiện hành
                        của Bộ Giáo dục và Đào tạo.
                      </Paragraph>
                      <div className="flex gap-3 mt-5 p-4 bg-amber-50 border border-orange-200/30 rounded-lg">
                        <span className="text-orange-500 text-lg font-bold shrink-0">*</span>
                        <div>
                          <Text strong className="text-orange-500 text-sm">LƯU Ý</Text>
                          <Paragraph className="!mt-1 !mb-0 text-[13px] text-gray-700">
                            Các thí sinh đăng ký học ngành Luật phải đảm bảo điều kiện theo quy định
                            tại Quyết định số 678/QĐ-BGDĐT ngày 14 tháng 03 năm 2025 của Bộ trưởng Bộ
                            Giáo dục và Đào tạo Ban hành Chuẩn chương trình đào tạo lĩnh vực pháp luật
                            trình độ đại học.
                          </Paragraph>
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  key: "2",
                  label: (
                    <span className="flex flex-col items-center text-center">
                      <span className="text-xs admission-tab-label-top">Phương thức 2</span>
                      <span className="text-sm font-medium admission-tab-label-bottom">Xét tuyển kết hợp</span>
                    </span>
                  ),
                  children: (
                    <div className="min-h-[120px]">
                      <Paragraph>
                        Xét tuyển dựa trên kết quả kỳ thi tốt nghiệp THPT kết hợp với kết quả học
                        tập THPT, cùng với điểm ưu tiên theo quy định, nhằm đánh giá toàn diện quá
                        trình học tập của thí sinh thay vì chỉ dựa trên một tiêu chí đơn lẻ.
                      </Paragraph>
                      <Paragraph>
                        <Text strong>Điểm xét tuyển</Text> được xác định như sau:
                      </Paragraph>
                      <Paragraph className="py-2 px-3 my-3 rounded-lg bg-amber-50 border border-dashed border-orange-300/50 text-orange-800">
                        Điểm xét tuyển = (Điểm thi THPT + ĐTB các năm học) / 2 + Điểm ưu tiên
                      </Paragraph>
                      <Paragraph type="secondary">
                        Điểm xét tuyển làm tròn đến 2 số lẻ.
                      </Paragraph>
                      <div className="flex gap-3 mt-5 p-4 bg-amber-50 border border-orange-200/30 rounded-lg">
                        <span className="text-orange-500 text-lg font-bold shrink-0">*</span>
                        <div>
                          <Text strong className="text-orange-500 text-sm">LƯU Ý</Text>
                          <Paragraph className="!mt-1 !mb-0 text-[13px] text-gray-700">
                            Các thí sinh đăng ký học ngành Luật phải đảm bảo điều kiện theo quy định
                            tại Quyết định số 678/QĐ-BGDĐT ngày 14 tháng 03 năm 2025 của Bộ trưởng Bộ
                            Giáo dục và Đào tạo Ban hành Chuẩn chương trình đào tạo lĩnh vực pháp luật
                            trình độ đại học.
                          </Paragraph>
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  key: "3",
                  label: (
                    <span className="flex flex-col items-center text-center">
                      <span className="text-xs admission-tab-label-top">Phương thức 3</span>
                      <span className="text-sm font-medium admission-tab-label-bottom">Ưu tiên xét tuyển</span>
                    </span>
                  ),
                  children: (
                    <div className="min-h-[120px]">
                      <Paragraph>
                        Áp dụng đối với các nhóm thí sinh có nền tảng học tập hoặc quá trình đào tạo
                        phù hợp, bao gồm:
                      </Paragraph>
                      <div className="my-3">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-sm shrink-0 mt-1.5" />
                          <Paragraph className="!mb-0">
                            Thí sinh tốt nghiệp THPT nước ngoài, tốt nghiệp THPT các trường thuộc Tổ
                            chức giáo dục FPT;
                          </Paragraph>
                        </div>
                        <div className="flex items-start gap-3 mb-3">
                          <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-sm shrink-0 mt-1.5" />
                          <Paragraph className="!mb-0">
                            Thí sinh có các chứng chỉ hoặc văn bằng: Chứng chỉ APTECH HDSE/ADSE,
                            ARENA ADIM, SKILLKING, JETKING; Tốt nghiệp chương trình BTEC HND, Melbourne
                            Polytechnic, FUNiX Software Engineering, Cao đẳng FPT Polytechnic.
                          </Paragraph>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-5 p-4 bg-amber-50 border border-orange-200/30 rounded-lg">
                        <span className="text-orange-500 text-lg font-bold shrink-0">*</span>
                        <div>
                          <Text strong className="text-orange-500 text-sm">LƯU Ý</Text>
                          <Paragraph className="!mt-1 !mb-0 text-[13px] text-gray-700">
                            Các thí sinh đăng ký học ngành Luật phải đảm bảo điều kiện theo quy định
                            tại Quyết định số 678/QĐ-BGDĐT ngày 14 tháng 03 năm 2025 của Bộ trưởng Bộ
                            Giáo dục và Đào tạo Ban hành Chuẩn chương trình đào tạo lĩnh vực pháp luật
                            trình độ đại học.
                          </Paragraph>
                        </div>
                      </div>
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
              <div className="h-full flex flex-col gap-3 relative p-6 rounded-2xl bg-white border border-orange-200/20 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08),0_2px_4px_-2px_rgba(0,0,0,0.05),0_0_0_1px_rgba(255,255,255,0.5)_inset] transition-all duration-200 hover:shadow-[0_10px_25px_-5px_rgba(249,115,22,0.12),0_4px_10px_-4px_rgba(0,0,0,0.08),0_0_0_1px_rgba(255,255,255,0.6)_inset]">
                <div className="relative pl-7 before:content-[''] before:absolute before:left-2 before:top-[1.2em] before:w-2 before:h-2 before:rounded-full before:bg-gradient-to-br before:from-orange-500 before:to-orange-600 before:shadow-sm">
                  <Title level={2}>Học bổng FPTU 2026</Title>
                </div>
                <div className="relative pl-7 before:content-[''] before:absolute before:left-2 before:top-[1.2em] before:w-2 before:h-2 before:rounded-full before:bg-gradient-to-br before:from-orange-500 before:to-orange-600 before:shadow-sm">
                  <Title level={4}>
                    Chương trình Tìm kiếm Nhân tài Kỷ nguyên số Việt Nam
                  </Title>
                </div>
                <div className="relative pl-7 before:content-[''] before:absolute before:left-2 before:top-[1.2em] before:w-2 before:h-2 before:rounded-full before:bg-gradient-to-br before:from-orange-500 before:to-orange-600 before:shadow-sm">
                  <Paragraph>
                    Học bổng Nguyễn Văn Đạo nhằm phát hiện và hỗ trợ học sinh có
                    thành tích, năng lực và phẩm chất nổi bật trên toàn quốc
                    trong các lĩnh vực học thuật, công nghệ, đổi mới sáng tạo,
                    lãnh đạo và bản lĩnh vượt khó.
                  </Paragraph>
                </div>
                <div className="relative pl-7 p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-300/30 before:content-[''] before:absolute before:left-2 before:top-[1.2em] before:w-2 before:h-2 before:rounded-full before:bg-gradient-to-br before:from-orange-500 before:to-orange-600 before:shadow-sm">
                  <Paragraph>
                    Quỹ học bổng lên tới hơn <Text strong>200 tỷ đồng</Text> với
                    6 nhóm học bổng chuyên biệt, giá trị từ{" "}
                    <Text strong>50% – 100% học phí toàn khóa</Text> cùng nhiều
                    quyền lợi đặc biệt.
                  </Paragraph>
                </div>
                <div className="pt-5 border-none bg-transparent shadow-none">
                  <Button type="link" className="!p-0 !text-orange-500">
                    Xem chi tiết chương trình học bổng
                  </Button>
                </div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="h-full flex flex-col gap-3 relative p-6 rounded-2xl bg-white border border-orange-200/20 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08),0_2px_4px_-2px_rgba(0,0,0,0.05),0_0_0_1px_rgba(255,255,255,0.5)_inset] transition-all duration-200 hover:shadow-[0_10px_25px_-5px_rgba(249,115,22,0.12),0_4px_10px_-4px_rgba(0,0,0,0.08),0_0_0_1px_rgba(255,255,255,0.6)_inset]">
                <div className="relative pl-7 before:content-[''] before:absolute before:left-2 before:top-[1.2em] before:w-2 before:h-2 before:rounded-full before:bg-gradient-to-br before:from-orange-500 before:to-orange-600 before:shadow-sm">
                  <Title level={3}>Học phí</Title>
                </div>
                <div className="relative pl-7 before:content-[''] before:absolute before:left-2 before:top-[1.2em] before:w-2 before:h-2 before:rounded-full before:bg-gradient-to-br before:from-orange-500 before:to-orange-600 before:shadow-sm">
                  <Paragraph>
                    Kế hoạch đóng học phí cho sinh viên nhập học năm 2026 được
                    cố định trong suốt quá trình học, đã bao gồm giáo trình, học
                    liệu và trang thiết bị.
                  </Paragraph>
                </div>
                <div className="pl-5">
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-sm align-middle" />
                      <Text strong>Hà Nội</Text>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-sm align-middle" />
                      <Text strong>TP. Hồ Chí Minh</Text>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-sm align-middle" />
                      <Text strong>Đà Nẵng</Text>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-sm align-middle" />
                      <Text strong>Cần Thơ</Text>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-sm align-middle" />
                      <Text strong>Quy Nhơn</Text>
                    </div>
                  </div>
                </div>
                <div className="pt-5 border-none bg-transparent shadow-none">
                  <Button type="link" className="!p-0 !text-orange-500">
                    Xem chi tiết học phí theo campus
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </section>

        <section className="mt-12">
          <Title level={2} className="!mb-6">
            Chính sách & Open Day
          </Title>
          <Row gutter={[24, 24]} align="stretch">
            <Col xs={24} md={12}>
              <div className="h-full flex flex-col gap-3 relative p-6 rounded-2xl bg-white border border-orange-200/20 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08),0_2px_4px_-2px_rgba(0,0,0,0.05),0_0_0_1px_rgba(255,255,255,0.5)_inset] transition-all duration-200 hover:shadow-[0_10px_25px_-5px_rgba(249,115,22,0.12),0_4px_10px_-4px_rgba(0,0,0,0.08),0_0_0_1px_rgba(255,255,255,0.6)_inset]">
                <div className="relative pl-7 before:content-[''] before:absolute before:left-2 before:top-[1.2em] before:w-2 before:h-2 before:rounded-full before:bg-gradient-to-br before:from-orange-500 before:to-orange-600 before:shadow-sm">
                  <Title level={2}>Chính sách ưu đãi tài chính 2026</Title>
                </div>
                <div className="relative pl-7 before:content-[''] before:absolute before:left-2 before:top-[1.2em] before:w-2 before:h-2 before:rounded-full before:bg-gradient-to-br before:from-orange-500 before:to-orange-600 before:shadow-sm">
                  <Paragraph>
                    FPTU tin rằng cơ hội học tập chất lượng quốc tế phải dành
                    cho mọi sinh viên, bất kể hoàn cảnh kinh tế.
                  </Paragraph>
                </div>
                <div className="pl-5">
                  <div className="flex items-start gap-3 mb-3 last:mb-0">
                    <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-sm shrink-0 mt-1.5" />
                    <Paragraph className="!mb-0">
                      Ưu đãi <Text strong>30% học phí</Text> cho tất cả thí sinh
                      thuộc <Text strong>Khu vực 1</Text>.
                    </Paragraph>
                  </div>
                  <div className="flex items-start gap-3 mb-3 last:mb-0">
                    <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-sm shrink-0 mt-1.5" />
                    <Paragraph className="!mb-0">
                      Ưu đãi <Text strong>30% học phí toàn khóa</Text> cho sinh
                      viên học tại <Text strong>Cần Thơ</Text> và{" "}
                      <Text strong>Đà Nẵng</Text>.
                    </Paragraph>
                  </div>
                  <div className="flex items-start gap-3 mb-3 last:mb-0">
                    <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-sm shrink-0 mt-1.5" />
                    <Paragraph className="!mb-0">
                      Ưu đãi <Text strong>50% học phí toàn khóa</Text> cho sinh
                      viên học tại <Text strong>Quy Nhơn</Text>.
                    </Paragraph>
                  </div>
                </div>
                <div className="pt-5 border-none bg-transparent shadow-none">
                  <Button type="link" className="!p-0 !text-orange-500">
                    Xem chi tiết chính sách tài chính
                  </Button>
                </div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="h-full flex flex-col gap-3 relative p-6 rounded-2xl bg-white border border-orange-200/20 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08),0_2px_4px_-2px_rgba(0,0,0,0.05),0_0_0_1px_rgba(255,255,255,0.5)_inset] transition-all duration-200 hover:shadow-[0_10px_25px_-5px_rgba(249,115,22,0.12),0_4px_10px_-4px_rgba(0,0,0,0.08),0_0_0_1px_rgba(255,255,255,0.6)_inset]">
                <div className="relative pl-7 before:content-[''] before:absolute before:left-2 before:top-[1.2em] before:w-2 before:h-2 before:rounded-full before:bg-gradient-to-br before:from-orange-500 before:to-orange-600 before:shadow-sm">
                  <Title level={3}>Lịch Open Day tại 5 campus</Title>
                </div>
                <div className="pl-5">
                  <div className="flex items-start gap-3 mb-3 last:mb-0">
                    <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-sm shrink-0 mt-1.5" />
                    <div>
                      <Text strong>Big Open Day</Text>
                      <Paragraph className="!mt-1 !mb-0 text-gray-500">
                        18/01/2026 – 5 Campus Trường Đại học FPT
                      </Paragraph>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 mb-3 last:mb-0">
                    <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-sm shrink-0 mt-1.5" />
                    <div>
                      <Text strong>FPTU Open Day Đà Nẵng</Text>
                      <Paragraph className="!mt-1 !mb-0 text-gray-500">
                        21/12/2025 – Campus Đà Nẵng
                      </Paragraph>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 mb-3 last:mb-0">
                    <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-sm shrink-0 mt-1.5" />
                    <div>
                      <Text strong>FPTU Open Day Hà Nội</Text>
                      <Paragraph className="!mt-1 !mb-0 text-gray-500">
                        21/12/2025 – Campus Hà Nội
                      </Paragraph>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 mb-3 last:mb-0">
                    <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-sm shrink-0 mt-1.5" />
                    <div>
                      <Text strong>FPTU Open Day Quy Nhơn</Text>
                      <Paragraph className="!mt-1 !mb-0 text-gray-500">
                        20 - 21/12/2025 – Campus Quy Nhơn
                      </Paragraph>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 mb-3 last:mb-0">
                    <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-sm shrink-0 mt-1.5" />
                    <div>
                      <Text strong>FPTU Open Day Cần Thơ</Text>
                      <Paragraph className="!mt-1 !mb-0 text-gray-500">
                        30/11/2025 – Campus Cần Thơ
                      </Paragraph>
                    </div>
                  </div>
                </div>
                <div className="pt-5 border-none bg-transparent shadow-none">
                  <Button
                    type="primary"
                    className="!mt-3 w-full !bg-orange-500 !border-orange-500 hover:!bg-orange-600 hover:!border-orange-600"
                    block
                  >
                    Đăng ký tham gia Open Day
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </section>

        <section className="mt-12">
          <Row gutter={[32, 32]} align="stretch">
            <Col xs={24} md={14}>
              <div className="relative pl-7 mb-4 before:content-[''] before:absolute before:left-2 before:top-[1.2em] before:w-2 before:h-2 before:rounded-full before:bg-gradient-to-br before:from-orange-500 before:to-orange-600 before:shadow-sm">
                <Title level={2}>Đăng ký tuyển sinh vào FPTU 2026</Title>
              </div>
              <div className="h-full flex flex-col gap-3 relative p-6 rounded-2xl bg-white border border-orange-200/20 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08),0_2px_4px_-2px_rgba(0,0,0,0.05),0_0_0_1px_rgba(255,255,255,0.5)_inset] transition-all duration-200 hover:shadow-[0_10px_25px_-5px_rgba(249,115,22,0.12),0_4px_10px_-4px_rgba(0,0,0,0.08),0_0_0_1px_rgba(255,255,255,0.6)_inset]">
                <Form layout="vertical">
                  <Form.Item
                    label="Họ và tên"
                    name="fullName"
                    rules={[
                      { required: true, message: "Vui lòng nhập họ và tên" },
                    ]}
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
                      {
                        required: true,
                        message: "Vui lòng nhập số điện thoại",
                      },
                    ]}
                  >
                    <Input placeholder="Số điện thoại liên hệ" />
                  </Form.Item>
                  <Form.Item label="Trường" name="school">
                    <Input placeholder="Tên trường THPT" />
                  </Form.Item>
                  <Form.Item label="Chuyên ngành lựa chọn" name="major">
                    <Select placeholder="Chọn chuyên ngành">
                      <Option value="cntt">Công nghệ thông tin</Option>
                      <Option value="ai">Trí tuệ nhân tạo</Option>
                      <Option value="marketing">Marketing</Option>
                      <Option value="ngon-ngu-anh">Ngôn ngữ Anh</Option>
                      <Option value="quan-tri-kinh-doanh">
                        Quản trị kinh doanh
                      </Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label="Email" name="email">
                    <Input placeholder="example@domain.com" />
                  </Form.Item>
                  <Form.Item name="agree" valuePropName="checked">
                    <span className="text-xs text-gray-500">
                      Bằng việc gửi form này, bạn đồng ý để dữ liệu cá nhân được
                      thu thập và xử lý bởi Trường Đại học FPT theo Quy định bảo
                      vệ dữ liệu cá nhân của Tổ chức giáo dục FPT.
                    </span>
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" size="large" htmlType="submit" block>
                      Đăng ký ngay – Bắt đầu hành trình của bạn
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            </Col>
            <Col xs={24} md={10}>
              <div className="relative pl-7 mb-4 before:content-[''] before:absolute before:left-2 before:top-[1.2em] before:w-2 before:h-2 before:rounded-full before:bg-gradient-to-br before:from-orange-500 before:to-orange-600 before:shadow-sm">
                <Title level={3}>FAQ</Title>
              </div>
              <div className="h-full flex flex-col gap-3 relative p-6 rounded-2xl bg-white border border-orange-200/20 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08),0_2px_4px_-2px_rgba(0,0,0,0.05),0_0_0_1px_rgba(255,255,255,0.5)_inset] transition-all duration-200 hover:shadow-[0_10px_25px_-5px_rgba(249,115,22,0.12),0_4px_10px_-4px_rgba(0,0,0,0.08),0_0_0_1px_rgba(255,255,255,0.6)_inset] [&_.ant-collapse-item]:rounded-xl [&_.ant-collapse-item]:border-slate-300/40 [&_.ant-collapse-header-text]:text-gray-900">
                <Collapse accordion>
                  <Panel
                    header="Trường Đại học FPT có đào tạo ngành học nào?"
                    key="1"
                  >
                    <Paragraph>
                      FPTU đào tạo 38 chuyên ngành thuộc các khối: Công nghệ
                      thông tin, Quản trị kinh doanh, Công nghệ truyền thông,
                      Luật, Cử nhân tài năng và Khối ngành Ngôn ngữ.
                    </Paragraph>
                  </Panel>
                  <Panel
                    header="Trường Đại học FPT có những phương thức tuyển sinh nào?"
                    key="2"
                  >
                    <Paragraph>
                      Năm 2026, FPTU dự kiến tuyển sinh với 03 phương thức: xét
                      tuyển thẳng, xét tuyển kết hợp và ưu tiên xét tuyển, kết
                      hợp đa tiêu chí để đánh giá toàn diện năng lực.
                    </Paragraph>
                  </Panel>
                  <Panel
                    header="Học phí Trường Đại học FPT là bao nhiêu?"
                    key="3"
                  >
                    <Paragraph>
                      Học phí được công bố theo từng campus (Hà Nội, TP.HCM, Đà
                      Nẵng, Cần Thơ, Quy Nhơn) và không thay đổi trong suốt khóa
                      học. Chi tiết xem tại mục học phí theo campus.
                    </Paragraph>
                  </Panel>
                  <Panel header="Trường có ký túc xá không?" key="4">
                    <Paragraph>
                      FPTU có ký túc xá tại các campus Hà Nội, Đà Nẵng, Cần Thơ
                      và Quy Nhơn, nằm ngay trong khuôn viên trường.
                    </Paragraph>
                  </Panel>
                  <Panel
                    header="Cơ hội việc làm sau khi tốt nghiệp như thế nào?"
                    key="5"
                  >
                    <Paragraph>
                      Sinh viên FPTU có cơ hội thực tập và làm việc tại các
                      doanh nghiệp trong và ngoài nước, với mạng lưới đối tác
                      rộng khắp và định hướng đào tạo gắn với thực tiễn.
                    </Paragraph>
                  </Panel>
                </Collapse>
              </div>
            </Col>
          </Row>
        </section>
      </Content>

      <Footer className="bg-gray-50 border-t border-gray-200 py-8 px-6 text-gray-600 [&_.ant-row]:w-full [&_.ant-row]:m-0">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Title level={4}>Giới thiệu chung</Title>
            <Space direction="vertical">
              <Text>Về FPTU</Text>
              <Text>Cơ sở vật chất & campus</Text>
              <Text>Đối tác & hợp tác quốc tế</Text>
            </Space>
          </Col>
          <Col xs={24} md={8}>
            <Title level={4}>Truy cập nhanh</Title>
            <Space direction="vertical">
              <Text>Thông tin tuyển sinh năm 2026</Text>
              <Text>Open days</Text>
              <Text>Học phí</Text>
              <Text>Học bổng</Text>
            </Space>
          </Col>
          <Col xs={24} md={8}>
            <Title level={4}>Liên hệ</Title>
            <Space direction="vertical">
              <Text>
                Hà Nội: Khu GD&ĐT – Khu CNC Hòa Lạc, Km29 Đại lộ Thăng Long
              </Text>
              <Text>TP.HCM: Lô E2a-7, Đường D1, Khu CNC, TP. Hồ Chí Minh</Text>
              <Text>Đà Nẵng, Cần Thơ, Quy Nhơn: Xem chi tiết trên website</Text>
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
