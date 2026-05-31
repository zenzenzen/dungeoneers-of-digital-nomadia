import type {
  PlayerAction,
  SessionEventEnvelope,
  SessionId,
  SessionMemberId,
  SessionMemberSummary,
  SessionSettings,
  SessionState,
  SessionSummary,
  SubmittedAction,
  UserId,
} from "@ddn/engine";
import { normalizeSessionCode } from "@ddn/engine";

export type SessionTokenKind = "host" | "member" | "guest-rejoin";

export interface SessionAccessToken {
  kind: SessionTokenKind;
  token: string;
  sessionId: SessionId;
  memberId: SessionMemberId;
  issuedAt: string;
  expiresAt?: string;
}

export interface CreateSessionRequest {
  host: {
    userId?: UserId;
    displayName: string;
    isGuest?: boolean;
  };
  settings?: Partial<SessionSettings>;
}

export interface CreateSessionResponse {
  session: SessionSummary;
  hostMember: SessionMemberSummary;
  token: SessionAccessToken;
}

export interface JoinSessionRequest {
  displayName: string;
  passphrase: string;
  preferredSeat?: number;
  existingUserId?: UserId;
}

export interface JoinSessionResponse {
  session: SessionSummary;
  member: SessionMemberSummary;
  token: SessionAccessToken;
  rejoined: boolean;
}

export interface RejoinSessionRequest {
  displayName: string;
  passphrase: string;
}

export interface RejoinSessionResponse {
  session: SessionSummary;
  member: SessionMemberSummary;
  token: SessionAccessToken;
}

export interface CommitActionRequest {
  memberId: SessionMemberId;
  action: PlayerAction;
  expectedTurnNumber: number;
  clientRequestId?: string;
}

export interface CommitActionResponse {
  accepted: boolean;
  submitted?: SubmittedAction;
  events: SessionEventEnvelope[];
  snapshot?: SessionState;
  rejectionReason?:
    | "not_member"
    | "not_your_turn"
    | "session_not_active"
    | "invalid_target"
    | "invalid_payload";
}

export interface ListSessionEventsRequest {
  afterSequence?: number;
  limit?: number;
}

export interface ListSessionEventsResponse {
  session: SessionSummary;
  events: SessionEventEnvelope[];
  nextAfterSequence?: number;
}

export interface GetSessionResponse {
  session: SessionSummary;
  members: SessionMemberSummary[];
  snapshot?: SessionState;
}

export interface SessionPresencePingRequest {
  memberId: SessionMemberId;
}

export interface SessionPresencePingResponse {
  ok: true;
  seenAt: string;
}

export const sessionApiRoutes = {
  create: "/api/sessions",
  byCode: (code: string): string => `/api/sessions/${normalizeSessionCode(code)}`,
  join: (code: string): string => `/api/sessions/${normalizeSessionCode(code)}/join`,
  rejoin: (code: string): string => `/api/sessions/${normalizeSessionCode(code)}/rejoin`,
  commitAction: (code: string): string =>
    `/api/sessions/${normalizeSessionCode(code)}/actions`,
  events: (code: string): string => `/api/sessions/${normalizeSessionCode(code)}/events`,
  presence: (code: string): string =>
    `/api/sessions/${normalizeSessionCode(code)}/presence`,
} as const;

export const sessionRouteDefinitions = [
  {
    method: "POST",
    path: sessionApiRoutes.create,
    purpose: "Create a new lobby and seed the host membership.",
  },
  {
    method: "GET",
    path: "/api/sessions/:code",
    purpose: "Fetch the current session shell, seat map, and optional snapshot.",
  },
  {
    method: "POST",
    path: "/api/sessions/:code/join",
    purpose: "Join a session as a guest or authenticated player.",
  },
  {
    method: "POST",
    path: "/api/sessions/:code/rejoin",
    purpose: "Recover a guest seat using the stored passphrase.",
  },
  {
    method: "POST",
    path: "/api/sessions/:code/actions",
    purpose: "Validate and commit one player action for the current turn.",
  },
  {
    method: "GET",
    path: "/api/sessions/:code/events",
    purpose: "Stream or poll append-only session events after a given sequence.",
  },
  {
    method: "POST",
    path: "/api/sessions/:code/presence",
    purpose: "Refresh member last-seen timestamps without mutating gameplay state.",
  },
] as const;
