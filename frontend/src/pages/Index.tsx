import { useState } from "react";
import { Shield, Users, AlertTriangle, CheckCircle, Activity, Search, Loader } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { SessionRow } from "@/components/SessionRow";
import { useSessions } from "@/hooks/useApi";
import type { ExamSession } from "@/lib/exam-types";

type FilterStatus = "all" | "active" | "flagged" | "completed" | "terminated";

const Index = () => {
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");

  // Fetch sessions from backend
  const { data: allSessions = [], isLoading, error } = useSessions();

  const sessions = (allSessions || []).filter((s: any) => {
    if (filter !== "all" && s.status !== filter) return false;
    if (search && !s.studentName?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const active = (allSessions || []).filter((s: any) => s.status === "active").length;
  const flagged = (allSessions || []).filter((s: any) => s.status === "flagged" || s.status === "terminated").length;
  const completed = (allSessions || []).filter((s: any) => s.status === "completed").length;
  const totalViolations = (allSessions || []).reduce((a: number, s: any) => a + (s.violations?.length || 0), 0);
  const totalSessions = allSessions.length;

  const filters: { value: FilterStatus; label: string; count: number }[] = [
    { value: "all", label: "All", count: totalSessions },
    { value: "active", label: "Active", count: active },
    { value: "flagged", label: "Flagged", count: (allSessions || []).filter((s: any) => s.status === "flagged").length },
    { value: "terminated", label: "Terminated", count: (allSessions || []).filter((s: any) => s.status === "terminated").length },
    { value: "completed", label: "Completed", count: completed },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm tracking-tight text-foreground">Exam Guardrail</span>
          <span className="text-xs text-muted-foreground font-mono ml-1">v1.0</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${isLoading ? "bg-warning animate-pulse" : "bg-success animate-pulse"}`} />
            <span className="text-xs text-muted-foreground">{isLoading ? "Loading..." : "Monitoring"}</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <p className="font-medium">Backend Connection Error</p>
            <p className="text-xs mt-1">
              Unable to connect to backend. Make sure the API server is running at{" "}
              <code className="bg-destructive/20 px-1 rounded">{import.meta.env.VITE_API_URL || "http://localhost:8000"}</code>
            </p>
          </div>
        )}

        {/* Exam title */}
        <div>
          <h1 className="text-lg font-semibold text-foreground">CS301 — Data Structures Final</h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-mono">
            {totalSessions > 0 ? (
              <>
                Started {new Date(allSessions[0].startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {totalSessions} students
              </>
            ) : (
              "No active sessions"
            )}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Active Sessions" value={active} icon={<Users className="h-4 w-4" />} accent="success" />
          <StatCard label="Flagged / Terminated" value={flagged} icon={<AlertTriangle className="h-4 w-4" />} accent="destructive" />
          <StatCard label="Completed" value={completed} icon={<CheckCircle className="h-4 w-4" />} />
          <StatCard label="Total Violations" value={totalViolations} icon={<Activity className="h-4 w-4" />} accent="warning" />
        </div>

        {/* Session Table */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5 gap-4">
            <div className="flex items-center gap-1">
              {filters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    filter === f.value
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {f.label}
                  <span className="ml-1 opacity-60">{f.count}</span>
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search student…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-48 rounded-md border border-input bg-background pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {/* Column Headers */}
          <div className="grid grid-cols-[1fr_120px_100px_120px_80px_28px] items-center gap-4 px-4 py-2 text-xs text-muted-foreground border-b border-border bg-secondary/30">
            <span>Student</span>
            <span>Status</span>
            <span>Elapsed</span>
            <span>Risk</span>
            <span className="text-center">Flags</span>
            <span />
          </div>

          {/* Rows */}
          <div>
            {isLoading ? (
              <div className="px-4 py-8 text-center flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader className="h-4 w-4 animate-spin" />
                Loading sessions...
              </div>
            ) : sessions.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No sessions match your filter.
              </div>
            ) : (
              sessions.map((session: any) => (
                <SessionRow key={session.id || session._id} session={session} />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
