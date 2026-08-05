export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <div className="flex">

        {/* Sidebar */}
        <aside className="w-72 min-h-screen border-r border-slate-800 bg-slate-900 p-8">

          <h1 className="text-3xl font-bold text-cyan-400 mb-10">
            AEGRIS
          </h1>

          <nav className="space-y-4">

            <button className="w-full rounded-xl bg-cyan-500 px-5 py-3 text-left font-semibold text-slate-950">
              📊 Dashboard
            </button>

            <button className="w-full rounded-xl px-5 py-3 text-left hover:bg-slate-800">
              🛰️ AI Analýza
            </button>

            <button className="w-full rounded-xl px-5 py-3 text-left hover:bg-slate-800">
              🗺️ Mapy
            </button>

            <button className="w-full rounded-xl px-5 py-3 text-left hover:bg-slate-800">
              📁 Projekty
            </button>

            <button className="w-full rounded-xl px-5 py-3 text-left hover:bg-slate-800">
              📄 Reporty
            </button>

            <button className="w-full rounded-xl px-5 py-3 text-left hover:bg-slate-800">
              ⚙️ Nastavení
            </button>

          </nav>

        </aside>

        {/* Main Content */}
        <section className="flex-1 p-10">

          <div className="mb-10 flex items-center justify-between">

            <div>
              <h2 className="text-4xl font-bold">
                Dashboard
              </h2>

              <p className="text-slate-400 mt-2">
                Přehled celé platformy AEGRIS
              </p>
            </div>

            <div className="rounded-xl bg-slate-900 px-6 py-3">
              👤 Tomáš Polák
            </div>

          </div>

          {/* KPI */}
          <div className="grid md:grid-cols-4 gap-6">

            <div className="rounded-2xl bg-slate-900 p-6">
              <h3 className="text-slate-400">
                Projekty
              </h3>

              <p className="text-5xl font-bold text-cyan-400 mt-3">
                24
              </p>
            </div>

            <div className="rounded-2xl bg-slate-900 p-6">
              <h3 className="text-slate-400">
                AI Analýzy
              </h3>

              <p className="text-5xl font-bold text-green-400 mt-3">
                1284
              </p>
            </div>

            <div className="rounded-2xl bg-slate-900 p-6">
              <h3 className="text-slate-400">
                Reporty
              </h3>

              <p className="text-5xl font-bold text-yellow-400 mt-3">
                357
              </p>
            </div>

            <div className="rounded-2xl bg-slate-900 p-6">
              <h3 className="text-slate-400">
                Alerty
              </h3>

              <p className="text-5xl font-bold text-red-400 mt-3">
                7
              </p>
            </div>

          </div>

          {/* Dashboard */}
          <div className="grid lg:grid-cols-3 gap-6 mt-10">

            <div className="lg:col-span-2 rounded-2xl bg-slate-900 h-[420px] flex items-center justify-center text-slate-500 text-3xl">
              🗺️ Zde bude interaktivní mapa
            </div>

            <div className="rounded-2xl bg-slate-900 p-8">

              <h3 className="text-2xl font-bold mb-6">
                AI Assistant
              </h3>

              <div className="rounded-xl bg-slate-800 p-5 text-slate-400">
                Zde bude AI komunikovat s uživatelem,
                doporučovat analýzy a vytvářet reporty.
              </div>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}