/**
 * Debug Panel Widget - Floating UI for viewing logs in development
 * Purpose: Display real-time logs with search and export functionality
 * Checkpoint 3: Frontend Action & Error Logging
 */

'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { logger } from '@/lib/logging/logger';
import { useAuth } from '@/lib/auth/useAuth';

export default function DebugPanel() {
  const { isAuthenticated, isHydrated, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState('ALL');

  const isProduction = process.env.NODE_ENV === 'production';
  const isAdmin = Boolean(
    user?.roles?.some((role) => role.type === 'admin' && role.status === 'approved')
  );
  const shouldHide = isProduction || !isHydrated || !isAuthenticated || !isAdmin;

  // Refresh logs every second
  useEffect(() => {
    if (shouldHide) return;
    const interval = setInterval(() => {
      if (isOpen) {
        updateLogs();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, searchQuery, filterLevel, shouldHide]);

  // Toggle panel with Alt+D
  useEffect(() => {
    if (shouldHide) return;
    const handleKeyDown = (e) => {
      if (e.altKey && e.key === 'd') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, shouldHide]);

  if (shouldHide) {
    return null;
  }

  const updateLogs = () => {
    let allLogs = logger.getLogs();

    // Filter by level
    if (filterLevel !== 'ALL') {
      allLogs = allLogs.filter(log => log.level === filterLevel);
    }

    // Filter by search query
    if (searchQuery) {
      allLogs = allLogs.filter(log =>
        log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        JSON.stringify(log.data).toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setLogs(allLogs);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const getLevelColor = (level) => {
    const colors = {
      ERROR: 'text-red-600',
      WARN: 'text-clay-600',
      API: 'text-blue-600',
      ACTION: 'text-green-600',
      INFO: 'text-gray-600',
      DEBUG: 'text-purple-600'
    };
    return colors[level] || 'text-gray-600';
  };

  const stats = logger.getStats();

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gray-900 text-white px-3 py-1 rounded text-xs hover:bg-gray-800"
          title="Alt+D to toggle debug panel"
        >
          Debug ({stats.totalLogs})
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-full max-w-2xl h-96 bg-white border border-gray-300 rounded-lg shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
        <h3 className="font-bold">Debug Panel (Alt+D)</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:text-gray-300 text-xl font-bold"
        >
          ×
        </button>
      </div>

      {/* Controls */}
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-300 flex gap-2 flex-wrap">
        <input
          type="text"
          placeholder="Search logs..."
          value={searchQuery}
          onChange={handleSearch}
          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
        />
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded text-sm"
        >
          <option value="ALL">All Levels</option>
          <option value="ERROR">Errors</option>
          <option value="WARN">Warnings</option>
          <option value="API">API</option>
          <option value="ACTION">Actions</option>
          <option value="INFO">Info</option>
          <option value="DEBUG">Debug</option>
        </select>

        <button
          onClick={() => logger.exportLogs()}
          className="px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          Export JSON
        </button>
        <button
          onClick={() => logger.exportLogsCSV()}
          className="px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
        >
          Export CSV
        </button>
        <button
          onClick={() => logger.clearLogs()}
          className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
        >
          Clear
        </button>
      </div>

      {/* Stats */}
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-300 text-xs">
        Total: {stats.totalLogs} | Errors: {stats.byLevel.ERROR || 0} | API: {stats.byLevel.API || 0} | Actions: {stats.byLevel.ACTION || 0}
      </div>

      {/* Logs */}
      <div className="flex-1 overflow-y-auto font-mono text-xs">
        {logs.length === 0 ? (
          <div className="p-4 text-gray-500">No logs to display</div>
        ) : (
          logs.map((log, idx) => (
            <div key={idx} className="px-4 py-2 border-b border-gray-200 hover:bg-gray-50">
              <div className="flex gap-2">
                <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span className={`font-bold ${getLevelColor(log.level)} w-12`}>[{log.level}]</span>
                <span className="flex-1">{log.message}</span>
              </div>
              {log.data && (
                <div className="text-gray-600 ml-32 mt-1 break-all">
                  {typeof log.data === 'string' ? log.data : JSON.stringify(log.data).substring(0, 200)}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
