'use client';

import Image from 'next/image';
import featureImage from '../assets/dashbaord-agent.png';

export default function Features() {
  const features = [
    {
      title: 'Suivez vos heures simplement',
      description:
        'Enregistrez vos arrivées, départs et pauses en un clic. Fini les feuilles de présence manuelles.',
      icon: '⏱️',
    },
    {
      title: 'Gérez vos équipes en temps réel',
      description:
        'Visualisez la présence de vos agents, leurs heures travaillées et les absences depuis un tableau clair et centralisé.',
      icon: '👥',
    },
    {
      title: 'Pilotez avec des indicateurs fiables',
      description:
        'Accédez à des statistiques précises sur le temps de travail, les retards et la productivité de vos équipes.',
      icon: '📊',
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
            className="object-cover object-top"
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
