'use client';

import Navbar from '../components/navbar';
import Hero from '../components/herobanner';
import Feature from '../components/featuresection';
import Testimonial from '../components/testimonialsection';


export default function Home() {
  return (
    <div className="bg-white min-h-screen font-sans">
      <Navbar />
      <Hero />
      <Feature />
      <Testimonial />
    </div>
  );
}
