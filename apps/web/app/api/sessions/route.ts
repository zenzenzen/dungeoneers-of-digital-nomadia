import { NextResponse } from "next/server";

import { createSession } from "@/lib/session-store";

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    hostName?: string;
    passphrase?: string;
    characterId?: string;
    turnTimeoutHours?: number;
  };

  if (!payload.hostName || !payload.passphrase) {
    return NextResponse.json(
      { error: "hostName and passphrase are required to open a lobby." },
      { status: 400 },
    );
  }

  const session = createSession({
    hostName: payload.hostName,
    passphrase: payload.passphrase,
    characterId: payload.characterId,
    turnTimeoutHours: payload.turnTimeoutHours,
  });

  return NextResponse.json(session, { status: 201 });
}
