import { Outlet } from "@tanstack/react-router";
import { TopNav } from "@/components/TopNav";
import { Footer } from "@/components/Footer";
import { BottomTabBar } from "@/components/BottomTabBar";

export function AppShell() {
  return (
    <div className="min-h-dvh bg-background text-text-primary">
      <TopNav />
      <main className="pt-24 md:pt-28 pb-20 md:pb-0 min-h-dvh">
        <Outlet />
      </main>
      <Footer />
      <BottomTabBar />
    </div>
  );
}