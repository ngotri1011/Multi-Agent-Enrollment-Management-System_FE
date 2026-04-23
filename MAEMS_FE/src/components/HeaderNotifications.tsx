import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Button,
  Empty,
  List,
  Modal,
  Popover,
  Space,
  Tag,
  Typography,
  notification,
} from "antd";
import { Bell, CheckCheck, Eye } from "lucide-react";
import { useLocation } from "react-router-dom";
import {
  getMyNotifications,
  markNotificationAsRead,
} from "../api/notifications";
import { getStoredToken } from "../services/axios";
import type { Notification as UserNotification } from "../types/notification";
import {
  createNotificationConnection,
  normalizeRealtimeNotification,
} from "../services/notificationSignalR";
import { ensureUtc } from "../utils/date";

const { Text } = Typography;

// Hiển thị toast realtime (SignalR) trên toàn bộ các trang của applicant
// để thông báo hệ thống (thanh toán, duyệt hồ sơ, v.v.) luôn xuất hiện ngay lập tức dù user đang ở trang nào.
const REALTIME_TOAST_PREFIX = "/applicant";

function formatTime(iso: string) {
  // ensureUtc chuẩn hóa chuỗi ISO từ backend (thiếu 'Z', micro giây 4-6 chữ số)
  // để parse đúng UTC rồi hiển thị theo múi giờ địa phương người dùng.
  return new Date(ensureUtc(iso)).toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function HeaderNotifications() {
  // API notification của Ant Design dùng để hiển thị toast thông báo nổi.
  const [notificationsApi, notificationsContextHolder] =
    notification.useNotification();
  const location = useLocation();

  // Quản lý danh sách thông báo và các trạng thái UI liên quan.
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<UserNotification | null>(null);

  // Lưu id thông báo chưa đọc đã từng bật toast để tránh hiển thị lặp trong cùng phiên.
  const shownUnreadRef = useRef<Set<number>>(new Set());

  // Gắn key theo token để mỗi phiên đăng nhập có lịch sử "đã hiện toast" độc lập.
  const dashboardSessionKey = useMemo(() => {
    const token = getStoredToken();
    return `maems_applicant_dashboard_noti_shown:${token ?? "anonymous"}`;
  }, []);

  // Đếm số thông báo chưa đọc để hiển thị badge trên icon chuông.
  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications],
  );

  const loadNotifications = useCallback(async () => {
    // Tải danh sách thông báo mới nhất và sắp xếp giảm dần theo thời gian gửi.
    setLoading(true);
    try {
      const data = await getMyNotifications();
      // Sắp xếp giảm dần theo thời gian; dùng ensureUtc để parse đúng UTC từ BE.
      const sorted = [...(data ?? [])].sort(
        (a, b) =>
          new Date(ensureUtc(b.sentAt)).getTime() -
          new Date(ensureUtc(a.sentAt)).getTime(),
      );
      setNotifications(sorted);
    } finally {
      setLoading(false);
    }
  }, []);

  const markReadLocal = useCallback((id: number) => {
    // Cập nhật local state ngay sau khi đọc để giao diện phản hồi tức thì.
    setNotifications((prev) =>
      prev.map((item) =>
        item.notificationId === id ? { ...item, isRead: true } : item,
      ),
    );
  }, []);

  const handleMarkAsRead = useCallback(
    async (item: UserNotification) => {
      // Tránh gọi API thừa nếu thông báo đã được đánh dấu đọc.
      if (item.isRead) return;
      await markNotificationAsRead(item.notificationId);
      markReadLocal(item.notificationId);
    },
    [markReadLocal],
  );

  const openDetail = async (item: UserNotification) => {
    // Mở modal chi tiết và đồng thời đánh dấu đã đọc nếu cần.
    setPopoverOpen(false);
    setSelected(item);
    setDetailOpen(true);
    try {
      await handleMarkAsRead(item);
    } catch {
      // Vẫn giữ modal mở để không làm gián đoạn trải nghiệm dù API đánh dấu đọc lỗi.
    }
  };

  const handleReadAll = async () => {
    // Đánh dấu toàn bộ thông báo chưa đọc theo lô để người dùng thao tác nhanh.
    const unread = notifications.filter((item) => !item.isRead);
    if (!unread.length) return;
    await Promise.all(
      unread.map((item) => markNotificationAsRead(item.notificationId)),
    );
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
  };

  // Hàm này dùng để đẩy thông báo mới từ SignalR vào UI
  const pushNotificationToUI = useCallback(
    (item: UserNotification) => {
      setNotifications((prev) => {
        const exists = prev.some(
          (n) => n.notificationId === item.notificationId,
        );

        const next = exists
          ? prev.map((n) =>
              n.notificationId === item.notificationId ? { ...n, ...item } : n,
            )
          : [item, ...prev];

        // Sắp xếp lại sau khi thêm/cập nhật thông báo realtime.
        return [...next].sort(
          (a, b) =>
            new Date(ensureUtc(b.sentAt)).getTime() -
            new Date(ensureUtc(a.sentAt)).getTime(),
        );
      });

      if (location.pathname.startsWith(REALTIME_TOAST_PREFIX) && !item.isRead) {
        const key = `realtime-notification-${item.notificationId}`;

        notificationsApi.open({
          key,
          message: "Thông báo mới",
          description: (
            <div className="pr-2">
              <Text className="text-sm text-gray-700">{item.message}</Text>
              <div className="mt-2">
                <Button
                  size="small"
                  type="link"
                  className="!px-0 !text-orange-600"
                  onClick={async () => {
                    notificationsApi.destroy(key);
                    setSelected(item);
                    setDetailOpen(true);
                    try {
                      await handleMarkAsRead(item);
                    } catch {
                      // giữ modal mở
                    }
                  }}
                >
                  Xem chi tiết
                </Button>
              </div>
            </div>
          ),
          placement: "topRight",
          duration: 6,
        });
      }
    },
    [handleMarkAsRead, location.pathname, notificationsApi],
  );

  useEffect(() => {
    const connection = createNotificationConnection();
    if (!connection) return;

    let isMounted = true;

    connection.on("ReceiveNotification", (payload: unknown) => {
      if (!isMounted) return;

      const incoming = normalizeRealtimeNotification(payload);
      if (!incoming) return;

      pushNotificationToUI(incoming as UserNotification);
    });

    connection.start().catch((err) => {
      console.error("Lỗi kết nối đến SignalR:", err);
    });

    connection.onreconnected(() => {
      console.log("Đang kết nối lại SignalR...");
    });

    connection.onclose(() => {
      console.log("Kết nối SignalR đã đóng");
    });

    return () => {
      isMounted = false;
      connection.stop().catch(() => undefined);
    };
  }, [pushNotificationToUI]);

  useEffect(() => {
    // Tải dữ liệu ngay khi component được mount.
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    // Chỉ tự bật toast trên trang dashboard applicant để tránh làm phiền ở trang khác.
    if (location.pathname !== "/applicant/dashboard") {
      return;
    }
    // Mỗi phiên chỉ bật loạt toast đầu tiên một lần để hạn chế spam thông báo.
    if (sessionStorage.getItem(dashboardSessionKey) === "1") {
      return;
    }

    const unreadToShow = notifications.filter(
      (item) =>
        !item.isRead && !shownUnreadRef.current.has(item.notificationId),
    );
    if (!unreadToShow.length) {
      return;
    }

    sessionStorage.setItem(dashboardSessionKey, "1");

    unreadToShow.forEach((item) => {
      const key = `notification-${item.notificationId}`;
      notificationsApi.open({
        key,
        message: "Thông báo mới",
        description: (
          <div className="pr-2">
            <Text className="text-sm text-gray-700">{item.message}</Text>
            <div className="mt-2">
              <Button
                size="small"
                type="link"
                className="!px-0 !text-orange-600"
                onClick={async () => {
                  notificationsApi.destroy(key);
                  setSelected(item);
                  setDetailOpen(true);
                  try {
                    await handleMarkAsRead(item);
                  } catch {
                    // Vẫn giữ modal mở để người dùng xem nội dung dù thao tác đọc thất bại.
                  }
                }}
              >
                Xem chi tiết
              </Button>
            </div>
          </div>
        ),
        placement: "topRight",
        duration: 6,
      });
      shownUnreadRef.current.add(item.notificationId);
    });
  }, [
    notifications,
    notificationsApi,
    handleMarkAsRead,
    location.pathname,
    dashboardSessionKey,
  ]);

  const popoverContent = (
    // Nội dung popover gồm danh sách thông báo + thao tác đọc tất cả/tải lại.
    <div className="w-[360px] max-w-[80vw]">
      <div className="flex items-center justify-between mb-3">
        <Text strong className="text-gray-800">
          Thông báo của bạn
        </Text>
        <Space size={6}>
          <Button
            size="small"
            type="text"
            icon={<CheckCheck size={14} />}
            onClick={handleReadAll}
            disabled={unreadCount === 0}
            className="!text-xs"
          >
            Đọc tất cả
          </Button>
          <Button
            size="small"
            type="text"
            onClick={loadNotifications}
            loading={loading}
            className="!text-xs"
          >
            Tải lại
          </Button>
        </Space>
      </div>

      {!notifications.length ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Chưa có thông báo"
          className="!my-6"
        />
      ) : (
        <List
          size="small"
          className="max-h-[420px] overflow-auto"
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              className={`!px-2 !py-2 rounded-lg mb-1 ${item.isRead ? "bg-white" : "bg-orange-50"}`}
              actions={[
                <Button
                  key="view"
                  type="link"
                  size="small"
                  icon={<Eye size={13} />}
                  className="!px-0"
                  onClick={() => openDetail(item)}
                >
                  Chi tiết
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={
                  <div className="flex items-center gap-2">
                    <Text className="!text-sm !font-medium !text-gray-800 line-clamp-1">
                      {item.notificationType || "Thông báo"}
                    </Text>
                    {!item.isRead && (
                      <Tag color="red" className="!m-0 !text-[10px]">
                        Mới
                      </Tag>
                    )}
                  </div>
                }
                description={
                  <div>
                    <Text className="!text-xs !text-gray-600 line-clamp-2">
                      {item.message}
                    </Text>
                    <div>
                      <Text className="!text-[11px] !text-gray-400">
                        {formatTime(item.sentAt)}
                      </Text>
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );

  return (
    <>
      {notificationsContextHolder}
      <Popover
        trigger="click"
        placement="bottomRight"
        content={popoverContent}
        open={popoverOpen}
        onOpenChange={setPopoverOpen}
      >
        <Badge count={unreadCount} size="small">
          <Button
            type="text"
            shape="circle"
            icon={<Bell size={18} />}
            className="!text-gray-600 hover:!text-orange-500 hover:!bg-orange-50"
          />
        </Badge>
      </Popover>

      <Modal
        // Modal chi tiết hiển thị đầy đủ nội dung thông báo người dùng chọn.
        title="Chi tiết thông báo"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailOpen(false)}>
            Đóng
          </Button>,
        ]}
      >
        {selected ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Text strong>{selected.notificationType || "Thông báo"}</Text>
              {!selected.isRead && <Tag color="red">Mới</Tag>}
            </div>
            <Text className="block text-gray-700 whitespace-pre-wrap">
              {selected.message}
            </Text>
            <Text className="text-xs text-gray-400">
              {formatTime(selected.sentAt)}
            </Text>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
