import { generateSessionCode, normalizeSessionCode, type BannerEvent } from "@ddn/engine";

type DemoSessionMember = {
  id: string;
  displayName: string;
  seat: number;
  isHost: boolean;
  joinedAt: string;
  characterId?: string;
};

type DemoSessionRecord = {
  id: string;
  code: string;
  status: "lobby" | "active" | "paused" | "ended";
  currentSeat: number;
  turnTimeoutHours: number;
  members: DemoSessionMember[];
  events: BannerEvent[];
  createdAt: string;
  lastActivityAt: string;
};

type StoredSession = DemoSessionRecord & {
  secrets: Map<string, string>;
};

const sessions = new Map<string, StoredSession>();

function createSystemEvent(title: string, body: string): BannerEvent {
  return {
    kind: "system",
    text: `${title}: ${body}`,
    emphasis: "normal",
  };
}

function getTimestamp() {
  return new Date().toISOString();
}

function createMemberId(code: string, seat: number) {
  return `member_${code.toLowerCase()}_${seat + 1}`;
}

export function createSession({
  hostName,
  passphrase,
  characterId,
  turnTimeoutHours = 72,
}: {
  hostName: string;
  passphrase: string;
  characterId?: string;
  turnTimeoutHours?: number;
}) {
  let code = generateSessionCode();
  while (sessions.has(code)) {
    code = generateSessionCode();
  }

  const timestamp = getTimestamp();
  const host = {
    id: createMemberId(code, 0),
    displayName: hostName,
    seat: 0,
    isHost: true,
    joinedAt: timestamp,
    characterId,
  };

  const session: StoredSession = {
    id: `session_${code.toLowerCase()}`,
    code,
    status: "lobby",
    currentSeat: 0,
    turnTimeoutHours,
    members: [host],
    events: [
      createSystemEvent(
        "Session Opened",
        `${hostName} opened lobby ${code}. The night has not gone wrong yet, but it has options.`,
      ),
    ],
    createdAt: timestamp,
    lastActivityAt: timestamp,
    secrets: new Map([[host.id, passphrase]]),
  };

  sessions.set(code, session);

  return stripSecrets(session);
}

export function joinSession(
  code: string,
  { displayName, passphrase }: { displayName: string; passphrase: string; characterId?: string },
) {
  const normalizedCode = normalizeSessionCode(code);
  const session = sessions.get(normalizedCode);

  if (!session) {
    return null;
  }

  const seat = session.members.length;
  const memberId = createMemberId(normalizedCode, seat);
  const timestamp = getTimestamp();

  session.members.push({
    id: memberId,
    displayName,
    seat,
    isHost: false,
    joinedAt: timestamp,
  });
  session.secrets.set(memberId, passphrase);
  session.events.push(
    createSystemEvent(
      "Member Joined",
      `${displayName} joined ${normalizedCode}. The room immediately got less predictable.`,
    ),
  );
  session.lastActivityAt = timestamp;

  return stripSecrets(session);
}

export function getSession(code: string) {
  const normalizedCode = normalizeSessionCode(code);
  const session = sessions.get(normalizedCode);
  return session ? stripSecrets(session) : null;
}

function stripSecrets(session: StoredSession): DemoSessionRecord {
  const { secrets, ...safeSession } = session;
  void secrets;
  return safeSession;
}
