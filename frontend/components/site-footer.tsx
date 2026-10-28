import Link from "next/link";
import { Brand } from "@/components/brand";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="container-wide grid gap-8 py-10 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <Brand />
          <p className="mt-3 max-w-md text-sm leading-6 text-muted">A private, open-weight workspace for finding moments and shaping captions from Nigerian voices.</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted" aria-label="Footer navigation">
          <a href="https://github.com/Vic-toria678/TEAM-NEXORA" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://github.com/Vic-toria678/TEAM-NEXORA/blob/main/LICENSE" target="_blank" rel="noreferrer">Licence</a>
          <a href="https://github.com/Vic-toria678/TEAM-NEXORA#team" target="_blank" rel="noreferrer">Team</a>
          <a href="https://github.com/Vic-toria678/TEAM-NEXORA#acknowledgements" target="_blank" rel="noreferrer">Acknowledgements</a>
        </nav>
      </div>
      <div className="container-wide border-t border-line py-4 text-xs text-muted">© {new Date().getFullYear()} TEAM-NEXORA. Open source, built with care.</div>
    </footer>
  );
}
