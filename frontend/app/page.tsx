import HomeClient from "@/src/components/home/HomeClient";
import ExploreGrid from "@/src/components/home/ExploreGrid";

export const revalidate = 300;

export default function Page() {
  return (
    <HomeClient>
      <ExploreGrid />
    </HomeClient>
  );
}
