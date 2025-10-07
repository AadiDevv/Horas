'use client';

import Button from './button';

export default function Navbar() {
  return (
    <nav className="w-full bg-white px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      <h1 className="text-2xl font-bold text-gray-800">Horas.</h1>
      <Button onClick={() => alert('Login clicked!')}>Login</Button>
    </nav>
  );
}
