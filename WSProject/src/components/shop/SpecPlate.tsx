import { SteeringWheelIcon } from "@/components/ui/Logo";

// Stand-in for a product without photos: a dark plate with the model code, so a sparse catalogue
// still looks intentional. The wheel turns when the surrounding `group/card` is hovered.
export function SpecPlate({ code, brand, size = "md" }: { code: string; brand: string; size?: "md" | "lg" }) {
  return (
    <div className="spec-plate absolute inset-0 flex flex-col justify-end gap-2 p-4 text-white sm:p-5">
      <SteeringWheelIcon
        size={size === "lg" ? 120 : 84}
        className="absolute top-1/2 right-4 -translate-y-1/2 opacity-15 transition-[rotate,opacity] duration-1200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:-rotate-120 group-hover/card:opacity-35 sm:right-6"
      />
      <span className="relative text-[10px] tracking-[0.3em] text-white/60">{brand.toUpperCase()} · 1:64</span>
      <span
        className={`relative leading-none font-extralight tracking-wide tabular-nums ${size === "lg" ? "text-4xl" : "text-2xl sm:text-[32px]"}`}
      >
        {code.replace(/^MGT-?/i, "")}
      </span>
    </div>
  );
}
