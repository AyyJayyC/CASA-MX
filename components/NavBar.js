"use client";
import { useState } from 'react';
import Link from 'next/link';
import RoleSelector from './RoleSelector';

export default function NavBar() {
  const [currentRole, setCurrentRole] = useState(null);

  return (
    <header className="bg-white border-b">
      <div className="container flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-bold">CASA MX</Link>
          <nav className="hidden md:flex gap-3 text-sm text-gray-700">
            <Link href="/properties">Propiedades</Link>
            <Link href="/upload">Subir</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <RoleSelector
            onRoleChange={(r) => setCurrentRole(r)}
            currentRole={currentRole}
          />
        </div>
      </div>
    </header>
  );
}
