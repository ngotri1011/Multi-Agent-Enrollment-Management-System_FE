import { type FormEvent, useEffect, useMemo, useState } from "react";
import { QALayout } from "../../layouts/QALayout";
import type {
  Feedback,
  FeedbackQueryParams,
  createFeedbackRequest,
} from "../../types/feedback";
import { createFeedback, getFeedback } from "../../api/feedback";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Loader2,
  MessageSquarePlus,
  RefreshCw,
  Send,
  UserRound,
} from "lucide-react";


const PAGE_SIZE = 6;

function formatDate(value?: string) {
  if (!value) return "Just now";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}


export function Feedback() {
  const [items, setItems] = useState<Feedback[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(PAGE_SIZE);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<createFeedbackRequest>({
    title: "",
    content: "",
  });

  const loadFeedback = async (page = 1) => {
    const params: FeedbackQueryParams = {
      pageNumber: page,
      pageSize: pageSize,
    };

    try {
      setLoading(true);
      setError(null);
      const res = await getFeedback(params);
      setItems(res.items ?? []);
      setTotalCount(res.totalCount ?? 0);
      setTotalPages(res.totalPages ?? 1);
      setPageNumber(res.pageNumber ?? page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadFeedback(1);
  }, []);

  const visibleItems = useMemo(() => items, [items]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const title = form.title.trim();
    const content = form.content.trim();

    if (!title || !content) {
      setError("Please fill in both the title and the content.");
      setSuccess(null);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      await createFeedback({ title, content });

      setForm({ title: "", content: "" });
      setSuccess("Your feedback has been submitted successfully.");
      await loadFeedback(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <QALayout>
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700">
                  <MessageSquarePlus className="h-4 w-4" />
                  QA Feedback Center
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Share feedback and review submissions in one place
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
                  Use this page to submit feedback, track the latest entries, and keep quality assurance
                  communication organized.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:min-w-[320px]">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Total</div>
                  <div className="mt-2 text-2xl font-bold text-slate-900">{totalCount}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Page</div>
                  <div className="mt-2 text-2xl font-bold text-slate-900">{pageNumber}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Pages</div>
                  <div className="mt-2 text-2xl font-bold text-slate-900">{totalPages}</div>
                </div>
              </div>
            </div>
          </div> */}
          
          <div className="mb-6 rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-violet-950 p-6 text-white shadow-xl shadow-slate-900/10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
                  <MessageSquarePlus className="h-4 w-4" />
                  Feedback center
                </div>

                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                  Feedback
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-white/70 md:text-base">
                  Gửi và theo dõi phản hồi từ người dùng để cải thiện hệ thống tuyển sinh.
                  Phân tích nội dung phản hồi để nâng cao trải nghiệm và hiệu suất hệ thống.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 sm:min-w-[320px]">

                <div className="rounded-2xl border border-blue-400/20 bg-blue-400/10 px-4 py-3 backdrop-blur">
                  <div className="text-xs text-blue-100">Total</div>
                  <div className="mt-1 text-2xl font-semibold text-blue-50">
                    {totalCount}
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 backdrop-blur">
                  <div className="text-xs text-emerald-100">OnPage</div>
                  <div className="mt-1 text-2xl font-semibold text-emerald-50">
                    {pageNumber}
                  </div>
                </div>

                <div className="rounded-2xl border border-violet-400/20 bg-violet-400/10 px-4 py-3 backdrop-blur">
                  <div className="text-xs text-violet-100">Pages</div>
                  <div className="mt-1 text-2xl font-semibold text-violet-50">
                    {totalPages}
                  </div>
                </div>

              </div>
            </div>
          </div>


          <div className="grid gap-6 xl:grid-cols-[1.05fr_1.4fr]">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                  <Send className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Submit feedback</h2>
                  <p className="text-sm text-slate-500">Write a clear title and explain your issue or suggestion.</p>
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Example: Improve dashboard loading speed"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                    maxLength={150}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Content</label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                    placeholder="Describe the feedback in detail..."
                    rows={7}
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                    maxLength={2000}
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{success}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {submitting ? "Submitting..." : "Submit feedback"}
                </button>
              </form>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Recent feedback</h2>
                  <p className="text-sm text-slate-500">Browse the latest submitted feedback from users and QA members.</p>
                </div>

                <button
                  type="button"
                  onClick={() => void loadFeedback(pageNumber)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="flex min-h-[360px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/60">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading feedback...
                  </div>
                </div>
              ) : visibleItems.length === 0 ? (
                <div className="flex min-h-[360px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 px-6 text-center">
                  <div>
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                      <MessageSquarePlus className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">No feedback yet</h3>
                    <p className="mt-1 text-sm text-slate-500">Submitted feedback will appear here once available.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {visibleItems.map((item) => (
                      <article
                        key={item.id}
                        className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-violet-200 hover:bg-violet-50/30"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 font-medium text-slate-700 shadow-sm">
                                <UserRound className="h-3.5 w-3.5" />
                                {item.username}
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 font-medium text-slate-700 shadow-sm">
                                <CalendarClock className="h-3.5 w-3.5" />
                                {formatDate(item.createdAt?.toString())}
                              </span>
                            </div>

                            <h3 className="mt-4 break-words text-lg font-semibold text-slate-900">
                              {item.title}
                            </h3>
                            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                              {item.content}
                            </p>
                          </div>

                          <div className="shrink-0 text-xs font-semibold uppercase tracking-widest text-slate-400">
                            #{item.id}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-500">
                      Showing {items.length} of {totalCount} feedback item{totalCount === 1 ? "" : "s"}
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void loadFeedback(Math.max(1, pageNumber - 1))}
                        disabled={pageNumber <= 1 || loading}
                        className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                        {pageNumber} / {totalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => void loadFeedback(Math.min(totalPages, pageNumber + 1))}
                        disabled={pageNumber >= totalPages || loading}
                        className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
            </section>
          </div>
        </div>
      </div>
    </QALayout>
  );
}
