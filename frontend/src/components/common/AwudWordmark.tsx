"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { shouldUseUnoptimizedImage } from "@/lib/image-src";
import { useTheme } from "@/components/theme/ThemeProvider";

type Props = {
  className?: string;
  /** Kept for API compat — rule is already in the wordmark art */
  showRule?: boolean;
  priority?: boolean;
};

const WORDMARK_LIGHT = "/uploads/hero/awud-digitals-wordmark-light.png";
const WORDMARK_DARK = "/uploads/hero/awud-digitals-wordmark-dark.png";

/**
 * Exact brand wordmark from the AWUD DIGITALS lockup (not a recreated font).
 * Swaps light/dark assets so the original letterforms stay true.
 */
export default function AwudWordmark({ className, priority = false }: Props) {
  const { theme } = useTheme();
  const src = theme === "dark" ? WORDMARK_DARK : WORDMARK_LIGHT;

  return (
    <span className={cn("relative inline-flex h-[1.35em] items-center", className)}>
      <Image
        src={src}
        alt="AWUD DIGITALS"
        width={360}
        height={108}
        className="h-full w-auto max-w-[min(56vw,16.5rem)] object-contain object-left drop-shadow-[0_0.5px_0_rgba(0,0,0,0.18)] dark:drop-shadow-none"
        priority={priority}
        unoptimized={shouldUseUnoptimizedImage(src)}
      />
    </span>
  );
}
