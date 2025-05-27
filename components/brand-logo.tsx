"use client"

import Image from "next/image"

export function BrandLogo({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Image
        src="https://pongeluppeinformatica.com.br/images/erpsaude.png"
        alt="PongeluppeTelemed Logo"
        width={180}
        height={40}
        className="h-full w-auto"
        priority
      />
    </div>
  )
}
