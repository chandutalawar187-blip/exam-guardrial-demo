import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, FileText, ChevronDown, ChevronUp, X, Check, AlertCircle } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface Question {
    question_text: string;
    options: string[];
    correct_option: number;
}

interface Paper {
    id: string;
    title: string;
    subject_code: string;
    questions: Question[];
    question_count: number;
    created_at: string;
}

const QuestionPapers = () => {
    const [papers, setPapers] = useState<Paper[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [editingPaper, setEditingPaper] = useState<Paper | null>(null);
    const [expandedPaper, setExpandedPaper] = useState<string | null>(null);
    const [error, setError] = useState("");

    // Form state
    const [title, setTitle] = useState("");
    const [subjectCode, setSubjectCode] = useState("");
    const [questions, setQuestions] = useState<Question[]>([
        { question_text: "", options: ["", "", "", ""], correct_option: 0 },
    ]);

    const fetchPapers = () => {
        fetch(`${API}/api/exams`)
            .then((r) => r.json())
            .then((data) => setPapers(data.papers || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchPapers(); }, []);

    const resetForm = () => {
        setTitle("");
        setSubjectCode("");
        setQuestions([{ question_text: "", options: ["", "", "", ""], correct_option: 0 }]);
        setShowCreate(false);
        setEditingPaper(null);
        setError("");
    };

    const startEdit = (paper: Paper) => {
        setEditingPaper(paper);
        setTitle(paper.title);
        setSubjectCode(paper.subject_code);
        setQuestions(paper.questions.map((q) => ({ ...q, options: [...q.options] })));
        setShowCreate(true);
    };

    const addQuestion = () => {
        setQuestions([...questions, { question_text: "", options: ["", "", "", ""], correct_option: 0 }]);
    };

    const removeQuestion = (idx: number) => {
        if (questions.length > 1) {
            setQuestions(questions.filter((_, i) => i !== idx));
        }
    };

    const updateQuestion = (idx: number, field: string, value: any) => {
        const updated = [...questions];
        (updated[idx] as any)[field] = value;
        setQuestions(updated);
    };

    const updateOption = (qIdx: number, oIdx: number, value: string) => {
        const updated = [...questions];
        updated[qIdx].options[oIdx] = value;
        setQuestions(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validate
        for (let i = 0; i < questions.length; i++) {
            if (!questions[i].question_text.trim()) {
                setError(`Question ${i + 1} text is empty`);
                return;
            }
            for (let j = 0; j < 4; j++) {
                if (!questions[i].options[j].trim()) {
                    setError(`Question ${i + 1}, Option ${j + 1} is empty`);
                    return;
                }
            }
        }

        try {
            const body = { title, subject_code: subjectCode, questions };
            const url = editingPaper ? `${API}/api/exams/${editingPaper.id}` : `${API}/api/exams`;
            const method = editingPaper ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || "Failed to save");
            }

            resetForm();
            fetchPapers();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const deletePaper = async (id: string) => {
        if (!confirm("Delete this question paper?")) return;
        await fetch(`${API}/api/exams/${id}`, { method: "DELETE" });
        fetchPapers();
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Question Papers</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Create and manage MCQ question papers</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowCreate(true); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                >
                    <Plus className="h-4 w-4" />
                    New Paper
                </button>
            </div>

            {/* Create/Edit Modal */}
            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm pt-10 overflow-y-auto pb-10">
                    <div className="w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                            <h2 className="text-base font-semibold text-foreground">
                                {editingPaper ? "Edit Question Paper" : "Create Question Paper"}
                            </h2>
                            <button onClick={resetForm} className="p-1.5 rounded-md hover:bg-accent transition-colors">
                                <X className="h-4 w-4 text-muted-foreground" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {error && (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Paper Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. Data Structures Final"
                                        required
                                        className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Subject Code</label>
                                    <input
                                        type="text"
                                        value={subjectCode}
                                        onChange={(e) => setSubjectCode(e.target.value.toUpperCase())}
                                        placeholder="e.g. CS301"
                                        required
                                        className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary/40"
                                    />
                                </div>
                            </div>

                            {/* Questions */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-foreground">Questions ({questions.length})</h3>
                                    <button
                                        type="button"
                                        onClick={addQuestion}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        Add Question
                                    </button>
                                </div>

                                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                                    {questions.map((q, qIdx) => (
                                        <div key={qIdx} className="rounded-lg border border-border bg-secondary/30 p-4 space-y-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1">
                                                    <label className="block text-xs text-muted-foreground mb-1">
                                                        Question {qIdx + 1}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={q.question_text}
                                                        onChange={(e) => updateQuestion(qIdx, "question_text", e.target.value)}
                                                        placeholder="Enter question text"
                                                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeQuestion(qIdx)}
                                                    className="mt-5 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                {q.options.map((opt, oIdx) => (
                                                    <div key={oIdx} className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateQuestion(qIdx, "correct_option", oIdx)}
                                                            className={`flex-shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${q.correct_option === oIdx
                                                                    ? "border-success bg-success text-white"
                                                                    : "border-muted-foreground/30 hover:border-success/50"
                                                                }`}
                                                        >
                                                            {q.correct_option === oIdx && <Check className="h-3 w-3" />}
                                                        </button>
                                                        <input
                                                            type="text"
                                                            value={opt}
                                                            onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                                                            placeholder={`Option ${oIdx + 1}`}
                                                            className="flex-1 h-8 rounded-md border border-input bg-background px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-[10px] text-muted-foreground">
                                                Click the circle to mark the correct answer
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                                >
                                    {editingPaper ? "Update Paper" : "Create Paper"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Papers List */}
            {loading ? (
                <div className="text-center py-12 text-muted-foreground text-sm">Loading...</div>
            ) : papers.length === 0 ? (
                <div className="text-center py-16 rounded-xl border border-dashed border-border">
                    <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">No question papers yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Create your first question paper to get started</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {papers.map((paper) => (
                        <div key={paper.id} className="rounded-xl border border-border bg-card overflow-hidden">
                            <div
                                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-accent/30 transition-colors"
                                onClick={() => setExpandedPaper(expandedPaper === paper.id ? null : paper.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <FileText className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{paper.title}</p>
                                        <div className="flex items-center gap-3 mt-0.5">
                                            <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                                                {paper.subject_code}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {paper.question_count} questions
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); startEdit(paper); }}
                                        className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deletePaper(paper.id); }}
                                        className="p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                    {expandedPaper === paper.id ? (
                                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </div>
                            </div>

                            {expandedPaper === paper.id && (
                                <div className="border-t border-border px-5 py-4 space-y-3">
                                    {paper.questions.map((q, i) => (
                                        <div key={i} className="rounded-lg bg-secondary/40 p-3">
                                            <p className="text-sm text-foreground font-medium mb-2">
                                                {i + 1}. {q.question_text}
                                            </p>
                                            <div className="grid grid-cols-2 gap-1.5">
                                                {q.options.map((opt, j) => (
                                                    <div
                                                        key={j}
                                                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded text-xs ${j === q.correct_option
                                                                ? "bg-success/15 text-success font-medium"
                                                                : "text-muted-foreground"
                                                            }`}
                                                    >
                                                        <span className={`h-4 w-4 rounded-full border flex items-center justify-center flex-shrink-0 text-[10px] ${j === q.correct_option ? "border-success bg-success text-white" : "border-muted-foreground/30"
                                                            }`}>
                                                            {j === q.correct_option && <Check className="h-2.5 w-2.5" />}
                                                        </span>
                                                        {opt}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default QuestionPapers;
