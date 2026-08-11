import { getClinicSettings } from "@/lib/data";
import ContactView from "@/components/views/ContactView";

export default async function ContactPage() {
  const settings = await getClinicSettings();
  return <ContactView settings={settings} />;
}
