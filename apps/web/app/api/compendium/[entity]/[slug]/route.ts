import { NextResponse } from "next/server";

import { loadEntityBySlug } from "@ddn/content";

type RouteProps = {
  params: Promise<{
    entity: string;
    slug: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const { entity, slug } = await params;

  try {
    const record = await loadEntityBySlug(entity, slug);

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json(record);
  } catch {
    return NextResponse.json({ error: `Unknown entity type: ${entity}` }, { status: 404 });
  }
}
