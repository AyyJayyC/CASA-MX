'use client';

import React, { useState, useEffect } from 'react';
import { RequireRole } from '@/components/guards/RequireRole.jsx';
import ActivityFeed from '@/components/analytics/ActivityFeed';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function authHeaders() {
  return { 'Content-Type': 'application/json' };
}

async function fetchUsersByRole() {
  try {
    const res = await fetch(`${BACKEND_URL}/admin/users`, {
      headers: authHeaders(),
      credentials: 'include',
    });
    if (!res.ok) return [];
    const { data } = await res.json();
    const byRole = {};
    (data || []).forEach((u) => {
      (u.roles || [])
        .filter((r) => r.status === 'approved')
        .forEach((r) => {
          const name = r.role?.name || r.roleName || 'unknown';
          byRole[name] = (byRole[name] || 0) + 1;
        });
    });
    return Object.keys(byRole).map((k) => ({ name: k, value: byRole[k] }));
  } catch {
    return [];
  }
}

async function fetchPropertiesByStatus() {
  try {
    const res = await fetch(`${BACKEND_URL}/properties?limit=500`, {
      headers: authHeaders(),
      credentials: 'include',
    });
    if (!res.ok) return [];
    const { data } = await res.json();
    const byStatus = {};
    (data || []).forEach((p) => {
      const s = p.status || 'unknown';
      byStatus[s] = (byStatus[s] || 0) + 1;
    });
    return Object.keys(byStatus).map((k) => ({ status: k, count: byStatus[k] }));
  } catch {
    return [];
  }
}

async function fetchEventsOverTime(days = 14) {
  try {
    const res = await fetch(`${BACKEND_URL}/admin/analytics/events?limit=500`, {
      headers: authHeaders(),
      credentials: 'include',
    });
    if (!res.ok) return [];
    const { data } = await res.json();
    const buckets = {};
    const now = new Date();
    for (let i = 0; i < days; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      buckets[d.toISOString().slice(0, 10)] = 0;
    }
    (data || []).forEach((e) => {
      const day = (e.createdAt || '').slice(0, 10);
      if (buckets[day] !== undefined) buckets[day]++;
    });
    return Object.keys(buckets)
      .map((k) => ({ date: k, count: buckets[k] }))
      .reverse();
  } catch {
    return [];
  }
}

export default function AdminAnalyticsPage() {
  const [usersByRole, setUsersByRole] = useState([]);
  const [propsByStatus, setPropsByStatus] = useState([]);
  const [eventsOverTime, setEventsOverTime] = useState([]);

  useEffect(() => {
    let isMounted = true;

    fetchUsersByRole().then((data) => {
      if (isMounted) setUsersByRole(data);
    });

    fetchPropertiesByStatus().then((data) => {
      if (isMounted) setPropsByStatus(data);
    });

    fetchEventsOverTime(14).then((data) => {
      if (isMounted) setEventsOverTime(data);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <RequireRole roles={["admin"]}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Admin Analytics</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <section className="bg-white border rounded p-4">
            <h2 className="font-semibold mb-2">Users by Role</h2>
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={usersByRole} dataKey="value" nameKey="name" outerRadius={60}>
                    {usersByRole.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={`hsl(${(idx * 60) % 360} 70% 50%)`} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="bg-white border rounded p-4">
            <h2 className="font-semibold mb-2">Properties by Status</h2>
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer>
                <BarChart data={propsByStatus}>
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3182CE" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="bg-white border rounded p-4 md:col-span-2">
            <h2 className="font-semibold mb-2">Events (last 14 days)</h2>
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer>
                <LineChart data={eventsOverTime}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#2B6CB0" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="bg-white border rounded p-4 md:col-span-2">
            <h2 className="font-semibold mb-2">Recent Activity</h2>
            <ActivityFeed limit={20} />
          </section>

        </div>
      </div>
    </RequireRole>
  );
}
