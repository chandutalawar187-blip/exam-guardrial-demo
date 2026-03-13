import { useState, useEffect, useCallback, useRef } from "react";

export interface MalpracticeEvent {
    type: "copy" | "paste" | "right_click" | "devtools" | "tab_switch" | "idle" | "keystroke_block";
    severity: "low" | "medium" | "high";
    text?: string;
    timestamp: Date;
}

interface ProctoringHook {
    violations: MalpracticeEvent[];
    violationCount: number;
    warningCount: number;
    marksDeducted: number;
    showWarning: boolean;
    showDisclaimer: boolean;
    copiedText: string;
    idleSeconds: number;
    isBlocked: boolean;
}

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const useExamProctoring = (monitoringId: string, onViolation?: (event: MalpracticeEvent) => void): ProctoringHook => {
    const [violations, setViolations] = useState<MalpracticeEvent[]>([]);
    const [violationCount, setViolationCount] = useState(0);
    const [warningCount, setWarningCount] = useState(0);
    const [marksDeducted, setMarksDeducted] = useState(0);
    const [showWarning, setShowWarning] = useState(false);
    const [showDisclaimer, setShowDisclaimer] = useState(false);
    const [copiedText, setCopiedText] = useState("");
    const [idleSeconds, setIdleSeconds] = useState(0);
    const [isBlocked, setIsBlocked] = useState(false);

    const idleTimerRef = useRef<NodeJS.Timeout>();
    const warningTimeoutRef = useRef<NodeJS.Timeout>();
    const lastActivityRef = useRef<number>(Date.now());

    // Send violation event to backend
    const sendViolation = useCallback((event: MalpracticeEvent) => {
        setViolations((prev) => [...prev, event]);
        setViolationCount((prev) => prev + 1);

        // After 3 warnings, start deducting marks
        if (warningCount >= 3) {
            setMarksDeducted((prev) => prev + 1);
        }

        // Send to backend
        fetch(`${API}/events`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                session_id: monitoringId,
                event_type: event.type.toUpperCase(),
                severity: event.severity.toUpperCase(),
                timestamp: event.timestamp.toISOString(),
                description: `${event.type}: ${event.text || ""}`,
                metadata: { copied_text: event.text || "" },
            }),
        }).catch(() => {});

        if (onViolation) {
            onViolation(event);
        }
    }, [monitoringId, warningCount, onViolation]);

    // Show warning dialog
    const triggerWarning = useCallback(() => {
        if (warningCount < 3) {
            setShowWarning(true);
            setWarningCount((prev) => prev + 1);

            if (warningCount === 2) {
                // On 3rd warning, show disclaimer
                warningTimeoutRef.current = setTimeout(() => {
                    setShowWarning(false);
                    setShowDisclaimer(true);
                }, 3000);
            } else {
                warningTimeoutRef.current = setTimeout(() => {
                    setShowWarning(false);
                }, 3000);
            }
        }
    }, [warningCount]);

    // ════════════════════════════════════════════════════════════
    // COPY EVENT
    // ════════════════════════════════════════════════════════════
    useEffect(() => {
        const handleCopy = (e: ClipboardEvent) => {
            if (!monitoringId) return;
            const selectedText = window.getSelection()?.toString() || "";
            
            // Prevent default copy after warning
            if (warningCount >= 3) {
                e.preventDefault();
                setIsBlocked(true);
                setTimeout(() => setIsBlocked(false), 2000);
            }

            setCopiedText(selectedText);
            const event: MalpracticeEvent = {
                type: "copy",
                severity: "high",
                text: selectedText.slice(0, 200),
                timestamp: new Date(),
            };
            sendViolation(event);
            triggerWarning();
        };

        document.addEventListener("copy", handleCopy);
        return () => document.removeEventListener("copy", handleCopy);
    }, [monitoringId, warningCount, sendViolation, triggerWarning]);

    // ════════════════════════════════════════════════════════════
    // PASTE EVENT
    // ════════════════════════════════════════════════════════════
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            if (!monitoringId) return;
            const pastedText = e.clipboardData?.getData("text") || "";

            // Block paste after 3 warnings
            if (warningCount >= 3) {
                e.preventDefault();
                setIsBlocked(true);
                setTimeout(() => setIsBlocked(false), 2000);
            }

            const event: MalpracticeEvent = {
                type: "paste",
                severity: "high",
                text: pastedText.slice(0, 200),
                timestamp: new Date(),
            };
            sendViolation(event);
            triggerWarning();
        };

        document.addEventListener("paste", handlePaste);
        return () => document.removeEventListener("paste", handlePaste);
    }, [monitoringId, warningCount, sendViolation, triggerWarning]);

    // ════════════════════════════════════════════════════════════
    // RIGHT-CLICK CONTEXT MENU
    // ════════════════════════════════════════════════════════════
    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            if (!monitoringId) return;
            e.preventDefault();

            const event: MalpracticeEvent = {
                type: "right_click",
                severity: "low",
                timestamp: new Date(),
            };
            sendViolation(event);
            triggerWarning();
        };

        document.addEventListener("contextmenu", handleContextMenu);
        return () => document.removeEventListener("contextmenu", handleContextMenu);
    }, [monitoringId, sendViolation, triggerWarning]);

    // ════════════════════════════════════════════════════════════
    // DEV TOOLS DETECTION & BLOCKING
    // ════════════════════════════════════════════════════════════
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!monitoringId) return;

            // Block common dev tools keys
            const devToolsKeys = [
                { key: "F12", code: "F12" },
                { key: "I", ctrl: true, shift: true }, // Ctrl+Shift+I
                { key: "J", ctrl: true, shift: true }, // Ctrl+Shift+J
                { key: "C", ctrl: true, shift: true }, // Ctrl+Shift+C
                { key: "K", ctrl: true, shift: true }, // Ctrl+Shift+K
            ];

            let isDevToolKey = false;

            if (e.key === "F12") {
                isDevToolKey = true;
            } else if (
                (e.ctrlKey || e.metaKey) &&
                (e.shiftKey || e.ctrlKey) &&
                ["I", "J", "C", "K"].includes(e.key.toUpperCase())
            ) {
                isDevToolKey = true;
            }

            if (isDevToolKey) {
                e.preventDefault();

                const event: MalpracticeEvent = {
                    type: "devtools",
                    severity: "high",
                    timestamp: new Date(),
                };
                sendViolation(event);
                triggerWarning();
            }

            // Block Ctrl+C and Ctrl+V
            if ((e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "C")) {
                if (warningCount >= 3) {
                    e.preventDefault();
                    setIsBlocked(true);
                    setTimeout(() => setIsBlocked(false), 2000);
                }
            }

            if ((e.ctrlKey || e.metaKey) && (e.key === "v" || e.key === "V")) {
                if (warningCount >= 3) {
                    e.preventDefault();
                    setIsBlocked(true);
                    setTimeout(() => setIsBlocked(false), 2000);
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [monitoringId, warningCount, sendViolation, triggerWarning]);

    // ════════════════════════════════════════════════════════════
    // TAB SWITCH DETECTION
    // ════════════════════════════════════════════════════════════
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!monitoringId) return;

            if (document.hidden) {
                const event: MalpracticeEvent = {
                    type: "tab_switch",
                    severity: "medium",
                    timestamp: new Date(),
                };
                sendViolation(event);
                triggerWarning();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [monitoringId, sendViolation, triggerWarning]);

    // ════════════════════════════════════════════════════════════
    // IDLE TIME DETECTION (30 seconds)
    // ════════════════════════════════════════════════════════════
    useEffect(() => {
        const handleActivity = () => {
            lastActivityRef.current = Date.now();
            setIdleSeconds(0);
        };

        const checkIdle = setInterval(() => {
            const now = Date.now();
            const elapsed = Math.floor((now - lastActivityRef.current) / 1000);
            setIdleSeconds(elapsed);

            // Warn after 30 seconds of inactivity
            if (elapsed === 30 || (elapsed > 30 && elapsed % 30 === 0)) {
                const event: MalpracticeEvent = {
                    type: "idle",
                    severity: "medium",
                    text: `${elapsed} seconds idle`,
                    timestamp: new Date(),
                };
                sendViolation(event);
                triggerWarning();
            }
        }, 1000);

        // Reset timer on activity
        const events = ["mousedown", "keydown", "scroll", "touchstart"];
        events.forEach((event) => {
            document.addEventListener(event, handleActivity, true);
        });

        return () => {
            clearInterval(checkIdle);
            events.forEach((event) => {
                document.removeEventListener(event, handleActivity, true);
            });
        };
    }, [sendViolation, triggerWarning]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
        };
    }, []);

    return {
        violations,
        violationCount,
        warningCount,
        marksDeducted,
        showWarning,
        showDisclaimer,
        copiedText,
        idleSeconds,
        isBlocked,
    };
};
