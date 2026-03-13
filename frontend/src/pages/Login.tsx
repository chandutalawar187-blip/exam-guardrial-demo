import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, LogIn, GraduationCap, Loader, AlertCircle } from "lucide-react";

const Login = () => {
    const [tab, setTab] = useState<"admin" | "student">("student");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login, studentJoin } = useAuth();
    const navigate = useNavigate();

    // Admin fields
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    // Student fields
    const [sessionId, setSessionId] = useState("");
    const [subjectCode, setSubjectCode] = useState("");
    const [studentName, setStudentName] = useState("");

    const handleAdminLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await login(username, password);
            navigate("/admin");
        } catch (err: any) {
            setError(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const handleStudentJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await studentJoin(sessionId, subjectCode, studentName);
            navigate("/student/exam");
        } catch (err: any) {
            setError(err.message || "Failed to join session");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(225,20%,5%)] via-[hsl(230,15%,8%)] to-[hsl(220,20%,6%)]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-b from-primary/8 to-transparent blur-3xl" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-t from-purple-500/5 to-transparent blur-3xl" />

            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 rounded-full bg-primary/20 animate-pulse"
                        style={{
                            left: `${15 + i * 15}%`,
                            top: `${20 + (i % 3) * 25}%`,
                            animationDelay: `${i * 0.5}s`,
                            animationDuration: `${2 + i * 0.5}s`,
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 w-full max-w-md px-6">
                {/* Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 mb-4">
                        <Shield className="h-7 w-7 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">Exam Guardrail</h1>
                    <p className="text-sm text-muted-foreground mt-1">Secure Examination Platform</p>
                </div>

                {/* Card */}
                <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-2xl shadow-black/20 overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-border">
                        <button
                            onClick={() => { setTab("student"); setError(""); }}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors ${tab === "student"
                                    ? "text-primary border-b-2 border-primary bg-primary/5"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <GraduationCap className="h-4 w-4" />
                            Student Access
                        </button>
                        <button
                            onClick={() => { setTab("admin"); setError(""); }}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors ${tab === "admin"
                                    ? "text-primary border-b-2 border-primary bg-primary/5"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <LogIn className="h-4 w-4" />
                            Admin Login
                        </button>
                    </div>

                    <div className="p-6">
                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Student Form */}
                        {tab === "student" && (
                            <form onSubmit={handleStudentJoin} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                        Your Name
                                    </label>
                                    <input
                                        type="text"
                                        value={studentName}
                                        onChange={(e) => setStudentName(e.target.value)}
                                        placeholder="Enter your full name"
                                        required
                                        className="w-full h-10 rounded-lg border border-input bg-background/60 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                        Session ID
                                    </label>
                                    <input
                                        type="text"
                                        value={sessionId}
                                        onChange={(e) => setSessionId(e.target.value)}
                                        placeholder="e.g. SESSION-DEMO01"
                                        required
                                        className="w-full h-10 rounded-lg border border-input bg-background/60 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                        Subject Code
                                    </label>
                                    <input
                                        type="text"
                                        value={subjectCode}
                                        onChange={(e) => setSubjectCode(e.target.value.toUpperCase())}
                                        placeholder="e.g. CS301"
                                        required
                                        className="w-full h-10 rounded-lg border border-input bg-background/60 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all font-mono uppercase"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-10 rounded-lg bg-gradient-to-r from-primary to-blue-500 text-primary-foreground text-sm font-medium
                    hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50
                    transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                                >
                                    {loading ? <Loader className="h-4 w-4 animate-spin" /> : <GraduationCap className="h-4 w-4" />}
                                    {loading ? "Joining..." : "Join Exam"}
                                </button>
                            </form>
                        )}

                        {/* Admin Form */}
                        {tab === "admin" && (
                            <form onSubmit={handleAdminLogin} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="admin"
                                        required
                                        className="w-full h-10 rounded-lg border border-input bg-background/60 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full h-10 rounded-lg border border-input bg-background/60 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-10 rounded-lg bg-gradient-to-r from-primary to-blue-500 text-primary-foreground text-sm font-medium
                    hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50
                    transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                                >
                                    {loading ? <Loader className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                                    {loading ? "Signing in..." : "Sign In"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                <p className="text-center text-xs text-muted-foreground mt-6 opacity-60">
                    Exam Guardrail Platform v2.0
                </p>
            </div>
        </div>
    );
};

export default Login;
