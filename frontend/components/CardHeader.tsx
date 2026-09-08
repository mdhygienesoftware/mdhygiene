import Image from "next/image";

/**
 * Card masthead: brand gradient with slow layered waves (the motif used
 * throughout the printed catalogue) and the logo in a clean static badge.
 */
export default function CardHeader() {
  return (
    <div className="relative h-[200px] overflow-hidden card-sheen">
      {/* Layered waves drifting at different rates — replaces the bubbles and
          keeps the header in the same visual language as the print material. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 520 200"
        preserveAspectRatio="none"
        className="card-wave absolute inset-0 w-[118%] h-full opacity-[0.22]"
      >
        <path d="M0,120 C120,80 200,150 300,115 C400,82 460,110 520,95 L520,200 L0,200 Z" fill="#ffffff" />
      </svg>
      <svg
        aria-hidden="true"
        viewBox="0 0 520 200"
        preserveAspectRatio="none"
        className="card-wave absolute inset-0 w-[118%] h-full opacity-[0.16]"
        style={{ animationDuration: "16s", animationDirection: "reverse" }}
      >
        <path d="M0,150 C90,120 190,175 290,140 C390,108 460,140 520,125 L520,200 L0,200 Z" fill="#E4779F" />
      </svg>

      {/* Soft corner light */}
      <span
        aria-hidden="true"
        className="absolute -top-16 -right-10 w-56 h-56 rounded-full bg-white/15 blur-3xl"
      />

      <div className="relative h-full flex items-center justify-center pb-6">
        <div className="w-[112px] h-[112px] rounded-full bg-white ring-[3px] ring-white/70 shadow-[0_10px_28px_rgba(0,0,0,0.22)] flex items-center justify-center p-2.5">
          <Image
            src="/images/brand/mdh-logo.png"
            alt="M.D. Hygiene"
            width={112}
            height={112}
            priority
            className="w-full h-full object-contain rounded-full"
          />
        </div>
      </div>

      {/* Catalogue-style wave closing the header */}
      <svg
        aria-hidden="true"
        viewBox="0 0 440 60"
        preserveAspectRatio="none"
        className="absolute -bottom-px inset-x-0 w-full h-[46px]"
      >
        <path d="M0,34 C90,4 170,54 260,30 C330,11 390,26 440,40 L440,60 L0,60 Z" fill="#E4779F" opacity="0.35" />
        <path d="M0,42 C80,18 165,58 255,38 C335,20 395,34 440,46 L440,60 L0,60 Z" fill="#ffffff" />
      </svg>
    </div>
  );
}
