import {
  Alert,
  Button,
  Card,
  // Col,
  Empty,
  Progress,
  Radio,
  // Row,
  Space,
  Spin,
  Tag,
  Typography,
  Upload,
  message,
} from "antd";
import type { UploadFile, UploadProps } from "antd";
import {
  Brain,
  CheckCircle2,
  FileImage,
  ImageUp,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import type { AxiosError } from "axios";
import { analyzeMajorAdvisor } from "../../api/major-advisor";
import { GuestLayout } from "../../layouts/GuestLayout";
import type {
  MajorAdvisorAnalyzeResponse,
  MajorAdvisorBadRequest,
} from "../../types/major-advisor";
import {
  // MAJOR_ADVISOR_TRANSCRIPT_FIELD_LABELS,
  MAJOR_ADVISOR_DOCUMENT_OPTIONS,
  type MajorAdvisorDocumentOptionValue,
  getDetectedDocumentTypeLabel,
  validateMajorAdvisorImage,
} from "../../utils/majorAdvisor";

const { Title, Paragraph, Text } = Typography;
const { Dragger } = Upload;

// Chuẩn hóa hiển thị điểm số để người dùng luôn thấy định dạng nhất quán, kể cả khi dữ liệu null.
// function formatScoreValue(value: number | null | undefined): string {
//   if (typeof value !== "number") {
//     return "Chưa có";
//   }
//   return Number.isInteger(value) ? `${value}` : value.toFixed(2);
// }

export function MajorAdvisorPage() {
  const [documentType, setDocumentType] =
    useState<MajorAdvisorDocumentOptionValue>("transcript");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [result, setResult] = useState<MajorAdvisorAnalyzeResponse | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedFile = fileList[0]?.originFileObj ?? null;

  const selectedDocumentDetail = useMemo(
    () =>
      MAJOR_ADVISOR_DOCUMENT_OPTIONS.find(
        (item) => item.value === documentType,
      ),
    [documentType],
  );

  const uploadProps: UploadProps = {
    multiple: false,
    maxCount: 1,
    accept: "image/jpeg,image/jpg,image/png,image/webp",
    fileList,
    beforeUpload: (file) => {
      // Chặn sớm các tệp không phải ảnh hợp lệ để người dùng biết lỗi ngay ở bước chọn tệp.
      const validationError = validateMajorAdvisorImage(file);
      if (validationError) {
        message.error(validationError);
        return Upload.LIST_IGNORE;
      }
      return false;
    },
    onChange: ({ fileList: nextFileList }) => {
      setErrorMessage(null);
      setResult(null);
      setFileList(nextFileList.slice(-1));
    },
    onRemove: () => {
      setErrorMessage(null);
      setResult(null);
    },
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setErrorMessage("Vui lòng chọn 1 ảnh minh chứng trước khi gửi tư vấn.");
      return;
    }

    const validationError = validateMajorAdvisorImage(selectedFile);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setResult(null);

    try {
      const formData = new FormData();
      // FE gửi đúng 1 ảnh theo yêu cầu, đồng thời gửi thêm loại minh chứng để backend dễ log/đối chiếu.
      formData.append("file", selectedFile);
      formData.append("documentTypeHint", documentType);

      const response = await analyzeMajorAdvisor(formData);
      setResult(response);
      message.success("AI đã phân tích ảnh và trả gợi ý chuyên ngành.");
    } catch (error) {
      const axiosError = error as AxiosError<MajorAdvisorBadRequest>;
      const backendDetail =
        axiosError.response?.data?.detail ??
        axiosError.response?.data?.title ??
        "Không thể phân tích tài liệu. Vui lòng thử lại bằng ảnh rõ nét hơn.";
      setErrorMessage(backendDetail);
      message.error("Yêu cầu tư vấn thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GuestLayout>
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50 via-white to-orange-50/50 px-4 pb-14 pt-24 sm:px-5 md:px-6">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-[260px] w-[260px] -translate-x-1/2 rounded-full bg-orange-300/20 blur-3xl" />

        <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-5">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="liquid-glass rounded-[28px] border border-orange-100/80 px-5 py-6 sm:px-7 sm:py-7"
          >
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-100/80 px-3 py-1.5">
              <Sparkles size={15} className="text-orange-500" />
              <Text className="!text-xs !font-semibold !text-orange-700">
                Tư vấn chuyên ngành bằng AI
              </Text>
            </div>
            <Title
              level={2}
              className="!mb-2 !text-2xl !font-extrabold !text-gray-900 sm:!text-3xl"
            >
              Upload 1 ảnh minh chứng để nhận gợi ý ngành học
            </Title>
            <Paragraph className="!mb-0 !text-sm !leading-6 !text-gray-600 sm:!text-base">
              Bạn chỉ cần gửi <strong>1 ảnh duy nhất</strong> thuộc{" "}
              <strong>1 trong 3 loại</strong>: bảng điểm học bạ, kết quả ĐGNL
              hoặc school rank. Hệ thống AI sẽ đọc nội dung trong ảnh và hiển
              thị gợi ý chuyên ngành phù hợp ngay trên trang này.
            </Paragraph>
          </motion.div>

          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
            >
              <Card className="liquid-glass !rounded-[28px] !border-orange-100/80 !shadow-sm">
                {/* Giữ lựa chọn loại minh chứng tường minh để người dùng không nhầm loại tệp cần nộp. */}
                <Space direction="vertical" size={16} className="!w-full">
                  <div>
                    <Text className="!mb-2 !block !font-semibold !text-gray-800">
                      Loại minh chứng
                    </Text>
                    <Radio.Group
                      className="!grid !gap-2"
                      value={documentType}
                      onChange={(event) => setDocumentType(event.target.value)}
                    >
                      {MAJOR_ADVISOR_DOCUMENT_OPTIONS.map((item) => (
                        <Radio
                          key={item.value}
                          value={item.value}
                          className="!m-0"
                        >
                          <span className="font-medium text-gray-700">
                            {item.label}
                          </span>
                        </Radio>
                      ))}
                    </Radio.Group>
                    <Text className="!mt-2 !block !text-xs !text-gray-500">
                      {selectedDocumentDetail?.description}
                    </Text>
                  </div>

                  <Dragger
                    {...uploadProps}
                    className="!rounded-2xl !border-orange-200 !bg-orange-50/50"
                  >
                    <div className="py-3">
                      <UploadCloud
                        className="mx-auto mb-3 text-orange-500"
                        size={30}
                      />
                      <p className="text-base font-semibold text-gray-800">
                        Kéo thả hoặc bấm để chọn ảnh
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Chỉ nhận JPG/PNG/WEBP, tối đa 8MB, 1 ảnh duy nhất.
                      </p>
                    </div>
                  </Dragger>

                  <Button
                    type="primary"
                    size="large"
                    icon={<Brain size={17} />}
                    loading={submitting}
                    onClick={handleAnalyze}
                    className="liquid-glass-strong !h-11 !rounded-full !border-orange-500 !bg-orange-500 !px-6 !font-semibold hover:!bg-orange-600"
                    disabled={!selectedFile || submitting}
                  >
                    Phân tích và gợi ý chuyên ngành
                  </Button>
                </Space>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card className="liquid-glass !h-full !rounded-[28px] !border-orange-100/80 !shadow-sm">
                <Space direction="vertical" size={14} className="!w-full">
                  <Text className="!text-base !font-semibold !text-gray-800">
                    Thông tin đã chọn
                  </Text>
                  <div className="rounded-2xl bg-orange-50/70 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <FileImage size={16} className="text-orange-500" />
                      <Text className="!font-medium !text-gray-700">
                        Loại tài liệu
                      </Text>
                    </div>
                    <Tag
                      color="orange"
                      className="!rounded-full !px-3 !py-1 !text-sm"
                    >
                      {selectedDocumentDetail?.label}
                    </Tag>
                    <Text className="!mt-3 !block !text-xs !leading-5 !text-gray-500">
                      Không hỗ trợ PDF hoặc tài liệu khác. Vui lòng chụp rõ nội
                      dung chính trên ảnh để AI đọc tốt hơn.
                    </Text>
                  </div>

                  {selectedFile ? (
                    <div className="rounded-2xl border border-orange-100 bg-white/70 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <ImageUp size={16} className="text-orange-500" />
                        <Text className="!font-medium !text-gray-700">
                          Ảnh đã chọn
                        </Text>
                      </div>
                      <Text className="!block !break-all !text-sm !text-gray-600">
                        {selectedFile.name}
                      </Text>
                    </div>
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Chưa có ảnh nào được chọn"
                      className="!my-2"
                    />
                  )}
                </Space>
              </Card>
            </motion.div>
          </div>

          <AnimatePresence mode="wait">
            {submitting && (
              <motion.div
                key="loading-state"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Card className="liquid-glass !rounded-[24px] !border-orange-100/80">
                  <Space align="center" size={12}>
                    <Spin />
                    <Text className="!text-gray-700">
                      AI đang đọc ảnh và suy luận chuyên ngành phù hợp...
                    </Text>
                  </Space>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {errorMessage && (
            <Alert
              showIcon
              type="error"
              message="Không thể xử lý yêu cầu tư vấn"
              description={errorMessage}
              className="!rounded-2xl"
            />
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="liquid-glass !rounded-[28px] !border-orange-100/80 !shadow-sm">
                <Space direction="vertical" size={14} className="!w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <Tag
                      color="processing"
                      className="!rounded-full !px-3 !py-1"
                    >
                      Trạng thái: {result.status}
                    </Tag>
                    <Tag color="gold" className="!rounded-full !px-3 !py-1">
                      Loại nhận diện:{" "}
                      {getDetectedDocumentTypeLabel(
                        result.detectedDocumentType ?? "unknown",
                      )}
                    </Tag>
                  </div>

                  <div className="rounded-2xl border border-orange-100 bg-white/75 p-4">
                    <Text className="!mb-2 !block !font-semibold !text-gray-800">
                      Tổng quan kết quả
                    </Text>
                    <Paragraph className="!mb-0 !whitespace-pre-line !text-sm !leading-6 !text-gray-700">
                      {result.summary}
                    </Paragraph>
                  </div>

                  {/* Hiển thị điểm học bạ theo dạng lưới để người dùng đối chiếu nhanh từng môn. */}
                  {/* {result.scores.transcript && (
                    <div className="rounded-2xl border border-orange-100 bg-white/75 p-4">
                      <Text className="!mb-3 !block !font-semibold !text-gray-800">
                        Điểm học bạ nhận diện được
                      </Text>
                      <Row gutter={[10, 10]}>
                        {Object.entries(result.scores.transcript).map(
                          ([key, value]) => (
                            <Col xs={24} sm={12} md={8} key={key}>
                              <div className="rounded-xl border border-orange-100 bg-orange-50/60 px-3 py-2">
                                <Text className="!block !text-xs !text-gray-500">
                                  {MAJOR_ADVISOR_TRANSCRIPT_FIELD_LABELS[key] ?? key}
                                </Text>
                                <Text className="!text-sm !font-semibold !text-gray-700">
                                  {formatScoreValue(value)}
                                </Text>
                              </div>
                            </Col>
                          ),
                        )}
                      </Row>
                    </div>
                  )} */}

                  {/* {result.scores.competency && (
                    <div className="rounded-2xl border border-orange-100 bg-white/75 p-4">
                      <Text className="!mb-3 !block !font-semibold !text-gray-800">
                        Điểm ĐGNL nhận diện được
                      </Text>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="rounded-xl bg-orange-50/60 px-3 py-2">
                          <Text className="!block !text-xs !text-gray-500">
                            Tổng điểm
                          </Text>
                          <Text className="!text-sm !font-semibold !text-gray-700">
                            {formatScoreValue(result.scores.competency.totalScore)}
                          </Text>
                        </div>
                        <div className="rounded-xl bg-orange-50/60 px-3 py-2">
                          <Text className="!block !text-xs !text-gray-500">
                            Percentile
                          </Text>
                          <Text className="!text-sm !font-semibold !text-gray-700">
                            {result.scores.competency.percentileRange}
                          </Text>
                        </div>
                      </div>
                    </div>
                  )} */}

                  {/* {result.scores.schoolRank && (
                    <div className="rounded-2xl border border-orange-100 bg-white/75 p-4">
                      <Text className="!mb-3 !block !font-semibold !text-gray-800">
                        School Rank nhận diện được
                      </Text>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="rounded-xl bg-orange-50/60 px-3 py-2">
                          <Text className="!block !text-xs !text-gray-500">
                            Học sinh
                          </Text>
                          <Text className="!text-sm !font-semibold !text-gray-700">
                            {result.scores.schoolRank.studentName}
                          </Text>
                        </div>
                        <div className="rounded-xl bg-orange-50/60 px-3 py-2">
                          <Text className="!block !text-xs !text-gray-500">
                            Trường
                          </Text>
                          <Text className="!text-sm !font-semibold !text-gray-700">
                            {result.scores.schoolRank.schoolName}
                          </Text>
                        </div>
                        <div className="rounded-xl bg-orange-50/60 px-3 py-2">
                          <Text className="!block !text-xs !text-gray-500">
                            Xếp hạng
                          </Text>
                          <Text className="!text-sm !font-semibold !text-gray-700">
                            Top {result.scores.schoolRank.rank}
                          </Text>
                        </div>
                        <div className="rounded-xl bg-orange-50/60 px-3 py-2">
                          <Text className="!block !text-xs !text-gray-500">
                            Điểm lớp 12
                          </Text>
                          <Text className="!text-sm !font-semibold !text-gray-700">
                            {formatScoreValue(result.scores.schoolRank.grade12Score)}
                          </Text>
                        </div>
                      </div>
                    </div>
                  )} */}

                  <div className="rounded-2xl border border-orange-100 bg-white/75 p-4">
                    <Text className="!mb-3 !block !font-semibold !text-gray-800">
                      Danh sách ngành được gợi ý
                    </Text>
                    <Space direction="vertical" size={12} className="!w-full">
                      {/* Chuẩn hóa recommendations về mảng rỗng để tránh crash khi backend trả null. */}
                      {(result.recommendations ?? []).length === 0 ? (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description="Chưa có ngành phù hợp trong kết quả trả về"
                        />
                      ) : (
                        (result.recommendations ?? []).map((item, index) => (
                          <div
                            key={`${item.programId ?? "unknown-id"}-${item.programName ?? `program-${index}`}`}
                            className="rounded-2xl border border-orange-100 bg-orange-50/50 p-4"
                          >
                            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                              <Text className="!text-base !font-bold !text-gray-800">
                                {index + 1}.{" "}
                                {item.programName ?? "Chưa có tên ngành"}
                              </Text>
                              {typeof item.matchScore === "number" && (
                                <div className="min-w-[120px]">
                                  <Progress
                                    percent={Math.round(item.matchScore)}
                                    size="small"
                                    strokeColor="#f97316"
                                    showInfo
                                  />
                                </div>
                              )}
                            </div>

                            <Paragraph className="!mb-3 !text-sm !leading-6 !text-gray-700">
                              {item.reasoning ??
                                "Chưa có nội dung giải thích chi tiết."}
                            </Paragraph>

                            <div className="grid gap-3 md:grid-cols-2">
                              <div className="rounded-xl bg-white/80 p-3">
                                <Text className="!mb-2 !block !font-semibold !text-gray-800">
                                  Điểm mạnh phù hợp
                                </Text>
                                <ul className="space-y-2">
                                  {(item.strengths ?? []).map(
                                    (strength, strengthIndex) => (
                                      <li
                                        key={`${strength ?? "strength"}-${strengthIndex}`}
                                        className="flex items-start gap-2 text-sm text-gray-700"
                                      >
                                        <CheckCircle2
                                          size={14}
                                          className="mt-0.5 shrink-0 text-green-500"
                                        />
                                        <span>
                                          {strength ??
                                            "Chưa có mô tả điểm mạnh."}
                                        </span>
                                      </li>
                                    ),
                                  )}
                                </ul>
                              </div>
                              <div className="rounded-xl bg-white/80 p-3">
                                <Text className="!mb-2 !block !font-semibold !text-gray-800">
                                  Lưu ý phát triển thêm
                                </Text>
                                <ul className="space-y-2">
                                  {(item.concerns ?? []).map(
                                    (concern, concernIndex) => (
                                      <li
                                        key={`${concern ?? "concern"}-${concernIndex}`}
                                        className="flex items-start gap-2 text-sm text-gray-700"
                                      >
                                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                                        <span>
                                          {concern ?? "Chưa có lưu ý chi tiết."}
                                        </span>
                                      </li>
                                    ),
                                  )}
                                </ul>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </Space>
                  </div>

                  {/* <div className="rounded-2xl border border-orange-100 bg-white/75 p-4">
                    <Text className="!mb-2 !block !font-semibold !text-gray-800">
                      Mã trạng thái hệ thống
                    </Text>
                    <Paragraph className="!mb-0 !text-sm !leading-6 !text-gray-700">
                      {result.result}
                    </Paragraph>
                  </div> */}
                </Space>
              </Card>
            </motion.div>
          )}
        </div>
      </section>
    </GuestLayout>
  );
}
