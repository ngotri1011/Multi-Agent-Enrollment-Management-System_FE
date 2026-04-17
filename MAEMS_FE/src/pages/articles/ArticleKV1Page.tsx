import { Breadcrumb, Typography } from "antd";
import { CalendarDays, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { GuestLayout } from "../../layouts/GuestLayout";

const { Title, Paragraph } = Typography;

export function ArticleKV1Page() {
  return (
    <GuestLayout>
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-10">
        <Breadcrumb
          className="mb-6 text-sm"
          items={[
            { title: <Link to="/">Trang chủ</Link> },
            { title: <Link to="/tin-tuc">Tin tức</Link> },
            { title: "Hỗ trợ học phí KV1" },
          ]}
        />

        <Title
          level={1}
          className="!font-extrabold !text-gray-900 !leading-snug !mb-4"
        >
          Trường Đại học FPT hỗ trợ 30% học phí toàn khóa cho học sinh vùng
          khó khăn
        </Title>

        <div className="flex items-center gap-2 text-gray-500 text-sm mb-6">
          <CalendarDays size={15} className="text-orange-500 shrink-0" />
          <span>Thứ Ba, 10/03/2026</span>
        </div>

        <Title
          level={2}
          italic
          className="!font-bold !text-gray-800 !text-lg !leading-relaxed !mb-6"
        >
          Năm 2026, Trường Đại học FPT triển khai chính sách hỗ trợ 30% học
          phí toàn khóa dành cho học sinh thuộc Khu vực 1 (KV1). Chính sách
          này nhằm giảm bớt rào cản tài chính và tạo điều kiện để học sinh tại
          các vùng dân tộc thiểu số, miền núi, biên giới và hải đảo có thể
          theo học trong môi trường giáo dục đại học hiện đại.
        </Title>

        <Paragraph className="!text-gray-700 !text-base !leading-relaxed !mb-6">
          Đối tượng được áp dụng là học sinh thuộc Khu vực 1 theo quy định của
          Bộ Giáo dục và Đào tạo, bao gồm các xã vùng dân tộc thiểu số, miền
          núi, biên giới, hải đảo và các khu vực đặc biệt khó khăn. Học phí áp
          dụng cho tân sinh viên khóa K22 (nhập học năm 2026).
        </Paragraph>

        <div className="rounded-xl overflow-hidden mb-6 shadow-sm">
          <img
            src="https://res.cloudinary.com/ddtkccfxp/image/upload/v1773935365/FPT00347-1536x1024_kmsmoc.jpg"
            alt="Trường Đại học FPT hỗ trợ học phí KV1"
            className="w-full object-cover"
          />
        </div>

        <Paragraph className="!text-gray-700 !text-base !leading-relaxed !mb-6">
          FPTU đưa ra nhiều chính sách ưu đãi dành cho học sinh các khu vực
          khó tại nhiều vùng miền giúp các học sinh có cơ hội tiếp cận giáo
          dục đại học hiện đại. Bên cạnh chính sách dành cho học sinh KV1,
          Trường Đại học FPT cũng triển khai các chương trình hỗ trợ học phí
          theo vùng nhằm mở rộng cơ hội tiếp cận giáo dục đại học giữa các
          vùng miền. Theo đó, sinh viên đăng ký học tại cơ sở Đà Nẵng và Cần
          Thơ được giảm 30% học phí toàn khóa, trong khi sinh viên theo học
          tại cơ sở Quy Nhơn được hỗ trợ 50% học phí. Trong trường hợp thí
          sinh vừa thuộc Khu vực 1 vừa đăng ký học tại các cơ sở có chính
          sách hỗ trợ theo vùng, các chính sách này sẽ được áp dụng đồng thời
          theo quy định của nhà trường, giúp giảm đáng kể chi phí học tập
          trong toàn khóa học. Qua đó, mức chi phí học tập có thể tiệm cận
          hơn với mặt bằng giáo dục đại học trong nước, trong khi các tiêu
          chuẩn đào tạo và môi trường giáo dục của Trường Đại học FPT vẫn
          được duy trì.{" "}
          <span className="italic">
            "Nhiều học sinh ở các vùng khó khăn có năng lực và khát vọng vươn
            lên rất lớn, nhưng cơ hội tiếp cận giáo dục đại học chất lượng
            vẫn còn hạn chế. Thông qua chính sách hỗ trợ học phí, Trường Đại
            học FPT mong muốn mở rộng cánh cửa đại học cho các em, đồng thời
            góp phần đào tạo nguồn nhân lực trẻ có năng lực công nghệ và tư
            duy toàn cầu cho sự phát triển của các địa phương và của nền kinh
            tế số Việt Nam"
          </span>
          , TS. Nguyễn Khắc Thành, Hiệu trưởng Trường Đại học FPT chia sẻ.
        </Paragraph>

        <div className="rounded-xl overflow-hidden mb-6 shadow-sm">
          <img
            src="https://res.cloudinary.com/ddtkccfxp/image/upload/v1773935505/Hinh-3-1536x1024_c2f9cu.jpg"
            alt="Sinh viên Trường Đại học FPT"
            className="w-full object-cover"
          />
        </div>

        <Paragraph className="!text-gray-700 !text-base !leading-relaxed !mb-8">
          Chính sách hỗ trợ học phí của Trường Đại học FPT cũng phù hợp với
          định hướng của Chính phủ trong việc phát triển nguồn nhân lực chất
          lượng cao và thúc đẩy giáo dục đại học tại các khu vực còn nhiều khó
          khăn.
        </Paragraph>

        <div className="flex items-center gap-2 text-gray-500 text-sm pt-5 border-t border-gray-100">
          <UserRound size={15} className="text-orange-500 shrink-0" />
          <span className="font-medium">Admission Officer</span>
        </div>
      </div>
    </GuestLayout>
  );
}
