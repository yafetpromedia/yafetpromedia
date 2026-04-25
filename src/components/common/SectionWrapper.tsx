import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  containerClassName?: string;
}

export default function SectionWrapper({
  children,
  className,
  id,
  containerClassName,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={cn("py-24 md:py-32 relative overflow-hidden", className)}
    >
      <div className={cn("container px-4 mx-auto", containerClassName)}>
        {children}
      </div>
    </section>
  );
}
