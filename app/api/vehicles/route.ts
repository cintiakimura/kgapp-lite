import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const cars = await prisma.car.findMany({
    orderBy: { id: "asc" },
  });
  return NextResponse.json(cars);
}

type CreateVehicleBody = {
  organizationId?: number | null;
  brand?: string | null;
  model?: string | null;
  year?: number | null;
  vin?: string | null;
};

export async function POST(request: Request) {
  let body: CreateVehicleBody;
  try {
    body = (await request.json()) as CreateVehicleBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const organizationId =
    body.organizationId === undefined || body.organizationId === null
      ? undefined
      : Number(body.organizationId);
  if (organizationId !== undefined && Number.isNaN(organizationId)) {
    return NextResponse.json({ error: "organizationId must be a number" }, { status: 400 });
  }

  const year =
    body.year === undefined || body.year === null ? undefined : Number(body.year);
  if (year !== undefined && Number.isNaN(year)) {
    return NextResponse.json({ error: "year must be a number" }, { status: 400 });
  }

  const car = await prisma.car.create({
    data: {
      organizationId: organizationId ?? null,
      brand: body.brand ?? null,
      model: body.model ?? null,
      year: year ?? null,
      vin: body.vin ?? null,
    },
  });

  return NextResponse.json(car, { status: 201 });
}
