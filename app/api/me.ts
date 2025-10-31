import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { toSessionPayload } from "@/lib/types";

export async function GET() {
  const session = await auth0.getSession();
  const payload = toSessionPayload(session);
  return NextResponse.json(payload);
}
