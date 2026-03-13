import { AlertTriangle, AlertCircle, CheckCircle, Clock } from "lucide-react";

interface ViolationWarningProps {
    isVisible: boolean;
    warningCount: number;
    violationType: string;
    copiedText?: string;
    idleSeconds?: number;
}

export const ViolationWarning = ({
    isVisible,
    warningCount,
    violationType,
    copiedText,
    idleSeconds,
}: ViolationWarningProps) => {
    if (!isVisible) return null;

    const getSeverityColor = () => {
        if (warningCount === 1) return "bg-yellow-500/20 border-yellow-500";
        if (warningCount === 2) return "bg-orange-500/20 border-orange-500";
        return "bg-red-500/20 border-red-500";
    };

    const getSeverityIcon = () => {
        if (warningCount === 1) return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
        if (warningCount === 2) return <AlertCircle className="h-6 w-6 text-orange-500" />;
        return <AlertTriangle className="h-6 w-6 text-red-500" />;
    };

    const getWarningMessage = () => {
        const baseMsg = `Warning ${warningCount}/3: ${violationType}`;
        if (violationType === "Copy") return `${baseMsg}\nCopied: "${copiedText?.slice(0, 100) || ""}"`; 
        if (violationType === "Idle") return `${baseMsg}\nYou were inactive for ${idleSeconds} seconds`;
        return baseMsg;
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-in">
            <div
                className={`rounded-xl border-2 p-6 max-w-sm space-y-4 backdrop-blur-sm animate-bounce ${getSeverityColor()}`}
            >
                <div className="flex items-start gap-3">
                    {getSeverityIcon()}
                    <div>
                        <h3 className="font-bold text-foreground">Malpractice Detected</h3>
                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                            {getWarningMessage()}
                        </p>
                    </div>
                </div>

                {warningCount === 3 && (
                    <div className="pt-3 border-t border-border">
                        <p className="text-xs text-red-500 font-semibold">
                            ⚠️ Final Warning! Any further violations will result in mark deductions.
                        </p>
                    </div>
                )}

                <div className="text-xs text-muted-foreground">
                    Warnings: {warningCount}/3
                </div>
            </div>
        </div>
    );
};

interface CheatingDisclaimerProps {
    isVisible: boolean;
    onAcknowledge: () => void;
}

export const CheatingDisclaimer = ({
    isVisible,
    onAcknowledge,
}: CheatingDisclaimerProps) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-in">
            <div className="rounded-xl border border-red-500 bg-card p-8 max-w-lg space-y-6 shadow-2xl">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-7 w-7 text-red-500" />
                        <h2 className="text-xl font-bold text-foreground">
                            Final Notice - Cheating Prevention
                        </h2>
                    </div>
                </div>

                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 space-y-3">
                    <p className="text-sm text-foreground font-medium">
                        You have received 3 warnings for malpractice:
                    </p>
                    <ul className="space-y-2 text-xs text-muted-foreground">
                        <li className="flex items-start gap-2">
                            <span className="text-red-500 font-bold">•</span>
                            <span>Copy/Paste attempts detected</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-red-500 font-bold">•</span>
                            <span>Unauthorized key combinations blocked</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-red-500 font-bold">•</span>
                            <span>Excessive inactivity or suspicious behavior</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <p className="text-sm font-bold text-yellow-600 mb-2">⚠️ IMPORTANT:</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Any further violations will result in <span className="font-bold">1 mark deduction for each violation</span>. 
                        This is fair for all students and ensures test integrity. Please follow exam guidelines carefully.
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded" required />
                        <span className="text-xs text-muted-foreground">
                            I understand and will not attempt further malpractices
                        </span>
                    </label>
                </div>

                <button
                    onClick={onAcknowledge}
                    className="w-full py-2.5 rounded-lg bg-red-500/20 border border-red-500 text-red-500 text-sm font-medium hover:bg-red-500/30 transition-colors"
                >
                    I Acknowledge and Continue
                </button>
            </div>
        </div>
    );
};
