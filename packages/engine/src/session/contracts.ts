type Brand<TValue extends string, TBrand extends string> = TValue & {
  readonly __brand: TBrand;
};

export type SessionId = Brand<string, "SessionId">;
export type SessionMemberId = Brand<string, "SessionMemberId">;
export type UserId = Brand<string, "UserId">;
export type ActionId = Brand<string, "ActionId">;
export type EventId = Brand<string, "EventId">;

export type SessionStatus = "lobby" | "active" | "paused" | "ended";
export type SessionNarrationPolicy = "deterministic" | "assisted";
export type SessionContentRating = "pg13" | "hbo";
export type SessionEventStream = "public" | "system" | "private";
export type SessionSkipReason = "timeout" | "host_override" | "disconnect";
export type SessionEndReason = "completed" | "abandoned" | "host_closed";
export type AffinityLabel = "hostile" | "wary" | "neutral" | "warm" | "devoted";
export type DamageType =
  | "physical"
  | "emotional"
  | "psychic"
  | "financial"
  | "reputational"
  | "secondhand"
  | "existential";

export interface SessionSettings {
  turnTimeoutHours: number;
  maxSeats: number;
  idleSkipEnabled: boolean;
  allowGuestRejoin: boolean;
  narrationPolicy: SessionNarrationPolicy;
  contentRating: SessionContentRating;
  rulesVersion?: string;
}

export interface SessionSummary {
  sessionId: SessionId;
  code: string;
  status: SessionStatus;
  hostMemberId?: SessionMemberId;
  hostUserId?: UserId;
  currentSeat: number;
  turnNumber: number;
  createdAt: string;
  lastActivityAt: string;
  settings: SessionSettings;
}

export interface SessionMemberSummary {
  memberId: SessionMemberId;
  userId: UserId;
  seat: number;
  displayName: string;
  isHost: boolean;
  isGuest: boolean;
  characterId?: string;
  joinedAt: string;
}

export interface CharacterRef {
  characterId?: string;
  name: string;
  classId?: string;
  portraitAssetId?: string;
}

export interface ItemRef {
  itemId: string;
  name?: string;
}

export type StatusEffect =
  | "Triggered"
  | "Panic"
  | "Doubt"
  | "Distracted"
  | "Silenced"
  | "Restrained"
  | "Surprised"
  | "Misinformation"
  | string;

export type BannerEvent =
  | {
      kind: "dialogue";
      speaker: CharacterRef;
      text: string;
    }
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
      label: AffinityLabel;
    }
  | {
      kind: "loot";
      actor: CharacterRef;
      item: ItemRef;
      quantity: number;
    }
  | {
      kind: "status";
      target: CharacterRef;
      effect: StatusEffect;
      applied: boolean;
    }
  | {
      kind: "system";
      text: string;
      emphasis?: "low" | "normal" | "high";
    };

export type PlayerAction =
  | { kind: "say"; text: string }
  | { kind: "attack"; targetId: string; weaponId: string }
  | { kind: "cast"; spellId: string; targets: string[] }
  | { kind: "skill"; skillId: string; dc?: number }
  | { kind: "use"; itemId: string; targetId?: string }
  | { kind: "flee" };

export interface SubmittedAction {
  actionId: ActionId;
  actorMemberId: SessionMemberId;
  actorSeat: number;
  submittedAt: string;
  clientRequestId?: string;
  action: PlayerAction;
}

export type SessionDomainEvent =
  | {
      type: "session.created";
      session: SessionSummary;
      host?: SessionMemberSummary;
    }
  | {
      type: "session.updated";
      patch: Partial<
        Pick<SessionSummary, "status" | "lastActivityAt" | "currentSeat" | "turnNumber" | "settings">
      >;
    }
  | {
      type: "member.joined";
      member: SessionMemberSummary;
    }
  | {
      type: "member.left";
      memberId: SessionMemberId;
      seat: number;
    }
  | {
      type: "turn.started";
      seat: number;
      turnNumber: number;
    }
  | {
      type: "action.submitted";
      submitted: SubmittedAction;
    }
  | {
      type: "action.committed";
      submitted: SubmittedAction;
      nextSeat: number;
      nextTurnNumber: number;
    }
  | {
      type: "action.rejected";
      submitted: SubmittedAction;
      reason:
        | "not_member"
        | "not_your_turn"
        | "session_not_active"
        | "invalid_target"
        | "invalid_payload";
      message?: string;
    }
  | {
      type: "banner.emitted";
      banner: BannerEvent;
    }
  | {
      type: "seat.skipped";
      seat: number;
      reason: SessionSkipReason;
      nextSeat: number;
      nextTurnNumber: number;
      banner?: BannerEvent;
    }
  | {
      type: "session.ended";
      reason: SessionEndReason;
    };

export interface SessionEventEnvelope {
  eventId: EventId;
  sessionId: SessionId;
  sequence: number;
  occurredAt: string;
  turnNumber: number;
  seat: number | null;
  stream: SessionEventStream;
  causedByActionId?: ActionId;
  event: SessionDomainEvent;
}

export interface SessionState {
  session: SessionSummary;
  membersBySeat: Partial<Record<number, SessionMemberSummary>>;
  banners: BannerEvent[];
  lastSequence: number;
  pendingAction?: SubmittedAction;
  lastEventAt?: string;
}

export const DEFAULT_SESSION_SETTINGS: SessionSettings = {
  turnTimeoutHours: 72,
  maxSeats: 6,
  idleSkipEnabled: true,
  allowGuestRejoin: true,
  narrationPolicy: "deterministic",
  contentRating: "pg13",
};
