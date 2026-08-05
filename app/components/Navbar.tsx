export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-8">

        {/* Logo */}
        <div className="text-2xl font-bold tracking-widest text-cyan-400">
          AEGRIS
        </div>

        {/* Navigation */}
        <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          <a href="#" className="hover:text-cyan-400 transition">
            Platform
          </a>

          <a href="#" className="hover:text-cyan-400 transition">
            Solutions
          </a>

          <a href="#" className="hover:text-cyan-400 transition">
            Technology
          </a>

          <a href="#" className="hover:text-cyan-400 transition">
            Company
          </a>

          <a href="#" className="hover:text-cyan-400 transition">
            Contact
          </a>
        </nav>

        {/* CTA */}
        <button className="rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400">
          Request Demo
        </button>

      </div>
    </header>
  );
}