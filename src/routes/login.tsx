import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login · JusticeLine AI" },
      { name: "description", content: "Sign in to your JusticeLine AI legal workspace." },
      { property: "og:title", content: "Login · JusticeLine AI" },
      { property: "og:description", content: "Access your legal research and drafting workspace." },
    ],
  }),
  component: LoginRedirect,
});

/** Login now lives in a modal — this legacy route sends users home and opens it. */
function LoginRedirect() {
  const { openLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/", replace: true });
    openLogin("/dashboard");
  }, [navigate, openLogin]);

  return <div className="min-h-screen bg-background" />;
}
