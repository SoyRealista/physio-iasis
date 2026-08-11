import { NextRequest, NextResponse } from "next/server";
import { getDaySlots } from "@/lib/availability";

export async function GET(req: NextRequest) {
  const serviceId = req.nextUrl.searchParams.get("serviceId");
  const date = req.nextUrl.searchParams.get("date");
  const therapistId = req.nextUrl.searchParams.get("therapistId") || undefined;

  if (!serviceId || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "invalid_params" }, { status: 400 });
  }

  const slots = await getDaySlots({ serviceId, date, therapistId });
  return NextResponse.json({ slots });
}
