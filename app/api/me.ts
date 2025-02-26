import { currentSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await currentSession();
  return NextResponse.json(session);
}
