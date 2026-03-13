import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionApi, eventApi, healthCheck } from "@/lib/api";
import type { ExamSession } from "@/lib/exam-types";

// Query keys for React Query
const queryKeys = {
  sessions: ["sessions"] as const,
  session: (id: string) => ["session", id] as const,
  report: (id: string) => ["report", id] as const,
  health: ["health"] as const,
};

/**
 * Fetch all exam sessions
 */
export const useSessions = () => {
  return useQuery({
    queryKey: queryKeys.sessions,
    queryFn: () => sessionApi.getAllSessions(),
    staleTime: 5 * 1000, // 5 seconds
    retry: 2,
  });
};

/**
 * Fetch a specific session
 */
export const useSession = (sessionId: string) => {
  return useQuery({
    queryKey: queryKeys.session(sessionId),
    queryFn: () => sessionApi.getSession(sessionId),
    enabled: !!sessionId,
    staleTime: 3 * 1000, // 3 seconds
    retry: 2,
  });
};

/**
 * Fetch credibility report
 */
export const useSessionReport = (sessionId: string) => {
  return useQuery({
    queryKey: queryKeys.report(sessionId),
    queryFn: () => sessionApi.getReport(sessionId),
    enabled: !!sessionId,
    staleTime: 3 * 1000,
    retry: 2,
  });
};

/**
 * Check backend health
 */
export const useHealthCheck = () => {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () => healthCheck(),
    staleTime: 10 * 1000, // 10 seconds
    retry: 1,
  });
};

/**
 * Create a new session mutation
 */
export const useCreateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      studentName,
      studentEmail,
      examTitle,
    }: {
      sessionId: string;
      studentName: string;
      studentEmail: string;
      examTitle: string;
    }) =>
      sessionApi.createSession(sessionId, studentName, studentEmail, examTitle),
    onSuccess: () => {
      // Invalidate sessions query to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
    },
  });
};

/**
 * Update session status mutation
 */
export const useUpdateSessionStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      status,
    }: {
      sessionId: string;
      status: "completed" | "terminated";
    }) => sessionApi.updateSessionStatus(sessionId, status),
    onSuccess: (_, { sessionId }) => {
      // Invalidate specific session and sessions list
      queryClient.invalidateQueries({ queryKey: queryKeys.session(sessionId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
    },
  });
};

/**
 * Submit a cheating detection event mutation
 */
export const useSubmitEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      eventType,
      severity,
      description,
    }: {
      sessionId: string;
      eventType: string;
      severity: string;
      description?: string;
    }) => eventApi.submitEvent(sessionId, eventType, severity, description),
    onSuccess: (_, { sessionId }) => {
      // Invalidate session and report queries
      queryClient.invalidateQueries({ queryKey: queryKeys.session(sessionId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.report(sessionId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
    },
  });
};
