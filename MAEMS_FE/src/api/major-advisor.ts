import { apiClient } from "../services/axios";
import type { ApiWrapper } from "../types/api.wrapper";
import type { MajorAdvisorAnalyzeResponse } from "../types/major-advisor";

// Hàm phân tích response từ API để chuẩn hóa và trả về kiểu dữ liệu chính xác.
function parseAnalyzeResponse(
  data:
    | string
    | MajorAdvisorAnalyzeResponse
    | ApiWrapper<MajorAdvisorAnalyzeResponse>,
): MajorAdvisorAnalyzeResponse {
  // Backend có thể khai báo text/plain nhưng body thực tế là JSON, nên cần parse mềm để tránh vỡ UI.
  const normalizedData =
    typeof data === "string"
      ? (JSON.parse(data) as
          | MajorAdvisorAnalyzeResponse
          | ApiWrapper<MajorAdvisorAnalyzeResponse>)
      : data;

  // Chuẩn hóa cả 2 kiểu trả về: trực tiếp object hoặc bọc trong ApiWrapper<T>.
  if ("data" in normalizedData) {
    return normalizedData.data;
  }

  return normalizedData;
}
// API endpoint để phân tích hồ sơ tư vấn chuyên ngành.
export async function analyzeMajorAdvisor(
  formData: FormData,
): Promise<MajorAdvisorAnalyzeResponse> {
  const res = await apiClient.post<
    | string
    | MajorAdvisorAnalyzeResponse
    | ApiWrapper<MajorAdvisorAnalyzeResponse>
  >("/api/MajorAdvisor/analyze", formData);

  return parseAnalyzeResponse(res.data);
}
