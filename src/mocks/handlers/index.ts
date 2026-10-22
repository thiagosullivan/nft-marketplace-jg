import { authHandlers } from "./auth";
import { profileHandlers } from "./profile";

export const handlers = [...authHandlers, ...profileHandlers];
