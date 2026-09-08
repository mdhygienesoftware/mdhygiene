/**
 * Backdrop for the visiting card: a restrained corporate treatment — a fine
 * grid, two low-opacity brand-tinted washes that drift slowly, and a soft
 * vignette. Fixed and pointer-events-none so it never affects scroll or taps.
 */
export default function CardBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {/* Base wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F7FAFD] via-[#FBF7F4] to-[#F4F8FC]" />

      {/* Fine engineering grid — reads as precise/industrial rather than playful */}
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(18,58,92,0.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(18,58,92,0.055) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 100%)",
        }}
      />

      {/* Two large, very soft brand washes, drifting slowly */}
      <span
        className="card-blob absolute rounded-full blur-[110px]"
        style={{
          background: "#1E62B0",
          width: 520,
          height: 520,
          top: "-18%",
          right: "-16%",
          opacity: 0.13,
        }}
      />
      <span
        className="card-blob absolute rounded-full blur-[110px]"
        style={{
          background: "#E4779F",
          width: 460,
          height: 460,
          bottom: "-16%",
          left: "-14%",
          opacity: 0.12,
          animationDelay: "7s",
        }}
      />

      {/* Vignette to settle the edges */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(18,58,92,0.07)_100%)]" />
    </div>
  );
}
