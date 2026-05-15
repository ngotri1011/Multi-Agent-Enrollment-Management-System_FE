// Kiểu dữ liệu điểm học bạ / THPT / ĐGNL theo API Scores

type Nullable<T> = T | null;

/** Bản ghi điểm của thí sinh (HK2, THPT, ĐGNL); mọi trường có thể null khi chưa nhập */
export type Score = {
  scoreId: Nullable<number>;
  applicantId: Nullable<number>;
  hk2Math: Nullable<number>;
  hk2Literature: Nullable<number>;
  hk2ForeignLanguage: Nullable<number>;
  hk2History: Nullable<number>;
  hk2Geography: Nullable<number>;
  hk2Physics: Nullable<number>;
  hk2Chemistry: Nullable<number>;
  hk2Biology: Nullable<number>;
  hk2EconomicsLaw: Nullable<number>;
  hk2Informatics: Nullable<number>;
  hk2Technology: Nullable<number>;
  thptMath: Nullable<number>;
  thptLiterature: Nullable<number>;
  thptForeignLanguage: Nullable<number>;
  thptHistory: Nullable<number>;
  thptGeography: Nullable<number>;
  thptPhysics: Nullable<number>;
  thptChemistry: Nullable<number>;
  thptBiology: Nullable<number>;
  thptEconomicsLaw: Nullable<number>;
  thptInformatics: Nullable<number>;
  thptTechnology: Nullable<number>;
  dgnl: Nullable<number>;
};
