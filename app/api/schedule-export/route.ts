import { downloadSchedule, getCurrentUser } from "@/lib/backend";
import { scheduleExportResponse } from "@/lib/schedule-export";
import { isValidMonth } from "@/lib/validation";

export async function GET(request: Request) {
  const headers = { "Cache-Control": "private, no-store" };
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "다시 로그인해 주세요." }, { status: 401, headers });
  const month = new URL(request.url).searchParams.get("month") ?? "";
  if (!isValidMonth(month)) return Response.json({ error: "유효한 월을 선택해 주세요." }, { status: 400, headers });
  try {
    return await scheduleExportResponse(await downloadSchedule(month), month);
  } catch {
    return Response.json({ error: "근무표를 다운로드하지 못했습니다. 잠시 후 다시 시도해 주세요." }, { status: 502, headers });
  }
}
