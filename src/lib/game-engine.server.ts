import prompts from "@/content/prompts.json";
import responses from "@/content/responses.json";
import specials from "@/content/special.json";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type Card = { id: string; cat: string; text: string };
type Special = { id: string; name: string; text: string; effect: string };
type Credentials = { code: string; playerId: string; secret: string };

const AVATARS = ["🍻", "🧉", "🥟", "⚽", "🦆", "🐊", "🍷", "🕶️"];
const cleanCode = (code: string) => code.trim().toUpperCase();
const randomItem = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)] as T;
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

async function roomByCode(code: string) {
  const { data, error } = await supabaseAdmin.from("rooms").select("*").eq("code", cleanCode(code)).maybeSingle();
  if (error) throw new Error("No pudimos abrir la sala.");
  if (!data) throw new Error("Esa sala no existe.");
  return data;
}

async function authenticate(input: Credentials) {
  const room = await roomByCode(input.code);
  const { data: player } = await supabaseAdmin.from("players").select("*").eq("id", input.playerId).eq("room_id", room.id).eq("secret", input.secret).maybeSingle();
  if (!player) throw new Error("Tu lugar en esta mesa no es válido.");
  await supabaseAdmin.from("players").update({ last_seen: new Date().toISOString(), has_left: false }).eq("id", player.id);
  return { room, player };
}

function cardsFor(categories: string[], hidden: string[]) {
  const pool = (responses as Card[]).filter((card) => categories.includes(card.cat) && !hidden.includes(card.id));
  return pool.length >= 8 ? pool : (responses as Card[]).filter((card) => !hidden.includes(card.id));
}

async function dealHands(roomId: string, players: { id: string }[], categories: string[], hidden: string[]) {
  const pool = cardsFor(categories, hidden);
  for (const player of players) {
    const cards = shuffle(pool).slice(0, 7);
    const { error } = await supabaseAdmin.from("hands").upsert({ player_id: player.id, cards });
    if (error) throw new Error("No pudimos repartir las cartas.");
  }
}

async function openRound(room: Awaited<ReturnType<typeof roomByCode>>, players: { id: string }[], number: number) {
  const promptPool = (prompts as Card[]).filter((card) => room.categories.includes(card.cat) && !room.used_prompts.includes(card.id));
  const fallback = (prompts as Card[]).filter((card) => room.categories.includes(card.cat));
  const prompt = randomItem(promptPool.length ? promptPool : fallback.length ? fallback : (prompts as Card[]));
  const presenter = players[(number - 1) % players.length];
  if (!presenter) throw new Error("No hay suficientes jugadores.");
  const special = number % 3 === 0 ? randomItem(specials as Special[]) : null;
  const { data: round, error } = await supabaseAdmin.from("rounds").insert({ room_id: room.id, number, prompt, special, phase: "select", presenter_id: presenter.id }).select().single();
  if (error || !round) throw new Error("No pudimos abrir la ronda.");
  await supabaseAdmin.from("rooms").update({ status: "playing", round_number: number, current_round_id: round.id, used_prompts: [...room.used_prompts, prompt.id], updated_at: new Date().toISOString() }).eq("id", room.id);
  return round;
}

async function refreshRound(roomId: string, roundId: string) {
  const { data: round } = await supabaseAdmin.from("rounds").select("*").eq("id", roundId).maybeSingle();
  if (!round) return;
  const { data: active = [] } = await supabaseAdmin.from("players").select("id").eq("room_id", roomId).eq("has_left", false);
  const players = active ?? [];
  const { data: submissions = [] } = await supabaseAdmin.from("submissions").select("*").eq("round_id", roundId);
  const entries = submissions ?? [];
  if (round.phase === "select" && entries.length >= Math.max(1, players.length - 1)) {
    await supabaseAdmin.from("rounds").update({ phase: "vote" }).eq("id", roundId);
    round.phase = "vote";
  }
  if (round.phase !== "vote" || entries.length === 0) return;
  const eligibleVoters = players.filter((player) => entries.some((entry) => entry.player_id !== player.id));
  const { data: votes = [] } = await supabaseAdmin.from("votes").select("*").eq("round_id", roundId);
  if ((votes ?? []).length < eligibleVoters.length) return;
  const totals = new Map<string, number>();
  for (const vote of votes ?? []) totals.set(vote.submission_id, (totals.get(vote.submission_id) ?? 0) + 1);
  for (const entry of entries) await supabaseAdmin.from("submissions").update({ votes: totals.get(entry.id) ?? 0 }).eq("id", entry.id);
  const high = Math.max(...entries.map((entry) => totals.get(entry.id) ?? 0));
  const tied = entries.filter((entry) => (totals.get(entry.id) ?? 0) === high);
  const special = round.special as Special | null;
  const winners = special?.effect === "shared_tie" ? tied : [randomItem(tied)];
  const points = special?.effect === "double_points" ? 2 : 1;
  for (const winner of winners) {
    const { data: owner } = await supabaseAdmin.from("players").select("score,rounds_won,votes_received").eq("id", winner.player_id).single();
    if (owner) await supabaseAdmin.from("players").update({ score: owner.score + points, rounds_won: owner.rounds_won + 1, votes_received: owner.votes_received + high }).eq("id", winner.player_id);
  }
  await supabaseAdmin.from("rounds").update({ phase: "results" }).eq("id", roundId);
}

export async function createRoom(input: { name: string; avatar: string; categories: string[]; maxRounds: number; maxPlayers: number; mode: string }) {
  const code = Math.random().toString(36).slice(2, 7).toUpperCase();
  const secret = crypto.randomUUID();
  const { data: room, error } = await supabaseAdmin.from("rooms").insert({ code, categories: input.categories, max_rounds: input.maxRounds, max_players: input.maxPlayers, mode: input.mode }).select().single();
  if (error || !room) throw new Error("No pudimos crear la sala.");
  const { data: player, error: playerError } = await supabaseAdmin.from("players").insert({ room_id: room.id, name: input.name.trim().slice(0, 24), avatar: input.avatar, secret }).select().single();
  if (playerError || !player) throw new Error("No pudimos sentarte en la mesa.");
  await supabaseAdmin.from("rooms").update({ host_player_id: player.id }).eq("id", room.id);
  return { code, playerId: player.id, secret };
}

export async function joinRoom(input: { code: string; name: string; avatar: string }) {
  const room = await roomByCode(input.code);
  if (room.status !== "lobby") throw new Error("La partida ya arrancó.");
  const { count } = await supabaseAdmin.from("players").select("id", { count: "exact", head: true }).eq("room_id", room.id).eq("has_left", false);
  if ((count ?? 0) >= room.max_players) throw new Error("La mesa está llena.");
  const secret = crypto.randomUUID();
  const { data: player, error } = await supabaseAdmin.from("players").insert({ room_id: room.id, name: input.name.trim().slice(0, 24), avatar: input.avatar, secret }).select().single();
  if (error || !player) throw new Error("No pudimos sumarte a la mesa.");
  return { code: room.code, playerId: player.id, secret };
}

export async function setReady(input: Credentials & { ready: boolean }) {
  const { player } = await authenticate(input);
  await supabaseAdmin.from("players").update({ is_ready: input.ready }).eq("id", player.id);
  return { ok: true };
}

export async function startGame(input: Credentials) {
  const { room, player } = await authenticate(input);
  if (room.host_player_id !== player.id) throw new Error("Solo quien creó la sala puede arrancar.");
  const { data = [] } = await supabaseAdmin.from("players").select("*").eq("room_id", room.id).eq("has_left", false).order("created_at");
  const players = data ?? [];
  if (players.length < 2) throw new Error("Falta al menos una persona.");
  if (players.some((item) => !item.is_ready)) throw new Error("Todavía hay gente sin confirmar.");
  await dealHands(room.id, players, room.categories, room.hidden_cards);
  await openRound(room, players, 1);
  return { ok: true };
}

export async function submitCard(input: Credentials & { cardId: string }) {
  const { room, player } = await authenticate(input);
  if (!room.current_round_id) throw new Error("No hay ronda activa.");
  const { data: round } = await supabaseAdmin.from("rounds").select("*").eq("id", room.current_round_id).single();
  if (!round || round.phase !== "select" || round.presenter_id === player.id) throw new Error("Ahora no podés jugar esa carta.");
  const { data: hand } = await supabaseAdmin.from("hands").select("cards").eq("player_id", player.id).single();
  const cards = (hand?.cards ?? []) as unknown as Card[];
  const card = cards.find((item) => item.id === input.cardId);
  if (!card) throw new Error("Esa carta no está en tu mano.");
  const { error } = await supabaseAdmin.from("submissions").insert({ round_id: round.id, player_id: player.id, card });
  if (error) throw new Error("Ya elegiste una carta en esta ronda.");
  const replacement = randomItem(cardsFor(room.categories, room.hidden_cards).filter((item) => !cards.some((held) => held.id === item.id)));
  await supabaseAdmin.from("hands").update({ cards: [...cards.filter((item) => item.id !== card.id), replacement] }).eq("player_id", player.id);
  await refreshRound(room.id, round.id);
  return { ok: true };
}

export async function castVote(input: Credentials & { submissionId: string }) {
  const { room, player } = await authenticate(input);
  if (!room.current_round_id) throw new Error("No hay ronda activa.");
  const { data: round } = await supabaseAdmin.from("rounds").select("*").eq("id", room.current_round_id).single();
  const { data: submission } = await supabaseAdmin.from("submissions").select("*").eq("id", input.submissionId).eq("round_id", room.current_round_id).single();
  if (!round || round.phase !== "vote" || !submission || submission.player_id === player.id) throw new Error("Ese voto no vale.");
  const { error } = await supabaseAdmin.from("votes").insert({ round_id: round.id, voter_id: player.id, submission_id: submission.id });
  if (error) throw new Error("Ya votaste en esta ronda.");
  await refreshRound(room.id, round.id);
  return { ok: true };
}

export async function nextRound(input: Credentials) {
  const { room, player } = await authenticate(input);
  if (room.host_player_id !== player.id || !room.current_round_id) throw new Error("Solo quien creó la sala puede seguir.");
  const { data: round } = await supabaseAdmin.from("rounds").select("phase").eq("id", room.current_round_id).single();
  if (round?.phase !== "results") throw new Error("La ronda todavía no terminó.");
  if (room.round_number >= room.max_rounds) {
    await supabaseAdmin.from("rooms").update({ status: "finished", updated_at: new Date().toISOString() }).eq("id", room.id);
    return { finished: true };
  }
  const { data = [] } = await supabaseAdmin.from("players").select("id").eq("room_id", room.id).eq("has_left", false).order("created_at");
  await openRound(room, data ?? [], room.round_number + 1);
  return { finished: false };
}

export async function playAgain(input: Credentials) {
  const { room, player } = await authenticate(input);
  if (room.host_player_id !== player.id) throw new Error("Solo quien creó la sala puede reiniciar.");
  await supabaseAdmin.from("votes").delete().in("round_id", (await supabaseAdmin.from("rounds").select("id").eq("room_id", room.id)).data?.map((row) => row.id) ?? []);
  await supabaseAdmin.from("submissions").delete().in("round_id", (await supabaseAdmin.from("rounds").select("id").eq("room_id", room.id)).data?.map((row) => row.id) ?? []);
  await supabaseAdmin.from("rounds").delete().eq("room_id", room.id);
  await supabaseAdmin.from("players").update({ score: 0, rounds_won: 0, votes_received: 0, is_ready: false }).eq("room_id", room.id);
  await supabaseAdmin.from("rooms").update({ status: "lobby", round_number: 0, current_round_id: null, used_prompts: [], used_responses: [] }).eq("id", room.id);
  return { ok: true };
}

export async function reportCard(input: Credentials & { cardId: string; cardText: string }) {
  await authenticate(input);
  await supabaseAdmin.from("card_reports").insert({ card_id: input.cardId, card_text: input.cardText, room_code: cleanCode(input.code), reason: "Reportada durante la partida" });
  return { ok: true };
}

export async function getGameState(input: Credentials) {
  const { room, player } = await authenticate(input);
  if (room.current_round_id) await refreshRound(room.id, room.current_round_id);
  const fresh = await roomByCode(room.code);
  const { data: players = [] } = await supabaseAdmin.from("players").select("id,name,avatar,score,rounds_won,votes_received,is_ready,has_left,last_seen,created_at").eq("room_id", room.id).eq("has_left", false).order("created_at");
  const { data: hand } = await supabaseAdmin.from("hands").select("cards").eq("player_id", player.id).maybeSingle();
  type RoundView = { id: string; number: number; phase: string; prompt: Card; special: Special | null; presenter_id: string | null; deadline: string | null };
  type SubmissionView = { id: string; player_id: string | null; card: Card; votes: number };
  let round: RoundView | null = null;
  let submissions: SubmissionView[] = [];
  let mySubmissionId: string | null = null;
  let hasVoted = false;
  if (fresh.current_round_id) {
    const { data } = await supabaseAdmin.from("rounds").select("*").eq("id", fresh.current_round_id).single();
    round = data
      ? { id: data.id, number: data.number, phase: data.phase, prompt: data.prompt as unknown as Card, special: (data.special ?? null) as unknown as Special | null, presenter_id: data.presenter_id, deadline: data.deadline }
      : null;
    const { data: entries = [] } = await supabaseAdmin.from("submissions").select("id,player_id,card,votes").eq("round_id", fresh.current_round_id);
    mySubmissionId = entries?.find((entry) => entry.player_id === player.id)?.id ?? null;
    if (round && round.phase !== "select") {
      const phase = round.phase;
      submissions = (entries ?? []).map((entry) => ({ id: entry.id, card: entry.card as unknown as Card, votes: entry.votes, player_id: phase === "results" ? entry.player_id : null }));
    }
    const { data: vote } = await supabaseAdmin.from("votes").select("id").eq("round_id", fresh.current_round_id).eq("voter_id", player.id).maybeSingle();
    hasVoted = Boolean(vote);
  }

  return { room: fresh, me: { id: player.id }, players: players ?? [], hand: (hand?.cards ?? []) as unknown as Card[], round, submissions, mySubmissionId, hasVoted, avatars: AVATARS };
}