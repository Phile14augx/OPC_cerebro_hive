/**
 * Nexarch — Approval Inbox
 */
"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckSquare, XCircle, AlertTriangle, Clock, Bot, RefreshCw } from "lucide-react";

const RISK_STYLES: Record<string, string> = {
  critical: "bg-red-900/40 text-red-400 border-red-800",
  high:     "bg-orange-900/40 text-orange-400 border-orange-800",
  medium:   "bg-yellow-900/40 text-yellow-400 border-yellow-800",
  low:      "bg-blue-900/40 text-blue-400 border-blue-800",
};

export default function ApprovalsPage() {
  const [approvals, setApprovals]   = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [statusFilter, setStatus]   = useState("pending");
  const [actioning, setActioning]   = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/nexarch/approvals?status=${statusFilter}`);
    const data = await res.json();
    setApprovals(data.data ?? []);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    setActioning(id);
    try {
      await fetch(`/api/nexarch/approvals/${id}/action`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action, reviewedBy: "user" }),
      });
      await load();
    } finally {
      setActioning(null);
    }
  };

  const pending   = approvals.filter(a => a.status === "pending").length;
  const resolved  = approvals.filter(a => a.status !== "pending").length;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Approval Inbox</h1>
          <p className="text-sm text-gray-500">Human-in-the-loop control for high-risk agent actions</p>
        </div>
        <button
          onClick={load}
          className="p-2 rounded hover:bg-gray-800 text-gray-500 hover:text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 border-b border-gray-800">
        {[
          { val: "pending",  label: "Pending",  badge: pending },
          { val: "approved", label: "Approved", badge: null },
          { val: "rejected", label: "Rejected", badge: null },
        ].map(s => (
          <button
            key={s.val}
            onClick={() => setStatus(s.val)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors border-b-2 -mb-px ${
              statusFilter === s.val
                ? "border-violet-500 text-white"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            {s.label}
            {s.badge !== null && s.badge > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] bg-amber-600 text-white rounded-full">
                {s.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Clock className="w-5 h-5 text-violet-400 animate-spin mr-2" />
          <span className="text-gray-500">Loading…</span>
        </div>
      ) : approvals.length === 0 ? (
        <div className="py-16 text-center">
          <CheckSquare className="w-12 h-12 text-gray-800 mx-auto mb-3" />
          <p className="text-gray-500">
            {statusFilter === "pending" ? "No pending approvals — all clear!" : `No ${statusFilter} approvals`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {approvals.map((apr: any) => (
            <div
              key={apr.id}
              className={`bg-gray-900 border rounded-lg p-4 ${
                apr.status === "pending" ? "border-amber-900/50" : "border-gray-800"
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  apr.riskLevel === "critical" ? "text-red-400" :
                  apr.riskLevel === "high"     ? "text-orange-400" :
                  apr.riskLevel === "medium"   ? "text-yellow-400" : "text-blue-400"
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-semibold text-white">{apr.agentName}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${RISK_STYLES[apr.riskLevel] ?? "bg-gray-800 text-gray-500 border-gray-700"}`}>
                      {apr.riskLevel} risk
                    </span>
                    {apr.status !== "pending" && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                        apr.status === "approved" ? "bg-emerald-900/40 text-emerald-400 border-emerald-800" :
                        "bg-red-900/40 text-red-400 border-red-800"
                      }`}>{apr.status}</span>
                    )}
                  </div>

                  <p className="text-sm font-medium text-gray-200">{apr.action}</p>
                  <p className="text-xs text-gray-500 mt-1">{apr.description || apr.reason}</p>

                  {/* Details */}
                  {apr.details && Object.keys(apr.details).length > 0 && (
                    <div className="mt-2 p-2 bg-gray-800/50 rounded text-xs font-mono text-gray-500 whitespace-pre-wrap">
                      {JSON.stringify(apr.details, null, 2)}
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <Bot className="w-3 h-3" /> {apr.agentId}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(apr.createdAt).toLocaleString()}
                    </span>
                    {apr.reviewedBy && (
                      <span>Reviewed by {apr.reviewedBy}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              {apr.status === "pending" && (
                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-800">
                  <button
                    onClick={() => handleAction(apr.id, "approve")}
                    disabled={actioning === apr.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 rounded text-sm text-white transition-colors"
                  >
                    <CheckSquare className="w-4 h-4" />
                    {actioning === apr.id ? "Processing…" : "Approve"}
                  </button>
                  <button
                    onClick={() => handleAction(apr.id, "reject")}
                    disabled={actioning === apr.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-900/60 hover:bg-red-800 disabled:opacity-50 rounded text-sm text-red-300 hover:text-white transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
