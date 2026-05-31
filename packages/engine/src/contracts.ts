export type CharacterRef = {
  id: string;
  name: string;
};

export type DamageType =
  | "psychic"
  | "emotional"
  | "reputation"
  | "cringe"
  | "sonic"
  | "social";

export type BannerEvent =
  | { kind: "dialogue"; speaker: CharacterRef; text: string }
  | {
      kind: "roll";
      actor: CharacterRef;
      check: string;
      total: number;
      dc: number;
      success: boolean;
    }
  | {
      kind: "damage";
      source: CharacterRef;
      target: CharacterRef;
      amount: number;
      type: DamageType;
    }
  | {
      kind: "relationship";
      a: CharacterRef;
      b: CharacterRef;
      before: number;
      after: number;
      label: string;
    }
  | { kind: "loot"; actor: CharacterRef; itemId: string; quantity: number }
  | { kind: "status"; target: CharacterRef; effect: string; applied: boolean }
  | { kind: "system"; title: string; body: string };

export type SessionStatus = "lobby" | "active" | "paused" | "ended";

export type SessionMemberInput = {
  displayName: string;
  passphrase: string;
};

export type CreateSessionInput = {
  hostName: string;
  passphrase: string;
  characterId?: string;
  turnTimeoutHours?: number;
};

export type SessionMember = {
  id: string;
  displayName: string;
  seat: number;
  isHost: boolean;
  joinedAt: string;
  characterId?: string;
};

export type SessionRecord = {
  id: string;
  code: string;
  status: SessionStatus;
  currentSeat: number;
  turnTimeoutHours: number;
  members: SessionMember[];
  events: BannerEvent[];
  createdAt: string;
  lastActivityAt: string;
};
