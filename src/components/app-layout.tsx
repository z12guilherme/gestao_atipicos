import { Outlet } from "react-router-dom";
import { Header } from "@/components/header";

export function AppLayout() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-muted/40">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}