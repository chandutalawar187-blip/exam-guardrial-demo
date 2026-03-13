import { useEffect, useState } from "react";
import { FileText, Clock, Users, Activity, Plus, BarChart3 } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface Stats {
    total_papers: number;
    total_sessions: number;
    active_sessions: number;
    total_students: number;
    total_submissions: number;
    monitoring_sessions: number;
}

const AdminDashboard = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${API}/api/admin/stats`)
            .then((r) => r.json())
            .then(setStats)
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const quickActions = [
        { label: "Create Question Paper", icon: Plus, color: "from-blue-500 to-cyan-500", to: "/admin/papers" },
        { label: "Create Exam Session", icon: Clock, color: "from-purple-500 to-pink-500", to: "/admin/sessions" },
        { label: "Live Monitoring", icon: Activity, color: "from-emerald-500 to-green-500", to: "/admin/monitoring" },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Manage exams, sessions, and monitor students
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard
                    label="Question Papers"
                    value={loading ? "—" : stats?.total_papers || 0}
                    icon={<FileText className="h-4 w-4" />}
                    accent="success"
                />
                <StatCard
                    label="Active Sessions"
                    value={loading ? "—" : stats?.active_sessions || 0}
                    icon={<Clock className="h-4 w-4" />}
                    accent="warning"
                />
                <StatCard
                    label="Total Students"
                    value={loading ? "—" : stats?.total_students || 0}
                    icon={<Users className="h-4 w-4" />}
                />
                <StatCard
                    label="Submissions"
                    value={loading ? "—" : stats?.total_submissions || 0}
                    icon={<BarChart3 className="h-4 w-4" />}
                    accent="destructive"
                />
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {quickActions.map((action) => (
                        <button
                            key={action.label}
                            onClick={() => navigate(action.to)}
                            className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                        >
                            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${action.color} mb-3`}>
                                <action.icon className="h-5 w-5 text-white" />
                            </div>
                            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                {action.label}
                            </p>
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-border bg-card p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-2">How It Works</h3>
                    <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
                        <li>Create a <strong>Question Paper</strong> with MCQ questions and a subject code</li>
                        <li>Create an <strong>Exam Session</strong> linked to the paper with timing</li>
                        <li>Share the <strong>Session ID</strong> and <strong>Subject Code</strong> with students</li>
                        <li>Students join and take the exam — monitor activity in real-time</li>
                    </ol>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-2">Monitoring Features</h3>
                    <ul className="text-xs text-muted-foreground space-y-1.5">
                        <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-warning" /> Tab switch detection
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-destructive" /> Copy/paste detection
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-destructive" /> DevTools detection
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-destructive" /> Browser automation detection
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-success" /> Real-time credibility scoring
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
