import { Home, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { GuestLayout } from "../../components/layouts/GuestLayout";

export function ContactPage() {
  return (
    <GuestLayout>
      <img
        src="https://res.cloudinary.com/ddtkccfxp/image/upload/v1773935766/Banner-lienhe_sxuxng.png"
        alt="Liên hệ"
        style={{
          width: "100%",
          display: "block",
        }}
      />

      {/* Breadcrumb */}
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex items-center gap-2 py-4 text-sm">
          <Link to="/">
            <Home size={18} className="text-orange-500" fill="currentColor" />
          </Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-gray-600">Liên hệ</span>
        </div>
      </div>

      {/* Campus Hà Nội */}
      <div className="max-w-[1200px] mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Image */}
          <div className="md:w-1/2 rounded-xl overflow-hidden shadow-xl">
            <img
              src="https://res.cloudinary.com/ddtkccfxp/image/upload/v1773935845/Gioi-thieu-HN_qh3ykf.jpg"
              alt="Campus Hà Nội"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info */}
          <div className="md:w-1/2 border border-gray-200 rounded-xl shadow-xl p-8 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Campus Hà Nội
            </h2>
            <div className="w-16 h-[3px] bg-orange-500 mb-6" />

            <p className="font-bold text-gray-900 mb-1">Địa chỉ</p>
            <p className="text-gray-600 mb-5 leading-relaxed">
              Khu Giáo dục và Đào tạo - Khu Công nghệ cao Hòa Lạc - Km29 Đại
              lộ Thăng Long, Xã Hòa Lạc, TP. Hà Nội
            </p>

            <p className="font-bold text-gray-900 mb-1">Hotline</p>
            <a
              href="tel:02473005588"
              className="text-orange-500 hover:underline mb-5 inline-block"
            >
              (024) 7300 5588
            </a>

            <p className="font-bold text-gray-900 mb-1">Email</p>
            <a
              href="mailto:tuyensinhhanoi@fpt.edu.vn"
              className="text-orange-500 hover:underline inline-block"
            >
              tuyensinhhanoi@fpt.edu.vn
            </a>
          </div>
        </div>
      </div>

      {/* Campus TP. Hồ Chí Minh */}
      <div className="max-w-[1200px] mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Info */}
          <div className="md:w-1/2 border border-gray-200 rounded-xl shadow-xl p-8 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Campus TP. Hồ Chí Minh
            </h2>
            <div className="w-16 h-[3px] bg-orange-500 mb-6" />

            <p className="font-bold text-gray-900 mb-1">Địa chỉ</p>
            <p className="text-gray-600 mb-5 leading-relaxed">
              Lô E2a-7, Đường D1, Khu Công nghệ cao, Phường Tăng Nhơn Phú, TP.
              Hồ Chí Minh
            </p>

            <p className="font-bold text-gray-900 mb-1">Hotline</p>
            <a
              href="tel:02873005588"
              className="text-orange-500 hover:underline mb-5 inline-block"
            >
              (028) 7300 5588
            </a>

            <p className="font-bold text-gray-900 mb-1">Email</p>
            <a
              href="mailto:tuyensinhhcm@fpt.edu.vn"
              className="text-orange-500 hover:underline inline-block"
            >
              tuyensinhhcm@fpt.edu.vn
            </a>
          </div>

          {/* Image */}
          <div className="md:w-1/2 rounded-xl overflow-hidden shadow-xl">
            <img
              src="https://res.cloudinary.com/ddtkccfxp/image/upload/v1773935867/Gioi-thieu-HCM_sapsql.jpg"
              alt="Campus TP. Hồ Chí Minh"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Campus Đà Nẵng */}
      <div className="max-w-[1200px] mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Image */}
          <div className="md:w-1/2 rounded-xl overflow-hidden shadow-xl">
            <img
              src="https://res.cloudinary.com/ddtkccfxp/image/upload/v1773935901/Gioi-thieu-DN_isunc8.jpg"
              alt="Campus Đà Nẵng"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info */}
          <div className="md:w-1/2 border border-gray-200 rounded-xl shadow-xl p-8 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Campus Đà Nẵng
            </h2>
            <div className="w-16 h-[3px] bg-orange-500 mb-6" />

            <p className="font-bold text-gray-900 mb-1">Địa chỉ</p>
            <p className="text-gray-600 mb-5 leading-relaxed">
              Khu đô thị công nghệ FPT Đà Nẵng, Phường Ngũ Hành Sơn, TP. Đà
              Nẵng
            </p>

            <p className="font-bold text-gray-900 mb-1">Hotline</p>
            <a
              href="tel:02367300999"
              className="text-orange-500 hover:underline mb-5 inline-block"
            >
              (0236) 730 0999
            </a>

            <p className="font-bold text-gray-900 mb-1">Email</p>
            <a
              href="mailto:tuyensinhdanang@fpt.edu.vn"
              className="text-orange-500 hover:underline inline-block"
            >
              tuyensinhdanang@fpt.edu.vn
            </a>
          </div>
        </div>
      </div>

      {/* Campus Cần Thơ */}
      <div className="max-w-[1200px] mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Info */}
          <div className="md:w-1/2 border border-gray-200 rounded-xl shadow-xl p-8 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Campus Cần Thơ
            </h2>
            <div className="w-16 h-[3px] bg-orange-500 mb-6" />

            <p className="font-bold text-gray-900 mb-1">Địa chỉ</p>
            <p className="text-gray-600 mb-5 leading-relaxed">
              Số 600, đường Nguyễn Văn Cừ (nối dài), Phường An Bình, Thành phố
              Cần Thơ
            </p>

            <p className="font-bold text-gray-900 mb-1">Hotline</p>
            <a
              href="tel:02927303636"
              className="text-orange-500 hover:underline mb-5 inline-block"
            >
              (0292) 730 3636
            </a>

            <p className="font-bold text-gray-900 mb-1">Email</p>
            <a
              href="mailto:tuyensinhcantho@fpt.edu.vn"
              className="text-orange-500 hover:underline inline-block"
            >
              tuyensinhcantho@fpt.edu.vn
            </a>
          </div>

          {/* Image */}
          <div className="md:w-1/2 rounded-xl overflow-hidden shadow-xl">
            <img
              src="https://res.cloudinary.com/ddtkccfxp/image/upload/v1773935905/Gioi-thieu-CT_kowiwy.jpg"
              alt="Campus Cần Thơ"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Campus Quy Nhơn */}
      <div className="max-w-[1200px] mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Image */}
          <div className="md:w-1/2 rounded-xl overflow-hidden shadow-xl">
            <img
              src="https://res.cloudinary.com/ddtkccfxp/image/upload/v1773935903/Gioi-thieu-QN_xepkty.png"
              alt="Campus Quy Nhơn"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info */}
          <div className="md:w-1/2 border border-gray-200 rounded-xl shadow-xl p-8 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Campus Quy Nhơn
            </h2>
            <div className="w-16 h-[3px] bg-orange-500 mb-6" />

            <p className="font-bold text-gray-900 mb-1">Địa chỉ</p>
            <p className="text-gray-600 mb-5 leading-relaxed">
              Khu đô thị mới An Phú Thịnh, Phường Quy Nhơn Đông, Tỉnh Gia Lai
            </p>

            <p className="font-bold text-gray-900 mb-1">Hotline</p>
            <a
              href="tel:02567300999"
              className="text-orange-500 hover:underline mb-5 inline-block"
            >
              (0256) 7300 999
            </a>

            <p className="font-bold text-gray-900 mb-1">Email</p>
            <a
              href="mailto:tuyensinhquynhon@fpt.edu.vn"
              className="text-orange-500 hover:underline inline-block"
            >
              tuyensinhquynhon@fpt.edu.vn
            </a>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}
