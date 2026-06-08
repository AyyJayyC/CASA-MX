"use client";

import React, { useState, useEffect } from "react";
import { RequireRole } from "@/components/guards/RequireRole.jsx";
import Link from "next/link";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:3001";

function buildRequestOptions(options = {}) {
  return {
    credentials: "include",
    ...options,
    headers: {
      ...(options.headers || {}),
    },
  };
}

export default function AdminDebugPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    hasErrors: "",
    userId: "",
    startDate: "",
    endDate: "",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  useEffect(() => {
    fetchSessions();
  }, [page, filters]);

  const fetchSessions = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: ((page - 1) * limit).toString(),
      });

      if (filters.hasErrors) params.append("hasErrors", filters.hasErrors);
      if (filters.userId) params.append("userId", filters.userId);
      if (filters.startDate)
        params.append("startDate", new Date(filters.startDate).toISOString());
      if (filters.endDate)
        params.append("endDate", new Date(filters.endDate).toISOString());

      const response = await fetch(
        `${API_BASE}/admin/debug/sessions?${params}`,
        buildRequestOptions(),
      );

      if (!response.ok) {
        throw new Error("Failed to fetch debug sessions");
      }

      const data = await response.json();
      setSessions(data.sessions || []);
      setTotalPages(Math.ceil((data.total || 0) / limit));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      hasErrors: "",
      userId: "",
      startDate: "",
      endDate: "",
    });
    setPage(1);
  };

  const handleCleanup = async () => {
    if (!confirm("Delete logs older than 30 days? This cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/admin/debug/cleanup`, {
        method: "DELETE",
        ...buildRequestOptions(),
      });

      if (!response.ok) {
        throw new Error("Cleanup failed");
      }

      const data = await response.json();
      alert(`Cleanup complete: ${data.deleted} sessions deleted`);
      fetchSessions();
    } catch (err) {
      alert("Cleanup failed: " + err.message);
    }
  };

  return (
    <RequireRole roles={["admin"]} allowInProduction={false}>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Debug Sessions</h1>
          <button
            onClick={handleCleanup}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Cleanup Old Logs
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Has Errors
              </label>
              <select
                value={filters.hasErrors}
                onChange={(e) =>
                  handleFilterChange("hasErrors", e.target.value)
                }
                className="w-full border rounded px-3 py-2"
              >
                <option value="">All</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">User ID</label>
              <input
                type="text"
                value={filters.userId}
                onChange={(e) => handleFilterChange("userId", e.target.value)}
                placeholder="Enter user ID"
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <button
            onClick={clearFilters}
            className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Clear Filters
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading sessions...</p>
          </div>
        )}

        {/* Sessions List */}
        {!loading && sessions.length === 0 && (
          <div className="text-center py-8 text-gray-600">
            No debug sessions found
          </div>
        )}

        {!loading && sessions.length > 0 && (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Session ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Started
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Errors
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Exported
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sessions.map((session) => (
                    <tr
                      key={session.id}
                      className={session.hasErrors ? "bg-red-50" : ""}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {session.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {session.userEmail || "Anonymous"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(session.sessionStartTime).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {session.initialRoute || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {session.hasErrors ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Yes
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {session.exported ? "Yes" : "No"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/admin/debug/${session.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </RequireRole>
  );
}
