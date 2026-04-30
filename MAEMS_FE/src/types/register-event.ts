// Kiểu dữ liệu cho đăng ký tham dự sự kiện

/** Body gửi lên khi đăng ký sự kiện */
export type RegisterEventBody = {
  articleId: number;
  fullName: string;
  email: string;
  phone: string;
};

/** Dữ liệu trả về của một bản đăng ký sự kiện */
export type RegisterEventData = {
  registerId: number;
  articleId: number;
  fullName: string;
  email: string;
  phone: string;
  createdAt: string;
};
