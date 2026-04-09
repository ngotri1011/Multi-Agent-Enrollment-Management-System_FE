import { ChevronRight, Home, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { GuestLayout } from "../../components/layouts/GuestLayout";

type Campus = {
  name: string;
  address: string;
  hotline: string;
  phoneHref: string;
  email: string;
  image: string;
  reverseOnDesktop?: boolean;
};

const campuses: Campus[] = [
  {
    name: "Campus Hà Nội",
    address:
      "Khu Giáo dục và Đào tạo - Khu Công nghệ cao Hòa Lạc - Km29 Đại lộ Thăng Long, Xã Hòa Lạc, TP. Hà Nội",
    hotline: "(024) 7300 5588",
    phoneHref: "02473005588",
    email: "tuyensinhhanoi@fpt.edu.vn",
    image:
      "https://res.cloudinary.com/ddtkccfxp/image/upload/v1773935845/Gioi-thieu-HN_qh3ykf.jpg",
  },
  {
    name: "Campus TP. Hồ Chí Minh",
    address:
      "Lô E2a-7, Đường D1, Khu Công nghệ cao, Phường Tăng Nhơn Phú, TP. Hồ Chí Minh",
    hotline: "(028) 7300 5588",
    phoneHref: "02873005588",
    email: "tuyensinhhcm@fpt.edu.vn",
    image:
      "https://res.cloudinary.com/ddtkccfxp/image/upload/v1773935867/Gioi-thieu-HCM_sapsql.jpg",
    reverseOnDesktop: true,
  },
  {
    name: "Campus Đà Nẵng",
    address: "Khu đô thị công nghệ FPT Đà Nẵng, Phường Ngũ Hành Sơn, TP. Đà Nẵng",
    hotline: "(0236) 730 0999",
    phoneHref: "02367300999",
    email: "tuyensinhdanang@fpt.edu.vn",
    image:
      "https://res.cloudinary.com/ddtkccfxp/image/upload/v1773935901/Gioi-thieu-DN_isunc8.jpg",
  },
  {
    name: "Campus Cần Thơ",
    address:
      "Số 600, đường Nguyễn Văn Cừ (nối dài), Phường An Bình, Thành phố Cần Thơ",
    hotline: "(0292) 730 3636",
    phoneHref: "02927303636",
    email: "tuyensinhcantho@fpt.edu.vn",
    image:
      "https://res.cloudinary.com/ddtkccfxp/image/upload/v1773935905/Gioi-thieu-CT_kowiwy.jpg",
    reverseOnDesktop: true,
  },
  {
    name: "Campus Quy Nhơn",
    address: "Khu đô thị mới An Phú Thịnh, Phường Quy Nhơn Đông, Tỉnh Gia Lai",
    hotline: "(0256) 7300 999",
    phoneHref: "02567300999",
    email: "tuyensinhquynhon@fpt.edu.vn",
    image:
      "https://res.cloudinary.com/ddtkccfxp/image/upload/v1773935903/Gioi-thieu-QN_xepkty.png",
  },
];

export function ContactPage() {
  return (
    <GuestLayout>
      <section className="relative w-full">
        <img
          src="https://res.cloudinary.com/ddtkccfxp/image/upload/v1773935766/Banner-lienhe_sxuxng.png"
          alt="Liên hệ"
          className="block w-full h-auto max-h-[52vh] sm:max-h-[45vh] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </section>

      {/* Breadcrumb */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-5">
        <div className="flex items-center gap-2 py-4 text-sm flex-wrap">
          <Link to="/">
            <Home size={18} className="text-orange-500" fill="currentColor" />
          </Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-gray-600">Liên hệ</span>
        </div>
      </div>

      {/* Danh sách campus: mobile ưu tiên dễ đọc, desktop giữ bố cục xen kẽ */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-5 py-4 sm:py-8 md:py-10 space-y-5 sm:space-y-7">
        {campuses.map((campus) => (
          <article
            key={campus.name}
            className={`rounded-2xl bg-white border border-gray-200/80 shadow-sm overflow-hidden ${
              campus.reverseOnDesktop ? "md:flex-row-reverse" : "md:flex-row"
            } flex flex-col`}
          >
            {/* Ảnh campus: mobile cố định tỉ lệ để tránh layout nhảy */}
            <div className="w-full md:w-1/2">
              <div className="aspect-[16/10] md:aspect-auto md:h-full">
                <img
                  src={campus.image}
                  alt={campus.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Thông tin campus: spacing và cỡ chữ tối ưu cho mobile */}
            <div className="w-full md:w-1/2 p-4 sm:p-6 md:p-8">
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                {campus.name}
              </h2>
              <div className="w-14 h-1 rounded-full bg-orange-500 mt-3 mb-5" />

              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
                  <MapPin size={18} className="text-orange-500 mt-0.5 shrink-0" />
                  <p className="text-sm sm:text-[15px] text-gray-700 leading-relaxed">
                    {campus.address}
                  </p>
                </div>

                <a
                  href={`tel:${campus.phoneHref}`}
                  className="flex items-center gap-3 rounded-xl bg-orange-50/70 hover:bg-orange-100 transition-colors px-3 py-2.5"
                >
                  <Phone size={17} className="text-orange-500 shrink-0" />
                  <span className="text-sm sm:text-[15px] font-semibold text-orange-600">
                    {campus.hotline}
                  </span>
                </a>

                <a
                  href={`mailto:${campus.email}`}
                  className="flex items-center gap-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors px-3 py-2.5"
                >
                  <Mail size={17} className="text-orange-500 shrink-0" />
                  <span className="text-sm sm:text-[15px] font-medium text-gray-700 break-all">
                    {campus.email}
                  </span>
                </a>
              </div>
            </div>
          </article>
        ))}
      </section>
    </GuestLayout>
  );
}
