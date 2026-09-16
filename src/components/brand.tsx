import { cn } from "@/lib/utils";

export function Wordmark({
  className,
  tone = "dark",
  size = "md",
}: {
  className?: string;
  tone?: "dark" | "light";
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  } as const;

  return (
    <span className={cn("inline-flex items-baseline gap-[3px]", className)}>
      <span
        className={cn(
          "mnlk-wordmark leading-none",
          sizes[size],
          tone === "light" ? "text-primary-foreground" : "text-primary",
        )}
      >
        MNLK
      </span>
      <span className="mb-[2px] inline-block size-[6px] rounded-full bg-gold" aria-hidden="true" />
    </span>
  );
}
