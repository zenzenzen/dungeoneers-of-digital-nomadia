import { z } from "zod";
import { currencies } from "../src/shared/types";
const id = z.string().min(1).max(100);
export const commandSchema = z.discriminatedUnion("type", [
  z
    .object({
      type: z.enum([
        "start",
        "reveal",
        "self_care",
        "therapy",
        "decline",
        "ready",
        "pass",
        "protect",
        "resolve",
        "escape",
        "end_turn",
        "rematch",
      ]),
    })
    .strict(),
  z.object({ type: z.literal("finale"), cardId: id }).strict(),
  z
    .object({
      type: z.literal("buy"),
      instanceId: id,
      replaceId: id.optional(),
    })
    .strict(),
  z
    .object({
      type: z.literal("offer"),
      helperId: id,
      currency: z.enum(currencies),
      amount: z.number().int().min(0).max(1e9),
      loot: z.number().int().min(0).max(10),
    })
    .strict(),
  z.object({ type: z.literal("accept"), offerId: id }).strict(),
  z.object({ type: z.literal("play"), instanceId: id }).strict(),
  z
    .object({
      type: z.literal("choose_trait"),
      replaceId: id.optional(),
      discard: z.boolean().optional(),
    })
    .strict(),
  z.object({ type: z.literal("discard"), instanceId: id }).strict(),
  z.object({ type: z.literal("kick"), playerId: id }).strict(),
]);
export const envelopeSchema = z
  .object({
    commandId: z.string().uuid(),
    expectedRevision: z.number().int().nonnegative(),
    command: commandSchema,
  })
  .strict();
export const nicknameSchema = z
  .object({
    nickname: z
      .string()
      .trim()
      .min(1)
      .max(24)
      .regex(
        /^[\p{L}\p{N} _.'-]+$/u,
        "Use letters, numbers, spaces, or simple punctuation.",
      ),
  })
  .strict();
export const authSchema = z
  .object({
    code: z.string().regex(/^[A-Z2-9]{6}$/),
    token: z.string().regex(/^[a-f0-9]{64}$/),
  })
  .strict();
