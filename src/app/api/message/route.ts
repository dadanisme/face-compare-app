import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { phone, message, image } = body;

  const res = await fetch(
    "http://128.199.220.84:5000/chat/sendimage/" + phone,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        caption: message,
        image: image,
      }),
    }
  );

  const data = await res.json();

  return NextResponse.json(data);
}
