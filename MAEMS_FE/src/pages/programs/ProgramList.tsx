import { useEffect, useState, useCallback } from "react";
import {
  Col,
  Row,
  Select,
  Input,
  Typography,
  Tag,
  Skeleton,
  Empty,
  Badge,
  Pagination,
} from "antd";
import {
  ArrowRight,
  ArrowUpDown,
  BookOpen,
  BriefcaseBusiness,
  Clock,
  GraduationCap,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { GuestLayout } from "../../layouts/GuestLayout";
import { getActiveProgramsBasic, getFilteredProgramsBasic } from "../../api/programs";
import { getActiveMajorsBasic } from "../../api/majors";
import type { Program, ProgramBasic } from "../../types/program";
import type { MajorBasic } from "../../types/major";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const majorColors: Record<number, string> = {};
const palette = [
  "bg-blue-50 text-blue-700 border-blue-200",
  "bg-purple-50 text-purple-700 border-purple-200",
  "bg-teal-50 text-teal-700 border-teal-200",
  "bg-rose-50 text-rose-700 border-rose-200",
  "bg-amber-50 text-amber-700 border-amber-200",
  "bg-indigo-50 text-indigo-700 border-indigo-200",
  "bg-green-50 text-green-700 border-green-200",
];

function getMajorColor(majorId: number): string {
  if (!majorColors[majorId]) {
    const idx = Object.keys(majorColors).length % palette.length;
    majorColors[majorId] = palette[idx];
  }
  return majorColors[majorId];
}

type ProgramListItem = ProgramBasic & Partial<Program>;

function ProgramCard({ program }: { program: ProgramListItem }) {
  return (
    <Link to={`/dao-tao/${program.programId}`} className="h-full block group">
      <div className="h-full flex flex-col bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-orange-400 to-orange-500 group-hover:from-orange-500 group-hover:to-orange-600 transition-colors" />
        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
              <GraduationCap size={22} className="text-orange-500" />
            </div>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getMajorColor(0)}`}
            >
              {program.majorName}
            </span>
          </div>

          <Title level={5} className="!text-gray-800 !mb-2 !font-bold !leading-snug group-hover:!text-orange-600 transition-colors">
            {program.programName}
          </Title>

          <Paragraph
            className="!text-gray-500 text-sm !mb-4 flex-1"
            ellipsis={{ rows: 3 }}
          >
            {program.description || "Chương trình đào tạo chất lượng cao tại Đại học FPT."}
          </Paragraph>

          <div className="space-y-2 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock size={14} className="text-orange-400 flex-shrink-0" />
              <span>Thời gian: <span className="font-medium text-gray-700">{program.duration || "4 năm"}</span></span>
            </div>
            {program.careerProspects && (
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <BriefcaseBusiness size={14} className="text-orange-400 flex-shrink-0 mt-0.5" />
                <Text className="!text-gray-600 text-sm" ellipsis={{ tooltip: program.careerProspects }}>
                  {program.careerProspects}
                </Text>
              </div>
            )}
            <div className="flex items-center justify-end pt-2">
              <span className="flex items-center gap-1 text-xs font-semibold text-orange-500 group-hover:gap-2 transition-all">
                Xem chi tiết <ArrowRight size={13} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="h-full bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
      <Skeleton active paragraph={{ rows: 4 }} />
    </div>
  );
}

export function ProgramList() {
  const [programs, setPrograms] = useState<ProgramListItem[]>([]);
  const [majors, setMajors] = useState<MajorBasic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMajorId, setSelectedMajorId] = useState<number | undefined>(undefined);
  const [searchName, setSearchName] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [sortKey, setSortKey] = useState<string>("");

  useEffect(() => {
    getActiveMajorsBasic()
      .then(setMajors)
      .catch(() => setMajors([]));
  }, []);

  const fetchPrograms = useCallback(async () => {
    setLoading(true);
    try {
      const sortBy = sortKey ? sortKey.split("_")[0] : undefined;
      const sortDesc = sortKey ? sortKey.endsWith("_desc") : undefined;
      const isFiltering = selectedMajorId !== undefined || !!searchName || !!sortKey;
      if (isFiltering) {
        const paged = await getFilteredProgramsBasic(
          selectedMajorId,
          searchName || undefined,
          sortBy,
          sortDesc,
          pageNumber,
          pageSize,
        );
        setPrograms(Array.isArray(paged.items) ? paged.items : []);
        setTotalCount(paged.totalCount ?? 0);
      } else {
        const data = await getActiveProgramsBasic();
        const all = Array.isArray(data) ? data : [];
        setTotalCount(all.length);
        const start = (pageNumber - 1) * pageSize;
        setPrograms(all.slice(start, start + pageSize));
      }
    } catch {
      setPrograms([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [selectedMajorId, searchName, sortKey, pageNumber, pageSize]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const handleSearch = () => {
    setPageNumber(1);
    setSearchName(searchInput);
  };

  const handleMajorChange = (val: number | undefined) => {
    setPageNumber(1);
    setSelectedMajorId(val);
  };

  const handleSortChange = (val: string) => {
    setPageNumber(1);
    setSortKey(val ?? "");
  };

  const handleClearAll = () => {
    setSelectedMajorId(undefined);
    setSearchName("");
    setSearchInput("");
    setSortKey("");
    setPageNumber(1);
  };

  return (
    <GuestLayout>

      {/* Hero */}
      <section className="relative py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/90 via-orange-700/75 to-gray-900/90" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.10) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
            <Sparkles size={14} className="text-orange-300" />
            <Text className="!text-orange-200 text-sm font-medium">
              Trường Đại học FPT — Đào tạo chất lượng quốc tế
            </Text>
          </div>
          <Title
            level={1}
            className="!text-white !text-4xl md:!text-5xl !font-extrabold !leading-tight !mb-4"
          >
            Chương trình <span className="text-orange-400">Đào tạo</span>
          </Title>
          <Paragraph className="!text-gray-200 text-lg max-w-2xl mx-auto !mb-0">
            Khám phá các ngành học tiên tiến, gắn kết doanh nghiệp và định hướng
            nghề nghiệp rõ ràng tại Đại học FPT.
          </Paragraph>
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-orange-500 py-4 px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-8">
          {[
            { label: "Ngành đào tạo", value: totalCount > 0 ? `${totalCount}+` : "—" },
            { label: "Khoa chuyên ngành", value: majors.length > 0 ? `${majors.length}` : "—" },
            { label: "Năm kinh nghiệm", value: "20+" },
            { label: "Sinh viên tốt nghiệp", value: "50,000+" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-white font-extrabold text-2xl">{s.value}</div>
              <div className="text-orange-100 text-xs mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter & Search */}
      <section className="py-6 sm:py-8 px-6 bg-gray-50/95 backdrop-blur-sm border-b border-gray-100 sticky top-[84px] z-30">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
            <div className="flex items-center gap-2 text-gray-500 text-sm flex-shrink-0">
              <SlidersHorizontal size={16} className="text-orange-500" />
              <span className="font-medium">Lọc & Tìm kiếm</span>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[240px_220px_minmax(0,1fr)] gap-3">
              <Select
                allowClear
                placeholder="Tất cả khoa / ngành"
                className="w-full"
                size="large"
                value={selectedMajorId}
                onChange={handleMajorChange}
                suffixIcon={<BookOpen size={14} className="text-gray-400" />}
              >
                {majors.map((m) => (
                  <Option key={m.majorId} value={m.majorId}>
                    {m.majorName}
                  </Option>
                ))}
              </Select>

              <Select
                allowClear
                placeholder="Sắp xếp theo..."
                className="w-full"
                size="large"
                value={sortKey || undefined}
                onChange={handleSortChange}
                suffixIcon={<ArrowUpDown size={14} className="text-gray-400" />}
              >
                <Option value="programName_asc">Tên A → Z</Option>
                <Option value="programName_desc">Tên Z → A</Option>
                <Option value="majorName_asc">Khoa A → Z</Option>
                <Option value="majorName_desc">Khoa Z → A</Option>
              </Select>

              <Input.Search
                placeholder="Tìm kiếm chương trình đào tạo..."
                size="large"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onSearch={handleSearch}
                onPressEnter={handleSearch}
                enterButton={
                  <button className="flex items-center gap-1.5">
                    <Search size={15} />
                    <span>Tìm</span>
                  </button>
                }
                className="flex-1"
                allowClear
                onClear={() => { setSearchInput(""); setSearchName(""); setPageNumber(1); }}
              />
            </div>

            {(selectedMajorId !== undefined || searchName || sortKey) && (
              <div className="flex items-center gap-2 flex-shrink-0 justify-start lg:justify-end">
                <Badge count={[selectedMajorId, searchName, sortKey].filter(Boolean).length} color="orange">
                  <Tag
                    closable
                    color="orange"
                    onClose={handleClearAll}
                    className="cursor-pointer"
                  >
                    {totalCount} kết quả
                  </Tag>
                </Badge>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Program Grid */}
      <section className="py-14 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          {!loading && programs.length === 0 ? (
            <div className="py-24">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span className="text-gray-500">
                    Không tìm thấy chương trình đào tạo phù hợp.
                    {(selectedMajorId || searchName || sortKey) && (
                      <> Thử{" "}
                        <button
                          className="text-orange-500 underline cursor-pointer"
                          onClick={handleClearAll}
                        >
                          xóa bộ lọc
                        </button>.
                      </>
                    )}
                  </span>
                }
              />
            </div>
          ) : (
            <>
              <Row gutter={[24, 24]}>
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <Col xs={24} sm={12} lg={8} key={i}>
                        <SkeletonCard />
                      </Col>
                    ))
                  : programs.map((p) => (
                      <Col xs={24} sm={12} lg={8} key={p.programId}>
                        <ProgramCard program={p} />
                      </Col>
                    ))}
              </Row>

              {totalCount > pageSize && (
                <div className="flex justify-center mt-10">
                  <Pagination
                    current={pageNumber}
                    pageSize={pageSize}
                    total={totalCount}
                    showSizeChanger
                    pageSizeOptions={[10, 20, 50]}
                    onChange={(page, size) => {
                      setPageNumber(page);
                      setPageSize(size);
                    }}
                    showTotal={(total) => `Tổng ${total} chương trình`}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="max-w-3xl mx-auto text-center">
          <Title level={2} className="!text-white !font-extrabold !mb-3">
            Sẵn sàng bắt đầu hành trình?
          </Title>
          <Paragraph className="!text-orange-100 text-base !mb-6">
            Đăng ký ngay để được hệ thống AI hỗ trợ toàn bộ quy trình tuyển sinh
            tại Đại học FPT.
          </Paragraph>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/auth">
              <button className="bg-white text-orange-500 font-semibold px-8 py-3 rounded-full hover:bg-orange-50 transition-colors text-base shadow-md">
                Đăng ký tuyển sinh
              </button>
            </Link>
            <Link to="/tuyen-sinh">
              <button className="bg-white/15 border border-white/30 text-white font-semibold px-8 py-3 rounded-full hover:bg-white/25 transition-colors text-base backdrop-blur-sm">
                Xem thông tin tuyển sinh
              </button>
            </Link>
          </div>
        </div>
      </section>

    </GuestLayout>
  );
}
