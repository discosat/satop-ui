import { allowedOrigins } from "@/next.config";
import { NextRequest, NextResponse } from "next/server";

export function GET(req: NextRequest) {
  return handle(req);
}

export function POST(req: NextRequest) {
  return handle(req);
}

function handle(req: NextRequest) {
  const redirectTo = req.nextUrl.searchParams.get("redirect_to");
  if (!redirectTo)
    return NextResponse.json(
      { message: "no redirect url given query parameters" },
      { status: 400 },
    );

  const redirectURL = new URL(redirectTo);
  if (
    !allowedOrigins.includes(redirectURL.host) &&
    !allowedOrigins.includes(`${redirectURL.host}:${redirectURL.port}`)
  )
    return NextResponse.json(
      { message: "forbidden origin of redirect url" },
      { status: 403 },
    );

  return NextResponse.redirect(redirectURL.toString());
}
