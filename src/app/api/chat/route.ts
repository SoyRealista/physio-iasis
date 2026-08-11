import { NextRequest, NextResponse } from "next/server";
import { getServices, getTherapists, getClinicSettings } from "@/lib/data";
import { getDaySlots } from "@/lib/availability";
import { createAppointment } from "@/lib/booking";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { athensNowParts } from "@/lib/timezone";
import { runChatWithTools, type ChatMessage, type ToolDef } from "@/lib/deepseek";

const FALLBACK_REPLY: Record<string, string> = {
  el: "Ο βοηθός δεν είναι ακόμη ρυθμισμένος (λείπει το κλειδί DeepSeek API). Μπορείτε να κλείσετε ραντεβού απευθείας από τη σελίδα κράτησης.",
  en: "The assistant isn't configured yet (missing DeepSeek API key). You can still book directly from the booking page.",
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const incoming: { role: "user" | "assistant"; content: string }[] = Array.isArray(body?.messages)
    ? body.messages
    : [];
  const lang: "el" | "en" = body?.lang === "en" ? "en" : "el";
  const sessionId: string = typeof body?.sessionId === "string" ? body.sessionId : "anon";

  if (incoming.length === 0) {
    return NextResponse.json({ error: "no_messages" }, { status: 400 });
  }
  const lastUserMessage = [...incoming].reverse().find((m) => m.role === "user")?.content ?? "";

  if (!process.env.DEEPSEEK_API_KEY) {
    return NextResponse.json({ reply: FALLBACK_REPLY[lang] });
  }

  const [services, therapists, settings] = await Promise.all([
    getServices(),
    getTherapists(),
    getClinicSettings(),
  ]);
  const { date: todayAthens } = athensNowParts();

  const serviceLines = services
    .map((s) => `- id:${s.id} | ${s.name_el} / ${s.name_en} | ${s.duration_minutes} min | ${s.price}€`)
    .join("\n");
  const therapistLines = therapists.map((t) => `- id:${t.id} | ${t.full_name}`).join("\n");

  const systemPrompt = `Είσαι ο ψηφιακός βοηθός του "${settings.clinic_name}", κλινικής φυσικοθεραπείας στη Θεσσαλονίκη.
Απάντα πάντα στη γλώσσα που γράφει ο χρήστης (ελληνικά ή αγγλικά). Να είσαι σύντομος, ζεστός και χρήσιμος.

Στοιχεία κλινικής:
- Διεύθυνση: ${settings.address}
- Τηλέφωνο: ${settings.phone}
- Ωράριο: ${settings.opening_hours_note_el} / ${settings.opening_hours_note_en}
- Σημερινή ημερομηνία (Ελλάδα): ${todayAthens}

Υπηρεσίες διαθέσιμες (χρησιμοποίησε ΜΟΝΟ αυτά τα id):
${serviceLines}

Θεραπευτές (χρησιμοποίησε ΜΟΝΟ αυτά τα id, προαιρετικό πεδίο):
${therapistLines}

Κανόνες:
1. Δεν δίνεις ιατρική διάγνωση. Αν περιγράψουν πόνο/τραυματισμό, πρότεινε την πιο σχετική υπηρεσία και προσφέρσου να κλείσεις ραντεβού.
2. Για να δεις διαθεσιμότητα, κάλεσε το εργαλείο check_availability με serviceId και ημερομηνία (YYYY-MM-DD). Ποτέ μην επινοήσεις ώρες — μόνο ό,τι επιστρέφει το εργαλείο.
3. Πριν κλείσεις ραντεβού με create_appointment χρειάζεσαι: serviceId, date, time, fullName, και email Ή phone. Ρώτα ό,τι λείπει.
4. Μετά από επιτυχημένη κράτηση, επιβεβαίωσε ημερομηνία, ώρα, υπηρεσία και θεραπευτή στον χρήστη με σαφήνεια.
5. Αν κάτι αποτύχει, ζήτα συγγνώμη και πρότεινε τη σελίδα κράτησης online.`;

  const tools: ToolDef[] = [
    {
      type: "function",
      function: {
        name: "check_availability",
        description: "Επιστρέφει τις διαθέσιμες ώρες για μία υπηρεσία σε μία ημερομηνία.",
        parameters: {
          type: "object",
          properties: {
            serviceId: { type: "string", enum: services.map((s) => s.id) },
            date: { type: "string", description: "Ημερομηνία σε μορφή YYYY-MM-DD" },
            therapistId: { type: "string", enum: therapists.map((t) => t.id) },
          },
          required: ["serviceId", "date"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "create_appointment",
        description: "Δημιουργεί ραντεβού αφού επιβεβαιωθεί διαθεσιμότητα και στοιχεία επικοινωνίας.",
        parameters: {
          type: "object",
          properties: {
            serviceId: { type: "string", enum: services.map((s) => s.id) },
            therapistId: { type: "string", enum: therapists.map((t) => t.id) },
            date: { type: "string", description: "YYYY-MM-DD" },
            time: { type: "string", description: "HH:mm" },
            fullName: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" },
            notes: { type: "string" },
          },
          required: ["serviceId", "date", "time", "fullName"],
        },
      },
    },
  ];

  async function executeTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    if (name === "check_availability") {
      const slots = await getDaySlots({
        serviceId: String(args.serviceId),
        date: String(args.date),
        therapistId: args.therapistId ? String(args.therapistId) : undefined,
      });
      return { slots };
    }
    if (name === "create_appointment") {
      return createAppointment({
        serviceId: String(args.serviceId),
        therapistId: args.therapistId ? String(args.therapistId) : undefined,
        date: String(args.date),
        time: String(args.time),
        fullName: String(args.fullName || ""),
        email: args.email ? String(args.email) : undefined,
        phone: args.phone ? String(args.phone) : undefined,
        notes: args.notes ? String(args.notes) : undefined,
        source: "bot",
      });
    }
    return { error: "unknown_tool" };
  }

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...incoming.map((m) => ({ role: m.role, content: m.content }) as ChatMessage),
  ];

  let reply: string;
  try {
    reply = await runChatWithTools({ messages, tools, executeTool });
    if (!reply) reply = FALLBACK_REPLY[lang];
  } catch {
    reply = FALLBACK_REPLY[lang];
  }

  const db = createAdminSupabase();
  if (db) {
    db.from("chat_logs")
      .insert([
        { session_id: sessionId, role: "user", content: lastUserMessage },
        { session_id: sessionId, role: "assistant", content: reply },
      ])
      .then(
        () => {},
        () => {}
      );
  }

  return NextResponse.json({ reply });
}
