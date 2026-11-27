"use client";

import Image from "next/image";
import { startTransition, useActionState, useEffect, useRef, type FormEvent } from "react";
import { lookupOrderAction, type OrderLookupState } from "@/server/actions/orders";
import { FormMessage, TextField } from "@/components/ui/fields";
import { formatOrderTime, formatVnd } from "@/lib/format";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  type OrderLookupDTO,
} from "@/lib/schemas/order";
import { ArrowRightIcon, ChatIcon } from "./icons";
import { OrderTrack } from "./OrderTrack";

const INITIAL: OrderLookupState = {};

// Order code + phone form; the result renders below it. The phone never goes into the URL.
export function OrderLookup({ messengerUrl }: { messengerUrl: string }) {
  const [state, formAction, pending] = useActionState(lookupOrderAction, INITIAL);
  const errors = state.fieldErrors ?? {};
  const result = useRef<HTMLDivElement>(null);

  // Submit through a transition so React does not reset the form when validation fails.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  useEffect(() => {
    if (state.order) result.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [state.order]);

  return (
    <div className="flex flex-col gap-16">
      <form onSubmit={handleSubmit} className="flex max-w-3xl flex-col gap-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <TextField label="Mã đơn hàng" name="code" placeholder="VD: WS-DEMO-01" autoComplete="off" error={errors.code} />
          <TextField label="Số điện thoại đặt hàng" name="phone" type="tel" autoComplete="tel" error={errors.phone} />
          <button
            type="submit"
            disabled={pending}
            className="btn-sweep inline-flex min-h-12 cursor-pointer items-center justify-center gap-2.5 bg-ink px-7 text-[13px] tracking-[0.12em] text-white disabled:cursor-default disabled:opacity-70"
          >
            {pending ? "ĐANG TÌM…" : "TRA CỨU"} <ArrowRightIcon size={16} />
          </button>
        </div>
        {!state.ok && <FormMessage message={state.message} />}
      </form>

      {state.order && (
        <div ref={result} className="scroll-mt-28">
          <OrderResult key={state.order.code} order={state.order} messengerUrl={messengerUrl} />
        </div>
      )}
    </div>
  );
}

function OrderResult({ order, messengerUrl }: { order: OrderLookupDTO; messengerUrl: string }) {
  const cancelled = order.status === "cancelled";
  return (
    <section aria-label={`Đơn hàng ${order.code}`} className="flex flex-col gap-12 border-t border-line pt-12">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-xs tracking-[0.2em] text-muted">ĐƠN HÀNG</span>
          <h2 className="text-[clamp(30px,4vw,44px)] leading-none font-extralight tracking-tight">{order.code}</h2>
          <span className="text-[13px] text-muted tabular-nums">Đặt lúc {formatOrderTime(order.createdAt, true)}</span>
        </div>
        <span
          className={`px-3 py-1.5 text-[11px] tracking-eyebrow ${
            cancelled ? "bg-placeholder text-muted" : order.status === "completed" ? "bg-success text-white" : "bg-ink text-white"
          }`}
        >
          {ORDER_STATUS_LABELS[order.status].toUpperCase()}
        </span>
      </div>

      {cancelled ? (
        <p className="border-l-2 border-muted pl-4 text-sm leading-relaxed text-muted">
          Đơn hàng này đã bị hủy. Nếu bạn chưa yêu cầu hủy hoặc cần đặt lại, hãy nhắn tin cho chúng tôi.
        </p>
      ) : null}
      <OrderTrack order={order} />

      <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
        <ul className="flex flex-col border-t border-line">
          {order.items.map((item) => (
            <li key={item.code} className="flex items-center gap-4 border-b border-line py-5 sm:gap-6">
              <div className="relative aspect-4/3 w-20 shrink-0 overflow-hidden bg-placeholder sm:w-28">
                {item.image && <Image src={item.image} alt="" fill sizes="112px" className="object-cover" />}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-[11px] tracking-[0.14em] text-muted">{item.code}</span>
                <span className="text-[15px] leading-snug">{item.name}</span>
                <span className="text-[13px] text-muted tabular-nums">
                  {formatVnd(item.price)} × {item.quantity}
                </span>
              </div>
              <span className="shrink-0 text-[15px] tabular-nums">{formatVnd(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-8">
          <dl className="flex flex-col gap-3 border border-line bg-surface p-6 text-sm">
            <Row label="Tạm tính" value={formatVnd(order.subtotal)} />
            <Row label="Phí vận chuyển" value={order.shippingFee === 0 ? "Miễn phí" : formatVnd(order.shippingFee)} />
            <div className="flex justify-between gap-4 border-t border-line pt-4 text-base">
              <dt>Tổng cộng</dt>
              <dd className="text-xl tabular-nums">{formatVnd(order.total)}</dd>
            </div>
            <Row label="Thanh toán" value={PAYMENT_METHOD_LABELS[order.paymentMethod]} />
            <Row label="Trạng thái" value={PAYMENT_STATUS_LABELS[order.paymentStatus]} />
          </dl>
          <dl className="flex flex-col gap-3 text-sm">
            <span className="text-xs font-medium tracking-eyebrow">NGƯỜI NHẬN</span>
            <Row label="Họ tên" value={order.recipient.name} />
            <Row label="Điện thoại" value={order.recipient.phone} />
            <Row label="Khu vực" value={order.recipient.area} />
          </dl>
          {messengerUrl && (
            <a
              href={messengerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 self-start text-[13px] tracking-[0.08em] underline-offset-4 hover:underline"
            >
              <ChatIcon /> Cần hỗ trợ về đơn này? Nhắn tin cho chúng tôi
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right tabular-nums">{value}</dd>
    </div>
  );
}
