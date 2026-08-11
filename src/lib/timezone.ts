import "server-only";

export const CLINIC_TZ = "Europe/Athens";

function partsOf(date: Date, timeZone: string) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return Object.fromEntries(
    dtf.formatToParts(date).filter((p) => p.type !== "literal").map((p) => [p.type, p.value])
  ) as Record<string, string>;
}

/** Weekday (0=domingo..6=sábado) de una fecha calendario "YYYY-MM-DD" — independiente de zona horaria. */
export function weekdayOf(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

function offsetMinutesAt(instant: Date, timeZone: string): number {
  const p = partsOf(instant, timeZone);
  const asUTC = Date.UTC(
    Number(p.year),
    Number(p.month) - 1,
    Number(p.day),
    Number(p.hour),
    Number(p.minute),
    Number(p.second)
  );
  return (asUTC - instant.getTime()) / 60000;
}

/** Convierte una hora local de la clínica ("YYYY-MM-DD", "HH:mm") al instante UTC real, gestionando DST. */
export function athensWallToUTC(dateStr: string, timeStr: string): Date {
  const guess = new Date(`${dateStr}T${timeStr}:00.000Z`);
  const offset = offsetMinutesAt(guess, CLINIC_TZ);
  return new Date(guess.getTime() - offset * 60000);
}

/** Fecha y hora actuales en la zona horaria de la clínica. */
export function athensNowParts(): { date: string; time: string; weekday: number } {
  const p = partsOf(new Date(), CLINIC_TZ);
  const date = `${p.year}-${p.month}-${p.day}`;
  return { date, time: `${p.hour}:${p.minute}`, weekday: weekdayOf(date) };
}
