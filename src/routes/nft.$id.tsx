import { NFTDetailPage } from "@/features/nft/nft-detail-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/nft/$id")({
  component: NFTDetailRoute,
});

function NFTDetailRoute() {
  const { id } = Route.useParams();
  return <NFTDetailPage id={id} />;
}
