import { useState, useEffect } from "react";
import { Plus, Clock, Copy, Check, X, AlertCircle, ToggleLeft, ToggleRight, Users } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface ExamSession {
    id: string;
    session_id: string;
    subject_code: string;
    title: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    is_active: boolean;
    created_at: string;
}

interface Paper {
    id: string;
    title: string;
    subject_code: string;
    question_count: number;
}

const Sessions = () => {
    const [sessions, setSessions] = useState<ExamSession[]>([]);
    const [papers, setPapers] = useState<Paper[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState<string | null>(null);

    // Form state
    const [selectedCode, setSelectedCode] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [duration, setDuration] = useState(30);

    const fetchData = () => {
        Promise.all([
            fetch(`${API}/api/exam-sessions`).then((r) => r.json()),
            fetch(`${API}/api/exams`).then((r) => r.json()),
        ])
            .then(([sessionsData, papersData]) => {
                setSessions(sessionsData.sessions || []);
                setPapers(papersData.papers || []);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            const res = await fetch(`${API}/api/exam-sessions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subject_code: selectedCode,
                    start_time: new Date(startTime).toISOString(),
                    end_time: new Date(endTime).toISOString(),
                    duration_minutes: duration,
                }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || "Failed to create session");
            }
            setShowCreate(false);
            setSelectedCode("");
            setStartTime("");
            setEndTime("");
            setDuration(30);
            fetchData();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const toggleActive = async (session: ExamSession) => {
        await fetch(`${API}/api/exam-sessions/${session.session_id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_active: !session.is_active }),
        });
        fetchData();
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(text);
        setTimeout(() => setCopied(null), 2000);
    };

    const formatDateTime = (iso: string) => {
        try {
            return new Date(iso).toLocaleString([], {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return iso;
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Exam Sessions</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Create and manage timed exam sessions</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    disabled={papers.length === 0}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                    <Plus className="h-4 w-4" />
                    New Session
                </button>
            </div>

            {papers.length === 0 && !loading && (
                <div className="rounded-lg border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-warning">
                    Create a question paper first before creating exam sessions.
                </div>
            )}

            {/* Create Modal */}
            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                            <h2 className="text-base font-semibold text-foreground">Create Exam Session</h2>
                            <button onClick={() => { setShowCreate(false); setError(""); }} className="p-1.5 rounded-md hover:bg-accent">
                                <X className="h-4 w-4 text-muted-foreground" />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            {error && (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                    Question Paper (Subject Code)
                                </label>
                                <select
                                    value={selectedCode}
                                    onChange={(e) => setSelectedCode(e.target.value)}
                                    required
                                    className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                >
                                    <option value="">Select a paper...</option>
                                    {papers.map((p) => (
                                        <option key={p.id} value={p.subject_code}>
                                            {p.subject_code} — {p.title} ({p.question_count} Qs)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Start Time</label>
                                    <input
                                        type="datetime-local"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        required
                                        className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">End Time</label>
                                    <input
                                        type="datetime-local"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        required
                                        className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                    Duration (minutes per student)
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="range"
                                        min={5}
                                        max={180}
                                        step={5}
                                        value={duration}
                                        onChange={(e) => setDuration(Number(e.target.value))}
                                        className="flex-1 accent-primary"
                                    />
                                    <span className="text-sm font-mono text-foreground min-w-[50px] text-right">
                                        {duration} min
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setShowCreate(false); setError(""); }}
                                    className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
                                >
                                    Create Session
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Sessions List */}
            {loading ? (
                <div className="text-center py-12 text-muted-foreground text-sm">Loading...</div>
            ) : sessions.length === 0 ? (
                <div className="text-center py-16 rounded-xl border border-dashed border-border">
                    <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">No exam sessions yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            className={`rounded-xl border bg-card overflow-hidden transition-colors ${session.is_active ? "border-success/30" : "border-border"
                                }`}
                        >
                            <div className="px-5 py-4">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${session.is_active
                                                    ? "bg-success/15 text-success"
                                                    : "bg-muted text-muted-foreground"
                                                }`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${session.is_active ? "bg-success animate-pulse" : "bg-muted-foreground"}`} />
                                                {session.is_active ? "Active" : "Inactive"}
                                            </span>
                                            <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                                                {session.subject_code}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-foreground">{session.title}</p>

                                        {/* Session ID - copyable */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground">Session ID:</span>
                                            <button
                                                onClick={() => copyToClipboard(session.session_id)}
                                                className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary hover:bg-accent text-xs font-mono text-foreground transition-colors"
                                            >
                                                {session.session_id}
                                                {copied === session.session_id ? (
                                                    <Check className="h-3 w-3 text-success" />
                                                ) : (
                                                    <Copy className="h-3 w-3 text-muted-foreground" />
                                                )}
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span>⏰ {formatDateTime(session.start_time)} → {formatDateTime(session.end_time)}</span>
                                            <span>⏱ {session.duration_minutes} min</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => toggleActive(session)}
                                        className="p-1 rounded-lg hover:bg-accent transition-colors"
                                        title={session.is_active ? "Deactivate" : "Activate"}
                                    >
                                        {session.is_active ? (
                                            <ToggleRight className="h-6 w-6 text-success" />
                                        ) : (
                                            <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Sessions;
