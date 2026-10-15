import { useEffect, useState, type ReactNode } from "react";
import { shouldTrackVisitors, startVisitorTracking, VisitorContext, type VisitorCounts } from "@/lib/visitors";

export default function VisitorProvider({ children }: { children: ReactNode }) {
  const [counts, setCounts] = useState<VisitorCounts | null>(null);
  useEffect(() => {
    if (shouldTrackVisitors(import.meta.env.PROD, window.location.origin)) {
      return startVisitorTracking(setCounts);
    }
  }, []);
  return <VisitorContext.Provider value={counts}>{children}</VisitorContext.Provider>;
}
