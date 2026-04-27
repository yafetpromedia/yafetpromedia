"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme/ThemeProvider";

export function ThemeToggle({ className }: { className?: string }) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  if (!mounted) {
    return (
      <button
        className={cn(
          "relative size-10 rounded-full border flex items-center justify-center transition-all duration-300",
          "bg-white/5 border-white/10 text-gray-400",
          "hover:text-black hover:border-black/40",
          "dark:hover:text-white dark:hover:border-white/40",
          className
        )}
        aria-label="Toggle theme"
        type="button"
      >
        <Moon className="size-5" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative size-10 rounded-full border flex items-center justify-center transition-all duration-300",
        "bg-white/5 border-white/10 text-foreground/45",
        "hover:text-black hover:border-black/50",
        "dark:text-gray-400 dark:hover:text-white dark:hover:border-primary/50",
        className
      )}
      aria-label="Toggle theme"
      type="button"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
            transition={{ duration: 0.3 }}
          >
            <Moon className="size-5" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
            transition={{ duration: 0.3 }}
          >
            <Sun className="size-5" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
