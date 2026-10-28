"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <button
      type="button"
      aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="icon-button"
    >
      {mounted && resolvedTheme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
