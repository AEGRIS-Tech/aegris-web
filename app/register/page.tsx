"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function register() {
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Účet byl vytvořen.");

    router.push("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 p-8">
        <h1 className="mb-6 text-3xl font-bold text-cyan-400">
          Registrace
        </h1>

        <input
          className="mb-4 w-full rounded-xl bg-slate-800 p-3 text-white"
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="mb-6 w-full rounded-xl bg-slate-800 p-3 text-white"
          type="password"
          placeholder="Heslo"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={register}
          disabled={loading}
          className="w-full rounded-xl bg-cyan-500 py-3 font-bold text-slate-900 hover:bg-cyan-400"
        >
          {loading ? "Registruji..." : "Registrovat"}
        </button>
      </div>
    </main>
  );
}