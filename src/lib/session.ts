export type Seat = { code: string; playerId: string; secret: string };

const key = (code: string) => `mesa:${code.toUpperCase()}`;

export function saveSeat(seat: Seat) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key(seat.code), JSON.stringify(seat));
}

export function readSeat(code: string): Seat | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(key(code));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Seat;
    return parsed.playerId && parsed.secret ? { ...parsed, code: code.toUpperCase() } : null;
  } catch {
    return null;
  }
}

export function clearSeat(code: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key(code));
}

export const AVATARS = ["🍻", "🧉", "🥟", "⚽", "🦆", "🐊", "🍷", "🕶️", "💀", "🔥"];

export const CATEGORIES: { id: string; label: string }[] = [
  { id: "argentina", label: "Argentina" },
  { id: "politica", label: "Política" },
  { id: "futbol", label: "Fútbol" },
  { id: "relaciones", label: "Relaciones" },
  { id: "sexo", label: "Sexo" },
  { id: "trabajo", label: "Trabajo" },
  { id: "universidad", label: "Universidad" },
  { id: "muerte", label: "Muerte" },
  { id: "religion", label: "Religión" },
  { id: "drogas", label: "Drogas" },
  { id: "famosos", label: "Famosos" },
  { id: "violencia", label: "Violencia" },
];
