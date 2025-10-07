'use client';

import Image from 'next/image';
import featureImage from '../assets/preview.png'; // remplace par ton image

export default function Features() {
  const features = [
    {
      title: 'Gagnez du temps',
      description:
        'Automatisez vos tâches répétitives et concentrez-vous sur l’essentiel.',
      icon: '⏱️',
    },
    {
      title: 'Travaillez efficacement',
      description:
        'Visualisez vos priorités et suivez vos progrès en temps réel.',
      icon: '⚡',
    },
    {
      title: 'Restez organisé',
      description:
        'Une interface claire et intuitive pour planifier vos journées sans stress.',
      icon: '📅',
    },
  ];

  return (
    <section className="w-full bg-white py-24 px-6 sm:px-12 flex flex-col items-center">
      {/* IMAGE CENTRÉE */}
      <div className="relative w-full max-w-5xl mx-auto">
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-lg">
          <Image
            src={featureImage}
            alt="Présentation du produit Horas"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* TITRE + AVANTAGES */}
      <div className="mt-20 max-w-5xl mx-auto text-center">
        

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {features.map((f, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="text-5xl mb-4">{f.icon}</div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">{f.title}</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
