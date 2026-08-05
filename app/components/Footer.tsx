export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-12">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center">

        <div>
          <h2 className="text-cyan-400 text-2xl font-bold">
            AEGRIS
          </h2>

          <p className="text-slate-400 mt-2">
            Operational Intelligence Platform
          </p>
        </div>

        <div className="flex gap-8 text-slate-400 mt-8 md:mt-0">
          <a href="#">Platforma</a>
          <a href="#">Řešení</a>
          <a href="#">Kontakt</a>
          <a href="#">Dokumentace</a>
        </div>

      </div>

      <div className="text-center text-slate-500 mt-10 text-sm">
        © 2026 AEGRIS Technologies. All rights reserved.
      </div>
    </footer>
  );
}