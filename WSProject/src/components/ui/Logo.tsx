// Brand mark: a three-spoke racing wheel with a red 12 o'clock stripe, next to the wordmark.
// Inside a link with the `group` class, hovering turns the wheel and spreads the letters.

export function SteeringWheelIcon({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="12" r="9.5" strokeWidth="2.2" />
      <circle cx="12" cy="12.6" r="2.6" strokeWidth="1.7" />
      <path d="M9.4 12.6H2.8M14.6 12.6H21.2M12 15.2V21.3" strokeWidth="2" />
      <path d="M12 1.3V3.7" stroke="var(--color-accent)" strokeWidth="2.6" strokeLinecap="butt" />
    </svg>
  );
}

export function Logo({ size = 22 }: { size?: number }) {
  return (
    // Fixed ink colour: the global link hover (red) would otherwise tint the whole mark.
    <span className="inline-flex items-center gap-2.5 font-semibold text-ink">
      <SteeringWheelIcon
        size={size}
        className="shrink-0 transition-transform duration-600 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-30 group-focus-visible:-rotate-30 motion-reduce:transition-none"
      />
      {/* The invisible copy reserves the spread width so the header doesn't shift on hover. */}
      <span className="grid">
        <span className="col-start-1 row-start-1 tracking-brand transition-[letter-spacing] duration-400 ease-out group-hover:tracking-[0.38em] group-focus-visible:tracking-[0.38em] motion-reduce:transition-none">
          WHEELSPACE
        </span>
        <span aria-hidden="true" className="invisible col-start-1 row-start-1 tracking-[0.38em]">
          WHEELSPACE
        </span>
      </span>
    </span>
  );
}
