import { getServices } from "@/lib/data";
import ServicesView from "@/components/views/ServicesView";

export default async function ServicesPage() {
  const services = await getServices();
  return <ServicesView services={services} />;
}
