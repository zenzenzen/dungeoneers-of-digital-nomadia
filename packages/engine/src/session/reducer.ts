import type {
  SessionEventEnvelope,
  SessionMemberSummary,
  SessionState,
  SessionSummary,
} from "./contracts";

export function createSessionState(
  session: SessionSummary,
  members: SessionMemberSummary[] = [],
): SessionState {
  const membersBySeat = members.reduce<SessionState["membersBySeat"]>((accumulator, member) => {
    accumulator[member.seat] = member;
    return accumulator;
  }, {});

  return {
    session,
    membersBySeat,
    banners: [],
    lastSequence: 0,
  };
}

export function applySessionEvent(
  currentState: SessionState,
  envelope: SessionEventEnvelope,
): SessionState {
  const nextState: SessionState = {
    ...currentState,
    session: {
      ...currentState.session,
      lastActivityAt: envelope.occurredAt,
    },
    membersBySeat: {
      ...currentState.membersBySeat,
    },
    banners: [...currentState.banners],
    lastSequence: Math.max(currentState.lastSequence, envelope.sequence),
    lastEventAt: envelope.occurredAt,
  };

  switch (envelope.event.type) {
    case "session.created": {
      nextState.session = envelope.event.session;

      if (envelope.event.host) {
        nextState.membersBySeat[envelope.event.host.seat] = envelope.event.host;
      }

      return nextState;
    }

    case "session.updated": {
      nextState.session = {
        ...nextState.session,
        ...envelope.event.patch,
      };
      return nextState;
    }

    case "member.joined": {
      nextState.membersBySeat[envelope.event.member.seat] = envelope.event.member;
      return nextState;
    }

    case "member.left": {
      delete nextState.membersBySeat[envelope.event.seat];
      return nextState;
    }

    case "turn.started": {
      nextState.session = {
        ...nextState.session,
        currentSeat: envelope.event.seat,
        turnNumber: envelope.event.turnNumber,
      };
      return nextState;
    }

    case "action.submitted": {
      nextState.pendingAction = envelope.event.submitted;
      return nextState;
    }

    case "action.committed": {
      nextState.pendingAction = undefined;
      nextState.session = {
        ...nextState.session,
        currentSeat: envelope.event.nextSeat,
        turnNumber: envelope.event.nextTurnNumber,
      };
      return nextState;
    }

    case "action.rejected": {
      nextState.pendingAction = undefined;
      return nextState;
    }

    case "banner.emitted": {
      nextState.banners.push(envelope.event.banner);
      return nextState;
    }

    case "seat.skipped": {
      nextState.pendingAction = undefined;
      nextState.session = {
        ...nextState.session,
        currentSeat: envelope.event.nextSeat,
        turnNumber: envelope.event.nextTurnNumber,
      };

      if (envelope.event.banner) {
        nextState.banners.push(envelope.event.banner);
      }

      return nextState;
    }

    case "session.ended": {
      nextState.session = {
        ...nextState.session,
        status: "ended",
      };
      return nextState;
    }
  }
}

export function applySessionEvents(
  initialState: SessionState,
  events: SessionEventEnvelope[],
): SessionState {
  return events.reduce(applySessionEvent, initialState);
}
