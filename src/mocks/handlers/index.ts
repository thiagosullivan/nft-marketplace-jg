import { authHandlers } from "./auth";
import { profileHandlers } from "./profile";
import { nftHandlers } from "./nfts";
import { favoriteHandlers } from "./favorites";
import { cartHandlers } from "./cart";
import { quoteHandlers } from "./quote";
import { orderHandlers } from "./orders";
import { walletHandlers } from "./wallets";
import { devHandlers } from "./dev";

export const handlers = [
  ...authHandlers,
  ...profileHandlers,
  ...nftHandlers,
  ...favoriteHandlers,
  ...cartHandlers,
  ...quoteHandlers,
  ...orderHandlers,
  ...walletHandlers,
  ...devHandlers,
];
