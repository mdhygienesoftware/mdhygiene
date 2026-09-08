/**
 * Slow-drifting blurred blobs behind the visiting card, in the logo's own
 * palette (pink, blue, lime, amber). Fixed and pointer-events-none so it never
 * interferes with scrolling or taps.
 */
export default function CardBackdrop() {
  const blobs: {
    color: string;
    size: number;
    delay: string;
    opacity: number;
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
  }[] = [
    { color: "#E4779F", size: 340, top: "-6%", left: "-14%", delay: "0s", opacity: 0.42 },
    { color: "#1E62B0", size: 300, top: "22%", right: "-16%", delay: "3s", opacity: 0.34 },
    { color: "#B7D64B", size: 260, bottom: "6%", left: "-10%", delay: "6s", opacity: 0.3 },
    { color: "#F9B233", size: 220, bottom: "-8%", right: "-6%", delay: "9s", opacity: 0.28 },
  ];

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {blobs.map((b, i) => (
        <span
          key={i}
          className="card-blob absolute rounded-full blur-3xl"
          style={{
            background: b.color,
            width: b.size,
            height: b.size,
            top: b.top,
            left: b.left,
            right: b.right,
            bottom: b.bottom,
            opacity: b.opacity,
            animationDelay: b.delay,
          }}
        />
      ))}
    </div>
  );
}
