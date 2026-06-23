import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getMyRoles } from "@/lib/tickets.functions";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminGate,
});

function AdminGate() {
  const { session } = useSession();
  const navigate = useNavigate();
  const fetchRoles = useServerFn(getMyRoles);
  const { data, isLoading } = useQuery({
    queryKey: ["my-roles", session?.user.id],
    queryFn: () => fetchRoles(),
    enabled: !!session,
  });

  if (isLoading || !data) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center" style={{ color: "var(--text-secondary)" }}>
        Loading…
      </div>
    );
  }
  const roles = data.roles ?? [];
  if (!roles.includes("admin") && !roles.includes("staff")) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <h1 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          Not authorized
        </h1>
        <p className="mb-6 text-sm" style={{ color: "var(--text-secondary)" }}>
          You're signed in as <strong>{session?.user.email}</strong>, but you don't have admin or staff access.
        </p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => navigate({ to: "/profile" })}
            className="px-5 py-2 rounded-full text-sm font-semibold"
            style={{ background: "var(--accent-cyan)", color: "var(--brand-navy)" }}
          >
            Go to my profile
          </button>
          <button
            onClick={() => supabase.auth.signOut().then(() => navigate({ to: "/login" }))}
            className="px-5 py-2 rounded-full text-sm font-semibold border"
            style={{ borderColor: "var(--border-strong)", color: "var(--text-primary)" }}
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }
  return <Outlet />;
}