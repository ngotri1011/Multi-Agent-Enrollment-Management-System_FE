import { Home, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { GuestLayout } from "../../components/layouts/GuestLayout";

export function AdmissionTypesPage() {
  return (
    <GuestLayout>
      <img
        src="https://res.cloudinary.com/ddtkccfxp/image/upload/v1774154695/Bannerweb-phuongthuctuyensinh_guq1np.png"
        alt="Phương thức tuyển sinh"
        style={{
          width: "100%",
          display: "block",
        }}
      />

      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex items-center gap-2 py-4 text-sm">
          <Link to="/">
            <Home size={18} className="text-orange-500" fill="currentColor" />
          </Link>
          <ChevronRight size={14} className="text-gray-400" />
          <Link to="/tuyen-sinh" className="text-orange-500 hover:underline">
            Tuyển sinh
          </Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-gray-600">Phương thức tuyển sinh</span>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          TRƯỜNG ĐẠI HỌC FPT CÔNG BỐ DỰ KIẾN PHƯƠNG THỨC TUYỂN SINH 2026
        </h1>

        <p className="text-gray-700 leading-relaxed mb-8">
          Trường Đại học FPT dự kiến tuyển sinh hệ đại học chính quy năm 2026
          với 03 phương thức xét tuyển, được xây dựng theo định hướng kết hợp đa
          tiêu chí, nhằm đánh giá toàn diện năng lực học tập của thí sinh và mở
          rộng cơ hội tiếp cận môi trường đào tạo đại học gắn với thực tiễn.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mb-4">
          1. Phương thức tuyển sinh dự kiến:
        </h2>

        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Phương thức 1: Xét tuyển thẳng
        </h3>
        <p className="text-gray-700 leading-relaxed mb-6">
          Áp dụng cho thí sinh thuộc diện xét tuyển thẳng theo quy định hiện
          hành của Bộ Giáo dục và Đào tạo.
        </p>

        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Phương thức 2: Xét tuyển kết hợp
        </h3>
        <p className="text-gray-700 leading-relaxed mb-4">
          Xét tuyển dựa trên kết quả kỳ thi tốt nghiệp THPT kết hợp với kết
          quả học tập THPT, cùng với điểm ưu tiên theo quy định, nhằm đánh giá
          toàn diện quá trình học tập của thí sinh thay vì chỉ dựa trên một tiêu
          chí đơn lẻ.
        </p>
        <p className="text-gray-700 leading-relaxed mb-2">
          Điểm xét tuyển dự kiến được xác định như sau:
        </p>
        <p className="text-gray-700 leading-relaxed mb-2 font-semibold">
          Điểm xét tuyển = (Điểm thi THPT + ĐTB các năm học)/2 + Điểm ưu tiên
        </p>
        <p className="text-gray-700 leading-relaxed mb-4">
          Điểm xét tuyển làm tròn đến 2 số lẻ.
        </p>

        <p className="text-gray-700 leading-relaxed mb-2">Trong đó:</p>
        <p className="text-gray-700 leading-relaxed mb-2">
          – Điểm thi THPT quy định như sau:
        </p>
        <p className="text-gray-700 leading-relaxed mb-2 pl-4">
          Tổ hợp Axx = (Điểm Toán*2 + Điểm 2 môn)/4*3, làm tròn đến 2 số lẻ;
          áp dụng đối với thí sinh đăng ký vào tất cả các ngành.
        </p>
        <p className="text-gray-700 leading-relaxed mb-4 pl-4">
          Tổ hợp Cxx = (Điểm Văn*2 + Điểm 2 môn)/4*3, làm tròn đến 2 số lẻ;
          áp dụng đối với thí sinh đăng ký vào các ngành ngoài các ngành Công
          nghệ thông tin và Khoa học máy tính
        </p>
        <p className="text-gray-700 leading-relaxed mb-2">
          – ĐTB các năm học được tính như sau:
        </p>
        <p className="text-gray-700 leading-relaxed mb-2 pl-4 font-semibold">
          ĐTB các năm học = [(ĐTB lớp 10) + (ĐTB lớp 11)*2 + (ĐTB lớp
          12)*3]/2
        </p>
        <p className="text-gray-700 leading-relaxed mb-4 pl-4">
          ĐTB các năm học được làm tròn đến 2 số lẻ.
        </p>
        <p className="text-gray-700 leading-relaxed mb-6">
          – Điểm ưu tiên theo quy định tại Điều 7 Quy chế Tuyển sinh đại học,
          tuyển sinh cao đẳng ngành Giáo dục Mầm non (Ban hành kèm theo Thông
          tư ban hành Quy chế tuyển sinh đại học, tuyển sinh cao đẳng ngành Giáo
          dục Mầm non)
        </p>

        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Phương thức 3: Ưu tiên xét tuyển
        </h3>
        <p className="text-gray-700 leading-relaxed mb-2">
          Áp dụng đối với các nhóm thí sinh có nền tảng học tập hoặc quá trình
          đào tạo phù hợp, bao gồm:
        </p>
        <p className="text-gray-700 leading-relaxed mb-2 pl-4">
          – Thí sinh tốt nghiệp THPT nước ngoài, tốt nghiệp THPT các trường
          thuộc Tổ chức giáo dục FPT;
        </p>
        <p className="text-gray-700 leading-relaxed mb-6 pl-4">
          – Thí sinh có các chứng chỉ hoặc văn bằng: Chứng chỉ APTECH
          HDSE/ADSE, ARENA ADIM, SKILLKING, JETKING; Tốt nghiệp chương trình
          BTEC HND, Melbourne Polytechnic, FUNiX Software Engineering, Cao đẳng
          FPT Polytechnic.
        </p>

        <p className="text-gray-700 leading-relaxed mb-8 italic">
          *Lưu ý chung: các thí sinh đăng ký học ngành Luật phải đảm bảo điều
          kiện theo quy định tại Quyết định số 678/QĐ-BGDĐT ngày 14 tháng 03
          năm 2025 của Bộ trưởng Bộ Giáo dục và Đào tạo Ban hành Chuẩn chương
          trình đào tạo lĩnh vực pháp luật trình độ đại học.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mb-4">
          2. Đối tượng dự tuyển
        </h2>
        <p className="text-gray-700 leading-relaxed mb-2 pl-4">
          – Người đã được công nhận tốt nghiệp trung học phổ thông (THPT) của
          Việt Nam hoặc có bằng tốt nghiệp của nước ngoài được công nhận trình
          độ tương đương;
        </p>
        <p className="text-gray-700 leading-relaxed mb-8 pl-4">
          – Người đã có bằng tốt nghiệp trung cấp ngành nghề thuộc cùng nhóm
          ngành dự tuyển và đã hoàn thành đủ yêu cầu khối lượng kiến thức văn
          hóa cấp THPT theo quy định của pháp luật.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mb-4">
          3. Chính sách ưu tiên dự kiến
        </h2>
        <p className="text-gray-700 leading-relaxed mb-2 pl-4">
          – Điểm khuyến khích, điểm ưu tiên đối tượng và khu vực thực hiện theo
          quy định của Bộ Giáo dục và Đào tạo.
        </p>
        <p className="text-gray-700 leading-relaxed mb-8 pl-4">
          – Thí sinh là sinh viên thế hệ 1 – người đầu tiên trong gia đình (gồm
          phụ huynh hoặc người bảo trợ và tất cả anh chị em ruột) học đại học –
          được cộng 1,5 điểm vào Điểm xét tuyển
        </p>

        <h2 className="text-xl font-bold text-gray-900 mb-4">
          4. Lịch trình tuyển sinh dự kiến
        </h2>
        <p className="text-gray-700 leading-relaxed mb-2 pl-4">
          – Đợt 1: theo lịch trình chung của Bộ Giáo dục và Đào tạo.
        </p>
        <p className="text-gray-700 leading-relaxed mb-8 pl-4">
          – Các đợt tuyển bổ sung (nếu có) căn cứ vào kết quả đợt tuyển sinh
          trước đó và sẽ được thông báo.
        </p>
      </div>
    </GuestLayout>
  );
}
