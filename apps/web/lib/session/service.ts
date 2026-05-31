import type {
  ActionId,
  SessionEventEnvelope,
  SessionId,
  SessionMemberSummary,
  SessionState,
  SessionSummary,
  SubmittedAction,
} from "@ddn/engine";
import type {
  CommitActionRequest,
  CommitActionResponse,
  CreateSessionRequest,
  CreateSessionResponse,
  GetSessionResponse,
  JoinSessionRequest,
  JoinSessionResponse,
  ListSessionEventsRequest,
  ListSessionEventsResponse,
  RejoinSessionRequest,
  RejoinSessionResponse,
  SessionPresencePingRequest,
  SessionPresencePingResponse,
} from "./routes";

export interface AppendEventsOptions {
  expectedLastSequence?: number;
}

export interface SessionStore {
  createSession(summary: SessionSummary): Promise<void>;
  getSessionByCode(code: string): Promise<SessionSummary | null>;
  getSessionById(sessionId: SessionId): Promise<SessionSummary | null>;
  saveMember(sessionId: SessionId, member: SessionMemberSummary): Promise<void>;
  listMembers(sessionId: SessionId): Promise<SessionMemberSummary[]>;
  appendEvents(
    sessionId: SessionId,
    events: SessionEventEnvelope[],
    options?: AppendEventsOptions,
  ): Promise<SessionEventEnvelope[]>;
  listEvents(
    sessionId: SessionId,
    request: ListSessionEventsRequest,
  ): Promise<SessionEventEnvelope[]>;
  getSnapshot(sessionId: SessionId): Promise<SessionState | null>;
  saveSnapshot(sessionId: SessionId, state: SessionState, throughSequence: number): Promise<void>;
  touchSession(sessionId: SessionId, seenAt: string): Promise<void>;
}

export interface SessionActionRuntime {
  submit(
    session: SessionSummary,
    members: SessionMemberSummary[],
    request: CommitActionRequest,
  ): Promise<{
    submitted: SubmittedAction;
    actionId: ActionId;
    events: SessionEventEnvelope[];
    snapshot?: SessionState;
  }>;
}

export interface SessionService {
  createSession(request: CreateSessionRequest): Promise<CreateSessionResponse>;
  getSession(code: string): Promise<GetSessionResponse>;
  joinSession(code: string, request: JoinSessionRequest): Promise<JoinSessionResponse>;
  rejoinSession(code: string, request: RejoinSessionRequest): Promise<RejoinSessionResponse>;
  commitAction(code: string, request: CommitActionRequest): Promise<CommitActionResponse>;
  listEvents(code: string, request: ListSessionEventsRequest): Promise<ListSessionEventsResponse>;
  recordPresence(
    code: string,
    request: SessionPresencePingRequest,
  ): Promise<SessionPresencePingResponse>;
}
