import { getServices, getTherapists } from "@/lib/data";
import BookingView from "@/components/views/BookingView";

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const [services, therapists, sp] = await Promise.all([getServices(), getTherapists(), searchParams]);
  return <BookingView services={services} therapists={therapists} initialServiceId={sp.service} />;
}
