import { apiClient } from "../services/axios";
import type { ChatboxHistoryResponse, ChatboxResponse } from "../types/chatbox";

export const askChatbox = async (question: string) => {
  // Gửi câu hỏi của người dùng lên chatbox và nhận câu trả lời từ backend.
  const res = await apiClient.post<ChatboxResponse>("/api/ChatBox/ask", {
    question,
  });
  // Trả về đúng phần dữ liệu response để component sử dụng trực tiếp.
  return res.data;
};

export const getChatboxHistory = async (
  pageNumber: number,
  pageSize: number,
) => {
  // Lấy lịch sử hội thoại theo phân trang để tối ưu tải dữ liệu.
  const res = await apiClient.get<ChatboxHistoryResponse>(
    `/api/ChatBox/history`,
    {
      params: {
        // Truyền tham số phân trang qua query params.
        pageNumber,
        pageSize,
      },
    },
  );
  // Chuẩn hóa đầu ra: chỉ trả dữ liệu cần thiết từ response.
  return res.data;
};
