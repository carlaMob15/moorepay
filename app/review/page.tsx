"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTask, type ActivityEntry } from "../context/TaskContext";

function getHeaderTitle(status: string): string {
  if (status === "completed") return "Task completed";
  if (status === "pending") return "Task pending";
  return "Task review";
}

export default function ReviewPage() {
  const router = useRouter();
  const {
    taskStatus,
    setTaskStatus,
    activityLog,
    prependActivity,
    justificationText,
    setJustificationText,
    showToast,
    toastMessage,
    toastDescription,
    showToastMessage,
    dismissToast,
    overrideModalOpen,
    setOverrideModalOpen,
    setTaskRemoved,
    resetActivityLog,
  } = useTask();

  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showTransitionLoader, setShowTransitionLoader] = useState(false);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    };
  }, []);

  const handleRequestCorrection = () => {
    setShowTransitionLoader(true);
    prependActivity({
      id: "correction-" + Date.now(),
      timestamp: "23/02/2026, 13:15",
      type: "correction_requested",
      title: "Correction requested",
      description: "Administrator requested employee to resubmit documentation with correct information.",
      source: "Admin user",
    });
    setTaskStatus("pending_transition_correction");
    showToastMessage("Correction request sent to employee", "The employee will be notified to resubmit their document.");
    transitionTimeoutRef.current = setTimeout(() => {
      setTaskStatus("pending");
      setShowTransitionLoader(false);
      transitionTimeoutRef.current = null;
    }, 800);
  };

  const handleOverrideConfirm = () => {
    if (!justificationText.trim()) return;
    setOverrideModalOpen(false);
    setJustificationText("");
    setShowTransitionLoader(true);
    prependActivity({
      id: "override-" + Date.now(),
      timestamp: "23/02/2026, 13:15",
      type: "document_approved_override",
      title: "Document approved (override)",
      description: `Administrator approved document despite mismatch. Justification: "${justificationText.trim()}"`,
      source: "Admin user",
      justification: justificationText.trim(),
    });
    setTaskStatus("approved_transition");
    showToastMessage("Document approved", "The document has been approved and the employee record updated.");
    transitionTimeoutRef.current = setTimeout(() => {
      setTaskStatus("completed");
      setShowTransitionLoader(false);
      transitionTimeoutRef.current = null;
    }, 800);
  };

  const handleReturnToTaskQueue = () => {
    setTaskRemoved(true);
    setTaskStatus("pending_review");
    resetActivityLog();
    setJustificationText("");
    router.push("/");
  };

  const showDefaultReviewContent =
    taskStatus === "pending_review" ||
    taskStatus === "pending_transition_correction" ||
    taskStatus === "approved_transition";

  const badgeLabel =
    taskStatus === "pending_review"
      ? "PENDING REVIEW"
      : taskStatus === "pending_transition_correction" || taskStatus === "pending"
        ? "PENDING"
        : taskStatus === "approved_transition" || taskStatus === "completed"
          ? "APPROVED"
          : "PENDING REVIEW";

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#1A1A1A" }}>
      <header
        className="flex items-center h-12 px-4"
        style={{ backgroundColor: "#1F2228", color: "#FFFFFF", fontSize: "14px" }}
      >
        {getHeaderTitle(taskStatus)}
      </header>

      <div className="flex flex-1">
        <div
          className="flex-1 flex flex-col"
          style={{ backgroundColor: taskStatus === "pending" || taskStatus === "completed" ? "#F7F8FA" : "#F8F8F8" }}
        >
          {taskStatus === "pending" || taskStatus === "completed" ? (
            <div
              className="flex-1 flex"
              style={{
                animation: "pageDissolveIn 200ms ease-out",
              }}
            >
              {taskStatus === "pending" && (
                <TaskPendingContent onReturnToTaskQueue={handleReturnToTaskQueue} />
              )}
              {taskStatus === "completed" && (
                <TaskCompletedContent onReturnToTaskQueue={handleReturnToTaskQueue} />
              )}
            </div>
          ) : (
            <>
              <div className="flex-1 flex min-w-0">
                <div className="flex-1 p-6 min-w-0">
                <div className="max-w-4xl">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1 mb-2 text-sm"
                    style={{ color: "#6B7280" }}
                  >
                    <img src="/images/arrow%20left.svg" alt="" className="w-4 h-4 shrink-0" aria-hidden />
                    Back
                  </Link>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h1 className="text-2xl font-semibold mb-1" style={{ color: "#1F2937" }}>
                        Document review
                      </h1>
                      <p className="text-sm" style={{ color: "#6B7280" }}>
                        Flagged for manual verification. The system detected a potential mismatch. Human review required.
                      </p>
                    </div>
                    <span
                      className="px-3 py-1.5 rounded text-xs font-semibold shrink-0 inline-flex items-center gap-1"
                      style={{
                        backgroundColor: badgeLabel === "PENDING REVIEW" ? "#D8D8DA" : badgeLabel === "PENDING" ? "#F3F4F6" : "#22C55E",
                        color: badgeLabel === "APPROVED" ? "#FFFFFF" : "#1F2937",
                      }}
                    >
                      {badgeLabel === "APPROVED" && (
                        <img src="/images/tick.svg" alt="" className="w-4 h-4 shrink-0" aria-hidden />
                      )}
                      {badgeLabel}
                    </span>
                  </div>

                  {showDefaultReviewContent && (
                    <>
                      <div
                        className="rounded-md border p-3 mb-4 flex items-center gap-2"
                        style={{ backgroundColor: "#FFFBEB", borderColor: "#FBBF24" }}
                      >
                        <img src="/images/warning.svg" alt="" className="w-5 h-5 shrink-0" aria-hidden />
                        <span style={{ color: "#1F2937" }}>
                          Name does not match HR record. Requires verification
                        </span>
                      </div>

                      <div
                        className="rounded-lg border p-4 mb-6"
                        style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
                      >
                        <div className="flex gap-4">
                          <div className="w-40 h-28 rounded overflow-hidden shrink-0 bg-[#D1D5DB]">
                            <img
                              src="/images/passport.jpg?v=2"
                              alt="Passport document"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium" style={{ color: "#1F2937" }}>
                                Confidence: 75%
                              </span>
                              <div className="flex-1 h-2 rounded max-w-[120px]" style={{ backgroundColor: "#E5E7EB" }}>
                                <div className="h-full rounded" style={{ width: "75%", backgroundColor: "#F59E0B" }} />
                              </div>
                            </div>
                            <p className="text-sm mb-2" style={{ color: "#1F2937" }}>
                              Reason for flag: Name does not match HR record
                            </p>
                            <p className="text-sm font-medium mb-1" style={{ color: "#1F2937" }}>Passport.pdf</p>
                            <p className="text-xs mb-1" style={{ color: "#6B7280" }}>Uploaded: 19 Feb 2026, 09:15</p>
                            <p className="text-xs mb-1" style={{ color: "#6B7280" }}>Source: Employee upload portal</p>
                            <p className="text-xs mb-2" style={{ color: "#6B7280" }}>File size: 2.4 MB</p>
                            <div className="flex gap-2">
                              <button
                                className="px-3 py-1.5 rounded border text-sm inline-flex items-center gap-1.5"
                                style={{ backgroundColor: "#F3F4F6", borderColor: "#D1D5DB", color: "#374151" }}
                              >
                                <img src="/images/download.svg" alt="" className="w-4 h-4" aria-hidden />
                                Download
                              </button>
                              <button
                                className="px-3 py-1.5 rounded border text-sm inline-flex items-center gap-1.5"
                                style={{ backgroundColor: "#F3F4F6", borderColor: "#D1D5DB", color: "#374151" }}
                              >
                                <img src="/images/full%20view.svg" alt="" className="w-4 h-4" aria-hidden />
                                Full view
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <h3 className="text-base font-semibold mb-3" style={{ color: "#1F2937" }}>
                        Data comparison
                      </h3>
                      <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                          <p className="text-sm mb-2" style={{ color: "#6B7280" }}>Extracted data from document</p>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center justify-between gap-2">
                              <span style={{ color: "#1F2937" }}>Full Name:</span>
                              <span className="font-medium flex items-center gap-1">
                                Angela Zoe Test
                                <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: "#FFF3CD", color: "#92400E" }}>Mismatch</span>
                              </span>
                            </li>
                            <li style={{ color: "#1F2937" }}>Date of birth: 14 March 1988</li>
                            <li style={{ color: "#1F2937" }}>Document number: 1234567890</li>
                            <li style={{ color: "#1F2937" }}>Expiry date: 13 April 2028</li>
                            <li style={{ color: "#1F2937" }}>Nationality: United Kingdom</li>
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm mb-2" style={{ color: "#6B7280" }}>HR record</p>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center justify-between gap-2">
                              <span style={{ color: "#1F2937" }}>Full Name:</span>
                              <span className="font-medium flex items-center gap-1">
                                Angela Z. Smith
                                <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: "#FFF3CD", color: "#92400E" }}>Mismatch</span>
                              </span>
                            </li>
                            <li style={{ color: "#1F2937" }}>Date of birth: 14 March 1988</li>
                            <li style={{ color: "#1F2937" }}>Document number: -</li>
                            <li style={{ color: "#1F2937" }}>Expiry date: -</li>
                            <li style={{ color: "#1F2937" }}>Nationality: United Kingdom</li>
                          </ul>
                        </div>
                      </div>

                      <h3 className="text-base font-semibold mb-2" style={{ color: "#1F2937" }}>
                        Actions
                      </h3>
                      <div className="flex gap-3">
                        <button
                          onClick={handleRequestCorrection}
                          className="px-4 py-2 rounded border text-sm font-medium"
                          style={{ backgroundColor: "#FFFFFF", borderColor: "#1070B7", color: "#1070B7" }}
                        >
                          Request Correction
                        </button>
                        <button
                          onClick={() => setOverrideModalOpen(true)}
                          className="px-4 py-2 rounded text-sm font-medium"
                          style={{ backgroundColor: "#1070B7", color: "#FFFFFF" }}
                        >
                          Override and Approve
                        </button>
                      </div>
                    </>
                  )}
                </div>
                </div>
                <ActivityLogSidebar activityLog={activityLog} badgeLabel={badgeLabel} />
              </div>
            </>
          )}
        </div>
      </div>

      {showTransitionLoader && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{
            backgroundColor: "rgba(0,0,0,0.4)",
            animation: "fadeIn 200ms ease-out",
          }}
        >
          <div
            className="w-12 h-12 rounded-full border-4 border-t-transparent"
            style={{
              borderColor: "#1070B7",
              borderTopColor: "transparent",
              animation: "spin 0.8s linear infinite",
            }}
          />
        </div>
      )}

      {overrideModalOpen && (
        <OverrideModal
          justificationText={justificationText}
          setJustificationText={setJustificationText}
          onConfirm={handleOverrideConfirm}
          onCancel={() => setOverrideModalOpen(false)}
        />
      )}

      {showToast && (
        <Toast
          message={toastMessage}
          description={toastDescription}
          onDismiss={dismissToast}
        />
      )}
    </div>
  );
}

function TaskPendingContent({ onReturnToTaskQueue }: { onReturnToTaskQueue: () => void }) {
  const { activityLog } = useTask();
  return (
    <>
      <div className="flex-1 p-6">
        <Link href="/" className="inline-flex items-center gap-1 mb-2 text-sm" style={{ color: "#6B7280" }}>
          <img src="/images/arrow%20left.svg" alt="" className="w-4 h-4 shrink-0" aria-hidden />
          Back
        </Link>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-semibold mb-1" style={{ color: "#1F2937" }}>
              Document review
            </h1>
            <p className="text-sm" style={{ color: "#6B7280" }}>
              Flagged for manual verification. The system detected a potential mismatch. Human review required.
            </p>
          </div>
          <span
            className="px-3 py-1.5 rounded text-xs font-semibold shrink-0"
            style={{ backgroundColor: "#D8D8DA", color: "#1F2937" }}
          >
            PENDING
          </span>
        </div>

        <div className="flex flex-col items-center py-12 text-center max-w-lg mx-auto">
          <div className="mb-4" style={{ color: "#1070B7" }}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: "#1F2937" }}>
            Go and put the kettle on
          </h2>
          <p className="text-base mb-6" style={{ color: "#6B7280" }}>
            A request has been sent to Angela Zoe Test to resubmit their passport with updated information. You&apos;ll be notified once a new document is uploaded. In the mean time enjoy a cup of tea.
          </p>
          <button
            onClick={onReturnToTaskQueue}
            className="px-6 py-3 rounded font-medium"
            style={{ backgroundColor: "#1070B7", color: "#FFFFFF" }}
          >
            Return to task queue
          </button>
        </div>

        <div
          className="rounded-lg border p-4 max-w-2xl"
          style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <div className="flex gap-4">
            <div className="w-40 h-28 rounded overflow-hidden shrink-0 bg-[#D1D5DB]">
              <img src="/images/passport.jpg?v=2" alt="Passport document" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold" style={{ color: "#1F2937" }}>Passport.pdf</span>
                <span className="px-2 py-0.5 rounded text-xs flex items-center gap-1" style={{ backgroundColor: "#F3F4F6", color: "#6B7280" }}>
                  <img src="/images/clock.svg" alt="" className="w-3.5 h-3.5" aria-hidden />
                  PENDING
                </span>
              </div>
              <p className="text-sm mb-1" style={{ color: "#1F2937" }}>Confidence: 75% (medium)</p>
              <p className="text-sm mb-1" style={{ color: "#1F2937" }}>Issue: Name mismatch</p>
              <p className="text-sm mb-1" style={{ color: "#1F2937" }}>Action taken: Correction requested</p>
              <p className="text-sm" style={{ color: "#1F2937" }}>Requested by: Admin user</p>
            </div>
          </div>
        </div>
      </div>
      <ActivityLogSidebar activityLog={activityLog} badgeLabel="PENDING" />
    </>
  );
}

function TaskCompletedContent({ onReturnToTaskQueue }: { onReturnToTaskQueue: () => void }) {
  const { activityLog } = useTask();
  return (
    <>
      <div className="flex-1 p-6">
        <Link href="/" className="inline-flex items-center gap-1 mb-2 text-sm" style={{ color: "#6B7280" }}>
          <img src="/images/arrow%20left.svg" alt="" className="w-4 h-4 shrink-0" aria-hidden />
          Back
        </Link>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-semibold mb-1" style={{ color: "#333333" }}>
              Document review
            </h1>
            <p className="text-sm" style={{ color: "#6B7280" }}>
              Flagged for manual verification. The system detected a potential mismatch. Human review required.
            </p>
          </div>
          <span
            className="px-3 py-1.5 rounded text-xs font-semibold shrink-0 inline-flex items-center gap-1"
            style={{ backgroundColor: "#22C55E", color: "#FFFFFF" }}
          >
            <img src="/images/tick.svg" alt="" className="w-4 h-4 shrink-0" aria-hidden />
            APPROVED
          </span>
        </div>

        <div className="flex flex-col items-center py-12 text-center max-w-lg mx-auto">
          <div className="mb-4 w-20 h-20 flex items-center justify-center">
            <img src="/images/tick.svg" alt="" className="w-full h-full object-contain" aria-hidden />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: "#333333" }}>
            Document approved
          </h2>
          <p className="text-base mb-1" style={{ color: "#333333" }}>
            Great! Angela Zoe Test&apos;s passport has been approved.
          </p>
          <p className="text-base mb-6" style={{ color: "#333333" }}>
            Onboarding can now proceed.
          </p>
          <button
            onClick={onReturnToTaskQueue}
            className="px-6 py-3 rounded font-medium"
            style={{ backgroundColor: "#3B82F6", color: "#FFFFFF" }}
          >
            Return to task queue
          </button>
        </div>

        <div
          className="rounded-lg border p-4 max-w-2xl"
          style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <div className="flex gap-4">
            <div className="w-40 h-28 rounded overflow-hidden shrink-0 bg-[#D1D5DB]">
              <img src="/images/passport.jpg?v=2" alt="Passport document" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold" style={{ color: "#333333" }}>Passport.pdf</span>
                <span className="px-2 py-0.5 rounded text-xs inline-flex items-center gap-1" style={{ backgroundColor: "#22C55E", color: "#FFFFFF" }}>
                  <img src="/images/tick.svg" alt="" className="w-3.5 h-3.5 shrink-0" aria-hidden />
                  APPROVED
                </span>
              </div>
              <p className="text-sm mb-1" style={{ color: "#333333" }}>Resolution: Approved. Verified against HR record</p>
              <p className="text-sm mb-1" style={{ color: "#333333" }}>Override and approved by: Admin user</p>
              <p className="text-sm mb-1" style={{ color: "#333333" }}>Override reference ID: VER-2026-1847</p>
              <p className="text-sm" style={{ color: "#333333" }}>
                Reason: Recent marriage. Passport reflects previous surname. Employee has confirmed name change documentation is in progress.
              </p>
            </div>
          </div>
        </div>
      </div>
      <ActivityLogSidebar activityLog={activityLog} badgeLabel="APPROVED" />
    </>
  );
}

function ActivityLogSidebar({ activityLog, badgeLabel }: { activityLog: ActivityEntry[]; badgeLabel: string }) {
  return (
    <aside
      className="w-80 shrink-0 p-6 border-l"
      style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold" style={{ color: "#1F2937", fontSize: "18px" }}>
          Activity log
        </h3>
        {(badgeLabel === "PENDING REVIEW" || badgeLabel === "PENDING") && (
          <span
            className="px-2 py-1 rounded text-xs"
            style={{ backgroundColor: "#D8D8DA", color: "#1F2937" }}
          >
            {badgeLabel}
          </span>
        )}
      </div>
      <ul className="space-y-4">
        {activityLog.map((entry) => (
          <li key={entry.id} className="text-sm">
            <p className="mb-1" style={{ color: "#6B7280", fontSize: "12px" }}>{entry.timestamp}</p>
            <div className="flex gap-2">
              <span>{getActivityIcon(entry.type)}</span>
              <div>
                <p className="font-semibold mb-0.5" style={{ color: "#1F2937" }}>{entry.title}</p>
                <p className="text-sm mb-1" style={{ color: "#6B7280" }}>{entry.description}</p>
                <span
                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs"
                  style={{
                    backgroundColor: entry.source === "Admin user" ? "#E5E7EB" : "#E0F2FE",
                    color: entry.source === "Admin user" ? "#6B7280" : "#3B82F6",
                  }}
                >
                  {entry.source === "Admin user" ? (
                    <img src="/images/admin.svg" alt="" className="w-3.5 h-3.5 shrink-0" aria-hidden />
                  ) : (
                    <img src="/images/system.svg" alt="" className="w-3.5 h-3.5 shrink-0" aria-hidden />
                  )}
                  {entry.source}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function getActivityIcon(type: ActivityEntry["type"]) {
  const iconClass = "w-6 h-6 shrink-0 rounded-full flex items-center justify-center p-1";
  switch (type) {
    case "correction_requested":
      return (
        <span className={iconClass} style={{ backgroundColor: "#DC2626" }}>
          <img src="/images/error.svg" alt="" className="w-4 h-4" aria-hidden />
        </span>
      );
    case "name_mismatch":
      return (
        <span className={iconClass} style={{ backgroundColor: "#F97316" }}>
          <img src="/images/warning.svg" alt="" className="w-4 h-4" aria-hidden />
        </span>
      );
    case "automated_verification":
      return (
        <span className={iconClass} style={{ backgroundColor: "#8B5CF6" }}>
          <img src="/images/clock.svg" alt="" className="w-4 h-4" aria-hidden />
        </span>
      );
    case "document_uploaded":
      return (
        <span className={iconClass} style={{ backgroundColor: "#6B7280" }}>
          <img src="/images/upload.svg" alt="" className="w-4 h-4" aria-hidden />
        </span>
      );
    case "document_approved_override":
      return (
        <span className={iconClass} style={{ backgroundColor: "#22C55E" }}>
          <img src="/images/tick.svg" alt="" className="w-4 h-4" aria-hidden />
        </span>
      );
    default:
      return (
        <span className={iconClass} style={{ backgroundColor: "#6B7280" }}>
          <img src="/images/clock.svg" alt="" className="w-4 h-4" aria-hidden />
        </span>
      );
  }
}

function OverrideModal({
  justificationText,
  setJustificationText,
  onConfirm,
  onCancel,
}: {
  justificationText: string;
  setJustificationText: (s: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", animation: "fadeIn 200ms ease-out" }}
    >
      <div
        className="rounded-lg p-6 w-full max-w-md"
        style={{ backgroundColor: "#FFFFFF", boxShadow: "0 10px 40px rgba(0,0,0,0.2)", animation: "fadeIn 200ms ease-out" }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: "#333333" }}>
          Override document verification?
        </h3>
        <p className="text-sm mb-1" style={{ color: "#555555" }}>Reason for flag</p>
        <p className="text-sm mb-4" style={{ color: "#333333" }}>
          Name mismatch between passport and HR record
        </p>
        <p className="text-sm mb-1" style={{ color: "#555555" }}>Provide justification for override</p>
        <textarea
          value={justificationText}
          onChange={(e) => setJustificationText(e.target.value)}
          placeholder="Provide justification for override"
          className="w-full rounded border p-3 text-sm resize-none mb-2 transition-opacity duration-200"
          style={{ borderColor: "#CCCCCC", color: "#333333", minHeight: "100px" }}
          rows={4}
        />
        <p className="text-xs mb-4" style={{ color: "#888888" }}>
          This action will be recorded in the audit log.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded text-sm font-medium"
            style={{ backgroundColor: "#E0E0E0", color: "#333333" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!justificationText.trim()}
            className="px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
            style={{
              backgroundColor: justificationText.trim() ? "#2196F3" : "#E0E0E0",
              color: "#FFFFFF",
            }}
          >
            Override and Approve
          </button>
        </div>
      </div>
    </div>
  );
}

function Toast({
  message,
  description,
  onDismiss,
}: {
  message: string;
  description: string;
  onDismiss: () => void;
}) {
  const isGreen = message.includes("Correction request");
  return (
    <div
      className="fixed bottom-6 right-6 z-50 rounded-lg border p-4 flex items-start gap-3 max-w-sm"
      style={{
        animation: "fadeIn 200ms ease-out",
        backgroundColor: isGreen ? "#ECFDF5" : "#FFFFFF",
        borderColor: isGreen ? "#D1FAE5" : "#E5E7EB",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      }}
    >
      <span
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: "#22C55E" }}
      >
        <img src="/images/tick.svg" alt="" className="w-5 h-5" aria-hidden />
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm" style={{ color: isGreen ? "#065F46" : "#333333" }}>{message}</p>
        <p className="text-sm mt-0.5" style={{ color: isGreen ? "#34D399" : "#6B7280" }}>{description}</p>
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 p-1 flex items-center justify-center"
        style={{ color: "#6B7280" }}
        aria-label="Close"
      >
        <img src="/images/error.svg" alt="" className="w-4 h-4" aria-hidden />
      </button>
    </div>
  );
}
