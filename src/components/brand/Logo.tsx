import { cn } from "@/lib/utils";

export function Logo({
  className,
}: {
  className?: string;
}) {
  return (
    <img
      src="/JUSTICE LINE.png"
      alt="JusticeLine AI"
      className={cn("h-12 w-auto object-contain", className)}
    />
  );
}