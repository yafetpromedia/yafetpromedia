"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ConsultationSession } from "@/lib/project-consultant-engine";
import type {
  ConsultantApiResponse,
  ProjectBrief,
} from "@/lib/project-consultant.shared";
import type { ProjectModel } from "@/lib/project-model";
import { emptyProjectModel } from "@/lib/project-model";

export type HubMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type SendPayload = {
  action?:
    | "start"
    | "message"
    | "select"
    | "skip_contact"
    | "request_brief"
    | "approve_recommendation"
    | "reject_recommendation"
    | "resume";
  message?: string;
  selections?: string[];
  recommendationId?: string;
};

type ConsultantSessionContextValue = {
  sessionId: string;
  session: ConsultationSession | null;
  project: ProjectModel;
  messages: HubMessage[];
  brief: ProjectBrief | null;
  loading: boolean;
  error: string;
  choices: ConsultantApiResponse["choices"];
  multiSelect: boolean;
  briefEmailed: boolean;
  providerError: boolean;
  ensureStarted: () => Promise<void>;
  send: (payload: SendPayload) => Promise<void>;
  reset: () => Promise<void>;
  clearError: () => void;
};

const STORAGE_KEY = "awud-consultant-session-id";

const ConsultantSessionContext = createContext<ConsultantSessionContextValue | null>(null);

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readStoredSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    return sessionStorage.getItem(STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

function writeStoredSessionId(id: string) {
  if (typeof window === "undefined") return;
  try {
    if (id) sessionStorage.setItem(STORAGE_KEY, id);
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function ConsultantSessionProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState("");
  const [session, setSession] = useState<ConsultationSession | null>(null);
  const [project, setProject] = useState<ProjectModel>(emptyProjectModel);
  const [messages, setMessages] = useState<HubMessage[]>([]);
  const [brief, setBrief] = useState<ProjectBrief | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [choices, setChoices] = useState<ConsultantApiResponse["choices"]>([]);
  const [multiSelect, setMultiSelect] = useState(false);
  const [briefEmailed, setBriefEmailed] = useState(false);
  const [providerError, setProviderError] = useState(false);
  const startedRef = useRef(false);
  const inFlightRef = useRef(false);

  const applyResponse = useCallback(
    (
      data: ConsultantApiResponse & {
        session?: ConsultationSession;
        clientBriefEmailed?: boolean;
        project?: ProjectModel;
        error?: string;
      },
      opts?: { skipAssistantMessage?: boolean }
    ) => {
      if (data.sessionId) {
        setSessionId(data.sessionId);
        writeStoredSessionId(data.sessionId);
      }
      if (data.session) setSession(data.session);
      if (data.project) setProject(data.project);
      setChoices(data.choices ?? []);
      setMultiSelect(Boolean(data.multiSelect));
      setProviderError(Boolean(data.providerError));
      if (data.brief) setBrief(data.brief);
      if (typeof data.clientBriefEmailed === "boolean") setBriefEmailed(data.clientBriefEmailed);
      if (data.error) setError(data.error);
      if (data.reply && !opts?.skipAssistantMessage) {
        setMessages((prev) => [...prev, { id: uid(), role: "assistant", content: data.reply }]);
      }
    },
    []
  );

  const send = useCallback(
    async (payload: SendPayload) => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      setLoading(true);
      setError("");
      setProviderError(false);
      try {
        const response = await fetch("/api/project-consultant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionId || readStoredSessionId() || undefined,
            ...payload,
          }),
        });
        const data = (await response.json()) as ConsultantApiResponse & {
          session?: ConsultationSession;
          project?: ProjectModel;
          error?: string;
          clientBriefEmailed?: boolean;
        };
        if (!response.ok && !data.reply) {
          throw new Error(data.error ?? "Request failed");
        }
        applyResponse(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
        setProviderError(true);
      } finally {
        setLoading(false);
        inFlightRef.current = false;
      }
    },
    [applyResponse, sessionId]
  );

  const ensureStarted = useCallback(async () => {
    if (startedRef.current) return;
    startedRef.current = true;
    const stored = readStoredSessionId();
    if (stored) {
      setSessionId(stored);
      setLoading(true);
      try {
        const response = await fetch("/api/project-consultant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: stored, action: "resume" }),
        });
        const data = (await response.json()) as ConsultantApiResponse & {
          session?: ConsultationSession;
          project?: ProjectModel;
        };
        if (response.ok && data.session) {
          applyResponse(data, { skipAssistantMessage: true });
          const history = data.session.requirements.conversationHistory ?? [];
          if (history.length) {
            setMessages(
              history.map((m) => ({
                id: uid(),
                role: m.role,
                content: m.content,
              }))
            );
          } else if (data.reply) {
            setMessages([{ id: uid(), role: "assistant", content: data.reply }]);
          }
          return;
        }
      } catch {
        /* fall through to start */
      } finally {
        setLoading(false);
      }
    }
    await send({ action: "start" });
  }, [applyResponse, send]);

  const reset = useCallback(async () => {
    startedRef.current = false;
    writeStoredSessionId("");
    setSessionId("");
    setSession(null);
    setProject(emptyProjectModel());
    setMessages([]);
    setBrief(null);
    setChoices([]);
    setBriefEmailed(false);
    setError("");
    setProviderError(false);
    startedRef.current = true;
    await send({ action: "start" });
  }, [send]);

  const value = useMemo<ConsultantSessionContextValue>(
    () => ({
      sessionId,
      session,
      project,
      messages,
      brief,
      loading,
      error,
      choices,
      multiSelect,
      briefEmailed,
      providerError,
      ensureStarted,
      send: async (payload) => {
        if (payload.message?.trim()) {
          setMessages((prev) => [
            ...prev,
            { id: uid(), role: "user", content: payload.message!.trim() },
          ]);
        } else if (payload.selections?.length) {
          setMessages((prev) => [
            ...prev,
            { id: uid(), role: "user", content: payload.selections!.join(", ") },
          ]);
        }
        await send(payload);
      },
      reset,
      clearError: () => setError(""),
    }),
    [
      sessionId,
      session,
      project,
      messages,
      brief,
      loading,
      error,
      choices,
      multiSelect,
      briefEmailed,
      providerError,
      ensureStarted,
      send,
      reset,
    ]
  );

  return (
    <ConsultantSessionContext.Provider value={value}>{children}</ConsultantSessionContext.Provider>
  );
}

export function useConsultantSession() {
  const ctx = useContext(ConsultantSessionContext);
  if (!ctx) throw new Error("useConsultantSession must be used within ConsultantSessionProvider");
  return ctx;
}
