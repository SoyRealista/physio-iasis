import { getTherapists } from "@/lib/data";
import AboutView from "@/components/views/AboutView";

export default async function AboutPage() {
  const therapists = await getTherapists();
  return <AboutView therapists={therapists} />;
}
