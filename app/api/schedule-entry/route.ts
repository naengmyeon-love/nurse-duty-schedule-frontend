import { NextResponse } from "next/server";
import { getCurrentUser, saveScheduleEntry } from "@/lib/backend";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "HEAD_NURSE") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  try {
    const response = await saveScheduleEntry(await request.json());
    const body = await response.json();
    return NextResponse.json(body, { status: response.status });
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
}
