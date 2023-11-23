import * as fs from "fs";
import { NextResponse } from "next/server";

export async function GET() {
  const dataset = JSON.parse(fs.readFileSync("public/dataset.json", "utf8"));

  return NextResponse.json(dataset);
}
