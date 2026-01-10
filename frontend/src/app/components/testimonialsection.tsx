'use client';

export default function Testimonial() {
  return (
    <section className="flex justify-center items-center py-12 md:py-24 px-6 bg-white">
      <div className="bg-[#333333] text-white rounded-2xl p-6 md:p-12 max-w-4xl text-center shadow-lg">
        <p className="text-xl font-medium mb-10 leading-relaxed">
          “Depuis que j’utilise Horas, ma gestion du temps a complètement changé.
          L’application m’aide à mieux organiser mes journées, à rester concentrée
          et à suivre mes progrès sans stress.
          J’ai enfin l’impression de maîtriser mon emploi du temps.”
        </p>

        <div className="flex flex-col items-center gap-3">
          <img
            src="https://randomuser.me/api/portraits/men/44.jpg"
            alt="User testimonial"
            className="w-14 h-14 rounded-full border border-gray-500"
          />
          <h4 className="text-white font-semibold">Johnny Owens</h4>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-yellow-400 text-lg">★</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
