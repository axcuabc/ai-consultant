import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export async function POST(req) {
  const { code } = await req.json();
  if (!code) {
    return NextResponse.json({ error: "code_required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("access_codes")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (error) {
    console.error("DB error:", error);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "invalid_code" }, { status: 404 });
  }

  if (new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ error: "expired" }, { status: 403 });
  }

  return NextResponse.json({ success: true, email: data.email });
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
