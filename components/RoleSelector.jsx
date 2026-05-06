"use client";
import React, { useState } from 'react';

const AVAILABLE_ROLES = ['Investor', 'Seller', 'Wholesaler', 'Admin'];

export default function RoleSelector({ currentRole = null, onRoleChange = () => {} }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((s) => !s)}
        className="px-3 py-1 border rounded"
        aria-haspopup="menu"
      >
        {currentRole ? `Rol: ${currentRole}` : 'Seleccionar rol'}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow p-2">
          <p className="text-sm text-gray-600 mb-2">Inicia sesión como</p>
          <ul className="space-y-1">
            {AVAILABLE_ROLES.map((r) => (
              <li key={r}>
                <button
                  className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded"
                  onClick={() => {
                    onRoleChange(r);
                    setOpen(false);
                  }}
                >
                  {r}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
