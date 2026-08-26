import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme";
import lightLogo from "@/assets/justiceline-light.png";
import darkLogo from "@/assets/justiceline-dark.png";
type LogoProps = {
  className?: string;
  /**
   * "auto"    — follow the active app theme (default)
   * "onLight" — force the dark-ink logo (for light surfaces)
   * "onDark"  — force the light/white logo (for dark surfaces, e.g. the maroon sidebar)
   */
  variant?: "auto" | "onLight" | "onDark";
};

export function Logo({ className, variant = "auto" }: LogoProps) {
  const { resolved } = useTheme();
  const onDark = variant === "onDark" || (variant === "auto" && resolved === "dark");
const src = onDark ? darkLogo : lightLogo;
  return (
    <img
      src={src}
      alt="JusticeLine AI"
      width={1920}
      height={512}
      className={cn("h-12 w-auto object-contain", className)}
    />
  );
}
