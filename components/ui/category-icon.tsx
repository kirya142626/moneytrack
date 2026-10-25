import {
  Baby,
  Briefcase,
  Car,
  CircleEllipsis,
  Clapperboard,
  Coffee,
  Dumbbell,
  Gamepad2,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  Laptop,
  PawPrint,
  PiggyBank,
  Plane,
  Repeat,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Store,
  TrendingUp,
  Utensils,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

const ICONS: Record<string, LucideIcon> = {
  "shopping-cart": ShoppingCart,
  utensils: Utensils,
  home: Home,
  car: Car,
  "heart-pulse": HeartPulse,
  "graduation-cap": GraduationCap,
  clapperboard: Clapperboard,
  "gamepad-2": Gamepad2,
  "shopping-bag": ShoppingBag,
  store: Store,
  smartphone: Smartphone,
  repeat: Repeat,
  plane: Plane,
  briefcase: Briefcase,
  laptop: Laptop,
  "trending-up": TrendingUp,
  gift: Gift,
  wallet: Wallet,
  "piggy-bank": PiggyBank,
  coffee: Coffee,
  dumbbell: Dumbbell,
  "paw-print": PawPrint,
  baby: Baby,
  wrench: Wrench,
  "circle-ellipsis": CircleEllipsis,
};

export function CategoryIcon({
  name,
  className,
  size = 18,
  strokeWidth = 1.9,
}: {
  name: string;
  className?: string;
  size?: number;
  strokeWidth?: number;
}) {
  const Icon = ICONS[name] ?? CircleEllipsis;
  return <Icon size={size} strokeWidth={strokeWidth} className={className} aria-hidden />;
}

export function CategoryGlyph({
  icon,
  color,
  size = "md",
  className,
}: {
  icon: string;
  color: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const box = size === "sm" ? "h-8 w-8 rounded-lg" : size === "lg" ? "h-12 w-12 rounded-xl" : "h-10 w-10 rounded-xl";
  const iconSize = size === "sm" ? 15 : size === "lg" ? 22 : 18;
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center", box, className)}
      style={{ backgroundColor: `${color}18`, color }}
    >
      <CategoryIcon name={icon} size={iconSize} />
    </span>
  );
}
