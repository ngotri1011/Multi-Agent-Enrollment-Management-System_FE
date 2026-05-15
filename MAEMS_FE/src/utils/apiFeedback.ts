import type { MessageInstance } from "antd/es/message/interface";
import type { AxiosError } from "axios";
import type { ApiWrapper } from "../types/api.wrapper";

/** Hiển thị `message` từ ApiWrapper khi request thành công */
export function showApiWrapperSuccess(
  messageApi: MessageInstance,
  wrapper: Pick<ApiWrapper<unknown>, "message">,
) {
  const text = wrapper.message?.trim();
  if (text) {
    messageApi.success(text);
  }
}

/** Hiển thị `message` và từng phần tử `errors` từ ApiWrapper khi thất bại */
export function showApiWrapperFailure(
  messageApi: MessageInstance,
  wrapper: Partial<ApiWrapper<unknown>> | undefined,
  fallback?: string,
) {
  const main = wrapper?.message?.trim();
  const errors = (wrapper?.errors ?? [])
    .map((e) => e?.trim())
    .filter(Boolean) as string[];

  if (main) {
    messageApi.error(main);
  }
  errors.forEach((err) => messageApi.error(err));

  if (!main && errors.length === 0 && fallback) {
    messageApi.error(fallback);
  }
}

/** Bắt lỗi Axios (404, 500, …) và đọc body ApiWrapper nếu có */
export function showAxiosApiFailure(
  messageApi: MessageInstance,
  error: unknown,
  fallback = "Đã xảy ra lỗi. Vui lòng thử lại.",
) {
  const axiosErr = error as AxiosError<ApiWrapper<unknown>>;
  showApiWrapperFailure(messageApi, axiosErr.response?.data, fallback);
}
