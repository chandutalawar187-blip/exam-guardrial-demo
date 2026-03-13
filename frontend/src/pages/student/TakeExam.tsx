import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Clock, ChevronLeft, ChevronRight, Send, AlertTriangle, CheckCircle, Loader, Copy, AlertCircle } from "lucide-react";
import { startNetworkInterceptor, stopNetworkInterceptor } from "@/lib/networkInterceptor";
import { useExamProctoring } from "@/hooks/useExamProctoring";
import { ViolationWarning, CheatingDisclaimer } from "@/components/ExamSecurityAlerts";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface Question {
    index: number;
    question_text: string;
    options: string[];
}

interface ExamData {
    session_id: string;
    title: string;
    subject_code: string;
    duration_minutes: number;
    question_count: number;
    questions: Question[];
}

const TakeExam = () => {
    const { studentSession, user, logout } = useAuth();
    const navigate = useNavigate();
    const [examData, setExamData] = useState<ExamData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<any>(null);
    const timerRef = useRef<any>(null);
    const monitoringId = studentSession?.monitoring_session_id || "";

    // Proctoring system
    const {
        violations,
        violationCount,
        warningCount,
        marksDeducted,
        showWarning,
        showDisclaimer,
        copiedText,
        idleSeconds,
        isBlocked,
    } = useExamProctoring(monitoringId);

    const [disclaimerAcknowledged, setDisclaimerAcknowledged] = useState(false);
    const getLastViolationType = () => {
        if (violations.length === 0) return "";
        const type = violations[violations.length - 1].type;
        return type.charAt(0).toUpperCase() + type.slice(1).replace("_", " ");
    };

    // Start network interceptor for monitoring
    useEffect(() => {
        if (monitoringId) {
            startNetworkInterceptor(monitoringId);
        }
        return () => {
            stopNetworkInterceptor();
        };
    }, [monitoringId]);

    // Fetch exam
    useEffect(() => {
        if (!studentSession) {
            navigate("/login");
            return;
        }
        fetch(`${API}/api/exam-sessions/${studentSession.session_id}/exam`)
            .then((r) => {
                if (!r.ok) throw new Error("Failed to load exam");
                return r.json();
            })
            .then((data) => {
                setExamData(data);
                setTimeLeft(data.duration_minutes * 60);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [studentSession, navigate]);

    // Timer
    useEffect(() => {
        if (!examData || submitted || timeLeft <= 0) return;
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [examData, submitted]);

    const handleSubmit = useCallback(async (auto = false) => {
        if (submitted || submitting) return;
        if (!auto && !confirm("Are you sure you want to submit? You cannot change your answers.")) return;
        setSubmitting(true);
        clearInterval(timerRef.current);

        try {
            const res = await fetch(
                `${API}/api/exam-sessions/${studentSession?.session_id}/submit?student_name=${encodeURIComponent(user?.name || "")}&marks_deducted=${marksDeducted}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ answers }),
                }
            );
            if (!res.ok) throw new Error("Submission failed");
            const data = await res.json();
            setResult(data);
            setSubmitted(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }, [answers, studentSession, user, submitted, submitting, marksDeducted]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const selectAnswer = (qIdx: number, optIdx: number) => {
        setAnswers({ ...answers, [String(qIdx)]: optIdx });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader className="h-6 w-6 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-3">
                    <AlertTriangle className="h-8 w-8 text-destructive mx-auto" />
                    <p className="text-sm text-destructive">{error}</p>
                    <button onClick={() => { logout(); navigate("/login"); }} className="text-sm text-primary hover:underline">
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    // Results screen
    if (submitted && result) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="w-full max-w-lg">
                    <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
                        <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 px-6 py-8 text-center">
                            <CheckCircle className="h-12 w-12 text-success mx-auto mb-3" />
                            <h1 className="text-xl font-bold text-foreground">Exam Submitted!</h1>
                            <p className="text-sm text-muted-foreground mt-1">{examData?.title}</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="rounded-lg bg-secondary p-3">
                                    <p className="text-2xl font-bold text-foreground">{result.score}%</p>
                                    <p className="text-xs text-muted-foreground">Score</p>
                                </div>
                                <div className="rounded-lg bg-success/10 p-3">
                                    <p className="text-2xl font-bold text-success">{result.correct}</p>
                                    <p className="text-xs text-muted-foreground">Correct</p>
                                </div>
                                <div className="rounded-lg bg-destructive/10 p-3">
                                    <p className="text-2xl font-bold text-destructive">{result.total - result.correct}</p>
                                    <p className="text-xs text-muted-foreground">Wrong</p>
                                </div>
                            </div>

                            {/* Results breakdown */}
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {result.results?.map((r: any, i: number) => (
                                    <div key={i} className={`rounded-lg px-3 py-2 text-xs flex items-center justify-between ${r.is_correct ? "bg-success/10" : "bg-destructive/10"
                                        }`}>
                                        <span className="text-foreground">Q{r.question_index + 1}</span>
                                        <span className={r.is_correct ? "text-success font-medium" : "text-destructive font-medium"}>
                                            {r.is_correct ? "✓ Correct" : "✗ Wrong"}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => { logout(); navigate("/login"); }}
                                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
                            >
                                Exit Exam
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const questions = examData?.questions || [];
    const question = questions[currentQ];
    const answeredCount = Object.keys(answers).length;

    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Top Bar with Violations Panel */}
            <header className="border-b border-border bg-card px-4 py-2.5 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-foreground">{examData?.title}</span>
                    <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {examData?.subject_code}
                    </span>
                </div>

                {/* Violations & Marks Display */}
                <div className="flex items-center gap-3">
                    {/* Copy Text Display */}
                    {copiedText && (
                        <div className="text-xs bg-red-500/15 border border-red-500/30 rounded px-3 py-1.5 max-w-xs">
                            <div className="flex items-center gap-1.5 text-red-500 font-medium mb-0.5">
                                <Copy className="h-3 w-3" />
                                Copied Text Detected
                            </div>
                            <p className="text-muted-foreground truncate text-[10px]">"{copiedText.slice(0, 60)}"</p>
                        </div>
                    )}

                    {/* Idle Time Warning */}
                    {idleSeconds > 0 && (
                        <div className={`text-xs rounded px-3 py-1.5 flex items-center gap-2 ${
                            idleSeconds >= 30
                                ? "bg-red-500/15 border border-red-500/30 text-red-500"
                                : "bg-yellow-500/15 border border-yellow-500/30 text-yellow-600"
                        }`}>
                            <Clock className="h-3 w-3" />
                            Idle: {idleSeconds}s
                        </div>
                    )}

                    {/* Violations Count */}
                    {violationCount > 0 && (
                        <div className={`text-xs rounded px-3 py-1.5 flex items-center gap-2 ${
                            warningCount >= 3
                                ? "bg-destructive/15 border border-destructive/30 text-destructive"
                                : "bg-warning/15 border border-warning/30 text-warning"
                        }`}>
                            <AlertCircle className="h-3 w-3" />
                            Violations: {violationCount}
                        </div>
                    )}

                    {/* Marks Deducted */}
                    {marksDeducted > 0 && (
                        <div className="text-xs bg-red-500/20 border border-red-500/50 rounded px-3 py-1.5 text-red-500 font-bold">
                            -{marksDeducted} Marks
                        </div>
                    )}

                    {/* Warnings Display */}
                    {warningCount > 0 && (
                        <div className={`text-xs rounded px-3 py-1.5 font-medium ${
                            warningCount === 3
                                ? "bg-red-500/20 border border-red-500/50 text-red-500"
                                : "bg-yellow-500/15 border border-yellow-500/30 text-yellow-600"
                        }`}>
                            ⚠️ {warningCount}/3
                        </div>
                    )}

                    <span className="text-xs text-muted-foreground">{user?.name}</span>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-sm font-semibold ${timeLeft < 60 ? "bg-destructive/15 text-destructive animate-pulse" :
                        timeLeft < 300 ? "bg-warning/15 text-warning" :
                            "bg-secondary text-foreground"
                        }`}>
                        <Clock className="h-4 w-4" />
                        {formatTime(timeLeft)}
                    </div>
                </div>
            </header>

            {/* Violation Alerts */}
            <ViolationWarning
                isVisible={showWarning && !disclaimerAcknowledged}
                warningCount={warningCount}
                violationType={getLastViolationType()}
                copiedText={copiedText}
                idleSeconds={idleSeconds}
            />

            <CheatingDisclaimer
                isVisible={showDisclaimer && !disclaimerAcknowledged}
                onAcknowledge={() => setDisclaimerAcknowledged(true)}
            />

            {/* Blocked Action Indicator */}
            {isBlocked && (
                <div className="fixed top-8 right-8 bg-red-500 text-white rounded-lg px-4 py-2 text-sm font-medium animate-pulse shadow-lg">
                    ⛔ Action Blocked
                </div>
            )}

            <div className="flex-1 flex">
                {/* Question Navigation Sidebar */}
                <aside className="w-20 border-r border-border bg-card p-3 space-y-1.5 overflow-y-auto">
                    <p className="text-[10px] text-muted-foreground text-center mb-2 font-medium">QUESTIONS</p>
                    <div className="grid grid-cols-2 gap-1.5">
                        {questions.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentQ(idx)}
                                className={`h-8 rounded-md text-xs font-medium transition-all ${idx === currentQ
                                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                    : answers[String(idx)] !== undefined
                                        ? "bg-success/15 text-success border border-success/30"
                                        : "bg-secondary text-muted-foreground hover:bg-accent"
                                    }`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>
                    <div className="pt-3 border-t border-border mt-3">
                        <p className="text-[10px] text-muted-foreground text-center">
                            {answeredCount}/{questions.length}
                        </p>
                    </div>
                </aside>

                {/* Question Area */}
                <main className="flex-1 p-6 max-w-3xl mx-auto">
                    {question && (
                        <div className="space-y-6">
                            <div>
                                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                                    Question {currentQ + 1} of {questions.length}
                                </span>
                                <h2 className="text-lg font-semibold text-foreground mt-3 leading-relaxed">
                                    {question.question_text}
                                </h2>
                            </div>

                            {/* Options */}
                            <div className="space-y-2.5">
                                {question.options.map((opt, oIdx) => (
                                    <button
                                        key={oIdx}
                                        onClick={() => selectAnswer(question.index, oIdx)}
                                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all ${answers[String(question.index)] === oIdx
                                            ? "border-primary bg-primary/10 shadow-md shadow-primary/10"
                                            : "border-border bg-card hover:border-primary/30 hover:bg-accent/50"
                                            }`}
                                    >
                                        <span className={`flex-shrink-0 h-7 w-7 rounded-full border-2 flex items-center justify-center text-xs font-medium transition-colors ${answers[String(question.index)] === oIdx
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "border-muted-foreground/30 text-muted-foreground"
                                            }`}>
                                            {String.fromCharCode(65 + oIdx)}
                                        </span>
                                        <span className="text-sm text-foreground">{opt}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Navigation */}
                            <div className="flex items-center justify-between pt-4">
                                <button
                                    onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
                                    disabled={currentQ === 0}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 transition-colors"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </button>

                                {currentQ === questions.length - 1 ? (
                                    <button
                                        onClick={() => handleSubmit(false)}
                                        disabled={submitting}
                                        className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary to-blue-500 text-primary-foreground text-sm font-medium
                      hover:opacity-90 disabled:opacity-50 shadow-lg shadow-primary/20 transition-all"
                                    >
                                        {submitting ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                        Submit Exam
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setCurrentQ(Math.min(questions.length - 1, currentQ + 1))}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default TakeExam;
