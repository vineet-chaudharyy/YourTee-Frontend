import type { ReactNode } from "react";

// CSS-driven page transition — starts at paint time (not JS hydration),
// so it never delays the initial LCP. Replays on each route change because
// Next remounts the template.
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
