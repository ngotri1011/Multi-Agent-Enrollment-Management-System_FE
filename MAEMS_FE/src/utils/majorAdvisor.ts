const MAX_IMAGE_SIZE_MB = 8;
const BYTES_PER_MB = 1024 * 1024;

export const MAJOR_ADVISOR_ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

export const MAJOR_ADVISOR_DOCUMENT_OPTIONS = [
  {
    value: "transcript",
    label: "Bảng điểm học bạ",
    description:
      "Ảnh bảng điểm lớp 11-12 để AI đối chiếu năng lực theo tổ hợp môn.",
  },
  {
    value: "competency",
    label: "Kết quả ĐGNL",
    description:
      "Ảnh phiếu điểm ĐGNL để AI gợi ý ngành theo mức điểm và percentile.",
  },
  {
    value: "school-rank",
    label: "School Rank",
    description:
      "Ảnh minh chứng xếp hạng học sinh tại trường để AI tư vấn ngành phù hợp.",
  },
] as const;

export type MajorAdvisorDocumentOptionValue =
  (typeof MAJOR_ADVISOR_DOCUMENT_OPTIONS)[number]["value"];

export const MAJOR_ADVISOR_DETECTED_TYPE_LABELS: Record<string, string> = {
  transcript: "Học bạ",
  competency: "ĐGNL",
  schoolrank: "School Rank",
  "school-rank": "School Rank",
};

export const MAJOR_ADVISOR_TRANSCRIPT_FIELD_LABELS: Record<string, string> = {
  grade11_Toan: "Toán 11",
  grade11_NguVan: "Ngữ văn 11",
  grade11_NgoaiNgu: "Ngoại ngữ 11",
  grade11_VatLy: "Vật lý 11",
  grade11_HoaHoc: "Hóa học 11",
  grade11_SinhHoc: "Sinh học 11",
  grade11_LichSu: "Lịch sử 11",
  grade11_DiaLy: "Địa lý 11",
  grade11_GDCD: "GDCD 11",
  grade11_CongNghe: "Công nghệ 11",
  grade11_TinHoc: "Tin học 11",
  grade12_Toan: "Toán 12",
  grade12_NguVan: "Ngữ văn 12",
  grade12_NgoaiNgu: "Ngoại ngữ 12",
  grade12_VatLy: "Vật lý 12",
  grade12_HoaHoc: "Hóa học 12",
  grade12_SinhHoc: "Sinh học 12",
  grade12_LichSu: "Lịch sử 12",
  grade12_DiaLy: "Địa lý 12",
  grade12_GDCD: "GDCD 12",
  grade12_CongNghe: "Công nghệ 12",
  grade12_TinHoc: "Tin học 12",
  averageGpa: "Điểm trung bình",
};

// Kiểm tra định dạng + dung lượng ảnh trước khi gửi lên backend để giảm lỗi 400/415 cho người dùng.
export function validateMajorAdvisorImage(file: File): string | null {
  if (
    !MAJOR_ADVISOR_ACCEPTED_IMAGE_TYPES.includes(
      file.type as (typeof MAJOR_ADVISOR_ACCEPTED_IMAGE_TYPES)[number],
    )
  ) {
    return "Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP cho tính năng tư vấn chuyên ngành.";
  }

  if (file.size > MAX_IMAGE_SIZE_MB * BYTES_PER_MB) {
    return `Ảnh vượt quá ${MAX_IMAGE_SIZE_MB}MB, vui lòng chọn ảnh nhẹ hơn.`;
  }

  return null;
}

// Chuẩn hóa tên loại tài liệu backend nhận diện để UI hiển thị nhãn thân thiện với người dùng.
export function getDetectedDocumentTypeLabel(documentType: string): string {
  return MAJOR_ADVISOR_DETECTED_TYPE_LABELS[documentType] ?? documentType;
}
