import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeConfig = {
  sm: {
    icon: "h-6 w-6",
    text: "text-lg",
    gap: "gap-2",
  },
  md: {
    icon: "h-8 w-8",
    text: "text-xl",
    gap: "gap-2.5",
  },
  lg: {
    icon: "h-10 w-10",
    text: "text-2xl",
    gap: "gap-3",
  },
};

export function Logo({
  className,
  iconClassName,
  textClassName,
  showText = true,
  size = "md",
}: LogoProps) {
  const config = sizeConfig[size];

  return (
    <div className={cn("flex items-center", config.gap, className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-xl bg-primary p-2",
          iconClassName
        )}
      >
        <GraduationCap
          className={cn(config.icon, "text-primary-foreground")}
          strokeWidth={2}
        />
      </div>
      {showText && (
        <span
          className={cn(
            "font-display font-bold tracking-tight text-foreground",
            config.text,
            textClassName
          )}
        >
          EduConnect
        </span>
      )}
    </div>
  );
}
