import type { Metadata } from "next";
import HomeClient from "@/src/components/home/HomeClient";
import ExploreGrid from "@/src/components/home/ExploreGrid";

export const revalidate = 300;

// The root layout's relative canonical ("./") resolves to "/index" on the homepage; set it explicitly.
// oxlint-disable-next-line react/only-export-components -- App Router metadata belongs with the route.
export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Page() {
  return (
    <HomeClient>
      <ExploreGrid />
    </HomeClient>
  );
}
