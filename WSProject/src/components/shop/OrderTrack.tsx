import { MiniCar } from "@/components/motion/MiniCar";
import { formatOrderTime } from "@/lib/format";
import { ORDER_STATUS_LABELS, type OrderLookupDTO, type OrderStatus } from "@/lib/schemas/order";

const STEPS: OrderStatus[] = ["pending", "confirmed", "shipping", "completed"];

// Order progress as a race track: the 1:64 car drives from the start to the current status, the
// stretch behind it turns red. A cancelled order stops the car where it was and greys the track.
export function OrderTrack({ order }: { order: OrderLookupDTO }) {
  const cancelled = order.status === "cancelled";
  const reachedAt = new Map<OrderStatus, string>(order.statusHistory.map((h) => [h.status, h.at]));
  if (!reachedAt.has("pending")) reachedAt.set("pending", order.createdAt);

  // Where the car stops: the current step, or for a cancelled order the last step it reached.
  const current = cancelled
    ? Math.max(0, ...STEPS.map((s, i) => (reachedAt.has(s) ? i : 0)))
    : STEPS.indexOf(order.status);
  const percent = (current / (STEPS.length - 1)) * 100;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative mx-4 h-16 sm:mx-10">
        {/* Road */}
        <span className="absolute inset-x-0 bottom-3 h-0.5 bg-[repeating-linear-gradient(90deg,#cfcbc2_0_10px,transparent_10px_18px)]" />
        <span
          className={`track-fill absolute bottom-3 left-0 h-0.5 ${cancelled ? "bg-muted" : "bg-accent"}`}
          style={{ width: `${percent}%` }}
        />
        {STEPS.map((step, i) => (
          <span
            key={step}
            className={`absolute bottom-3 size-3 translate-x-[-50%] translate-y-[calc(50%-1px)] rounded-full border-2 ${
              i <= current ? (cancelled ? "border-muted bg-muted" : "border-accent bg-accent") : "border-line bg-ground"
            }`}
            style={{ left: `${(i / (STEPS.length - 1)) * 100}%` }}
          />
        ))}
        {/* The car: drives in on mount, wheels spin only while it moves. */}
        <span
          className={`track-car absolute bottom-[15px] w-14 -translate-x-1/2 ${cancelled ? "text-muted" : "text-ink"}`}
          style={{ left: `${percent}%` }}
        >
          <MiniCar className="block w-full" />
        </span>
      </div>

      <ol className="grid grid-cols-4 gap-2 text-center">
        {STEPS.map((step, i) => {
          const at = reachedAt.get(step);
          const done = i <= current;
          return (
            <li key={step} className="flex flex-col gap-1">
              <span
                className={`text-[11px] tracking-[0.08em] sm:text-xs ${
                  i === current && !cancelled ? "font-medium text-accent" : done ? "text-ink" : "text-muted"
                }`}
              >
                {ORDER_STATUS_LABELS[step]}
              </span>
              <span className="text-[11px] text-muted tabular-nums">{done && at ? formatOrderTime(at) : "—"}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
