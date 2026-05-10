import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const eventKinds = new Set(["view", "call", "whatsapp", "directions", "profile"]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const businessId = typeof body.businessId === "string" ? body.businessId : "";
    const eventKind = typeof body.eventKind === "string" ? body.eventKind : "";

    if (!businessId || !eventKinds.has(eventKind)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.rpc("increment_business_analytics", {
      event_kind: eventKind,
      target_business_id: businessId,
    });

    if (error) {
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
