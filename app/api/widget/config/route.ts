import { NextResponse, type NextRequest } from "next/server"
import { publicConfig } from "@/lib/consultant"
import { CORS_HEADERS, isUuid, loadConsultant } from "@/lib/widget-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id")
  if (!isUuid(id)) {
    return NextResponse.json({ error: "bad_id" }, { status: 400, headers: CORS_HEADERS })
  }
  try {
    const found = await loadConsultant(id)
    if (!found) return NextResponse.json({ error: "not_found" }, { status: 404, headers: CORS_HEADERS })
    return NextResponse.json(
      { active: found.active, config: publicConfig(found.consultant) },
      { headers: { ...CORS_HEADERS, "Cache-Control": "public, max-age=60" } },
    )
  } catch (err) {
    console.error("widget/config:", err)
    return NextResponse.json({ error: "server_error" }, { status: 500, headers: CORS_HEADERS })
  }
}
