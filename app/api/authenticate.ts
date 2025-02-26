import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const store = await cookies();
  store.set("");
  const res = NextResponse.co();
}
