import { site } from "@/config/site";
import { AnchorButton, PhoneIcon } from "./Button";

export function CallButton({
  size = "lg",
  variant = "primary",
  label = "Helista kohe",
  showNumber = false,
  className = "",
}: {
  size?: "md" | "lg";
  variant?: "primary" | "secondary";
  label?: string;
  showNumber?: boolean;
  className?: string;
}) {
  return (
    <AnchorButton
      href={site.phone.href}
      variant={variant}
      size={size}
      className={className}
      aria-label={`${label}: ${site.phone.display}`}
    >
      <PhoneIcon />
      <span>{label}</span>
      {showNumber && <span className="font-mono text-[0.85em] font-medium opacity-80">{site.phone.display}</span>}
    </AnchorButton>
  );
}
