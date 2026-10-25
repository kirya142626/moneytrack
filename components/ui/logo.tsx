import Link from "next/link";
import { cn } from "@/lib/cn";

export function LogoMark({ className, size = 34 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="MoneyTrack"
    >
      <rect x="1" y="1" width="38" height="38" rx="11" fill="var(--mt-accent, #0e9f6e)" />
      <rect x="1" y="1" width="38" height="38" rx="11" stroke="rgba(0,0,0,0.08)" />
      <path
        d="M9.5 27.5L16.5 19.5L22.5 23.5L30 12.5"
        stroke="var(--mt-on-accent, #ffffff)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24.5 12.5H30V18"
        stroke="var(--mt-on-accent, #ffffff)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="27.5" r="2.1" fill="var(--mt-on-accent, #ffffff)" />
    </svg>
  );
}

export function Logo({
  href = "/",
  className,
  showText = true,
  size = 34,
}: {
  href?: string;
  className?: string;
  showText?: boolean;
  size?: number;
}) {
  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      {showText ? (
        <span className="text-[19px] font-semibold tracking-[-0.035em] text-ink">
          Money<span className="text-brand-strong">Track</span>
        </span>
      ) : null}
    </span>
  );
  if (!href) return content;
  return (
    <Link href={href} aria-label="MoneyTrack — на главную" className="inline-flex">
      {content}
    </Link>
  );
}
