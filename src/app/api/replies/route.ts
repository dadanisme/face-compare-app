import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone");

  const res = await fetch(
    "http://128.199.220.84:5000/chat/getchatbyid/" + phone
  );
  const data = await res.json();

  return NextResponse.json(data.message.lastMessage);
}
