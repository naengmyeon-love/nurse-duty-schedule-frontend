import { NextResponse } from "next/server";
import { getCurrentUser, saveScheduleEntry } from "@/lib/backend";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "HEAD_NURSE") return NextResponse.json({ error: "수간호사 권한이 필요합니다." }, { status: 403 });
  try {
    const response = await saveScheduleEntry(await request.json());
    const body = await response.json();
    return NextResponse.json(body, { status: response.status });
  } catch {
    return NextResponse.json({ error: "변경을 저장하지 못했습니다. 입력과 연결 상태를 확인해 주세요." }, { status: 400 });
  }
}
