"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
    Activity,
    Clock3,
    Cpu,
    Database,
    RefreshCcw,
    Server,
    Workflow,
} from "lucide-react";

import { AdminLayout } from "../../layouts/AdminLayout";
import { getPerformanceData } from "../../api/system-monitor";
import type { performanceData } from "../../types/system-monitor";
import { systemMonitorSignalRService } from "../../services/systemMonitorHub";

function formatUptime(uptime: string) {
    if (!uptime) return "--";
    return uptime.split(".")[0];
}

function formatMB(value: number) {
    if (Number.isNaN(value)) return "0 MB";
    return `${value.toFixed(2)} MB`;
}

function getCpuStatus(value: number) {
    if (value < 50) {
        return {
            label: "Ổn định",
            badgeClass:
                "border-emerald-200 bg-emerald-50 text-emerald-700",
            barClass: "bg-emerald-500",
            trackClass: "bg-emerald-100",
        };
    }

    if (value < 80) {
        return {
            label: "Cần theo dõi",
            badgeClass:
                "border-amber-200 bg-amber-50 text-amber-700",
            barClass: "bg-amber-500",
            trackClass: "bg-amber-100",
        };
    }

    return {
        label: "Cao",
        badgeClass: "border-red-200 bg-red-50 text-red-700",
        barClass: "bg-red-500",
        trackClass: "bg-red-100",
    };
}

function MetricCard({
    title,
    value,
    subtitle,
    icon,
    iconClassName,
}: {
    title: string;
    value: string;
    subtitle: string;
    icon: ReactNode;
    iconClassName: string;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
                <div className={`rounded-2xl p-3 ${iconClassName}`}>{icon}</div>

                <span className="text-sm font-medium text-slate-500">{title}</span>
            </div>

            <div className="mt-5 text-3xl font-semibold tracking-tight text-slate-900">
                {value}
            </div>

            <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
        </div>
    );
}

export function SystemMonitorPage() {
    const [data, setData] = useState<performanceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<string>("");

    const fetchData = async () => {
        try {
            setRefreshing(true);
            const response = await getPerformanceData();
            setData(response);
            setLastUpdated(new Date().toLocaleString("vi-VN"));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        const initialize = async () => {
    await fetchData();

    await systemMonitorSignalRService.start((signalRData) => {
      setData(signalRData);
      setLastUpdated(new Date().toLocaleString("vi-VN"));
    });
  };

        initialize();

        return () => {
            systemMonitorSignalRService.stop();
        };
    }, []);


    const cpu = data?.cpuUsagePercentage ?? 0;
    const cpuStatus = useMemo(() => getCpuStatus(cpu), [cpu]);

    if (loading) {
        return (
            <AdminLayout>
                <div className="space-y-6">
                    <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {[...Array(4)].map((_, index) => (
                            <div
                                key={index}
                                className="h-36 animate-pulse rounded-2xl bg-slate-100"
                            />
                        ))}
                    </div>
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                        <div className="h-56 animate-pulse rounded-2xl bg-slate-100" />
                        <div className="h-56 animate-pulse rounded-2xl bg-slate-100" />
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-violet-950 p-6 text-white shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="rounded-2xl bg-orange-100 p-3 text-orange-600 backdrop-blur">
                                <Server className="h-6 w-6" />
                            </div>

                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-3xl font-semibold tracking-tight">
                                        Theo dõi hệ thống
                                    </h1>

                                    <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-200 backdrop-blur">
                                        Trực tiếp
                                    </span>
                                </div>

                                <p className="mt-2 max-w-2xl text-sm text-slate-300">
                                    Theo dõi CPU, bộ nhớ, worker đang bận và số log tác tử trong ngày.
                                </p>

                                <p className="mt-3 text-xs text-slate-400">
                                    Cập nhật gần nhất: {lastUpdated || "--"}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={fetchData}
                            disabled={refreshing}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <RefreshCcw
                                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                            />
                            Làm mới
                        </button>
                    </div>
                </div>
                {/* Metrics */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        title="CPU"
                        value={`${cpu}%`}
                        subtitle="Phần trăm sử dụng CPU hiện tại"
                        icon={<Cpu className="h-5 w-5" />}
                        iconClassName="bg-indigo-50 text-indigo-600"
                    />

                    <MetricCard
                        title="Bộ nhớ"
                        value={formatMB(data?.memoryUsageMb ?? 0)}
                        subtitle="Dung lượng bộ nhớ đang dùng"
                        icon={<Database className="h-5 w-5" />}
                        iconClassName="bg-cyan-50 text-cyan-600"
                    />

                    <MetricCard
                        title="Worker bận"
                        value={`${data?.threadPoolBusyWorkers ?? 0}`}
                        subtitle="Số worker đang hoạt động"
                        icon={<Workflow className="h-5 w-5" />}
                        iconClassName="bg-amber-50 text-amber-600"
                    />

                    <MetricCard
                        title="Agent logs"
                        value={`${data?.totalAgentLogsToday ?? 0}`}
                        subtitle="Tổng số log trong ngày"
                        icon={<Activity className="h-5 w-5" />}
                        iconClassName="bg-violet-50 text-violet-600"
                    />
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="rounded-2xl bg-green-100 p-3 text-slate-700">
                                <Clock3 className="h-5 w-5 text-green-600" />
                            </div>

                            <div>
                                <h2 className="text-base font-semibold text-slate-900">
                                    Thông tin thời gian chạy
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Trạng thái runtime của hệ thống
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                                <span className="text-sm text-slate-500">Uptime</span>
                                <span className="font-medium text-slate-900">
                                    {formatUptime(data?.uptime ?? "")}
                                </span>
                            </div>

                            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                                <span className="text-sm text-slate-500">Số lần GC Gen2</span>
                                <span className="font-medium text-slate-900">
                                    {data?.gcGen2Collections ?? 0}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="rounded-2xl bg-blue-100 p-3 text-slate-700">
                                <Activity className="h-5 w-5 text-blue-600" />
                            </div>

                            <div>
                                <h2 className="text-base font-semibold text-slate-900">
                                    Đánh giá hệ thống
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Mức độ hoạt động hiện tại
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <div className="mb-3 flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm text-slate-500">CPU</p>
                                        <p className="mt-1 text-base font-medium text-slate-900">
                                            {cpuStatus.label}
                                        </p>
                                    </div>

                                    <span
                                        className={`rounded-full border px-3 py-1 text-xs font-medium ${cpuStatus.badgeClass}`}
                                    >
                                        {cpuStatus.label}
                                    </span>
                                </div>

                                <div className={`h-2 overflow-hidden rounded-full ${cpuStatus.trackClass}`}>
                                    <div
                                        className={`h-full rounded-full ${cpuStatus.barClass}`}
                                        style={{ width: `${Math.min(Math.max(cpu, 0), 100)}%` }}
                                    />
                                </div>
                            </div>

                            <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                                Hệ thống đang hoạt động bình thường và tự làm mới mỗi 10 giây.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}