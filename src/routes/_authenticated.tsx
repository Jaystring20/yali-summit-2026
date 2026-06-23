import { useEffect } from "react";
import { createFileRoute, Outlet, useNavigate, useRouter } from "@tanstack/react-router";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/_authenticated")({
  component: AuthGate,
});

function AuthGate() {
  const { session, loading } = useSession();
  const navigate = useNavigate();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) {
      navigate({ to: "/login", search: { redirect: router.state.location.pathname } });
    }
  }, [loading, session, navigate, router]);

  if (loading || !session) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center" style={{ color: "var(--text-secondary)" }}>
        Loading…
      </div>
    );
  }

  return <Outlet />;
}