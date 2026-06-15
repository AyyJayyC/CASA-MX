import Image from "next/image"
import Link from "next/link"

interface LogoProps {
  variant?: "default" | "white" | "white-lg"
  size?: "sm" | "md" | "lg" | "xl" | "xxl" | "hero" | "nav" | "auth"
  showText?: boolean
  asLink?: boolean
  className?: string
}

const sizes: Record<string, number> = { sm: 40, md: 56, lg: 80, xl: 160, xxl: 300, hero: 360, nav: 36, auth: 300 }

const textSizes: Record<string, string> = {
  sm: "16px",
  md: "20px",
  lg: "26px",
  xl: "36px",
  xxl: "48px",
  hero: "54px",
  nav: "18px",
  auth: "48px",
}

export function Logo({ variant = "default", size = "md", showText = true, asLink = true, className = "" }: LogoProps) {
  const src = size === "nav"
    ? "/icon-nav.webp"
    : variant === "white-lg"
      ? "/logo-white-lg.webp"
      : variant === "white"
        ? "/logo-white.webp"
        : "/logo.webp"

  const isWhite = variant === "white" || variant === "white-lg"
  const isNav = size === "nav"
  const dim = sizes[size]

  const logoStyle = isNav
    ? { height: dim, width: "auto" }
    : { width: dim, height: "auto" }

  const logo = (
    <span className={`flex items-center gap-2 select-none ${className}`}>
      <Image
        src={src}
        alt="CASA MX"
        width={dim}
        height={dim}
        priority
        className="object-contain"
        style={logoStyle}
      />
      {showText && (
        <span
          className={`font-bold tracking-tight ${isWhite ? "text-white" : "text-ink"}`}
          style={{ fontSize: textSizes[size] }}
        >
          CASA MX
        </span>
      )}
    </span>
  )

  if (asLink) {
    return (
      <Link href="/" className="no-underline">
        {logo}
      </Link>
    )
  }

  return logo
}
