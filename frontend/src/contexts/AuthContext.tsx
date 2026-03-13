import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
    id: string;
    name: string;
    username?: string;
    role: "admin" | "student";
}

interface StudentSession {
    session_id: string;
    subject_code: string;
    duration_minutes: number;
    monitoring_session_id: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    studentSession: StudentSession | null;
    isAdmin: boolean;
    isStudent: boolean;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<void>;
    studentJoin: (sessionId: string, subjectCode: string, studentName: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const saved = localStorage.getItem("exam_user");
        return saved ? JSON.parse(saved) : null;
    });
    const [token, setToken] = useState<string | null>(() => localStorage.getItem("exam_token"));
    const [studentSession, setStudentSession] = useState<StudentSession | null>(() => {
        const saved = localStorage.getItem("exam_student_session");
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        if (user) localStorage.setItem("exam_user", JSON.stringify(user));
        else localStorage.removeItem("exam_user");
    }, [user]);

    useEffect(() => {
        if (token) localStorage.setItem("exam_token", token);
        else localStorage.removeItem("exam_token");
    }, [token]);

    useEffect(() => {
        if (studentSession) localStorage.setItem("exam_student_session", JSON.stringify(studentSession));
        else localStorage.removeItem("exam_student_session");
    }, [studentSession]);

    const login = async (username: string, password: string) => {
        const res = await fetch(`${API}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || "Login failed");
        }
        const data = await res.json();
        setUser(data.user);
        setToken(data.token);
        setStudentSession(null);
    };

    const studentJoin = async (sessionId: string, subjectCode: string, studentName: string) => {
        const res = await fetch(`${API}/api/auth/student-join`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id: sessionId, subject_code: subjectCode, student_name: studentName }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || "Failed to join session");
        }
        const data = await res.json();
        setUser(data.user);
        setToken(data.token);
        setStudentSession(data.session);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setStudentSession(null);
        localStorage.removeItem("exam_user");
        localStorage.removeItem("exam_token");
        localStorage.removeItem("exam_student_session");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                studentSession,
                isAdmin: user?.role === "admin",
                isStudent: user?.role === "student",
                isAuthenticated: !!user,
                login,
                studentJoin,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
