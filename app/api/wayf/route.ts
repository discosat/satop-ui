import { NextResponse } from "next/server";

import { decodeJwt, JWTPayload } from "jose";
import { createSession } from "@/lib/session";
export async function GET() {
  return NextResponse.json({
    message: "http method not supported",
  });
}

// FORCED for github pages
export const dynamic = "force-static";

interface WAYFPayload extends JWTPayload {
  displayName: string[];
  eduPersonPrimaryAffiliation: string[];
  eduPersonPrincipalName: string[];
  mail: string[];
}

export async function POST(req: Request) {
  const params = new URLSearchParams(await req.text());
  const idToken = params.get("id_token");
  if (!idToken)
    return new NextResponse(`{"message": "id_token not found"}`, {
      status: 400,
    });
  const payload = decodeJwt<WAYFPayload>(idToken);

  // TODO: hook up with backend
  await createSession({
    userID: payload.eduPersonPrincipalName[0],
    name: payload.displayName[0],
    avatar: "/assets/martin.jpeg",
    email: payload.mail[0],
    role: "admin",
    scopes: ["fp", "fp.view", "fp.program", "entities", "entities.overview"],
    accessToken: "access_token_placeholder",
    refreshToken: "refresh_token_placeholder",
  });
  const origin = params.get("state");
  if (origin) {
    // Do a 301 so cookies are sent with redirect
    const redirectTo = `${origin}/platform`;
    return NextResponse.redirect(redirectTo, 301);
  }
}
