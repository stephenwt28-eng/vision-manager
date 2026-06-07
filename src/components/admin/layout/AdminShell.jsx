"use client";

import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function AdminShell({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Sidebar
        mode="admin"
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onToggleCollapsed={() => setSidebarCollapsed((value) => !value)}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <Header
        mode="admin"
        sidebarCollapsed={sidebarCollapsed}
        onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
      />

      <main
        className={[
          "min-h-dvh px-3 pb-6 pt-[142px] transition-[padding] duration-300 ease-out",
          "sm:px-4 sm:pb-8 sm:pt-[150px]",
          "lg:pr-5",
          sidebarCollapsed ? "lg:pl-[124px]" : "lg:pl-[332px]",
        ].join(" ")}
      >
        <div className="mx-auto w-full max-w-[1600px]">{children}</div>
      </main>
    </div>
  );
}
