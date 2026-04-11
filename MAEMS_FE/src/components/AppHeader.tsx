import { Avatar, Dropdown, Layout } from "antd";
import type { MenuProps } from "antd";
import {
  Home,
  Info,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Newspaper,
  Phone,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PRIMARY_THEME_COLOR } from "../constants/colors";
import { useAuth } from "../hooks/useAuth";
import type { AuthRole } from "../types/auth";

const { Header } = Layout;

// Ánh xạ vai trò người dùng sang đường dẫn dashboard tương ứng
const roleDashboard: Record<AuthRole, string> = {
  applicant: "/applicant/dashboard",
  admin: "/admin/dashboard",
  officer: "/officer/dashboard",
  qa: "/qa/dashboard",
};

// Cấu hình danh sách điều hướng chính: đường dẫn, nhãn và icon
const NAV_ITEMS = [
  { to: "/", label: "Trang chủ", icon: Home },
  { to: "/tuyen-sinh", label: "Tuyển sinh", icon: Info },
  { to: "/dao-tao", label: "Đào tạo", icon: Newspaper },
  { to: "/tin-tuc", label: "Tin tức", icon: Newspaper },
  { to: "/lien-he", label: "Liên hệ", icon: Phone },
];

export function AppHeader() {
  // Trạng thái mở/đóng drawer điều hướng trên mobile
  const [mobileOpen, setMobileOpen] = useState(false);

  // Header thay đổi kiểu dáng khi trang đã cuộn xuống
  const [scrolled, setScrolled] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Lắng nghe sự kiện cuộn để kích hoạt shadow/border cho header
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Không khoá scroll body — tránh gây dịch layout hoặc biến dạng background

  const closeMobile = () => setMobileOpen(false);

  const handleLogout = () => {
    logout();
    closeMobile();
    navigate("/auth", { replace: true });
  };

  const dashboardPath = user ? (roleDashboard[user.role] ?? "/") : "/";

  // Menu dropdown avatar cho desktop
  const userMenuItems: MenuProps["items"] = [
    {
      key: "dashboard",
      icon: <LayoutDashboard size={14} />,
      label: <Link to={dashboardPath}>Dashboard</Link>,
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogOut size={14} />,
      label: "Đăng xuất",
      danger: true,
      onClick: handleLogout,
    },
  ];

  // Xác định link đang được chọn để hiển thị trạng thái active
  const isActive = (to: string) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <>
      {/* Vùng đệm giữ layout không bị đẩy lên sau header cố định */}
      <div className="h-[84px]" aria-hidden />

      {/* ── Overlay nhẹ mobile: chỉ mờ opacity, không dùng blur ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/20 md:hidden"
            onClick={closeMobile}
            aria-hidden
          />
        )}
      </AnimatePresence>

      {/* ── Header chính cố định ── */}
      <Header
        className={`
          !h-auto !leading-none !px-0
          fixed top-2 left-1/2 -translate-x-1/2
          w-[calc(100%-24px)] max-w-4xl
          z-[60] !bg-white/70 backdrop-blur-xs
          rounded-4xl border transition-[border-color,box-shadow,transform] duration-300
          ${
            scrolled
              ? "border-orange-200/70 shadow-[0_4px_28px_rgba(0,0,0,0.10)]"
              : "border-orange-100/50 shadow-sm"
          }
        `}
        style={{ borderBottom: "none" }}
      >
        {/* ── Thanh ngang: logo / nav desktop / tài khoản + hamburger ── */}
        <div className="flex items-center justify-between px-4 sm:px-5 lg:px-6 py-3 gap-4">
          {/* Logo */}
          {/* Tăng cảm giác "premium" cho thương hiệu bằng hover nhấc nhẹ và scale rất nhỏ. */}
          <motion.div
            whileHover={{ y: -1, scale: 1.02 }}
            transition={{ duration: 0.18 }}
          >
            <Link
              to="/"
              onClick={closeMobile}
              className="font-extrabold text-xl tracking-[0.1em] uppercase !text-orange-500 hover:!text-orange-600 transition-colors duration-200 shrink-0"
            >
              MAEMS
            </Link>
          </motion.div>

          {/* Nav desktop — pill fill đặc; active: nền cam đậm + chữ trắng qua inline style để không bị Ant Design ghi đè */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {NAV_ITEMS.map(({ to, label }) => {
              const active = isActive(to);
              return (
                <motion.div
                  key={to}
                  whileHover={{ y: active ? 0 : -2 }}
                  transition={{ type: "spring", stiffness: 320, damping: 24 }}
                >
                  <Link
                    to={to}
                    aria-current={active ? "page" : undefined}
                    /* inline style đảm bảo bg + color không bị Ant Design override */
                    style={
                      active
                        ? { backgroundColor: PRIMARY_THEME_COLOR, color: "white" }
                        : undefined
                    }
                    className={`
                      inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200
                      ${
                        active
                          ? "hover:opacity-90"
                          : "!text-gray-600 hover:!text-[#ff6900] hover:bg-[#ff6900]/10"
                      }
                    `}
                  >
                    {label}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Khu vực phải: tài khoản (desktop) + hamburger (mobile) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Tài khoản desktop — ẩn trên mobile để tránh vỡ layout */}
            <div className="hidden md:block">
              {isAuthenticated && user ? (
                <Dropdown menu={{ items: userMenuItems }} trigger={["click"]}>
                  {/* Trigger avatar dùng hover spring nhẹ để tạo phản hồi chuột tự nhiên hơn. */}
                  <motion.button
                    whileHover={{ y: -1, scale: 1.015 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 380, damping: 24 }}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-2xl hover:bg-orange-50/80 transition-all duration-200 cursor-pointer border-none bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-400"
                    aria-label="Mở menu người dùng"
                  >
                    <Avatar
                      size={32}
                      src={user.photoURL}
                      className="!bg-orange-500 !text-white font-bold shrink-0"
                    >
                      {user.username?.charAt(0).toUpperCase()}
                    </Avatar>
                    <span className="text-sm font-medium text-gray-700 max-lg:hidden">
                      {user.username}
                    </span>
                  </motion.button>
                </Dropdown>
              ) : (
                <Link to="/auth">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold shadow-sm hover:shadow-md transition-[background,box-shadow] duration-200"
                  >
                    <LogIn size={15} />
                    Đăng nhập
                  </motion.button>
                </Link>
              )}
            </div>

            {/* Nút hamburger — icon chuyển đổi xoay mượt bằng motion */}
            <motion.button
              type="button"
              onClick={() => setMobileOpen((p) => !p)}
              aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
              aria-expanded={mobileOpen}
              whileTap={{ scale: 0.88 }}
              transition={{ duration: 0.12 }}
              whileHover={{ y: -1, scale: 1.03 }}
              className="md:hidden w-10 h-10 rounded-2xl border border-orange-200/70 bg-white/60 text-orange-500 hover:bg-orange-50 transition-colors duration-200 flex items-center justify-center"
            >
              {/* Icon xoay 90° khi mở */}
              <motion.span
                animate={{ rotate: mobileOpen ? 90 : 0 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
                className="inline-flex"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </motion.span>
            </motion.button>
          </div>
        </div>

        {/* ── Drawer điều hướng mobile với AnimatePresence để mount/unmount mượt ── */}
        <AnimatePresence initial={false}>
          {mobileOpen && (
            <motion.div
              key="drawer"
              initial={{ opacity: 0, y: -10, scaleY: 0.95 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -6, scaleY: 0.97 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              style={{ transformOrigin: "top", overflow: "hidden" }}
              className="md:hidden"
            >
              <div className="px-3 pb-3 pt-1">
                <div className="rounded-3xl border border-orange-100/80 bg-white/90 backdrop-blur-[2px] shadow-sm overflow-hidden">
                  {/* Card thông tin người dùng ở đầu drawer (nếu đã đăng nhập) */}
                  {isAuthenticated && user && (
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: 0.06 }}
                      className="flex items-center gap-3 px-4 py-3 border-b border-orange-50 bg-orange-50/50"
                    >
                      <Avatar
                        size={38}
                        src={user.photoURL}
                        className="!bg-orange-500 !text-white font-bold shrink-0"
                      >
                        {user.username?.charAt(0).toUpperCase()}
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {user.username}
                        </p>
                        <p className="text-xs text-orange-400 capitalize font-medium">
                          {user.role}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Danh sách mục điều hướng — từng mục trượt vào với độ trễ stagger */}
                  <nav className="p-2">
                    {NAV_ITEMS.map(({ to, label, icon: Icon }, idx) => {
                      const active = isActive(to);
                      return (
                        <motion.div
                          key={to}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.18,
                            delay: 0.04 + idx * 0.04,
                          }}
                        >
                          <Link
                            to={to}
                            onClick={closeMobile}
                            aria-current={active ? "page" : undefined}
                            /* inline style đảm bảo bg + color không bị Ant Design override: nền xám, chữ cam theme */
                            style={
                              active
                                ? { backgroundColor: "#e5e7eb", color: PRIMARY_THEME_COLOR }
                                : undefined
                            }
                            className={`
                              flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-colors duration-150
                              ${active ? "" : "!text-gray-700"}
                            `}
                          >
                            <Icon
                              size={16}
                              className={
                                active ? "text-white" : "text-gray-400"
                              }
                              style={active ? { color: PRIMARY_THEME_COLOR } : undefined}
                            />
                            {label}
                          </Link>
                        </motion.div>
                      );
                    })}
                  </nav>

                  {/* Nhóm thao tác tài khoản: vùng bấm lớn, phù hợp ngón tay */}
                  <div className="p-2 pt-0 border-t border-orange-50">
                    {isAuthenticated && user ? (
                      <>
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.18,
                            delay: NAV_ITEMS.length * 0.04 + 0.04,
                          }}
                        >
                          <Link
                            to={dashboardPath}
                            onClick={closeMobile}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold !text-gray-700 hover:!text-orange-600 hover:bg-orange-50/70 transition-colors duration-150"
                          >
                            <LayoutDashboard
                              size={16}
                              className="text-gray-400"
                            />
                            Dashboard
                          </Link>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.18,
                            delay: NAV_ITEMS.length * 0.04 + 0.08,
                          }}
                        >
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold text-red-500 hover:bg-red-50/70 transition-colors duration-150"
                          >
                            <LogOut size={16} className="text-red-400" />
                            Đăng xuất
                          </button>
                        </motion.div>
                      </>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.18,
                          delay: NAV_ITEMS.length * 0.04 + 0.04,
                        }}
                      >
                        <Link
                          to="/auth"
                          onClick={closeMobile}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold !text-orange-600 hover:bg-orange-50/70 transition-colors duration-150"
                        >
                          <LogIn size={16} className="text-orange-400" />
                          Đăng nhập
                        </Link>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Header>
    </>
  );
}
