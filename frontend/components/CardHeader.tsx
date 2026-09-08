import Image from "next/image";

/**
 * Card masthead: a shifting brand gradient, rising bubbles, and the logo held
 * inside rotating accent rings, closed off by the wave curve used throughout
 * the printed catalogue so the digital card reads as the same family.
 */
export default function CardHeader() {
  // Staggered so the bubbles never pulse in unison.
  const bubbles = [
    { left: "8%", size: 26, delay: "0s", dur: "7s" },
    { left: "22%", size: 14, delay: "1.6s", dur: "6s" },
    { left: "38%", size: 20, delay: "3.1s", dur: "8s" },
    { left: "68%", size: 16, delay: "0.8s", dur: "6.5s" },
    { left: "82%", size: 24, delay: "2.4s", dur: "7.5s" },
    { left: "92%", size: 12, delay: "4s", dur: "6s" },
  ];

  return (
    <div className="relative h-[200px] overflow-hidden card-sheen">
      {bubbles.map((b, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="card-bubble absolute bottom-8 rounded-full bg-white/25"
          style={{
            left: b.left,
            width: b.size,
            height: b.size,
            animationDelay: b.delay,
            animationDuration: b.dur,
          }}
        />
      ))}

      <div className="relative h-full flex items-center justify-center pb-6">
        <div className="relative card-float w-[132px] h-[132px] flex items-center justify-center">
          {/* Outer sweep: a conic gradient disc, masked by the white badge to
              leave only a rotating ring visible. */}
          <span
            aria-hidden="true"
            className="card-ring absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0deg, #E4779F 70deg, #ffffff 150deg, #1E62B0 240deg, transparent 330deg)",
            }}
          />
          {/* Inner counter-rotating dotted ring for depth */}
          <span
            aria-hidden="true"
            className="card-ring-slow absolute inset-[9px] rounded-full border-2 border-dashed border-white/45"
          />
          {/* Soft glow */}
          <span aria-hidden="true" className="absolute inset-1 rounded-full bg-white/25 blur-md" />

          {/* Logo badge */}
          <div className="relative w-[104px] h-[104px] rounded-full bg-white shadow-[0_10px_28px_rgba(0,0,0,0.22)] flex items-center justify-center p-2.5">
            <Image
              src="/images/brand/mdh-logo.png"
              alt="M.D. Hygiene"
              width={104}
              height={104}
              priority
              className="w-full h-full object-contain rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Catalogue-style wave, layered pink over white */}
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
