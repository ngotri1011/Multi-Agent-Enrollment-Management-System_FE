import { Button, Empty, Spin, Typography } from "antd";
import { GraduationCap, RefreshCw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { Score } from "../../../types/score";
import {
  SCORE_SECTIONS,
  formatScoreValue,
  isScoreRecordEmpty,
} from "../../../utils/scoreDisplay";

const { Text, Title } = Typography;

type ApplicantScoresTabProps = {
  score: Score | null;
  loading: boolean;
  onRefresh: () => void;
};

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/** Tab hiển thị điểm HK2 / THPT / ĐGNL của thí sinh cho cán bộ xét tuyển */
export function ApplicantScoresTab({
  score,
  loading,
  onRefresh,
}: ApplicantScoresTabProps) {
  const empty = isScoreRecordEmpty(score);

  return (
    <div className="pt-1">
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05, duration: 0.3 }}
          className="flex items-center gap-3 min-w-0"
        >
          <motion.div
            whileHover={{ scale: 1.04 }}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-sky-50 text-indigo-600 shadow-sm"
          >
            <GraduationCap size={22} aria-hidden />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Title level={5} className="!mb-0 !text-gray-800">
              Bảng điểm thí sinh
            </Title>
            <Text className="text-xs text-gray-500">
              Học kỳ 2 · THPT Quốc gia · ĐGNL
            </Text>
          </motion.div>
        </motion.div>
        <Button
          icon={<RefreshCw size={14} />}
          onClick={onRefresh}
          loading={loading}
          className="!rounded-xl shrink-0 self-start sm:self-auto"
        >
          Tải lại điểm
        </Button>
      </motion.div>

      <Spin spinning={loading}>
        <AnimatePresence mode="wait">
          {empty ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.28 }}
              className="rounded-2xl border border-dashed border-gray-200 bg-white/60 px-4 py-10 backdrop-blur-[2px]"
            >
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span className="text-gray-500 text-sm">
                    Thí sinh chưa có điểm được khai báo trên hệ thống.
                  </span>
                }
              />
            </motion.div>
          ) : (
            <motion.div
              key="scores"
              variants={listVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0 }}
              className="flex flex-col gap-5"
            >
              {SCORE_SECTIONS.map((section) => (
                <motion.section
                  key={section.id}
                  variants={itemVariants}
                  className={`rounded-2xl border bg-gradient-to-br p-4 sm:p-5 shadow-sm backdrop-blur-[2px] ${section.accentClass}`}
                >
                  <motion.div variants={itemVariants} className="mb-4">
                    <Text className="block font-semibold text-gray-800 text-sm sm:text-base">
                      {section.title}
                    </Text>
                    <Text className="text-xs text-gray-500">{section.description}</Text>
                  </motion.div>
                  <motion.div
                    variants={listVariants}
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3"
                  >
                    {section.fields.map((field) => {
                      const raw = score?.[field.key];
                      const hasValue = raw != null;
                      return (
                        <motion.div
                          key={field.key}
                          variants={itemVariants}
                          whileHover={{ y: -2 }}
                          transition={{ type: "spring", stiffness: 380, damping: 28 }}
                          className={`rounded-xl border px-3 py-2.5 transition-shadow ${
                            hasValue
                              ? "border-white/80 bg-white/90 shadow-sm"
                              : "border-white/50 bg-white/50"
                          }`}
                        >
                          <Text className="block text-[11px] sm:text-xs text-gray-500 leading-tight mb-1">
                            {field.label}
                          </Text>
                          <Text
                            className={`block font-semibold tabular-nums text-base sm:text-lg ${
                              hasValue ? "text-indigo-700" : "text-gray-300"
                            }`}
                          >
                            {formatScoreValue(raw)}
                          </Text>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </motion.section>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </Spin>
    </div>
  );
}
