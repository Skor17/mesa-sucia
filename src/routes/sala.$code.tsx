import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import {
  castVote,
  getGameState,
  joinRoom,
  nextRound,
  playAgain,
  reportCard,
  setReady,
  startGame,
  submitCard,
} from "@/lib/game.functions";
import { AVATARS, clearSeat, readSeat, saveSeat, type Seat } from "@/lib/session";

export const Route = createFileRoute("/sala/$code")({
  head: () => ({
    meta: [
      { title: "Sala de Mesa Sucia" },
      { name: "description", content: "Entrá con el código a esta mesa de cartas de humor negro argentino y jugá la ronda en vivo." },
      { property: "og:title", content: "Sala de Mesa Sucia" },
      { property: "og:description", content: "Te invitaron a una mesa de cartas impresentables. Poné tu nombre y jugá." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Sala,
});

function Sala() {
  const { code } = Route.useParams();
  const upper = code.toUpperCase();
  const [seat, setSeat] = useState<Seat | null>(null);
  const [ready, setReadyState] = useState(false);

  useEffect(() => {
    setSeat(readSeat(upper));
    setReadyState(true);
  }, [upper]);

  if (!ready) return <Shell><p className="text-muted-foreground">Abriendo la mesa...</p></Shell>;
  if (!seat) return <JoinSeat code={upper} onSeat={setSeat} />;
  return <Table seat={seat} onLeave={() => { clearSeat(upper); setSeat(null); }} />;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto w-full max-w-4xl">{children}</div>
    </main>
  );
}

function JoinSeat({ code, onSeat }: { code: string; onSeat: (seat: Seat) => void }) {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]!);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function join() {
    setError(null);
    if (!name.trim()) return setError("Poné un nombre.");
    setBusy(true);
    try {
      const seat = await joinRoom({ data: { code, name: name.trim(), avatar } });
      saveSeat(seat);
      onSeat(seat);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos sumarte.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      <div className="mx-auto max-w-lg rounded-3xl border border-border bg-card p-6">
        <h1 className="text-3xl font-black uppercase text-primary">Sala {code}</h1>
        <p className="mt-2 text-muted-foreground">Te invitaron a jugar. Elegí cómo te van a putear.</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={24}
          placeholder="Tu nombre"
          className="mt-5 w-full rounded-xl border border-input bg-background px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {AVATARS.map((a) => (
            <button
              key={a}
              onClick={() => setAvatar(a)}
              className={`h-12 w-12 rounded-xl border text-2xl ${avatar === a ? "border-primary bg-primary/15" : "border-border bg-muted"}`}
            >
              {a}
            </button>
          ))}
        </div>
        {error ? <p className="mt-4 rounded-xl bg-destructive/15 px-4 py-3 font-bold text-destructive">{error}</p> : null}
        <button
          disabled={busy}
          onClick={join}
          className="mt-5 w-full rounded-2xl bg-primary px-6 py-4 text-xl font-black uppercase text-primary-foreground disabled:opacity-50"
        >
          {busy ? "Aguantá..." : "Sentarme"}
        </button>
      </div>
    </Shell>
  );
}

function Table({ seat, onLeave }: { seat: Seat; onLeave: () => void }) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const state = useQuery({
    queryKey: ["mesa", seat.code, seat.playerId],
    queryFn: () => getGameState({ data: seat }),
    refetchInterval: 1200,
    retry: false,
  });

  async function run(action: () => Promise<unknown>) {
    setError(null);
    try {
      await action();
      await state.refetch();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Algo salió mal.");
    }
  }

  if (state.isPending) return <Shell><p className="text-muted-foreground">Cargando la mesa...</p></Shell>;

  if (state.isError) {
    return (
      <Shell>
        <div className="rounded-3xl border border-border bg-card p-6">
          <h1 className="text-2xl font-black uppercase text-destructive">No pudimos entrar</h1>
          <p className="mt-2 text-muted-foreground">
            {state.error instanceof Error ? state.error.message : "Tu lugar en esta mesa no es válido."}
          </p>
          <button onClick={onLeave} className="mt-5 rounded-xl bg-primary px-5 py-3 font-black uppercase text-primary-foreground">
            Volver a entrar
          </button>
        </div>
      </Shell>
    );
  }

  const data = state.data;
  const { room, players, hand, round, submissions, mySubmissionId, hasVoted } = data;
  const isHost = room.host_player_id === data.me.id;
  const isPresenter = round?.presenter_id === data.me.id;
  const link = typeof window !== "undefined" ? `${window.location.origin}/sala/${room.code}` : "";

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">Mesa Sucia</p>
        <h1 className="text-4xl font-black uppercase tracking-tight text-primary">{room.code}</h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            navigator.clipboard?.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="rounded-xl border border-border bg-muted px-4 py-2 text-sm font-bold uppercase"
        >
          {copied ? "¡Copiado!" : "Copiar invitación"}
        </button>
        <button onClick={() => navigate({ to: "/" })} className="rounded-xl border border-border px-4 py-2 text-sm font-bold uppercase text-muted-foreground">
          Salir
        </button>
      </div>
    </div>
  );

  const scoreboard = (
    <div className="mt-4 flex flex-wrap gap-2">
      {players.map((p) => (
        <div
          key={p.id}
          className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${p.id === data.me.id ? "border-primary bg-primary/10" : "border-border bg-muted"}`}
        >
          <span className="text-lg">{p.avatar}</span>
          <span className="font-bold">{p.name}</span>
          <span className="font-black text-primary">{p.score}</span>
          {room.status === "lobby" ? (
            <span className={p.is_ready ? "text-primary" : "text-muted-foreground"}>{p.is_ready ? "listo" : "esperando"}</span>
          ) : null}
        </div>
      ))}
    </div>
  );

  const me = players.find((p) => p.id === data.me.id);

  return (
    <Shell>
      {header}
      {scoreboard}
      {error ? <p className="mt-4 rounded-xl bg-destructive/15 px-4 py-3 font-bold text-destructive">{error}</p> : null}

      {room.status === "lobby" ? (
        <section className="mt-6 rounded-3xl border border-border bg-card p-6">
          <h2 className="text-2xl font-black uppercase">Lobby</h2>
          <p className="mt-2 text-muted-foreground">
            Pasá el código <span className="font-black text-secondary">{room.code}</span> o el link. Arranca cuando
            estén todos listos ({players.length}/{room.max_players}).
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => run(() => setReady({ data: { ...seat, ready: !me?.is_ready } }))}
              className={`rounded-2xl px-6 py-3 text-lg font-black uppercase ${me?.is_ready ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"}`}
            >
              {me?.is_ready ? "Ya no estoy listo" : "Estoy listo"}
            </button>
            {isHost ? (
              <button
                onClick={() => run(() => startGame({ data: seat }))}
                className="rounded-2xl bg-accent px-6 py-3 text-lg font-black uppercase text-accent-foreground"
              >
                Arrancar partida
              </button>
            ) : (
              <p className="self-center text-muted-foreground">Esperando a quien creó la sala.</p>
            )}
          </div>
        </section>
      ) : null}

      {room.status === "playing" && round ? (
        <section className="mt-6 space-y-5">
          <div className="rounded-3xl border border-accent/40 bg-card p-6 shadow-[0_0_40px_oklch(0.62_0.23_25_/_0.15)]">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <span>Ronda {round.number} de {room.max_rounds}</span>
              <span>{round.phase === "select" ? "Eligiendo" : round.phase === "vote" ? "Votando" : "Resultados"}</span>
            </div>
            <p className="mt-3 text-3xl font-black leading-tight sm:text-4xl">{round.prompt.text}</p>
            {round.special ? (
              <p className="mt-4 rounded-2xl border border-secondary/50 bg-secondary/10 px-4 py-3 text-secondary">
                <span className="font-black uppercase">{round.special.name}: </span>
                {round.special.text}
              </p>
            ) : null}
            <p className="mt-3 text-sm text-muted-foreground">
              Presenta: {players.find((p) => p.id === round.presenter_id)?.name ?? "—"}
            </p>
          </div>

          {round.phase === "select" ? (
            isPresenter ? (
              <p className="rounded-2xl border border-border bg-card p-5 text-lg text-muted-foreground">
                Esta ronda presentás vos. Mirá cómo se hunden los demás.
              </p>
            ) : mySubmissionId ? (
              <p className="rounded-2xl border border-primary/40 bg-primary/10 p-5 text-lg font-bold text-primary">
                Carta jugada. Falta que el resto se decida.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {hand.map((card) => (
                  <div key={card.id} className="rounded-2xl border border-border bg-card p-4">
                    <p className="text-lg font-bold">{card.text}</p>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => run(() => submitCard({ data: { ...seat, cardId: card.id } }))}
                        className="rounded-xl bg-primary px-4 py-2 font-black uppercase text-primary-foreground"
                      >
                        Jugar
                      </button>
                      <button
                        onClick={() => run(() => reportCard({ data: { ...seat, cardId: card.id, cardText: card.text } }))}
                        className="rounded-xl border border-border px-4 py-2 text-sm font-bold uppercase text-muted-foreground"
                      >
                        Reportar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : null}

          {round.phase === "vote" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {submissions.map((entry) => {
                const mine = entry.id === mySubmissionId;
                return (
                  <button
                    key={entry.id}
                    disabled={mine || hasVoted}
                    onClick={() => run(() => castVote({ data: { ...seat, submissionId: entry.id } }))}
                    className={`rounded-2xl border p-5 text-left text-lg font-bold transition ${mine ? "border-secondary/50 bg-secondary/10" : "border-border bg-card hover:border-primary"} ${hasVoted && !mine ? "opacity-60" : ""}`}
                  >
                    {entry.card.text}
                    {mine ? <span className="mt-2 block text-sm uppercase text-secondary">Tu carta</span> : null}
                  </button>
                );
              })}
              {hasVoted ? <p className="text-muted-foreground">Votaste. Esperando al resto.</p> : null}
            </div>
          ) : null}

          {round.phase === "results" ? (
            <div className="space-y-3">
              {[...submissions]
                .sort((a, b) => b.votes - a.votes)
                .map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between gap-4 rounded-2xl border p-5 ${index === 0 ? "border-primary bg-primary/10" : "border-border bg-card"}`}
                  >
                    <div>
                      <p className="text-lg font-bold">{entry.card.text}</p>
                      <p className="text-sm text-muted-foreground">
                        {players.find((p) => p.id === entry.player_id)?.name ?? "Alguien"}
                      </p>
                    </div>
                    <span className="text-3xl font-black text-primary">{entry.votes}</span>
                  </div>
                ))}
              {isHost ? (
                <button
                  onClick={() => run(() => nextRound({ data: seat }))}
                  className="w-full rounded-2xl bg-accent px-6 py-4 text-xl font-black uppercase text-accent-foreground"
                >
                  {room.round_number >= room.max_rounds ? "Ver ranking final" : "Siguiente ronda"}
                </button>
              ) : (
                <p className="text-muted-foreground">Esperando que sigan la partida.</p>
              )}
            </div>
          ) : null}
        </section>
      ) : null}

      {room.status === "finished" ? (
        <Final players={players} isHost={isHost} onAgain={() => run(() => playAgain({ data: seat }))} onNew={() => navigate({ to: "/" })} />
      ) : null}
    </Shell>
  );
}

type PlayerRow = { id: string; name: string; avatar: string; score: number; rounds_won: number; votes_received: number };

function Final({ players, isHost, onAgain, onNew }: { players: PlayerRow[]; isHost: boolean; onAgain: () => void; onNew: () => void }) {
  const ranking = [...players].sort((a, b) => b.score - a.score || b.rounds_won - a.rounds_won);
  const champ = ranking[0];
  const mostVoted = [...players].sort((a, b) => b.votes_received - a.votes_received)[0];
  const worst = ranking[ranking.length - 1];

  return (
    <section className="mt-6 space-y-4">
      <div className="rounded-3xl border border-primary bg-primary/10 p-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">Se terminó</p>
        <p className="mt-2 text-6xl">{champ?.avatar}</p>
        <h2 className="text-4xl font-black uppercase text-primary">{champ?.name ?? "Nadie"}</h2>
        <p className="mt-1 text-muted-foreground">{champ?.score ?? 0} puntos y cero vergüenza.</p>
      </div>

      <div className="rounded-3xl border border-border bg-card p-5">
        {ranking.map((p, i) => (
          <div key={p.id} className="flex items-center justify-between border-b border-border py-3 last:border-0">
            <span className="flex items-center gap-3 font-bold">
              <span className="w-6 text-muted-foreground">{i + 1}</span>
              <span className="text-xl">{p.avatar}</span>
              {p.name}
            </span>
            <span className="text-sm text-muted-foreground">
              {p.score} pts · {p.rounds_won} rondas · {p.votes_received} votos
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-secondary/40 bg-secondary/10 p-5 text-secondary">
        <p className="font-black uppercase">Estadística inútil</p>
        <p className="mt-1">
          {mostVoted?.name ?? "Alguien"} juntó {mostVoted?.votes_received ?? 0} votos: suficiente para una banca,
          insuficiente para que lo inviten al asado. {worst?.name ?? "Alguien"} cerró último y va a decir que el
          juego estaba arreglado.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {isHost ? (
          <button onClick={onAgain} className="rounded-2xl bg-primary px-6 py-4 text-lg font-black uppercase text-primary-foreground">
            Jugar otra
          </button>
        ) : null}
        <button onClick={onNew} className="rounded-2xl border border-border px-6 py-4 text-lg font-black uppercase">
          Nueva sala
        </button>
      </div>
    </section>
  );
}
