import { NextResponse } from "next/server";
import type { MissionHistoryItem } from "@/lib/types";

const historyStore: MissionHistoryItem[] = [];

export async function GET() {
  return NextResponse.json({ data: historyStore.slice(0, 10) });
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<MissionHistoryItem>;
  if (!body.codename || !body.location || typeof body.coverage !== "number") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  historyStore.unshift({
    codename: body.codename,
    location: body.location,
    coverage: Math.round(body.coverage),
    timestamp: Date.now(),
  });

  if (historyStore.length > 10) {
    historyStore.pop();
  }

  return NextResponse.json({ ok: true });
}
