// 1:64 sports coupe in side view, facing right (the way it drives). Wheels spin via .car-wheel
// (globals.css). Used by the route progress bar and the loading placeholders.
export function MiniCar({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 24" aria-hidden="true" className={className}>
      <path d="M2.6 11.4h6.2v1.2H2.6zM5 12.4h1.1v1.4H5z" fill="currentColor" />
      <path
        d="M3 18.6V15.1c0-1.4.9-2.3 2.3-2.5l8.6-1.3C18.3 8 23.4 6.3 29.6 6.3c5.4 0 9.4 1.5 13.7 5.1l11.6 1.7c3.7.5 6.1 2 6.1 4.2v1.3c0 .6-.4 1-1 1H4c-.6 0-1-.4-1-1Z"
        fill="currentColor"
      />
      <path d="M17.6 11.4c3.4-2.9 7.2-4.2 11.8-4.2 4.1 0 7.2 1.3 10.4 4.2Z" fill="#9aa3ad" opacity=".55" />
      <path d="M29.3 7.3v4.1" stroke="#121212" strokeWidth=".8" opacity=".5" />
      <rect x="3.2" y="14.1" width="2.8" height="1.3" rx=".6" fill="#ff5a64" />
      <rect x="57.4" y="14.3" width="3" height="1.1" rx=".5" fill="#f2efe6" />
      {[15, 49].map((cx) => (
        <g key={cx} className="car-wheel">
          <circle cx={cx} cy="19" r="4.3" fill="#121212" />
          <circle cx={cx} cy="19" r="2.2" fill="#d6d3cc" />
          <path d={`M${cx} 16.8v4.4M${cx - 2.2} 19h4.4`} stroke="#121212" strokeWidth=".7" />
        </g>
      ))}
    </svg>
  );
}

// Loading placeholder for a picture box: dashed road with a car driving across. `delay` (seconds)
// staggers several boxes so the cars don't move in lockstep.
export function RoadLoader({ delay = 0 }: { delay?: number }) {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-[#ecebe6]">
      <span className="road-dash absolute inset-x-0 bottom-[30%] h-0.5" />
      <span className="car-drive absolute bottom-[calc(30%+1px)] w-13 text-[#8d897f]" style={{ animationDelay: `${delay}s` }}>
        <MiniCar className="block w-full" />
      </span>
    </div>
  );
}
