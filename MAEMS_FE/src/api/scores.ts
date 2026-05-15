import { apiClient } from "../services/axios";
import type { Score } from "../types/score";
import type { ApiWrapper } from "../types/api.wrapper";

/** Lấy điểm học bạ / THPT / ĐGNL của thí sinh (kèm wrapper để hiển thị message/errors) */
export async function getApplicantScores(
  applicantId: number,
): Promise<ApiWrapper<Score[]>> {
  const res = await apiClient.get<ApiWrapper<Score[]>>(
    `/api/Scores/applicant/${applicantId}`,
  );
  return res.data;
}