"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { shouldUseUnoptimizedImage } from "@/lib/image-src";
import AwudWordmark from "@/components/common/AwudWordmark";
import { defaultSiteContent } from "@/lib/site-content.shared";

type SiteLogoProps = {
  /** Icon / mark only — typography uses the official wordmark art */
  src: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  priority?: boolean;
  showWordmark?: boolean;
};

const SIZE = {
  sm: { wrap: "h-10 gap-2 sm:h-11", icon: 40, type: "text-[1.28rem] sm:text-[1.4rem]" },
  md: { wrap: "h-12 gap-2.5", icon: 48, type: "text-[1.55rem]" },
  lg: { wrap: "h-14 gap-3", icon: 56, type: "text-[1.75rem]" },
} as const;

/** Committed brand mark — always available after deploy (unlike /uploads). */
const DEFAULT_MARK = "/brand/awud-mark.png";

function resolveMarkSrc(src: string) {
  const value = src.trim();
  if (!value) return DEFAULT_MARK;
  if (
    value.includes("awud-digitals-logo") ||
    value.includes("awud-digitals-mark") ||
    value === defaultSiteContent.siteLogoSrc ||
    value.startsWith("/uploads/hero/awud")
  ) {
    return DEFAULT_MARK;
  }
  return value;
}

/**
 * Official lockup: mark + brand wordmark art (same text as the reference lockup).
 */
export default function SiteLogo({
  src,
  className,
  size = "sm",
  priority = false,
  showWordmark = true,
}: SiteLogoProps) {
  const dims = SIZE[size];
  const markSrc = resolveMarkSrc(src);

  return (
    <span className={cn("inline-flex items-center", dims.wrap, className)}>
      <span
        className="relative flex shrink-0 items-center justify-center overflow-hidden"
        style={{ width: dims.icon, height: dims.icon }}
      >
        <Image
          src={markSrc}
          alt=""
          width={dims.icon}
          height={dims.icon}
          className="size-full object-contain"
          priority={priority}
          unoptimized={shouldUseUnoptimizedImage(markSrc)}
        />
      </span>
      {showWordmark ? (
        <AwudWordmark className={dims.type} priority={priority} />
      ) : (
        <span className="sr-only">Awud Digitals</span>
      )}
    </span>
  );
}
