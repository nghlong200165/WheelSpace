"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import { saveSettingsAction } from "@/server/actions/settings";
import { INITIAL_FORM_STATE } from "@/lib/form-state";
import type { SettingsDTO } from "@/lib/schemas/settings";
import { CheckboxField, FormMessage, Panel, TextField, buttonPrimary } from "./fields";

export function SettingsForm({ settings, payosLive }: { settings: SettingsDTO; payosLive: boolean }) {
  const [state, formAction, pending] = useActionState(saveSettingsAction, INITIAL_FORM_STATE);
  const errors = state.fieldErrors ?? {};

  // Submit through a transition so React does not reset the form when validation fails.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-[28px] font-normal">Cài đặt cửa hàng</h1>
        <button type="submit" disabled={pending} className={buttonPrimary}>
          {pending ? "Đang lưu…" : "Lưu cài đặt"}
        </button>
      </div>

      <FormMessage ok={state.ok} message={state.message} />

      <Panel title="VẬN CHUYỂN">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
          <TextField
            label="Phí ship đồng giá (₫) *"
            name="shippingFee"
            inputMode="numeric"
            defaultValue={settings.shippingFee}
            error={errors.shippingFee}
          />
          <TextField
            label="Miễn phí ship cho đơn từ (₫)"
            name="freeShippingThreshold"
            inputMode="numeric"
            defaultValue={settings.freeShippingThreshold ?? ""}
            placeholder="Để trống nếu không áp dụng"
            error={errors.freeShippingThreshold}
          />
        </div>
      </Panel>

      <Panel title="LIÊN HỆ & MESSENGER">
        <TextField
          label="Link Messenger / Facebook page"
          name="messengerUrl"
          type="url"
          defaultValue={settings.messengerUrl}
          placeholder="https://m.me/ten-page"
          hint='Dùng cho nút chat nổi và nút "Nhắn tin để order".'
          error={errors.messengerUrl}
        />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
          <TextField label="Số điện thoại" name="contactPhone" type="tel" defaultValue={settings.contactPhone} error={errors.contactPhone} />
          <TextField label="Email" name="contactEmail" type="email" defaultValue={settings.contactEmail} error={errors.contactEmail} />
        </div>
      </Panel>

      <Panel title="THANH TOÁN">
        <div className="flex flex-col gap-1 border-b border-line-soft pb-4">
          <CheckboxField label="COD: thanh toán khi nhận hàng" name="codEnabled" defaultChecked={settings.codEnabled} />
        </div>
        <div className="flex flex-col gap-1">
          <CheckboxField label="payOS: chuyển khoản qua mã QR" name="payosEnabled" defaultChecked={settings.payosEnabled} />
          <span className={`text-xs ${payosLive ? "text-success" : "text-warning"}`}>
            {payosLive
              ? "● Đang dùng payOS thật."
              : "● Đang ở chế độ giả lập (PAYMENT_PROVIDER=mock). Khóa API cấu hình trong biến môi trường, không nhập ở đây."}
          </span>
        </div>
      </Panel>
    </form>
  );
}
