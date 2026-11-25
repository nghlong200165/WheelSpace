"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import { saveAddressAction } from "@/server/actions/account";
import { INITIAL_FORM_STATE } from "@/lib/form-state";
import type { AddressInput } from "@/lib/schemas/user";
import { FormMessage, TextField, buttonPrimary } from "@/components/ui/fields";

export function AddressForm({ address, defaultName }: { address: AddressInput | null; defaultName: string }) {
  const [state, formAction, pending] = useActionState(saveAddressAction, INITIAL_FORM_STATE);
  const errors = state.fieldErrors ?? {};

  // Submit through a transition so React does not reset the form when validation fails.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <TextField label="Họ và tên" name="name" autoComplete="name" defaultValue={address?.name ?? defaultName} error={errors.name} />
        <TextField label="Số điện thoại" name="phone" type="tel" autoComplete="tel" defaultValue={address?.phone} error={errors.phone} />
        <TextField label="Tỉnh / Thành phố" name="province" defaultValue={address?.province} error={errors.province} />
        <TextField label="Phường / Xã" name="ward" defaultValue={address?.ward} error={errors.ward} />
      </div>
      <TextField
        label="Địa chỉ chi tiết"
        name="address"
        autoComplete="street-address"
        placeholder="Số nhà, tên đường"
        defaultValue={address?.address}
        error={errors.address}
      />
      <FormMessage ok={state.ok} message={state.message} />
      <button type="submit" disabled={pending} className={`${buttonPrimary} self-start`}>
        {pending ? "Đang lưu…" : "Lưu địa chỉ"}
      </button>
    </form>
  );
}
