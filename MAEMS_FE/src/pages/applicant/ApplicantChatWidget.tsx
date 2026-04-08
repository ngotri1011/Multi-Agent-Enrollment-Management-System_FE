import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import { askChatbox } from "../../api/chatbox";
import { useAuthStore } from "../../stores/authStore";
import {
  LEGACY_APPLICANT_CHAT_KEY,
  loadApplicantChatThread,
  saveApplicantChatThread,
  type ApplicantChatMessage,
} from "../../utils/applicantChatStorage";
import { formatChatText } from "../../utils/chatTextFormatter";

// Tin nhắn hệ thống mặc định luôn hiển thị đầu cuộc hội thoại.
const WELCOME_MESSAGE: ApplicantChatMessage = {
  id: "welcome-message",
  role: "bot",
  text: "Xin chào Anh/Chị! Em là trợ lý AI của MAEMS. Em rất sẵn lòng hỗ trợ Anh/Chị.",
};

export function ApplicantChatWidget() {
  // Lấy thông tin người dùng hiện tại để biết email và phân tách lịch sử chat.
  const user = useAuthStore((s) => s.user);
  // Điều khiển trạng thái mở/đóng widget chat.
  const [isOpen, setIsOpen] = useState(false);
  // Nội dung người dùng đang nhập vào ô chat.
  const [input, setInput] = useState("");
  // Cờ đang gửi câu hỏi lên server để khóa nút gửi và hiển thị trạng thái chờ.
  const [isSending, setIsSending] = useState(false);
  // Danh sách tin nhắn thực tế của phiên chat (không gồm welcome message).
  const [threadMessages, setThreadMessages] = useState<ApplicantChatMessage[]>([]);
  // Đánh dấu email đã được hydrate dữ liệu từ localStorage.
  const [hydratedForEmail, setHydratedForEmail] = useState<string | null>(null);
  // Lưu thông báo lỗi tạm thời khi gửi thất bại.
  const [errorText, setErrorText] = useState<string | null>(null);
  // Neo cuối danh sách tin nhắn để tự cuộn xuống.
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  // Đảm bảo chỉ chạy thao tác dọn dữ liệu legacy đúng một lần.
  const legacyRemovedRef = useRef(false);

  // Ghép tin nhắn chào mặc định với thread hiện tại để render thống nhất.
  const allMessages = useMemo(
    () => [WELCOME_MESSAGE, ...threadMessages],
    [threadMessages]
  );

  useEffect(() => {
    // Xóa dữ liệu chat cũ (legacy key) chỉ 1 lần khi component mount.
    if (legacyRemovedRef.current) return;
    legacyRemovedRef.current = true;
    try {
      localStorage.removeItem(LEGACY_APPLICANT_CHAT_KEY);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    // Tải lịch sử chat theo email đang đăng nhập để tách riêng từng tài khoản.
    const email = user?.email?.trim();
    if (!email) {
      // Nếu chưa có email thì reset trạng thái chat về rỗng.
      setThreadMessages([]);
      setHydratedForEmail(null);
      return;
    }
    // Khôi phục lịch sử chat đã lưu ở localStorage cho đúng người dùng.
    setThreadMessages(loadApplicantChatThread(email));
    setHydratedForEmail(email);
  }, [user?.email]);

  useEffect(() => {
    // Chỉ lưu lại thread sau khi đã hydrate xong đúng email hiện tại.
    const email = user?.email?.trim();
    if (!email || hydratedForEmail !== email) return;
    // Đồng bộ mọi thay đổi hội thoại vào localStorage.
    saveApplicantChatThread(email, threadMessages);
  }, [threadMessages, user?.email, hydratedForEmail]);

  // Hàm tiện ích để cuộn khung chat đến tin nhắn mới nhất.
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Mỗi khi mở widget hoặc có tin nhắn mới, tự động cuộn xuống cuối khung chat.
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, allMessages.length, isSending]);

  const handleSend = async () => {
    // Chặn gửi nếu input rỗng, đang gửi, hoặc chưa có email người dùng.
    const question = input.trim();
    if (!question || isSending || !user?.email) return;

    // Thêm ngay câu hỏi của người dùng vào giao diện để phản hồi tức thời (optimistic UI).
    const tempQuestion: ApplicantChatMessage = {
      id: `local-q-${Date.now()}`,
      role: "user",
      text: question,
    };
    // Cập nhật UI trước, sau đó mới gọi API.
    setThreadMessages((prev) => [...prev, tempQuestion]);
    setInput("");
    setIsSending(true);
    setErrorText(null);

    try {
      // Gọi API chatbox và thêm câu trả lời của bot vào thread hiện tại.
      const response = await askChatbox(question);
      setThreadMessages((prev) => [
        ...prev,
        {
          id: `a-${response.chatId}-${Date.now()}`,
          role: "bot",
          text: response.answer,
        },
      ]);
    } catch {
      // Nếu gọi API thất bại thì hiển thị thông báo lỗi cho người dùng.
      setErrorText("Gửi câu hỏi thất bại. Vui lòng thử lại.");
    } finally {
      // Dù thành công hay thất bại đều kết thúc trạng thái gửi.
      setIsSending(false);
    }
  };

  return (
    <>
      {/* Nút nổi mở chat khi widget đang đóng. */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[1000] h-14 w-14 rounded-full bg-orange-500 text-white shadow-lg transition hover:bg-orange-600"
          aria-label="Mở trợ lý AI"
        >
          <MessageCircle className="mx-auto h-6 w-6" />
        </button>
      )}

      {/* Cửa sổ chat chính khi widget được mở. */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-[1000] flex h-[calc(100dvh-2.5rem)] w-[min(360px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-2xl">
          {/* Header: tên trợ lý và nút đóng. */}
          <div className="flex shrink-0 items-center justify-between bg-orange-500 px-4 py-3 text-white">
            <div className="flex min-w-0 items-center gap-2">
              <div className="shrink-0 rounded-full bg-white/25 p-1.5">
                <Bot className="h-4 w-4" />
              </div>
              <div className="truncate text-lg font-semibold">Trợ lý MAEMS</div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="shrink-0 rounded-md bg-white/20 p-1.5 transition hover:bg-white/30"
              aria-label="Đóng trợ lý AI"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Nội dung hội thoại có thể cuộn dọc. */}
          <div className="min-h-0 flex-1 overflow-y-auto bg-orange-50/30 px-3 py-4">
            {/* Render toàn bộ tin nhắn: gồm lời chào và lịch sử thread. */}
            {allMessages.map((message) => (
              <div
                key={message.id}
                className={`mb-3 flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-3 py-2 text-[16px] leading-relaxed ${
                    message.role === "user"
                      ? "bg-orange-500 text-white"
                      : "bg-white text-gray-700 shadow-sm"
                  }`}
                >
                  <div className="break-words">{formatChatText(message.text)}</div>
                </div>
              </div>
            ))}

            {/* Trạng thái bot đang xử lý câu hỏi. */}
            {isSending && (
              <div className="mb-3 flex justify-start">
                <div className="rounded-2xl bg-white px-3 py-2 text-sm text-gray-500 shadow-sm">
                  Trợ lý đang trả lời...
                </div>
              </div>
            )}

            {/* Thông báo lỗi khi gọi API thất bại. */}
            {errorText && (
              <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
                {errorText}
              </div>
            )}

            {/* Điểm neo dùng để cuộn xuống cuối danh sách tin nhắn. */}
            <div ref={messagesEndRef} />
          </div>

          {/* Khu vực nhập tin nhắn và gửi câu hỏi. */}
          <div className="shrink-0 border-t border-orange-100 p-3">
            <div className="flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3 py-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  // Hỗ trợ gửi nhanh bằng phím Enter.
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
                placeholder="Nhập tin nhắn..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={isSending || !input.trim() || !user?.email}
                className="rounded-full bg-orange-500 p-2 text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-200"
                aria-label="Gửi tin nhắn"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            {/* Lưu ý pháp lý cho nội dung tư vấn từ AI. */}
            <p className="mt-2 text-center text-xs text-gray-400">
              Thông tin chỉ mang tính tham khảo, được tư vấn bởi AI.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
