import Image from "next/image"

interface LogoProps {
  variant?: "light" | "dark"
  size?: "sm" | "md" | "lg"
  className?: string
}

export function Logo({ variant = "dark", size = "md", className = "" }: LogoProps) {
  const sizeClasses = {
    sm: "h-8",
    md: "h-12",
    lg: "h-16",
  }

  const logoSrc = variant === "light" ? "/logo-white.png" : "/logo-dark.png"

  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src={logoSrc || "/placeholder.svg"}
        alt="Rivolio"
        width={200}
        height={64}
        className={`${sizeClasses[size]} w-auto`}
        priority
      />
    </div>
  )
}
