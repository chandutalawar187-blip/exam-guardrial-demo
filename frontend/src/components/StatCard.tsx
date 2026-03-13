import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: "default" | "success" | "warning" | "destructive";
}

const accentMap = {
  default: "border-border",
  success: "border-success/30",
  warning: "border-warning/30",
  destructive: "border-destructive/30",
};

const iconBgMap = {
  default: "bg-secondary text-secondary-foreground",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

export function StatCard({ label, value, icon, accent = "default" }: StatCardProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-4 flex items-center gap-4", accentMap[accent])}>
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-md", iconBgMap[accent])}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-semibold tracking-tight text-card-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
