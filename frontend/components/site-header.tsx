"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [
  { label: "Demo", href: "/demo" },
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="container-wide flex h-[76px] items-center justify-between">
        <Brand />
        <nav className="hidden items-center gap-9 md:flex" aria-label="Main navigation">
          <Link className="nav-link" href="/">Home</Link>
          {links.map((link) => <Link className="nav-link" href={link.href} key={link.label}>{link.label}</Link>)}
          <ThemeToggle />
          <Link className="button button-primary button-small" href="/workspace">Get started <span aria-hidden="true">↗</span></Link>
        </nav>
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="icon-button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav className="mobile-nav md:hidden" aria-label="Mobile navigation">
          <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
          {links.map((link) => <Link href={link.href} key={link.label} onClick={() => setMenuOpen(false)}>{link.label}</Link>)}
          <Link href="/workspace" onClick={() => setMenuOpen(false)}>Get started <span aria-hidden="true">↗</span></Link>
        </nav>
      )}
    </header>
  );
}
