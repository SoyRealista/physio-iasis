import { getServices } from "@/lib/data";
import HomeView from "@/components/views/HomeView";

export default async function Home() {
  const services = await getServices();
  return <HomeView services={services} />;
}
