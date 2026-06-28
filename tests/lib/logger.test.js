import { describe, it, expect, beforeEach, vi } from 'vitest';

// Clear the singleton state before each test
// The logger module creates a singleton, so we need to reload it
let logger;

beforeEach(async () => {
  // Re-import to get a fresh instance
  vi.resetModules();
  const mod = await vi.importActual('../../lib/logging/logger');
  logger = mod.logger;
  logger.clearLogs();
  logger.isEnabled = true;
});

describe('Logger', () => {
  describe('log', () => {
    it('creates a log entry with correct structure', () => {
      const entry = logger.log('DEBUG', 'test message', { key: 'value' });
      expect(entry).toBeDefined();
      expect(entry.level).toBe('DEBUG');
      expect(entry.message).toBe('test message');
      expect(entry.data).toEqual({ key: 'value' });
      expect(entry.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('does not log when disabled', () => {
      logger.isEnabled = false;
      const entry = logger.log('ERROR', 'should not log');
      expect(entry).toBeUndefined();
    });

    it('does not recurse (isLogging guard)', () => {
      // The isLogging flag prevents infinite recursion
      logger.isLogging = true;
      const entry = logger.log('INFO', 'nested');
      expect(entry).toBeUndefined();
    });
  });

  describe('logError', () => {
    it('logs Error instances with stack trace', () => {
      const error = new Error('Something broke');
      const entry = logger.logError(error, 'userStore.savePreferences');
      expect(entry.level).toBe('ERROR');
      expect(entry.message).toBe('Something broke');
      expect(entry.data.error).toContain('Error: Something broke');
      expect(entry.data.context).toBe('userStore.savePreferences');
    });

    it('handles non-Error values', () => {
      const entry = logger.logError('plain string error', 'context');
      expect(entry.level).toBe('ERROR');
      expect(entry.message).toBe('plain string error');
      expect(entry.data.error).toBe('plain string error');
    });

    it('handles null context', () => {
      const entry = logger.logError(new Error('test'));
      expect(entry.data.context).toBeNull();
    });
  });

  describe('logAPI', () => {
    it('logs API calls with method and URL', () => {
      const entry = logger.logAPI('POST', '/api/auth/login', 200, { id: 1 });
      expect(entry.level).toBe('API');
      expect(entry.message).toBe('POST /api/auth/login - 200');
      expect(entry.data).toEqual({ id: 1 });
    });

    it('logs API calls without status', () => {
      const entry = logger.logAPI('GET', '/api/properties');
      expect(entry.message).toBe('GET /api/properties');
    });
  });

  describe('logAction', () => {
    it('logs user actions', () => {
      const entry = logger.logAction('Button click', { button: 'submit' });
      expect(entry.level).toBe('ACTION');
      expect(entry.message).toBe('Button click');
      expect(entry.data).toEqual({ button: 'submit' });
    });
  });

  describe('logInfo', () => {
    it('logs info messages', () => {
      const entry = logger.logInfo('System started', { uptime: 100 });
      expect(entry.level).toBe('INFO');
      expect(entry.message).toBe('System started');
    });
  });

  describe('logDebug', () => {
    it('logs debug messages', () => {
      const entry = logger.logDebug('Cache hit', { key: 'xyz' });
      expect(entry.level).toBe('DEBUG');
      expect(entry.message).toBe('Cache hit');
    });
  });

  describe('max logs cap', () => {
    it('keeps only the last maxLogs entries', () => {
      logger.maxLogs = 5;
      for (let i = 0; i < 10; i++) {
        logger.log('INFO', `msg ${i}`);
      }
      const logs = logger.getLogs();
      expect(logs.length).toBeLessThanOrEqual(5);
      // First entry should be msg 5 (oldest kept)
      expect(logs[0].message).toBe('msg 5');
      // Last entry should be msg 9
      expect(logs[logs.length - 1].message).toBe('msg 9');
    });
  });

  describe('getLogs', () => {
    it('returns a shallow copy of logs', () => {
      logger.log('INFO', 'original');
      const logs = logger.getLogs();
      logs.push({});
      expect(logger.getLogs()).toHaveLength(1);
    });
  });

  describe('getLogsByLevel', () => {
    it('filters logs by level', () => {
      logger.log('INFO', 'info msg');
      logger.log('ERROR', 'error msg');
      logger.log('INFO', 'info msg 2');
      const errors = logger.getLogsByLevel('ERROR');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('error msg');
    });

    it('returns empty array for unknown level', () => {
      const result = logger.getLogsByLevel('NONEXISTENT');
      expect(result).toEqual([]);
    });
  });

  describe('getRecentLogs', () => {
    it('returns most recent N logs', () => {
      for (let i = 0; i < 10; i++) {
        logger.log('INFO', `msg ${i}`);
      }
      const recent = logger.getRecentLogs(3);
      expect(recent).toHaveLength(3);
      expect(recent[2].message).toBe('msg 9');
    });

    it('defaults to 50', () => {
      const result = logger.getRecentLogs();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('searchLogs', () => {
    it('finds logs by message content', () => {
      logger.log('ERROR', 'Connection refused');
      logger.log('INFO', 'Connection established');
      const results = logger.searchLogs('refused');
      expect(results).toHaveLength(1);
      expect(results[0].message).toBe('Connection refused');
    });

    it('finds logs by level', () => {
      logger.log('ERROR', 'something');
      logger.log('INFO', 'other');
      const results = logger.searchLogs('error');
      expect(results).toHaveLength(1);
    });

    it('finds logs by data content', () => {
      logger.log('ERROR', 'error', { userId: 'abc-123' });
      const results = logger.searchLogs('abc-123');
      expect(results).toHaveLength(1);
    });

    it('returns empty array when no match', () => {
      logger.log('INFO', 'test');
      const results = logger.searchLogs('nonexistent');
      expect(results).toEqual([]);
    });
  });

  describe('clearLogs', () => {
    it('removes all log entries', () => {
      logger.log('INFO', 'msg 1');
      logger.log('ERROR', 'msg 2');
      logger.clearLogs();
      expect(logger.getLogs()).toHaveLength(0);
    });
  });

  describe('toggleLogging', () => {
    it('disables and re-enables logging', () => {
      logger.toggleLogging(false);
      expect(logger.isEnabled).toBe(false);
      logger.toggleLogging(true);
      expect(logger.isEnabled).toBe(true);
    });
  });

  describe('getStats', () => {
    it('returns count and breakdown by level', () => {
      logger.log('INFO', 'a');
      logger.log('INFO', 'b');
      logger.log('ERROR', 'c');
      const stats = logger.getStats();
      expect(stats.totalLogs).toBe(3);
      expect(stats.byLevel.INFO).toBe(2);
      expect(stats.byLevel.ERROR).toBe(1);
    });

    it('returns zero stats with no logs', () => {
      const stats = logger.getStats();
      expect(stats.totalLogs).toBe(0);
      expect(stats.byLevel).toEqual({});
    });
  });

  describe('URL tracking in browser', () => {
    it('includes window.location.href in entries', () => {
      const entry = logger.log('INFO', 'page load');
      if (typeof window !== 'undefined') {
        expect(entry.url).toBeDefined();
      } else {
        expect(entry.url).toBe('N/A');
      }
    });
  });
});
