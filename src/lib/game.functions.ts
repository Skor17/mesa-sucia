import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const credentials = z.object({ code: z.string().min(4).max(8), playerId: z.string().uuid(), secret: z.string().uuid() });

export const createRoom = createServerFn({ method: "POST" }).inputValidator((data) => z.object({ name: z.string().min(1).max(24), avatar: z.string().min(1).max(8), categories: z.array(z.string()).min(1), maxRounds: z.number().int().min(3).max(15), maxPlayers: z.number().int().min(2).max(10), mode: z.enum(["duelo", "grupo", "rapida"]) }).parse(data)).handler(async ({ data }) => (await import("./game-engine.server")).createRoom(data));
export const joinRoom = createServerFn({ method: "POST" }).inputValidator((data) => z.object({ code: z.string().min(4).max(8), name: z.string().min(1).max(24), avatar: z.string().min(1).max(8) }).parse(data)).handler(async ({ data }) => (await import("./game-engine.server")).joinRoom(data));
export const getGameState = createServerFn({ method: "POST" }).inputValidator((data) => credentials.parse(data)).handler(async ({ data }) => (await import("./game-engine.server")).getGameState(data));
export const setReady = createServerFn({ method: "POST" }).inputValidator((data) => credentials.extend({ ready: z.boolean() }).parse(data)).handler(async ({ data }) => (await import("./game-engine.server")).setReady(data));
export const startGame = createServerFn({ method: "POST" }).inputValidator((data) => credentials.parse(data)).handler(async ({ data }) => (await import("./game-engine.server")).startGame(data));
export const submitCard = createServerFn({ method: "POST" }).inputValidator((data) => credentials.extend({ cardId: z.string() }).parse(data)).handler(async ({ data }) => (await import("./game-engine.server")).submitCard(data));
export const castVote = createServerFn({ method: "POST" }).inputValidator((data) => credentials.extend({ submissionId: z.string().uuid() }).parse(data)).handler(async ({ data }) => (await import("./game-engine.server")).castVote(data));
export const nextRound = createServerFn({ method: "POST" }).inputValidator((data) => credentials.parse(data)).handler(async ({ data }) => (await import("./game-engine.server")).nextRound(data));
export const playAgain = createServerFn({ method: "POST" }).inputValidator((data) => credentials.parse(data)).handler(async ({ data }) => (await import("./game-engine.server")).playAgain(data));
export const reportCard = createServerFn({ method: "POST" }).inputValidator((data) => credentials.extend({ cardId: z.string(), cardText: z.string().max(300) }).parse(data)).handler(async ({ data }) => (await import("./game-engine.server")).reportCard(data));