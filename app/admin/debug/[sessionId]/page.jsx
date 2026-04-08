'use client';

import React, { useState, useEffect } from 'react';
import { RequireRole } from '@/components/guards/RequireRole.jsx';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

function buildRequestOptions(options = {}) {
  return {
    credentials: 'include',
    ...options,
    headers: {
      ...(options.headers || {}),
    },
  };
}

export default function SessionDetailPage() {
  const params = useParams();
  const sessionId = params.sessionId;

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(
        `${API_BASE}/admin/debug/sessions/${sessionId}`,
        buildRequestOptions()
      );

      if (!response.ok) {
        throw new Error('Failed to fetch session details');
      }

      const data = await response.json();
      setSession(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      
      const response = await fetch(
        `${API_BASE}/admin/debug/sessions/${sessionId}/export`,
        buildRequestOptions({ method: 'POST' })
      );

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const bugReport = await response.json();
      
      // Download as JSON file
      const blob = new Blob([JSON.stringify(bugReport, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bug-report-${sessionId.substring(0, 8)}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Refresh session to update exported status
      fetchSession();
    } catch (err) {
      alert('Export failed: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const handleResolveError = async (errorId) => {
    const note = prompt('Enter resolution note (optional):');
    
    try {
      const response = await fetch(
        `${API_BASE}/admin/debug/errors/${errorId}/resolve`,
        buildRequestOptions({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ note: note || undefined })
        })
      );

      if (!response.ok) {
        throw new Error('Failed to resolve error');
      }

      fetchSession();
    } catch (err) {
      alert('Failed to resolve error: ' + err.message);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'error': return 'bg-red-500 text-white';
      case 'warning': return 'bg-yellow-500 text-white';
      case 'info': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status) => {
    const numericStatus = parseInt(status);
    if (numericStatus >= 500) return 'text-red-600 font-bold';
    if (numericStatus >= 400) return 'text-orange-600 font-semibold';
    if (numericStatus >= 300) return 'text-blue-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <RequireRole roles={["admin"]} allowInProduction={false}>
        <div className="container mx-auto p-6">
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading session...</p>
          </div>
        </div>
      </RequireRole>
    );
  }

  if (error || !session) {
    return (
      <RequireRole roles={["admin"]} allowInProduction={false}>
        <div className="container mx-auto p-6">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error || 'Session not found'}
          </div>
          <Link href="/admin/debug" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
            ← Back to Sessions
          </Link>
        </div>
      </RequireRole>
    );
  }

  const timeline = session.timeline || [];

  return (
    <RequireRole roles={["admin"]} allowInProduction={false}>
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Link href="/admin/debug" className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
            ← Back to Sessions
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">Debug Session Details</h1>
              <p className="text-gray-600 font-mono text-sm mt-1">{sessionId}</p>
            </div>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? 'Exporting...' : session.exported ? 'Export Again' : 'Export Bug Report'}
            </button>
          </div>
        </div>

        {/* Session Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Session Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">User</p>
              <p className="font-medium">{session.userEmail || 'Anonymous'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Started</p>
              <p className="font-medium">{new Date(session.sessionStartTime).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Initial Route</p>
              <p className="font-medium">{session.initialRoute || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">User Agent</p>
              <p className="font-medium text-sm">{session.userAgent || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">IP Address</p>
              <p className="font-medium">{session.ipAddress || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Has Errors</p>
              <p className="font-medium">
                {session.hasErrors ? (
                  <span className="text-red-600">Yes</span>
                ) : (
                  <span className="text-green-600">No</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Actions</p>
            <p className="text-3xl font-bold text-blue-600">{session.actionLogs?.length || 0}</p>
          </div>
          <div className="bg-red-50 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Errors</p>
            <p className="text-3xl font-bold text-red-600">{session.errorLogs?.length || 0}</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">API Calls</p>
            <p className="text-3xl font-bold text-green-600">{session.apiLogs?.length || 0}</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Timeline</h2>
          
          {timeline.length === 0 && (
            <p className="text-gray-600">No events in this session</p>
          )}

          <div className="space-y-4">
            {timeline.map((event, index) => (
              <div key={index} className="border-l-4 border-gray-300 pl-4 py-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 text-xs rounded font-semibold ${
                        event.type === 'error' ? 'bg-red-100 text-red-800' :
                        event.type === 'api' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {event.type.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    {/* Action Event */}
                    {event.type === 'action' && (
                      <div>
                        <p className="font-medium">{event.actionName}</p>
                        <p className="text-sm text-gray-600">{event.actionType}</p>
                        {event.componentName && (
                          <p className="text-xs text-gray-500">Component: {event.componentName}</p>
                        )}
                        {event.currentRoute && (
                          <p className="text-xs text-gray-500">Route: {event.currentRoute}</p>
                        )}
                        {event.metadata && Object.keys(event.metadata).length > 0 && (
                          <details className="mt-2">
                            <summary className="text-xs text-blue-600 cursor-pointer">Metadata</summary>
                            <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                              {JSON.stringify(event.metadata, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    )}

                    {/* Error Event */}
                    {event.type === 'error' && (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-red-600">{event.errorMessage}</p>
                          <span className={`px-2 py-0.5 text-xs rounded ${getSeverityColor(event.severity)}`}>
                            {event.severity}
                          </span>
                          {event.resolved && (
                            <span className="px-2 py-0.5 text-xs rounded bg-green-100 text-green-800">
                              Resolved
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{event.errorType}</p>
                        {event.componentName && (
                          <p className="text-xs text-gray-500">Component: {event.componentName}</p>
                        )}
                        {event.errorStackTrace && (
                          <details className="mt-2">
                            <summary className="text-xs text-blue-600 cursor-pointer">Stack Trace</summary>
                            <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                              {event.errorStackTrace}
                            </pre>
                          </details>
                        )}
                        {!event.resolved && (
                          <button
                            onClick={() => handleResolveError(event.id)}
                            className="mt-2 text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                          >
                            Mark as Resolved
                          </button>
                        )}
                      </div>
                    )}

                    {/* API Event */}
                    {event.type === 'api' && (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{event.httpMethod}</span>
                          <span className="text-sm font-mono">{event.apiEndpoint}</span>
                          <span className={`text-sm font-semibold ${getStatusColor(event.responseStatus)}`}>
                            {event.responseStatus}
                          </span>
                          <span className="text-xs text-gray-500">{event.responseTimeMs}ms</span>
                        </div>
                        {event.requestBody && (
                          <details className="mt-2">
                            <summary className="text-xs text-blue-600 cursor-pointer">Request Body</summary>
                            <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                              {JSON.stringify(event.requestBody, null, 2)}
                            </pre>
                          </details>
                        )}
                        {event.responseBody && (
                          <details className="mt-2">
                            <summary className="text-xs text-blue-600 cursor-pointer">Response Body</summary>
                            <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                              {JSON.stringify(event.responseBody, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RequireRole>
  );
}
