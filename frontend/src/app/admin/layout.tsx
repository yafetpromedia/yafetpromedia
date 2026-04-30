import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden bg-background text-foreground antialiased selection:bg-primary/20 selection:text-foreground">
      {children}
    </div>
  );
}
