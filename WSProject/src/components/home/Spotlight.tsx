"use client";

// Dark section with a soft red light that follows the pointer.
export function Spotlight({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
      }}
      className={`relative overflow-hidden before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(520px_circle_at_var(--x,70%)_var(--y,30%),rgba(179,18,30,0.22),transparent_60%)] ${className}`}
    >
      {children}
    </section>
  );
}

// Card that tilts slightly toward the pointer.
export function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const r = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        e.currentTarget.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-4px)`;
      }}
      onPointerLeave={(e) => {
        e.currentTarget.style.transform = "";
      }}
      className={`transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] ${className}`}
    >
      {children}
    </div>
  );
}
