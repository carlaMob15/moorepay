"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export type TaskStatus =
  | "pending_review"
  | "pending_transition_correction"
  | "pending"
  | "approved_transition"
  | "completed";

export type ActivityEntry = {
  id: string;
  timestamp: string;
  type: "correction_requested" | "name_mismatch" | "automated_verification" | "document_uploaded" | "document_approved_override";
  title: string;
  description: string;
  source: string;
  justification?: string;
};

type TaskContextType = {
  taskStatus: TaskStatus;
  setTaskStatus: (s: TaskStatus) => void;
  activityLog: ActivityEntry[];
  prependActivity: (entry: ActivityEntry) => void;
  resetActivityLog: () => void;
  justificationText: string;
  setJustificationText: (s: string) => void;
  showToast: boolean;
  toastMessage: string;
  toastDescription: string;
  showToastMessage: (message: string, description: string) => void;
  dismissToast: () => void;
  overrideModalOpen: boolean;
  setOverrideModalOpen: (open: boolean) => void;
  taskRemoved: boolean;
  setTaskRemoved: (removed: boolean) => void;
};

const initialActivityLog: ActivityEntry[] = [
  {
    id: "1",
    timestamp: "23/02/2026, 13:15",
    type: "name_mismatch",
    title: "Name mismatch detected",
    description: "Flagged for manual review: Name on passport does not match HR record.",
    source: "Verification system",
  },
  {
    id: "2",
    timestamp: "23/02/2026, 13:15",
    type: "automated_verification",
    title: "Automated verification completed",
    description: "Data extraction completed. Confidence score: 85%",
    source: "Verification system",
  },
  {
    id: "3",
    timestamp: "23/02/2026, 13:15",
    type: "document_uploaded",
    title: "Document uploaded",
    description: "Employee uploaded passport document (passport_scan.pdf)",
    source: "Verification system",
  },
];

const TaskContext = createContext<TaskContextType | null>(null);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [taskStatus, setTaskStatus] = useState<TaskStatus>("pending_review");
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>(initialActivityLog);
  const [justificationText, setJustificationText] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastDescription, setToastDescription] = useState("");
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [taskRemoved, setTaskRemoved] = useState(false);

  const prependActivity = useCallback((entry: ActivityEntry) => {
    setActivityLog((prev) => [entry, ...prev]);
  }, []);

  const resetActivityLog = useCallback(() => {
    setActivityLog(initialActivityLog);
  }, []);

  const showToastMessage = useCallback((message: string, description: string) => {
    setToastMessage(message);
    setToastDescription(description);
    setShowToast(true);
  }, []);

  const dismissToast = useCallback(() => {
    setShowToast(false);
  }, []);

  return (
    <TaskContext.Provider
      value={{
        taskStatus,
        setTaskStatus,
        activityLog,
        prependActivity,
        resetActivityLog,
        justificationText,
        setJustificationText,
        showToast,
        toastMessage,
        toastDescription,
        showToastMessage,
        dismissToast,
        overrideModalOpen,
        setOverrideModalOpen,
        taskRemoved,
        setTaskRemoved,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTask() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTask must be used within TaskProvider");
  return ctx;
}
