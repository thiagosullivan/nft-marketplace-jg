import { RegisterPage } from "@/features/auth/register-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});
