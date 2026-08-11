import { NextRequest, NextResponse } from "next/server";
import { createAppointment, type BookingInput } from "@/lib/booking";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });

  const input: BookingInput = {
    serviceId: body.serviceId,
    therapistId: body.therapistId || undefined,
    date: body.date,
    time: body.time,
    fullName: body.fullName,
    email: body.email || undefined,
    phone: body.phone || undefined,
    notes: body.notes || undefined,
    source: "web",
  };

  const result = await createAppointment(input);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
