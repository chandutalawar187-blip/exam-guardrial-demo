import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
    LayoutDashboard,
    FileText,
    Clock,
    Monitor,
    LogOut,
    Shield,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const adminLinks = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/admin/papers", label: "Question Papers", icon: FileText },
    { to: "/admin/sessions", label: "Exam Sessions", icon: Clock },
    { to: "/admin/monitoring", label: "Live Monitoring", icon: Monitor },
];

export function AppSidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <aside
            className={cn(
                "flex flex-col border-r border-border bg-sidebar-background transition-all duration-200",
                collapsed ? "w-16" : "w-56"
            )}
        >
            {/* Logo */}
            <div className="flex items-center gap-2 px-4 py-4 border-b border-sidebar-border">
                <Shield className="h-5 w-5 text-sidebar-primary flex-shrink-0" />
                {!collapsed && (
                    <span className="font-semibold text-sm text-sidebar-foreground whitespace-nowrap">
                        Exam Guardrail
                    </span>
                )}
            </div>

            {/* Nav Links */}
            <nav className="flex-1 py-3 space-y-0.5 px-2">
                {adminLinks.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.end}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                                isActive
                                    ? "bg-sidebar-accent text-sidebar-primary font-medium"
                                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            )
                        }
                    >
                        <link.icon className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && <span>{link.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="border-t border-sidebar-border p-3 space-y-2">
                {!collapsed && (
                    <div className="px-2 mb-2">
                        <p className="text-xs text-sidebar-foreground font-medium truncate">
                            {user?.name || "Admin"}
                        </p>
                        <p className="text-xs text-muted-foreground">Administrator</p>
                    </div>
                )}
                <div className="flex items-center justify-between gap-1">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        {!collapsed && "Logout"}
                    </button>
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-1.5 rounded-md text-muted-foreground hover:bg-sidebar-accent transition-colors"
                    >
                        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
                    </button>
                </div>
            </div>
        </aside>
    );
}
