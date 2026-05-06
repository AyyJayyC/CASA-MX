/**
 * Comprehensive logging system for debugging
 * Captures: API calls, errors, user actions, navigation
 */

const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  API: 'API',
  ACTION: 'ACTION'
};

class Logger {
  constructor() {
    this.logs = [];
    this.maxLogs = 500; // Keep last 500 logs
    this.isEnabled = true;
    this.isLogging = false; // Prevent infinite recursion
  }

  /**
   * Add a log entry
   */
  log(level, message, data = null) {
    if (!this.isEnabled || this.isLogging) return;

    try {
      this.isLogging = true;

      const entry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        data,
        url: typeof window !== 'undefined' ? window.location.href : 'N/A'
      };

      this.logs.push(entry);

      // Keep array size manageable
      if (this.logs.length > this.maxLogs) {
        this.logs.shift();
      }

      // Also log to browser console for development
      const consoleMethod = {
        ERROR: 'error',
        WARN: 'warn',
        API: 'info',
        ACTION: 'log',
        INFO: 'info',
        DEBUG: 'debug'
      }[level];

      console[consoleMethod](`[${level}] ${message}`, data);

      return entry;
    } finally {
      this.isLogging = false;
    }
  }

  /**
   * Log API calls
   */
  logAPI(method, url, status = null, data = null) {
    const message = `${method} ${url}${status ? ` - ${status}` : ''}`;
    return this.log(LOG_LEVELS.API, message, data);
  }

  /**
   * Log user actions (clicks, form submissions, etc.)
   */
  logAction(action, details = null) {
    return this.log(LOG_LEVELS.ACTION, action, details);
  }

  /**
   * Log errors
   */
  logError(error, context = null) {
    const message = error instanceof Error ? error.message : String(error);
    return this.log(LOG_LEVELS.ERROR, message, {
      error: error instanceof Error ? error.stack : error,
      context
    });
  }

  /**
   * Log info messages
   */
  logInfo(message, data = null) {
    return this.log(LOG_LEVELS.INFO, message, data);
  }

  /**
   * Log debug messages
   */
  logDebug(message, data = null) {
    return this.log(LOG_LEVELS.DEBUG, message, data);
  }

  /**
   * Get all logs
   */
  getLogs() {
    return [...this.logs];
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level) {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * Get recent logs
   */
  getRecentLogs(count = 50) {
    return this.logs.slice(-count);
  }

  /**
   * Search logs
   */
  searchLogs(query) {
    const q = query.toLowerCase();
    return this.logs.filter(
      log =>
        log.message.toLowerCase().includes(q) ||
        log.level.toLowerCase().includes(q) ||
        JSON.stringify(log.data).toLowerCase().includes(q)
    );
  }

  /**
   * Export logs as JSON
   */
  exportLogs() {
    const data = JSON.stringify(this.logs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Export logs as CSV
   */
  exportLogsCSV() {
    const headers = ['Timestamp', 'Level', 'Message', 'Data', 'URL'];
    const rows = this.logs.map(log => [
      log.timestamp,
      log.level,
      log.message,
      JSON.stringify(log.data),
      log.url
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Clear logs
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Toggle logging on/off
   */
  toggleLogging(enabled) {
    this.isEnabled = enabled;
  }

  /**
   * Get stats
   */
  getStats() {
    const stats = {
      totalLogs: this.logs.length,
      byLevel: {}
    };

    this.logs.forEach(log => {
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
    });

    return stats;
  }
}

// Create singleton instance
export const logger = new Logger();

// Expose to window for quick access in browser console (development only)
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  window.appLogger = logger;
}

export default logger;
