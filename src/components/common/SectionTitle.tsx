import { cn } from "@/lib/utils";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  description?: string;
  alignment?: "left" | "center";
  className?: string;
}

export default function SectionTitle({
  title,
  subtitle,
  description,
  alignment = "center",
  className,
}: SectionTitleProps) {
  return (
    <div
      className={cn(
        "mb-16 max-w-3xl mx-auto",
        alignment === "center" ? "text-center" : "text-left",
        className
      )}
    >
      {subtitle && (
        <span className="text-primary font-medium tracking-widest uppercase text-xs mb-3 block">
          {subtitle}
        </span>
      )}
      <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white leading-tight">
        {title}
      </h2>
      {description && (
        <p className="text-gray-400 text-lg leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
