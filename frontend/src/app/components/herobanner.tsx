'use client';

import Button from './button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import productImage from '../assets/dashboard-manager.png';

export default function Hero() {
  const router = useRouter();
  return (
    <section className="bg-white min-h-screen flex items-center px-6 sm:px-16 font-sans">
      <div className="flex flex-col lg:flex-row items-center lg:justify-between w-full max-w-7xl mx-auto gap-10">
        
        {/* Texte + CTA à gauche */}
        <div className="w-full lg:w-1/2 text-center lg:text-left">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            Gérez votre temps efficacement
          </h1>
          <p className="text-gray-700 text-lg sm:text-xl mb-8 max-w-lg">
            Horas vous aide à organiser vos journées, suivre vos équipes et émarger avec simplicité.
          </p>
          <Button
            onClick={() => router.push('/login')}
            className="text-white px-6 py-3 rounded-lg shadow-lg transition duration-300"
          >
            Commencer
          </Button>
        </div>

        {/* Image produit à droite */}
        <div className="w-full lg:w-1/2">
          <Image
            src={productImage}
            alt="Product"
            className="w-full h-auto rounded-xl shadow-lg"
            priority
          />
        </div>

      </div>
    </section>
  );
}
