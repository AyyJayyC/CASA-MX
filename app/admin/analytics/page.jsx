'use client';

import React, { useState, useEffect } from 'react';
import { RequireRole } from '@/components/guards/RequireRole.jsx';
import ActivityFeed from '@/components/analytics/ActivityFeed';
import analytics from '@/lib/analytics';
import { getItem } from '@/lib/storage/storage';
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

function aggregateUsersByRole() {
  if (typeof window === 'undefined') return [];
  const users = getItem('users') || [];
  const byRole = {};
  users.forEach((u) => {
    (u.roles || []).forEach((r) => {
      byRole[r.type] = (byRole[r.type] || 0) + 1;
    });
  });
  return Object.keys(byRole).map((k) => ({ name: k, value: byRole[k] }));
}

function aggregatePropertiesByStatus() {
  if (typeof window === 'undefined') return [];
  const properties = getItem('properties') || [];
  const byStatus = {};
  properties.forEach((p) => {
    const s = p.status || 'unknown';
    byStatus[s] = (byStatus[s] || 0) + 1;
  });
  return Object.keys(byStatus).map((k) => ({ status: k, count: byStatus[k] }));
}

function aggregateEventsOverTime(days = 7) {
  if (typeof window === 'undefined') return [];
  const events = analytics.getRecentEvents(200);
  const buckets = {};
  const now = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    buckets[d.toISOString().slice(0, 10)] = 0;
  }
  events.forEach((e) => {
    const day = e.timestamp.slice(0, 10);
    if (buckets[day] !== undefined) buckets[day]++;
  });
  return Object.keys(buckets)
    .map((k) => ({ date: k, count: buckets[k] }))
    .reverse();
}

export default function AdminAnalyticsPage() {
  const [usersByRole, setUsersByRole] = useState([]);
  const [propsByStatus, setPropsByStatus] = useState([]);
  const [eventsOverTime, setEventsOverTime] = useState([]);

  useEffect(() => {
    setUsersByRole(aggregateUsersByRole());
    setPropsByStatus(aggregatePropertiesByStatus());
    setEventsOverTime(aggregateEventsOverTime(14));
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
