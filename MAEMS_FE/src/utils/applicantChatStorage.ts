/**
 * Utility này chịu trách nhiệm quản lý lịch sử chat của applicant trong `localStorage`.
 * Mỗi applicant được tách dữ liệu theo email để tránh dùng chung hội thoại giữa nhiều tài khoản.
 */
export type ApplicantChatMessage = {
  id: string;
  role: "bot" | "user";
  text: string;
};

/** Prefix version hóa key để dễ đổi cấu trúc dữ liệu về sau mà không đụng key cũ. */
const STORAGE_PREFIX = "maems-applicant-chat:v1:";

/** Legacy single key (pre per-user); remove when present to avoid wrong sharing. */
export const LEGACY_APPLICANT_CHAT_KEY = "maems-applicant-chat-thread";

/** Tạo storage key riêng cho từng applicant dựa trên email đã được chuẩn hóa. */
export function applicantChatStorageKey(email: string): string {
  return `${STORAGE_PREFIX}${email.toLowerCase().trim()}`;
}

/** Xóa toàn bộ lịch sử chat của đúng applicant khi cần reset hội thoại. */
export function clearApplicantChatForEmail(email: string): void {
  try {
    localStorage.removeItem(applicantChatStorageKey(email));
  } catch {
    // ignore
  }
}

/**
 * Parse dữ liệu raw từ `localStorage` và chỉ giữ lại các message đúng shape mong đợi.
 * Bước lọc này giúp UI an toàn hơn khi dữ liệu cũ/hỏng hoặc bị sửa thủ công trong browser.
 */
function parseThread(raw: string): ApplicantChatMessage[] {
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data)) return [];
  return data.filter(
    (m): m is ApplicantChatMessage =>
      m != null &&
      typeof m === "object" &&
      typeof (m as ApplicantChatMessage).id === "string" &&
      ((m as ApplicantChatMessage).role === "user" ||
        (m as ApplicantChatMessage).role === "bot") &&
      typeof (m as ApplicantChatMessage).text === "string"
  );
}

/** Đọc lịch sử chat đã lưu của applicant; nếu không có hoặc lỗi thì trả về mảng rỗng. */
export function loadApplicantChatThread(email: string): ApplicantChatMessage[] {
  try {
    const raw = localStorage.getItem(applicantChatStorageKey(email));
    if (!raw) return [];
    return parseThread(raw);
  } catch {
    return [];
  }
}

/** Ghi đè toàn bộ thread chat hiện tại của applicant xuống `localStorage`. */
export function saveApplicantChatThread(
  email: string,
  messages: ApplicantChatMessage[]
): void {
  try {
    localStorage.setItem(
      applicantChatStorageKey(email),
      JSON.stringify(messages)
    );
  } catch {
    // ignore quota / private mode
  }
}
