"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTask, type ActivityEntry } from "../context/TaskContext";

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

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    };
  }, []);

  const handleRequestCorrection = () => {
    prependActivity({
      id: "correction-" + Date.now(),
      timestamp: "23/02/2026, 13:15",
      type: "correction_requested",
      title: "Correction requested",
      description: "Administrator requested employee to resubmit documentation with correct information. Confidence score: 75%.",
      source: "Admin user",
    });
    setTaskStatus("pending_transition_correction");
    showToastMessage("Correction request sent to employee", "The employee will be notified to resubmit their document.");
    transitionTimeoutRef.current = setTimeout(() => {
      setTaskStatus("pending");
      transitionTimeoutRef.current = null;
    }, 800);
  };

  const handleOverrideConfirm = () => {
    if (!justificationText.trim()) return;
    setOverrideModalOpen(false);
    setJustificationText("");
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
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#F8F8F8" }}>
      <div className="flex flex-1">
        <div
          className="flex-1 flex flex-col"
          style={{ backgroundColor: taskStatus === "pending" || taskStatus === "completed" ? "#F7F8FA" : "#F8F8F8" }}
        >
          {taskStatus === "pending" || taskStatus === "completed" ? (
            <div
              className="flex-1 flex"
              style={{
                animation: "contentFadeIn 500ms ease-out",
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
              <div className="flex-1 flex flex-col min-h-0">
                <header
                  className="px-6 pt-6 pb-4 flex items-center gap-4 shrink-0 border-b"
                  style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
                >
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1 text-sm shrink-0"
                    style={{ color: "#1F2937" }}
                  >
                    <img src="/images/arrow%20left.svg" alt="" className="w-4 h-4 shrink-0" aria-hidden />
                    Back
                  </Link>
                  <div
                    className="w-px self-stretch shrink-0"
                    style={{ backgroundColor: "#E5E7EB", minHeight: "2.5rem" }}
                  />
                  <div className="flex items-start justify-between gap-4 flex-1 min-w-0">
                    <div>
                      <h1 className="text-xl font-semibold mb-1" style={{ color: "#1F2937" }}>
                        Document review
                      </h1>
                      <p className="text-sm" style={{ color: "#6B7280" }}>
                        Flagged for manual verification. The system detected a potential mismatch. Human review required.
                      </p>
                    </div>
                    {badgeLabel === "APPROVED" ? (
                      <span
                        className="px-3 py-1.5 rounded text-xs font-semibold shrink-0 inline-flex items-center gap-1 uppercase border"
                        style={{ backgroundColor: "#DCFCE7", color: "#166534", borderColor: "#4ADE80" }}
                      >
                        <img src="/images/tick.svg" alt="" className="w-4 h-4 shrink-0" aria-hidden style={{ filter: "invert(24%) sepia(65%) saturate(1200%) hue-rotate(115deg)" }} />
                        {badgeLabel}
                      </span>
                    ) : (
                      <span
                        className="px-2 py-1 rounded text-xs font-medium border shrink-0 inline-flex items-center gap-1 uppercase"
                        style={{ backgroundColor: "#FEF3C7", color: "#92400E", borderColor: "#FCD34D" }}
                      >
                        <img src="/images/clock.svg" alt="" className="w-3.5 h-3.5 shrink-0" aria-hidden style={{ filter: "invert(26%) sepia(89%) saturate(1500%) hue-rotate(359deg)" }} />
                        {badgeLabel}
                      </span>
                    )}
                  </div>
                </header>
                {(taskStatus === "pending_transition_correction" || taskStatus === "approved_transition") ? (
                  <div className="flex flex-1 min-w-0">
                    <div className="flex-1 flex items-center justify-center p-6 min-w-0">
                      <div
                        className="w-12 h-12 rounded-full border-4 border-t-transparent"
                        style={{
                          borderColor: "#1070B7",
                          borderTopColor: "transparent",
                          animation: "spin 0.8s linear infinite",
                        }}
                      />
                    </div>
                    <ActivityLogSidebar activityLog={activityLog} badgeLabel={badgeLabel} />
                  </div>
                ) : (
                <div className="flex flex-1 min-w-0">
                  <div className="flex-1 p-6 min-w-0 flex justify-center">
                    <div className="max-w-4xl w-full mx-auto">
                  {taskStatus === "pending_review" && (
                    <>
                      <div
                        className="rounded-md border p-3 mb-4 flex items-center gap-2"
                        style={{ backgroundColor: "#FFFBEB", borderColor: "#FBBF24" }}
                      >
                        <img
                          src="/images/warning.svg"
                          alt=""
                          className="w-5 h-5 shrink-0"
                          aria-hidden
                          style={{ filter: "invert(48%) sepia(79%) saturate(2476%) hue-rotate(14deg)" }}
                        />
                        <span style={{ color: "#1F2937" }}>
                          Name does not match HR record. Requires verification
                        </span>
                      </div>

                      <div
                        className="rounded-lg border p-4 mb-0"
                        style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
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
                            <p className="text-sm font-semibold mb-1" style={{ color: "#1F2937" }}>Passport.pdf</p>
                            <p className="text-xs mb-1" style={{ color: "#6B7280" }}>Uploaded: 19 Feb 2026, 09:15</p>
                            <p className="text-xs mb-1" style={{ color: "#6B7280" }}>Source: Employee upload portal</p>
                            <p className="text-xs mb-2" style={{ color: "#6B7280" }}>File size: 2.4 MB</p>
                            <p className="text-sm font-semibold mb-2" style={{ color: "#1F2937" }}>
                              Confidence: <span style={{ color: "#D97706" }}>75% (medium)</span>
                            </p>
                            <p className="text-sm mb-3" style={{ color: "#1F2937" }}>
                              Reason for flag: Name does not match HR record
                            </p>
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
                        <div className="flex items-start gap-3 mt-4 pt-4" style={{ borderTop: "1px solid #E5E7EB" }}>
                          <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded" style={{ backgroundColor: "#EFF6FF" }} aria-hidden>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                              <polyline points="10 9 9 9 8 9" />
                            </svg>
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-medium mb-0.5" style={{ color: "#6B7280" }}>Note from employee</p>
                            <p className="text-sm font-medium" style={{ color: "#1F2937" }}>
                              I recently got married. My passport still shows my previous surname.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div
                        className="rounded-lg border p-4 mt-4"
                        style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
                      >
                        <h3 className="text-base font-semibold mb-3" style={{ color: "#1F2937" }}>
                          Data comparison
                        </h3>
                        <div
                          className="grid grid-cols-2 gap-6 py-2 mb-3 -mx-2 px-2 rounded"
                          style={{ backgroundColor: "#FEF3C7" }}
                        >
                          <div>
                            <p className="text-xs mb-0.5" style={{ color: "#6B7280" }}>Full Name</p>
                            <p className="font-medium flex items-center gap-1 flex-wrap">
                              Angela Zoe Test
                              <span className="px-2 py-0.5 rounded text-xs font-medium border" style={{ backgroundColor: "#FEF3C7", color: "#92400E", borderColor: "#FCD34D" }}>Mismatch</span>
                            </p>
                          </div>
                          <div>
                            <p className="text-xs mb-0.5" style={{ color: "#6B7280" }}>Full Name</p>
                            <p className="font-medium flex items-center gap-1 flex-wrap">
                              Angela Z. Smith
                              <span className="px-2 py-0.5 rounded text-xs font-medium border" style={{ backgroundColor: "#FEF3C7", color: "#92400E", borderColor: "#FCD34D" }}>Mismatch</span>
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6 mb-0">
                          <div>
                            <p className="text-sm mb-2" style={{ color: "#6B7280" }}>Extracted data from document</p>
                            <ul className="space-y-3 text-sm">
                              <li>
                                <p className="text-xs mb-0.5" style={{ color: "#6B7280" }}>Date of birth</p>
                                <p className="font-medium" style={{ color: "#1F2937" }}>14 March 1988</p>
                              </li>
                              <li>
                                <p className="text-xs mb-0.5" style={{ color: "#6B7280" }}>Document number</p>
                                <p className="font-medium" style={{ color: "#1F2937" }}>1234567890</p>
                              </li>
                              <li>
                                <p className="text-xs mb-0.5" style={{ color: "#6B7280" }}>Expiry date</p>
                                <p className="font-medium" style={{ color: "#1F2937" }}>13 April 2028</p>
                              </li>
                              <li>
                                <p className="text-xs mb-0.5" style={{ color: "#6B7280" }}>Nationality</p>
                                <p className="font-medium" style={{ color: "#1F2937" }}>United Kingdom</p>
                              </li>
                            </ul>
                          </div>
                          <div>
                            <p className="text-sm mb-2" style={{ color: "#6B7280" }}>HR record</p>
                            <ul className="space-y-3 text-sm">
                              <li>
                                <p className="text-xs mb-0.5" style={{ color: "#6B7280" }}>Date of birth</p>
                                <p className="font-medium" style={{ color: "#1F2937" }}>14 March 1988</p>
                              </li>
                              <li>
                                <p className="text-xs mb-0.5" style={{ color: "#6B7280" }}>Document number</p>
                                <p className="font-medium" style={{ color: "#1F2937" }}>-</p>
                              </li>
                              <li>
                                <p className="text-xs mb-0.5" style={{ color: "#6B7280" }}>Expiry date</p>
                                <p className="font-medium" style={{ color: "#1F2937" }}>-</p>
                              </li>
                              <li>
                                <p className="text-xs mb-0.5" style={{ color: "#6B7280" }}>Nationality</p>
                                <p className="font-medium" style={{ color: "#1F2937" }}>United Kingdom</p>
                              </li>
                            </ul>
                          </div>
                        </div>
                        <hr className="my-4 border-0 h-px" style={{ backgroundColor: "#E5E7EB" }} />
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
                      </div>
                    </>
                  )}
                    </div>
                  </div>
                  <ActivityLogSidebar activityLog={activityLog} badgeLabel={badgeLabel} />
                </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

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
      <div className="flex-1 flex flex-col min-h-0">
        <header
          className="px-6 pt-6 pb-4 flex items-center gap-4 shrink-0 border-b"
          style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
        >
          <Link href="/" className="inline-flex items-center gap-1 text-sm shrink-0" style={{ color: "#1F2937" }}>
            <img src="/images/arrow%20left.svg" alt="" className="w-4 h-4 shrink-0" aria-hidden />
            Back
          </Link>
          <div className="w-px self-stretch shrink-0" style={{ backgroundColor: "#E5E7EB", minHeight: "2.5rem" }} />
          <div className="flex items-start justify-between gap-4 flex-1 min-w-0">
            <div>
              <h1 className="text-xl font-semibold mb-1" style={{ color: "#1F2937" }}>
                Document review
              </h1>
              <p className="text-sm" style={{ color: "#6B7280" }}>
                Flagged for manual verification. The system detected a potential mismatch. Human review required.
              </p>
            </div>
            <span
              className="px-2 py-1 rounded text-xs font-medium border shrink-0 inline-flex items-center gap-1 uppercase"
              style={{ backgroundColor: "#FEF3C7", color: "#92400E", borderColor: "#FCD34D" }}
            >
              <img src="/images/clock.svg" alt="" className="w-3.5 h-3.5 shrink-0" aria-hidden style={{ filter: "invert(26%) sepia(89%) saturate(1500%) hue-rotate(359deg)" }} />
              PENDING
            </span>
          </div>
        </header>
        <div className="flex flex-1 min-w-0">
          <div className="flex-1 p-6 flex flex-col items-center min-w-0">
        <div className="flex flex-col items-center py-12 text-center max-w-lg w-full">
          <div className="mb-4 flex justify-center" style={{ color: "#1070B7" }}>
            <img src="/images/teacup.svg" alt="" className="w-20 h-20 object-contain" aria-hidden />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: "#1F2937" }}>
            Go and put the kettle on
          </h2>
          <p className="text-base mb-2" style={{ color: "#6B7280" }}>
            A request has been sent to Angela Zoe Test to resubmit their passport with updated information.
          </p>
          <p className="text-base mb-2" style={{ color: "#6B7280" }}>
            You&apos;ll be notified once a new document is uploaded.
          </p>
          <p className="text-base mb-6" style={{ color: "#6B7280" }}>
            In the mean time enjoy a cup of tea.
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
          className="w-full max-w-2xl h-px shrink-0 my-6 mx-auto"
          style={{ backgroundColor: "#E5E7EB" }}
          aria-hidden
        />

        <div
          className="rounded-lg border p-4 w-full max-w-2xl mx-auto"
          style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <div className="flex gap-4">
            <div className="w-40 h-28 rounded overflow-hidden shrink-0 bg-[#D1D5DB]">
              <img src="/images/passport.jpg?v=2" alt="Passport document" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-semibold" style={{ color: "#1F2937" }}>Passport.pdf</span>
                <span
                  className="px-2 py-1 rounded text-xs font-medium border shrink-0 inline-flex items-center gap-1 uppercase"
                  style={{ backgroundColor: "#FEF3C7", color: "#92400E", borderColor: "#FCD34D" }}
                >
                  <img src="/images/clock.svg" alt="" className="w-3.5 h-3.5 shrink-0" aria-hidden style={{ filter: "invert(26%) sepia(89%) saturate(1500%) hue-rotate(359deg)" }} />
                  PENDING
                </span>
              </div>
              <p className="text-sm font-semibold mb-3" style={{ color: "#1F2937" }}>
                Confidence: <span style={{ color: "#D97706" }}>75% (medium)</span>
              </p>
              <div className="mb-2">
                <p className="text-xs font-medium mb-0.5" style={{ color: "#6B7280" }}>Issue</p>
                <p className="text-sm" style={{ color: "#1F2937" }}>Name does not match HR record</p>
              </div>
              <div className="mb-2">
                <p className="text-xs font-medium mb-0.5" style={{ color: "#6B7280" }}>Action taken</p>
                <p className="text-sm" style={{ color: "#1F2937" }}>Correction requested</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-0.5" style={{ color: "#6B7280" }}>Requested by</p>
                <p className="text-sm" style={{ color: "#1F2937" }}>Admin user</p>
              </div>
            </div>
          </div>
        </div>
          </div>
          <ActivityLogSidebar activityLog={activityLog} badgeLabel="PENDING" />
        </div>
      </div>
    </>
  );
}

function TaskCompletedContent({ onReturnToTaskQueue }: { onReturnToTaskQueue: () => void }) {
  const { activityLog } = useTask();
  const overrideEntry = activityLog.find((e) => e.type === "document_approved_override");
  const reasonText = overrideEntry?.justification ?? "—";
  return (
    <>
      <div className="flex-1 flex flex-col min-h-0">
        <header
          className="px-6 pt-6 pb-4 flex items-center gap-4 shrink-0 border-b"
          style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
        >
          <Link href="/" className="inline-flex items-center gap-1 text-sm shrink-0" style={{ color: "#1F2937" }}>
            <img src="/images/arrow%20left.svg" alt="" className="w-4 h-4 shrink-0" aria-hidden />
            Back
          </Link>
          <div className="w-px self-stretch shrink-0" style={{ backgroundColor: "#E5E7EB", minHeight: "2.5rem" }} />
          <div className="flex items-start justify-between gap-4 flex-1 min-w-0">
            <div>
              <h1 className="text-xl font-semibold mb-1" style={{ color: "#333333" }}>
                Document review
              </h1>
              <p className="text-sm" style={{ color: "#6B7280" }}>
                Flagged for manual verification. The system detected a potential mismatch. Human review required.
              </p>
            </div>
            <span
              className="px-3 py-1.5 rounded text-xs font-semibold shrink-0 inline-flex items-center gap-1 uppercase border"
              style={{ backgroundColor: "#DCFCE7", color: "#166534", borderColor: "#4ADE80" }}
            >
              <img src="/images/tick.svg" alt="" className="w-4 h-4 shrink-0" aria-hidden style={{ filter: "invert(24%) sepia(65%) saturate(1200%) hue-rotate(115deg)" }} />
              APPROVED
            </span>
          </div>
        </header>
        <div className="flex flex-1 min-w-0">
          <div className="flex-1 p-6 flex flex-col items-center min-w-0">
        <div className="flex flex-col items-center py-12 text-center max-w-lg w-full">
          <div className="mb-4 w-20 h-20 flex items-center justify-center">
            <img src="/images/party.svg" alt="" className="w-full h-full object-contain" aria-hidden />
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
          className="w-full max-w-2xl h-px shrink-0 my-6 mx-auto"
          style={{ backgroundColor: "#E5E7EB" }}
          aria-hidden
        />

        <div
          className="rounded-lg border p-4 w-full max-w-2xl mx-auto"
          style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <div className="flex gap-4">
            <div className="w-40 h-28 rounded overflow-hidden shrink-0 bg-[#D1D5DB]">
              <img src="/images/passport.jpg?v=2" alt="Passport document" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-semibold" style={{ color: "#1F2937" }}>Passport.pdf</span>
                <span className="px-2 py-0.5 rounded text-xs font-medium inline-flex items-center gap-1 border shrink-0" style={{ backgroundColor: "#DCFCE7", color: "#166534", borderColor: "#4ADE80" }}>
                  <img src="/images/tick.svg" alt="" className="w-3.5 h-3.5 shrink-0" aria-hidden style={{ filter: "invert(24%) sepia(65%) saturate(1200%) hue-rotate(115deg)" }} />
                  APPROVED
                </span>
              </div>
              <div className="mb-2">
                <p className="text-xs font-medium mb-0.5" style={{ color: "#6B7280" }}>Resolution</p>
                <p className="text-sm" style={{ color: "#1F2937" }}>Approved. Verified against HR record</p>
              </div>
              <div className="mb-2">
                <p className="text-xs font-medium mb-0.5" style={{ color: "#6B7280" }}>Override and approved by</p>
                <p className="text-sm" style={{ color: "#1F2937" }}>Admin user</p>
              </div>
              <div className="mb-2">
                <p className="text-xs font-medium mb-0.5" style={{ color: "#6B7280" }}>Override reference ID</p>
                <p className="text-sm" style={{ color: "#1F2937" }}>VER-2026-1847</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-0.5" style={{ color: "#6B7280" }}>Reason</p>
                <p className="text-sm" style={{ color: "#1F2937" }}>
                  {reasonText}
                </p>
              </div>
            </div>
          </div>
        </div>
          </div>
          <ActivityLogSidebar activityLog={activityLog} badgeLabel="APPROVED" />
        </div>
      </div>
    </>
  );
}

function ActivityLogSidebar({ activityLog }: { activityLog: ActivityEntry[]; badgeLabel: string }) {
  return (
    <aside
      className="w-80 shrink-0 p-6 border-l"
      style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
    >
      <h3 className="font-semibold mb-4" style={{ color: "#1F2937", fontSize: "18px" }}>
        Activity log
      </h3>
      <ul className="relative">
        {activityLog.map((entry, index) => (
          <li key={entry.id} className="flex gap-3 pb-4 last:pb-0">
            <div className="flex flex-col items-center shrink-0">
              <span className="block">{getActivityIcon(entry.type)}</span>
              {index < activityLog.length - 1 && (
                <div
                  className="w-px flex-1 min-h-4 mt-1"
                  style={{ backgroundColor: "#E5E7EB" }}
                />
              )}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="mb-0.5" style={{ color: "#6B7280", fontSize: "12px" }}>{entry.timestamp}</p>
              <p className="font-semibold mb-0.5" style={{ color: "#1F2937" }}>{entry.title}</p>
              <p className="text-sm mb-1" style={{ color: "#6B7280" }}>{entry.description}</p>
              <span
                className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs border"
                style={{
                  backgroundColor: entry.source === "Admin user" ? "#E5E7EB" : "#E0F2FE",
                  color: entry.source === "Admin user" ? "#6B7280" : "#3B82F6",
                  borderColor: entry.source === "Admin user" ? "#D1D5DB" : "#BAE6FD",
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
          </li>
        ))}
      </ul>
    </aside>
  );
}

function getActivityIcon(type: ActivityEntry["type"]) {
  const iconSize = "w-5 h-5 shrink-0";
  const warningFilter = "invert(48%) sepia(79%) saturate(2476%) hue-rotate(14deg)";
  const purpleFilter = "invert(42%) sepia(93%) saturate(1000%) hue-rotate(245deg)";
  const greenFilter = "invert(58%) sepia(98%) saturate(500%) hue-rotate(100deg)";
  const redFilter = "invert(25%) sepia(98%) saturate(3000%) hue-rotate(350deg)";
  switch (type) {
    case "correction_requested":
      return <img src="/images/error.svg" alt="" className={iconSize} aria-hidden style={{ filter: redFilter }} />;
    case "name_mismatch":
      return <img src="/images/warning.svg" alt="" className={iconSize} aria-hidden style={{ filter: warningFilter }} />;
    case "automated_verification":
      return <img src="/images/clock.svg" alt="" className={iconSize} aria-hidden style={{ filter: purpleFilter }} />;
    case "document_uploaded":
      return <img src="/images/upload.svg" alt="" className={iconSize} aria-hidden />;
    case "document_approved_override":
      return <img src="/images/tick.svg" alt="" className={iconSize} aria-hidden style={{ filter: greenFilter }} />;
    default:
      return <img src="/images/clock.svg" alt="" className={iconSize} aria-hidden style={{ filter: purpleFilter }} />;
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
  const [isExiting, setIsExiting] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    timersRef.current = [
      setTimeout(() => setIsExiting(true), 3500),
      setTimeout(() => onDismiss(), 4000),
    ];
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [onDismiss]);

  const handleDismiss = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setIsExiting(true);
    setTimeout(onDismiss, 300);
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-50 rounded-lg border p-4 flex items-start gap-3 max-w-sm transition-all duration-300 ease-out"
      style={{
        animation: "toastSlideIn 300ms ease-out",
        backgroundColor: "#FFFFFF",
        borderColor: "#E5E7EB",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? "translateX(100%)" : "translateX(0)",
      }}
      role="status"
      aria-live="polite"
    >
      <span className="flex items-center justify-center shrink-0">
        <img
          src="/images/tick.svg"
          alt=""
          className="w-6 h-6"
          aria-hidden
          style={{ filter: "invert(58%) sepia(98%) saturate(500%) hue-rotate(100deg)" }}
        />
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm" style={{ color: "#1F2937" }}>{message}</p>
        <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>{description}</p>
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        className="shrink-0 p-1 rounded hover:bg-[#F3F4F6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1070B7] focus:ring-offset-1"
        style={{ color: "#6B7280" }}
        aria-label="Dismiss notification"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
