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

/**
 * Official lockup type (open A, custom W/U/D, tracked DIGITALS + rule).
 * Must use the brand asset — web fonts cannot match these letterforms.
 */
const WORDMARK_LIGHT = "/brand/awud-wordmark-light.png";
const WORDMARK_DARK = "/brand/awud-wordmark-dark.png";

export default function AwudWordmark({ className, priority = false }: Props) {
  const { theme } = useTheme();
  const src = theme === "dark" ? WORDMARK_DARK : WORDMARK_LIGHT;

  return (
    <span
      className={cn(
        "relative inline-flex h-[1.32em] items-center",
        className
      )}
    >
      <Image
        src={src}
        alt="AWUD DIGITALS"
        width={517}
        height={165}
        className="h-full w-auto max-w-[min(56vw,16.75rem)] object-contain object-left"
        priority={priority}
        unoptimized={shouldUseUnoptimizedImage(src)}
      />
    </span>
  );
}
