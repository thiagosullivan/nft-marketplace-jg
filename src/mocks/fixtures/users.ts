import type { IsoDate, User } from "@/shared/api/types";

/*
 * users:
 *  - maria@nftmail.com     / password123
 *  - fernando@nftmail.com  / password123
 *  - thais@nftmail.com     / password123
 */
export function hashPassword(password: string): string {
  return btoa(`nftmail-salt:${password}`);
}

// password hashs
export const SEED_PASSWORD_HASH = hashPassword("password123");

export const seedUsers: readonly User[] = [
  {
    id: "user-maria",
    username: "maria",
    displayName: "Maria Souza",
    email: "maria@nftmail.com",
    ensName: "maria.eth",
    avatarUrl: "https://i.pravatar.cc/150?img=47",
    createdAt: "2026-01-15T10:00:00.000Z" as IsoDate,
  },
  {
    id: "user-fernando",
    username: "fernando",
    displayName: "Fernando Lima",
    email: "fernando@nftmail.com",
    ensName: null,
    avatarUrl: "https://i.pravatar.cc/150?img=12",
    createdAt: "2026-02-20T14:30:00.000Z" as IsoDate,
  },
  {
    id: "user-thais",
    username: "thais",
    displayName: "Thaís Rocha",
    email: "thais@nftmail.com",
    ensName: "thais.eth",
    avatarUrl: "https://i.pravatar.cc/150?img=32",
    createdAt: "2026-03-05T09:15:00.000Z" as IsoDate,
  },
];

// login handler
export const seedCredentials: Readonly<Record<string, string>> = {
  "maria@nftmail.com": SEED_PASSWORD_HASH,
  "fernando@nftmail.com": SEED_PASSWORD_HASH,
  "thais@nftmail.com": SEED_PASSWORD_HASH,
};
