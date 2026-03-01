import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("farms")
    .select("id, name, slug")
    .order("name")
    .limit(10);

  if (error) {
    return NextResponse.json({ barns: [], error: error.message }, { status: 200 });
  }

  return NextResponse.json({ barns: data ?? [] });
}
