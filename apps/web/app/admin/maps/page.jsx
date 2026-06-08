"use client";
import React, { useEffect, useState } from "react";
import { RequireRole } from "../../../components/guards/RequireRole";

const API_BASE = process.env.NEXT_PUBLIC_MAPS_PROXY || "http://localhost:3001";

function human(n) {
  return n == null ? "-" : String(n);
}

export default function AdminMapsPage() {
  const [limits, setLimits] = useState([]);
  const [usage, setUsage] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  function authHeader() {
    return { "Content-Type": "application/json" };
  }

  async function fetchAll() {
    setLoading(true);
    setError(null);
    try {
      const [r1, r2] = await Promise.all([
        fetch(`${API_BASE}/admin/maps/limits`, {
          headers: { ...authHeader() },
          credentials: "include",
        }),
        fetch(`${API_BASE}/admin/maps/usage`, {
          headers: { ...authHeader() },
          credentials: "include",
        }),
      ]);
      if (!r1.ok || !r2.ok) throw new Error("Failed to fetch");
      setLimits(await r1.json());
      setUsage(await r2.json());
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la información de mapas");
    } finally {
      setLoading(false);
    }
  }

  async function toggle(serviceType, enable) {
    try {
      const url = `${API_BASE}/admin/maps/service/${serviceType}/${enable ? "enable" : "disable"}`;
      const res = await fetch(url, {
        method: "PATCH",
        headers: { ...authHeader() },
        credentials: "include",
      });
      if (!res.ok) throw new Error("failed");
      await fetchAll();
    } catch (e) {
      alert("Action failed");
    }
  }

  async function editLimit(limit) {
    const newLimit = prompt(
      "New limit value (integer)",
      String(limit.limitValue),
    );
    if (newLimit == null) return;
    const val = parseInt(newLimit, 10);
    if (isNaN(val)) return alert("Invalid number");
    try {
      const res = await fetch(
        `${API_BASE}/admin/maps/limits/${limit.serviceType}`,
        {
          method: "PATCH",
          headers: { ...authHeader() },
          credentials: "include",
          body: JSON.stringify({
            limitValue: val,
            alertThreshold: limit.alertThreshold,
            hardStop: limit.hardStop,
          }),
        },
      );
      if (!res.ok) throw new Error("failed");
      await fetchAll();
    } catch (e) {
      alert("Update failed");
    }
  }

  async function downloadHistory(serviceType) {
    try {
      const res = await fetch(
        `${API_BASE}/admin/maps/usage/history?service=${serviceType}`,
        { headers: { ...authHeader() }, credentials: "include" },
      );
      if (!res.ok) throw new Error("failed");
      const rows = await res.json();
      const csv = rows
        .map((r) =>
          [
            r.id,
            r.serviceType,
            r.action,
            r.provider,
            r.requestAt,
            r.meta ? JSON.stringify(r.meta) : "",
          ].join(","),
        )
        .join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${serviceType}-maps-usage.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      alert("Download failed");
    }
  }

  return (
    <RequireRole role="admin">
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Maps — Usage & Limits</h1>
        <div className="mb-4">
          <button className="btn" onClick={fetchAll} disabled={loading}>
            {loading ? "Cargando..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="p-4 mb-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <section className="grid grid-cols-3 gap-4 mb-6">
          {usage && usage.length ? (
            usage.map((u) => (
              <div key={u.serviceType} className="p-4 border rounded">
                <div className="text-sm text-gray-500">{u.serviceType}</div>
                <div className="text-xl font-bold">{human(u.count)}</div>
                <div className="text-xs text-gray-600">
                  period: {u.period || "month"}
                </div>
              </div>
            ))
          ) : (
            <div>No usage data</div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-medium mb-2">Service Limits</h2>
          <div className="overflow-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr>
                  <th className="text-left">Service</th>
                  <th className="text-left">Limit</th>
                  <th className="text-left">Alert %</th>
                  <th className="text-left">Status</th>
                  <th className="text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {limits.map((l) => (
                  <tr key={l.serviceType} className="border-t">
                    <td>{l.serviceType}</td>
                    <td>{human(l.limitValue)}</td>
                    <td>{human(l.alertThreshold)}</td>
                    <td>{l.status}</td>
                    <td>
                      <button className="btn mr-2" onClick={() => editLimit(l)}>
                        Edit
                      </button>
                      <button
                        className="btn mr-2"
                        onClick={() =>
                          toggle(l.serviceType, l.status !== "paused")
                        }
                      >
                        {l.status === "paused" ? "Resume" : "Pause"}
                      </button>
                      <button
                        className="btn"
                        onClick={() => downloadHistory(l.serviceType)}
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </RequireRole>
  );
}
