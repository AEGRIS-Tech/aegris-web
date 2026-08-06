"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import WorldMap from "./components/WorldMap";
import NewProjectModal from "./components/NewProjectModal";
import Link from "next/link";
import { User } from "@supabase/supabase-js";

type Project = {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  status: string;
  created_at?: string;
};

export default function DashboardPage() {
  const [selectedProject, setSelectedProject] = useState<Project>({
    name: "No project selected",
    latitude: 0,
    longitude: 0,
    status: "Waiting",
  });

  const [projects, setProjects] = useState<Project[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

const [newLocation, setNewLocation] = useState({
  latitude: 0,
  longitude: 0,
});

  useEffect(() => {
  async function init() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
  window.location.href = "/login";
  return;
}

    setUser(user);

    loadProjects(user.id);
  }

  init();
}, []);

  async function loadProjects(userId: string) {
    const { data, error } = await supabase
  .from("projects")
  .select("*")
  .eq("user_id", userId)
  .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setProjects((data as Project[]) ?? []);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex">

        {/* Sidebar */}
        <aside className="w-72 min-h-screen border-r border-slate-800 bg-slate-900 p-8">

          <h1 className="mb-10 text-3xl font-bold text-cyan-400">
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

            <Link
  href="/projects"
  className="block w-full rounded-xl px-5 py-3 text-left hover:bg-slate-800"
>
  📁 Projekty
</Link>

            <button className="w-full rounded-xl px-5 py-3 text-left hover:bg-slate-800">
              📄 Reporty
            </button>

            <button className="w-full rounded-xl px-5 py-3 text-left hover:bg-slate-800">
              ⚙️ Nastavení
            </button>

          </nav>

        </aside>

        <section className="flex-1 p-10">

          <div className="mb-10 flex items-center justify-between">

            <div>

              <h2 className="text-4xl font-bold">
                Dashboard
              </h2>

              <p className="mt-2 text-slate-400">
                Přehled celé platformy AEGRIS
              </p>

            </div>

            <div className="flex items-center gap-4">
  <div className="rounded-xl bg-slate-900 px-6 py-3">
    👤 {user?.email}
  </div>

  <button
    onClick={async () => {
      await supabase.auth.signOut();
      window.location.href = "/login";
    }}
    className="rounded-xl bg-red-600 px-5 py-3 font-semibold"
  >
    Odhlásit se
  </button>
</div>

          </div>

          <div className="grid gap-6 md:grid-cols-4">

            <div className="rounded-2xl bg-slate-900 p-6">
              <h3 className="text-slate-400">Projekty</h3>
              <p className="mt-3 text-5xl font-bold text-cyan-400">
                {projects.length}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-900 p-6">
              <h3 className="text-slate-400">AI Analýzy</h3>
              <p className="mt-3 text-5xl font-bold text-green-400">
                1284
              </p>
            </div>

            <div className="rounded-2xl bg-slate-900 p-6">
              <h3 className="text-slate-400">Reporty</h3>
              <p className="mt-3 text-5xl font-bold text-yellow-400">
                357
              </p>
            </div>

            <div className="rounded-2xl bg-slate-900 p-6">
              <h3 className="text-slate-400">Alerty</h3>
              <p className="mt-3 text-5xl font-bold text-red-400">
                7
              </p>
            </div>

          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">            
            <div className="h-[420px] lg:col-span-2">

  <WorldMap
    projects={projects}
    onLocationSelect={(location) => {
      setNewLocation({
        latitude: location.latitude,
        longitude: location.longitude,
      });

      setModalOpen(true);
    }}
  />

</div>
            <div className="rounded-2xl bg-slate-900 p-8">

              <h3 className="mb-6 text-2xl font-bold">
                AI Assistant
              </h3>

              <div className="space-y-4 rounded-xl bg-slate-800 p-5">

                <p>
                  <span className="text-slate-400">
                    Projekt:
                  </span>

                  <br />

                  <span className="font-semibold text-cyan-400">
                    {selectedProject.name}
                  </span>
                </p>

                <p>
                  <span className="text-slate-400">
                    Latitude:
                  </span>

                  <br />

                  <span>
                    {selectedProject.latitude.toFixed(5)}
                  </span>
                </p>

                <p>
                  <span className="text-slate-400">
                    Longitude:
                  </span>

                  <br />

                  <span>
                    {selectedProject.longitude.toFixed(5)}
                  </span>
                </p>

                <p>
                  <span className="text-slate-400">
                    Status:
                  </span>

                  <br />

                  <span className="font-semibold text-green-400">
                    {selectedProject.status}
                  </span>
                </p>

                <div className="border-t border-slate-700 pt-4">

                  <p className="mb-2 text-sm text-slate-400">
                    Uložené projekty
                  </p>

                  <div className="max-h-48 space-y-2 overflow-y-auto">

                    {projects.length === 0 && (
                      <p className="text-sm text-slate-500">
                        Zatím žádné projekty.
                      </p>
                    )}

                    {projects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => setSelectedProject(project)}
                        className="w-full rounded-lg bg-slate-700 p-3 text-left transition hover:bg-slate-600"
                      >
                        <div className="font-medium text-cyan-400">
                          {project.name}
                        </div>

                        <div className="text-xs text-slate-400">
                          {project.latitude.toFixed(4)},{" "}
                          {project.longitude.toFixed(4)}
                        </div>

                        <div className="text-xs text-green-400">
                          {project.status}
                        </div>
                      </button>
                    ))}

                  </div>

                </div>

              </div>

            </div> 
            </div>
            <NewProjectModal
  open={modalOpen}
  latitude={newLocation.latitude}
  longitude={newLocation.longitude}
  onClose={() => setModalOpen(false)}
  onSave={async (project) => {
    console.log("Ukládám projekt", project);
    const { error } = await supabase
      .from("projects")
      .insert([
  {
    ...project,
    user_id: user?.id,
  },
]);

    if (error) {
      console.error(error);
      return;
    }

    if (user) {
  await loadProjects(user.id);
}
    setSelectedProject(project);
    setModalOpen(false);
  }}
/>
        </section>

      </div>

    </main>
  );
}