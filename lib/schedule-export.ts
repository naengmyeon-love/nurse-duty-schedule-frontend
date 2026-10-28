import { isValidMonth } from "./validation";

export const XLSX_CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

/** Copy the workbook body and an explicit header allowlist, never upstream cookies or infrastructure headers. */
export async function scheduleExportResponse(upstream: Response, month: string): Promise<Response> {
  const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };
  if (!isValidMonth(month)) return Response.json({ error: "유효한 월을 선택해 주세요." }, { status: 400, headers });
  if (!upstream.ok) {
    const status = [401, 403, 404].includes(upstream.status) ? upstream.status : 502;
    const error = status === 401 ? "다시 로그인해 주세요." : status === 403 ? "조회 권한이 없습니다." : status === 404 ? "조회 가능한 근무표가 없습니다." : "근무표를 다운로드하지 못했습니다. 잠시 후 다시 시도해 주세요.";
    return Response.json({ error }, { status, headers });
  }
  if (upstream.headers.get("Content-Type")?.split(";")[0].trim() !== XLSX_CONTENT_TYPE) {
    return Response.json({ error: "올바른 근무표 파일을 받지 못했습니다." }, { status: 502, headers });
  }
  return new Response(await upstream.arrayBuffer(), { headers: {
    ...headers, "Content-Type": XLSX_CONTENT_TYPE,
    "Content-Disposition": `attachment; filename="dutymate-${month}.xlsx"`,
  } });
}
