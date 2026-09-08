/**
 * The page surrounding the visiting card. The card itself stays clean white,
 * so all of the visual interest lives out here — brand colour, waves and
 * pattern in the space either side of it.
 *
 * Fixed and pointer-events-none so it never affects scrolling or taps.
 */
export default function CardBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {/* Brand ground */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0E2A4A] via-[#123A5C] to-[#1E62B0]" />

      {/* Colour washes to break up the flat navy */}
      <span
        className="card-blob absolute rounded-full blur-[120px]"
        style={{ background: "#E4779F", width: 620, height: 620, top: "-16%", left: "-12%", opacity: 0.5 }}
      />
      <span
        className="card-blob absolute rounded-full blur-[120px]"
        style={{
          background: "#3E9BE0",
          width: 560,
          height: 560,
          bottom: "-18%",
          right: "-10%",
          opacity: 0.45,
          animationDelay: "6s",
        }}
      />

      {/* Dot grid across the whole ground */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.30) 1.3px, transparent 1.3px)",
          backgroundSize: "26px 26px",
        }}
      />

      {/* Catalogue-style waves along the bottom, drifting */}
      <svg
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        className="card-wave absolute -bottom-2 left-0 w-[120%] h-[240px] opacity-[0.18]"
      >
        <path d="M0,180 C240,110 420,250 720,190 C980,138 1180,196 1440,150 L1440,320 L0,320 Z" fill="#ffffff" />
      </svg>
      <svg
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        className="card-wave absolute -bottom-2 left-0 w-[120%] h-[200px] opacity-[0.22]"
        style={{ animationDuration: "17s", animationDirection: "reverse" }}
      >
        <path d="M0,220 C260,160 460,280 760,225 C1020,178 1220,232 1440,196 L1440,320 L0,320 Z" fill="#E4779F" />
      </svg>

      {/* Softens the very top so the card's shadow has something to sit on */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/20 to-transparent" />
    </div>
  );
}
