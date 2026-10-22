import type { Coupon, IsoDate } from "@/shared/api/types";

// Cupons seed
export const seedCoupons: readonly Coupon[] = [
  {
    code: "WELCOME10",
    discountPercent: 10,
    expiresAt: null,
  },
  {
    code: "NFT20",
    discountPercent: 20,
    expiresAt: null,
  },
  {
    code: "EXPIRED",
    discountPercent: 15,
    // Expirou em 2025
    expiresAt: "2025-12-31T23:59:59.000Z" as IsoDate,
  },
];
