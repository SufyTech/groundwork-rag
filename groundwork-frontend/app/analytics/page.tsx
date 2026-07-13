"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type Stats = {
  total_questions: number;
  avg_latency: number;
  recent_activity: { text: string; time: string }[];
  questions_per_day: { day: string; count: number }[];
  top_questions: { question: string; count: number }[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function timeAgo(isoString: string): string {
  const then = new Date(isoString).getTime();
  const now = Date.now();
  const diffMin = Math.floor((now - then) / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

function formatDayLabel(dayStr: string): string {
  return new Date(dayStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [docCount, setDocCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, docsRes] = await Promise.all([
          fetch(`${API_BASE}/analytics/stats`),
          fetch(`${API_BASE}/documents`),
        ]);
        if (!statsRes.ok) throw new Error("Failed to load stats");
        const statsData = await statsRes.json();
        const docsData = await docsRes.json();
        setStats(statsData);
        setDocCount(docsData.documents?.length ?? 0);
      } catch (err) {
        setError(
          "Couldn't reach the backend. Is the FastAPI server running on port 8000?",
        );
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const chartData =
    stats?.questions_per_day.map((d) => ({
      day: formatDayLabel(d.day),
      count: d.count,
    })) ?? [];

  return (
    <main className="min-h-screen bg-white text-black">
      <nav className="flex items-center justify-between px-8 py-4 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <span className="text-slate-300">|</span>
          <span className="font-semibold text-lg">Groundwork</span>
        </div>
        <span className="text-sm text-slate-500">Sufiyan K</span>
      </nav>

      <div className="px-8 py-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-medium">Analytics</h1>
          <p className="text-sm text-slate-400 mt-1">
            Live data from your backend
          </p>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-slate-500 text-sm py-12">
            <div className="w-3 h-3 rounded-full bg-slate-300 animate-pulse" />
            Loading analytics…
          </div>
        )}

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        {!loading && !error && stats && (
          <>
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <div className="border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs text-slate-500 mb-2 tracking-wide uppercase">
                  Questions asked
                </p>
                <p className="text-3xl font-serif font-medium">
                  {stats.total_questions}
                </p>
              </div>
              <div className="border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs text-slate-500 mb-2 tracking-wide uppercase">
                  Avg response time
                </p>
                <p className="text-3xl font-serif font-medium">
                  {stats.avg_latency > 0 ? `${stats.avg_latency}s` : "—"}
                </p>
              </div>
              <div className="border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs text-slate-500 mb-2 tracking-wide uppercase">
                  Active documents
                </p>
                <p className="text-3xl font-serif font-medium">
                  {docCount ?? 0}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="md:col-span-2 border border-slate-200 rounded-xl p-6 shadow-sm">
                <p className="text-sm font-medium mb-4">Questions per day</p>
                {chartData.length === 0 ? (
                  <p className="text-sm text-slate-400 py-8 text-center">
                    Not enough activity yet to chart daily trends.
                  </p>
                ) : (
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <XAxis
                          dataKey="day"
                          tick={{ fontSize: 12, fill: "#64748b" }}
                          axisLine={{ stroke: "#e2e8f0" }}
                          tickLine={false}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fontSize: 12, fill: "#64748b" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: 8,
                            border: "1px solid #e2e8f0",
                            fontSize: 12,
                          }}
                        />
                        <Bar
                          dataKey="count"
                          fill="#6366f1"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="border border-slate-200 rounded-xl p-6 shadow-sm">
                <p className="text-sm font-medium mb-4">Top questions</p>
                {!stats.top_questions || stats.top_questions.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    Ask a few questions to see the most common ones ranked here.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {stats.top_questions.map((q, i) => (
                      <li
                        key={i}
                        className="flex justify-between gap-3 text-sm"
                      >
                        <span className="text-slate-700 truncate">
                          {q.question}
                        </span>
                        <span className="text-slate-400 shrink-0">
                          {q.count}×
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-6 shadow-sm">
              <p className="text-sm font-medium mb-5">Recent activity</p>
              {stats.recent_activity.length === 0 ? (
                <p className="text-sm text-slate-400 py-4">
                  No activity yet — ask a question in the chat to see it show up
                  here.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {stats.recent_activity.map((a, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                        <span className="text-sm text-slate-700">{a.text}</span>
                      </div>
                      <span className="text-xs text-slate-400 shrink-0">
                        {timeAgo(a.time)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
