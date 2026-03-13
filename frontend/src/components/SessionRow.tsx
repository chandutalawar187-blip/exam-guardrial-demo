import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, AlertTriangle, Copy, Monitor, Bot, Clock, LogOut, ClipboardPaste, MousePointer, ExternalLink, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { RiskMeter } from "./RiskMeter";
import type { ExamSession, ViolationType } from "@/lib/exam-types";
import { VIOLATION_LABELS, STATUS_CONFIG } from "@/lib/exam-types";

const violationIcons: Record<string, React.ReactNode> = {
  tab_switch: <Monitor className="h-3.5 w-3.5" />,
  copy_paste: <Copy className="h-3.5 w-3.5" />,
  screen_share: <Monitor className="h-3.5 w-3.5" />,
  ai_tool: <Bot className="h-3.5 w-3.5" />,
  idle: <Clock className="h-3.5 w-3.5" />,
  browser_exit: <LogOut className="h-3.5 w-3.5" />,
  COPY: <Copy className="h-3.5 w-3.5" />,
  PASTE: <ClipboardPaste className="h-3.5 w-3.5" />,
  TAB_SWITCH: <LogOut className="h-3.5 w-3.5" />,
  TAB_RETURN: <Monitor className="h-3.5 w-3.5" />,
  WINDOW_BLUR: <ExternalLink className="h-3.5 w-3.5" />,
  RIGHT_CLICK: <MousePointer className="h-3.5 w-3.5" />,
  NETWORK_ACTIVITY: <Globe className="h-3.5 w-3.5" />,
};

const severityColors: Record<string, string> = {
  HIGH: "text-destructive",
  MEDIUM: "text-warning",
  LOW: "text-muted-foreground",
  high: "text-destructive",
  medium: "text-warning",
  low: "text-muted-foreground",
};

interface SessionRowProps {
  session: ExamSession;
}

export function SessionRow({ session }: SessionRowProps) {
  const [expanded, setExpanded] = useState(false);
  const statusConfig = STATUS_CONFIG[session.status] || STATUS_CONFIG.active;
  const elapsed = getElapsed(session.startTime, session.endTime);

  // Combine old violations + new events format
  const violations = session.violations || [];
  const events = (session as any).events || [];

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full grid grid-cols-[1fr_120px_100px_120px_80px_28px] items-center gap-4 px-4 py-3 text-left hover:bg-accent/50 transition-colors"
      >
        <div>
          <p className="text-sm font-medium text-foreground">{session.studentName}</p>
          <p className="text-xs text-muted-foreground font-mono">{session.studentEmail}</p>
        </div>
        <span className={cn("inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium", statusConfig.className)}>
          {statusConfig.label}
        </span>
        <span className="text-xs text-muted-foreground font-mono">{elapsed}</span>
        <RiskMeter score={session.riskScore} size="sm" />
        <span className="text-xs text-muted-foreground font-mono text-center">
          {violations.length + events.length}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", expanded && "rotate-180")} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1">
              {violations.length === 0 && events.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">No violations recorded.</p>
              ) : (
                <div className="space-y-1.5">
                  {/* Old-style violations */}
                  {violations.map((v: any) => (
                    <div key={v.id} className="flex items-start gap-3 rounded-md bg-secondary/50 px-3 py-2">
                      <span className={cn(
                        "flex-shrink-0 mt-0.5",
                        severityColors[v.severity] || "text-muted-foreground"
                      )}>
                        {violationIcons[v.type] || violationIcons[v.event_type] || <AlertTriangle className="h-3.5 w-3.5" />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-foreground">
                            {VIOLATION_LABELS[v.type as ViolationType] || v.event_type || v.type}
                          </span>
                          <span className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded font-medium",
                            v.severity === "HIGH" || v.severity === "high"
                              ? "bg-destructive/15 text-destructive"
                              : v.severity === "MEDIUM" || v.severity === "medium"
                                ? "bg-warning/15 text-warning"
                                : "bg-muted text-muted-foreground"
                          )}>
                            {(v.severity || "").toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{v.description}</p>

                        {/* Metadata details */}
                        {v.metadata && (
                          <div className="mt-1.5 space-y-1">
                            {v.metadata.copied_text && (
                              <div className="rounded bg-destructive/5 border border-destructive/10 px-2 py-1.5">
                                <span className="text-[10px] text-destructive font-semibold uppercase tracking-wide">Copied Text</span>
                                <p className="text-xs text-foreground mt-0.5 font-mono break-all whitespace-pre-wrap">
                                  {v.metadata.copied_text}
                                </p>
                              </div>
                            )}
                            {v.metadata.pasted_text && (
                              <div className="rounded bg-destructive/5 border border-destructive/10 px-2 py-1.5">
                                <span className="text-[10px] text-destructive font-semibold uppercase tracking-wide">Pasted Text</span>
                                <p className="text-xs text-foreground mt-0.5 font-mono break-all whitespace-pre-wrap">
                                  {v.metadata.pasted_text}
                                </p>
                              </div>
                            )}
                            {v.metadata.url && v.metadata.url !== "unknown" && (
                              <div className="rounded bg-warning/5 border border-warning/10 px-2 py-1.5">
                                <span className="text-[10px] text-warning font-semibold uppercase tracking-wide">URL / Page</span>
                                <p className="text-xs text-foreground mt-0.5 font-mono break-all">
                                  {v.metadata.url}
                                </p>
                              </div>
                            )}
                            {v.metadata.away_seconds > 0 && (
                              <div className="rounded bg-warning/5 border border-warning/10 px-2 py-1.5">
                                <span className="text-[10px] text-warning font-semibold uppercase tracking-wide">
                                  Away Duration: {v.metadata.away_seconds}s
                                  {v.metadata.clipboard_changed && " ⚠️ Clipboard Changed!"}
                                </span>
                              </div>
                            )}
                            {v.metadata.new_clipboard_text && (
                              <div className="rounded bg-destructive/5 border border-destructive/10 px-2 py-1.5">
                                <span className="text-[10px] text-destructive font-semibold uppercase tracking-wide">External Clipboard Content</span>
                                <p className="text-xs text-foreground mt-0.5 font-mono break-all whitespace-pre-wrap">
                                  {v.metadata.new_clipboard_text}
                                </p>
                              </div>
                            )}
                            {v.metadata.page_title && (
                              <span className="text-[10px] text-muted-foreground">
                                Page: {v.metadata.page_title}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground font-mono flex-shrink-0">
                        {v.timestamp ? new Date(v.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : ""}
                      </span>
                    </div>
                  ))}

                  {/* New-style events from monitoring */}
                  {events.map((ev: any, idx: number) => (
                    <div key={`ev-${idx}`} className="flex items-start gap-3 rounded-md bg-secondary/50 px-3 py-2">
                      <span className={cn(
                        "flex-shrink-0 mt-0.5",
                        severityColors[ev.severity] || "text-muted-foreground"
                      )}>
                        {violationIcons[ev.event_type] || <AlertTriangle className="h-3.5 w-3.5" />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-foreground">
                            {ev.event_type?.replace(/_/g, " ")}
                          </span>
                          <span className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded font-medium",
                            ev.severity === "HIGH"
                              ? "bg-destructive/15 text-destructive"
                              : ev.severity === "MEDIUM"
                                ? "bg-warning/15 text-warning"
                                : "bg-muted text-muted-foreground"
                          )}>
                            {ev.severity}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{ev.description}</p>

                        {/* Metadata details */}
                        {ev.metadata && (
                          <div className="mt-1.5 space-y-1">
                            {ev.metadata.copied_text && (
                              <div className="rounded bg-destructive/5 border border-destructive/10 px-2 py-1.5">
                                <span className="text-[10px] text-destructive font-semibold uppercase tracking-wide">Copied Text</span>
                                <p className="text-xs text-foreground mt-0.5 font-mono break-all whitespace-pre-wrap">
                                  {ev.metadata.copied_text}
                                </p>
                              </div>
                            )}
                            {ev.metadata.pasted_text && (
                              <div className="rounded bg-destructive/5 border border-destructive/10 px-2 py-1.5">
                                <span className="text-[10px] text-destructive font-semibold uppercase tracking-wide">Pasted Text</span>
                                <p className="text-xs text-foreground mt-0.5 font-mono break-all whitespace-pre-wrap">
                                  {ev.metadata.pasted_text}
                                </p>
                              </div>
                            )}
                            {ev.metadata.url && ev.metadata.url !== "unknown" && (
                              <div className="rounded bg-warning/5 border border-warning/10 px-2 py-1.5">
                                <span className="text-[10px] text-warning font-semibold uppercase tracking-wide">URL</span>
                                <p className="text-xs text-foreground mt-0.5 font-mono break-all">
                                  {ev.metadata.url}
                                </p>
                              </div>
                            )}
                            {/* Network requests table */}
                            {ev.metadata.requests && ev.metadata.requests.length > 0 && (
                              <div className="rounded bg-blue-500/5 border border-blue-500/10 px-2 py-1.5">
                                <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-wide">
                                  Network Requests ({ev.metadata.count})
                                </span>
                                <div className="mt-1 space-y-0.5">
                                  {ev.metadata.requests.map((req: any, ri: number) => (
                                    <div key={ri} className="flex items-center gap-2 text-[11px] font-mono py-0.5 border-b border-border/30 last:border-0">
                                      <span className={cn(
                                        "px-1 py-0.5 rounded text-[9px] font-bold min-w-[32px] text-center",
                                        req.method === "GET" ? "bg-green-500/15 text-green-400" :
                                          req.method === "POST" ? "bg-blue-500/15 text-blue-400" :
                                            "bg-muted text-muted-foreground"
                                      )}>
                                        {req.method}
                                      </span>
                                      <span className={cn(
                                        "text-[9px] px-1 rounded",
                                        req.status >= 200 && req.status < 300 ? "text-green-400" :
                                          req.status >= 400 ? "text-destructive" : "text-muted-foreground"
                                      )}>
                                        {req.status}
                                      </span>
                                      <span className="text-foreground truncate flex-1" title={req.url}>
                                        {req.url}
                                      </span>
                                      {req.duration_ms !== undefined && (
                                        <span className="text-muted-foreground text-[9px] flex-shrink-0">
                                          {req.duration_ms}ms
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground font-mono flex-shrink-0">
                        {ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : ""}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {session.score !== undefined && (
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Score:</span>
                  <span className="font-mono font-semibold text-foreground">{session.score}/{session.maxScore}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getElapsed(start: string, end?: string) {
  const s = new Date(start);
  const e = end ? new Date(end) : new Date();
  const mins = Math.round((e.getTime() - s.getTime()) / 60000);
  return `${mins}m`;
}
