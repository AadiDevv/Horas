'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from './components/navbar';
import Hero from './components/herobanner';
import Feature from './components/featuresection';
import Testimonial from './components/testimonialsection';
import Contact from './components/contactsection';
import Footer from './components/footer';



export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token && role) {
      let redirectPath = '/home';
      if (role === 'employe') {
        redirectPath = '/dashboard-agent';
      } else if (role === 'manager') {
        redirectPath = '/dashboard-manager';
      }
      router.push(redirectPath);
    }
  }, [router]);

  return (
    <div className="bg-white min-h-screen font-sans">
      <Navbar />
      <Hero />
      <Feature />
      <Testimonial />
      <Contact />
      <Footer />
    </div>
  );
}
