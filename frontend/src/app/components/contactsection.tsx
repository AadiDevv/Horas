'use client';

export default function ContactSection() {
  return (
    <section className="flex flex-col md:flex-row items-center justify-between gap-12 px-4 py-12 md:px-8 md:py-24 max-w-6xl mx-auto">
      {/* Bloc texte à gauche */}
      <div className="flex-1 text-left">
        <h2 className="text-4xl font-semibold text-[#333333] mb-4">
          Des questions?
          <br />
          Parlons-en
        </h2>
        <p className="text-[#333333]/80 mb-8">
          Contactez-nous via ce formulaire de contact — c'est toujours un plaisir d'aider !
        </p>
        <p className="text-sm text-[#333333]/60">Nous répondons généralement en 24 hours.</p>
      </div>

      {/* Formulaire à droite */}
      <form
        className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm p-8 w-full max-w-md"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="mb-5">
          <label htmlFor="name" className="block text-sm font-medium text-[#333333] mb-2">
            lastName
          </label>
          <input
            type="text"
            id="name"
            placeholder="Jean Dupont"
            className="w-full px-4 py-3 bg-[#f7f7f7] text-[#333333] placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#333333]"
          />
        </div>

        <div className="mb-5">
          <label htmlFor="email" className="block text-sm font-medium text-[#333333] mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            placeholder="jean.dupont@gmail.com"
            className="w-full px-4 py-3 bg-[#f7f7f7] text-[#333333] placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#333333]"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="message" className="block text-sm font-medium text-[#333333] mb-2">
            Message
          </label>
          <textarea
            id="message"
            rows={4}
            placeholder="Écrivez votre message..."
            className="w-full px-4 py-3 bg-[#f7f7f7] text-[#333333] placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#333333] resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#333333] text-white font-semibold py-3 rounded-lg hover:bg-[#444444] transition"
        >
          Envoyer
        </button>
      </form>
    </section>
  );
}
