import { Parent } from "@/types/models";
import { faker } from "@faker-js/faker";
import * as fs from "fs";
import { NextResponse } from "next/server";

export async function GET() {
  const dataset: Omit<Parent, "id">[] = [];

  const files = fs.readdirSync("./public/static");

  files.forEach((file) => {
    const images = fs.readdirSync(`./public/static/${file}`);
    dataset.push({
      name: faker.person.fullName(),
      images: images.map((image) => `/static/${file}/${image}`),
      phone: file.split(" - ")[1].replace(/[^\d]/g, ""),
    });
  });

  return NextResponse.json(dataset);
}
