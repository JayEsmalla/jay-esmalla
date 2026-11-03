import { Link } from "react-router-dom";
import { nowBuilding } from "@/data/portfolio";
import { formatRelativeAge, useLatestCommit } from "@/lib/github-latest";
import VisitorCounter from "./VisitorCounter";

export default function SignalStrip() {
  const commit = useLatestCommit(import.meta.env.MODE !== "test");
  const age = formatRelativeAge(commit.pushedAt);

  return (
    <div className="grid grid-cols-1 bg-carbon sm:grid-cols-3">
      {/* 1 · Last Commit */}
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <p className="meta-text text-smoke">LAST COMMIT</p>
          <span className="status-dot shrink-0" aria-hidden="true" />
        </div>
        <a
          href={commit.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2.5 block truncate text-[16px] leading-snug tracking-[-0.02em] text-chalk transition-colors hover:text-pulse-green sm:text-[17px]"
          title={`${commit.repo}: ${commit.message}`}
        >
          {commit.message}
        </a>
        <p className="meta-text mt-2 truncate tabular-nums text-smoke/70">
          {commit.repo} · {age}
        </p>
      </div>

      {/* 2 · Now Building */}
      <div className="border-t border-graphite p-5 sm:border-l sm:border-t-0 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <p className="meta-text text-smoke">NOW BUILDING</p>
          <span className="font-mono-retro text-[10px] uppercase tracking-[0.05em] text-smoke/50">ACTIVE</span>
        </div>
        <Link
          to={`/projects/${nowBuilding.projectId}`}
          className="mt-2.5 block truncate text-[16px] leading-snug tracking-[-0.02em] text-chalk transition-colors hover:text-pulse-green sm:text-[17px]"
        >
          {nowBuilding.title}
        </Link>
        <p className="meta-text mt-2 truncate text-smoke/70">{nowBuilding.detail}</p>
      </div>

      {/* 3 · Viewing Now */}
      <div className="border-t border-graphite p-5 sm:border-l sm:border-t-0 sm:p-6">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="meta-text text-smoke">VIEWING NOW</p>
          <span className="font-mono-retro text-[10px] text-pulse-green">LIVE</span>
        </div>
        <VisitorCounter />
      </div>
    </div>
  );
}
