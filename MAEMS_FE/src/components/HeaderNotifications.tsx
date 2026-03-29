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
import { getMyNotifications, markNotificationAsRead } from "../api/notifications";
import { getStoredToken } from "../services/axios";
import type { Notification as UserNotification } from "../types/notification";

const { Text } = Typography;

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("vi-VN");
}

export function HeaderNotifications() {
  const [notificationsApi, notificationsContextHolder] = notification.useNotification();
  const location = useLocation();

  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<UserNotification | null>(null);
  const shownUnreadRef = useRef<Set<number>>(new Set());
  const dashboardSessionKey = useMemo(() => {
    const token = getStoredToken();
    return `maems_applicant_dashboard_noti_shown:${token ?? "anonymous"}`;
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications],
  );

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyNotifications();
      const sorted = [...(data ?? [])].sort(
        (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime(),
      );
      setNotifications(sorted);
    } finally {
      setLoading(false);
    }
  }, []);

  const markReadLocal = useCallback((id: number) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.notificationId === id ? { ...item, isRead: true } : item,
      ),
    );
  }, []);

  const handleMarkAsRead = useCallback(
    async (item: UserNotification) => {
      if (item.isRead) return;
      await markNotificationAsRead(item.notificationId);
      markReadLocal(item.notificationId);
    },
    [markReadLocal],
  );

  const openDetail = async (item: UserNotification) => {
    setPopoverOpen(false);
    setSelected(item);
    setDetailOpen(true);
    try {
      await handleMarkAsRead(item);
    } catch {
      // Keep modal open even if mark-read fails.
    }
  };

  const handleReadAll = async () => {
    const unread = notifications.filter((item) => !item.isRead);
    if (!unread.length) return;
    await Promise.all(unread.map((item) => markNotificationAsRead(item.notificationId)));
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
  };

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (location.pathname !== "/applicant/dashboard") {
      return;
    }
    if (sessionStorage.getItem(dashboardSessionKey) === "1") {
      return;
    }

    const unreadToShow = notifications.filter(
      (item) => !item.isRead && !shownUnreadRef.current.has(item.notificationId),
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
                      // Keep modal open even if mark-read fails.
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
  }, [notifications, notificationsApi, handleMarkAsRead, location.pathname, dashboardSessionKey]);

  const popoverContent = (
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
                    <Text className="!text-xs !text-gray-600 line-clamp-2">{item.message}</Text>
                    <div>
                      <Text className="!text-[11px] !text-gray-400">{formatTime(item.sentAt)}</Text>
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
            <Text className="block text-gray-700 whitespace-pre-wrap">{selected.message}</Text>
            <Text className="text-xs text-gray-400">{formatTime(selected.sentAt)}</Text>
          </div>
        ) : null}
      </Modal>
    </>
  );
}

