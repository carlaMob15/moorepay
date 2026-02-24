"use client";

import Link from "next/link";
import { useTask } from "./context/TaskContext";

export default function HomePage() {
  const { taskRemoved } = useTask();

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#1A1A1A" }}>
      <header
        className="flex items-center h-12 px-4"
        style={{ backgroundColor: "#1A1A1A", color: "#FFFFFF", fontSize: "14px" }}
      >
        Home
      </header>
      <div className="flex flex-1">
      {/* Left sidebar */}
      <aside
        className="w-20 flex flex-col items-center pt-6 gap-6"
        style={{ backgroundColor: "#FFFFFF" }}
      >
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#E5E7EB" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#374151" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="#374151" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        </div>
        <nav className="flex flex-col gap-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#3D4A5C" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>
          </div>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ border: "1px solid #9CA3AF" }}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#9CA3AF" }} />
            </div>
          ))}
          <div className="w-8 h-px" style={{ backgroundColor: "#E5E7EB" }} />
          {[1, 2].map((i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ border: "1px solid #9CA3AF" }}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#9CA3AF" }} />
            </div>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main
        className="flex-1 p-8"
        style={{ backgroundColor: "#F9FAFB" }}
      >
        <header className="mb-6" style={{ color: "#FFFFFF", fontSize: "14px" }}>
          Home
        </header>

        <h2 className="text-xl font-semibold mb-4" style={{ color: "#1F2937" }}>
          Pending tasks
        </h2>

        <div className="flex gap-5 mb-6 flex-wrap">
          {taskRemoved ? (
            <PlaceholderCard />
          ) : (
            <Link href="/review" className="block">
              <div
                className="w-[300px] rounded-lg border p-5 cursor-pointer transition-opacity duration-200 hover:opacity-90"
                style={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#E5E7EB",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span style={{ color: "#FBBF24" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2v-2zm0-6h2v4h-2v-4z"/>
                      </svg>
                    </span>
                    <span className="font-medium" style={{ color: "#374151", fontSize: "14px" }}>
                      Passport verification required
                    </span>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium"
                    style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}
                  >
                    Mismatch
                  </span>
                </div>
                <p className="text-sm mb-3" style={{ color: "#374151" }}>
                  Passport name does not match HR record
                </p>
                <div className="flex justify-between items-center mb-3" style={{ color: "#374151", fontSize: "14px" }}>
                  <span className="font-medium">Passport.pdf</span>
                  <span style={{ color: "#6B7280" }}>Uploaded 19 Feb 2026</span>
                </div>
                <p className="text-sm mb-4" style={{ color: "#374151" }}>
                  Confidence: <span style={{ color: "#3B82F6" }}>75% (medium)</span>
                </p>
                <span
                  className="inline-block px-6 py-2.5 rounded-md text-sm font-medium"
                  style={{ backgroundColor: "#DBEAFE", color: "#2563EB" }}
                >
                  Review document
                </span>
              </div>
            </Link>
          )}
          <PlaceholderCard />
          <PlaceholderCard />
          <PlaceholderCard />
        </div>

        {/* Bar chart section */}
        <div
          className="rounded-lg border p-6 mb-6"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: "#E5E7EB",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <div className="h-2 mb-4 rounded" style={{ backgroundColor: "#6B7280", width: "120px" }} />
          <div className="h-48 flex items-end gap-2">
            {[40, 65, 45, 80, 55, 70, 50].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t"
                style={{ height: `${h}%`, backgroundColor: "#4B5563" }}
              />
            ))}
          </div>
          <div className="flex justify-end items-center gap-2 mt-4">
            <div className="h-px flex-1 max-w-[200px]" style={{ backgroundColor: "#6B7280" }} />
            <div className="w-4 h-3 rounded" style={{ backgroundColor: "#3B82F6" }} />
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#6B7280" }} />
          </div>
          <div className="flex gap-1 mt-2">
            <button
              className="flex-1 max-w-[80px] py-1.5 rounded text-sm"
              style={{ backgroundColor: "#E5E7EB", color: "#374151" }}
            />
            <button
              className="flex-1 max-w-[80px] py-1.5 rounded text-sm"
              style={{ backgroundColor: "#3B82F6", color: "#FFFFFF" }}
            />
          </div>
        </div>

        {/* Bottom cards */}
        <div className="flex gap-5 flex-wrap">
          {[1, 2, 3].map((i) => (
            <PlaceholderCard key={i} />
          ))}
        </div>
      </main>
      </div>
    </div>
  );
}

function PlaceholderCard() {
  return (
    <div
      className="w-[300px] rounded-lg border p-5"
      style={{
        backgroundColor: "#FFFFFF",
        borderColor: "#E5E7EB",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#E5E7EB" }}
          >
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#6B7280" }} />
          </div>
          <div className="space-y-1">
            <div className="h-3 rounded w-32" style={{ backgroundColor: "#6B7280" }} />
            <div className="h-3 rounded w-24" style={{ backgroundColor: "#6B7280" }} />
          </div>
        </div>
        <span style={{ color: "#6B7280" }}>...</span>
      </div>
      <div className="mt-3 flex items-center gap-1">
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#6B7280" }} />
        <div className="h-3 rounded w-20" style={{ backgroundColor: "#6B7280" }} />
      </div>
    </div>
  );
}
