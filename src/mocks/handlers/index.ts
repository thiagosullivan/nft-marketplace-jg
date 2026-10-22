import { authHandlers } from "./auth";
import { profileHandlers } from "./profile";
import { nftHandlers } from "./nfts";
import { favoriteHandlers } from "./favorites";
import { cartHandlers } from "./cart";

export const handlers = [
  ...authHandlers,
  ...profileHandlers,
  ...nftHandlers,
  ...favoriteHandlers,
  ...cartHandlers,
];
