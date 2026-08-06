"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

type Project = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  status: string;
  created_at: string;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [user, setUser] = useState<User | null>(null);

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

    setProjects(data ?? []);
  }
  async function deleteProject(id: number) {
    const ok = confirm("Opravdu chcete projekt smazat?");
    if (!ok) return;

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    if (user) {
  loadProjects(user.id);
}
} 
  return (
    <main className="min-h-screen bg-slate-950 p-10 text-white">
      <h1 className="mb-8 text-4xl font-bold text-cyan-400">
        Projekty
      </h1>

      <div className="grid gap-6">

        {projects.length === 0 && (
          <div className="rounded-xl bg-slate-900 p-6">
            Žádné projekty.
          </div>
        )}

        {projects.map((project) => (
          <div
            key={project.id}
            className="rounded-2xl bg-slate-900 p-6"
          >
            <h2 className="text-2xl font-bold text-cyan-400">
              {project.name}
            </h2>

            <div className="mt-4 space-y-2 text-slate-300">
              <p>Status: {project.status}</p>
              <p>Latitude: {project.latitude.toFixed(5)}</p>
              <p>Longitude: {project.longitude.toFixed(5)}</p>
            </div>

            <div className="mt-6 flex gap-3">

              <Link
                href={`/projects/${project.id}`}
                className="rounded-xl bg-cyan-500 px-4 py-2 font-semibold text-slate-950"
              >
                Otevřít
              </Link>

              <button
                className="rounded-xl bg-yellow-500 px-4 py-2 font-semibold text-black"
              >
                Upravit
              </button>

              <button
                onClick={() => deleteProject(project.id)}
                className="rounded-xl bg-red-600 px-4 py-2 font-semibold"
              >
                Smazat
              </button>

            </div>

          </div>
        ))}

      </div>
    </main>
  );
}