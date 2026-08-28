import { Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AppSidebar } from "@/components/layout/AppSidebar";


import { MobileHeader } from "@/components/mobile/MobileHeader";
import { MobileSidebar } from "@/components/mobile/MobileSidebar";
import { TabletLayout } from "@/components/tablet/TabletLayout";

import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export const Route = createFileRoute("/_workspace")({
  component: WorkspaceLayout,
});

function WorkspaceLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    hydrated,
    isAuthenticated,
    requireAuth,
    loginModalOpen,
  } = useAuth();

  const href = useRouterState({
    select: (s) => s.location.href,
  });

  useEffect(() => {
    if (
      hydrated &&
      !isAuthenticated &&
      !loginModalOpen
    ) {
      requireAuth(href);
    }
  }, [
    hydrated,
    isAuthenticated,
    loginModalOpen,
    requireAuth,
    href,
  ]);

  if (!hydrated) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!isAuthenticated) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-6">
        <div className="max-w-sm text-center">
          <div className="flex justify-center">
            <Logo />
          </div>

          <div className="mx-auto mt-6 grid h-12 w-12 place-items-center rounded-full bg-muted">
            <Lock className="h-5 w-5 text-primary" />
          </div>

          <h1 className="mt-4 font-serif text-2xl font-semibold tracking-tight">
            Sign in to continue
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            This workspace is available to signed-in members.
          </p>

          <Button
            className="mt-6 bg-brand-gradient text-white hover:opacity-95"
            onClick={() => requireAuth(href)}
          >
            Sign in
          </Button>
        </div>
      </div>
    );
  }

   return (
    <>
      {/* MOBILE */}
      <div className="block min-h-screen w-full bg-background md:hidden">
        <MobileHeader
          onMenuClick={() => setMobileMenuOpen(true)}
        />

        <MobileSidebar
          open={mobileMenuOpen}
          onOpenChange={setMobileMenuOpen}
        />

        <main className="min-h-[calc(100vh-64px)] min-w-0">
          <Outlet />
        </main>
      </div>

      {/* TABLET */}
      <div className="hidden md:block lg:hidden">
        <TabletLayout>
          <Outlet />
        </TabletLayout>
      </div>

      {/* DESKTOP */}
      <div className="hidden min-h-screen w-full bg-background lg:flex">
        <AppSidebar />

        <div className="ml-64 flex min-w-0 flex-1 flex-col">
          <Outlet />
        </div>
      </div>
    </>
  );
}