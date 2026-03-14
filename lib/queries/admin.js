/**
 * React Query hooks for admin operations
 * Purpose: Manage pending role approvals, audit logs, and user list with caching.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPendingApprovals,
  approveRole,
  rejectRole,
  getAuditLogs,
} from '../api/users';
import { getAllUsers } from '../api/auth';

export const ADMIN_KEYS = {
  pendingApprovals: ['admin', 'pendingApprovals'],
  auditLogs: (limit) => ['admin', 'auditLogs', limit],
  users: ['admin', 'users'],
};

/**
 * usePendingApprovals — lists all role requests awaiting admin action
 */
export function usePendingApprovals() {
  return useQuery(ADMIN_KEYS.pendingApprovals, () => getPendingApprovals(), {
    staleTime: 1000 * 30, // 30 s — approval queue changes frequently
    refetchOnWindowFocus: true,
  });
}

/**
 * useApproveRole — mutation that approves a pending role
 * Automatically invalidates the pending-approvals and audit-logs caches.
 */
export function useApproveRole() {
  const queryClient = useQueryClient();

  return useMutation(
    ({ userId, roleType }) => approveRole({ userId, roleType }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(ADMIN_KEYS.pendingApprovals);
        queryClient.invalidateQueries(['admin', 'auditLogs']);
      },
    }
  );
}

/**
 * useRejectRole — mutation that denies a pending role
 */
export function useRejectRole() {
  const queryClient = useQueryClient();

  return useMutation(
    ({ userId, roleType }) => rejectRole({ userId, roleType }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(ADMIN_KEYS.pendingApprovals);
        queryClient.invalidateQueries(['admin', 'auditLogs']);
      },
    }
  );
}

/**
 * useAuditLogs — fetches the last N audit log entries (admin only)
 * @param {number} limit
 */
export function useAuditLogs(limit = 100) {
  return useQuery(
    ADMIN_KEYS.auditLogs(limit),
    () => getAuditLogs({ limit }),
    {
      staleTime: 1000 * 60, // 1 min — logs are append-only, don't change often
      refetchOnWindowFocus: false,
    }
  );
}

/**
 * useAllUsers — fetches all registered users with their roles (admin only)
 */
export function useAllUsers() {
  return useQuery(ADMIN_KEYS.users, () => getAllUsers(), {
    staleTime: 1000 * 60 * 2, // 2 min
    refetchOnWindowFocus: false,
  });
}
