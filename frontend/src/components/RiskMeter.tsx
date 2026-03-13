import { cn } from "@/lib/utils";

interface RiskMeterProps {
  score: number;
  size?: "sm" | "md";
}

export function RiskMeter({ score, size = "md" }: RiskMeterProps) {
  const getColor = () => {
    if (score <= 25) return "bg-success";
    if (score <= 50) return "bg-warning";
    return "bg-destructive";
  };

  const getLabel = () => {
    if (score <= 25) return "Low";
    if (score <= 50) return "Medium";
    return "High";
  };

  return (
    <div className={cn("flex items-center gap-2", size === "sm" ? "w-20" : "w-28")}>
      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", getColor())}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
      <span className={cn(
        "font-mono text-xs tabular-nums",
        score <= 25 ? "text-success" : score <= 50 ? "text-warning" : "text-destructive"
      )}>
        {score}
      </span>
    </div>
  );
}
