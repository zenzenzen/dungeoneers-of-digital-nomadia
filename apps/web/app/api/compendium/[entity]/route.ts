import { NextResponse } from "next/server";

import { loadEntityCollection } from "@ddn/content";

type RouteProps = {
  params: Promise<{
    entity: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const { entity } = await params;

  try {
    const data = await loadEntityCollection(entity);
    return NextResponse.json({ type: entity, count: data.length, records: data });
  } catch {
    return NextResponse.json({ error: `Unknown or unbuilt entity type: ${entity}` }, { status: 404 });
  }
}
