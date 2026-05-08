// Helper nullable dùng chung để phòng trường hợp backend trả null không cố định theo từng đợt release.
type Nullable<T> = T | null;

// Kiểu dữ liệu cho từng ngành được hệ thống gợi ý sau khi phân tích hồ sơ.
export type MajorAdvisorRecommendation = {
  programId: Nullable<number>;
  programName: Nullable<string>;
  // Một số response không trả matchScore nên để optional để UI không bị vỡ kiểu dữ liệu.
  matchScore?: Nullable<number>;
  reasoning: Nullable<string>;
  strengths: Nullable<string[]>;
  concerns: Nullable<string[]>;
};

export type MajorAdvisorSubjectScore = Nullable<number>;

export type MajorAdvisorTranscriptScores = {
  grade11_Toan: MajorAdvisorSubjectScore;
  grade11_NguVan: MajorAdvisorSubjectScore;
  grade11_NgoaiNgu: MajorAdvisorSubjectScore;
  grade11_VatLy: MajorAdvisorSubjectScore;
  grade11_HoaHoc: MajorAdvisorSubjectScore;
  grade11_SinhHoc: MajorAdvisorSubjectScore;
  grade11_LichSu: MajorAdvisorSubjectScore;
  grade11_DiaLy: MajorAdvisorSubjectScore;
  grade11_GDCD: MajorAdvisorSubjectScore;
  grade11_CongNghe?: Nullable<MajorAdvisorSubjectScore>;
  grade11_TinHoc?: Nullable<MajorAdvisorSubjectScore>;
  grade12_Toan: MajorAdvisorSubjectScore;
  grade12_NguVan: MajorAdvisorSubjectScore;
  grade12_NgoaiNgu: MajorAdvisorSubjectScore;
  grade12_VatLy: MajorAdvisorSubjectScore;
  grade12_HoaHoc: MajorAdvisorSubjectScore;
  grade12_SinhHoc: MajorAdvisorSubjectScore;
  grade12_LichSu: MajorAdvisorSubjectScore;
  grade12_DiaLy: MajorAdvisorSubjectScore;
  grade12_GDCD: MajorAdvisorSubjectScore;
  grade12_CongNghe?: Nullable<MajorAdvisorSubjectScore>;
  grade12_TinHoc?: Nullable<MajorAdvisorSubjectScore>;
  averageGpa: MajorAdvisorSubjectScore;
};

// Kiểu dữ liệu kết quả phân tích hồ sơ từ dịch vụ Major Advisor.
export type MajorAdvisorAnalyzeResponse = {
  result: Nullable<string>;
  status: Nullable<string>;
  detectedDocumentType: Nullable<string>;
  scores: Nullable<{
    transcript: Nullable<MajorAdvisorTranscriptScores>;
    competency: {
      totalScore: Nullable<number>;
      tiengViet: Nullable<number>;
      tiengAnh: Nullable<number>;
      toanHoc: Nullable<number>;
      tuDuyKhoaHoc: Nullable<number>;
      percentileRange: Nullable<string>;
    } | null;
    schoolRank: {
      rank: Nullable<number>;
      grade12Score: Nullable<number>;
      studentName: Nullable<string>;
      schoolName: Nullable<string>;
      year: Nullable<number>;
    } | null;
  }>;
  recommendations: Nullable<MajorAdvisorRecommendation[]>;
  summary: Nullable<string>;
};

// Kiểu dữ liệu lỗi chuẩn backend trả về khi request không hợp lệ (HTTP 400).
export type MajorAdvisorBadRequest = {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  additionalProp1?: string;
  additionalProp2?: string;
  additionalProp3?: string;
};
