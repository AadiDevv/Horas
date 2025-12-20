'use client';

export default function Footer() {
  return (
    <footer className="bg-[#171717] text-gray-300 py-10 px-6 md:px-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <h2 className="text-white font-semibold text-lg">Horas.</h2>

        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <a href="#" className="hover:text-white transition">Privacy policy</a>
          <a href="#" className="hover:text-white transition">Cookies policy</a>
          <a href="#" className="hover:text-white transition">Terms of use</a>
        </div>

        <p className="text-sm text-gray-500">
          © Horas 2025
        </p>
      </div>
    </footer>
  );
}
