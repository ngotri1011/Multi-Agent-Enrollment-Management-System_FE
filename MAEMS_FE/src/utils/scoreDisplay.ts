import type { Score } from "../types/score";

/** Các trường điểm môn (bỏ id) dùng để kiểm tra bản ghi rỗng */
const SCORE_VALUE_KEYS = [
  "hk2Math",
  "hk2Literature",
  "hk2ForeignLanguage",
  "hk2History",
  "hk2Geography",
  "hk2Physics",
  "hk2Chemistry",
  "hk2Biology",
  "hk2EconomicsLaw",
  "hk2Informatics",
  "hk2Technology",
  "thptMath",
  "thptLiterature",
  "thptForeignLanguage",
  "thptHistory",
  "thptGeography",
  "thptPhysics",
  "thptChemistry",
  "thptBiology",
  "thptEconomicsLaw",
  "thptInformatics",
  "thptTechnology",
  "dgnl",
] as const satisfies readonly (keyof Score)[];

export type ScoreFieldKey = (typeof SCORE_VALUE_KEYS)[number];

export type ScoreFieldConfig = {
  key: ScoreFieldKey;
  label: string;
};

export type ScoreSectionConfig = {
  id: string;
  title: string;
  description: string;
  accentClass: string;
  fields: ScoreFieldConfig[];
};

/** Nhóm hiển thị theo học kỳ 2, THPT và ĐGNL */
export const SCORE_SECTIONS: ScoreSectionConfig[] = [
  {
    id: "hk2",
    title: "Học kỳ 2 (lớp 12)",
    description: "Điểm trung bình các môn học kỳ 2",
    accentClass: "from-sky-500/10 to-indigo-50/80 border-sky-100",
    fields: [
      { key: "hk2Math", label: "Toán" },
      { key: "hk2Literature", label: "Ngữ văn" },
      { key: "hk2ForeignLanguage", label: "Ngoại ngữ" },
      { key: "hk2History", label: "Lịch sử" },
      { key: "hk2Geography", label: "Địa lý" },
      { key: "hk2Physics", label: "Vật lý" },
      { key: "hk2Chemistry", label: "Hóa học" },
      { key: "hk2Biology", label: "Sinh học" },
      { key: "hk2EconomicsLaw", label: "GDKT & Pháp luật" },
      { key: "hk2Informatics", label: "Tin học" },
      { key: "hk2Technology", label: "Công nghệ" },
    ],
  },
  {
    id: "thpt",
    title: "Kỳ thi THPT Quốc gia",
    description: "Điểm thi tốt nghiệp THPT theo từng môn",
    accentClass: "from-violet-500/10 to-fuchsia-50/80 border-violet-100",
    fields: [
      { key: "thptMath", label: "Toán" },
      { key: "thptLiterature", label: "Ngữ văn" },
      { key: "thptForeignLanguage", label: "Ngoại ngữ" },
      { key: "thptHistory", label: "Lịch sử" },
      { key: "thptGeography", label: "Địa lý" },
      { key: "thptPhysics", label: "Vật lý" },
      { key: "thptChemistry", label: "Hóa học" },
      { key: "thptBiology", label: "Sinh học" },
      { key: "thptEconomicsLaw", label: "GDKT & Pháp luật" },
      { key: "thptInformatics", label: "Tin học" },
      { key: "thptTechnology", label: "Công nghệ" },
    ],
  },
  {
    id: "dgnl",
    title: "Đánh giá năng lực (ĐGNL)",
    description: "Điểm bài thi đánh giá năng lực (nếu có)",
    accentClass: "from-amber-500/10 to-orange-50/80 border-amber-100",
    fields: [{ key: "dgnl", label: "Tổng điểm ĐGNL" }],
  },
];

/** Chuẩn hóa hiển thị điểm; null/undefined → gạch ngang */
export function formatScoreValue(value: number | null | undefined): string {
  if (value == null || typeof value !== "number") {
    return "—";
  }
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

/** API có thể trả object toàn field null khi thí sinh chưa khai báo điểm */
export function isScoreRecordEmpty(score: Score | null | undefined): boolean {
  if (!score) return true;
  return SCORE_VALUE_KEYS.every((key) => score[key] == null);
}

/** Lấy bản ghi điểm từ response API (mảng hoặc một object) */
export function pickPrimaryScore(
  records: Score[] | Score | null | undefined,
): Score | null {
  if (records == null) return null;
  if (Array.isArray(records)) {
    if (!records.length) return null;
    return records[0] ?? null;
  }
  return records;
}
