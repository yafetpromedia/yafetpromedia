import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-foreground antialiased selection:bg-primary/20 selection:text-foreground">
      {children}
    </div>
  );
}
