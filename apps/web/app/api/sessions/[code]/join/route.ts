import { NextResponse } from "next/server";

import { joinSession } from "@/lib/session-store";

type RouteProps = {
  params: Promise<{
    code: string;
  }>;
};

export async function POST(request: Request, { params }: RouteProps) {
  const { code } = await params;
  const payload = (await request.json()) as {
    displayName?: string;
    passphrase?: string;
  };

  if (!payload.displayName || !payload.passphrase) {
    return NextResponse.json(
      { error: "displayName and passphrase are required to join a lobby." },
      { status: 400 },
    );
  }

  const session = joinSession(code, {
    displayName: payload.displayName,
    passphrase: payload.passphrase,
  });

  if (!session) {
    return NextResponse.json({ error: "Session code not found." }, { status: 404 });
  }

  return NextResponse.json(session);
}
