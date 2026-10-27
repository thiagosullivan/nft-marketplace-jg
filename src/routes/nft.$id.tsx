import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

const NFTDetailPage = lazyRouteComponent(
  () => import("@/features/nft/nft-detail-page"),
  "NFTDetailPage",
);

export const Route = createFileRoute("/nft/$id")({
  component: NFTDetailRoute,
});

function NFTDetailRoute() {
  const { id } = Route.useParams();
  return <NFTDetailPage id={id} />;
}
