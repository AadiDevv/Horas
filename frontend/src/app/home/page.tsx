'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/navbar';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div>
      <Navbar />
    </div>
  );
}