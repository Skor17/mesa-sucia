import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { createRoom, joinRoom } from "@/lib/game.functions";
import { AVATARS, CATEGORIES, saveSeat } from "@/lib/session";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mesa Sucia — cartas de humor negro argentino" },
      { name: "description", content: "Juego de cartas online, gratis y sin vueltas: situaciones impresentables, respuestas peores y votación entre amigos. De 2 a 10 jugadores." },
      { property: "og:title", content: "Mesa Sucia — cartas de humor negro argentino" },
      { property: "og:description", content: "Armá una sala, pasá el código y jugá rondas de humor negro argentino con tus amigos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const DEFAULT_CATS = CATEGORIES.map((c) => c.id);

function Home() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"crear" | "unirse">("crear");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]!);
  const [code, setCode] = useState("");
  const [mode, setMode] = useState<"duelo" | "grupo" | "rapida">("grupo");
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [maxRounds, setMaxRounds] = useState(8);
  const [cats, setCats] = useState<string[]>(DEFAULT_CATS);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleCat = (id: string) =>
    setCats((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));

  async function handleCreate() {
    setError(null);
    if (!name.trim()) return setError("Poné un nombre, aunque sea falso.");
    if (cats.length === 0) return setError("Dejá prendida al menos una categoría.");
    setBusy(true);
    try {
      const seat = await createRoom({
        data: { name: name.trim(), avatar, categories: cats, maxRounds, maxPlayers, mode },
      });
      saveSeat(seat);
      navigate({ to: "/sala/$code", params: { code: seat.code } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos crear la sala.");
    } finally {
      setBusy(false);
    }
  }

  async function handleJoin() {
    setError(null);
    if (!name.trim()) return setError("Poné un nombre, aunque sea falso.");
    if (code.trim().length < 4) return setError("Ese código no parece real.");
    setBusy(true);
    try {
      const seat = await joinRoom({ data: { code: code.trim().toUpperCase(), name: name.trim(), avatar } });
      saveSeat(seat);
      navigate({ to: "/sala/$code", params: { code: seat.code } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos sumarte.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto w-full max-w-3xl">
        <header className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-accent">Cartas impresentables</p>
          <h1 className="mt-3 text-6xl font-black uppercase leading-[0.9] tracking-tight text-primary drop-shadow-[0_0_25px_oklch(0.85_0.22_145_/_0.35)] sm:text-8xl">
            Mesa Sucia
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Situaciones que no se cuentan en la mesa familiar, respuestas peores y una votación para
            decidir quién es la peor persona del grupo. De 2 a 10, todo online.
          </p>
        </header>

        <div className="mt-8 rounded-3xl border border-border bg-card p-5 shadow-2xl sm:p-7">
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1 text-center font-black uppercase">
            {(["crear", "unirse"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-xl px-4 py-3 transition ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {t === "crear" ? "Crear sala" : "Unirme"}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Tu nombre</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={24}
                placeholder="El Tano, Sofi, Lo que sea"
                className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Avatar</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {AVATARS.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAvatar(a)}
                    className={`h-12 w-12 rounded-xl border text-2xl transition ${avatar === a ? "border-primary bg-primary/15" : "border-border bg-muted hover:border-primary/60"}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {tab === "unirse" ? (
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Código de sala</label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  maxLength={8}
                  placeholder="XK3P9"
                  className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-center text-3xl font-black tracking-[0.4em] outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Modo</label>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value as typeof mode)}
                      className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-3 outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="duelo">Duelo 1v1</option>
                      <option value="grupo">Grupo</option>
                      <option value="rapida">Partida rápida</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Jugadores: {maxPlayers}</label>
                    <input type="range" min={2} max={10} value={maxPlayers} onChange={(e) => setMaxPlayers(Number(e.target.value))} className="mt-5 w-full accent-[oklch(0.85_0.22_145)]" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Rondas: {maxRounds}</label>
                    <input type="range" min={3} max={15} value={maxRounds} onChange={(e) => setMaxRounds(Number(e.target.value))} className="mt-5 w-full accent-[oklch(0.85_0.22_145)]" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Categorías</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => toggleCat(c.id)}
                        className={`rounded-full border px-4 py-2 text-sm font-bold uppercase transition ${cats.includes(c.id) ? "border-primary bg-primary/15 text-primary" : "border-border bg-muted text-muted-foreground"}`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {error ? <p className="rounded-xl bg-destructive/15 px-4 py-3 font-bold text-destructive">{error}</p> : null}

            <button
              disabled={busy}
              onClick={tab === "crear" ? handleCreate : handleJoin}
              className="w-full rounded-2xl bg-primary px-6 py-4 text-xl font-black uppercase tracking-wide text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
            >
              {busy ? "Aguantá..." : tab === "crear" ? "Abrir la mesa" : "Entrar a la mesa"}
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Humor adulto, negro y argentino. No es para susceptibles ni para menores.
        </p>
      </div>
    </main>
  );
}
